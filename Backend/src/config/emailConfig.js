import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import config from './env.js';

const resendApiKey = config.resendApiKey || process.env.RESEND_API_KEY;
export const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

if (resendClient) {
  console.log('✅ [Email Engine] Resend HTTP API client configured.');
}

const brevoApiKey = config.brevoApiKey || process.env.BREVO_API_KEY;
if (brevoApiKey) {
  console.log('✅ [Email Engine] Brevo REST API v3 configured as primary provider.');
}

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

  // Primary Provider: Brevo REST API v3 (Port 443 HTTPS - Unrestricted recipients & Render cloud compatible)
  const brevoKey = process.env.BREVO_API_KEY || config.brevoApiKey;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || config.brevoSenderEmail || process.env.EMAIL_USER;

  if (brevoKey) {
    try {
      const recipientList = (Array.isArray(to) ? to : [to]).map((email) => ({ email }));
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: config.fromName || 'KiranaHub', email: senderEmail },
          to: recipientList,
          subject,
          htmlContent: html || `<p>${text || ''}</p>`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('✅ [Brevo API] Email delivered successfully:', data);
        return { success: true, data, messageId: data?.messageId };
      } else {
        console.error('❌ [Brevo API] Error response:', data);
      }
    } catch (err) {
      console.error('❌ [Brevo API] Request failed:', err.message);
    }
  }

  // Secondary Provider: Resend HTTP API (Port 443 HTTPS - avoids SMTP blocks on cloud hosts like Render)
  if (resendClient) {
    try {
      const { data, error } = await resendClient.emails.send({
        from: 'KiranaHub <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || text,
      });

      if (error) {
        console.error('❌ [Resend HTTP] Delivery error:', error.message || error);
      } else {
        console.log('✅ [Resend HTTP] Email delivered successfully:', data?.id || data);
        return { success: true, data, messageId: data?.id };
      }
    } catch (err) {
      console.error('❌ [Resend HTTP] Request failed:', err.message);
    }
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
