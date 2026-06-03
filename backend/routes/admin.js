const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { auth, adminOnly } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const EmailLog = require('../models/EmailLog');
const { isMailerConfigured, getMailerConfigError, sendMail } = require('../utils/mailer');
const { buildAdminCustomerEmailTemplate } = require('../utils/email-templates');

router.use(auth, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  try {
    const [userCount, sellerCount, productCount, orderCount, orders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'seller' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);
    res.json({
      userCount,
      sellerCount,
      productCount,
      orderCount,
      totalRevenue: orders[0]?.total || 0,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', async (_req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/sellers
router.get('/sellers', async (_req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).select('-password').sort({ 'sellerProfile.reviewedAt': -1, createdAt: -1 });
    res.json(sellers);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/products
router.post(
  '/products',
  [
    body('name').trim().notEmpty(),
    body('type').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('image').trim().notEmpty(),
    body('description').trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/orders
router.get('/orders', async (_req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/users/:id/send-email
router.post(
  '/users/:id/send-email',
  [
    body('subject').trim().isLength({ min: 3, max: 120 }).withMessage('Subject is required'),
    body('message').trim().isLength({ min: 5, max: 3000 }).withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!isMailerConfigured()) {
      return res.status(503).json({
        message: getMailerConfigError() || 'Mail service is not configured',
      });
    }

    try {
      const user = await User.findOne({ _id: req.params.id, role: 'user' });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const { subject, message } = req.body;
      const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
      const textBody = `Hi ${user.name},\n\n${message}\n\nRegards,\nFruitMart Team`;
      const htmlBody = buildAdminCustomerEmailTemplate({
        customerName: user.name,
        subject,
        message,
        supportEmail,
      });

      await sendMail({
        to: user.email,
        subject: `FruitMart | ${subject}`,
        replyTo: supportEmail,
        text: textBody,
        html: htmlBody,
      });

      await EmailLog.create({
        type: 'direct',
        admin: req.user._id,
        subject,
        message,
        recipients: [
          {
            user: user._id,
            name: user.name,
            email: user.email,
            status: 'sent',
            error: '',
          },
        ],
        totalRecipients: 1,
        sentCount: 1,
        failedCount: 0,
      });

      res.json({ message: 'Email sent successfully' });
    } catch {
      res.status(500).json({ message: 'Failed to send email' });
    }
  }
);

// POST /api/admin/users/send-bulk-email
router.post(
  '/users/send-bulk-email',
  [
    body('userIds').isArray({ min: 1 }).withMessage('At least one user must be selected'),
    body('userIds.*').isMongoId().withMessage('Invalid user id in list'),
    body('subject').trim().isLength({ min: 3, max: 120 }).withMessage('Subject is required'),
    body('message').trim().isLength({ min: 5, max: 3000 }).withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!isMailerConfigured()) {
      return res.status(503).json({
        message: getMailerConfigError() || 'Mail service is not configured',
      });
    }

    try {
      const { userIds, subject, message } = req.body;
      const uniqueIds = [...new Set(userIds)];
      const users = await User.find({ _id: { $in: uniqueIds }, role: 'user' }).select('name email');

      if (!users.length) {
        return res.status(404).json({ message: 'No valid users found for campaign' });
      }

      const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
      const recipients = [];

      await Promise.all(
        users.map(async (user) => {
          const textBody = `Hi ${user.name},\n\n${message}\n\nRegards,\nFruitMart Team`;
          const htmlBody = buildAdminCustomerEmailTemplate({
            customerName: user.name,
            subject,
            message,
            supportEmail,
          });

          try {
            await sendMail({
              to: user.email,
              subject: `FruitMart | ${subject}`,
              replyTo: supportEmail,
              text: textBody,
              html: htmlBody,
            });

            recipients.push({
              user: user._id,
              name: user.name,
              email: user.email,
              status: 'sent',
              error: '',
            });
          } catch (error) {
            recipients.push({
              user: user._id,
              name: user.name,
              email: user.email,
              status: 'failed',
              error: error?.message || 'Failed to send',
            });
          }
        })
      );

      const sentCount = recipients.filter((r) => r.status === 'sent').length;
      const failedCount = recipients.length - sentCount;

      await EmailLog.create({
        type: 'campaign',
        admin: req.user._id,
        subject,
        message,
        recipients,
        totalRecipients: recipients.length,
        sentCount,
        failedCount,
      });

      res.json({
        message: `Campaign finished: ${sentCount} sent, ${failedCount} failed`,
        sentCount,
        failedCount,
      });
    } catch {
      res.status(500).json({ message: 'Failed to run bulk campaign' });
    }
  }
);

// GET /api/admin/email-logs
router.get('/email-logs', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const logs = await EmailLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(logs);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/seller-applications
router.get('/seller-applications', async (req, res) => {
  try {
    const status = req.query.status;
    const query = { 'sellerProfile.appliedAt': { $exists: true } };
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query['sellerProfile.sellerStatus'] = status;
    }
    const applicants = await User.find(query)
      .select('-password')
      .sort({ 'sellerProfile.appliedAt': -1 });
    res.json(applicants);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/seller-applications/:id/approve
router.put('/seller-applications/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.sellerProfile) return res.status(404).json({ message: 'Application not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot change admin role' });

    user.role = 'seller';
    user.sellerProfile.sellerStatus = 'approved';
    user.sellerProfile.reviewedAt = new Date();
    await user.save();

    let mailStatus = 'not-configured';
    let mailError = '';

    if (isMailerConfigured()) {
      const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
      const subject = 'Seller Application Approved';
      const message = `Congratulations! Your seller application is approved. You can now access Seller Hub from your account and start listing products.`;

      const textBody = `Hi ${user.name},\n\n${message}\n\nYou can now access both dashboards:\n- Buyer Dashboard\n- Seller Hub\n\nRegards,\nFruitMart Team`;
      const htmlBody = buildAdminCustomerEmailTemplate({
        customerName: user.name,
        subject,
        message,
        supportEmail,
      });

      try {
        await sendMail({
          to: user.email,
          subject: `FruitMart | ${subject}`,
          replyTo: supportEmail,
          text: textBody,
          html: htmlBody,
        });

        mailStatus = 'sent';
      } catch (error) {
        mailStatus = 'failed';
        mailError = error?.message || 'Failed to send approval email';
      }
    }

    res.json({
      message: 'Seller approved successfully',
      mailStatus,
      ...(mailError ? { mailError } : {}),
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/seller-applications/:id/reject
router.put('/seller-applications/:id/reject', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.sellerProfile) return res.status(404).json({ message: 'Application not found' });

    const rejectionReason = (req.body.reason || '').trim().slice(0, 300);

    user.role = 'user';
    user.sellerProfile.sellerStatus = 'rejected';
    user.sellerProfile.reviewedAt = new Date();
    user.sellerProfile.rejectionReason = rejectionReason;
    await user.save();

    let mailStatus = 'not-configured';
    let mailError = '';

    if (isMailerConfigured()) {
      const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
      const subject = 'Seller Application Update';
      const message = rejectionReason
        ? `Your seller application is currently rejected. Reason: ${rejectionReason}. Please update your details and apply again.`
        : 'Your seller application is currently rejected. Please review your shop details and apply again.';

      const textBody = `Hi ${user.name},\n\n${message}\n\nIf you need help, contact ${supportEmail}.\n\nRegards,\nFruitMart Team`;
      const htmlBody = buildAdminCustomerEmailTemplate({
        customerName: user.name,
        subject,
        message,
        supportEmail,
      });

      try {
        await sendMail({
          to: user.email,
          subject: `FruitMart | ${subject}`,
          replyTo: supportEmail,
          text: textBody,
          html: htmlBody,
        });

        mailStatus = 'sent';
      } catch (error) {
        mailStatus = 'failed';
        mailError = error?.message || 'Failed to send rejection email';
      }
    }

    res.json({
      message: 'Application rejected',
      mailStatus,
      ...(mailError ? { mailError } : {}),
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
