import dotenv from "dotenv";
import path from "path";
import { enqueueEmail } from "./emailQueue.service";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const CLIENT_URL     = process.env.CLIENT_URL;
const STORE_LOGO_URL = process.env.STORE_LOGO_URL || `${CLIENT_URL}/icons/sholex-180.png`;

type SendEmailResult = {
  success:    boolean;
  messageId?: string;
  error?:     unknown;
  simulated?: boolean;
};

// ─── Core sender (now enqueues instead of sending directly) ─────────────────
const sendEmail = async (
  to:           string,
  subject:      string,
  htmlContent:  string,
  textContent?: string,
): Promise<SendEmailResult> => {
  await enqueueEmail({
    to,
    subject,
    html: htmlContent,
    text: textContent,
  });

  return { success: true, simulated: true };
};

const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// ─── Shared layout wrapper ────────────────────────────────────────────────────
interface LayoutOptions {
  headerBg:  string;
  headerText?: string;
  body:      string;
  logoUrl?:  string;
}

const layout = ({ headerBg, headerText = '#2d3748', body, logoUrl = STORE_LOGO_URL }: LayoutOptions) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:#f4f7f6; }
    .wrap { padding:20px; background:#f4f7f6; }
    .card { max-width:600px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.05); }
    .hdr  { background:${headerBg}; padding:30px 20px; text-align:center; }
    .hdr h1 { margin:0; color:${headerText}; font-size:28px; letter-spacing:-.5px; display:flex; align-items:center; justify-content:center; gap:10px; }
    .hdr .logo { display:inline-block; vertical-align:middle; }
    .hdr .brand-name { color:${headerText}; }
    .hdr .brand-accent { color:#e8622a; }
    .body { padding:40px 30px; }
    .body h2 { color:#2d3748; font-size:22px; margin-top:0; }
    .body p  { color:#4a5568; line-height:1.6; }
    .btn  { display:inline-block; padding:14px 32px; border-radius:50px; text-decoration:none; font-weight:600; font-size:16px; }
    .box  { background:#f9fafb; border-radius:12px; padding:20px; margin:20px 0; }
    .box p { margin:8px 0; color:#4a5568; }
    .ftr  { background:#f9fafb; padding:20px; text-align:center; color:#a0aec0; font-size:13px; border-top:1px solid #e2e8f0; }
    .ftr a { color:#e8622a; text-decoration:none; }
    @media(max-width:480px){ .body { padding:30px 20px; } .hdr h1 { font-size:24px; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="hdr">
        <h1>
          <span class="logo">
            <img src="${logoUrl}" alt="sholex" style="width:32px; height:32px; object-fit:contain; vertical-align:middle;" />
          </span>
          <span class="brand-name">Sholex<span class="brand-accent">Store</span></span>
        </h1>
      </div>
      ${body}
      <div class="ftr">
        &copy; ${new Date().getFullYear()} Sholex. All rights reserved.<br>
        <a href="${CLIENT_URL}">Visit our store</a>
      </div>
    </div>
  </div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH EMAILS (Unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

export const sendVerificationEmail = async (
  email: string,
  token: string,
  name?: string,
) => {
  const url = `${CLIENT_URL}/verify-email?token=${token}`;
  const greeting = name ? `Hi <strong>${name}</strong>, welcome to Sholex! 🛍️` : `Welcome to Sholex! 🛍️`;

  const html = layout({
    headerBg: '#ffd6d6',
    body: `
      <div class="body" style="text-align:center;">
        <h2>${greeting}</h2>
        <p>Thank you for joining us. Please verify your email address to complete your registration.</p>
        <a href="${url}" class="btn" style="background:#e8622a;color:#fff;box-shadow:0 4px 12px rgba(232,98,42,.3);">Verify Email Address</a>
        <p style="margin-top:25px;font-size:14px;color:#718096;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>`,
  });

  return sendEmail(
    email,
    "Welcome to Sholex – Verify Your Email",
    html,
    `Welcome to Sholex! Verify your email: ${url}`,
  );
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const url = `${CLIENT_URL}/reset-password?token=${token}`;

  const html = layout({
    headerBg: '#fef3c7',
    body: `
      <div class="body" style="text-align:center;">
        <h2>Reset Your Password 🔐</h2>
        <p>We received a request to reset the password for your Sholex account. Click the button below to choose a new password.</p>
        <a href="${url}" class="btn" style="background:#d97706;color:#fff;box-shadow:0 4px 12px rgba(217,119,6,.3);">Reset My Password</a>
        <div style="margin-top:30px; padding:16px; background:#fef9c3; border-radius:10px; border-left:4px solid #d97706;">
          <p style="margin:0; font-size:14px; color:#92400e;">
            ⏱ This link expires in <strong>1 hour</strong>.<br>
            If you didn't request a password reset, please ignore this email — your account is safe.
          </p>
        </div>
      </div>`,
  });

  return sendEmail(
    email,
    "Password Reset Request – Sholex",
    html,
    `Reset your Sholex password (expires in 1 hour): ${url}`,
  );
};

export const sendPasswordChangedEmail = async (email: string, name?: string) => {
  const greeting = name ? `Hi <strong>${name}</strong>,` : "Hi there,";

  const html = layout({
    headerBg: '#fee2e2',
    body: `
      <div class="body" style="text-align:center;">
        <h2>Your Password Was Changed ✅</h2>
        <p>${greeting} your Sholex account password was recently updated.</p>
        <div style="padding:16px; background:#fef2f2; border-radius:10px; border-left:4px solid #ef4444; text-align:left;">
          <p style="margin:0; font-size:14px; color:#991b1b;">
            🚨 <strong>If you didn't make this change</strong>, your account may be compromised.<br>
            Please <a href="${CLIENT_URL}/forgot-password" style="color:#dc2626;font-weight:600;">reset your password immediately</a> or contact our support team.
          </p>
        </div>
        <p style="margin-top:24px; font-size:14px; color:#718096;">
          If you made this change, no action is needed — your account is secure.
        </p>
      </div>`,
  });

  return sendEmail(
    email,
    "Your Password Has Been Changed – Sholex",
    html,
    `Your Sholex password was changed. If you didn't do this, reset your password immediately at ${CLIENT_URL}/forgot-password`,
  );
};

export const sendEmailChangeVerification = async (
  newEmail: string,
  token:    string,
) => {
  const url = `${CLIENT_URL}/verify-email-change?token=${token}`;

  const html = layout({
    headerBg: '#dbeafe',
    body: `
      <div class="body" style="text-align:center;">
        <h2>Confirm Your New Email Address ✉️</h2>
        <p>A request was made to change the email address on a Sholex account to <strong>${newEmail}</strong>.</p>
        <p>Click the button below to confirm and activate your new email address.</p>
        <a href="${url}" class="btn" style="background:#3b82f6;color:#fff;box-shadow:0 4px 12px rgba(59,130,246,.3);">Confirm New Email</a>
        <div style="margin-top:30px; padding:16px; background:#eff6ff; border-radius:10px; border-left:4px solid #3b82f6;">
          <p style="margin:0; font-size:14px; color:#1e40af;">
            ⏱ This link expires in <strong>24 hours</strong>.<br>
            If you didn't request this change, you can safely ignore this email.
          </p>
        </div>
      </div>`,
  });

  return sendEmail(
    newEmail,
    "Confirm Your New Email Address – Sholex",
    html,
    `Confirm your new Sholex email address (expires in 24 hours): ${url}`,
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER EMAILS (Unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

export const sendOrderConfirmation = async (
  email:      string,
  orderId:    string,
  total:      number,
  name?:      string,
  discount?:  number,
  couponCode?: string,
  subtotal?:  number,
  paymentMethod?: string,
  paymentDetails?: any,
  shippingFee?: number,
) => {
  const greeting = name ? `Thank you, <strong>${name}</strong>! 🎉` : `Order Confirmed! 🎉`;

  const discountLine = discount && couponCode
    ? `<p style="margin:4px 0;color:#4a5568;"><strong>Discount (${couponCode})</strong> &minus; ₦${discount.toLocaleString()}</p>`
    : '';
  const subtotalLine = subtotal !== undefined
    ? `<p style="margin:8px 0;color:#4a5568;"><strong>Subtotal</strong> ₦${subtotal.toLocaleString()}</p>`
    : '';

  let shippingFeeLine = '';
  if (shippingFee !== undefined) {
    shippingFeeLine = shippingFee === 0
      ? `<p style="margin:8px 0;color:#4a5568;"><strong>Shipping</strong> Free</p>`
      : `<p style="margin:8px 0;color:#4a5568;"><strong>Shipping</strong> ₦${shippingFee.toLocaleString()}</p>`;
  }

  let paymentSection = '';
  if (paymentMethod === 'bank_transfer' && paymentDetails) {
    paymentSection = `
      <div style="margin:20px 0;padding:16px;background:#f9fafb;border-radius:12px;">
        <p><strong>Bank Name:</strong> ${paymentDetails.bankName || 'N/A'}</p>
        <p><strong>Account Name:</strong> ${paymentDetails.accountName || 'N/A'}</p>
        <p><strong>Account Number:</strong> <span style="font-family:monospace;">${paymentDetails.accountNumber || 'N/A'}</span></p>
      </div>`;
  } else if (paymentMethod === 'whatsapp' && paymentDetails) {
    paymentSection = `
      <p style="margin:16px 0;"><strong>Please complete payment via WhatsApp:</strong> ${paymentDetails.whatsappNumber || 'N/A'}</p>`;
  }

  const trackUrl = `${CLIENT_URL}/track-order?orderId=${orderId}&email=${encodeURIComponent(email)}`;
  const trackButton = `
    <p style="margin-top:24px;text-align:center;">
      <a href="${trackUrl}" class="btn" style="background:#e8622a;color:#fff;box-shadow:0 4px 12px rgba(232,98,42,.3);">Track Your Order</a>
    </p>`;

  const html = layout({
    headerBg: '#dff2e6',
    body: `
      <div class="body">
        <h2>${greeting}</h2>
        <p>Thank you for your purchase! We're preparing your order and will ship it soon.</p>
        <div class="box">
          <p><strong>Order #</strong> ${orderId}</p>
          ${subtotalLine}
          ${discountLine}
          ${shippingFeeLine}
          <p><strong>Total</strong> <span style="font-size:24px;font-weight:700;color:#e8622a;">₦${total.toLocaleString()}</span></p>
        </div>
        ${paymentSection}
        ${trackButton}
        <p>You'll receive a shipping notification once your order is on its way.</p>
      </div>`,
  });

  return sendEmail(
    email,
    "Order Confirmation – Sholex",
    html,
    `Order #${orderId} confirmed. Total: ₦${total.toLocaleString()}. Thank you!`,
  );
};

export const sendOrderShippedEmail = async (
  email:      string,
  orderId:    string,
  name?:      string,
  total?:     number,
  discount?:  number,
  couponCode?: string,
) => {
  const greeting = name
    ? `Hi <strong>${name}</strong>, your order has been shipped! 🚚`
    : `Your Order Has Been Shipped! 🚚`;

  const discountLine = discount && couponCode
    ? `<p style="margin:4px 0;"><strong>Discount (${couponCode})</strong> &minus; ₦${discount.toLocaleString()}</p>`
    : '';
  const totalLine = total
    ? `<p><strong>Total:</strong> ₦${total.toLocaleString()}</p>`
    : '';

  const html = layout({
    headerBg: '#60a5fa',
    headerText: '#ffffff',
    body: `
      <div class="body" style="text-align:center;">
        <h2>${greeting}</h2>
        <p>Great news! Your order <strong>#${orderId}</strong> is on its way.</p>
        ${discountLine}
        ${totalLine}
        <p>You'll receive a delivery confirmation once it arrives.</p>
      </div>`,
  });

  return sendEmail(
    email,
    "Your Order Has Been Shipped – Sholex",
    html,
    `Your Sholex order #${orderId} has shipped!`,
  );
};

export const sendOrderDeliveredEmail = async (
  email:      string,
  orderId:    string,
  name?:      string,
  total?:     number,
  discount?:  number,
  couponCode?: string,
) => {
  const greeting = name
    ? `Thank you, <strong>${name}</strong>! Your order has been delivered ✅`
    : `Order Delivered! ✅`;

  const discountLine = discount && couponCode
    ? `<p style="margin:4px 0;"><strong>Discount (${couponCode})</strong> &minus; ₦${discount.toLocaleString()}</p>`
    : '';
  const totalLine = total
    ? `<p><strong>Total:</strong> ₦${total.toLocaleString()}</p>`
    : '';

  const html = layout({
    headerBg: '#34d399',
    headerText: '#ffffff',
    body: `
      <div class="body" style="text-align:center;">
        <h2>${greeting}</h2>
        <p>Your order <strong>#${orderId}</strong> has been successfully delivered.</p>
        ${discountLine}
        ${totalLine}
        <p>We hope you enjoy your purchase! 🛍️</p>
      </div>`,
  });

  return sendEmail(
    email,
    "Order Delivered – Sholex",
    html,
    `Your Sholex order #${orderId} has been delivered. Enjoy! 🛍️`,
  );
};

export const sendOrderStatusUpdateEmail = async (
  email:      string,
  orderId:    string,
  status:     string,
  total:      number,
  name?:      string,
  discount?:  number,
  couponCode?: string,
  subtotal?:  number,
) => {
  const statusLabels: Record<string, string> = {
    Shipped:   name ? `Hi ${name}, your order has been shipped! 🚚` : `Your order has been shipped! 🚚`,
    Delivered: name ? `Hi ${name}, your order has been delivered! ✅` : `Your order has been delivered! ✅`,
  };
  const heading = statusLabels[status] || `Your order status is now ${status}`;

  const badgeColor = status === 'Shipped' ? '#3b82f6' : '#34d399';

  const discountLine = discount && couponCode
    ? `<p style="margin:8px 0;color:#4a5568;"><strong>Discount (${couponCode})</strong> &minus; ₦${discount.toLocaleString()}</p>`
    : '';
  const subtotalLine = subtotal && subtotal !== total
    ? `<p style="margin:8px 0;color:#4a5568;"><strong>Subtotal</strong> ₦${subtotal.toLocaleString()}</p>`
    : '';

  const html = layout({
    headerBg: '#dff2e6',
    body: `
      <div class="body">
        <h2>${heading}</h2>
        <p>Your order <strong>#${orderId}</strong> has been updated to:</p>
        <div style="text-align:center;margin:16px 0;">
          <span style="display:inline-block;padding:8px 20px;border-radius:50px;font-weight:700;font-size:14px;background:${badgeColor};color:#fff;">${status}</span>
        </div>
        <div class="box">
          ${subtotalLine}
          ${discountLine}
          <p style="margin:8px 0;"><strong>Total:</strong> ₦${total.toLocaleString()}</p>
        </div>
        ${status === 'Delivered'
          ? `<p>Your order has been delivered. Thank you for shopping with us! 🛍️</p>`
          : `<p>We'll keep you updated on your order's progress.</p>`}
      </div>`,
  });

  return sendEmail(
    email,
    `Order #${orderId} – Status Updated to ${status}`,
    html,
    `Your Sholex order #${orderId} is now ${status}. Total: ₦${total.toLocaleString()}.`,
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN NOTIFICATION (Unchanged)
// ═══════════════════════════════════════════════════════════════════════════════

export const sendAdminOrderNotification = async (
  order:     any,
  action:    "created" | "updated",
  newStatus?: string,
) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️ ADMIN_EMAIL not set. Admin notification skipped.");
    return;
  }

  let userEmail = order.email || order.guestEmail || "N/A";
  let userName  = order.name || "";
  let userPhone = order.phone || "";

  if (order.user && (!userEmail || userEmail === "N/A" || !userName)) {
    try {
      const { User } = await import("../models/User.js");
      const user = await User.findById(order.user);
      userEmail = user?.email  || userEmail;
      userName  = userName  || user?.name  || "";
      userPhone = userPhone || user?.phone || "";
    } catch (err) {
      console.error("Failed to fetch user for admin notification:", err);
    }
  }

  const customerLabel = [userName, userEmail, userPhone ? `📞 ${userPhone}` : ""]
    .filter(Boolean)
    .join(" | ");

  const itemsList = order.orderItems
    .map((item: any) => `${item.qty}× ${item.name} – ₦${(item.price * item.qty).toLocaleString()}`)
    .join("<br/>");

  const subject = action === "created"
    ? `🛒 New Order #${order._id} Placed`
    : `🔄 Order #${order._id} → ${newStatus || order.status}`;

  const statusColor: Record<string, string> = {
    Paid:      'green',
    Pending:   'orange',
    Shipped:   'blue',
    Delivered: 'green',
  };

  const couponLine = order.couponCode
    ? `<p><strong>Coupon:</strong> ${order.couponCode} (&minus;₦${(order.discount || 0).toLocaleString()})</p>`
    : "";

  const html = `
    <h2>${subject}</h2>
    <p><strong>Order #:</strong> ${order._id}</p>
    <p><strong>Customer:</strong> ${customerLabel}</p>
    <p><strong>Total:</strong> ₦${order.totalPrice.toLocaleString()}</p>
    ${couponLine}
    <p><strong>Payment Method:</strong> ${order.paymentMethod || "N/A"}</p>
    <p><strong>Status:</strong> <strong style="color:${statusColor[order.status] || 'gray'};">${order.status}</strong></p>
    <p><strong>Shipping:</strong> ${order.shippingAddress?.address || "N/A"}, ${order.shippingAddress?.city || "N/A"}</p>
    <h3>Items:</h3>
    <p>${itemsList}</p>
    <hr/>
    <p style="color:gray;font-size:13px;">Manage this order in the admin dashboard.</p>`;

  return sendEmail(adminEmail, subject, html);
};

// ─── LOW STOCK ADMIN NOTIFICATION ───────────────────────────────────────────────

export const sendLowStockAdminEmail = async (product: {
  name: string;
  sku?: string;
  stock: number;
  lowStockThreshold: number;
}) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️ ADMIN_EMAIL not set. Low stock notification skipped.");
    return;
  }

  const html = layout({
    headerBg: "#fee2e2",
    headerText: "#991b1b",
    body: `
      <div class="body">
        <h2>Low Stock Alert 🔻</h2>
        <p>The following product is running low on stock:</p>
        <div class="box">
          <p><strong>Product:</strong> ${product.name}</p>
          ${product.sku ? `<p><strong>SKU:</strong> ${product.sku}</p>` : ""}
          <p><strong>Current Stock:</strong> ${product.stock}</p>
          <p><strong>Threshold:</strong> ${product.lowStockThreshold}</p>
        </div>
        <p>Please restock this product soon.</p>
      </div>`,
  });

  return sendEmail(
    adminEmail,
    `🔻 Low Stock Alert: ${product.name}`,
    html,
    `Low stock alert for ${product.name}. Current stock: ${product.stock}. Threshold: ${product.lowStockThreshold}.`,
  );
};

export const sendOutOfStockAdminEmail = async (product: {
  name: string;
  sku?: string;
  stock: number;
}) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️ ADMIN_EMAIL not set. Out of stock notification skipped.");
    return;
  }

  const html = layout({
    headerBg: "#ef4444",
    headerText: "#ffffff",
    body: `
      <div class="body">
        <h2>Out of Stock Alert 🚫</h2>
        <p>The following product is completely out of stock:</p>
        <div class="box">
          <p><strong>Product:</strong> ${product.name}</p>
          ${product.sku ? `<p><strong>SKU:</strong> ${product.sku}</p>` : ""}
          <p><strong>Current Stock:</strong> 0</p>
        </div>
        <p>This product is no longer available for purchase. Please restock urgently.</p>
      </div>`,
  });

  return sendEmail(
    adminEmail,
    `🚫 Out of Stock: ${product.name}`,
    html,
    `Out of stock alert for ${product.name}. Current stock: 0.`,
  );
};

export const sendContactNotification = async (contact: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️ ADMIN_EMAIL not set. Contact notification skipped.");
    return;
  }

  const html = layout({
    headerBg: "#dbeafe",
    headerText: "#1e40af",
    body: `
      <div class="body">
        <h2>New Contact Message 📩</h2>
        <div class="box">
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          ${contact.subject ? `<p><strong>Subject:</strong> ${contact.subject}</p>` : ""}
        </div>
        <p><strong>Message:</strong></p>
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:20px 0;">
          <p style="white-space:pre-wrap;">${contact.message}</p>
        </div>
        <p>Reply directly to the sender or manage messages in the admin dashboard.</p>
      </div>`,
  });

  return sendEmail(
    adminEmail,
    `📩 New Contact: ${contact.subject || "No Subject"} from ${contact.name}`,
    html,
    `New contact message from ${contact.name} (${contact.email}): ${contact.message}`
  );
};

export const sendAbandonedCartEmail = async (
  email: string,
  name: string | undefined,
  cart: any
) => {
  interface AbandonedCartItem {
    qty: number;
    price: number;
    product?: {
      name?: string;
      price?: number;
    };
  }

  const cartItems = (cart.items as AbandonedCartItem[]) || [];

  const itemsHtml = cartItems
    .map((item) => {
      const productName = item.product?.name || "Product";
      const total = (item.price * item.qty).toLocaleString();
      return `<p style="margin:6px 0;">• ${item.qty}× ${productName} – ₦${total}</p>`;
    })
    .join("");

  const checkoutUrl = `${CLIENT_URL}/checkout`;

  const html = layout({
    headerBg: "#fef3c7",
    body: `
      <div class="body" style="text-align:center;">
        <h2>You left something behind 🛒</h2>
        <p>Hi ${name || "there"}, we noticed you added items to your cart but didn't complete your order.</p>
        <div class="box" style="text-align:left; margin:20px 0;">
          ${itemsHtml}
        </div>
        <a href="${checkoutUrl}" class="btn" style="background:#e8622a;color:#fff;box-shadow:0 4px 12px rgba(232,98,42,.3);">Complete Your Purchase</a>
        <p style="margin-top:24px;font-size:14px;color:#718096;">Your cart is saved for a limited time. Prices and availability may change.</p>
      </div>`,
  });

  return sendEmail(
    email,
    "Don't forget about your cart 🛒",
    html,
    `Hi ${name || "there"}, you left items in your cart. Complete your purchase now: ${checkoutUrl}`
  );
};