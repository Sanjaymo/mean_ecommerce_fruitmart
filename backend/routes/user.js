const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');

router.use(auth);

const MAX_PROFILE_PHOTO_BYTES = 1024 * 1024; // 1MB

function getBase64SizeBytes(base64Value) {
  const normalized = String(base64Value || '').trim();
  if (!normalized.includes(',')) return 0;
  const base64 = normalized.split(',')[1] || '';
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

// GET /api/user/profile
router.get('/profile', (req, res) => {
  res.json(req.user);
});

// PUT /api/user/profile
router.put(
  '/profile',
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim().notEmpty(),
    body('profilePhoto').optional().isString().trim(),
    body('deliveryLocation').optional({ nullable: true }).isObject(),
    body('deliveryLocation.lat').optional().isFloat({ min: -90, max: 90 }),
    body('deliveryLocation.lng').optional().isFloat({ min: -180, max: 180 }),
    body('deliveryLocation.addressLine').optional().trim(),
    body('deliveryLocation.city').optional().trim(),
    body('deliveryLocation.state').optional().trim(),
    body('deliveryLocation.pincode').optional().trim(),
    body('deliveryLocation.country').optional().trim(),
    body('deliveryLocation.formattedAddress').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, phone, profilePhoto, deliveryLocation } = req.body;
      const user = req.user;

      if (email && email !== user.email) {
        const existingEmail = await req.user.constructor.findOne({
          email,
          _id: { $ne: user._id },
        });
        if (existingEmail) {
          return res.status(400).json({ message: 'This email already exists. Please use another one.' });
        }
      }

      if (phone && phone !== user.phone) {
        const existingPhone = await req.user.constructor.findOne({
          phone,
          _id: { $ne: user._id },
        });
        if (existingPhone) {
          return res.status(400).json({ message: 'This phone number already exists. Please use another one.' });
        }
      }

      if (typeof profilePhoto === 'string' && profilePhoto.startsWith('data:image/')) {
        const photoSize = getBase64SizeBytes(profilePhoto);
        if (photoSize > MAX_PROFILE_PHOTO_BYTES) {
          return res.status(400).json({ message: 'Profile photo must be 1MB or smaller.' });
        }
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (typeof profilePhoto === 'string') user.profilePhoto = profilePhoto.trim();
      if (deliveryLocation === null) {
        user.deliveryLocation = undefined;
      } else if (deliveryLocation) {
        const city = String(deliveryLocation.city || '').trim();
        const pincode = String(deliveryLocation.pincode || '').trim();
        if (!city || !pincode) {
          return res.status(400).json({ message: 'City and pincode are required for delivery location' });
        }
        if (!/^[0-9A-Za-z -]{4,10}$/.test(pincode)) {
          return res.status(400).json({ message: 'Pincode must be 4 to 10 alphanumeric characters' });
        }

        user.deliveryLocation = {
          ...deliveryLocation,
          city,
          pincode,
          updatedAt: new Date(),
        };
      }
      await user.save();
      res.json(user);
    } catch (err) {
      if (err?.code === 11000) {
        const duplicateField = Object.keys(err.keyPattern || {})[0] || 'value';
        if (duplicateField === 'email') {
          return res.status(400).json({ message: 'This email already exists. Please use another one.' });
        }
        if (duplicateField === 'phone') {
          return res.status(400).json({ message: 'This phone number already exists. Please use another one.' });
        }
        return res.status(400).json({ message: `This ${duplicateField} already exists. Please use another one.` });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/user/change-password
router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
      .withMessage('New password must contain at least one letter and one number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { currentPassword, newPassword } = req.body;
      if (!req.user.password) {
        return res.status(400).json({ message: 'No password set for this account. Use Set Password.' });
      }
      const valid = await req.user.comparePassword(currentPassword);
      if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });

      req.user.password = newPassword;
      await req.user.save();
      res.json({ message: 'Password changed successfully' });
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/user/set-password
router.put(
  '/set-password',
  [
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
      .withMessage('Password must contain at least one letter and one number'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.newPassword) throw new Error('Passwords do not match');
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      if (req.user.password) {
        return res.status(400).json({ message: 'Password already exists. Use Change Password.' });
      }

      req.user.password = req.body.newPassword;
      await req.user.save();
      res.json({ message: 'Password set successfully' });
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
