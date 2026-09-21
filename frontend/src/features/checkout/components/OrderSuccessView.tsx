import { CheckCircle, MessageCircle, ArrowRight } from "lucide-react";
import SEO from "../../../components/SEO";
import CreateAccountModal from "../../../components/CreateAccountModal";
import AmbientBg from "./AmbientBg";
import { ACCENT } from "../constants";
import type { OrderResponse, PaymentMethodId } from "../types";
import type { SettingsData } from "../../../pages/admin/settings/settingsSchema";

interface Props {
  orderData: OrderResponse | null;
  paymentMethod: PaymentMethodId;
  publicSettings: SettingsData | undefined;
  showCreateAccountModal: boolean;
  guestEmail: string;
  isCreating: boolean;
  onCloseModal: () => void;
  onCreateAccount: (password: string) => Promise<void>;
  onContinueShopping: () => void;
}

const OrderSuccessView = ({
  orderData,
  paymentMethod,
  publicSettings,
  showCreateAccountModal,
  guestEmail,
  isCreating,
  onCloseModal,
  onCreateAccount,
  onContinueShopping,
}: Props) => {
  const defaultAccount =
    publicSettings?.bankAccounts?.find((acc) => acc.isDefault && acc.isActive) ||
    publicSettings?.bankAccounts?.find((acc) => acc.isActive);

  const bankName = defaultAccount?.bankName || "GTBank";
  const accountName = defaultAccount?.accountName || "Sholex";
  const accountNumber = defaultAccount?.accountNumber || "0123456789";
  const whatsappNumber = publicSettings?.whatsappNumber || "+2348000000000";

  const waLink = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
  const orderId = orderData?._id;
  const trackingNumber = orderData?.trackingNumber || orderId;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#FCFAF5] dark:bg-[#0F1011] focus:outline-none"
    >
      <SEO
        title="Order Placed"
        description="Your order has been placed successfully."
      />
      <AmbientBg />
      <div className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10 bg-[#FCFAF5] dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.07] shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.65)]">
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `${ACCENT}15`,
              boxShadow: `0 0 0 3px ${ACCENT}`,
            }}
          >
            <CheckCircle
              className="w-9 h-9"
              style={{ color: ACCENT }}
              aria-hidden="true"
            />
          </div>
        </div>
        <p
          className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2 text-center"
          style={{ color: ACCENT }}
        >
          Order received
        </p>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center leading-tight">
          Order Placed!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
          Reference:{" "}
          <span className="font-bold text-gray-900 dark:text-white font-mono text-xs px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-[#1F2123]">
            #{trackingNumber}
          </span>
        </p>

        {paymentMethod === "bank_transfer" && (
          <div className="rounded-2xl p-5 mb-6 border bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
              Bank Transfer Details
            </p>
            {[
              { label: "Bank", val: bankName },
              { label: "Account Name", val: accountName },
              {
                label: "Account Number",
                val: accountNumber,
                highlight: true,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center text-sm mt-1"
              >
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  {row.label}
                </span>
                <span
                  className={`font-bold ${
                    row.highlight
                      ? "text-emerald-600 dark:text-emerald-400 font-mono tracking-widest text-base"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {row.val}
                </span>
              </div>
            ))}
            <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-500/20">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Send transfer receipt to WhatsApp:
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "#25D366",
                  boxShadow: "0 4px 12px rgba(37,211,102,0.35)",
                }}
                aria-label={`Chat on WhatsApp: ${whatsappNumber}`}
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />{" "}
                {whatsappNumber}
              </a>
            </div>
          </div>
        )}

        {paymentMethod === "whatsapp" && (
          <div className="rounded-2xl p-5 mb-6 border bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/25">
            <p className="text-xs font-extrabold uppercase tracking-widest mb-3 text-green-600 dark:text-green-400">
              WhatsApp Payment
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
              Chat with us to confirm your order and complete payment.
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white w-full justify-center"
              style={{
                background: "#25D366",
                boxShadow: "0 6px 18px rgba(37,211,102,0.35)",
              }}
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" /> Chat on
              WhatsApp
            </a>
          </div>
        )}

        <button
          onClick={onContinueShopping}
          className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group"
          style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
          aria-label="Continue shopping"
        >
          Continue Shopping{" "}
          <ArrowRight
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            aria-hidden="true"
          />
        </button>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          You'll receive a tracking number once your order ships.
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

export default OrderSuccessView;