import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import type { User } from "../../features/auth/authSlice";

interface AccountHeaderProps {
  user: User | null;
}

const ACCENT = "#e8622a"; // your brand accent

const AccountHeader = ({ user }: AccountHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center gap-6 rounded-2xl p-6 shadow-sm border"
    style={{
      background: "#141414",
      borderColor: "rgba(255,255,255,0.07)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
    }}
  >
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${ACCENT}, #FFB347)`,
      }}
    >
      {user?.name?.charAt(0)?.toUpperCase() ||
        user?.email?.charAt(0)?.toUpperCase() ||
        "U"}
    </div>
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white">
        {user?.name || "Welcome back!"}
      </h1>
      <p className="text-gray-400 flex items-center gap-1 mt-1">
        <Mail className="w-4 h-4" />
        {user?.email}
      </p>
      {user?.phone && (
        <p className="text-gray-400 flex items-center gap-1 mt-0.5">
          <Phone className="w-4 h-4" />
          {user.phone}
        </p>
      )}
    </div>
  </motion.div>
);

export default AccountHeader;