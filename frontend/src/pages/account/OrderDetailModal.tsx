import { motion } from "framer-motion";
import { X, Calendar, CreditCard, MapPin, Ticket } from "lucide-react";
import type { Order } from "../../types/account";
import { getStatusInfo, paymentLabels } from "../../utils/statusHelpers";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

const OrderDetailModal = ({ order, onClose }: OrderDetailModalProps) => {
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
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border"
          style={{
            background: "#141414",
            borderColor: "rgba(255,255,255,0.1)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}
        >
          <div className="sticky top-0 bg-[#141414]/90 backdrop-blur-md p-4 sm:p-6 border-b border-white/10 flex justify-between items-center z-10">
            <h2 className="text-xl font-bold text-white">
              Order #{order._id.slice(-8).toUpperCase()}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-wrap gap-3 items-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${color}`}>
                {icon}
                {label}
              </span>
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(order.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {order.paymentMethod && (
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
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
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
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
                      <Ticket className="w-3.5 h-3.5" />
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