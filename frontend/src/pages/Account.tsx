import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { motion, AnimatePresence } from "framer-motion";
import { updateProfile } from "../features/auth/authSlice";
import {
  useUpdateProfileMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} from "../features/api/apiSlice";
import toast from "react-hot-toast";
import api from "../services/axios";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Package,
  Mail,
  User,
  Phone,
  Eye,
  X,
  AlertCircle,
  Calendar,
  CreditCard,
  MapPin,
  Ticket,
  Home,
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  Check,
} from "lucide-react";
import { OrderRowSkeleton } from "../components/Skeletons";
import SEO from "../components/SEO";

// ---------- Types ----------
interface OrderItemDetail {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  orderItems: OrderItemDetail[];
  shippingAddress?: {
    address: string;
    city: string;
    postalCode?: string;
    country?: string;
  };
  paymentMethod?: string;
  name?: string;
  phone?: string;
  couponCode?: string;
  discount?: number;
}

interface IAddress {
  _id: string;
  label: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
}

// ---------- Status helpers ----------
const getStatusInfo = (
  status: string,
): { icon: React.ReactNode; color: string; label: string } => {
  const map: Record<
    string,
    { icon: React.ReactNode; color: string; label: string }
  > = {
    Paid: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: "bg-green-100 text-green-700",
      label: "Paid",
    },
    Pending: {
      icon: <Clock className="w-4 h-4" />,
      color: "bg-yellow-100 text-yellow-700",
      label: "Pending",
    },
    Shipped: {
      icon: <Truck className="w-4 h-4" />,
      color: "bg-blue-100 text-blue-700",
      label: "Shipped",
    },
    Delivered: {
      icon: <Package className="w-4 h-4" />,
      color: "bg-purple-100 text-purple-700",
      label: "Delivered",
    },
  };
  return (
    map[status] || {
      icon: <AlertCircle className="w-4 h-4" />,
      color: "bg-gray-100 text-gray-700",
      label: status,
    }
  );
};

const paymentLabels: Record<string, string> = {
  paystack: "Paystack",
  bank_transfer: "Bank Transfer",
  whatsapp: "WhatsApp",
};

const Account = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile editing state (name & phone only)
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [updateProfileApi, { isLoading: isUpdating }] =
    useUpdateProfileMutation();

  // ---------- Address management ----------
  const { data: addresses = [], refetch: refetchAddresses } = useGetAddressesQuery({});
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

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my-orders");
        setOrders(res.data);
        setError(null);
      } catch {
        setError("Could not load your orders. Please try again.");
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const startEditing = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfileApi({
        name: editName,
        phone: editPhone,
      }).unwrap();
      dispatch(updateProfile(updatedUser));
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  // ---------- Address handlers ----------
  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({ label: "Home", address: "", city: "", postalCode: "", country: "", isDefault: false });
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

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
    refetchAddresses();
    toast.success("Default address updated");
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 md:p-6 pt-20 md:pt-24 max-w-6xl mx-auto space-y-8">
        <SEO
          title="My Account"
          description="Manage your orders and profile settings."
        />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-6xl mx-auto space-y-8"
    >
      <SEO
        title="My Account"
        description="Manage your orders and profile settings."
      />

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-6 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-leaf-green to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {user?.name?.charAt(0)?.toUpperCase() ||
            user?.email?.charAt(0)?.toUpperCase() ||
            "U"}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {user?.name || "Welcome back!"}
          </h1>
          <p className="text-gray-500 flex items-center gap-1 mt-1">
            <Mail className="w-4 h-4" />
            {user?.email}
          </p>
          {user?.phone && (
            <p className="text-gray-500 flex items-center gap-1 mt-0.5">
              <Phone className="w-4 h-4" />
              {user.phone}
            </p>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "orders"
              ? "border-leaf-green text-leaf-green"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          🧾 My Orders
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "profile"
              ? "border-leaf-green text-leaf-green"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          👤 Profile Settings
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "orders" ? (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {error && (
              <div className="bg-red-50 text-red-700 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            {!error && orders.length === 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't placed any orders. Start shopping!</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/")}
                  className="bg-leaf-green text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition"
                >
                  Browse Products
                </motion.button>
              </div>
            )}
            <div className="space-y-3">
              {orders.map((order, idx) => {
                const { icon, color, label } = getStatusInfo(order.status);
                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Order #</p>
                          <p className="font-medium text-gray-800 text-sm mt-0.5">
                            {order._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                          <p className="font-medium text-gray-800 text-sm mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(order.createdAt).toLocaleDateString("en-NG", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${color}`}>
                            {icon}
                            {label}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                          <p className="font-bold text-leaf-green text-sm mt-0.5">
                            ₦{order.totalPrice.toLocaleString()}
                            {order.couponCode && (
                              <span className="ml-1 inline-flex items-center gap-0.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                <Ticket className="w-3 h-3" />
                                {order.couponCode}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 text-sm font-medium text-leaf-green hover:underline shrink-0 self-end sm:self-center"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                    <div className="sm:hidden px-4 pb-3">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-leaf-green/10 flex items-center justify-center text-2xl">
                    <User className="w-8 h-8 text-leaf-green" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{user?.name || "User"}</h3>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </p>
                  </div>
                </div>
                {!editing ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startEditing}
                    className="px-4 py-2 bg-leaf-green text-white rounded-xl font-medium text-sm shadow-md hover:bg-green-700 transition"
                  >
                    Edit Profile
                  </motion.button>
                ) : (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      disabled={isUpdating}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 bg-leaf-green text-white rounded-xl font-medium shadow-md hover:bg-green-700 transition disabled:opacity-60"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50/60 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Full Name</p>
                    <p className="font-medium text-gray-800 mt-1">{user?.name || "Not set"}</p>
                  </div>
                  <div className="bg-gray-50/60 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Phone Number</p>
                    <p className="font-medium text-gray-800 mt-1">{user?.phone || "Not set"}</p>
                  </div>
                  <div className="bg-gray-50/60 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Email Address</p>
                    <p className="font-medium text-gray-800 mt-1 break-all">{user?.email}</p>
                  </div>
                  <div className="bg-gray-50/60 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Member Since</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Addresses */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-leaf-green" />
                  Saved Addresses
                </h3>
                <button
                  onClick={openAddAddress}
                  className="flex items-center gap-1.5 text-sm font-medium text-leaf-green hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-sm text-gray-500">No saved addresses yet.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr: IAddress) => (
                    <div
                      key={addr._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {addr.label === "Home" ? (
                            <Home className="w-4 h-4 text-leaf-green" />
                          ) : (
                            <Briefcase className="w-4 h-4 text-leaf-green" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-800">{addr.label}</p>
                            {addr.isDefault && (
                              <span className="text-xs bg-leaf-green/10 text-leaf-green px-1.5 py-0.5 rounded-full font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {addr.address}, {addr.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr._id)}
                            className="p-1.5 text-gray-400 hover:text-leaf-green transition rounded-lg hover:bg-leaf-green/10"
                            title="Set as default"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEditAddress(addr)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Modal (Add / Edit) */}
      <AnimatePresence>
        {addressModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setAddressModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingAddressId ? "Edit Address" : "New Address"}
                  </h2>
                  <button onClick={() => setAddressModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <select
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                      placeholder="City"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefaultAddress"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="w-4 h-4 text-leaf-green focus:ring-leaf-green rounded"
                    />
                    <label htmlFor="isDefaultAddress" className="text-sm text-gray-700">
                      Set as default address
                    </label>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setAddressModalOpen(false)}
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
          </>
        )}
      </AnimatePresence>

      {/* Order Details Modal (unchanged) */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-white/40">
                <div className="sticky top-0 bg-white/90 backdrop-blur-md p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex flex-wrap gap-3 items-center">
                    {(() => {
                      const { icon, color, label } = getStatusInfo(selectedOrder.status);
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${color}`}>
                          {icon}
                          {label}
                        </span>
                      );
                    })()}
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedOrder.createdAt).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {selectedOrder.paymentMethod && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {paymentLabels[selectedOrder.paymentMethod] ||
                          selectedOrder.paymentMethod}
                      </span>
                    )}
                  </div>
                  {selectedOrder.shippingAddress && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-800 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        {selectedOrder.shippingAddress.address},{" "}
                        {selectedOrder.shippingAddress.city}
                        {selectedOrder.shippingAddress.postalCode
                          ? `, ${selectedOrder.shippingAddress.postalCode}`
                          : ""}
                        {selectedOrder.shippingAddress.country
                          ? `, ${selectedOrder.shippingAddress.country}`
                          : ""}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.orderItems.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-3"
                        >
                          <span className="text-gray-700 font-medium">{item.name}</span>
                          <span className="text-gray-500">
                            {item.qty} × ₦{item.price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total section with coupon breakdown */}
                  {(() => {
                    const subtotal = selectedOrder.orderItems.reduce(
                      (sum, item) => sum + item.price * item.qty,
                      0
                    );
                    const discount = selectedOrder.discount || 0;
                    const hasCoupon = !!selectedOrder.couponCode;

                    return (
                      <div className="pt-4 border-t border-gray-100 space-y-2">
                        {hasCoupon && (
                          <>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Subtotal</span>
                              <span>₦{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600">
                              <span className="flex items-center gap-1">
                                <Ticket className="w-3.5 h-3.5" />
                                Discount ({selectedOrder.couponCode})
                              </span>
                              <span>- ₦{discount.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-800 font-semibold text-lg">Total</span>
                          <span className="text-2xl font-bold text-leaf-green">
                            ₦{selectedOrder.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Account;