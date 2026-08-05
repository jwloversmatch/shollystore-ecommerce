import { Banknote, Building, MessageCircle, AlertCircle } from "lucide-react";
import type { SettingsData } from "./settingsSchema";

interface PaymentDetailsProps {
  settings: SettingsData | undefined;
  isDark: boolean;
}

const PaymentDetails = ({ settings, isDark }: PaymentDetailsProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark
    ? "0 8px 32px rgba(0,0,0,0.35)"
    : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  const hasPayment = !!(
    settings?.bankAccountName ||
    settings?.bankAccountNumber ||
    settings?.bankName ||
    settings?.whatsappNumber
  );

  const items = [
    {
      icon: (
        <Building
          className="w-4 h-4 mt-0.5 shrink-0"
          style={{ color: "#10b981" }}
        />
      ),
      label: "Bank",
      value: settings?.bankName,
    },
    {
      icon: (
        <Banknote
          className="w-4 h-4 mt-0.5 shrink-0"
          style={{ color: "#10b981" }}
        />
      ),
      label: "Account Name",
      value: settings?.bankAccountName,
    },
    {
      icon: (
        <Banknote
          className="w-4 h-4 mt-0.5 shrink-0"
          style={{ color: "#10b981" }}
        />
      ),
      label: "Account Number",
      value: settings?.bankAccountNumber,
      mono: true,
    },
    {
      icon: (
        <MessageCircle
          className="w-4 h-4 mt-0.5 shrink-0"
          style={{ color: "#25D366" }}
        />
      ),
      label: "WhatsApp",
      value: settings?.whatsappNumber,
    },
  ];

  return (
    <section
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: cardShadow,
      }}
    >
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #10b981, transparent)",
        }}
      />
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-2.5 mb-5">
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
        {hasPayment ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{
                  background: inputBg,
                  border: `1px solid ${inputBorder}`,
                }}
              >
                {item.icon}
                <div>
                  <p
                    className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1"
                    style={{ color: textMuted }}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`font-semibold text-sm ${item.mono ? "font-mono tracking-widest" : ""}`}
                    style={{ color: textPrimary }}
                  >
                    {item.value || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex items-center gap-3 p-5 rounded-xl"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textMuted,
            }}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              No payment details configured yet. Click{" "}
              <strong style={{ color: textPrimary }}>Edit Settings</strong> to
              add them.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PaymentDetails;
