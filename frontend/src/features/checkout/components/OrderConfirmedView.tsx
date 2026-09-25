import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../../../components/SEO";
import CreateAccountModal from "../../../components/CreateAccountModal";
import AmbientBg from "./AmbientBg";
import OrderTimeline, { type TimelineStep } from "../OrderTimeline";
import { ACCENT, SUCCESS_GREEN } from "../constants";
import type { SubmittedOrder } from "../hooks/useOrderSubmit";

interface Props {
  order: SubmittedOrder;
  showCreateAccountModal: boolean;
  guestEmail: string;
  isCreating: boolean;
  onCloseModal: () => void;
  onCreateAccount: (password: string) => Promise<void>;
  onContinueShopping: () => void;
}

const OrderConfirmedView = ({
  order,
  showCreateAccountModal,
  guestEmail,
  isCreating,
  onCloseModal,
  onCreateAccount,
  onContinueShopping,
}: Props) => {
  const timeline: TimelineStep[] = [
    {
      label: "Payment confirmed",
      description: `Reference ${order.orderRef}`,
      state: "done",
    },
    {
      label: "Preparing your order",
      description: "Packed within 24–48 hours",
      state: "active",
    },
    {
      label: "Order shipped",
      description: "You'll get a tracking number by email",
      state: "pending",
    },
    {
      label: "Delivered",
      description: "Enjoy your purchase!",
      state: "pending",
    },
  ];

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen px-4 py-12 relative overflow-x-hidden bg-[#FCFAF5] dark:bg-[#0F1011] focus:outline-none"
    >
      <SEO
        title={`Order ${order.orderRef} Confirmed`}
        description="Your payment has been received. We're preparing your order."
      />
      <AmbientBg />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Header badge */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `${SUCCESS_GREEN}15`,
              boxShadow: `0 0 0 3px ${SUCCESS_GREEN}`,
            }}
          >
            <CheckCircle
              className="w-9 h-9"
              style={{ color: SUCCESS_GREEN }}
              aria-hidden="true"
            />
          </div>
        </div>

        <p
          className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2 text-center"
          style={{ color: SUCCESS_GREEN }}
        >
          Payment confirmed
        </p>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center leading-tight">
          Thank you!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">
          We've received{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            ₦{order.totalPrice.toLocaleString()}
          </span>
          . Your order is now in our queue.
        </p>

        {/* Timeline */}
        <div className="rounded-2xl p-5 mb-6 bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.07]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-5">
            What happens next
          </p>
          <OrderTimeline steps={timeline} />
        </div>

        {/* Track order */}
        <Link
          to={`/track-order?ref=${order.orderRef}`}
          className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 mb-3 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
        >
          Track your order
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </Link>

        <button
          onClick={onContinueShopping}
          className="w-full py-3.5 rounded-xl font-bold text-gray-700 dark:text-gray-300 text-sm bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-[#1F2123] transition-colors"
        >
          Continue shopping
        </button>

        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500 text-center">
          A receipt has been emailed to you. Order reference:{" "}
          <span className="font-mono text-gray-700 dark:text-gray-300">
            {order.orderRef}
          </span>
        </p>
      </div>

      <CreateAccountModal
        isOpen={showCreateAccountModal}
        guestEmail={guestEmail}
        onClose={onCloseModal}
        onCreateAccount={onCreateAccount}
        isCreating={isCreating}
      />
    </main>
  );
};

export default OrderConfirmedView;