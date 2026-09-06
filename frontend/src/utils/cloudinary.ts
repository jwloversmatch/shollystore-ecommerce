/**
 * Generate an optimised Cloudinary URL.
 *
 * By default, the image is resized to fit inside a square canvas,
 * padded with white background so no part is cropped.
 * Set `square = false` to keep the original aspect ratio.
 *
 * @param baseUrl  - The original Cloudinary image URL.
 * @param width    - Desired width in pixels.
 * @param square   - If true (default), image fits in a square with padding.
 *                   If false, keeps original ratio.
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
    // Fit inside square, pad with white background, no cropping.
    transformation = `w_${width},h_${width},c_pad,b_white,f_auto,q_auto,dpr_auto`;
  } else {
    transformation = `w_${width},f_auto,q_auto,dpr_auto`;
  }

  return `${parts[0]}/upload/${transformation}/${parts[1]}`;
};