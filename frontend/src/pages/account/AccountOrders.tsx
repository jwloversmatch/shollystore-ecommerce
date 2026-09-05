import { motion } from "framer-motion";
import { ShoppingBag, AlertCircle, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OrderRowSkeleton } from "../../components/Skeletons";
import OrderCard from "./OrderCard";
import type { Order } from "../../types/account";

interface AccountOrdersProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  onViewOrder: (order: Order) => void;
}

const AccountOrders = ({ orders, loading, error, onViewOrder }: AccountOrdersProps) => {
  const navigate = useNavigate();

  const handleTrack = (order: Order) => {
    const email = order.email || order.guestEmail || "";
    if (!email) return; // can't track without email
    navigate(`/track-order?orderId=${order._id}&email=${encodeURIComponent(email)}`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <OrderRowSkeleton key={i} dark />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-4 flex items-center gap-3"
        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
      >
        <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
        <span className="text-red-600 dark:text-red-300">{error}</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl shadow-sm border p-10 text-center bg-white dark:bg-[#141414] border-gray-200 dark:border-white/[0.07]">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
        <p className="text-gray-400 mb-6">
          Looks like you haven't placed any orders. Start shopping!
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition"
          style={{ background: "#e8622a", boxShadow: "0 6px 18px rgba(232,98,42,0.35)" }}
        >
          Browse Products
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order._id} className="relative">
          <OrderCard order={order} onViewDetails={onViewOrder} />
          {/* Track button */}
          <button
            onClick={() => handleTrack(order)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ background: "#e8622a", boxShadow: "0 4px 12px rgba(232,98,42,0.3)" }}
          >
            <Truck className="w-4 h-4" />
            Track Order
          </button>
        </div>
      ))}
    </div>
  );
};

export default AccountOrders;