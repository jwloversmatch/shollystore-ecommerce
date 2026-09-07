import { useMemo, useState } from "react";
import type { ProductItem } from "../types/home";

interface LocalVariant {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  stock?: number;
  compareAtPrice?: number;
}

export function useProductVariants(product: ProductItem | undefined) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const variants: LocalVariant[] = useMemo(
    () => product?.variants || [],
    [product?.variants],
  );
  const hasVariants = variants.length > 0;

  const variantSizes = useMemo(() => {
    const sizes = new Set<string>();
    variants.forEach((v) => {
      if (v.size?.trim()) sizes.add(v.size.trim());
    });
    return Array.from(sizes);
  }, [variants]);

  const availableColors = useMemo(() => {
    if (!selectedSize) return [];
    return variants
      .filter((v) => v.size?.trim() === selectedSize && v.color?.trim())
      .map((v) => v.color!.trim())
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [selectedSize, variants]);

  const colorOnlyList = useMemo(() => {
    return variants
      .filter((v) => !v.size?.trim() && v.color?.trim())
      .map((v) => v.color!.trim())
      .filter((v, i, a) => a.indexOf(v) === i);
  }, [variants]);

  const colorsToShow = selectedSize ? availableColors : colorOnlyList;

  const activeVariant = useMemo(() => {
    if (!hasVariants || !selectedColor) return null;
    if (selectedSize) {
      const match = variants.find(
        (v) =>
          v.size?.trim() === selectedSize &&
          v.color?.trim().toLowerCase() === selectedColor.toLowerCase(),
      );
      if (match) return match;
    }
    return (
      variants.find(
        (v) =>
          !v.size?.trim() &&
          v.color?.trim().toLowerCase() === selectedColor.toLowerCase(),
      ) || null
    );
  }, [hasVariants, selectedSize, selectedColor, variants]);

  const displayPrice = activeVariant?.price ?? product?.price ?? 0;
  const displayStock = activeVariant?.stock ?? product?.stock ?? 0;
  const isOutOfStock = displayStock === 0;
  const displayCompareAtPrice: number | undefined =
    activeVariant?.compareAtPrice ?? product?.compareAtPrice ?? undefined;
  const hasSalePrice = !!(
    displayCompareAtPrice && displayCompareAtPrice > displayPrice
  );

  // Exact same logic as the original inline onClick handler — toggles the
  // size off if re-clicked, and clears the selected color only if it isn't
  // valid for the newly chosen size.
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size === selectedSize ? null : size);
    setSelectedColor((prev) => {
      if (size !== selectedSize) {
        return prev &&
          variants.some(
            (v) =>
              v.size?.trim() === size &&
              v.color?.trim().toLowerCase() === prev.toLowerCase(),
          )
          ? prev
          : null;
      }
      return prev;
    });
  };

  return {
    variants,
    hasVariants,
    variantSizes,
    colorsToShow,
    selectedSize,
    selectedColor,
    setSelectedColor,
    handleSizeSelect,
    activeVariant,
    displayPrice,
    displayStock,
    isOutOfStock,
    displayCompareAtPrice,
    hasSalePrice,
  };
}
