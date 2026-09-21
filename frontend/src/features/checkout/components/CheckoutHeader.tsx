import { Flame, ArrowLeft } from "lucide-react";
import { ACCENT } from "../constants";

interface Props {
  onBackToCart: () => void;
}

const CheckoutHeader = ({ onBackToCart }: Props) => (
  <header className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${ACCENT}18` }}
        >
          <Flame className="w-4 h-4" style={{ color: ACCENT }} aria-hidden="true" />
        </div>
        <p
          className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
          style={{ color: ACCENT }}
        >
          Secure Checkout
        </p>
      </div>
      <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
        Complete Your Order
      </h1>
    </div>
    <button
      onClick={onBackToCart}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.08]"
      aria-label="Back to cart"
    >
      <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Cart
    </button>
  </header>
);

export default CheckoutHeader;