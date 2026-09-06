import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Package, Heart } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const HomeWelcomeBanner = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  if (!user || user.role !== "user") return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-7xl mx-auto px-4 md:px-6 py-4"
    >
      <div className="rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.06] p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#e8622a]" />
          <h2 className="font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name || "there"}!
          </h2>
        </div>
        <div className="flex gap-4 sm:ml-auto">
          <Link
            to="/account"
            className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#e8622a] flex items-center gap-1"
          >
            <Package className="w-4 h-4" /> My Orders
          </Link>
          <Link
            to="/account?tab=wishlist"
            className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#e8622a] flex items-center gap-1"
          >
            <Heart className="w-4 h-4" /> Wishlist
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default HomeWelcomeBanner;