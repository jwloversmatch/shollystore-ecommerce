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
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl shadow-sm border transition-all overflow-hidden bg-white dark:bg-[#141414] border-gray-200 dark:border-white/[0.06]"
      style={{
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Order #</p>
            <p className="font-medium text-gray-700 dark:text-gray-300 text-sm mt-0.5">
              {order._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
            <p className="font-medium text-gray-700 dark:text-gray-300 text-sm mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${color}`}>
              {icon}
              {label}
            </span>
          </div>
          <div>
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

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => onViewDetails(order)}
            className="flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: "#e8622a" }}
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => onTrackOrder(order)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-white bg-[#e8622a] shadow-md shadow-orange-500/30 transition-transform hover:scale-105"
          >
            <Truck className="w-4 h-4" />
            Track
          </button>
        </div>
      </div>

      <div className="sm:hidden px-4 pb-3">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(order.createdAt).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </motion.div>
  );
};

export default OrderCard;