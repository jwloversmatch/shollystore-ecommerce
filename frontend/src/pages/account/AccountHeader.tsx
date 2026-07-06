import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import type { User } from "../../features/auth/authSlice"; 

interface AccountHeaderProps {
  user: User | null;
}

const AccountHeader = ({ user }: AccountHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center gap-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100"
  >
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-leaf-green to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
      {user?.name?.charAt(0)?.toUpperCase() ||
        user?.email?.charAt(0)?.toUpperCase() ||
        "U"}
    </div>
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        {user?.name || "Welcome back!"}
      </h1>
      <p className="text-gray-500 flex items-center gap-1 mt-1">
        <Mail className="w-4 h-4" />
        {user?.email}
      </p>
      {user?.phone && (
        <p className="text-gray-500 flex items-center gap-1 mt-0.5">
          <Phone className="w-4 h-4" />
          {user.phone}
        </p>
      )}
    </div>
  </motion.div>
);

export default AccountHeader;