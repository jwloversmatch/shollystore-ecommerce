/**
 * Generate an optimised Cloudinary URL with the given width.
 * Automatically converts to the best format (WebP/AVIF) and
 * uses automatic quality compression.
 *
 * @param baseUrl  
 * @param width   
 * @returns        
 *                 
 */
export const getCloudinaryUrl = (baseUrl: string, width: number): string => {
  // Only transform Cloudinary URLs
  if (!baseUrl.includes('cloudinary.com')) return baseUrl;

  // Insert transformation parameters after '/upload/'
  const parts = baseUrl.split('/upload/');
  return `${parts[0]}/upload/w_${width},f_auto,q_auto/${parts[1]}`;
};