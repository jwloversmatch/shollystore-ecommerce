import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  qty: number;
  maxStock: number;
  onDecrease: () => void;
  onIncrease: () => void;
  size?: "desktop" | "mobile";
}

const QuantityStepper = ({
  qty,
  maxStock,
  onDecrease,
  onIncrease,
  size = "desktop",
}: QuantityStepperProps) => {
  const isDesktop = size === "desktop";
  return (
    <div
      className={`flex items-center rounded-xl overflow-hidden shrink-0 border ${
        isDesktop
          ? "bg-gray-100 dark:bg-[#1F2123] border-gray-200 dark:border-white/[0.09]"
          : "bg-white dark:bg-[#17181A] border-gray-200 dark:border-white/[0.1]"
      }`}
      aria-label="Quantity selector"
    >
      <button
        onClick={onDecrease}
        disabled={qty <= 1}
        className={`flex items-center justify-center text-red-400 disabled:opacity-30 transition-colors ${
          isDesktop
            ? "w-11 h-12 hover:bg-red-500/10"
            : "w-10 h-12 active:bg-red-500/10"
        }`}
        aria-label="Decrease quantity"
      >
        <Minus
          className={isDesktop ? "w-4 h-4" : "w-3.5 h-3.5"}
          aria-hidden="true"
        />
      </button>
      <span
        className={`text-center font-black text-gray-900 dark:text-white select-none ${
          isDesktop ? "w-10 text-lg" : "w-8 text-base"
        }`}
        aria-live="polite"
      >
        {qty}
      </span>
      <button
        onClick={onIncrease}
        disabled={qty >= maxStock}
        className={`flex items-center justify-center text-emerald-400 disabled:opacity-30 transition-colors ${
          isDesktop
            ? "w-11 h-12 hover:bg-emerald-500/10"
            : "w-10 h-12 active:bg-emerald-500/10"
        }`}
        aria-label="Increase quantity"
      >
        <Plus
          className={isDesktop ? "w-4 h-4" : "w-3.5 h-3.5"}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

export default QuantityStepper;
