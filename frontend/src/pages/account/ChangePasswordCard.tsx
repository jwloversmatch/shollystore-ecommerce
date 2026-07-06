import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface ChangePasswordCardProps {
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  changingPassword: boolean;
}

const ACCENT = "#e8622a";

const ChangePasswordCard = ({ onSubmit, changingPassword }: ChangePasswordCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(currentPassword, newPassword);
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="rounded-2xl shadow-sm border p-6 sm:p-8 space-y-4"
      style={{ background: "#141414", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-sm font-medium hover:underline flex items-center gap-2"
        style={{ color: ACCENT }}
      >
        <Lock className="w-4 h-4" />
        {showForm ? "Hide" : "Change Password"}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 outline-none text-white placeholder-gray-500"
              style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)" }}
              placeholder="Current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 outline-none text-white placeholder-gray-500"
              style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)" }}
              placeholder="New password (min. 6 characters)"
            />
          </div>
          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={changingPassword}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 text-white rounded-xl font-medium shadow-md transition disabled:opacity-60"
              style={{ background: ACCENT }}
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChangePasswordCard;