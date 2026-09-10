import { useState, useRef } from 'react';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const CancellationModal = ({ isOpen, onClose, onConfirm }: CancellationModalProps) => {
  const [reason, setReason] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, isOpen, onClose);

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
            role="presentation"
            aria-hidden="true"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-modal-title"
          >
            <div ref={dialogRef} className="bg-[#FCFAF5] dark:bg-[#17181A] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-white/[0.07]">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/10">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
                  </div>
                  <h3 id="cancel-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">Cancel Order</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                </button>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Please provide a reason for cancellation. This will be recorded and the customer will be notified.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#1F2123] text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition
                    text-gray-600 dark:text-gray-400
                    bg-gray-200 dark:bg-[#1F2123] hover:bg-gray-300 dark:hover:bg-[#2a2a2a]
                    border border-gray-300 dark:border-white/[0.08]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!reason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#ef4444', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CancellationModal;