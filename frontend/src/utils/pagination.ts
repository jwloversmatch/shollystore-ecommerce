/**
 * Returns an array containing page numbers and 'ellipsis' markers.
 * Always shows first and last pages, plus a window around the current page.
 */
export const getVisiblePages = (
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): (number | "ellipsis")[] => {
  const totalNumbers = siblingCount * 2 + 3; // current + siblings + first + last
  const totalBlocks = totalNumbers + 2; // +2 for potential ellipsis

  // If total pages is small, show all pages without ellipsis
  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 2;

  const pages: (number | "ellipsis")[] = [];

  // Always show first page
  pages.push(1);

  // Left ellipsis
  if (shouldShowLeftEllipsis) {
    pages.push("ellipsis");
  }

  // Pages from leftSiblingIndex to rightSiblingIndex
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    pages.push(i);
  }

  // Right ellipsis
  if (shouldShowRightEllipsis) {
    pages.push("ellipsis");
  }

  // Always show last page (only if > 1)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};