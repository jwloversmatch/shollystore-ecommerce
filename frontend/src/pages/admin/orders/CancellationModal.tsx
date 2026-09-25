import { useState, useRef } from "react";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2 } from "lucide-react";

// ─── Structured reasons (must match backend CANCEL_REASONS enum) ─────────────
const CANCEL_REASON_OPTIONS = [
  { value: "payment_not_received", label: "Payment not received" },
  { value: "payment_amount_mismatch", label: "Payment amount mismatch" },
  { value: "customer_requested", label: "Customer requested cancellation" },
  { value: "item_out_of_stock", label: "Item(s) out of stock" },
  { value: "suspected_fraud", label: "Suspected fraud" },
  { value: "other", label: "Other (explain in note below)" },
] as const;

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called with the structured reason and optional internal note.
   * Should throw on failure so the modal can display the error inline.
   * Should resolve on success (modal closes automatically).
   */
  onConfirm: (reason: string, note?: string) => Promise<void>;
  /** Optional human-readable order reference shown in the warning text. */
  orderRef?: string;
}

const CancellationModal = ({
  isOpen,
  onClose,
  onConfirm,
  orderRef,
}: CancellationModalProps) => {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, isOpen, onClose);

  const handleConfirm = async () => {
    if (!reason) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(reason, note.trim() || undefined);
      onClose();
    } catch (err) {
      const e = err as { data?: { message?: string }; message?: string };
      setError(
        e?.data?.message ||
          e?.message ||
          "Failed to cancel order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
            role="presentation"
            aria-hidden="true"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-modal-title"
          >
            <div
              ref={dialogRef}
              className="bg-[#FCFAF5] dark:bg-[#17181A] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-white/[0.07]"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/10">
                    <AlertTriangle
                      className="w-5 h-5 text-red-600 dark:text-red-400"
                      aria-hidden="true"
                    />
                  </div>
                  <h3
                    id="cancel-modal-title"
                    className="text-lg font-bold text-gray-900 dark:text-white"
                  >
                    Cancel Order
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Close"
                >
                  <X
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Warning message */}
              <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 mb-5">
                <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                  <strong>This action cannot be undone.</strong>{" "}
                  {orderRef ? (
                    <>
                      Order{" "}
                      <span className="font-mono font-bold">{orderRef}</span>{" "}
                      will be cancelled and the customer will be notified by
                      email.
                    </>
                  ) : (
                    "The customer will be notified by email."
                  )}
                </p>
              </div>

              {/* Reason dropdown */}
              <div className="mb-4">
                <label
                  htmlFor="cancel-reason"
                  className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                >
                  Cancellation reason *
                </label>
                <select
                  id="cancel-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1F2123] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-60"
                >
                  <option value="" disabled>
                    Select a reason…
                  </option>
                  {CANCEL_REASON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional internal note */}
              <div className="mb-4">
                <label
                  htmlFor="cancel-note"
                  className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                >
                  Internal note{" "}
                  <span className="font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  id="cancel-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional context for your team — not shown to the customer."
                  rows={3}
                  maxLength={500}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1F2123] text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-60"
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {note.length}/500 · Only visible in the admin dashboard.
                </p>
              </div>

              {/* Inline error */}
              {error && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-300"
                >
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition
                    text-gray-600 dark:text-gray-400
                    bg-gray-200 dark:bg-[#1F2123] hover:bg-gray-300 dark:hover:bg-[#2a2a2a]
                    border border-gray-300 dark:border-white/[0.08]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!reason || isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                  style={{
                    background: "#ef4444",
                    boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="w-4 h-4 animate-spin"
                        aria-hidden="true"
                      />
                      Cancelling…
                    </>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CancellationModal;