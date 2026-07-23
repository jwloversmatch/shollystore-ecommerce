// backend/src/services/marketingEmail.service.ts
import { User } from '../models/User';
import { Settings } from '../models/Settings';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.MARKETING_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || 'store@shollystore.com';
const SENDER_NAME = process.env.MARKETING_SENDER_NAME || process.env.BREVO_SENDER_NAME || 'ShollyStore';
const CLIENT_URL = process.env.CLIENT_URL || 'https://shollystore-ecommerce.vercel.app';

// ---------- Helper: get store name from settings (cached in memory for performance) ----------
let cachedStoreName: string | null = null;
const getStoreName = async (): Promise<string> => {
  if (cachedStoreName) return cachedStoreName;

  try {
    const settings = await Settings.findOne();
    const rawTitle = settings?.heroTitle || '';
    cachedStoreName = rawTitle.replace(/\|/g, '').trim() || 'ShollyStore';
  } catch {
    cachedStoreName = 'ShollyStore';
  }
  return cachedStoreName;
};

// ---------- Send email via Brevo (supports multiple recipients) ----------
const sendBrevoEmail = async (
  to: string[],
  subject: string,
  htmlContent: string,
  textContent?: string,
): Promise<void> => {
  if (!BREVO_API_KEY) {
    console.warn('⚠️ BREVO_API_KEY missing. Marketing email will be logged only.');
    console.log(`📧 Marketing to ${to.length} recipients: ${subject}`);
    return;
  }

  const BATCH_SIZE = 100;
  for (let i = 0; i < to.length; i += BATCH_SIZE) {
    const batch = to.slice(i, i + BATCH_SIZE);
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: SENDER_NAME,
            email: SENDER_EMAIL,
          },
          to: batch.map(email => ({ email })),
          subject,
          htmlContent,
          textContent: textContent || stripHtml(htmlContent),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(errorData.message || `Brevo API returned status ${response.status}`);
      }

      const data = (await response.json()) as { messageId?: string };
      console.log(`✅ Marketing batch ${Math.floor(i / BATCH_SIZE) + 1} sent: ${data.messageId}`);
    } catch (error: any) {
      console.error(`❌ Marketing batch failed:`, error.message);
    }
  }
};

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

// ---------- Get all user emails ----------
export const getAllUserEmails = async (): Promise<{ email: string; name?: string }[]> => {
  const users = await User.find(
    { role: 'user' },              
    { email: 1, name: 1, _id: 0 }
  ).lean();
  return users as { email: string; name?: string }[];
};

// ---------- New Arrival Announcement ----------
export const sendNewArrivalEmail = async (
  recipients: { email: string; name?: string }[],
  productName: string,
  productImage: string,
  productUrl: string,
  description?: string,
) => {
  const emails = recipients.map(r => r.email);
  const storeName = await getStoreName();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Arrival!</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #ffd6d6; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #2d3748; font-size: 28px; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { color: #2d3748; font-size: 22px; margin-top: 0; }
        .product-img { width: 200px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .btn { display: inline-block; background-color: #e8622a; color: #ffffff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(232, 98, 42, 0.3); transition: all 0.2s; }
        .btn:hover { background-color: #d1501a; box-shadow: 0 6px 18px rgba(232, 98, 42, 0.4); }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px; border-top: 1px solid #e2e8f0; }
        .footer a { color: #e8622a; text-decoration: none; }
        @media (max-width: 480px) { .content { padding: 30px 20px; } .header h1 { font-size: 24px; } }
      </style>
    </head>
    <body>
      <div style="padding: 20px; background-color: #f4f7f6;">
        <div class="container">
          <div class="header">
            <h1>${storeName}</h1>
          </div>
          <div class="content">
            <h2>🆕 New Arrival!</h2>
            <img src="${productImage}" alt="${productName}" class="product-img" />
            <h3>${productName}</h3>
            ${description ? `<p style="color: #4a5568; line-height: 1.6;">${description}</p>` : ''}
            <a href="${productUrl}" class="btn">View Product</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.<br>
            <a href="${CLIENT_URL}">Visit our store</a>
            <p style="font-size:12px; margin-top:8px;">You received this email because you're a valued customer. <a href="${CLIENT_URL}/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `🔥 New Arrival: ${productName}`;
  const text = `Check out our newest product: ${productName}. View here: ${productUrl}`;
  await sendBrevoEmail(emails, subject, html, text);
};

// ---------- Back‑in‑Stock Notification ----------
export const sendBackInStockEmail = async (
  recipients: { email: string; name?: string }[],
  productName: string,
  productImage: string,
  productUrl: string,
) => {
  const emails = recipients.map(r => r.email);
  const storeName = await getStoreName();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Back in Stock!</title>
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #dff2e6; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; color: #2d3748; font-size: 28px; letter-spacing: -0.5px; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { color: #2d3748; font-size: 22px; margin-top: 0; }
        .product-img { width: 200px; border-radius: 12px; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .btn { display: inline-block; background-color: #e8622a; color: #ffffff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(232, 98, 42, 0.3); transition: all 0.2s; }
        .btn:hover { background-color: #d1501a; box-shadow: 0 6px 18px rgba(232, 98, 42, 0.4); }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #a0aec0; font-size: 13px; border-top: 1px solid #e2e8f0; }
        .footer a { color: #e8622a; text-decoration: none; }
        @media (max-width: 480px) { .content { padding: 30px 20px; } .header h1 { font-size: 24px; } }
      </style>
    </head>
    <body>
      <div style="padding: 20px; background-color: #f4f7f6;">
        <div class="container">
          <div class="header">
            <h1>${storeName}</h1>
          </div>
          <div class="content">
            <h2>⚡ Back in Stock!</h2>
            <img src="${productImage}" alt="${productName}" class="product-img" />
            <p>Great news! <strong>${productName}</strong> is now available again. Grab yours before it runs out!</p>
            <a href="${productUrl}" class="btn">View Product</a>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.<br>
            <a href="${CLIENT_URL}">Visit our store</a>
            <p style="font-size:12px; margin-top:8px;">You received this email because you're a valued customer. <a href="${CLIENT_URL}/unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `⚡ ${productName} is back in stock!`;
  const text = `Great news! ${productName} is available again. Order now: ${productUrl}`;
  await sendBrevoEmail(emails, subject, html, text);
};