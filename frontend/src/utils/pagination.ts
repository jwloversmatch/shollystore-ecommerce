/**
 * Returns an array containing page numbers and 'ellipsis' markers.
 * Always shows first and last pages, plus a window around the current page.
 */
export const getVisiblePages = (
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): (number | "ellipsis")[] => {
  const totalNumbers = siblingCount * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 2;

  const pages: (number | "ellipsis")[] = [];

  pages.push(1);

  if (shouldShowLeftEllipsis) {
    pages.push("ellipsis");
  }

  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    pages.push(i);
  }

  if (shouldShowRightEllipsis) {
    pages.push("ellipsis");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};
