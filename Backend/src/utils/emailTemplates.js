import config from '../config/env.js';

/**
 * Format currency in Indian Rupees for emails
 */
const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
};

/**
 * Modern HTML Template for Customer Welcome Email
 */
export const getWelcomeEmailTemplate = ({ name, promoCode = 'FIRST50' }) => {
  const storeUrl = config.clientUrl || 'http://localhost:5173';
  const firstName = name ? name.split(' ')[0] : 'Shopper';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to KiranaHub</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f7f9f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #054428 0%, #065f46 60%, #0c831f 100%); padding: 32px 24px; text-align: center; }
    .logo-badge { display: inline-block; background-color: #0c831f; color: #f8cb46; padding: 8px 16px; border-radius: 12px; font-weight: 900; font-size: 20px; letter-spacing: -0.5px; }
    .content { padding: 32px 28px; color: #1c1917; }
    .greeting { font-size: 24px; font-weight: 800; color: #054428; margin: 0 0 12px 0; }
    .text { font-size: 15px; line-height: 1.6; color: #44403c; margin: 0 0 20px 0; }
    .voucher-card { background: #f0fdf4; border: 2px dashed #86efac; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
    .voucher-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #166534; letter-spacing: 1px; margin-bottom: 8px; }
    .voucher-code { display: inline-block; font-family: monospace; font-size: 24px; font-weight: 800; color: #054428; background: #ffffff; padding: 8px 20px; border-radius: 10px; border: 1px solid #bbf7d0; letter-spacing: 2px; }
    .voucher-desc { font-size: 13px; color: #15803d; margin-top: 8px; font-weight: 600; }
    .features { margin: 24px 0; border-top: 1px solid #f5f5f4; border-bottom: 1px solid #f5f5f4; padding: 18px 0; }
    .feature-item { display: flex; align-items: center; margin: 10px 0; font-size: 14px; color: #292524; }
    .btn { display: inline-block; background-color: #0c831f; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 800; font-size: 15px; margin-top: 8px; }
    .footer { background-color: #f7f9f7; padding: 20px 24px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; }
  </style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <div class="logo-badge">🛒 KiranaHub</div>
        <div style="color: #ccff00; font-size: 13px; font-weight: 700; margin-top: 8px; letter-spacing: 0.5px;">⚡ Instant 10-Minute Grocery Delivery</div>
      </div>

      <div class="content">
        <h1 class="greeting">Welcome, ${firstName}! 👋</h1>
        <p class="text">
          Thank you for joining <strong>KiranaHub</strong>. Fresh vegetables, farm dairy, pantry staples, and daily essentials are now just minutes away from your doorstep.
        </p>

        <div class="voucher-card">
          <div class="voucher-title">🎁 New Customer Special Offer</div>
          <div class="voucher-code">${promoCode}</div>
          <div class="voucher-desc">Flat ₹50 OFF on your first order above ₹299!</div>
        </div>

        <div class="features">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #054428;">Why shop with KiranaHub?</div>
          <div class="feature-item">⚡ <strong>10-15 Minute Rapid Delivery</strong> to your doorstep</div>
          <div class="feature-item">🌾 <strong>100% Quality Assurance</strong> on staples, dairy & produce</div>
          <div class="feature-item">📦 <strong>FREE Delivery</strong> on orders above ₹499</div>
        </div>

        <div style="text-align: center; margin-top: 28px;">
          <a href="${storeUrl}" class="btn">Start Shopping Now →</a>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0;">Need help? Contact our instant support team at support@kiranahub.local</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} KiranaHub Fresh. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Modern HTML Template for Order Confirmation Email
 */
export const getOrderConfirmationTemplate = ({ order, user }) => {
  const storeUrl = config.clientUrl || 'http://localhost:5173';
  const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : 'NEW';
  const customerName = user?.name || order.deliveryAddress?.receiverName || 'Customer';
  const items = order.items || [];
  const pricing = order.pricing || {};

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f5f5f4; font-size: 14px; color: #1c1917;">
          <div style="font-weight: 700;">${item.name || item.product?.name || 'Item'}</div>
          <div style="font-size: 11px; color: #78716c;">${item.unit || '1 unit'}</div>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f5f5f4; font-size: 14px; color: #44403c; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f5f5f4; font-size: 14px; font-weight: 700; color: #1c1917; text-align: right;">
          ${formatCurrency((item.price || 0) * (item.quantity || 1))}
        </td>
      </tr>
    `
    )
    .join('');

  const address = order.deliveryAddress || {};
  const formattedAddress = [
    address.receiverName && `<strong>${address.receiverName}</strong>`,
    address.street,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation #${orderId}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f7f9f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #054428 0%, #065f46 60%, #0c831f 100%); padding: 28px 24px; text-align: center; }
    .logo-badge { display: inline-block; background-color: #0c831f; color: #f8cb46; padding: 6px 14px; border-radius: 10px; font-weight: 900; font-size: 18px; }
    .content { padding: 28px 24px; color: #1c1917; }
    .status-badge { display: inline-block; background-color: #dcfce7; color: #15803d; font-weight: 800; font-size: 12px; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .order-title { font-size: 22px; font-weight: 800; color: #054428; margin: 12px 0 4px 0; }
    .meta-box { background: #fafaf9; border-radius: 12px; padding: 14px 16px; margin: 18px 0; font-size: 13px; color: #44403c; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { text-align: left; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #78716c; padding: 8px 8px; border-bottom: 2px solid #e7e5e4; }
    .summary-row { display: flex; justify-content: space-between; font-size: 14px; color: #57534e; margin: 6px 0; }
    .grand-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #054428; padding-top: 10px; border-top: 2px solid #e7e5e4; margin-top: 10px; }
    .btn { display: inline-block; background-color: #0c831f; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 14px; }
    .footer { background-color: #f7f9f7; padding: 20px 24px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; }
  </style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <div class="logo-badge">🛒 KiranaHub</div>
        <div style="color: #ccff00; font-size: 13px; font-weight: 700; margin-top: 6px;">⚡ Order Confirmation</div>
      </div>

      <div class="content">
        <div style="text-align: center;">
          <span class="status-badge">✓ Order Placed</span>
          <h1 class="order-title">Order #${orderId}</h1>
          <p style="font-size: 14px; color: #78716c; margin: 0;">Estimated Delivery: <strong>10 - 15 minutes</strong></p>
        </div>

        <div class="meta-box">
          <div><strong>Deliver to:</strong> ${formattedAddress || 'Your Saved Address'}</div>
          <div style="margin-top: 4px;"><strong>Payment Method:</strong> ${order.paymentMethod || 'COD'} (${order.paymentStatus || 'PENDING'})</div>
        </div>

        <div style="font-weight: 800; font-size: 15px; color: #054428; margin-top: 20px;">Itemized Bill</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 16px; padding: 14px 16px; background-color: #fafaf9; border-radius: 12px;">
          <div class="summary-row">
            <span>Item Subtotal</span>
            <span>${formatCurrency(pricing.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Delivery Fee</span>
            <span>${pricing.deliveryFee === 0 ? '<strong style="color: #16a34a;">FREE</strong>' : formatCurrency(pricing.deliveryFee)}</span>
          </div>
          <div class="summary-row">
            <span>Handling Fee</span>
            <span>${formatCurrency(pricing.handlingFee || 2)}</span>
          </div>
          ${
            pricing.discount > 0
              ? `
          <div class="summary-row" style="color: #16a34a; font-weight: 700;">
            <span>Discount</span>
            <span>-${formatCurrency(pricing.discount)}</span>
          </div>
          `
              : ''
          }
          <div class="grand-total">
            <span>Bill Total</span>
            <span>${formatCurrency(pricing.grandTotal)}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${storeUrl}/orders" class="btn">View Live Order Tracking →</a>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0;">Need to modify your order? Call support or chat in-app immediately.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} KiranaHub Fresh. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Modern HTML Template for OTP Verification & Password Reset
 */
export const getOtpEmailTemplate = ({ otp, purpose = 'REGISTRATION', name }) => {
  const isRegistration = purpose === 'REGISTRATION';
  const heading = isRegistration ? 'Verify Your Email Address' : 'Reset Your Password';
  const actionText = isRegistration
    ? 'Please use the 6-digit verification code below to complete your KiranaHub registration:'
    : 'We received a request to reset the password for your KiranaHub account. Use the code below to proceed:';
  const greeting = name ? `Hello ${name.split(' ')[0]},` : 'Hello,';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f7f9f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #054428 0%, #065f46 60%, #0c831f 100%); padding: 28px 24px; text-align: center; }
    .logo-badge { display: inline-block; background-color: #0c831f; color: #f8cb46; padding: 6px 14px; border-radius: 10px; font-weight: 900; font-size: 18px; }
    .content { padding: 32px 28px; color: #1c1917; text-align: center; }
    .title { font-size: 22px; font-weight: 800; color: #054428; margin: 0 0 12px 0; }
    .greeting { font-size: 15px; font-weight: 600; color: #292524; margin: 0 0 10px 0; }
    .text { font-size: 14px; line-height: 1.6; color: #57534e; margin: 0 0 24px 0; }
    .otp-container { background: #f0fdf4; border: 2px dashed #86efac; border-radius: 16px; padding: 20px 24px; display: inline-block; margin: 8px 0 24px 0; }
    .otp-code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #054428; }
    .expiry { font-size: 12px; color: #15803d; font-weight: 700; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .warning { background-color: #fefce8; border: 1px solid #fef08a; border-radius: 10px; padding: 12px; font-size: 12px; color: #854d0e; text-align: left; margin-top: 16px; }
    .footer { background-color: #f7f9f7; padding: 18px 24px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; }
  </style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <div class="logo-badge">🛒 KiranaHub</div>
        <div style="color: #ccff00; font-size: 12px; font-weight: 700; margin-top: 6px; letter-spacing: 0.5px;">⚡ Security Verification</div>
      </div>

      <div class="content">
        <h1 class="title">${heading}</h1>
        <p class="greeting">${greeting}</p>
        <p class="text">${actionText}</p>

        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <div class="expiry">⏱️ Valid for 10 minutes only</div>
        </div>

        <div class="warning">
          <strong>Security Notice:</strong> KiranaHub will never ask you to share your OTP, password, or PIN. If you did not request this verification code, please ignore this email or contact customer support immediately.
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 4px 0;">KiranaHub Fresh • Fast 10-minute grocery delivery</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} KiranaHub. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

export default {
  getWelcomeEmailTemplate,
  getOrderConfirmationTemplate,
  getOtpEmailTemplate,
};
