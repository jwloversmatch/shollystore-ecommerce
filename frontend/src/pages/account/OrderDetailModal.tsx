import { useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { motion } from "framer-motion";
import { X, Calendar, CreditCard, MapPin, Ticket } from "lucide-react";
import type { Order } from "../../types/account";
import { getStatusInfo, paymentLabels } from "../../utils/statusHelpers";


interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

const OrderDetailModal = ({ order, onClose }: OrderDetailModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);

useFocusTrap(dialogRef, !!order, onClose);

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
          className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border bg-white dark:bg-[#141414] border-gray-200 dark:border-white/10"
          style={{
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}
        >
          <div className="sticky top-0 backdrop-blur-md p-4 sm:p-6 border-b flex justify-between items-center z-10 bg-[#FCFAF5]/90 dark:bg-[#141414]/90 border-gray-200 dark:border-white/10">
            <h2 id="order-detail-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
              Order #{order._id.slice(-8).toUpperCase()}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
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
              <div className="rounded-xl p-4 border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Shipping Address
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Items</h3>
              <div className="space-y-2">
                {order.orderItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm rounded-lg p-3 border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5"
                  >
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {item.name}
                    </span>
                    <span className="text-gray-400">
                      {item.qty} × ₦{item.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-2">
              {hasCoupon && (
                <div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5" aria-hidden="true" />
                      Discount ({order.couponCode})
                    </span>
                    <span>- ₦{discount.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
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