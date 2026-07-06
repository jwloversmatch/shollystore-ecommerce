import { motion } from "framer-motion";
import ProfileInfoCard from "./ProfileInfoCard";
import ChangePasswordCard from "./ChangePasswordCard";
import SavedAddressesCard from "./SavedAddressesCard";
import AddressModal from "./AddressModal";
import type { User as UserType } from "../../features/auth/authSlice";
import type { IAddress } from "../../types/account";

// Reuse the form data shape from the modal (or define inline)
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
  // password
  onChangePassword: (current: string, newPassword: string) => Promise<void>;
  changingPassword: boolean;
  // addresses
  addresses: IAddress[];
  addressModalOpen: boolean;
  editingAddressId: string | null;
  addressForm: AddressFormData;                        // typed
  onChangeAddressForm: (form: AddressFormData) => void; // typed
  onOpenAddAddress: () => void;
  onOpenEditAddress: (addr: IAddress) => void;
  onCloseAddressModal: () => void;
  onSaveAddress: (e: React.FormEvent) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
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

export default AccountProfile;