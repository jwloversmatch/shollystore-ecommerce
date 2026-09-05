import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { RootState } from "../store";
import {
  useCreateOrderMutation,
  useGetPublicSettingsQuery,
  useGetAddressesQuery,
  useRegisterMutation,
} from "../features/api/apiSlice";
import { clearCart } from "../features/cart/cartSlice";
import CreateAccountModal from "../components/CreateAccountModal";
import {
  MapPin,
  Building,
  CreditCard,
  Banknote,
  MessageCircle,
  Home,
  Briefcase,
  CheckCircle,
  Flame,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Mail,
  User,
  Phone,
} from "lucide-react";
import SEO from "../components/SEO";
import { calculateShippingFee } from "../utils/format";
import type { SettingsData } from "../pages/admin/settings/settingsSchema";

const ACCENT = "#e8622a";
const FOCUS_RING =
  "focus-within:ring-2 focus-within:ring-[#e8622a] focus-within:ring-offset-2";

interface IAddress {
  _id: string;
  label: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
}
interface CartItem {
  _id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  stock?: number;
}
interface OrderResponse {
  _id: string;
  trackingNumber?: string;
}
interface PersistState {
  _persist: { version: number; rehydrated: boolean };
}

const checkoutSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
});
type CheckoutFormData = z.infer<typeof checkoutSchema>;

const buildInputCls = (hasError: boolean) =>
  [
    "w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-gray-100 dark:bg-[#1c1c1c] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 outline-none transition-all duration-200",
    hasError
      ? "border border-red-500/50 ring-2 ring-red-500/10"
      : "border border-gray-300 dark:border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
  ].join(" ");

const AmbientBg = () => (
  <div aria-hidden="true">
    <motion.div
      animate={{ x: ["-12%", "12%", "-12%"], y: ["-8%", "8%", "-8%"] }}
      transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{
        width: 640,
        height: 640,
        top: -200,
        left: -200,
        background: ACCENT,
        opacity: 0.065,
      }}
    />
    <motion.div
      animate={{ x: ["12%", "-12%", "12%"], y: ["12%", "-10%", "12%"] }}
      transition={{ repeat: Infinity, duration: 38, ease: "linear" }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{
        width: 600,
        height: 600,
        bottom: -200,
        right: -200,
        background: "#10b981",
        opacity: 0.04,
      }}
    />
    <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:28px_28px]" />
  </div>
);

const PAYMENT_METHODS = [
  {
    id: "paystack",
    label: "Paystack",
    sub: "Card / Bank Transfer",
    icon: <CreditCard className="w-5 h-5" aria-hidden="true" />,
    color: "#3b82f6",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    sub: "Manual bank deposit",
    icon: <Banknote className="w-5 h-5" aria-hidden="true" />,
    color: "#10b981",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Pay",
    sub: "Chat to complete order",
    icon: <MessageCircle className="w-5 h-5" aria-hidden="true" />,
    color: "#25D366",
  },
] as const;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((s: RootState) => s.cart);
  const { user } = useSelector((s: RootState) => s.auth);
  const isRehydrated = useSelector(
    (s: RootState & PersistState) => s._persist?.rehydrated,
  );

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { data: publicSettings } = useGetPublicSettingsQuery({});
  const { data: savedAddresses = [] } = useGetAddressesQuery({});
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  const {
    register: registerForm,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema) });

  const [paymentMethod, setPaymentMethod] = useState<
    "paystack" | "bank_transfer" | "whatsapp"
  >("paystack");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isNewAddress, setIsNewAddress] = useState(true);

  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  const selectedSavedAddress = savedAddresses.find(
    (addr: IAddress) => addr._id === selectedAddressId,
  );

  const selectSavedAddress = (addr: IAddress) => {
    setSelectedAddressId(addr._id);
    setIsNewAddress(false);
    reset({ address: addr.address, city: addr.city });
  };
  const selectNewAddress = () => {
    setIsNewAddress(true);
    setSelectedAddressId(null);
    reset({ address: "", city: "" });
  };

  const city = useWatch({ control, name: "city" }) || "";
  const shippingFee = calculateShippingFee(
    selectedSavedAddress && !isNewAddress ? selectedSavedAddress.city : city,
  );

  const totalPrice = cart.cartItems.reduce(
    (a: number, i: CartItem) => a + i.price * i.qty,
    0,
  );
  const finalTotal = totalPrice - cart.couponDiscount + shippingFee;

  const handleCreateAccount = async (password: string) => {
    try {
      await register({
        email: guestEmail,
        password,
        name: guestName,
        phone: guestPhone,
      }).unwrap();
      toast.success("Account created! Please check your email to verify.");
      setShowCreateAccountModal(false);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to create account");
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user && isRehydrated && !guestEmail.trim()) {
      toast.error("Email is required for guest checkout");
      return;
    }

    try {
      const finalShippingAddress =
        selectedSavedAddress && !isNewAddress
          ? {
              address: selectedSavedAddress.address,
              city: selectedSavedAddress.city,
              postalCode: selectedSavedAddress.postalCode || "",
              country: selectedSavedAddress.country || "Nigeria",
            }
          : {
              address: data.address,
              city: data.city,
              postalCode: "",
              country: "Nigeria",
            };

      const orderPayload = {
        orderItems: cart.cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
          stock: item.stock,
        })),
        shippingAddress: finalShippingAddress,
        paymentMethod,
        couponCode: cart.appliedCoupon || undefined,
        ...(user
          ? {}
          : {
              guestEmail: guestEmail.trim(),
              name: guestName.trim() || undefined,
              phone: guestPhone.trim() || undefined,
            }),
      };

      const result = await createOrder(orderPayload).unwrap();
      dispatch(clearCart());

      if (paymentMethod === "paystack") {
        window.location.assign(result.paymentUrl);
      } else {
        setOrderSuccess(true);
        setOrderData(result.order);
        if (!user) {
          setShowCreateAccountModal(true);
        }
      }
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      toast.error(
        e?.data?.message || "Failed to place order. Please try again.",
      );
    }
  };

  if (!isRehydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] dark:bg-[#0A0A0B]">
        <SEO title="Checkout" description="Complete your order securely." />
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </main>
    );
  }

  if (orderSuccess) {
    // Extract default bank account from public settings
    const defaultAccount =
      (publicSettings as SettingsData)?.bankAccounts?.find(
        (acc) => acc.isDefault && acc.isActive,
      ) ||
      (publicSettings as SettingsData)?.bankAccounts?.find(
        (acc) => acc.isActive,
      );

    const bankName = defaultAccount?.bankName || "GTBank";
    const accountName = defaultAccount?.accountName || "Sholex";
    const accountNumber = defaultAccount?.accountNumber || "0123456789";
    const whatsappNumber =
      (publicSettings as SettingsData)?.whatsappNumber || "+2348000000000";

    const waLink = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
    const orderEmail = user?.email || guestEmail;
    const orderId = orderData?._id;
    const trackingNumber = orderData?.trackingNumber || orderId;

    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none"
      >
        <SEO
          title="Order Placed"
          description="Your order has been placed successfully."
        />
        <AmbientBg />
        <div className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10 bg-[#FCFAF5] dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07] shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.65)]">
          <div className="flex justify-center mb-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: `${ACCENT}15`,
                boxShadow: `0 0 0 3px ${ACCENT}`,
              }}
            >
              <CheckCircle
                className="w-9 h-9"
                style={{ color: ACCENT }}
                aria-hidden="true"
              />
            </div>
          </div>
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2 text-center"
            style={{ color: ACCENT }}
          >
            Order received
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center leading-tight">
            Order Placed!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
            Reference:{" "}
            <span className="font-bold text-gray-900 dark:text-white font-mono text-xs px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-[#1c1c1c]">
              #{trackingNumber}
            </span>
          </p>
          {paymentMethod === "bank_transfer" && (
            <div className="rounded-2xl p-5 mb-6 border bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25">
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
                Bank Transfer Details
              </p>
              {[
                { label: "Bank", val: bankName },
                { label: "Account Name", val: accountName },
                {
                  label: "Account Number",
                  val: accountNumber,
                  highlight: true,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center text-sm mt-1"
                >
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {row.label}
                  </span>
                  <span
                    className={`font-bold ${row.highlight ? "text-emerald-600 dark:text-emerald-400 font-mono tracking-widest text-base" : "text-gray-900 dark:text-white"}`}
                  >
                    {row.val}
                  </span>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-500/20">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Send transfer receipt to WhatsApp:
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: "#25D366",
                    boxShadow: "0 4px 12px rgba(37,211,102,0.35)",
                  }}
                  aria-label={`Chat on WhatsApp: ${whatsappNumber}`}
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />{" "}
                  {whatsappNumber}
                </a>
              </div>
            </div>
          )}
          {paymentMethod === "whatsapp" && (
            <div className="rounded-2xl p-5 mb-6 border bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/25">
              <p className="text-xs font-extrabold uppercase tracking-widest mb-3 text-green-600 dark:text-green-400">
                WhatsApp Payment
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                Chat with us to confirm your order and complete payment.
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white w-full justify-center"
                style={{
                  background: "#25D366",
                  boxShadow: "0 6px 18px rgba(37,211,102,0.35)",
                }}
                aria-label="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" /> Chat on
                WhatsApp
              </a>
            </div>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group"
            style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
            aria-label="Continue shopping"
          >
            Continue Shopping{" "}
            <ArrowRight
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </button>

          <button
            onClick={() =>
              navigate(
                `/track-order?orderId=${trackingNumber}&email=${encodeURIComponent(orderEmail || "")}`,
              )
            }
            className="mt-3 w-full py-3 rounded-xl font-bold text-sm border border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            aria-label="Track your order"
          >
            Track Order
          </button>
        </div>

        <CreateAccountModal
          isOpen={showCreateAccountModal}
          guestEmail={guestEmail}
          onClose={() => setShowCreateAccountModal(false)}
          onCreateAccount={handleCreateAccount}
          isCreating={isRegistering}
        />
      </main>
    );
  }

  if (cart.cartItems.length === 0) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen flex items-center justify-center bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none"
      >
        <SEO title="Checkout" description="Complete your order securely." />
        <div className="text-center p-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">
            Your cart is empty.
          </p>
          <button
            onClick={() => navigate("/")}
            className="font-bold hover:opacity-80 transition-opacity"
            style={{ color: ACCENT }}
            aria-label="Back to shop"
          >
            ← Back to Shop
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen px-4 py-8 pb-28 md:pb-10 md:py-10 relative overflow-x-hidden bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none"
    >
      <SEO
        title="Checkout"
        description="Complete your order with secure payment options."
      />
      <AmbientBg />
      <div className="max-w-6xl mx-auto">
        <header className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${ACCENT}18` }}
              >
                <Flame
                  className="w-4 h-4"
                  style={{ color: ACCENT }}
                  aria-hidden="true"
                />
              </div>
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
                style={{ color: ACCENT }}
              >
                Secure Checkout
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              Complete Your Order
            </h1>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.08]"
            aria-label="Back to cart"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Cart
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 lg:gap-8 items-start">
          <div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              aria-label="Checkout form"
            >
              {!user && isRehydrated && (
                <fieldset className="rounded-2xl p-5 md:p-6 space-y-4 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07]">
                  <legend className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4">
                    Contact Information
                  </legend>
                  <div>
                    <label
                      htmlFor="guest-email"
                      className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                    >
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        type="email"
                        id="guest-email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-gray-100 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 outline-none"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="guest-name"
                      className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                    >
                      Full Name (optional)
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        id="guest-name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-gray-100 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="guest-phone"
                      className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                    >
                      Phone (optional)
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        type="tel"
                        id="guest-phone"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm bg-gray-100 dark:bg-[#1c1c1c] border border-gray-300 dark:border-white/[0.08] text-gray-900 dark:text-white placeholder-gray-500 focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 outline-none"
                        placeholder="+2348012345678"
                      />
                    </div>
                  </div>
                </fieldset>
              )}

              {savedAddresses.length > 0 && (
                <fieldset className="rounded-2xl p-5 md:p-6 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07]">
                  <legend className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4">
                    Delivery Address
                  </legend>
                  <div className="space-y-2.5">
                    {savedAddresses.map((addr: IAddress) => {
                      const active =
                        selectedAddressId === addr._id && !isNewAddress;
                      return (
                        <label
                          key={addr._id}
                          className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${FOCUS_RING} ${active ? "bg-[#e8622a]/10 border-[#e8622a] shadow-[0_0_0_1px_#e8622a]" : "bg-gray-100 dark:bg-[#1c1c1c] border-gray-200 dark:border-white/[0.07]"}`}
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            className="sr-only"
                            checked={active}
                            onChange={() => selectSavedAddress(addr)}
                          />
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                            style={{ borderColor: active ? ACCENT : "#4b5563" }}
                          >
                            {active && (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: ACCENT }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm flex items-center gap-1.5 text-gray-900 dark:text-white">
                              {addr.label === "Home" ? (
                                <Home
                                  className="w-3.5 h-3.5"
                                  style={{ color: ACCENT }}
                                  aria-hidden="true"
                                />
                              ) : (
                                <Briefcase
                                  className="w-3.5 h-3.5"
                                  style={{ color: ACCENT }}
                                  aria-hidden="true"
                                />
                              )}
                              {addr.label}
                              {addr.isDefault && (
                                <span
                                  className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                  style={{
                                    background: `${ACCENT}20`,
                                    color: ACCENT,
                                  }}
                                >
                                  Default
                                </span>
                              )}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate">
                              {addr.address}, {addr.city}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                    <label
                      className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${FOCUS_RING} ${isNewAddress ? "bg-[#e8622a]/10 border-[#e8622a] shadow-[0_0_0_1px_#e8622a]" : "bg-gray-100 dark:bg-[#1c1c1c] border-gray-200 dark:border-white/[0.07]"}`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        className="sr-only"
                        checked={isNewAddress}
                        onChange={selectNewAddress}
                      />
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          borderColor: isNewAddress ? ACCENT : "#4b5563",
                        }}
                      >
                        {isNewAddress && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: ACCENT }}
                          />
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                        + Enter new address
                      </span>
                    </label>
                  </div>
                </fieldset>
              )}
              <AnimatePresence>
                {isNewAddress && (
                  <div className="rounded-2xl p-5 md:p-6 space-y-4 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07]">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                      New Address
                    </p>
                    <div>
                      <label
                        htmlFor="checkout-address"
                        className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                      >
                        Street Address
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                          style={{
                            color: errors.address ? "#ef4444" : "#4b5563",
                          }}
                          aria-hidden="true"
                        />
                        <input
                          id="checkout-address"
                          {...registerForm("address")}
                          placeholder="123 Main Street, Lagos"
                          className={buildInputCls(!!errors.address)}
                          aria-invalid={!!errors.address}
                          aria-describedby={
                            errors.address
                              ? "checkout-address-error"
                              : undefined
                          }
                        />
                      </div>
                      {errors.address && (
                        <p
                          id="checkout-address-error"
                          className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                          role="alert"
                        >
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="checkout-city"
                        className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                      >
                        City
                      </label>
                      <div className="relative">
                        <Building
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                          style={{ color: errors.city ? "#ef4444" : "#4b5563" }}
                          aria-hidden="true"
                        />
                        <input
                          id="checkout-city"
                          {...registerForm("city")}
                          placeholder="Lagos"
                          className={buildInputCls(!!errors.city)}
                          aria-invalid={!!errors.city}
                          aria-describedby={
                            errors.city ? "checkout-city-error" : undefined
                          }
                        />
                      </div>
                      {errors.city && (
                        <p
                          id="checkout-city-error"
                          className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                          role="alert"
                        >
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </AnimatePresence>
              <fieldset className="rounded-2xl p-5 md:p-6 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07]">
                <legend className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4">
                  Payment Method
                </legend>
                <div className="space-y-2.5">
                  {PAYMENT_METHODS.map((pm) => {
                    const active = paymentMethod === pm.id;
                    return (
                      <label
                        key={pm.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${FOCUS_RING} ${active ? `bg-${pm.color}/10 border-${pm.color} shadow-[0_0_0_1px_${pm.color}]` : "bg-gray-100 dark:bg-[#1c1c1c] border-gray-200 dark:border-white/[0.07]"}`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          value={pm.id}
                          checked={active}
                          onChange={() =>
                            setPaymentMethod(pm.id as typeof paymentMethod)
                          }
                        />
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                          style={{ borderColor: active ? pm.color : "#4b5563" }}
                        >
                          {active && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: pm.color }}
                            />
                          )}
                        </div>
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: `${pm.color}18`,
                            color: pm.color,
                          }}
                        >
                          {pm.icon}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white">
                            {pm.label}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {pm.sub}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed"
                style={{
                  background: ACCENT,
                  boxShadow: `0 8px 24px ${ACCENT}44`,
                }}
                aria-label={
                  isLoading
                    ? "Processing order"
                    : paymentMethod === "paystack"
                      ? `Pay ₦${finalTotal.toLocaleString()} via Paystack`
                      : "Place order"
                }
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="w-5 h-5 animate-spin"
                      aria-hidden="true"
                    />{" "}
                    Processing…
                  </>
                ) : paymentMethod === "paystack" ? (
                  <>
                    <CreditCard className="w-5 h-5" aria-hidden="true" /> Pay ₦
                    {finalTotal.toLocaleString()}
                  </>
                ) : (
                  <>
                    Place Order{" "}
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </div>
          <aside className="lg:sticky lg:top-24" aria-label="Order summary">
            <div className="relative rounded-2xl p-5 md:p-6 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07] shadow-lg dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div
                className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
                style={{
                  background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                }}
              />
              <h2 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-5">
                Order Summary
              </h2>
              <div
                className="space-y-3 max-h-[220px] overflow-y-auto pr-1 mb-5"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: `${ACCENT}40 transparent`,
                }}
              >
                {cart.cartItems.map((item: CartItem) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-white/[0.08]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {item.qty} × ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="font-black text-sm shrink-0 text-gray-900 dark:text-white">
                      ₦{(item.price * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-px mb-5 bg-gray-200 dark:bg-white/[0.06]" />
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    Subtotal
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>
                {cart.couponDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      Discount
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      - ₦{cart.couponDiscount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    Delivery
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {shippingFee === 0
                      ? "Free"
                      : `₦${shippingFee.toLocaleString()}`}
                  </span>
                </div>
              </div>
              <div className="h-px my-4 bg-gray-200 dark:bg-white/[0.06]" />
              <div className="flex justify-between items-end">
                <span className="text-gray-400 dark:text-gray-500 font-bold text-sm uppercase tracking-wider">
                  Total
                </span>
                <span className="text-3xl font-black" style={{ color: ACCENT }}>
                  ₦{finalTotal.toLocaleString()}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-center gap-2">
                <AlertCircle
                  className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  Secured by Paystack · Nigeria
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
