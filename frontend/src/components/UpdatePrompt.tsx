import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";

const ACCENT = "#e8622a";

interface UpdatePromptProps {
  isOpen: boolean;
  onRefresh: () => void;
  onDismiss: () => void;
}

const UpdatePrompt = ({
  isOpen,
  onRefresh,
  onDismiss,
}: UpdatePromptProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  useFocusTrap(sheetRef, isOpen, onDismiss);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim — subtle, dismissible */}
          <motion.div
            key="up-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-sm"
            onClick={onDismiss}
            aria-hidden="true"
          />

          {/* Sheet — pinned above the bottom nav + safe area */}
          <motion.div
            key="up-sheet"
            ref={sheetRef}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="fixed left-1/2 -translate-x-1/2 z-[96] w-[calc(100%-2rem)] max-w-md
              bg-white dark:bg-[#17181A]
              border border-gray-200 dark:border-white/[0.08]
              rounded-2xl shadow-2xl p-4"
            style={{
              bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
            }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="update-title"
            aria-describedby="update-desc"
          >
            <div className="flex items-start gap-3">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${ACCENT}15`, color: ACCENT }}
                aria-hidden="true"
              >
                <RefreshCw className="w-5 h-5" />
              </span>

              <div className="flex-1 min-w-0">
                <p
                  id="update-title"
                  className="text-sm font-black text-gray-900 dark:text-[#E7E9EA]"
                >
                  New version available
                </p>
                <p
                  id="update-desc"
                  className="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
                >
                  Refresh to get the latest features and fixes.
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={onRefresh}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white
                      transition-colors"
                    style={{
                      background: ACCENT,
                      boxShadow: `0 6px 18px ${ACCENT}44`,
                    }}
                  >
                    Refresh now
                  </button>
                  <button
                    onClick={onDismiss}
                    className="px-3 py-2 rounded-xl text-xs font-bold
                      text-gray-500 dark:text-gray-400
                      hover:bg-gray-100 dark:hover:bg-white/[0.05]
                      transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>

              <button
                onClick={onDismiss}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpdatePrompt;