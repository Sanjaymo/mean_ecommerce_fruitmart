const router = require('express').Router();
const Product = require('../models/Product');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { search, type } = req.query;
    const filter = {};
    if (type && type !== 'All') filter.type = type;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { type: regex }];
    }
    const products = await Product.find(filter).sort({ name: 1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/types
router.get('/types', async (_req, res) => {
  try {
    const types = await Product.distinct('type');
    res.json(['All', ...types.sort()]);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
