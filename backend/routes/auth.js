const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { isMailerConfigured, sendMail } = require('../utils/mailer');
const { buildPasswordResetOtpTemplate, buildWelcomeEmailTemplate } = require('../utils/email-templates');

const configuredGoogleClientIds = String(process.env.GOOGLE_CLIENT_ID || '')
  .split(',')
  .map((id) => id.trim())
  .filter((id) => hasValidGoogleClientId(id));
const GOOGLE_CLIENT_ID = configuredGoogleClientIds[0] || '';
const googleClient = configuredGoogleClientIds.length ? new OAuth2Client() : null;
const isProduction = String(process.env.NODE_ENV || '').trim() === 'production';
const trustedGoogleIssuers = new Set(['accounts.google.com', 'https://accounts.google.com']);

function decodeGoogleJwtPayload(idToken) {
  const tokenParts = String(idToken || '').split('.');
  if (tokenParts.length < 2) throw new Error('Malformed Google credential token');
  const payloadJson = Buffer.from(tokenParts[1], 'base64url').toString('utf8');
  return JSON.parse(payloadJson);
}

async function verifyGoogleTicket(credential) {
  // Local development mode: decode payload directly to avoid GSI verify edge-cases.
  if (!isProduction) {
    const decodedPayload = decodeGoogleJwtPayload(credential);
    const issuer = String(decodedPayload?.iss || '').trim();
    const subject = String(decodedPayload?.sub || '').trim();
    const email = String(decodedPayload?.email || '').trim();
    const expiresAt = Number(decodedPayload?.exp || 0);
    const isExpired = !Number.isFinite(expiresAt) || expiresAt * 1000 <= Date.now();

    if (!trustedGoogleIssuers.has(issuer) || !subject || !email || isExpired) {
      throw new Error('Invalid Google token payload for local verification');
    }

    const fallbackAudience = String(decodedPayload?.aud || '').trim();
    if (fallbackAudience && !configuredGoogleClientIds.includes(fallbackAudience)) {
      console.warn(
        `[Auth] Development payload audience differs from configured IDs: ${maskGoogleClientId(
          fallbackAudience
        )}`
      );
    }

    console.warn('[Auth] Development fallback accepted Google token using payload decode.');
    return {
      getPayload: () => decodedPayload,
    };
  }

  if (!googleClient) {
    throw new Error('Google OAuth client is not initialized');
  }

  return googleClient.verifyIdToken({
    idToken: credential,
    audience: configuredGoogleClientIds,
  });
}

function hasValidGoogleClientId(clientId) {
  const normalized = String(clientId || '').trim();
  if (!normalized) return false;
  if (normalized === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') return false;
  return normalized.endsWith('.apps.googleusercontent.com');
}

function maskGoogleClientId(clientId) {
  const normalized = String(clientId || '').trim();
  if (!normalized) return '(empty)';
  if (normalized.length <= 12) return '***';
  return `${normalized.slice(0, 6)}...${normalized.slice(-6)}`;
}

if (!hasValidGoogleClientId(GOOGLE_CLIENT_ID)) {
  console.warn(
    `[Auth] Google sign-in is disabled: set a valid GOOGLE_CLIENT_ID in backend/.env to enable it. Current value (masked): ${maskGoogleClientId(
      GOOGLE_CLIENT_ID
    )}`
  );
}

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// GET /api/auth/google-config
router.get('/google-config', (_req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: 'Google login is not configured on server' });
  }
  // DEV: allow the client id to be fetched from any local dev origin to simplify setup
  if (process.env.NODE_ENV !== 'production') {
    try {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } catch (e) {
      /* ignore */
    }
  }
  res.json({ clientId: GOOGLE_CLIENT_ID });
});

// POST /api/auth/register  (users only)
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
      .withMessage('Password must contain at least one letter and one number'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, phone, password } = req.body;

      const existing = await User.findOne({ $or: [{ email }, { phone }] });
      if (existing) return res.status(400).json({ message: 'Email or phone already registered' });

      const user = await User.create({ name, email, phone, password, role: 'user' });
      const token = generateToken(user);

      if (isMailerConfigured()) {
        const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
        sendMail({
          to: email,
          subject: 'Welcome to FruitMart',
          replyTo: supportEmail,
          text: [
            `Hi ${name},`,
            '',
            'Welcome to FruitMart. Your account has been created successfully.',
            'You can now sign in and start shopping fresh produce.',
            '',
            `Support: ${supportEmail}`,
            '',
            'Regards,',
            'FruitMart Team',
          ].join('\n'),
          html: buildWelcomeEmailTemplate({
            customerName: name,
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
            supportEmail,
          }),
        }).catch((err) => {
          console.error('Welcome email failed:', err.message);
        });
      }

      res.status(201).json({ token, user });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/login  (users)
router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Email or phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { identifier, password } = req.body;
      const normalized = String(identifier || '').trim();
      const user = await User.findOne({
        role: { $in: ['user', 'seller'] },
        $or: [{ email: normalized.toLowerCase() }, { phone: normalized }],
      });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = generateToken(user);
      res.json({ token, user });
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/google-login
router.post(
  '/google-login',
  [body('credential').trim().notEmpty().withMessage('Google credential is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!GOOGLE_CLIENT_ID || !googleClient) {
      return res.status(500).json({ message: 'Google login is not configured on server' });
    }

    try {
      const { credential } = req.body;
      const ticket = await verifyGoogleTicket(credential);
      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        return res.status(401).json({ message: 'Invalid Google token' });
      }
      if (!payload.email_verified) {
        return res.status(401).json({ message: 'Google email is not verified' });
      }

      const email = String(payload.email).toLowerCase();
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name: payload.name || 'Google User',
          email,
          // Keep phone unique while allowing account creation without manual registration.
          phone: `google-${payload.sub}`,
          profilePhoto: payload.picture || '',
          password: '',
          role: 'user',
          googleAuth: { googleId: payload.sub, picture: payload.picture || '', enabled: true },
        });
      } else {
        if (user.role === 'admin') {
          return res.status(403).json({ message: 'Admin accounts cannot use Google login' });
        }
        user.googleAuth = {
          googleId: payload.sub,
          picture: payload.picture || user.googleAuth?.picture || '',
          enabled: true,
        };
        if (!user.name && payload.name) user.name = payload.name;
        if (!user.profilePhoto && payload.picture) user.profilePhoto = payload.picture;
        await user.save();
      }

      const token = generateToken(user);
      res.json({ token, user });
    } catch (err) {
      const reason = err?.message || 'unknown error';
      console.warn(`[Auth] Google token verification failed: ${reason}`);
      if (!isProduction && err?.stack) {
        console.warn(err.stack);
      }
      res.status(401).json({ message: 'Google sign-in failed' });
    }
  }
);

// POST /api/auth/forgot-password/request-otp
router.post(
  '/forgot-password/request-otp',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const email = String(req.body.email).trim().toLowerCase();
      const user = await User.findOne({ email, role: { $in: ['user', 'seller', 'admin'] } });
      if (!user) return res.status(404).json({ message: 'No account found with this email' });

      if (!isMailerConfigured()) {
        return res.status(500).json({ message: 'Mail service is not configured' });
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      user.passwordReset = {
        otpHash,
        otpExpiresAt,
        resetTokenHash: '',
        resetTokenExpiresAt: null,
      };
      await user.save();

      await sendMail({
        to: email,
        subject: 'FruitMart Password Reset OTP',
        text: [
          `Hi ${user.name || 'Customer'},`,
          '',
          `Your FruitMart OTP is ${otp}.`,
          'It is valid for 10 minutes.',
          '',
          'If you did not request this, please ignore this email.',
          '',
          'Regards,',
          'FruitMart Team',
        ].join('\n'),
        html: buildPasswordResetOtpTemplate({
          customerName: user.name,
          otp,
          frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
          supportEmail: process.env.SUPPORT_EMAIL || process.env.SMTP_USER,
        }),
      });

      res.json({ message: 'OTP sent to your email' });
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/forgot-password/verify-otp
router.post(
  '/forgot-password/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const email = String(req.body.email).trim().toLowerCase();
      const otp = String(req.body.otp).trim();
      const user = await User.findOne({ email, role: { $in: ['user', 'seller', 'admin'] } });
      if (!user) return res.status(404).json({ message: 'No account found with this email' });

      const reset = user.passwordReset || {};
      const isExpired = !reset.otpExpiresAt || new Date(reset.otpExpiresAt).getTime() < Date.now();
      const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
      if (!reset.otpHash || isExpired || reset.otpHash !== otpHash) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      const resetToken = crypto.randomBytes(24).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      user.passwordReset = {
        otpHash: '',
        otpExpiresAt: null,
        resetTokenHash,
        resetTokenExpiresAt,
      };
      await user.save();

      res.json({ message: 'OTP verified', resetToken });
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/forgot-password/reset
router.post(
  '/forgot-password/reset',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('resetToken').trim().notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)
      .withMessage('Password must contain at least one letter and one number'),
    body('confirmPassword').custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const email = String(req.body.email).trim().toLowerCase();
      const resetToken = String(req.body.resetToken).trim();
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      const user = await User.findOne({ email, role: { $in: ['user', 'seller', 'admin'] } });
      if (!user) return res.status(404).json({ message: 'No account found with this email' });

      const reset = user.passwordReset || {};
      const isExpired = !reset.resetTokenExpiresAt || new Date(reset.resetTokenExpiresAt).getTime() < Date.now();
      if (!reset.resetTokenHash || isExpired || reset.resetTokenHash !== tokenHash) {
        return res.status(400).json({ message: 'Reset session expired. Please request OTP again.' });
      }

      user.password = req.body.password;
      user.passwordReset = {
        otpHash: '',
        otpExpiresAt: null,
        resetTokenHash: '',
        resetTokenExpiresAt: null,
      };
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/admin-login
router.post(
  '/admin-login',
  [
    body('identifier').trim().notEmpty().withMessage('Email or phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { identifier, password } = req.body;
      const user = await User.findOne({
        role: 'admin',
        $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
      });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = generateToken(user);
      res.json({ token, user });
    } catch {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
