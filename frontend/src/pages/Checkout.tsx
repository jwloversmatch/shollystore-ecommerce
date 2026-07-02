import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { RootState } from "../store";
import {
  useCreateOrderMutation,
  useGetPublicSettingsQuery,
} from "../features/api/apiSlice";
import { clearCart } from "../features/cart/cartSlice";
import {
  MapPin,
  Building,
  CreditCard,
  Banknote,
  MessageCircle,
} from "lucide-react";
import SEO from "../components/SEO";

// ---------- Types ----------
interface CartItem {
  _id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  stock?: number;
}

const checkoutSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface OrderResponse {
  _id: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // ✅ use typed state
  const cart = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { data: publicSettings } = useGetPublicSettingsQuery({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const [paymentMethod, setPaymentMethod] = useState<
    "paystack" | "bank_transfer" | "whatsapp"
  >("paystack");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState<OrderResponse | null>(null);

  // ✅ typed reduce
  const totalPrice = cart.cartItems.reduce(
    (acc: number, item: CartItem) => acc + item.price * item.qty,
    0,
  );

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
        totalPrice,
        paymentMethod,
      }).unwrap();

      dispatch(clearCart());

      if (paymentMethod === "paystack") {
        window.location.assign(result.paymentUrl);
      } else {
        setOrderSuccess(true);
        setOrderData(result.order);
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  // ---------- Success Page ----------
  if (orderSuccess) {
    const details = publicSettings || {
      bankAccountName: "LotceWieth Store",
      bankAccountNumber: "0123456789",
      bankName: "GTBank",
      whatsappNumber: "+2348000000000",
    };

    <SEO
      title="Checkout"
      description="Complete your order with secure payment options including Paystack, bank transfer, or WhatsApp."
    />;

    return (
      <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-br from-pastel-pink via-pastel-green to-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-white/40"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Order Placed!
          </h2>
          <p className="text-gray-600 mb-6">
            Your order <strong>#{orderData?._id}</strong> has been received.
            Please complete payment using the details below.
          </p>

          {paymentMethod === "bank_transfer" && (
            <div className="bg-pastel-green/50 p-4 rounded-xl border border-leaf-green/20 mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">
                Bank Transfer Details
              </h3>
              <p className="text-sm text-gray-600">
                <strong>Bank:</strong> {details.bankName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Account Name:</strong> {details.bankAccountName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Account Number:</strong>{" "}
                <span className="font-bold text-leaf-green">
                  {details.bankAccountNumber}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-4">
                After transfer, send a screenshot of the receipt to our
                WhatsApp: <br />
                <a
                  href={`https://wa.me/${details.whatsappNumber.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-leaf-green font-bold hover:underline"
                >
                  <MessageCircle className="w-4 h-4" /> {details.whatsappNumber}
                </a>
              </p>
            </div>
          )}

          {paymentMethod === "whatsapp" && (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/40 mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">
                Pay via WhatsApp
              </h3>
              <p className="text-sm text-gray-600">
                Contact us on WhatsApp to complete your payment and confirm your
                order.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Our WhatsApp number:{" "}
                <span className="font-bold text-green-600">
                  {details.whatsappNumber}
                </span>
              </p>
              <a
                href={`https://wa.me/${details.whatsappNumber.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          )}

          <button
            onClick={() => navigate("/")}
            className="w-full bg-leaf-green text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  // ---------- Empty Cart ----------
  if (cart.cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Your cart is empty. Go back to shopping.
      </div>
    );
  }

  // ---------- Normal Checkout Page ----------
  return (
    <div
      className="min-h-screen p-4 relative bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?auto=format&fit=crop&w=1920&q=80)",
      }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 grid md:grid-cols-2 min-h-[550px]"
      >
        {/* Left Side - Shipping & Payment */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-sm border-r border-white/40">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Enter your details and choose a payment method.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  {...register("address")}
                  className={`w-full border ${errors.address ? "border-red-500" : "border-gray-200"} rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                  placeholder="123 Main Street, Lagos"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  {...register("city")}
                  className={`w-full border ${errors.city ? "border-red-500" : "border-gray-200"} rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                  placeholder="Lagos"
                />
              </div>
              {errors.city && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-leaf-green cursor-pointer transition">
                  <input
                    type="radio"
                    value="paystack"
                    checked={paymentMethod === "paystack"}
                    onChange={() => setPaymentMethod("paystack")}
                    className="w-4 h-4 text-leaf-green focus:ring-leaf-green"
                  />
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Paystack (Card/Transfer)
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-leaf-green cursor-pointer transition">
                  <input
                    type="radio"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={() => setPaymentMethod("bank_transfer")}
                    className="w-4 h-4 text-leaf-green focus:ring-leaf-green"
                  />
                  <Banknote className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Bank Transfer
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-leaf-green cursor-pointer transition">
                  <input
                    type="radio"
                    value="whatsapp"
                    checked={paymentMethod === "whatsapp"}
                    onChange={() => setPaymentMethod("whatsapp")}
                    className="w-4 h-4 text-leaf-green focus:ring-leaf-green"
                  />
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Pay via WhatsApp
                  </span>
                </label>
              </div>
            </div>

            {paymentMethod === "paystack" && (
              <div className="bg-pastel-green/50 p-4 rounded-xl border border-leaf-green/20 mt-2">
                <p className="text-xs text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-leaf-green" />
                  Secured via Paystack. You will be redirected to complete
                  payment.
                </p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-blob-orange text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blob-orange/30 hover:shadow-blob-orange/50 transition-all disabled:opacity-60"
            >
              {isLoading
                ? "Processing..."
                : paymentMethod === "paystack"
                  ? `Pay ₦${totalPrice.toLocaleString()}`
                  : "Place Order"}
            </motion.button>
          </form>
        </div>

        {/* Right Side - Order Summary */}
        <div className="p-8 md:p-12 flex flex-col justify-start bg-gray-50/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">
            Order Summary
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {cart.cartItems.map((item: CartItem) => (
              <div
                key={item._id}
                className="flex justify-between items-center border-b border-gray-100 pb-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  ₦{(item.price * item.qty).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery</span>
              <span className="text-leaf-green font-medium">Free</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-900 mt-2">
              <span>Total</span>
              <span className="text-blob-orange">
                ₦{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;
