import { ACCENT, FOCUS_RING, PAYMENT_METHODS } from "../constants";
import type { PaymentMethodId } from "../types";

interface Props {
  selected: PaymentMethodId;
  onChange: (id: PaymentMethodId) => void;
}

const PaymentMethodSection = ({ selected, onChange }: Props) => (
  <fieldset className="rounded-2xl p-5 md:p-6 bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.07]">
    <legend className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4">
      Payment Method
    </legend>
    <div className="space-y-2.5">
      {PAYMENT_METHODS.map((pm) => {
        const active = selected === pm.id;
        const Icon = pm.Icon;
        return (
          <label
            key={pm.id}
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${FOCUS_RING}`}
            style={
              active
                ? {
                    background: `${pm.color}1a`,
                    borderColor: pm.color,
                    boxShadow: `0 0 0 1px ${pm.color}`,
                  }
                : undefined
            }
          >
            <input
              type="radio"
              className="sr-only"
              value={pm.id}
              checked={active}
              onChange={() => onChange(pm.id)}
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
              style={{ background: `${pm.color}18`, color: pm.color }}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
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
);

// ACCENT imported so tree-shakers keep it consistent if used elsewhere
void ACCENT;

export default PaymentMethodSection;