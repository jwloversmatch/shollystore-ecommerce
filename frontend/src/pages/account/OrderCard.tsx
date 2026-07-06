import { motion } from "framer-motion";
import { Calendar, Eye, Ticket } from "lucide-react";
import type { Order } from "../../types/account";
import { getStatusInfo } from "../../utils/statusHelpers";

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
}

const OrderCard = ({ order, onViewDetails }: OrderCardProps) => {
  const { icon, color, label } = getStatusInfo(order.status);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl shadow-sm border transition-all overflow-hidden"
      style={{
        background: "#141414",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Order #</p>
            <p className="font-medium text-gray-300 text-sm mt-0.5">
              {order._id.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
            <p className="font-medium text-gray-300 text-sm mt-0.5 flex items-center gap-1">
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
            <p className="font-bold text-white text-sm mt-0.5">
              ₦{order.totalPrice.toLocaleString()}
              {order.couponCode && (
                <span className="ml-1 inline-flex items-center gap-0.5 bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                  <Ticket className="w-3 h-3" />
                  {order.couponCode}
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(order)}
          className="flex items-center gap-1 text-sm font-medium hover:underline shrink-0 self-end sm:self-center"
          style={{ color: "#e8622a" }}
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
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