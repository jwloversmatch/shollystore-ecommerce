import SEO from "../../../components/SEO";
import { ACCENT } from "../constants";

interface Props {
  onBack: () => void;
}

const EmptyCartView = ({ onBack }: Props) => (
  <main
    id="main-content"
    tabIndex={-1}
    className="min-h-screen flex items-center justify-center bg-[#FCFAF5] dark:bg-[#0F1011] focus:outline-none"
  >
    <SEO title="Checkout" description="Complete your order securely." />
    <div className="text-center p-8">
      <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">
        Your cart is empty.
      </p>
      <button
        onClick={onBack}
        className="font-bold hover:opacity-80 transition-opacity"
        style={{ color: ACCENT }}
        aria-label="Back to shop"
      >
        ← Back to Shop
      </button>
    </div>
  </main>
);

export default EmptyCartView;