import { AlertCircle } from "lucide-react";
import { ACCENT } from "../constants";
import type { CartItem } from "../types";

interface Props {
  items: CartItem[];
  totalPrice: number;
  couponDiscount: number;
  shippingFee: number;
  finalTotal: number;
}

const OrderSummaryAside = ({
  items,
  totalPrice,
  couponDiscount,
  shippingFee,
  finalTotal,
}: Props) => (
  <aside className="lg:sticky lg:top-24" aria-label="Order summary">
    <div className="relative rounded-2xl p-5 md:p-6 bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.07] shadow-lg dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
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
        {items.map((item) => (
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
        {couponDiscount > 0 && (
          <div className="flex justify-between">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              Discount
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              - ₦{couponDiscount.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            Delivery
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {shippingFee === 0 ? "Free" : `₦${shippingFee.toLocaleString()}`}
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
);

export default OrderSummaryAside;