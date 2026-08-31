export const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

export const isLagos = (city: string): boolean => /\blagos\b/.test(normalize(city));

export const isNigeria = (country: string): boolean => {
  const n = normalize(country);
  return ['nigeria', 'ng', 'nga', 'nigerian'].includes(n);
};

export const calculateShippingFee = (shippingAddress: { city?: string; country?: string }): number => {
  const city = shippingAddress.city || '';
  const country = shippingAddress.country || '';
  if (isNigeria(country)) {
    return isLagos(city) ? 2500 : 4000;
  }
  return 30000;
};