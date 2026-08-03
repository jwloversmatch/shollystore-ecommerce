const required = ['JWT_SECRET', 'MONGO_URI'] as const;

const recommended = [
  'CLIENT_URL',
  'PAYSTACK_SECRET_KEY',
  'BREVO_API_KEY',
] as const;

export const validateEnv = (): void => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('[SECURITY] JWT_SECRET should be at least 32 characters for production.');
  }

  for (const key of recommended) {
    if (!process.env[key]) {
      console.warn(`[CONFIG] Recommended env var missing: ${key}`);
    }
  }
};
