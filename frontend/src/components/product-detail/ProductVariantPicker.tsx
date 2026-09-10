import { Check } from "lucide-react";
import { ACCENT } from "./constants";

const colorMap: Record<string, string> = {
  black: "#0f0f0f",
  white: "#f5f5f5",
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  pink: "#ec4899",
  purple: "#9333ea",
  orange: "#f97316",
  yellow: "#eab308",
  gray: "#6b7280",
  brown: "#78350f",
  navy: "#1e3a8a",
  beige: "#d4c5a9",
  gold: "#f59e0b",
  silver: "#c0c0c0",
};

const getColorHex = (name: string): string | null => {
  const lower = name.trim().toLowerCase();
  return colorMap[lower] || null;
};

interface ProductVariantPickerProps {
  variantSizes: string[];
  colorsToShow: string[];
  selectedSize: string | null;
  selectedColor: string | null;
  onSelectSize: (size: string) => void;
  onSelectColor: (color: string) => void;
}

const ProductVariantPicker = ({
  variantSizes,
  colorsToShow,
  selectedSize,
  selectedColor,
  onSelectSize,
  onSelectColor,
}: ProductVariantPickerProps) => {
  if (variantSizes.length === 0 && colorsToShow.length === 0) return null;

  return (
    <div className="space-y-4">
      {variantSizes.length > 0 && (
        <fieldset className="border-0 m-0 p-0">
          <legend className="text-xs font-bold text-gray-500 mb-2">
            Size
          </legend>
          <div className="flex gap-2 flex-wrap">
            {variantSizes.map((size) => (
              <button
                key={size}
                onClick={() => onSelectSize(size)}
                aria-pressed={selectedSize === size}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  selectedSize === size
                    ? "bg-[#e8622a] text-white border-[#e8622a]"
                    : "bg-gray-100 dark:bg-[#1F2123] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.08]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {colorsToShow.length > 0 && (
        <fieldset className="border-0 m-0 p-0">
          <legend className="text-xs font-bold text-gray-500 mb-2">
            Color: {selectedColor || "None selected"}
          </legend>
          <div className="flex gap-3 flex-wrap">
            {colorsToShow.map((color) => {
              const hex = getColorHex(color);
              return (
                <button
                  key={color}
                  onClick={() => onSelectColor(color)}
                  aria-label={`Select color ${color}${selectedColor === color ? ", currently selected" : ""}`}
                  aria-pressed={selectedColor === color}
                  className="relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110 focus:outline-none flex items-center justify-center"
                  style={{
                    backgroundColor: hex || "#e5e7eb",
                    borderColor:
                      selectedColor === color
                        ? ACCENT
                        : "rgba(255,255,255,0.15)",
                    boxShadow:
                      selectedColor === color
                        ? `0 0 0 3px ${ACCENT}40`
                        : "none",
                    color:
                      hex &&
                      ["white", "#f5f5f5", "#c0c0c0", "#d4c5a9"].includes(hex)
                        ? "#111"
                        : "#fff",
                  }}
                >
                  {!hex && (
                    <span className="text-xs font-black uppercase text-gray-800 dark:text-white">
                      {color.charAt(0)}
                    </span>
                  )}
                  {selectedColor === color && (
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#e8622a]" />
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
};

export default ProductVariantPicker;
