/**
 * Central placeholder configuration.
 *
 * All components should use `getImageWithFallback()` or `PLACEHOLDER_IMAGE`
 * instead of hardcoding a placeholder URL. Changing the asset here updates
 * it everywhere.
 */

/** Path to the local placeholder image (served from /public). */
export const PLACEHOLDER_IMAGE = "/placeholder.png";

/**
 * Returns the given image URL, or the local placeholder if the URL is
 * empty, undefined, or null.
 *
 * @param url  The image URL from the API (may be undefined).
 * @returns    A safe image URL to use in `<img src>`.
 */
export const getImageWithFallback = (
  url?: string | null,
): string => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return PLACEHOLDER_IMAGE;
  }
  return url;
};