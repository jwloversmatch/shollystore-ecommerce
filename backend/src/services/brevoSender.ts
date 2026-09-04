import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = process.env.BREVO_SENDER_NAME;

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
): Promise<{ messageId?: string }> => {
  if (!BREVO_API_KEY) {
    console.info(`Email simulated → ${to}: ${subject}`);
    return {};
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: SENDER_NAME || "Sholex",
        email: SENDER_EMAIL || "noreply@sholex.com",
      },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent: textContent || htmlContent.replace(/<[^>]*>/g, ""),
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as BrevoErrorResponse;
    throw new Error(
      errorData.message || `Brevo API returned status ${response.status}`,
    );
  }

  const data = (await response.json()) as BrevoSuccessResponse;
  return { messageId: data.messageId };
};