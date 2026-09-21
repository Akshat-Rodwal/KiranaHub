import nodemailer from 'nodemailer';
import config from './env.js';

let transporter = null;
const isSmtpConfigured = Boolean(config.smtpUser && config.smtpPass);

if (isSmtpConfigured) {
  try {
    const port = Number(config.smtpPort) || 587;
    const isSecure = port === 465;

    transporter = nodemailer.createTransport({
      host: config.smtpHost || 'smtp.gmail.com',
      port,
      secure: isSecure, // false for 587 (STARTTLS), true for 465
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const hostName = config.smtpHost || 'smtp.gmail.com';

    // Verify SMTP connection in background without blocking startup
    transporter.verify((error) => {
      if (error) {
        console.warn(`⚠️ [SMTP Engine] Connection verification failed (${hostName}):`, error.message);
        console.warn('⚠️ [SMTP Engine] Fallback console preview will be used upon delivery errors.');
      } else {
        console.log(`✅ [SMTP Engine] Connected successfully to ${hostName} (${config.smtpUser})`);
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
