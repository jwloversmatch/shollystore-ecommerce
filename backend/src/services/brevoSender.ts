import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const BREVO_API_KEY = process.env.BREVO_API_KEY;

// ─── Sender identities ────────────────────────────────────────────────────────
// Each email type has its own "From" address, so customers see the right
// context. Reply-To is always support@ so human replies land in the Zoho inbox.
export type SenderType = "noreply" | "orders" | "updates" | "support";

const SENDERS: Record<SenderType, { name: string; email: string }> = {
  noreply: {
    name: "Sholex Store",
    email: "noreply@sholexstore.com",
  },
  orders: {
    name: "Sholex Orders",
    email: "orders@sholexstore.com",
  },
  updates: {
    name: "Sholex Updates",
    email: "updates@sholexstore.com",
  },
  support: {
    name: "Sholex Support",
    email: "support@sholexstore.com",
  },
};

const REPLY_TO = {
  email: "support@sholexstore.com",
  name: "Sholex Support",
};

interface BrevoErrorResponse {
  message?: string;
}

interface BrevoSuccessResponse {
  messageId?: string;
}

export const sendEmailViaBrevo = async (
  to: string,
  subject: string,
  htmlContent: string,
  textContent?: string,
  senderType: SenderType = "noreply",
): Promise<{ messageId?: string }> => {
  if (!BREVO_API_KEY) {
    console.info(`Email simulated → ${to}: ${subject} [${senderType}]`);
    return {};
  }

  const sender = SENDERS[senderType];

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      replyTo: REPLY_TO,
      subject,
      htmlContent,
      textContent: textContent || htmlContent.replace(/<[^>]*>/g, ""),
    }),
  });

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => ({}))) as BrevoErrorResponse;
    throw new Error(
      errorData.message || `Brevo API returned status ${response.status}`,
    );
  }

  const data = (await response.json()) as BrevoSuccessResponse;
  return { messageId: data.messageId };
};