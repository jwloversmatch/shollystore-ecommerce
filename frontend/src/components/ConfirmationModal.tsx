import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

const ACCENT = '#e8622a';
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}: ConfirmationModalProps) => {
  const confirmColor = type === 'danger' ? '#ef4444' : ACCENT;
  const iconBg = type === 'danger' ? 'bg-red-100 dark:bg-red-500/10' : 'bg-orange-100 dark:bg-[#e8622a]/10';
  const iconColor = type === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-[#e8622a] dark:text-[#e8622a]';
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap: same pattern used across every other modal in the app —
  // moves focus in on open, cycles Tab within the dialog, closes on Escape,
  // restores focus to whatever opened it on close. Fixing it here covers
  // every one of this component's six call sites in one pass.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusable = dialog
      ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && focusable.length > 0) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
            role="presentation"
            aria-hidden="true"
          />
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-modal-title"
          >
            <div ref={dialogRef} className="bg-[#FCFAF5] dark:bg-[#141414] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-white/[0.07]">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${iconBg}`}>
                    <AlertTriangle className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
                  </div>
                  <h3 id="confirmation-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                </button>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{message}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition
                    text-gray-600 dark:text-gray-400
                    bg-gray-200 dark:bg-[#1c1c1c] hover:bg-gray-300 dark:hover:bg-[#2a2a2a]
                    border border-gray-300 dark:border-white/[0.08]"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition hover:scale-105 active:scale-95"
                  style={{ background: confirmColor, boxShadow: `0 4px 14px ${confirmColor}44` }}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;