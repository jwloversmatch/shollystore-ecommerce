import { Banknote, Building, MessageCircle, AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import type { SettingsData } from "./settingsSchema";

interface PaymentDetailsProps {
  settings: SettingsData | undefined;
  isDark: boolean;
  onEdit: () => void;
}

const PaymentDetails = ({ settings, isDark, onEdit }: PaymentDetailsProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark
    ? "0 8px 32px rgba(0,0,0,0.35)"
    : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  const defaultAccount =
    settings?.bankAccounts?.find((acc) => acc.isDefault && acc.isActive) ||
    settings?.bankAccounts?.find((acc) => acc.isActive) ||
    null;

  return (
    <section
      className="relative rounded-2xl overflow-hidden"
      style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}
    >
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #10b981, transparent)" }}
      />
      <div className="p-6 md:p-7">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}
            >
              <Banknote className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black" style={{ color: textPrimary }}>
              Payment Details
            </h2>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ background: "#10b981", boxShadow: "0 6px 18px rgba(16,185,129,0.3)" }}
            aria-label="Edit payment details"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        </div>

        {defaultAccount ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
              >
                <Building className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#10b981" }} />
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1" style={{ color: textMuted }}>
                    Bank
                  </p>
                  <p className="font-semibold text-sm" style={{ color: textPrimary }}>
                    {defaultAccount.bankName}
                  </p>
                </div>
              </div>
              <div
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
              >
                <Banknote className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#10b981" }} />
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1" style={{ color: textMuted }}>
                    Account Name
                  </p>
                  <p className="font-semibold text-sm" style={{ color: textPrimary }}>
                    {defaultAccount.accountName}
                  </p>
                </div>
              </div>
              <div
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
              >
                <Banknote className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#10b981" }} />
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1" style={{ color: textMuted }}>
                    Account Number
                  </p>
                  <p className="font-mono font-semibold text-sm tracking-widest" style={{ color: textPrimary }}>
                    {defaultAccount.accountNumber}
                  </p>
                </div>
              </div>
            </div>
            {defaultAccount.isDefault && (
              <p className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                <CheckCircle2 size={14} /> Default account
              </p>
            )}
          </div>
        ) : (
          <div
            className="flex items-center gap-3 p-5 rounded-xl"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              No bank accounts configured yet. Click <strong>Edit</strong> to add one.
            </p>
          </div>
        )}

        {/* WhatsApp number (still flat) */}
        {settings?.whatsappNumber && (
          <div
            className="mt-4 flex items-start gap-3 p-4 rounded-xl"
            style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
          >
            <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#25D366" }} />
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1" style={{ color: textMuted }}>
                WhatsApp
              </p>
              <p className="font-semibold text-sm" style={{ color: textPrimary }}>
                {settings.whatsappNumber}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PaymentDetails;