import { motion } from "framer-motion";
import { User, Mail } from "lucide-react";
import type { User as UserType } from "../../features/auth/authSlice";

interface ProfileInfoCardProps {
  user: UserType | null;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (e: React.FormEvent) => void;
  editName: string;
  setEditName: (val: string) => void;
  editPhone: string;
  setEditPhone: (val: string) => void;
  isUpdating: boolean;
}

const ACCENT = "#e8622a";

const ProfileInfoCard = ({
  user,
  editing,
  onStartEdit,
  onCancelEdit,
  onSave,
  editName,
  setEditName,
  editPhone,
  setEditPhone,
  isUpdating,
}: ProfileInfoCardProps) => (
  <div className="rounded-2xl shadow-sm border p-6 sm:p-8 space-y-6"
    style={{ background: "#141414", borderColor: "rgba(255,255,255,0.07)" }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
          style={{ background: `${ACCENT}20`, color: ACCENT }}
        >
          <User className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">
            {user?.name || "User"}
          </h3>
          <p className="text-gray-400 flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {user?.email}
          </p>
        </div>
      </div>
      {!editing ? (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStartEdit}
          className="px-4 py-2 text-white rounded-xl font-medium text-sm shadow-md transition"
          style={{ background: ACCENT }}
        >
          Edit Profile
        </motion.button>
      ) : (
        <button
          type="button"
          onClick={onCancelEdit}
          className="text-gray-400 hover:text-gray-200 text-sm"
        >
          Cancel
        </button>
      )}
    </div>

    {editing ? (
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 outline-none text-white placeholder-gray-500 transition"
            style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)" }}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 outline-none text-white placeholder-gray-500 transition"
            style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)" }}
            placeholder="Your phone number"
          />
        </div>
        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={isUpdating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 text-white rounded-xl font-medium shadow-md transition disabled:opacity-60"
            style={{ background: ACCENT }}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </form>
    ) : (
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Full Name</p>
          <p className="font-medium text-gray-300 mt-1">{user?.name || "Not set"}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Phone Number</p>
          <p className="font-medium text-gray-300 mt-1">{user?.phone || "Not set"}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Email Address</p>
          <p className="font-medium text-gray-300 mt-1 break-all">{user?.email}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Member Since</p>
          <p className="font-medium text-gray-300 mt-1">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </p>
        </div>
      </div>
    )}
  </div>
);

export default ProfileInfoCard;