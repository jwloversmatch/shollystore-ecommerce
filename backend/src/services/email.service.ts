import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("🔑 BREVO_API_KEY loaded:", !!process.env.BREVO_API_KEY);
console.log(
  "🔑 Key starts with:",
  process.env.BREVO_API_KEY?.substring(0, 10) + "...",
);

const BREVO_API_KEY  = process.env.BREVO_API_KEY;
const SENDER_EMAIL   = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME    = process.env.BREVO_SENDER_NAME;
const CLIENT_URL     = process.env.CLIENT_URL;

if (!BREVO_API_KEY) {
  console.warn("⚠️ BREVO_API_KEY is missing. Emails will be logged to console only.");
}

type SendEmailResult = {
  success:    boolean;
  messageId?: string;
  error?:     any;
  simulated?: boolean;
};

// ─── Core sender ──────────────────────────────────────────────────────────────

const sendEmail = async (
  to:           string,
  subject:      string,
  htmlContent:  string,
  textContent?: string,
): Promise<SendEmailResult> => {
  if (!BREVO_API_KEY) {
    console.log("📧 Email (not sent – API key missing):");
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  HTML preview: ${htmlContent.substring(0, 200)}...`);
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name:  SENDER_NAME  || "ShollyStore",
          email: SENDER_EMAIL || "noreply@shollystore.com",
        },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent: textContent || stripHtml(htmlContent),
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as any;
      throw new Error(errorData.message || `Brevo API returned status ${response.status}`);
    }

    const data = (await response.json()) as any;
    console.log(`✅ Email sent to ${to}: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error("❌ Brevo email error:", error.message);
    return { success: false, error: error.message };
  }
};

const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// ─── Shared layout wrapper ────────────────────────────────────────────────────

interface LayoutOptions {
  headerBg:  string;
  headerText?: string;
  body:      string;
}

const layout = ({ headerBg, headerText = '#2d3748', body }: LayoutOptions) => `
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
    .hdr h1 { margin:0; color:${headerText}; font-size:28px; letter-spacing:-.5px; }
    .hdr .accent { color:#e8622a; }
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
        <h1>Sholly<span class="accent">Store</span></h1>
      </div>
      ${body}
      <div class="ftr">
        &copy; ${new Date().getFullYear()} ShollyStore. All rights reserved.<br>
        <a href="${CLIENT_URL}">Visit our store</a>
      </div>
    </div>
  </div>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH EMAILS
// ═══════════════════════════════════════════════════════════════════════════════

export const sendVerificationEmail = async (
  email: string,
  token: string,
  name?: string,
) => {
  const url = `${CLIENT_URL}/verify-email?token=${token}`;
  const greeting = name ? `Hi <strong>${name}</strong>, welcome to ShollyStore! 🛍️` : `Welcome to ShollyStore! 🛍️`;

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
    "Welcome to ShollyStore – Verify Your Email",
    html,
    `Welcome to ShollyStore! Verify your email: ${url}`,
  );
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const url = `${CLIENT_URL}/reset-password?token=${token}`;

  const html = layout({
    headerBg: '#fef3c7',
    body: `
      <div class="body" style="text-align:center;">
        <h2>Reset Your Password 🔐</h2>
        <p>We received a request to reset the password for your ShollyStore account. Click the button below to choose a new password.</p>
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
    "Password Reset Request – ShollyStore",
    html,
    `Reset your ShollyStore password (expires in 1 hour): ${url}`,
  );
};

export const sendPasswordChangedEmail = async (email: string, name?: string) => {
  const greeting = name ? `Hi <strong>${name}</strong>,` : "Hi there,";

  const html = layout({
    headerBg: '#fee2e2',
    body: `
      <div class="body" style="text-align:center;">
        <h2>Your Password Was Changed ✅</h2>
        <p>${greeting} your ShollyStore account password was recently updated.</p>
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
    "Your Password Has Been Changed – ShollyStore",
    html,
    `Your ShollyStore password was changed. If you didn't do this, reset your password immediately at ${CLIENT_URL}/forgot-password`,
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
        <p>A request was made to change the email address on a ShollyStore account to <strong>${newEmail}</strong>.</p>
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
    "Confirm Your New Email Address – ShollyStore",
    html,
    `Confirm your new ShollyStore email address (expires in 24 hours): ${url}`,
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER EMAILS
// ═══════════════════════════════════════════════════════════════════════════════

export const sendOrderConfirmation = async (
  email:      string,
  orderId:    string,
  total:      number,
  name?:      string,
  discount?:  number,
  couponCode?: string,
  subtotal?:  number,
) => {
  const greeting = name ? `Thank you, <strong>${name}</strong>! 🎉` : `Order Confirmed! 🎉`;

  const discountLine = discount && couponCode
    ? `<p style="margin:4px 0;color:#4a5568;"><strong>Discount (${couponCode})</strong> &minus; ₦${discount.toLocaleString()}</p>`
    : '';
  const subtotalLine = subtotal && subtotal !== total
    ? `<p style="margin:8px 0;color:#4a5568;"><strong>Subtotal</strong> ₦${subtotal.toLocaleString()}</p>`
    : '';

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
          <p><strong>Total</strong> <span style="font-size:24px;font-weight:700;color:#e8622a;">₦${total.toLocaleString()}</span></p>
        </div>
        <p>You'll receive a shipping notification once your order is on its way.</p>
      </div>`,
  });

  return sendEmail(
    email,
    "Order Confirmation – ShollyStore",
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
    "Your Order Has Been Shipped – ShollyStore",
    html,
    `Your ShollyStore order #${orderId} has shipped!`,
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
    "Order Delivered – ShollyStore",
    html,
    `Your ShollyStore order #${orderId} has been delivered. Enjoy! 🛍️`,
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
    `Your ShollyStore order #${orderId} is now ${status}. Total: ₦${total.toLocaleString()}.`,
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN NOTIFICATION
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

  let userEmail = order.user?.email || "N/A";
  let userName  = order.name || order.user?.name || "";
  let userPhone = order.phone || order.user?.phone || "";

  if (!order.user?.email && order.user) {
    try {
      const { User } = await import("../models/User");
      const user = await User.findById(order.user);
      userEmail = user?.email  || "N/A";
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