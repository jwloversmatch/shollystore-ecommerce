import { useState } from "react";
import { Banknote, MessageCircle, Copy, Check, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../../../components/SEO";
import CreateAccountModal from "../../../components/CreateAccountModal";
import AmbientBg from "./AmbientBg";
import OrderTimeline, { type TimelineStep } from "../OrderTimeline";
import { PENDING_AMBER } from "../constants";
import type { SubmittedOrder } from "../hooks/useOrderSubmit";
import type { SettingsData } from "../../../pages/admin/settings/settingsSchema";

interface Props {
  order: SubmittedOrder;
  publicSettings?: SettingsData;
  showCreateAccountModal: boolean;
  guestEmail: string;
  isCreating: boolean;
  onCloseModal: () => void;
  onCreateAccount: (password: string) => Promise<void>;
  onContinueShopping: () => void;
}

const OrderPendingTransferView = ({
  order,
  publicSettings,
  showCreateAccountModal,
  guestEmail,
  isCreating,
  onCloseModal,
  onCreateAccount,
  onContinueShopping,
}: Props) => {
  const [copied, setCopied] = useState(false);

  const { paymentDetails } = order;
  const hasBankDetails = Boolean(
    paymentDetails?.bankName &&
      paymentDetails?.accountName &&
      paymentDetails?.accountNumber,
  );

  // Prefer the backend-provided prefilled URL; fall back to building one
  // from public settings if for some reason it wasn't returned.
  const waLink =
    order.whatsappUrl ||
    (publicSettings?.whatsappNumber
      ? `https://wa.me/${publicSettings.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
          `Hi, I just placed order ${order.orderRef}. Here's my transfer receipt:`,
        )}`
      : undefined);

  const copyAccountNumber = async () => {
    if (!paymentDetails?.accountNumber) return;
    try {
      await navigator.clipboard.writeText(paymentDetails.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const timeline: TimelineStep[] = [
    {
      label: "Order received",
      description: `Reference ${order.orderRef}`,
      state: "done",
    },
    {
      label: "Awaiting your transfer",
      description: `Send ₦${order.totalPrice.toLocaleString()} to complete`,
      state: "active",
    },
    {
      label: "Payment confirmed",
      description: "We'll verify within 30 minutes",
      state: "pending",
    },
    {
      label: "Order shipped",
      description: "You'll get a tracking number by email",
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
        title={`Order ${order.orderRef} — Awaiting Payment`}
        description="Send your bank transfer to complete your order."
      />
      <AmbientBg />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Header badge */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `${PENDING_AMBER}15`,
              boxShadow: `0 0 0 3px ${PENDING_AMBER}`,
            }}
          >
            <Banknote
              className="w-9 h-9"
              style={{ color: PENDING_AMBER }}
              aria-hidden="true"
            />
          </div>
        </div>

        <p
          className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2 text-center"
          style={{ color: PENDING_AMBER }}
        >
          Action required
        </p>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center leading-tight">
          Almost there
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">
          Send{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            ₦{order.totalPrice.toLocaleString()}
          </span>{" "}
          to complete your order.
        </p>

        {/* Bank details */}
        {hasBankDetails ? (
          <div className="rounded-2xl p-5 mb-6 bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.07]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4">
              Transfer to
            </p>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Bank
              </span>
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {paymentDetails!.bankName}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-100 dark:border-white/[0.05]">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Account name
              </span>
              <span className="font-bold text-sm text-gray-900 dark:text-white text-right">
                {paymentDetails!.accountName}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-gray-100 dark:border-white/[0.05]">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Account number
              </span>
              <button
                onClick={copyAccountNumber}
                className="flex items-center gap-2 font-mono font-black text-lg text-gray-900 dark:text-white hover:opacity-80 transition-opacity"
                aria-label="Copy account number"
              >
                {paymentDetails!.accountNumber}
                {copied ? (
                  <Check
                    className="w-4 h-4 text-emerald-500"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.05] flex gap-3 items-start">
              <AlertCircle
                className="w-4 h-4 shrink-0 mt-0.5"
                style={{ color: PENDING_AMBER }}
                aria-hidden="true"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Use{" "}
                <span className="font-bold text-gray-900 dark:text-white font-mono">
                  {order.orderRef}
                </span>{" "}
                as the transfer narration. This helps us match your payment
                quickly.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 mb-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25">
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              We're finalizing your bank details. Please contact us on WhatsApp
              to complete your payment.
            </p>
          </div>
        )}

        {/* WhatsApp receipt CTA */}
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 mb-3 transition-transform hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "#25D366",
              boxShadow: "0 8px 24px rgba(37,211,102,0.35)",
            }}
            aria-label="Send your transfer receipt on WhatsApp"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            Send receipt on WhatsApp
          </a>
        ) : null}

        {/* Timeline */}
        <div className="rounded-2xl p-5 mt-8 bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.07]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-5">
            What happens next
          </p>
          <OrderTimeline steps={timeline} />
        </div>

        {/* Continue shopping */}
        <div className="text-center mt-6">
          <Link
            to="/shop"
            onClick={onContinueShopping}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Continue shopping while you wait
          </Link>
        </div>

        {/* Reference footer */}
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
          Order reference:{" "}
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

export default OrderPendingTransferView;