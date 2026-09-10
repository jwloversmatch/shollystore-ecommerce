import { motion } from "framer-motion";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { addToCart } from "../../features/cart/cartSlice";
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
  const dispatch = useDispatch();

  const handleTrack = (order: Order) => {
    if (order.status === "Cancelled") return;
    navigate(`/track-order?orderId=${order._id}`);
  };

  const handleReorder = (order: Order) => {
    const skippedItems: string[] = [];
    let addedCount = 0;

    order.orderItems.forEach((item) => {
      if (!item.product) {
        skippedItems.push(item.name);
        return;
      }

      // Use a large stock fallback if missing, but you can also fetch actual stock from API if needed.
      const stock = 999; // or item.stock if available
      dispatch(
        addToCart({
          _id: item.product,
          name: item.name,
          image: item.image || "",
          price: item.price,
          qty: item.qty,
          stock,
          variant: item.variant,
        }),
      );
      addedCount += 1;
    });

    if (addedCount > 0) {
      toast.success(`Added ${addedCount} item(s) to cart.`);
    }
    if (skippedItems.length > 0) {
      toast.error(`Skipped unavailable: ${skippedItems.join(", ")}`);
    }
    if (addedCount === 0 && skippedItems.length === 0) {
      toast.error("Nothing to reorder.");
    }
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
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.25)",
        }}
      >
        <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
        <span className="text-red-600 dark:text-red-300">{error}</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl shadow-sm border p-10 text-center bg-white dark:bg-[#17181A] border-gray-200 dark:border-white/[0.07]">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No orders yet
        </h3>
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
        <OrderCard
          key={order._id}
          order={order}
          onViewDetails={onViewOrder}
          onTrackOrder={handleTrack}
          onReorder={handleReorder}
        />
      ))}
    </div>
  );
};

export default AccountOrders;