import nodemailer from "nodemailer";

const STATUS_COPY = {
  "Quotation Requested": "We have received your quotation request and our team will review it shortly.",
  "Quotation Sent": "Your quotation is ready. Please check your email or contact us if you need any changes.",
  Processing: "Your order is now being processed by our team.",
  Shipped: "Your order has been shipped and is on its way.",
  Delivered: "Your order has been marked as delivered. Thank you for shopping with us.",
  Cancelled: "Your order has been cancelled. Please contact us if you have any questions.",
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendOrderStatusEmail(order, status) {
  const recipient = String(order?.email || "").trim();
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    return { sent: false, reason: "Customer has no valid email address" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn("Order status email skipped: SMTP is not configured.");
    return { sent: false, reason: "SMTP is not configured" };
  }

  const customerName = escapeHtml(order.customerName || "Customer");
  const orderId = escapeHtml(order.id);
  const statusText = escapeHtml(status);
  const message = escapeHtml(STATUS_COPY[status] || "Your order status has been updated.");
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: `Asia Electronics <${from}>`,
      to: recipient,
      subject: `Order ${order.id} update: ${status}`,
      text: `Hello ${order.customerName || "Customer"},\n\nYour order ${order.id} is now: ${status}.\n\n${STATUS_COPY[status] || "Your order status has been updated."}\n\nAsia Electronics & Cellular Pvt Ltd`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#18181b;line-height:1.6">
          <h2 style="color:#e11d48">Order update</h2>
          <p>Hello ${customerName},</p>
          <p>Your order <strong>${orderId}</strong> is now:</p>
          <p style="display:inline-block;background:#fff1f2;color:#be123c;padding:8px 14px;border-radius:999px;font-weight:700">${statusText}</p>
          <p>${message}</p>
          <p style="margin-top:28px;color:#52525b">Asia Electronics &amp; Cellular Pvt Ltd</p>
        </div>`,
    });
    return { sent: true };
  } catch (error) {
    console.error(`Order status email failed for ${order.id}:`, error.message);
    return { sent: false, reason: "Email delivery failed" };
  }
}