import { motion } from "framer-motion";
import { Calendar, Eye, Ticket, Truck } from "lucide-react";
import type { Order } from "../../types/account";
import { getStatusInfo } from "../../utils/statusHelpers";

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onTrackOrder: (order: Order) => void;
}

const OrderCard = ({ order, onViewDetails, onTrackOrder }: OrderCardProps) => {
  const { icon, color, label } = getStatusInfo(order.status);

  // ✅ Only show track for non‑cancelled orders
  const canTrack = order.status !== "Cancelled";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-xl shadow-sm border transition-all overflow-hidden bg-white dark:bg-[#141414] border-gray-200 dark:border-white/[0.06]"
      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}
    >
      {/* Mobile: Track icon button top right (only if canTrack) */}
      {canTrack && (
        <button
          onClick={() => onTrackOrder(order)}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-[#e8622a] text-white shadow-md shadow-orange-500/30 sm:hidden"
          aria-label={`Track order ${order._id.slice(-8)}`}
        >
          <Truck className="w-5 h-5" />
        </button>
      )}

      {/* Main content */}
      <div className="p-4 sm:p-5 pr-16 sm:pr-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Order #</p>
            <p className="font-medium text-gray-700 dark:text-gray-300 text-sm mt-0.5">
              {order._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${color}`}>
              {icon}
              {label}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">
              ₦{order.totalPrice.toLocaleString()}
              {order.couponCode && (
                <span className="ml-1 inline-flex items-center gap-0.5 bg-green-500/20 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                  <Ticket className="w-3 h-3" />
                  {order.couponCode}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: date + actions */}
      <div className="px-4 sm:px-5 pb-4 pt-2 flex items-center justify-between border-t border-gray-100 dark:border-white/[0.06]">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(order.createdAt).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onViewDetails(order)}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#e8622a] dark:hover:text-[#e8622a] transition-colors"
          >
            <Eye className="w-4 h-4" />
            View
          </button>

          {/* Desktop track link – only if canTrack */}
          {canTrack && (
            <button
              onClick={() => onTrackOrder(order)}
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#e8622a] dark:hover:text-[#e8622a] transition-colors"
            >
              <Truck className="w-4 h-4" />
              Track
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;