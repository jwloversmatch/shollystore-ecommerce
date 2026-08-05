  /** Strip HTML tags and trim whitespace from string inputs */
  export const stripHtml = (input: string): string =>
    input.replace(/<[^>]*>/g, '').trim();

  export const sanitizeString = (input: unknown, maxLength = 1000): string => {
    if (typeof input !== 'string') return '';
    return stripHtml(input).slice(0, maxLength);
  };
