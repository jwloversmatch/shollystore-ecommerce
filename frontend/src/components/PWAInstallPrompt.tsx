import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

const PWAInstallPrompt = () => {
  const { isInstallable } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("pwaInstallPromptDismissed") === "true";
  });

  useEffect(() => {
    if (isInstallable && !dismissed && !visible) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, dismissed, visible]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("pwaInstallPromptDismissed", "true");
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
        role="dialog"
        aria-label="Install instructions"
      >
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-xl">
          <Share className="w-5 h-5 text-[#e8622a] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Install Sholex on your iPhone
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Tap the <strong>Share</strong> button below, then select{" "}
              <strong>"Add to Home Screen"</strong>.
            </p>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#e8622a] hover:bg-[#c9511f] transition-colors"
            >
              Got it
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;