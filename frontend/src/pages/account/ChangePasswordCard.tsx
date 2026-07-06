import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface ChangePasswordCardProps {
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  changingPassword: boolean;
}

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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-sm font-medium text-leaf-green hover:underline flex items-center gap-2"
      >
        <Lock className="w-4 h-4" />
        {showForm ? "Hide" : "Change Password"}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green"
              placeholder="Current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green"
              placeholder="New password (min. 6 characters)"
            />
          </div>
          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={changingPassword}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 bg-leaf-green text-white rounded-xl font-medium shadow-md hover:bg-green-700 transition disabled:opacity-60"
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