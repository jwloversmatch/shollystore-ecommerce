import { useState } from "react";
import { motion } from "framer-motion";
import ProfileInfoCard from "./ProfileInfoCard";
import ChangePasswordCard from "./ChangePasswordCard";
import SavedAddressesCard from "./SavedAddressesCard";
import AddressModal from "./AddressModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import type { User as UserType } from "../../features/auth/authSlice";
import type { IAddress } from "../../types/account";

interface AddressFormData {
  label: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AccountProfileProps {
  user: UserType | null;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveProfile: (e: React.FormEvent) => void;
  editName: string;
  setEditName: (val: string) => void;
  editPhone: string;
  setEditPhone: (val: string) => void;
  isUpdating: boolean;
  onChangePassword: (current: string, newPassword: string) => Promise<void>;
  changingPassword: boolean;
  addresses: IAddress[];
  addressModalOpen: boolean;
  editingAddressId: string | null;
  addressForm: AddressFormData;
  onChangeAddressForm: (form: AddressFormData) => void;
  onOpenAddAddress: () => void;
  onOpenEditAddress: (addr: IAddress) => void;
  onCloseAddressModal: () => void;
  onSaveAddress: (e: React.FormEvent) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
  onDeleteAccount: (password: string) => void;
  deletingAccount: boolean;
}

const AccountProfile = ({
  user,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveProfile,
  editName,
  setEditName,
  editPhone,
  setEditPhone,
  isUpdating,
  onChangePassword,
  changingPassword,
  addresses,
  addressModalOpen,
  editingAddressId,
  addressForm,
  onChangeAddressForm,
  onOpenAddAddress,
  onOpenEditAddress,
  onCloseAddressModal,
  onSaveAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onDeleteAccount,
  deletingAccount,
}: AccountProfileProps) => (
  <motion.div
    key="profile"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <ProfileInfoCard
      user={user}
      editing={editing}
      onStartEdit={onStartEdit}
      onCancelEdit={onCancelEdit}
      onSave={onSaveProfile}
      editName={editName}
      setEditName={setEditName}
      editPhone={editPhone}
      setEditPhone={setEditPhone}
      isUpdating={isUpdating}
    />

    <ChangePasswordCard
      onSubmit={onChangePassword}
      changingPassword={changingPassword}
    />

    <SavedAddressesCard
      addresses={addresses}
      onAdd={onOpenAddAddress}
      onEdit={onOpenEditAddress}
      onDelete={onDeleteAddress}
      onSetDefault={onSetDefaultAddress}
    />

    <DeleteAccountCard
      onDelete={onDeleteAccount}
      isDeleting={deletingAccount}
    />

    <AddressModal
      isOpen={addressModalOpen}
      editingAddressId={editingAddressId}
      addressForm={addressForm}
      onChange={onChangeAddressForm}
      onClose={onCloseAddressModal}
      onSubmit={onSaveAddress}
    />
  </motion.div>
);

// ─── Delete Account Card Component ─────────────────────────────
const DeleteAccountCard = ({
  onDelete,
  isDeleting,
}: {
  onDelete: (password: string) => void;
  isDeleting: boolean;
}) => {
  const [password, setPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setShowConfirmModal(true);
  };

  return (
    <>
      <div className="bg-white dark:bg-[#141414] rounded-2xl p-6 border border-red-200 dark:border-red-500/20 shadow-sm">
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">
          Delete Account
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This action is permanent and cannot be undone. All your personal data
          will be anonymised, but order history may be retained for legal reasons.
        </p>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
          >
            I want to delete my account
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="delete-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter your password to confirm
            </label>
            <input
              type="password"
              id="delete-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isDeleting}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
              placeholder="Your password"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isDeleting || !password}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isDeleting ? "Deleting..." : "Continue"}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                disabled={isDeleting}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Final confirmation modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          onDelete(password);
          setShowConfirmModal(false);
        }}
        title="Delete Account?"
        message="Are you absolutely sure? This action is irreversible."
        confirmText="Delete Forever"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default AccountProfile;