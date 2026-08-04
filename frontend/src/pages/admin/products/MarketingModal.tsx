import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useSendMarketingEmailMutation } from "../../../features/api/apiSlice";
import { X, Mail, Loader2 } from "lucide-react";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import type { ProductItem } from "../../../types/home";

interface MarketingModalProps {
  product: ProductItem;
  onClose: () => void;
  isDark: boolean;
}

const MarketingModal = ({ product, onClose, isDark }: MarketingModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [sendMarketingEmail, { isLoading: isSending }] = useSendMarketingEmailMutation();
  const [marketingType, setMarketingType] = useState<"new_arrival" | "back_in_stock">(
    (product.stock ?? 0) > 0 ? "new_arrival" : "back_in_stock"
  );
  const [customMessage, setCustomMessage] = useState("");

  const modalBg = isDark ? "#141414" : "#fff";
  const modalBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const overlayBg = isDark ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.4)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  useFocusTrap(modalRef, true, onClose);

  const handleSend = async () => {
    try {
      await sendMarketingEmail({
        type: marketingType,
        productId: product._id,
        customMessage: marketingType === "new_arrival" ? customMessage : undefined,
      }).unwrap();
      toast.success("Marketing emails sent!");
      onClose();
    } catch (err) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to send emails");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: overlayBg, backdropFilter: "blur(8px)" }}
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="marketing-modal-title">
        <div
          ref={modalRef}
          className="relative w-full max-w-md rounded-2xl p-6"
          style={{
            background: modalBg,
            border: `1px solid ${modalBorder}`,
            boxShadow: isDark ? "0 40px 90px rgba(0,0,0,0.6)" : "0 20px 50px rgba(0,0,0,0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl" style={{ background: "linear-gradient(90deg, transparent, #10b981, transparent)" }} />
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-0.5" style={{ color: "#10b981" }}>Email Campaign</p>
              <h2 id="marketing-modal-title" className="text-xl font-black" style={{ color: textPrimary }}>Notify Customers</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.07)", color: textMuted }}
              aria-label="Close"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: textMuted }}>
            Sending email to all customers about <strong style={{ color: textPrimary }}>{product.name}</strong>.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="marketing-type" className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: textMuted }}>Email Type</label>
              <select
                id="marketing-type"
                value={marketingType}
                onChange={(e) => setMarketingType(e.target.value as "new_arrival" | "back_in_stock")}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border cursor-pointer"
                style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
              >
                <option value="new_arrival">New Arrival</option>
                <option value="back_in_stock">Back in Stock</option>
              </select>
            </div>
            {marketingType === "new_arrival" && (
              <div>
                <label htmlFor="marketing-message" className="block text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: textMuted }}>Custom Message (optional)</label>
                <textarea
                  id="marketing-message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  placeholder="Write a short message for customers…"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none border transition-all"
                  style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
                />
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: inputBorder }}>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-55"
                style={{ background: "#10b981", boxShadow: "0 6px 18px rgba(16,185,129,0.35)" }}
              >
                {isSending ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending…</> : <><Mail className="w-4 h-4" aria-hidden="true" /> Send Emails</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketingModal;