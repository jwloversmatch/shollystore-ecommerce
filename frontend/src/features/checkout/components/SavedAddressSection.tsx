import { Home, Briefcase } from "lucide-react";
import { ACCENT, FOCUS_RING } from "../constants";
import type { IAddress } from "../types";

interface Props {
  addresses: IAddress[];
  selectedId: string | null;
  isNewAddress: boolean;
  onSelectSaved: (addr: IAddress) => void;
  onSelectNew: () => void;
}

const SavedAddressSection = ({
  addresses,
  selectedId,
  isNewAddress,
  onSelectSaved,
  onSelectNew,
}: Props) => (
  <fieldset className="rounded-2xl p-5 md:p-6 bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/[0.07]">
    <legend className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4">
      Delivery Address
    </legend>
    <div className="space-y-2.5">
      {addresses.map((addr) => {
        const active = selectedId === addr._id && !isNewAddress;
        return (
          <label
            key={addr._id}
            className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${FOCUS_RING} ${
              active
                ? "bg-[#e8622a]/10 border-[#e8622a] shadow-[0_0_0_1px_#e8622a]"
                : "bg-gray-100 dark:bg-[#1F2123] border-gray-200 dark:border-white/[0.07]"
            }`}
          >
            <input
              type="radio"
              name="savedAddress"
              className="sr-only"
              checked={active}
              onChange={() => onSelectSaved(addr)}
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
                    style={{ background: `${ACCENT}20`, color: ACCENT }}
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
        className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${FOCUS_RING} ${
          isNewAddress
            ? "bg-[#e8622a]/10 border-[#e8622a] shadow-[0_0_0_1px_#e8622a]"
            : "bg-gray-100 dark:bg-[#1F2123] border-gray-200 dark:border-white/[0.07]"
        }`}
      >
        <input
          type="radio"
          name="savedAddress"
          className="sr-only"
          checked={isNewAddress}
          onChange={onSelectNew}
        />
        <div
          className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
          style={{ borderColor: isNewAddress ? ACCENT : "#4b5563" }}
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
);

export default SavedAddressSection;