import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Lock, Mail, X, Eye, EyeOff, Loader2 } from "lucide-react";

const ACCENT = "#e8622a";

interface CreateAccountModalProps {
  isOpen: boolean;
  guestEmail: string;
  onClose: () => void;
  onCreateAccount: (password: string) => Promise<void>;
  isCreating: boolean;
}

const CreateAccountModal = ({
  isOpen,
  guestEmail,
  onClose,
  onCreateAccount,
  isCreating,
}: CreateAccountModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    await onCreateAccount(password);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-account-title"
          >
            <div className="relative w-full max-w-md rounded-2xl p-6 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08] shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#e8622a]/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#e8622a]" />
                </div>
                <h3 id="create-account-title" className="text-xl font-black text-gray-900 dark:text-white">
                  Save your info?
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Create an account to track your order, save addresses, and get
                faster checkout next time.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={guestEmail}
                    disabled
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white font-medium"
                    aria-label="Email (already filled)"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl text-sm bg-gray-100 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#e8622a]/60 focus:ring-2 focus:ring-[#e8622a]/12 outline-none"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isCreating || !password}
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{
                    background: ACCENT,
                    boxShadow: `0 6px 18px ${ACCENT}44`,
                  }}
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateAccountModal;