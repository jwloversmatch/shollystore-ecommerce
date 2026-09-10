interface CloudinaryOptions {
  /**
   * Optional max height. When provided, the image is constrained to fit
   * inside a `width × height` box using Cloudinary's `c_limit` mode —
   * which preserves aspect ratio and never enlarges beyond the original.
   */
  height?: number;
}

/**
 * Generate an optimised Cloudinary URL.
 *
 * Transformations applied:
 *   - w_<width>              → target width (CSS pixels; srcSet handles DPR)
 *   - h_<height>,c_limit     → optional: fit inside w × h, no upscale, no crop
 *   - f_auto                 → auto WebP/AVIF when supported
 *   - q_auto                 → adaptive quality
 *
 * Note: `dpr_auto` is intentionally NOT used here because the `<img srcSet>`
 * in components already supplies 1× and 2× candidates — combining both
 * causes the browser to double‑size images (Lighthouse "Improve image delivery").
 *
 * @param baseUrl  Original Cloudinary URL (or any URL — non‑Cloudinary is returned as‑is).
 * @param width    Target width in CSS pixels.
 * @param options  Optional config. Pass `{ height }` for a bounded fit.
 * @returns        Optimised Cloudinary URL.
 */
export const getCloudinaryUrl = (
  baseUrl: string,
  width: number,
  options: CloudinaryOptions = {},
): string => {
  if (!baseUrl.includes("cloudinary.com")) return baseUrl;

  const { height } = options;
  const parts = baseUrl.split("/upload/");

  let transformation = `w_${width}`;
  if (height) {
    transformation += `,h_${height},c_limit`;
  }
  transformation += `,f_auto,q_auto`;

  return `${parts[0]}/upload/${transformation}/${parts[1]}`;
};