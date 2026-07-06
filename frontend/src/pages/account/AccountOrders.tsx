import { motion } from "framer-motion";
import { ShoppingBag, AlertCircle } from "lucide-react";
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
        <AlertCircle className="w-5 h-5 text-red-400" />
        <span className="text-red-300">{error}</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl shadow-sm border p-10 text-center"
        style={{ background: "#141414", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
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
        <OrderCard key={order._id} order={order} onViewDetails={onViewOrder} />
      ))}
    </div>
  );
};

export default AccountOrders;