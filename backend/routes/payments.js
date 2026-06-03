const router = require('express').Router();
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { isMailerConfigured, sendMail } = require('../utils/mailer');
const { buildOrderConfirmationTemplate } = require('../utils/email-templates');
const crypto = require('crypto');

router.use(auth);

// POST /api/payments/init - Initialize payment
router.post('/init', async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({ message: 'Missing orderId or paymentMethod' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already completed for this order' });
    }

    // For COD, no payment processing needed - just mark as completed
    if (paymentMethod === 'cod') {
      order.paymentMethod = paymentMethod;
      order.paymentStatus = 'completed';
      order.status = 'confirmed';
      order.transactionId = 'COD-' + Date.now();
      await order.save();

      // Create payment record
      const payment = await Payment.create({
        order: orderId,
        user: req.user._id,
        amount: order.totalAmount,
        method: paymentMethod,
        status: 'completed',
        transactionId: order.transactionId,
      });

      // Send confirmation email
      if (isMailerConfigured() && req.user?.email) {
        const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
        const shortOrderId = order._id.toString().slice(-8).toUpperCase();
        const subject = `FruitMart Order Confirmation #${shortOrderId}`;
        const itemsText = order.items
          .map((item) => `${item.name} x${item.quantity} - INR ${Number(item.price * item.quantity).toFixed(2)}`)
          .join('\n');

        const textBody = [
          `Hi ${req.user.name || 'Customer'},`,
          '',
          'Your order is confirmed. You selected Cash On Delivery.',
          `Order ID: ${order._id}`,
          '',
          'Items:',
          itemsText,
          '',
          `Total: INR ${Number(order.totalAmount).toFixed(2)}`,
          '',
          `Support: ${supportEmail}`,
          '',
          'Regards,',
          'FruitMart Team',
        ].join('\n');

        sendMail({
          to: req.user.email,
          subject,
          replyTo: supportEmail,
          text: textBody,
          html: buildOrderConfirmationTemplate({
            customerName: req.user.name,
            orderId: order._id.toString(),
            items: order.items,
            totalAmount: order.totalAmount,
            supportEmail,
            paymentMethod: order.paymentMethod,
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
          }),
        }).catch((err) => {
          console.error('Order confirmation email failed:', err.message);
        });
      }

      return res.json({
        message: 'Payment successful',
        order,
        payment,
      });
    }

    // For online payments, generate Razorpay order or mock transaction
    const transactionId = 'TXN-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      user: req.user._id,
      amount: order.totalAmount,
      method: paymentMethod,
      status: 'pending',
      transactionId,
    });

    // Update order with payment method and transaction ID
    order.paymentMethod = paymentMethod;
    order.transactionId = transactionId;
    await order.save();

    res.json({
      message: 'Payment initiated',
      transactionId,
      paymentId: payment._id,
      amount: order.totalAmount,
      paymentMethod,
    });
  } catch (err) {
    console.error('Payment init error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/payments/verify - Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { orderId, paymentId, transactionId, success } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({ message: 'Missing orderId or paymentId' });
    }

    const order = await Order.findById(orderId);
    const payment = await Payment.findById(paymentId);

    if (!order || !payment) {
      return res.status(404).json({ message: 'Order or payment not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (success === false || success === 'false') {
      // Payment failed
      payment.status = 'failed';
      payment.failureReason = 'Payment declined by user';
      await payment.save();

      order.paymentStatus = 'failed';
      await order.save();

      return res.status(400).json({
        message: 'Payment failed',
        order,
      });
    }

    // Payment successful
    payment.status = 'completed';
    await payment.save();

    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    await order.save();

    // Send confirmation email
    if (isMailerConfigured() && req.user?.email) {
      const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
      const shortOrderId = order._id.toString().slice(-8).toUpperCase();
      const subject = `FruitMart Order Confirmation #${shortOrderId}`;
      const itemsText = order.items
        .map((item) => `${item.name} x${item.quantity} - INR ${Number(item.price * item.quantity).toFixed(2)}`)
        .join('\n');

      const textBody = [
        `Hi ${req.user.name || 'Customer'},`,
        '',
        'Your order is confirmed. Payment received successfully.',
        `Order ID: ${order._id}`,
        '',
        'Items:',
        itemsText,
        '',
        `Total: INR ${Number(order.totalAmount).toFixed(2)}`,
        `Payment Method: ${payment.method.toUpperCase()}`,
        `Transaction ID: ${payment.transactionId}`,
        '',
        `Support: ${supportEmail}`,
        '',
        'Regards,',
        'FruitMart Team',
      ].join('\n');

      sendMail({
        to: req.user.email,
        subject,
        replyTo: supportEmail,
        text: textBody,
        html: buildOrderConfirmationTemplate({
          customerName: req.user.name,
          orderId: order._id.toString(),
          items: order.items,
          totalAmount: order.totalAmount,
          supportEmail,
          transactionId: payment.transactionId,
          paymentMethod: payment.method,
          frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
        }),
      }).catch((err) => {
        console.error('Order confirmation email failed:', err.message);
      });
    }

    res.json({
      message: 'Payment verified successfully',
      order,
      payment,
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/payments/:orderId - Get payment details for order
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const payment = await Payment.findOne({ order: orderId });
    res.json({ order, payment });
  } catch (err) {
    console.error('Get payment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
