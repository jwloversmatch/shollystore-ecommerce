import dotenv from "dotenv";
import path from "path";

// Load .env from the backend root (two levels up from this file)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("🔑 BREVO_API_KEY loaded:", !!process.env.BREVO_API_KEY);
console.log(
  "🔑 Key starts with:",
  process.env.BREVO_API_KEY?.substring(0, 10) + "...",
);

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = process.env.BREVO_SENDER_NAME;
const CLIENT_URL = process.env.CLIENT_URL;

if (!BREVO_API_KEY) {
  console.warn(
    "⚠️ BREVO_API_KEY is missing. Emails will be logged to console only.",
  );
}

type SendEmailResult = {
  success: boolean;
  messageId?: string;
  error?: any;
  simulated?: boolean;
};

const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
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
          name: SENDER_NAME || "LotceWieth Store",
          email: SENDER_EMAIL || "noreply@lotcewieth.com",
        },
        to: [{ email: to }],
        subject,
        htmlContent,
        textContent: textContent || stripHtml(htmlContent),
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as any;
      throw new Error(
        errorData.message || `Brevo API returned status ${response.status}`,
      );
    }

    const data = (await response.json()) as any;
    console.log(`✅ Email sent successfully to ${to}: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error("❌ Brevo email error:", error.message);
    return { success: false, error: error.message };
  }
};

const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// ------------------------------------------------------------------
// PROFESSIONAL EMAIL TEMPLATES
// ------------------------------------------------------------------

export const sendVerificationEmail = async (
  email: string,
  token: string,
  name?: string,
) => {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${token}`;
  const greeting = name
    ? `Hi <strong>${name}</strong>, welcome to LotceWieth! 🌿`
    : `Welcome to LotceWieth! 🌿`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #ffd6d6; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #2d3748; font-size: 28px; letter-spacing: -0.5px; }
        .header span { color: #4a8f29; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { color: #2d3748; font-size: 22px; margin-top: 0; }
        .content p { color: #4a5568; line-height: 1.6; margin-bottom: 30px; }
        .btn { display: inline-block; background-color: #4a8f29; color: #ffffff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(74, 143, 41, 0.3); transition: all 0.2s; }
        .btn:hover { background-color: #3a7a22; box-shadow: 0 6px 18px rgba(74, 143, 41, 0.4); }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px; border-top: 1px solid #e2e8f0; }
        .footer a { color: #4a8f29; text-decoration: none; }
        @media (max-width: 480px) { .content { padding: 30px 20px; } .header h1 { font-size: 24px; } }
      </style>
    </head>
    <body>
      <div style="padding: 20px; background-color: #f4f7f6;">
        <div class="container">
          <div class="header">
            <h1>Lotce<span style="color:#4a8f29;">Wieth</span></h1>
          </div>
          <div class="content">
            <h2>${greeting}</h2>
            <p>Thank you for joining us. We're excited to have you on board!<br>Please verify your email address to complete your registration.</p>
            <a href="${verifyUrl}" class="btn">Verify Email Address</a>
            <p style="margin-top: 25px; font-size: 14px; color: #718096;">If you didn't create an account with us, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; 2025 LotceWieth. All rights reserved.<br>
            <a href="${CLIENT_URL}">Visit our store</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hi${name ? " " + name : ""}, welcome to LotceWieth! Please verify your email address by clicking this link: ${verifyUrl}`;

  return sendEmail(
    email,
    "Welcome to LotceWieth – Verify Your Email",
    html,
    text,
  );
};

// -------------------------------------------------
// UPDATED ORDER EMAILS WITH COUPON BREAKDOWN
// -------------------------------------------------

export const sendOrderConfirmation = async (
  email: string,
  orderId: string,
  total: number,
  name?: string,
  discount?: number,
  couponCode?: string,
  subtotal?: number,
) => {
  const greeting = name
    ? `Thank you, <strong>${name}</strong>! 🎉`
    : `Order Confirmed! 🎉`;

  const discountLine = (discount && couponCode)
    ? `<p style="margin: 4px 0; color: #4a5568;"><strong>Discount (${couponCode})</strong> - ₦${discount.toLocaleString()}</p>`
    : '';

  const subtotalLine = (subtotal && subtotal !== total)
    ? `<p style="margin: 8px 0; color: #4a5568;"><strong>Subtotal</strong> ₦${subtotal.toLocaleString()}</p>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #dff2e6; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #2d3748; font-size: 28px; letter-spacing: -0.5px; }
        .header span { color: #4a8f29; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2d3748; font-size: 22px; margin-top: 0; }
        .order-details { background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .order-details p { margin: 8px 0; color: #4a5568; }
        .order-details strong { color: #2d3748; }
        .order-total { font-size: 24px; font-weight: 700; color: #4a8f29; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px; border-top: 1px solid #e2e8f0; }
        .footer a { color: #4a8f29; text-decoration: none; }
        @media (max-width: 480px) { .content { padding: 30px 20px; } .header h1 { font-size: 24px; } }
      </style>
    </head>
    <body>
      <div style="padding: 20px; background-color: #f4f7f6;">
        <div class="container">
          <div class="header">
            <h1>Lotce<span style="color:#4a8f29;">Wieth</span></h1>
          </div>
          <div class="content">
            <h2>${greeting}</h2>
            <p>Thank you for your purchase! We're preparing your order and will ship it soon.</p>
            <div class="order-details">
              <p><strong>Order #</strong> ${orderId}</p>
              ${subtotalLine}
              ${discountLine}
              <p><strong>Total Amount</strong> <span class="order-total">₦${total.toLocaleString()}</span></p>
            </div>
            <p style="color: #4a5568;">You'll receive a shipping notification once your order is on its way.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LotceWieth. All rights reserved.<br>
            <a href="${CLIENT_URL}">Visit our store</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hi${name ? " " + name : ""}, your order #${orderId} has been confirmed. ${subtotal && subtotal !== total ? `Subtotal: ₦${subtotal.toLocaleString()} ` : ''}${discount && couponCode ? `Discount (${couponCode}): -₦${discount.toLocaleString()} ` : ''}Total: ₦${total.toLocaleString()}. Thank you for your purchase!`;

  return sendEmail(email, "Order Confirmation – LotceWieth", html, text);
};

export const sendOrderShippedEmail = async (
  email: string,
  orderId: string,
  name?: string,
  total?: number,
  discount?: number,
  couponCode?: string,
) => {
  const greeting = name
    ? `Hi <strong>${name}</strong>, your order has been shipped! 🚚`
    : `Your Order Has Been Shipped! 🚚`;

  const discountLine = (discount && couponCode)
    ? `<p style="margin: 4px 0;"><strong>Discount (${couponCode})</strong> - ₦${discount.toLocaleString()}</p>`
    : '';

  const totalLine = total
    ? `<p><strong>Total:</strong> ₦${total.toLocaleString()}</p>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Shipped</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #60a5fa; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 28px; }
        .header span { color: #ffffff; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { color: #2d3748; font-size: 22px; margin-top: 0; }
        .content p { color: #4a5568; line-height: 1.6; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px; border-top: 1px solid #e2e8f0; }
        .footer a { color: #4a8f29; text-decoration: none; }
      </style>
    </head>
    <body>
      <div style="padding: 20px; background-color: #f4f7f6;">
        <div class="container">
          <div class="header">
            <h1>Lotce<span style="color:#ffffff;">Wieth</span></h1>
          </div>
          <div class="content">
            <h2>${greeting}</h2>
            <p>Great news! Your order <strong>#${orderId}</strong> is on its way.</p>
            ${discountLine}
            ${totalLine}
            <p>You'll receive a delivery confirmation once it arrives.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LotceWieth. All rights reserved.<br>
            <a href="${CLIENT_URL}">Visit our store</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `Hi${name ? " " + name : ""}, your order #${orderId} has been shipped! ${discount && couponCode ? `Discount (${couponCode}): -₦${discount.toLocaleString()} ` : ''}${total ? `Total: ₦${total.toLocaleString()}` : ''}`;

  return sendEmail(email, "Your Order Has Been Shipped – LotceWieth", html, text);
};

export const sendOrderDeliveredEmail = async (
  email: string,
  orderId: string,
  name?: string,
  total?: number,
  discount?: number,
  couponCode?: string,
) => {
  const greeting = name
    ? `Thank you, <strong>${name}</strong>! Your order has been delivered ✅`
    : `Order Delivered! ✅`;

  const discountLine = (discount && couponCode)
    ? `<p style="margin: 4px 0;"><strong>Discount (${couponCode})</strong> - ₦${discount.toLocaleString()}</p>`
    : '';

  const totalLine = total
    ? `<p><strong>Total:</strong> ₦${total.toLocaleString()}</p>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #34d399; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 28px; }
        .header span { color: #ffffff; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { color: #2d3748; font-size: 22px; margin-top: 0; }
        .content p { color: #4a5568; line-height: 1.6; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px; border-top: 1px solid #e2e8f0; }
        .footer a { color: #4a8f29; text-decoration: none; }
      </style>
    </head>
    <body>
      <div style="padding: 20px; background-color: #f4f7f6;">
        <div class="container">
          <div class="header">
            <h1>Lotce<span style="color:#ffffff;">Wieth</span></h1>
          </div>
          <div class="content">
            <h2>${greeting}</h2>
            <p>Your order <strong>#${orderId}</strong> has been successfully delivered.</p>
            ${discountLine}
            ${totalLine}
            <p>We hope you enjoy your beverages! 🥤</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LotceWieth. All rights reserved.<br>
            <a href="${CLIENT_URL}">Visit our store</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `Hi${name ? " " + name : ""}, your order #${orderId} has been delivered! ${discount && couponCode ? `Discount (${couponCode}): -₦${discount.toLocaleString()} ` : ''}${total ? `Total: ₦${total.toLocaleString()}` : ''}`;

  return sendEmail(email, "Order Delivered – LotceWieth", html, text);
};

export const sendOrderStatusUpdateEmail = async (
  email: string,
  orderId: string,
  status: string,
  total: number,
  name?: string,
  discount?: number,
  couponCode?: string,
  subtotal?: number,
) => {
  const statusMessages: Record<string, string> = {
    Shipped: name
      ? `Hi ${name}, your order has been shipped! 🚚`
      : `Your order has been shipped! 🚚`,
    Delivered: name
      ? `Hi ${name}, your order has been delivered! ✅`
      : `Your order has been delivered! ✅`,
  };
  const message =
    statusMessages[status] ||
    (name
      ? `Hi ${name}, your order status is now ${status}`
      : `Your order status is now ${status}`);

  const isFinal = status === 'Delivered';

  const discountLine = (discount && couponCode)
    ? `<p style="margin: 8px 0; color: #4a5568;"><strong>Discount (${couponCode})</strong> - ₦${discount.toLocaleString()}</p>`
    : '';

  const subtotalLine = (subtotal && subtotal !== total)
    ? `<p style="margin: 8px 0; color: #4a5568;"><strong>Subtotal</strong> ₦${subtotal.toLocaleString()}</p>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #dff2e6; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #2d3748; font-size: 28px; letter-spacing: -0.5px; }
        .header span { color: #4a8f29; }
        .content { padding: 40px 30px; }
        .content h2 { color: #2d3748; font-size: 22px; margin-top: 0; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 50px; font-weight: bold; font-size: 14px; background: ${
          status === 'Shipped' ? '#3b82f6' : '#34d399'
        }; color: white; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px; border-top: 1px solid #e2e8f0; }
        .footer a { color: #4a8f29; text-decoration: none; }
        @media (max-width: 480px) { .content { padding: 30px 20px; } .header h1 { font-size: 24px; } }
      </style>
    </head>
    <body>
      <div style="padding: 20px; background-color: #f4f7f6;">
        <div class="container">
          <div class="header">
            <h1>Lotce<span style="color:#4a8f29;">Wieth</span></h1>
          </div>
          <div class="content">
            <h2>${message}</h2>
            <p>Your order <strong>#${orderId}</strong> has been updated to:</p>
            <div class="status-badge">${status}</div>
            <div style="margin-top: 20px;">
              ${subtotalLine}
              ${discountLine}
              <p style="margin: 8px 0;"><strong>Total:</strong> ₦${total.toLocaleString()}</p>
            </div>
            ${isFinal ? `<p>Your order has been delivered. Thank you for shopping with us!</p>` : `<p>We'll keep you updated on your order's progress.</p>`}
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LotceWieth. All rights reserved.<br>
            <a href="${CLIENT_URL}">Visit our store</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hi${name ? " " + name : ""}, your order #${orderId} is now ${status}. ${subtotal ? `Subtotal: ₦${subtotal.toLocaleString()} ` : ''}${discount && couponCode ? `Discount (${couponCode}): -₦${discount.toLocaleString()} ` : ''}Total: ₦${total.toLocaleString()}.`;

  return sendEmail(email, `Order #${orderId} – Status Updated`, html, text);
};

// Admin notification – uses order.couponCode and order.discount
export const sendAdminOrderNotification = async (
  order: any,
  action: "created" | "updated",
  newStatus?: string,
) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️ ADMIN_EMAIL not set. Admin notification skipped.");
    return;
  }

  const orderName = order.name || "";
  const orderPhone = order.phone || "";

  let userEmail = order.user?.email || "N/A";
  let userName = orderName || order.user?.name || "";
  let userPhone = orderPhone || order.user?.phone || "";

  if (!order.user?.email && order.user) {
    try {
      const User = (await import("../models/User")).User;
      const user = await User.findById(order.user);
      userEmail = user?.email || "N/A";
      userName = userName || user?.name || "";
      userPhone = userPhone || user?.phone || "";
    } catch (error) {
      console.error("Failed to fetch user for email notification:", error);
    }
  }

  const customerLabel = [userName, userEmail, userPhone ? `📞 ${userPhone}` : ""]
    .filter(Boolean)
    .join(" | ");

  const itemsList = order.orderItems
    .map(
      (item: any) =>
        `${item.qty}x ${item.name} – ₦${(item.price * item.qty).toLocaleString()}`,
    )
    .join("<br/>");

  const subject =
    action === "created"
      ? `🛒 New Order #${order._id} Placed`
      : `🔄 Order #${order._id} Status Updated to ${newStatus || order.status}`;

  const statusColor =
    order.status === "Paid"
      ? "green"
      : order.status === "Pending"
        ? "orange"
        : order.status === "Shipped"
          ? "blue"
          : "gray";

  const couponLine = order.couponCode
    ? `<p><strong>Coupon:</strong> ${order.couponCode} (-₦${(order.discount || 0).toLocaleString()})</p>`
    : "";

  const html = `
    <h2>${subject}</h2>
    <p><strong>Order #:</strong> ${order._id}</p>
    <p><strong>Customer:</strong> ${customerLabel}</p>
    <p><strong>Total:</strong> ₦${order.totalPrice.toLocaleString()}</p>
    ${couponLine}
    <p><strong>Payment Method:</strong> ${order.paymentMethod || "N/A"}</p>
    <p><strong>Current Status:</strong> <strong style="color:${statusColor};">${order.status}</strong></p>
    <p><strong>Shipping Address:</strong><br/>
      ${order.shippingAddress?.address || "N/A"}, 
      ${order.shippingAddress?.city || "N/A"}
    </p>
    <h3>Items:</h3>
    <p>${itemsList}</p>
    <hr/>
    <p style="color:gray;">Manage this order in the admin dashboard.</p>
  `;

  const text = `Order #${order._id} from ${customerLabel}. Status: ${order.status}. Total: ₦${order.totalPrice.toLocaleString()}${order.couponCode ? `. Coupon: ${order.couponCode} (-₦${(order.discount || 0).toLocaleString()})` : ""}`;

  return sendEmail(adminEmail, subject, html, text);
};