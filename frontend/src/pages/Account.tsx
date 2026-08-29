import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { AnimatePresence } from "framer-motion";
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
  useDeleteAccountMutation,
} from "../features/api/apiSlice";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

import AccountHeader from "./account/AccountHeader";
import AccountOrders from "./account/AccountOrders";
import AccountProfile from "./account/AccountProfile";
import OrderDetailModal from "./account/OrderDetailModal";
import ConfirmationModal from "../components/ConfirmationModal";

import type { Order, IAddress } from "../types/account";
import PushNotificationManager from "../components/PushNotificationManager";

const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const {
    data: orders = [],
    isLoading: loading,
    isError,
  } = useGetMyOrdersQuery();

  const error = isError
    ? "Could not load your orders. Please try again."
    : null;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const orderTabRef = useRef<HTMLButtonElement>(null);
  const profileTabRef = useRef<HTMLButtonElement>(null);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [updateProfileApi, { isLoading: isUpdating }] =
    useUpdateProfileMutation();

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

  const [changePassword, { isLoading: changingPassword }] =
    useChangePasswordMutation();

  const [deleteAccount, { isLoading: deletingAccount }] =
    useDeleteAccountMutation();

  // Address deletion confirmation state
  const [deleteAddressTarget, setDeleteAddressTarget] = useState<string | null>(null);
  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleTabKeyDown = (e: React.KeyboardEvent, current: "orders" | "profile") => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next: "orders" | "profile" =
      e.key === "Home" ? "orders" :
      e.key === "End" ? "profile" :
      current === "orders" ? "profile" : "orders";
    setActiveTab(next);
    (next === "orders" ? orderTabRef : profileTabRef).current?.focus();
  };

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
      window.location.href = "/login";
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      await deleteAccount(password).unwrap();
      toast.success("Account deleted successfully");
      dispatch(logout());
      window.location.href = "/";
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to delete account");
    }
  };

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

  // Address deletion with confirmation modal
  const requestDeleteAddress = (id: string) => {
    setDeleteAddressTarget(id);
    setIsDeleteAddressModalOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (!deleteAddressTarget) return;
    try {
      await deleteAddress(deleteAddressTarget).unwrap();
      toast.success("Address removed");
      refetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setIsDeleteAddressModalOpen(false);
      setDeleteAddressTarget(null);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    await setDefaultAddress(id);
    refetchAddresses();
    toast.success("Default address updated");
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto space-y-8 focus:outline-none bg-[#FCFAF5] dark:bg-[#0A0A0B]"
      style={{
        paddingTop: "calc(56px + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <SEO
        title="My Account"
        description="Manage your orders and profile settings."
      />

      <AccountHeader user={user} />

      {/* Tabs */}
      <nav
        className="flex gap-4 border-b border-gray-200 dark:border-white/[0.08]"
        role="tablist"
        aria-label="Account sections"
      >
        <button
          ref={orderTabRef}
          onClick={() => setActiveTab("orders")}
          onKeyDown={(e) => handleTabKeyDown(e, "orders")}
          role="tab"
          aria-selected={activeTab === "orders"}
          aria-controls="panel-orders"
          id="tab-orders"
          tabIndex={activeTab === "orders" ? 0 : -1}
          className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "orders"
              ? "border-[#e8622a] text-[#e8622a]"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          🧾 My Orders
        </button>
        <button
          ref={profileTabRef}
          onClick={() => setActiveTab("profile")}
          onKeyDown={(e) => handleTabKeyDown(e, "profile")}
          role="tab"
          aria-selected={activeTab === "profile"}
          aria-controls="panel-profile"
          id="tab-profile"
          tabIndex={activeTab === "profile" ? 0 : -1}
          className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "profile"
              ? "border-[#e8622a] text-[#e8622a]"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          👤 Profile Settings
        </button>
      </nav>

      <AnimatePresence mode="wait">
        {activeTab === "orders" ? (
          <div
            key="orders"
            role="tabpanel"
            id="panel-orders"
            aria-labelledby="tab-orders"
          >
            <AccountOrders
              orders={orders}
              loading={loading}
              error={error}
              onViewOrder={setSelectedOrder}
            />
          </div>
        ) : (
          <div
            key="profile"
            role="tabpanel"
            id="panel-profile"
            aria-labelledby="tab-profile"
          >
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
              onDeleteAddress={requestDeleteAddress}
              onSetDefaultAddress={handleSetDefaultAddress}
              onDeleteAccount={handleDeleteAccount}
              deletingAccount={deletingAccount}
            />
            <div className="mt-8">
              <PushNotificationManager />
            </div>
          </div>
        )}
      </AnimatePresence>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Address deletion confirmation modal */}
      <ConfirmationModal
        isOpen={isDeleteAddressModalOpen}
        onClose={() => setIsDeleteAddressModalOpen(false)}
        onConfirm={confirmDeleteAddress}
        title="Delete Address?"
        message="This address will be permanently removed from your account."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </main>
  );
};

export default Account;