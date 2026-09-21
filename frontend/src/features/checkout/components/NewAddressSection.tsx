import { MapPin, Building, AlertCircle } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { CheckoutFormData } from "../types";
import { buildInputCls } from "../utils";

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

const NewAddressSection = ({ register, errors }: Props) => (
  <div className="rounded-2xl p-5 md:p-6 space-y-4 bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.07]">
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
          style={{ color: errors.address ? "#ef4444" : "#4b5563" }}
          aria-hidden="true"
        />
        <input
          id="checkout-address"
          {...register("address")}
          placeholder="123 Main Street, Lagos"
          className={buildInputCls(!!errors.address)}
          aria-invalid={!!errors.address}
          aria-describedby={errors.address ? "checkout-address-error" : undefined}
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
          {...register("city")}
          placeholder="Lagos"
          className={buildInputCls(!!errors.city)}
          aria-invalid={!!errors.city}
          aria-describedby={errors.city ? "checkout-city-error" : undefined}
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
);

export default NewAddressSection;