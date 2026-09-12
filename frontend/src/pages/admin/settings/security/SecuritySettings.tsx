import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useChangePasswordMutation } from "../../../../features/api/apiSlice";
import { logout } from "../../../../features/auth/authSlice";
import SettingsSection from "../_components/SettingsSection";

const inputCls =
  "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all border bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E7E9EA] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 pr-11";
const labelCls =
  "text-[10px] font-extrabold uppercase tracking-widest block mb-2 text-gray-400 dark:text-gray-500";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete: string;
}

const PasswordField = ({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
}: PasswordFieldProps) => (
  <div>
    <label htmlFor={id} className={labelCls}>
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={inputCls}
        required
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg
          text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
          transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <EyeOff className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Eye className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </div>
  </div>
);

const SecuritySettings = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword &&
    newPassword !== currentPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      reset();

      // Backend clears the refresh token and invalidates the session.
      // Sign the admin out and redirect to login with a clear message.
      toast.success("Password changed. Please log in again.");
      dispatch(logout());
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to update password");
    }
  };

  return (
    <SettingsSection
      title="Security"
      description="Change the password for your admin account. You'll be signed out after updating."
      icon={<Lock className="w-4 h-4" />}
      iconBg="rgba(232,98,42,0.12)"
      iconColor="#e8622a"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <PasswordField
          id="current-password"
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggleShow={() => setShowCurrent((s) => !s)}
          autoComplete="current-password"
        />

        <PasswordField
          id="new-password"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggleShow={() => setShowNew((s) => !s)}
          autoComplete="new-password"
        />

        <PasswordField
          id="confirm-password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggleShow={() => setShowConfirm((s) => !s)}
          autoComplete="new-password"
        />

        {/* Client-side hints */}
        {newPassword.length > 0 && newPassword.length < 6 && (
          <p className="text-xs text-amber-500">
            Password must be at least 6 characters.
          </p>
        )}
        {newPassword.length > 0 && newPassword === currentPassword && (
          <p className="text-xs text-amber-500">
            New password must be different from the current one.
          </p>
        )}
        {confirmPassword.length > 0 && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500">Passwords do not match.</p>
        )}

        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-white/[0.06]">
          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm
              bg-[#e8622a] hover:bg-[#c9511f] shadow-[0_6px_18px_rgba(232,98,42,0.27)]
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Updating…
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </SettingsSection>
  );
};

export default SecuritySettings;