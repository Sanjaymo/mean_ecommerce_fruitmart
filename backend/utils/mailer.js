const nodemailer = require('nodemailer');

function getMailerConfig() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.MAIL_USER || '';
  const smtpPass =
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.MAIL_PASSWORD ||
    '';
  const mailFromName = process.env.MAIL_FROM_NAME || 'FruitMart';
  const mailFromAddress = process.env.MAIL_FROM_ADDRESS || smtpUser;

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    mailFromName,
    mailFromAddress,
  };
}

function getMissingConfigKeys() {
  const config = getMailerConfig();
  const missing = [];
  if (!config.smtpUser) missing.push('SMTP_USER');
  if (!config.smtpPass) missing.push('SMTP_PASS');
  if (!config.mailFromAddress) missing.push('MAIL_FROM_ADDRESS');
  return missing;
}

function isMailerConfigured() {
  return getMissingConfigKeys().length === 0;
}

function getMailerConfigError() {
  const missing = getMissingConfigKeys();
  if (!missing.length) return '';

  return `Mail service is not configured. Missing: ${missing.join(', ')}. For Gmail, set SMTP_USER and SMTP_PASS (App Password) in backend/.env.`;
}

function getTransporter() {
  const config = getMailerConfig();

  if (!isMailerConfigured()) {
    throw new Error(getMailerConfigError());
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

function getFromAddress() {
  const config = getMailerConfig();
  return `\"${config.mailFromName}\" <${config.mailFromAddress}>`;
}

async function sendMail({ to, subject, text, html, replyTo }) {
  const transporter = getTransporter();
  return transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
    replyTo,
  });
}

module.exports = {
  isMailerConfigured,
  getMailerConfigError,
  sendMail,
};
