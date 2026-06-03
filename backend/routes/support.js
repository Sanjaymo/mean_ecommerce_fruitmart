const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { isMailerConfigured, getMailerConfigError, sendMail } = require('../utils/mailer');
const {
  buildContactToSupportTemplate,
  buildContactAckTemplate,
} = require('../utils/email-templates');

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;

router.post(
  '/contact',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').trim().isLength({ min: 3, max: 120 }).withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10, max: 3000 }).withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!isMailerConfigured() || !SUPPORT_EMAIL) {
      return res.status(503).json({
        message: getMailerConfigError() || 'Mail service is not configured',
      });
    }

    try {
      const { name, email, subject, message } = req.body;

      await sendMail({
        to: SUPPORT_EMAIL,
        subject: `[Contact] ${subject}`,
        replyTo: email,
        text: `New contact message from FruitMart\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
        html: buildContactToSupportTemplate({ name, email, subject, message }),
      });

      await sendMail({
        to: email,
        subject: `We received your message - FruitMart`,
        text: `Hi ${name},\n\nThanks for contacting FruitMart. We received your message and will reply shortly.\n\nSubject: ${subject}\n\nRegards,\nFruitMart Support`,
        html: buildContactAckTemplate({ name, subject, supportEmail: SUPPORT_EMAIL }),
      });

      res.json({ message: 'Message sent successfully' });
    } catch {
      res.status(500).json({ message: 'Failed to send message' });
    }
  }
);

module.exports = router;
