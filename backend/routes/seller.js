const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { auth, sellerOnly } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// POST /api/seller/apply — any logged-in non-seller user can apply
router.post(
  '/apply',
  auth,
  [
    body('shopName').trim().notEmpty().withMessage('Shop name is required').isLength({ max: 80 }),
    body('shopLocation').trim().notEmpty().withMessage('Shop location is required').isLength({ max: 120 }),
    body('contributionPercent')
      .isFloat({ min: 1, max: 50 })
      .withMessage('Contribution must be between 1% and 50%'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (user.role === 'admin') return res.status(400).json({ message: 'Admins cannot apply as sellers' });
      if (user.role === 'seller') return res.status(400).json({ message: 'You are already an approved seller' });
      if (user.sellerProfile?.appliedAt && user.sellerProfile?.sellerStatus === 'pending') {
        return res.status(400).json({ message: 'Your application is already under review' });
      }

      const { shopName, shopLocation, shopPhoto, userPhoto, contributionPercent } = req.body;

      user.sellerProfile = {
        shopName: shopName.trim(),
        shopLocation: shopLocation.trim(),
        shopPhoto: shopPhoto || '',
        userPhoto: userPhoto || '',
        contributionPercent: Number(contributionPercent),
        sellerStatus: 'pending',
        appliedAt: new Date(),
        reviewedAt: undefined,
        rejectionReason: '',
      };

      await user.save();
      res.json({
        message: 'Application submitted successfully. We will review it within 24 hours.',
        user: user.toJSON(),
      });
    } catch (error) {
      res.status(500).json({ message: error?.message || 'Server error' });
    }
  }
);

// GET /api/seller/dashboard
router.get('/dashboard', auth, sellerOnly, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const products = await Product.find({ sellerId });
    const productIds = products.map(p => p._id);

    const orders = await Order.find({ 'items.product': { $in: productIds } }).sort({ createdAt: -1 });

    const contributionPercent = req.user.sellerProfile?.contributionPercent || 10;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    let totalRevenue = 0;
    let adminFee = 0;
    let thisMonthRevenue = 0;

    for (const order of orders) {
      const isThisMonth = new Date(order.createdAt) >= monthStart;
      for (const item of order.items) {
        if (productMap.has(item.product.toString())) {
          const itemRevenue = item.price * item.quantity;
          totalRevenue += itemRevenue;
          adminFee += (contributionPercent / 100) * itemRevenue;
          if (isThisMonth) thisMonthRevenue += itemRevenue;
        }
      }
    }

    res.json({
      productCount: products.length,
      orderCount: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      adminFee: Math.round(adminFee * 100) / 100,
      sellerEarnings: Math.round((totalRevenue - adminFee) * 100) / 100,
      thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
      contributionPercent,
      shopName: req.user.sellerProfile?.shopName || '',
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/seller/products
router.get('/products', auth, sellerOnly, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/seller/products
router.post(
  '/products',
  auth,
  sellerOnly,
  [
    body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 100 }),
    body('type').trim().notEmpty().withMessage('Product type is required').isLength({ max: 50 }),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('image').trim().notEmpty().withMessage('Product image URL is required'),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 1000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, type, price, image, description } = req.body;
      const contributionPercent = req.user.sellerProfile?.contributionPercent || 10;

      const product = await Product.create({
        name: name.trim(),
        type: type.trim(),
        price,
        image,
        description: description.trim(),
        sellerId: req.user._id,
        sellerContribution: contributionPercent,
        sellerName: req.user.sellerProfile?.shopName || req.user.name,
      });

      res.status(201).json(product);
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/seller/products/:id
router.put('/products/:id', auth, sellerOnly, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found or not owned by you' });

    const { name, type, price, image, description } = req.body;
    if (name !== undefined) product.name = name.trim();
    if (type !== undefined) product.type = type.trim();
    if (price !== undefined) product.price = Number(price);
    if (image !== undefined) product.image = image;
    if (description !== undefined) product.description = description.trim();

    await product.save();
    res.json(product);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/seller/products/:id
router.delete('/products/:id', auth, sellerOnly, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found or not owned by you' });
    res.json({ message: 'Product deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/seller/orders — orders that contain this seller's products
router.get('/orders', auth, sellerOnly, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id }).select('_id');
    const productIds = products.map(p => p._id);

    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    const result = orders.map(order => {
      const obj = order.toObject();
      const sellerItems = obj.items.filter(item =>
        productIds.some(pid => pid.toString() === item.product.toString())
      );
      const sellerTotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { ...obj, items: sellerItems, sellerTotal: Math.round(sellerTotal * 100) / 100 };
    });

    res.json(result);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
