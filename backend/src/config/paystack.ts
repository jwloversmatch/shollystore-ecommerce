// config/paystack.ts
import { PaystackService, PaystackConfig } from '../services/paystack.service';

function buildPaystackConfig(): PaystackConfig {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const clientUrl = process.env.CLIENT_URL;

  if (!secretKey) {
    throw new Error('❌ PAYSTACK_SECRET_KEY is required');
  }
  if (!clientUrl) {
    throw new Error('❌ CLIENT_URL is required (used for payment callback)');
  }

  return {
    secretKey,
    clientUrl,
    baseUrl: process.env.PAYSTACK_BASE_URL,
    timeoutMs: process.env.PAYSTACK_TIMEOUT ? Number(process.env.PAYSTACK_TIMEOUT) : undefined,
  };
}

export const paystack = new PaystackService(buildPaystackConfig());

export { PaystackError, ValidationError } from '../services/paystack.service';