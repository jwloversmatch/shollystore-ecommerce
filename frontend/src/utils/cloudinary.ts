/**
 * Generate an optimised Cloudinary URL.
 *
 * By default, the image is cropped to a square (ideal for product cards)
 * and auto‑enhanced. Set `square = false` to keep the original aspect ratio
 * while still applying quality, format, and sharpness optimisations.
 *
 * @param baseUrl  - The original Cloudinary image URL.
 * @param width    - Desired width in pixels.
 * @param square   - If true (default), crop to square. If false, keep original ratio.
 * @returns        - Optimised Cloudinary URL.
 */
export const getCloudinaryUrl = (
  baseUrl: string,
  width: number,
  square: boolean = true,
): string => {
  if (!baseUrl.includes('cloudinary.com')) return baseUrl;

  const parts = baseUrl.split('/upload/');

  let transformation: string;
  if (square) {
    transformation = `w_${width},h_${width},c_fill,g_auto,f_auto,q_auto,dpr_auto`;
  } else {
    transformation = `w_${width},f_auto,q_auto,dpr_auto`;
  }

  return `${parts[0]}/upload/${transformation}/${parts[1]}`;
};