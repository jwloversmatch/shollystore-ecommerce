import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { RootState } from "../store";
import {
  useCreateOrderMutation,
  useGetPublicSettingsQuery,
  useValidateCouponMutation,
  useGetAddressesQuery,
} from "../features/api/apiSlice";
import { clearCart } from "../features/cart/cartSlice";
import {
  MapPin, Building, CreditCard, Banknote, MessageCircle,
  X, Home, Briefcase, CheckCircle, Flame, Tag, ArrowRight, Loader2, AlertCircle, ArrowLeft,
} from "lucide-react";
import SEO from "../components/SEO";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";

// ─── Types ────────────────────────────────────────────────────────────────────
interface IAddress {
  _id: string; label: string; address: string;
  city: string; postalCode?: string; country?: string; isDefault: boolean;
}
interface CartItem {
  _id: string; name: string; price: number; qty: number; image: string; stock?: number;
}
interface OrderResponse { _id: string; }

// ─── Schema ───────────────────────────────────────────────────────────────────
const checkoutSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  city:    z.string().min(2, "City is required"),
});
type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ─── Input class builder ──────────────────────────────────────────────────────
const inputCls = (hasError: boolean) =>
  [
    "w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white",
    "bg-[#1c1c1c] placeholder-gray-600 outline-none transition-all duration-200",
    hasError
      ? "border border-red-500/50 ring-2 ring-red-500/10"
      : "border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
  ].join(" ");

// ─── Ambient background ────────────────────────────────────────────────────────
const AmbientBg = () => (
  <>
    <motion.div animate={{ x:["-12%","12%","-12%"], y:["-8%","8%","-8%"] }}
      transition={{ repeat:Infinity, duration:30, ease:"linear" }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{ width:640, height:640, top:-200, left:-200, background:ACCENT, opacity:0.065 }} />
    <motion.div animate={{ x:["12%","-12%","12%"], y:["12%","-10%","12%"] }}
      transition={{ repeat:Infinity, duration:38, ease:"linear" }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{ width:600, height:600, bottom:-200, right:-200, background:"#10b981", opacity:0.04 }} />
    <div className="fixed inset-0 pointer-events-none -z-10"
      style={{ backgroundImage:"radial-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)", backgroundSize:"28px 28px" }} />
  </>
);

// ─── Payment method config ────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id:"paystack",      label:"Paystack",      sub:"Card / Bank Transfer",  icon:<CreditCard  className="w-5 h-5" />, color:"#3b82f6" },
  { id:"bank_transfer", label:"Bank Transfer", sub:"Manual bank deposit",   icon:<Banknote    className="w-5 h-5" />, color:"#10b981" },
  { id:"whatsapp",      label:"WhatsApp Pay",  sub:"Chat to complete order",icon:<MessageCircle className="w-5 h-5"/>, color:"#25D366" },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
const Checkout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();

  const cart      = useSelector((s: RootState) => s.cart);
  const { user }  = useSelector((s: RootState) => s.auth);

  const [createOrder, { isLoading }]             = useCreateOrderMutation();
  const { data: publicSettings }                 = useGetPublicSettingsQuery({});
  const [validateCoupon, { isLoading:isApplying }] = useValidateCouponMutation();
  const { data: savedAddresses = [] }            = useGetAddressesQuery({});

  const { register, handleSubmit, reset, formState:{ errors } } =
    useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema) });

  const [paymentMethod, setPaymentMethod] = useState<"paystack"|"bank_transfer"|"whatsapp">("paystack");
  const [orderSuccess, setOrderSuccess]   = useState(false);
  const [orderData,    setOrderData]      = useState<OrderResponse | null>(null);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isNewAddress,       setIsNewAddress]      = useState(true);

  // Helper to select a saved address and fill the form
  const selectSavedAddress = (addr: IAddress) => {
    setSelectedAddressId(addr._id);
    setIsNewAddress(false);
    reset({ address: addr.address, city: addr.city });
  };

  // Helper to switch to new address mode
  const selectNewAddress = () => {
    setIsNewAddress(true);
    setSelectedAddressId(null);
    reset({ address: "", city: "" });
  };

  // Coupon state
  const [couponCode,     setCouponCode]     = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError,    setCouponError]    = useState("");
  const [appliedCoupon,  setAppliedCoupon]  = useState<string | null>(null);

  const totalPrice = cart.cartItems.reduce((a: number, i: CartItem) => a + i.price * i.qty, 0);
  const finalTotal = totalPrice - couponDiscount;

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;
    try {
      const res = await validateCoupon({ code: couponCode, orderTotal: totalPrice }).unwrap();
      setCouponDiscount(res.coupon.discount);
      setAppliedCoupon(res.coupon.code);
      toast.success(`₦${res.coupon.discount.toLocaleString()} off applied!`);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setCouponError(e?.data?.message || "Invalid coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null); setCouponCode(""); setCouponDiscount(0); setCouponError("");
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    try {
      const result = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: { ...data, postalCode: "", country: "Nigeria" },
        totalPrice: finalTotal,
        paymentMethod,
        couponCode: appliedCoupon,
        discount: couponDiscount,
      }).unwrap();

      dispatch(clearCart());
      if (paymentMethod === "paystack") {
        window.location.assign(result.paymentUrl);
      } else {
        setOrderSuccess(true);
        setOrderData(result.order);
      }
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  // ══════ SUCCESS SCREEN ════════════════════════════════════════════════════════
  if (orderSuccess) {
    const d = publicSettings || {
      bankAccountName: "LotceWieth Store", bankAccountNumber: "0123456789",
      bankName: "GTBank", whatsappNumber: "+2348000000000",
    };
    const waLink = `https://wa.me/${d.whatsappNumber?.replace(/\D/g, "")}`;

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden" style={{ background:"#0A0A0B" }}>
        <SEO title="Order Placed" description="Your order has been placed successfully." />
        <AmbientBg />

        <motion.div initial={{ opacity:0, scale:0.92, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
          transition={{ duration:0.55, ease:"easeOut" }}
          className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10"
          style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 40px 90px rgba(0,0,0,0.65)" }}>

          <div className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
            style={{ background:`linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

          <div className="flex justify-center mb-6">
            <div className="relative">
              <motion.div animate={{ rotate:360 }} transition={{ duration:20, repeat:Infinity, ease:"linear" }}
                className="absolute -inset-4 rounded-full border-2 border-dashed pointer-events-none"
                style={{ borderColor:`${ACCENT}30` }} />
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                transition={{ type:"spring", stiffness:320, damping:22, delay:0.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background:`${ACCENT}15`, boxShadow:`0 0 0 3px ${ACCENT}` }}>
                <CheckCircle className="w-9 h-9" style={{ color:ACCENT }} />
              </motion.div>
            </div>
          </div>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
            className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2 text-center" style={{ color:ACCENT }}>
            Order received
          </motion.p>
          <motion.h2 initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
            className="text-3xl font-black text-white mb-2 text-center leading-tight">
            Order Placed!
          </motion.h2>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            className="text-gray-600 text-sm text-center mb-6">
            Reference:{" "}
            <span className="font-bold text-white font-mono text-xs px-2 py-0.5 rounded-lg" style={{ background:"#1c1c1c" }}>
              #{orderData?._id}
            </span>
          </motion.p>

          {/* Bank transfer details */}
          {paymentMethod === "bank_transfer" && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
              className="rounded-2xl p-5 mb-6 border"
              style={{ background:"rgba(16,185,129,0.07)", borderColor:"rgba(16,185,129,0.25)" }}>
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 mb-3">Bank Transfer Details</p>
              <div className="space-y-2 text-sm">
                {[
                  { label:"Bank",           val: d.bankName            },
                  { label:"Account Name",   val: d.bankAccountName     },
                  { label:"Account Number", val: d.bankAccountNumber, highlight:true },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{row.label}</span>
                    <span className={`font-bold ${row.highlight ? "text-emerald-400 font-mono tracking-widest text-base" : "text-white"}`}>
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500/20">
                <p className="text-xs text-gray-600 mb-2">Send transfer receipt to WhatsApp:</p>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background:"#25D366", boxShadow:"0 4px 12px rgba(37,211,102,0.35)" }}>
                  <MessageCircle className="w-4 h-4" /> {d.whatsappNumber}
                </a>
              </div>
            </motion.div>
          )}

          {/* WhatsApp details */}
          {paymentMethod === "whatsapp" && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
              className="rounded-2xl p-5 mb-6 border"
              style={{ background:"rgba(37,211,102,0.07)", borderColor:"rgba(37,211,102,0.25)" }}>
              <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color:"#25D366" }}>WhatsApp Payment</p>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                Chat with us to confirm your order and complete payment.
              </p>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white w-full justify-center"
                style={{ background:"#25D366", boxShadow:"0 6px 18px rgba(37,211,102,0.35)" }}>
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            </motion.div>
          )}

          <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
            whileHover={{ scale:1.03, boxShadow:`0 16px 40px ${ACCENT}55` }} whileTap={{ scale:0.97 }}
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group"
            style={{ background:ACCENT, boxShadow:`0 8px 24px ${ACCENT}44` }}>
            Continue Shopping <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ══════ EMPTY CART ════════════════════════════════════════════════════════════
  if (cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background:"#0A0A0B" }}>
        <SEO title="Checkout" description="Complete your order securely." />
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="text-center p-8">
          <p className="text-gray-600 mb-4 text-lg">Your cart is empty.</p>
          <button onClick={() => navigate("/")} className="font-bold hover:opacity-80 transition-opacity" style={{ color:ACCENT }}>
            ← Back to Shop
          </button>
        </motion.div>
      </div>
    );
  }

  // ══════ MAIN CHECKOUT ═════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen px-4 py-8 pb-28 md:pb-10 md:py-10 relative overflow-x-hidden" style={{ background:"#0A0A0B" }}>
      <SEO title="Checkout" description="Complete your order with secure payment options." />
      <AmbientBg />

      <div className="max-w-6xl mx-auto">
        {/* Page header with Back to Cart button */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
          className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${ACCENT}18` }}>
                <Flame className="w-4 h-4" style={{ color:ACCENT }} />
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em]" style={{ color:ACCENT }}>Secure Checkout</p>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">Complete Your Order</h1>
          </div>

          {/* ✅ Back to Cart button */}
          <motion.button
            whileHover={{ scale:1.04 }}
            whileTap={{ scale:0.96 }}
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
            style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 lg:gap-8 items-start">

          {/* ═══ LEFT: Shipping + Payment ═══ */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="rounded-2xl p-5 md:p-6" style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.07)" }}>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-4">Delivery Address</p>
                  <div className="space-y-2.5">
                    {savedAddresses.map((addr: IAddress) => {
                      const active = selectedAddressId === addr._id && !isNewAddress;
                      return (
                        <motion.label key={addr._id} whileHover={{ scale:1.01 }}
                          className="flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all"
                          style={{
                            background:   active ? `${ACCENT}0d` : "#1c1c1c",
                            borderColor:  active ? ACCENT : "rgba(255,255,255,0.07)",
                            boxShadow:    active ? `0 0 0 1px ${ACCENT}` : "none",
                          }}>
                          <input type="radio" name="savedAddress" className="sr-only"
                            checked={active}
                            onChange={() => selectSavedAddress(addr)} />
                          {/* Custom radio */}
                          <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                            style={{ borderColor: active ? ACCENT : "#4b5563" }}>
                            {active && <div className="w-2 h-2 rounded-full" style={{ background:ACCENT }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm flex items-center gap-1.5">
                              {addr.label === "Home"
                                ? <Home      className="w-3.5 h-3.5" style={{ color:ACCENT }} />
                                : <Briefcase className="w-3.5 h-3.5" style={{ color:ACCENT }} />}
                              {addr.label}
                              {addr.isDefault && (
                                <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                  style={{ background:`${ACCENT}20`, color:ACCENT }}>Default</span>
                              )}
                            </p>
                            <p className="text-gray-600 text-xs mt-0.5 truncate">{addr.address}, {addr.city}</p>
                          </div>
                        </motion.label>
                      );
                    })}

                    {/* New address option */}
                    <motion.label whileHover={{ scale:1.01 }}
                      className="flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all"
                      style={{
                        background:   isNewAddress ? `${ACCENT}0d` : "#1c1c1c",
                        borderColor:  isNewAddress ? ACCENT : "rgba(255,255,255,0.07)",
                        boxShadow:    isNewAddress ? `0 0 0 1px ${ACCENT}` : "none",
                      }}>
                      <input type="radio" name="savedAddress" className="sr-only" checked={isNewAddress}
                        onChange={selectNewAddress} />
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                        style={{ borderColor: isNewAddress ? ACCENT : "#4b5563" }}>
                        {isNewAddress && <div className="w-2 h-2 rounded-full" style={{ background:ACCENT }} />}
                      </div>
                      <span className="text-sm font-bold text-gray-400">+ Enter new address</span>
                    </motion.label>
                  </div>
                </div>
              )}

              {/* New address inputs */}
              <AnimatePresence>
                {isNewAddress && (
                  <motion.div key="new-addr"
                    initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                    className="overflow-hidden">
                    <div className="rounded-2xl p-5 md:p-6 space-y-4" style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500">New Address</p>

                      {/* Address */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Street Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                            style={{ color: errors.address ? "#ef4444" : "#4b5563" }} />
                          <input {...register("address")} placeholder="123 Main Street, Lagos"
                            className={inputCls(!!errors.address)} />
                        </div>
                        {errors.address && (
                          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3" /> {errors.address.message}
                          </p>
                        )}
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">City</label>
                        <div className="relative">
                          <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                            style={{ color: errors.city ? "#ef4444" : "#4b5563" }} />
                          <input {...register("city")} placeholder="Lagos"
                            className={inputCls(!!errors.city)} />
                        </div>
                        {errors.city && (
                          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3" /> {errors.city.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment method */}
              <div className="rounded-2xl p-5 md:p-6" style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-4">Payment Method</p>
                <div className="space-y-2.5">
                  {PAYMENT_METHODS.map((pm) => {
                    const active = paymentMethod === pm.id;
                    return (
                      <motion.label key={pm.id} whileHover={{ scale:1.01 }}
                        className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all"
                        style={{
                          background:  active ? `${pm.color}0d` : "#1c1c1c",
                          borderColor: active ? pm.color : "rgba(255,255,255,0.07)",
                          boxShadow:   active ? `0 0 0 1px ${pm.color}` : "none",
                        }}>
                        <input type="radio" className="sr-only" value={pm.id}
                          checked={active} onChange={() => setPaymentMethod(pm.id as typeof paymentMethod)} />
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                          style={{ borderColor: active ? pm.color : "#4b5563" }}>
                          {active && <div className="w-2 h-2 rounded-full" style={{ background:pm.color }} />}
                        </div>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background:`${pm.color}18`, color:pm.color }}>
                          {pm.icon}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{pm.label}</p>
                          <p className="text-gray-600 text-xs">{pm.sub}</p>
                        </div>
                      </motion.label>
                    );
                  })}
                </div>

                {/* Paystack info */}
                <AnimatePresence>
                  {paymentMethod === "paystack" && (
                    <motion.div key="ps-info"
                      initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                      className="overflow-hidden">
                      <div className="mt-3 flex items-start gap-2.5 p-3.5 rounded-xl border text-xs"
                        style={{ background:"rgba(59,130,246,0.07)", borderColor:"rgba(59,130,246,0.22)", color:"#93c5fd" }}>
                        <CreditCard className="w-4 h-4 shrink-0 mt-0.5" />
                        You will be redirected to Paystack to complete payment securely.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={isLoading}
                whileHover={!isLoading ? { scale:1.02, boxShadow:`0 18px 44px ${ACCENT}55` } : {}}
                whileTap={!isLoading ? { scale:0.98 } : {}}
                className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 transition-all disabled:opacity-55 disabled:cursor-not-allowed"
                style={{ background:ACCENT, boxShadow:`0 8px 24px ${ACCENT}44` }}>
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
                ) : paymentMethod === "paystack" ? (
                  <><CreditCard className="w-5 h-5" /> Pay ₦{finalTotal.toLocaleString()}</>
                ) : (
                  <>Place Order <ArrowRight className="w-5 h-5" /></>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* ═══ RIGHT: Order summary ═══ */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.18 }}
            className="lg:sticky lg:top-24">
            <div className="relative rounded-2xl p-5 md:p-6" style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
              <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
                style={{ background:`linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-5">Order Summary</p>

              {/* Items */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 mb-5"
                style={{ scrollbarWidth:"thin", scrollbarColor:`${ACCENT}40 transparent` }}>
                {cart.cartItems.map((item: CartItem) => (
                  <div key={item._id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border" style={{ borderColor:"rgba(255,255,255,0.08)" }}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-gray-600 text-xs">{item.qty} × ₦{item.price.toLocaleString()}</p>
                    </div>
                    <span className="font-black text-white text-sm shrink-0">₦{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px mb-5" style={{ background:"rgba(255,255,255,0.06)" }} />

              {/* Coupon */}
              <div className="mb-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2.5 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Discount Code
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type="text" value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon}
                      placeholder="Enter code"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white bg-[#1c1c1c] border border-white/[0.08] outline-none placeholder-gray-600 focus:border-[#e8622a]/60 focus:ring-2 focus:ring-[#e8622a]/12 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-widest" />
                  </div>
                  {!appliedCoupon ? (
                    <motion.button type="button" onClick={handleApplyCoupon}
                      disabled={isApplying || !couponCode.trim()}
                      whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                      className="px-4 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 shrink-0"
                      style={{ background:ACCENT }}>
                      {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </motion.button>
                  ) : (
                    <motion.button type="button" onClick={handleRemoveCoupon}
                      whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                      className="px-4 py-3 rounded-xl text-sm font-bold transition-all shrink-0"
                      style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171" }}>
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
                <AnimatePresence>
                  {couponError && (
                    <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {couponError}
                    </motion.p>
                  )}
                  {appliedCoupon && (
                    <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                      className="mt-1.5 text-xs font-bold flex items-center gap-1" style={{ color:"#10b981" }}>
                      <CheckCircle className="w-3 h-3" /> {appliedCoupon} applied
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-white font-bold">₦{totalPrice.toLocaleString()}</span>
                </div>
                <AnimatePresence>
                  {couponDiscount > 0 && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                      className="flex justify-between overflow-hidden">
                      <span className="font-medium" style={{ color:"#10b981" }}>Discount</span>
                      <span className="font-bold" style={{ color:"#10b981" }}>- ₦{couponDiscount.toLocaleString()}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Delivery</span>
                  <span className="font-bold" style={{ color:"#10b981" }}>Free</span>
                </div>
              </div>

              <div className="h-px my-4" style={{ background:"rgba(255,255,255,0.06)" }} />

              <div className="flex justify-between items-end">
                <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Total</span>
                <motion.span key={finalTotal}
                  initial={{ scale:1.14, opacity:0.7 }} animate={{ scale:1, opacity:1 }}
                  transition={{ type:"spring", stiffness:400, damping:20 }}
                  className="text-3xl font-black" style={{ color:ACCENT }}>
                  ₦{finalTotal.toLocaleString()}
                </motion.span>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                <AlertCircle className="w-3 h-3 text-gray-700 shrink-0" />
                <span className="text-[11px] text-gray-700">Secured by Paystack · Nigeria</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;