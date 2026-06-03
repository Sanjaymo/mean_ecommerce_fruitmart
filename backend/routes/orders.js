const router = require('express').Router();
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const { isMailerConfigured, sendMail } = require('../utils/mailer');
const { buildOrderConfirmationTemplate } = require('../utils/email-templates');

router.use(auth);

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, deliveryLocation } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const userLocation = req.user.deliveryLocation;
    const resolvedLocation = deliveryLocation || userLocation;
    if (!resolvedLocation || typeof resolvedLocation.lat !== 'number' || typeof resolvedLocation.lng !== 'number') {
      return res.status(400).json({ message: 'Please add delivery location before placing order' });
    }
    const resolvedCity = String(resolvedLocation.city || '').trim();
    const resolvedPincode = String(resolvedLocation.pincode || '').trim();
    if (!resolvedCity || !resolvedPincode) {
      return res.status(400).json({ message: 'Delivery location must include city and pincode' });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      deliveryLocation: {
        lat: resolvedLocation.lat,
        lng: resolvedLocation.lng,
        addressLine: resolvedLocation.addressLine || '',
        city: resolvedCity,
        state: resolvedLocation.state || '',
        pincode: resolvedPincode,
        country: resolvedLocation.country || '',
        formattedAddress: resolvedLocation.formattedAddress || '',
      },
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Email will be sent after payment confirmation
    res.status(201).json(order);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
