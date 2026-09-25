import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, CreditCard, ArrowRight } from "lucide-react";

import type { RootState } from "../store";
import {
  useGetPublicSettingsQuery,
  useGetAddressesQuery,
  useRegisterMutation,
} from "../features/api/apiSlice";
import SEO from "../components/SEO";
import { calculateShippingFee } from "../utils/format";
import type { SettingsData } from "../pages/admin/settings/settingsSchema";

import AmbientBg from "../features/checkout/components/AmbientBg";
import CheckoutHeader from "../features/checkout/components/CheckoutHeader";
import GuestContactSection from "../features/checkout/components/GuestContactSection";
import SavedAddressSection from "../features/checkout/components/SavedAddressSection";
import NewAddressSection from "../features/checkout/components/NewAddressSection";
import PaymentMethodSection from "../features/checkout/components/PaymentMethodSection";
import OrderSummaryAside from "../features/checkout/components/OrderSummaryAside";
import OrderPendingTransferView from "../features/checkout/components/OrderPendingTransferView";
import OrderConfirmedView from "../features/checkout/components/OrderConfirmedView";
import EmptyCartView from "../features/checkout/components/EmptyCartView";
import CheckoutLoadingView from "../features/checkout/components/CheckoutLoadingView";
import { useOrderSubmit } from "../features/checkout/hooks/useOrderSubmit";
import { ACCENT } from "../features/checkout/constants";
import type {
  CartItem,
  CheckoutFormData,
  IAddress,
  PaymentMethodId,
  PersistState,
} from "../features/checkout/types";

const checkoutSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const cart = useSelector((s: RootState) => s.cart);
  const { user } = useSelector((s: RootState) => s.auth);
  const isRehydrated = useSelector(
    (s: RootState & PersistState) => s._persist?.rehydrated,
  );

  const { data: publicSettings } = useGetPublicSettingsQuery({});
  const { data: savedAddresses = [] } = useGetAddressesQuery({});
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema) });

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodId>("paystack");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isNewAddress, setIsNewAddress] = useState(true);

  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  const selectedSavedAddress = (savedAddresses as IAddress[]).find(
    (addr) => addr._id === selectedAddressId,
  );

  const { submit, isLoading, order } = useOrderSubmit({
    cart,
    user,
    guestEmail,
    guestName,
    guestPhone,
    paymentMethod,
    isNewAddress,
    selectedSavedAddress,
    isRehydrated,
    onNeedsAccount: () => setShowCreateAccountModal(true),
  });

  const watchedCity = useWatch({ control, name: "city" }) || "";
  const city =
    selectedSavedAddress && !isNewAddress
      ? selectedSavedAddress.city
      : watchedCity;
  const shippingFee = calculateShippingFee(city);

  const totalPrice = cart.cartItems.reduce(
    (a: number, i: CartItem) => a + i.price * i.qty,
    0,
  );
  const finalTotal = totalPrice - cart.couponDiscount + shippingFee;

  const handleCreateAccount = async (password: string) => {
    try {
      await registerUser({
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

  if (!isRehydrated) return <CheckoutLoadingView />;

  // ─── Post-submit views ─────────────────────────────────────────────────────
  if (order) {
    // Paid (would only happen if Paystack redirected back and we re-fetched —
    // not wired yet, but harmless to keep the branch for future use)
    if (order.status === "Paid") {
      return (
        <OrderConfirmedView
          order={order}
          showCreateAccountModal={showCreateAccountModal}
          guestEmail={guestEmail}
          isCreating={isRegistering}
          onCloseModal={() => setShowCreateAccountModal(false)}
          onCreateAccount={handleCreateAccount}
          onContinueShopping={() => navigate("/shop")}
        />
      );
    }

    // Pending (bank transfer — the state we actually reach today)
    return (
      <OrderPendingTransferView
        order={order}
        publicSettings={publicSettings as SettingsData | undefined}
        showCreateAccountModal={showCreateAccountModal}
        guestEmail={guestEmail}
        isCreating={isRegistering}
        onCloseModal={() => setShowCreateAccountModal(false)}
        onCreateAccount={handleCreateAccount}
        onContinueShopping={() => navigate("/shop")}
      />
    );
  }

  if (cart.cartItems.length === 0) {
    return <EmptyCartView onBack={() => navigate("/")} />;
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen px-4 py-8 pb-28 md:pb-10 md:py-10 relative overflow-x-hidden bg-[#FCFAF5] dark:bg-[#0F1011] focus:outline-none"
    >
      <SEO
        title="Checkout"
        description="Complete your order with secure payment options."
      />
      <AmbientBg />
      <div className="max-w-6xl mx-auto">
        <CheckoutHeader onBackToCart={() => navigate("/cart")} />

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 lg:gap-8 items-start">
          <div>
            <form
              onSubmit={handleSubmit(submit)}
              className="space-y-5"
              aria-label="Checkout form"
            >
              {!user && isRehydrated && (
                <GuestContactSection
                  email={guestEmail}
                  name={guestName}
                  phone={guestPhone}
                  onEmailChange={setGuestEmail}
                  onNameChange={setGuestName}
                  onPhoneChange={setGuestPhone}
                />
              )}

              {(savedAddresses as IAddress[]).length > 0 && (
                <SavedAddressSection
                  addresses={savedAddresses as IAddress[]}
                  selectedId={selectedAddressId}
                  isNewAddress={isNewAddress}
                  onSelectSaved={(addr) => {
                    setSelectedAddressId(addr._id);
                    setIsNewAddress(false);
                    reset({ address: addr.address, city: addr.city });
                  }}
                  onSelectNew={() => {
                    setIsNewAddress(true);
                    setSelectedAddressId(null);
                    reset({ address: "", city: "" });
                  }}
                />
              )}

              {isNewAddress && (
                <NewAddressSection register={register} errors={errors} />
              )}

              <PaymentMethodSection
                selected={paymentMethod}
                onChange={setPaymentMethod}
              />

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

          <OrderSummaryAside
            items={cart.cartItems}
            totalPrice={totalPrice}
            couponDiscount={cart.couponDiscount}
            shippingFee={shippingFee}
            finalTotal={finalTotal}
          />
        </div>
      </div>
    </main>
  );
};

export default Checkout;