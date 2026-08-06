// backend/src/services/marketingEmail.service.ts
import { User } from '../models/User';
import { Settings } from '../models/Settings';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.MARKETING_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || 'store@sholex.com';
const SENDER_NAME = process.env.MARKETING_SENDER_NAME || process.env.BREVO_SENDER_NAME || 'Sholex';
const CLIENT_URL = process.env.CLIENT_URL || 'https://sholex.vercel.app';

// ---------- Shared SVG logo for all marketing emails ----------
const LOGO_SVG = `
<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8622a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:8px;">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
  <polyline points="9 22 9 12 15 12 15 22"></polyline>
</svg>`;

const LOGO_HEADER = (storeName: string, extraStyle = '') => `
<div style="text-align:center;padding:30px 20px;${extraStyle}">
  ${LOGO_SVG}
  <h1 style="margin:10px 0 0;font-size:24px;letter-spacing:-0.5px;display:inline-block;vertical-align:middle;">
    Sholex<span style="color:#e8622a;">Store</span>
  </h1>
</div>`;

// ---------- Helper: get store name from settings ----------
let cachedStoreName: string | null = null;
const getStoreName = async (): Promise<string> => {
  if (cachedStoreName) return cachedStoreName;
  try {
    const settings = await Settings.findOne();
    const rawTitle = settings?.heroTitle || '';
    cachedStoreName = rawTitle.replace(/\|/g, '').trim() || 'Sholex';
  } catch {
    cachedStoreName = 'Sholex';
  }
  return cachedStoreName;
};

// ---------- Send email via Brevo ----------
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
        headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: SENDER_NAME, email: SENDER_EMAIL },
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

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

// ---------- Get all user emails ----------
export const getAllUserEmails = async (): Promise<{ email: string; name?: string }[]> => {
  const users = await User.find({ role: 'user' }, { email: 1, name: 1, _id: 0 }).lean();
  return users as { email: string; name?: string }[];
};

// ─── Welcome Email ──────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (recipient: { email: string; name?: string }, couponCode?: string) => {
  const storeName = await getStoreName();
  const firstName = recipient.name?.split(' ')[0] || 'there';
  const code = couponCode || 'WELCOME10';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f7f6}.wrap{padding:20px;background:#f4f7f6}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.05)}.content{padding:40px 30px;text-align:center}.content h2{color:#2d3748;font-size:22px}.content p{color:#4a5568;line-height:1.6;font-size:16px}.code{background:#fff5f0;border:2px dashed #e8622a;padding:12px 24px;font-size:20px;font-weight:700;color:#e8622a;letter-spacing:2px;display:inline-block;border-radius:12px;margin:10px 0}.btn{display:inline-block;background:#e8622a;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:16px;margin:8px;box-shadow:0 4px 12px rgba(232,98,42,.3)}.ftr{background:#f9fafb;padding:20px;text-align:center;color:#a0aec0;font-size:13px;border-top:1px solid #e2e8f0}.ftr a{color:#e8622a;text-decoration:none}</style></head>
    <body><div class="wrap"><div class="card">
      <div style="background:linear-gradient(135deg,#e8622a,#f59e0b);text-align:center;padding:35px 20px;">
        ${LOGO_SVG}
        <h1 style="margin:8px 0 0;color:#fff;font-size:26px;display:inline-block;vertical-align:middle;">Welcome!</h1>
      </div>
      <div class="content">
        <h2>Hey ${firstName}!</h2>
        <p>Thanks for joining ${storeName}. We're excited to have you! Explore our collection of quality products with fast delivery across Nigeria.</p>
        <p>Use code:</p><div class="code">${code}</div><p>for 10% off your first order!</p>
        <a href="${CLIENT_URL}/shop" class="btn">Start Shopping</a>
        <a href="${CLIENT_URL}/account" class="btn" style="background:#fff;color:#e8622a;border:2px solid #e8622a;">My Account</a>
      </div>
      <div class="ftr">&copy; ${new Date().getFullYear()} ${storeName}.<br><a href="${CLIENT_URL}">Visit our store</a></div>
    </div></div></body></html>`;

  await sendBrevoEmail([recipient.email], `Welcome to ${storeName}, ${firstName}! 🎉`, html);
};

// ─── Abandoned Cart Recovery ────────────────────────────────────────────────
export const sendAbandonedCartEmail = async (
  recipient: { email: string; name?: string },
  cartItems: Array<{ name: string; price: number; qty: number; image: string }>,
  cartTotal: number,
) => {
  const storeName = await getStoreName();
  const firstName = recipient.name?.split(' ')[0] || 'there';

  const itemsHtml = cartItems.map(item => `
    <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;"><img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;"></td>
    <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#2d3748;">${item.name}</td>
    <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#4a5568;">${item.qty}x</td>
    <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#2d3748;font-weight:600;">₦${(item.price * item.qty).toLocaleString()}</td></tr>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f7f6}.wrap{padding:20px;background:#f4f7f6}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.05)}.content{padding:30px 20px}.content p{color:#4a5568;line-height:1.6}table{width:100%;border-collapse:collapse;margin:20px 0}.total{font-size:20px;font-weight:700;color:#e8622a;text-align:right;padding:15px}.btn{display:block;background:#e8622a;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:16px;text-align:center;margin:20px 0;box-shadow:0 4px 12px rgba(232,98,42,.3)}.ftr{background:#f9fafb;padding:20px;text-align:center;color:#a0aec0;font-size:13px;border-top:1px solid #e2e8f0}.ftr a{color:#e8622a;text-decoration:none}</style></head>
    <body><div class="wrap"><div class="card">
      ${LOGO_HEADER(storeName, 'background:#fff5f0;border-bottom:3px solid #e8622a;')}
      <div class="content">
        <p>Hey ${firstName}, your cart is waiting for you at ${storeName}.</p>
        <table>${itemsHtml}</table><div class="total">Total: ₦${cartTotal.toLocaleString()}</div>
        <a href="${CLIENT_URL}/cart" class="btn">Complete Your Order</a>
      </div>
      <div class="ftr">&copy; ${new Date().getFullYear()} ${storeName}.<br><a href="${CLIENT_URL}">Visit our store</a></div>
    </div></div></body></html>`;

  await sendBrevoEmail([recipient.email], `🛒 Don't forget your items, ${firstName}!`, html);
};

// ─── Promotional Campaign ────────────────────────────────────────────────────
export const sendPromoEmail = async (
  recipients: { email: string; name?: string }[],
  promoCode: string, discountPercent: number, minOrder: number, expiryDate: string,
) => {
  const emails = recipients.map(r => r.email);
  const storeName = await getStoreName();

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f7f6}.wrap{padding:20px;background:#f4f7f6}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.05)}.content{padding:40px 30px;text-align:center}.discount{font-size:48px;font-weight:800;color:#e8622a;margin:10px 0}.code{background:#fff5f0;border:2px dashed #e8622a;padding:15px 30px;font-size:24px;font-weight:700;color:#e8622a;letter-spacing:3px;display:inline-block;border-radius:12px;margin:15px 0}.btn{display:inline-block;background:#e8622a;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(232,98,42,.3)}.expiry{color:#e53e3e;font-size:13px;margin-top:15px}.ftr{background:#f9fafb;padding:20px;text-align:center;color:#a0aec0;font-size:13px;border-top:1px solid #e2e8f0}.ftr a{color:#e8622a;text-decoration:none}</style></head>
    <body><div class="wrap"><div class="card">
      <div style="background:linear-gradient(135deg,#e8622a,#f59e0b);text-align:center;padding:35px 20px;">
        ${LOGO_SVG}
        <h1 style="margin:8px 0 0;color:#fff;font-size:26px;display:inline-block;vertical-align:middle;">Special Offer!</h1>
      </div>
      <div class="content">
        <div class="discount">${discountPercent}% OFF</div>
        <p style="color:#4a5568;">On orders over ₦${minOrder.toLocaleString()}</p>
        <div class="code">${promoCode}</div>
        <p style="color:#4a5568;margin-top:15px;">Use this code at checkout</p>
        <a href="${CLIENT_URL}/shop" class="btn">Shop Now</a>
        <p class="expiry">⏰ Expires ${expiryDate}</p>
      </div>
      <div class="ftr">&copy; ${new Date().getFullYear()} ${storeName}.<br><a href="${CLIENT_URL}">Visit our store</a><p style="font-size:12px;margin-top:8px;"><a href="${CLIENT_URL}/unsubscribe">Unsubscribe</a></p></div>
    </div></div></body></html>`;

  await sendBrevoEmail(emails, `🎁 ${discountPercent}% Off – Use code ${promoCode}`, html);
};

// ─── New Arrival Announcement ────────────────────────────────────────────────
export const sendNewArrivalEmail = async (
  recipients: { email: string; name?: string }[],
  productName: string, productImage: string, productUrl: string, description?: string,
) => {
  const emails = recipients.map(r => r.email);
  const storeName = await getStoreName();

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f7f6}.wrap{padding:20px;background:#f4f7f6}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.05)}.content{padding:40px 30px;text-align:center}.content h2{color:#2d3748;font-size:22px;margin-top:0}.product-img{width:200px;border-radius:12px;margin:20px 0;box-shadow:0 4px 12px rgba(0,0,0,.1)}.btn{display:inline-block;background:#e8622a;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(232,98,42,.3)}.ftr{background:#f9fafb;padding:20px;text-align:center;color:#a0aec0;font-size:13px;border-top:1px solid #e2e8f0}.ftr a{color:#e8622a;text-decoration:none}@media(max-width:480px){.content{padding:30px 20px}}</style></head>
    <body><div class="wrap"><div class="card">
      ${LOGO_HEADER(storeName, 'background:#ffd6d6;')}
      <div class="content">
        <h2>🆕 New Arrival!</h2>
        <img src="${productImage}" alt="${productName}" class="product-img"/>
        <h3>${productName}</h3>
        ${description ? `<p style="color:#4a5568;line-height:1.6;">${description}</p>` : ''}
        <a href="${productUrl}" class="btn">View Product</a>
      </div>
      <div class="ftr">&copy; ${new Date().getFullYear()} ${storeName}.<br><a href="${CLIENT_URL}">Visit our store</a><p style="font-size:12px;margin-top:8px;"><a href="${CLIENT_URL}/unsubscribe">Unsubscribe</a></p></div>
    </div></div></body></html>`;

  await sendBrevoEmail(emails, `🔥 New Arrival: ${productName}`, html);
};

// ─── Back‑in‑Stock Notification ──────────────────────────────────────────────
export const sendBackInStockEmail = async (
  recipients: { email: string; name?: string }[],
  productName: string, productImage: string, productUrl: string,
) => {
  const emails = recipients.map(r => r.email);
  const storeName = await getStoreName();

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f4f7f6}.wrap{padding:20px;background:#f4f7f6}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.05)}.content{padding:40px 30px;text-align:center}.content h2{color:#2d3748;font-size:22px;margin-top:0}.product-img{width:200px;border-radius:12px;margin:20px 0;box-shadow:0 4px 12px rgba(0,0,0,.1)}.btn{display:inline-block;background:#e8622a;color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(232,98,42,.3)}.ftr{background:#f9fafb;padding:20px;text-align:center;color:#a0aec0;font-size:13px;border-top:1px solid #e2e8f0}.ftr a{color:#e8622a;text-decoration:none}@media(max-width:480px){.content{padding:30px 20px}}</style></head>
    <body><div class="wrap"><div class="card">
      ${LOGO_HEADER(storeName, 'background:#dff2e6;')}
      <div class="content">
        <h2>⚡ Back in Stock!</h2>
        <img src="${productImage}" alt="${productName}" class="product-img"/>
        <p>Great news! <strong>${productName}</strong> is now available again. Grab yours before it runs out!</p>
        <a href="${productUrl}" class="btn">View Product</a>
      </div>
      <div class="ftr">&copy; ${new Date().getFullYear()} ${storeName}.<br><a href="${CLIENT_URL}">Visit our store</a><p style="font-size:12px;margin-top:8px;"><a href="${CLIENT_URL}/unsubscribe">Unsubscribe</a></p></div>
    </div></div></body></html>`;

  await sendBrevoEmail(emails, `⚡ ${productName} is back in stock!`, html);
};