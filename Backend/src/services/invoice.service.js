import PDFDocument from 'pdfkit';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from '../constants/httpStatus.js';

/**
 * Converts a number into Indian currency words representation
 */
function numberToWords(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero Rupees Only';

  function convert(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '')
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        ' Thousand' +
        (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '')
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        ' Lakh' +
        (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '')
      );
    return (
      convert(Math.floor(n / 10000000)) +
      ' Crore' +
      (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '')
    );
  }

  return convert(n) + ' Rupees Only';
}

/**
 * Builds and streams a corporate PDF tax invoice for an order.
 */
export const generateInvoicePDF = async (orderId, outputStream) => {
  const order = await Order.findById(orderId).populate('user', 'name email phone');
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found for invoice generation');
  }

  const doc = new PDFDocument({
    margin: 36,
    size: 'A4',
    bufferPages: true,
  });

  doc.pipe(outputStream);

  const primaryColor = '#059669';
  const darkSlate = '#0f172a';
  const textMuted = '#475569';
  const borderColor = '#cbd5e1';
  const bgLight = '#f8fafc';

  // --- TOP HEADER ---
  // Background Header Box
  doc.rect(36, 36, 523, 76).fill('#f0fdf4');

  // Company Brand Title
  doc.fontSize(20).fillColor(primaryColor).font('Helvetica-Bold')
    .text('KIRANAHUB FRESH', 50, 48);

  doc.fontSize(8).fillColor(textMuted).font('Helvetica')
    .text('KiranaHub Retail Technologies Pvt Ltd', 50, 72)
    .text('GSTIN: 07AAAAA0000A1Z5 | FSSAI Lic: 10019011000123', 50, 84)
    .text('Plot 42, Okhla Industrial Area Phase III, New Delhi 110020', 50, 96);

  // Invoice Badge on right
  doc.rect(400, 44, 145, 24).fill(primaryColor);
  doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold')
    .text('ORIGINAL TAX INVOICE', 400, 51, { width: 145, align: 'center' });

  const invoiceNo = `INV-${order._id.toString().slice(-8).toUpperCase()}`;
  const orderDateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  doc.fontSize(8).fillColor(darkSlate).font('Helvetica-Bold')
    .text(`Invoice No: ${invoiceNo}`, 390, 75, { width: 160, align: 'right' })
    .text(`Order Date: ${orderDateStr}`, 390, 87, { width: 160, align: 'right' })
    .text(`Order Ref: #${order._id.toString().slice(-6).toUpperCase()}`, 390, 99, { width: 160, align: 'right' });

  // Divider
  doc.strokeColor(borderColor).lineWidth(1).moveTo(36, 120).lineTo(559, 120).stroke();

  // --- BILL TO / SHIP TO SECTION ---
  doc.rect(36, 126, 256, 75).fill(bgLight);
  doc.rect(302, 126, 257, 75).fill(bgLight);

  // Bill To (Customer Details)
  doc.fontSize(9).fillColor(primaryColor).font('Helvetica-Bold')
    .text('BILL TO & CUSTOMER DETAILS', 46, 134);

  const customerName = order.deliveryAddress?.receiverName || order.user?.name || 'Valued Customer';
  const customerPhone = order.deliveryAddress?.receiverPhone || order.user?.phone || 'N/A';
  const customerEmail = order.user?.email || 'N/A';

  doc.fontSize(8).fillColor(darkSlate).font('Helvetica')
    .text(`Name: ${customerName}`, 46, 148)
    .text(`Phone: ${customerPhone}`, 46, 160)
    .text(`Email: ${customerEmail}`, 46, 172)
    .text('Place of Supply: ' + (order.deliveryAddress?.state || 'Delhi'), 46, 184);

  // Ship To (Delivery Address)
  doc.fontSize(9).fillColor(primaryColor).font('Helvetica-Bold')
    .text('SHIP TO / DELIVERY ADDRESS', 312, 134);

  const fullAddress = [
    order.deliveryAddress?.addressLine1,
    order.deliveryAddress?.addressLine2,
    order.deliveryAddress?.landmark ? `Landmark: ${order.deliveryAddress.landmark}` : null,
    `${order.deliveryAddress?.city || ''}, ${order.deliveryAddress?.state || ''} - ${order.deliveryAddress?.pincode || ''}`,
  ]
    .filter(Boolean)
    .join(', ');

  doc.fontSize(8).fillColor(darkSlate).font('Helvetica')
    .text(fullAddress, 312, 148, { width: 235, lineGap: 2 });

  // --- ITEMIZED PRODUCTS TABLE ---
  const tableTop = 212;
  doc.rect(36, tableTop, 523, 20).fill(primaryColor);

  doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold')
    .text('#', 42, tableTop + 6, { width: 20 })
    .text('Item Description', 65, tableTop + 6, { width: 175 })
    .text('HSN', 245, tableTop + 6, { width: 45, align: 'center' })
    .text('Qty', 295, tableTop + 6, { width: 35, align: 'center' })
    .text('Price (INR)', 335, tableTop + 6, { width: 55, align: 'right' })
    .text('Taxable', 395, tableTop + 6, { width: 50, align: 'right' })
    .text('GST (5%)', 450, tableTop + 6, { width: 45, align: 'right' })
    .text('Total (INR)', 500, tableTop + 6, { width: 54, align: 'right' });

  let y = tableTop + 24;
  let runningSubtotal = 0;

  order.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.rect(36, y - 4, 523, 18).fill('#fbfcfd');
    }

    const itemPrice = item.price || 0;
    const itemQty = item.quantity || 1;
    const taxableAmt = itemPrice * itemQty;
    const itemGst = Math.round(taxableAmt * 0.05 * 100) / 100;
    const itemTotal = taxableAmt; // retail pricing inclusive or direct
    runningSubtotal += taxableAmt;

    doc.fontSize(8).fillColor(darkSlate).font('Helvetica')
      .text(String(index + 1), 42, y, { width: 20 })
      .text(item.name || 'Grocery Item', 65, y, { width: 175, height: 14, ellipsis: true })
      .text('1904', 245, y, { width: 45, align: 'center' })
      .text(`${itemQty} ${item.unit || 'pc'}`, 295, y, { width: 35, align: 'center' })
      .text(itemPrice.toFixed(2), 335, y, { width: 55, align: 'right' })
      .text(taxableAmt.toFixed(2), 395, y, { width: 50, align: 'right' })
      .text(itemGst.toFixed(2), 450, y, { width: 45, align: 'right' })
      .text(taxableAmt.toFixed(2), 500, y, { width: 54, align: 'right' });

    y += 18;
  });

  // Table bottom border
  doc.strokeColor(borderColor).lineWidth(0.5).moveTo(36, y + 2).lineTo(559, y + 2).stroke();
  y += 10;

  // --- FINANCIALS & TAX BREAKDOWN ---
  const subtotalVal = order.pricing?.subtotal || runningSubtotal;
  const taxableVal = order.pricing?.taxableAmount || subtotalVal;
  const cgstVal = order.pricing?.cgst || Math.round(taxableVal * 0.025 * 100) / 100;
  const sgstVal = order.pricing?.sgst || Math.round(taxableVal * 0.025 * 100) / 100;
  const deliveryVal = order.pricing?.deliveryFee || 0;
  const handlingVal = order.pricing?.handlingFee || 2;
  const tipVal = order.deliveryTip || 0;
  const discountVal = order.pricing?.discount || 0;
  const grandTotalVal = order.pricing?.grandTotal || (taxableVal + cgstVal + sgstVal + deliveryVal + handlingVal - discountVal + tipVal);

  // Left Column: Payment & Shipment Details
  const leftX = 46;
  let leftY = y + 5;

  doc.fontSize(9).fillColor(primaryColor).font('Helvetica-Bold')
    .text('PAYMENT & TRANSACTION DETAILS', leftX, leftY);
  leftY += 15;

  const payMethod = order.paymentMethod || 'COD';
  const payStatus = order.paymentStatus || 'PENDING';
  const txnId = order.razorpayPaymentId || order.razorpayOrderId || 'N/A (Cash on Delivery)';

  doc.fontSize(8).fillColor(darkSlate).font('Helvetica')
    .text(`Payment Mode: ${payMethod}`, leftX, leftY)
    .text(`Payment Status: ${payStatus}`, leftX, leftY + 12)
    .text(`Transaction Reference: ${txnId}`, leftX, leftY + 24)
    .text(`Logistics Partner: ${order.shipping?.carrier || 'KiranaHub Express'}`, leftX, leftY + 36)
    .text(`Tracking AWB: ${order.shipping?.awb || 'Standard Direct Delivery'}`, leftX, leftY + 48);

  // Right Column: Summary Table
  const rightLabelX = 350;
  const rightValX = 470;
  const rightValW = 84;
  let rightY = y + 5;

  const drawSummaryLine = (label, value, isBold = false) => {
    doc.fontSize(8).fillColor(isBold ? darkSlate : textMuted).font(isBold ? 'Helvetica-Bold' : 'Helvetica')
      .text(label, rightLabelX, rightY, { width: 120 })
      .text(value, rightValX, rightY, { width: rightValW, align: 'right' });
    rightY += 14;
  };

  drawSummaryLine('Taxable Subtotal:', `INR ${taxableVal.toFixed(2)}`);
  drawSummaryLine('CGST (2.5%):', `INR ${cgstVal.toFixed(2)}`);
  drawSummaryLine('SGST (2.5%):', `INR ${sgstVal.toFixed(2)}`);
  drawSummaryLine('Delivery Partner Fee:', deliveryVal === 0 ? 'FREE' : `INR ${deliveryVal.toFixed(2)}`);
  drawSummaryLine('Handling Fee:', `INR ${handlingVal.toFixed(2)}`);
  if (tipVal > 0) {
    drawSummaryLine('Rider Tip:', `INR ${tipVal.toFixed(2)}`);
  }
  if (discountVal > 0) {
    drawSummaryLine('Discount Applied:', `- INR ${discountVal.toFixed(2)}`);
  }

  // Grand Total Box
  doc.rect(rightLabelX - 6, rightY - 2, 215, 24).fill('#ecfdf5');
  doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold')
    .text('GRAND TOTAL:', rightLabelX, rightY + 4, { width: 120 })
    .text(`INR ${grandTotalVal.toFixed(2)}`, rightValX, rightY + 4, { width: rightValW, align: 'right' });

  rightY += 32;

  // Amount in words
  const maxY = Math.max(leftY + 65, rightY);
  doc.rect(36, maxY, 523, 22).fill(bgLight);
  doc.fontSize(8).fillColor(darkSlate).font('Helvetica-Bold')
    .text(`Amount in Words: ${numberToWords(grandTotalVal)}`, 46, maxY + 7);

  // --- DECLARATION & FOOTER ---
  const footerY = 720;
  doc.strokeColor(borderColor).lineWidth(0.5).moveTo(36, footerY).lineTo(559, footerY).stroke();

  doc.fontSize(7).fillColor(textMuted).font('Helvetica')
    .text('Terms & Conditions: 1. Goods once sold are covered under KiranaHub 100% Freshness Guarantee. 2. Perishable goods can be returned at the time of delivery or within 24 hours. 3. All disputes subject to Delhi jurisdiction.', 36, footerY + 8, { width: 360, lineGap: 1.5 });

  doc.fontSize(8).fillColor(darkSlate).font('Helvetica-Bold')
    .text('For KiranaHub Retail Technologies', 400, footerY + 8, { width: 154, align: 'center' })
    .font('Helvetica-Oblique').fontSize(7).fillColor(textMuted)
    .text('Digitally Authorized Signatory', 400, footerY + 36, { width: 154, align: 'center' })
    .font('Helvetica').fontSize(6).fillColor(textMuted)
    .text('(Computer Generated Invoice - No signature required)', 400, footerY + 46, { width: 154, align: 'center' });

  doc.end();
};

export default {
  generateInvoicePDF,
};
