import PDFDocument from "pdfkit";

/**
 * Generates a professional PDF invoice for an order.
 * @param {Object} order - The order document from MongoDB.
 * @returns {PDFDocument} - The generated PDF document stream.
 */
export const generateInvoicePDF = (order) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  // --- Header ---
  doc
    .fillColor("#e11d48") // Primary color (Rose-600)
    .fontSize(24)
    .font("Helvetica-BoldOblique")
    .text("CampusThali", 50, 50);

  doc
    .fillColor("#444444")
    .fontSize(10)
    .font("Helvetica")
    .text("Ghar Jaisa Khana, Delivery Anywhere.", 50, 80);

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("INVOICE", 400, 50, { align: "right" });

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Order ID: #${order._id.toString().slice(-8).toUpperCase()}`, 400, 75, { align: "right" })
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 90, { align: "right" });

  const hrLine = 110;
  doc.moveTo(50, hrLine).lineTo(550, hrLine).strokeColor("#eeeeee").stroke();

  // --- Customer & Chef Details ---
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Bill To:", 50, hrLine + 20);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(order.studentId?.name || "Premium Student", 50, hrLine + 35)
    .text(order.addressSnapshot?.phone || "", 50, hrLine + 50)
    .text(`${order.addressSnapshot?.addressLine}, ${order.addressSnapshot?.city}`, 50, hrLine + 65);

  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Prepared By:", 300, hrLine + 20);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(order.chefId?.name || "Campus Chef", 300, hrLine + 35)
    .text("Authorized Campus Partner", 300, hrLine + 50);

  const tableTop = 220;
  doc.moveTo(50, tableTop).lineTo(550, tableTop).strokeColor("#e11d48").stroke();

  // --- Table Header ---
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Item Details", 50, tableTop + 10)
    .text("Qty", 350, tableTop + 10, { width: 50, align: "center" })
    .text("Price", 400, tableTop + 10, { width: 70, align: "right" })
    .text("Total", 480, tableTop + 10, { width: 70, align: "right" });

  doc.moveTo(50, tableTop + 25).lineTo(550, tableTop + 25).strokeColor("#eeeeee").stroke();

  // --- Table Content ---
  let currentY = tableTop + 35;
  order.items.forEach((item) => {
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(item.name, 50, currentY)
      .text(item.quantity.toString(), 350, currentY, { width: 50, align: "center" })
      .text(`Rs. ${item.price}`, 400, currentY, { width: 70, align: "right" })
      .text(`Rs. ${item.price * item.quantity}`, 480, currentY, { width: 70, align: "right" });

    currentY += 20;
  });

  doc.moveTo(50, currentY).lineTo(550, currentY).strokeColor("#eeeeee").stroke();

  // --- Summary ---
  const summaryY = currentY + 20;
  
  const drawSummaryLine = (label, value, y, isBold = false) => {
    doc
      .fontSize(10)
      .font(isBold ? "Helvetica-Bold" : "Helvetica")
      .text(label, 350, y, { width: 100, align: "right" })
      .text(`Rs. ${value}`, 480, y, { width: 70, align: "right" });
  };

  drawSummaryLine("Items Total:", order.itemsTotal, summaryY);
  drawSummaryLine("Platform Fee:", order.platformFee || 12, summaryY + 15);
  
  doc.moveTo(350, summaryY + 35).lineTo(550, summaryY + 35).strokeColor("#e11d48").stroke();
  
  doc
    .fillColor("#e11d48")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Grand Total:", 350, summaryY + 45, { width: 100, align: "right" })
    .text(`Rs. ${order.totalAmount}`, 480, summaryY + 45, { width: 70, align: "right" });

  doc.fillColor("#444444");

  // --- Payment Info ---
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Payment Info:", 50, summaryY);
    
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Method: ${order.paymentMethod?.toUpperCase() || 'COD'}`, 50, summaryY + 15)
    .text(`Status: ${order.paymentStatus?.toUpperCase() || 'PENDING'}`, 50, summaryY + 30);

  // --- Earnings Breakdown ---
  const earningsY = summaryY + 70;
  
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Earnings Breakdown:", 50, earningsY);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(`Chef Earnings: Rs. ${order.chefEarning}`, 50, earningsY + 15)
    .text(`Platform Fee (Admin): Rs. ${order.adminEarning || 12}`, 50, earningsY + 30);

  // --- Footer ---
  doc
    .fillColor("#999999")
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text("Thank you for ordering from CampusThali!", 50, 750, { align: "center", width: 500 });

  return doc;
};
