import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AddressFormData {
  label: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  editingAddressId: string | null;
  addressForm: AddressFormData;
  onChange: (form: AddressFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AddressModal = ({
  isOpen,
  editingAddressId,
  addressForm,
  onChange,
  onClose,
  onSubmit,
}: AddressModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingAddressId ? "Edit Address" : "New Address"}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <select
                  value={addressForm.label}
                  onChange={(e) =>
                    onChange({ ...addressForm, label: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) =>
                    onChange({ ...addressForm, address: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                  placeholder="Street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={(e) =>
                    onChange({ ...addressForm, city: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                  placeholder="City"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefaultAddress"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    onChange({ ...addressForm, isDefault: e.target.checked })
                  }
                  className="w-4 h-4 text-leaf-green focus:ring-leaf-green rounded"
                />
                <label htmlFor="isDefaultAddress" className="text-sm text-gray-700">
                  Set as default address
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-leaf-green text-white rounded-xl font-medium shadow-md hover:bg-green-700 transition disabled:opacity-60 text-sm"
                >
                  Save Address
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddressModal;