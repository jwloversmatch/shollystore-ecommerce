import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { motion, AnimatePresence } from "framer-motion";
import { updateProfile, logout } from "../features/auth/authSlice";
import {
  useUpdateProfileMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useChangePasswordMutation,
  useGetMyOrdersQuery,
} from "../features/api/apiSlice";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

import AccountHeader from "./account/AccountHeader";
import AccountOrders from "./account/AccountOrders";
import AccountProfile from "./account/AccountProfile";
import OrderDetailModal from "./account/OrderDetailModal";

import type { Order, IAddress } from "../types/account";
import PushNotificationManager from "../components/PushNotificationManager";

const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Orders – no argument needed
  const {
    data: orders = [],
    isLoading: loading,
    isError,
  } = useGetMyOrdersQuery();

  const error = isError
    ? "Could not load your orders. Please try again."
    : null;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // tabs
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  // profile editing
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [updateProfileApi, { isLoading: isUpdating }] =
    useUpdateProfileMutation();

  // addresses
  const { data: addresses = [], refetch: refetchAddresses } =
    useGetAddressesQuery({});
  const [addAddress] = useAddAddressMutation();
  const [updateAddress] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });

  // change password
  const [changePassword, { isLoading: changingPassword }] =
    useChangePasswordMutation();

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const startEditing = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateProfileApi({
        name: editName,
        phone: editPhone,
      }).unwrap();
      dispatch(updateProfile(res.user));
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleChangePassword = async (current: string, newPw: string) => {
    try {
      await changePassword({
        currentPassword: current,
        newPassword: newPw,
      }).unwrap();
      toast.success("Password changed. Please log in again.");
      dispatch(logout());
      navigate("/login");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  // address handlers
  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: "Home",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      isDefault: false,
    });
    setAddressModalOpen(true);
  };

  const openEditAddress = (addr: IAddress) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      label: addr.label,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode || "",
      country: addr.country || "",
      isDefault: addr.isDefault,
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await updateAddress({ id: editingAddressId, ...addressForm }).unwrap();
        toast.success("Address updated");
      } else {
        await addAddress(addressForm).unwrap();
        toast.success("Address added");
      }
      refetchAddresses();
      setAddressModalOpen(false);
    } catch {
      toast.error("Failed to save address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm("Delete this address?")) {
      await deleteAddress(id);
      refetchAddresses();
      toast.success("Address removed");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    await setDefaultAddress(id);
    refetchAddresses();
    toast.success("Default address updated");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen p-4 md:p-6 pt-20 md:pt-24 pb-24 md:pb-16 max-w-6xl mx-auto space-y-8"
      style={{ background: "#0A0A0B" }}
    >
      <SEO
        title="My Account"
        description="Manage your orders and profile settings."
      />

      <AccountHeader user={user} />

      {/* Tabs - dark themed */}
      <div
        className="flex gap-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "orders"
              ? "border-[#e8622a] text-[#e8622a]"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          🧾 My Orders
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "profile"
              ? "border-[#e8622a] text-[#e8622a]"
              : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          👤 Profile Settings
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "orders" ? (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <AccountOrders
              orders={orders}
              loading={loading}
              error={error}
              onViewOrder={setSelectedOrder}
            />
          </motion.div>
        ) : (
          <AccountProfile
            user={user}
            editing={editing}
            onStartEdit={startEditing}
            onCancelEdit={cancelEditing}
            onSaveProfile={handleSaveProfile}
            editName={editName}
            setEditName={setEditName}
            editPhone={editPhone}
            setEditPhone={setEditPhone}
            isUpdating={isUpdating}
            onChangePassword={handleChangePassword}
            changingPassword={changingPassword}
            addresses={addresses}
            addressModalOpen={addressModalOpen}
            editingAddressId={editingAddressId}
            addressForm={addressForm}
            onChangeAddressForm={setAddressForm}
            onOpenAddAddress={openAddAddress}
            onOpenEditAddress={openEditAddress}
            onCloseAddressModal={() => setAddressModalOpen(false)}
            onSaveAddress={handleSaveAddress}
            onDeleteAddress={handleDeleteAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
          />
        )}
        {activeTab === "profile" && (
          <div className="mt-8">
            <PushNotificationManager />
          </div>
        )}
      </AnimatePresence>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </motion.div>
  );
};

export default Account;