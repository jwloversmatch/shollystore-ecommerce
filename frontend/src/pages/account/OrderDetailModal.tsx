import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Calendar, CreditCard, MapPin, Ticket } from "lucide-react";
import type { Order } from "../../types/account";
import { getStatusInfo, paymentLabels } from "../../utils/statusHelpers";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

const OrderDetailModal = ({ order, onClose }: OrderDetailModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap: same pattern as every other modal in the app. Keyed on
  // `order` since that's what actually drives this modal's visibility here
  // (there's no separate isOpen boolean — order is null when it's closed).
  useEffect(() => {
    if (!order) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && focusable.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [order, onClose]);

  if (!order) return null;

  const { icon, color, label } = getStatusInfo(order.status);
  const subtotal = order.orderItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const discount = order.discount || 0;
  const hasCoupon = !!order.couponCode;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-modal-title"
      >
        <div
          ref={dialogRef}
          className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border"
          style={{
            background: "#141414",
            borderColor: "rgba(255,255,255,0.1)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}
        >
          <div className="sticky top-0 bg-[#141414]/90 backdrop-blur-md p-4 sm:p-6 border-b border-white/10 flex justify-between items-center z-10">
            <h2 id="order-detail-modal-title" className="text-xl font-bold text-white">
              Order #{order._id.slice(-8).toUpperCase()}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition"
              aria-label="Close order details"
            >
              <X className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </button>
          </div>
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-wrap gap-3 items-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${color}`}>
                <span aria-hidden="true">{icon}</span>
                {label}
              </span>
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                {new Date(order.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {order.paymentMethod && (
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" aria-hidden="true" />
                  {paymentLabels[order.paymentMethod] || order.paymentMethod}
                </span>
              )}
            </div>
            {order.shippingAddress && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Shipping Address
                </p>
                <p className="text-sm text-gray-300 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" aria-hidden="true" />
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                  {order.shippingAddress.postalCode
                    ? `, ${order.shippingAddress.postalCode}`
                    : ""}
                  {order.shippingAddress.country
                    ? `, ${order.shippingAddress.country}`
                    : ""}
                </p>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-white mb-3">Items</h3>
              <div className="space-y-2">
                {order.orderItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm bg-white/5 rounded-lg p-3 border border-white/5"
                  >
                    <span className="text-gray-300 font-medium">
                      {item.name}
                    </span>
                    <span className="text-gray-400">
                      {item.qty} × ₦{item.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 space-y-2">
              {hasCoupon && (
                <div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-400">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" aria-hidden="true" />
                      Discount ({order.couponCode})
                    </span>
                    <span>- ₦{discount.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-semibold text-lg">
                  Total
                </span>
                <span className="text-2xl font-bold" style={{ color: "#e8622a" }}>
                  ₦{order.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailModal;