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
          <OrderRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
        <p className="text-gray-500 mb-6">
          Looks like you haven't placed any orders. Start shopping!
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="bg-leaf-green text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition"
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