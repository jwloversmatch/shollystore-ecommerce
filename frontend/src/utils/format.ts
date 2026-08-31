// Formatting helpers used across the app

export const formatPrice = (
  value: number,
  options?: { compact?: boolean },
): { short: string; full: string } => {
  const full = `₦${value.toLocaleString()}`;
  if (options?.compact && value >= 1_000_000) {
    const millions = value / 1_000_000;
    const short = `₦${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
    return { short, full };
  }
  return { short: full, full };
};

export const formatPaymentMethod = (method?: string): string => {
  switch (method) {
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'whatsapp':
      return 'WhatsApp Pay';
    case 'paystack':
      return 'Paystack';
    default:
      return method || 'N/A';
  }
};

export const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

export const isLagos = (city: string): boolean => /\blagos\b/.test(normalize(city));

export const isNigeria = (country: string): boolean => {
  const n = normalize(country);
  return ['nigeria', 'ng', 'nga', 'nigerian'].includes(n);
};

export const calculateShippingFee = (city: string, country: string = 'Nigeria'): number => {
  if (isNigeria(country)) {
    return isLagos(city) ? 2500 : 4000;
  }
  return 30000;
};