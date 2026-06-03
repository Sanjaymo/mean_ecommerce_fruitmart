function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function withBrandLayout({ title, eyebrow, bodyHtml, footerNote }) {
  const year = new Date().getFullYear();

  return `
    <div style="margin:0;padding:0;background:#f3f4f6;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
              <tr>
                <td style="background:linear-gradient(120deg,#052e16,#166534,#047857);padding:20px 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="vertical-align:middle;">
                        <div style="display:inline-block;background:#ffffff;color:#166534;font-weight:800;border-radius:999px;padding:8px 14px;font-size:14px;letter-spacing:.4px;">FRUITMART</div>
                        <div style="margin-top:10px;color:#d1fae5;font-size:12px;letter-spacing:.7px;text-transform:uppercase;">${eyebrow}</div>
                        <div style="margin-top:8px;color:#ffffff;font-size:24px;font-weight:800;line-height:1.25;">${title}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:28px;line-height:1.7;font-size:15px;color:#1e293b;">
                  ${bodyHtml}
                </td>
              </tr>

              <tr>
                <td style="background:#0f172a;padding:18px 28px;color:#cbd5e1;font-size:12px;line-height:1.6;">
                  <div style="font-weight:700;color:#ffffff;margin-bottom:4px;">FruitMart Customer Operations</div>
                  <div>${footerNote}</div>
                  <div style="margin-top:8px;">Copyright ${year} FruitMart. All rights reserved.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildAdminCustomerEmailTemplate({ customerName, subject, message, supportEmail }) {
  const safeName = escapeHtml(customerName);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br/>');
  const safeSupport = escapeHtml(supportEmail || 'support@fruitmart.com');

  return withBrandLayout({
    title: safeSubject,
    eyebrow: 'Official communication',
    bodyHtml: `
      <p style="margin:0 0 14px;">Hi ${safeName},</p>
      <div style="border:1px solid #d1fae5;background:#f0fdf4;border-radius:12px;padding:16px;white-space:normal;">${safeMessage}</div>
      <p style="margin:18px 0 0;">If you need help, reply to this email or contact us at <a href="mailto:${safeSupport}" style="color:#047857;text-decoration:none;">${safeSupport}</a>.</p>
      <p style="margin:16px 0 0;">Regards,<br/><strong>FruitMart Team</strong></p>
    `,
    footerNote: 'This mailbox sends transaction and support communication from FruitMart administrators.',
  });
}

function buildContactToSupportTemplate({ name, email, subject, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br/>');

  return withBrandLayout({
    title: 'New Customer Contact Message',
    eyebrow: 'Support inbox alert',
    bodyHtml: `
      <p style="margin:0 0 10px;"><strong>From:</strong> ${safeName} (${safeEmail})</p>
      <p style="margin:0 0 14px;"><strong>Subject:</strong> ${safeSubject}</p>
      <div style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:12px;padding:16px;">${safeMessage}</div>
    `,
    footerNote: 'This email was generated from the FruitMart Contact page.',
  });
}

function buildContactAckTemplate({ name, subject, supportEmail }) {
  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(subject);
  const safeSupport = escapeHtml(supportEmail || 'support@fruitmart.com');

  return withBrandLayout({
    title: 'We received your message',
    eyebrow: 'Customer support acknowledgement',
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi ${safeName},</p>
      <p style="margin:0 0 10px;">Thanks for contacting FruitMart. Your request has been received by our support team.</p>
      <p style="margin:0 0 16px;"><strong>Subject:</strong> ${safeSubject}</p>
      <p style="margin:0;">We usually respond quickly during business hours. For urgent assistance, email <a href="mailto:${safeSupport}" style="color:#047857;text-decoration:none;">${safeSupport}</a>.</p>
    `,
    footerNote: 'This is an automated acknowledgement from FruitMart support.',
  });
}

function buildWelcomeEmailTemplate({ customerName, frontendUrl, supportEmail }) {
  const safeName = escapeHtml(customerName || 'Customer');
  const safeFrontendUrl = escapeHtml(frontendUrl || 'http://localhost:4200');
  const safeSupport = escapeHtml(supportEmail || 'support@fruitmart.com');

  return withBrandLayout({
    title: 'Welcome to FruitMart',
    eyebrow: 'Account created successfully',
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi ${safeName},</p>
      <p style="margin:0 0 14px;">Your FruitMart account is ready. You can now sign in, shop fresh produce, place orders, and track deliveries from your dashboard.</p>
      <div style="margin:0 0 14px;padding:12px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;">
        <strong>Next step:</strong> Browse the catalog and start shopping.
      </div>
      <p style="margin:0 0 14px;"><a href="${safeFrontendUrl}/login" style="display:inline-block;background:linear-gradient(120deg,#075985,#1d4ed8,#0f172a);color:#ffffff;text-decoration:none;border-radius:999px;padding:11px 18px;font-weight:700;">Sign in to FruitMart</a></p>
      <p style="margin:14px 0 0;">If you need help, contact <a href="mailto:${safeSupport}" style="color:#047857;text-decoration:none;">${safeSupport}</a>.</p>
      <p style="margin:14px 0 0;">Regards,<br/><strong>FruitMart Team</strong></p>
    `,
    footerNote: 'This is a welcome email for your new FruitMart account.',
  });
}

function buildPasswordResetOtpTemplate({ customerName, otp, frontendUrl, supportEmail }) {
  const safeName = escapeHtml(customerName || 'Customer');
  const safeOtp = escapeHtml(otp);
  const safeFrontendUrl = escapeHtml(frontendUrl || 'http://localhost:4200');
  const safeSupport = escapeHtml(supportEmail || 'support@fruitmart.com');

  return withBrandLayout({
    title: 'Your password reset code',
    eyebrow: 'Password recovery',
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi ${safeName},</p>
      <p style="margin:0 0 14px;">We received a request to reset your FruitMart password. Use the OTP below to continue:</p>
      <div style="margin:0 0 16px;text-align:center;border-radius:14px;background:#0f172a;color:#ffffff;padding:18px 20px;letter-spacing:6px;font-size:28px;font-weight:800;">${safeOtp}</div>
      <p style="margin:0 0 14px;">This code is valid for 10 minutes.</p>
      <p style="margin:0 0 14px;"><a href="${safeFrontendUrl}/reset-password" style="display:inline-block;background:linear-gradient(120deg,#075985,#1d4ed8,#0f172a);color:#ffffff;text-decoration:none;border-radius:999px;padding:11px 18px;font-weight:700;">Reset your password</a></p>
      <p style="margin:14px 0 0;">If you did not request this, you can ignore this email or contact <a href="mailto:${safeSupport}" style="color:#047857;text-decoration:none;">${safeSupport}</a>.</p>
      <p style="margin:14px 0 0;">Regards,<br/><strong>FruitMart Team</strong></p>
    `,
    footerNote: 'This code is required to finish your password reset securely.',
  });
}

function buildOrderConfirmationTemplate({ customerName, orderId, items, totalAmount, supportEmail, transactionId, paymentMethod, frontendUrl }) {
  const safeName = escapeHtml(customerName || 'Customer');
  const safeOrderId = escapeHtml(orderId);
  const safeSupport = escapeHtml(supportEmail || 'support@fruitmart.com');
  const safeTransactionId = transactionId ? escapeHtml(transactionId) : null;
  const safePaymentMethod = paymentMethod ? escapeHtml(String(paymentMethod).toUpperCase()) : '';
  const safeFrontendUrl = escapeHtml(frontendUrl || 'http://localhost:4200');
  const rows = (items || [])
    .map((item) => {
      const itemName = escapeHtml(item.name || 'Product');
      const qty = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      const lineTotal = (qty * price).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      });

      return `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;">${itemName}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:center;">${qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">${lineTotal}</td>
      </tr>`;
    })
    .join('');

  const safeTotal = Number(totalAmount || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });

  const transactionSection = safeTransactionId
    ? `<p style="margin:14px 0 0;"><strong>Transaction ID:</strong> ${safeTransactionId}</p>`
    : '';

  return withBrandLayout({
    title: 'Your order is confirmed',
    eyebrow: 'Order confirmation',
    bodyHtml: `
      <p style="margin:0 0 12px;">Hi ${safeName},</p>
      <p style="margin:0 0 14px;">Thank you for shopping with FruitMart. Your order has been officially confirmed and is being prepared.</p>
      <div style="margin:0 0 14px;padding:12px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;">
        <strong>Order ID:</strong> ${safeOrderId}
      </div>
      ${safePaymentMethod ? `<p style="margin:0 0 12px;"><strong>Payment Method:</strong> ${safePaymentMethod}</p>` : ''}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 8px;text-align:left;border-bottom:1px solid #e2e8f0;">Item</th>
            <th style="padding:10px 8px;text-align:center;border-bottom:1px solid #e2e8f0;">Qty</th>
            <th style="padding:10px 8px;text-align:right;border-bottom:1px solid #e2e8f0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <p style="margin:14px 0 0;text-align:right;font-size:16px;"><strong>Total: ${safeTotal}</strong></p>
      ${transactionSection}
      <p style="margin:14px 0 0;">For any support, contact us at <a href="mailto:${safeSupport}" style="color:#047857;text-decoration:none;">${safeSupport}</a>.</p>
      <p style="margin:14px 0 0;"><a href="${safeFrontendUrl}/order-tracking/${safeOrderId}" style="display:inline-block;background:linear-gradient(120deg,#075985,#1d4ed8,#0f172a);color:#ffffff;text-decoration:none;border-radius:999px;padding:11px 18px;font-weight:700;">Track your order</a></p>
      <p style="margin:14px 0 0;">Regards,<br/><strong>FruitMart Team</strong></p>
    `,
    footerNote: 'This is an official order confirmation email from FruitMart.',
  });
}

module.exports = {
  escapeHtml,
  buildAdminCustomerEmailTemplate,
  buildContactToSupportTemplate,
  buildContactAckTemplate,
  buildWelcomeEmailTemplate,
  buildPasswordResetOtpTemplate,
  buildOrderConfirmationTemplate,
};
