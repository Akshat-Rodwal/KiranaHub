import nodemailer from 'nodemailer';
import config from './env.js';

const isSmtpConfigured = Boolean(
  (config.smtpUser || process.env.EMAIL_USER) &&
  (config.smtpPass || process.env.EMAIL_PASS)
);

export let transporter = null;

if (isSmtpConfigured) {
  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS / STARTTLS
      requireTLS: true,
      auth: {
        user: config.smtpUser || process.env.EMAIL_USER,
        pass: (config.smtpPass || process.env.EMAIL_PASS || '').replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3',
      },
      pool: true,
      maxConnections: 3,
      socketTimeout: 30000,
    });

    const hostName = 'smtp.gmail.com';
    const smtpUser = config.smtpUser || process.env.EMAIL_USER;

    // Verify SMTP connection in background without blocking startup
    transporter.verify((error) => {
      if (error) {
        console.warn(`⚠️ [SMTP Engine] Connection verification failed (${hostName}):`, error.message);
        console.warn('⚠️ [SMTP Engine] Fallback console preview will be used upon delivery errors.');
      } else {
        console.log(`✅ [SMTP Engine] Connected successfully to ${hostName} (${smtpUser})`);
      }
    });
  } catch (err) {
    console.warn('⚠️ [SMTP Engine] Failed to initialize Nodemailer transporter:', err.message);
    transporter = null;
  }
} else {
  console.log('ℹ️ [SMTP Engine] No SMTP credentials in .env. Console preview logger active.');
}

/**
 * Safely send an email without throwing errors that could crash HTTP requests.
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plain text body fallback
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.warn('[SMTP Engine] Skipping email dispatch: No recipient specified.');
    return { success: false, error: 'Recipient address required' };
  }

  const from = `"${config.fromName}" <${config.fromEmail}>`;

  // Fallback: Console preview when SMTP credentials are not configured
  if (!transporter) {
    console.log('\n✉️ ---------------- [SMTP CONSOLE PREVIEW] ----------------');
    console.log(`To      : ${to}`);
    console.log(`From    : ${from}`);
    console.log(`Subject : ${subject}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('------------------------------------------------------------\n');
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
    });

    console.log(`📧 [SMTP] Email sent to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.warn(`⚠️ [SMTP Error] Failed to send email to ${to}:`, err.message);
    // Non-blocking: Do NOT throw, allow calling workflow to continue safely
    return { success: false, error: err.message };
  }
};

export default { sendEmail };
