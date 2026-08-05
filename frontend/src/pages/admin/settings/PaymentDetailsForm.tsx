import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Banknote, AlertCircle } from "lucide-react";
import type { SettingsFormData } from "./settingsSchema";

interface PaymentDetailsFormProps {
  register: UseFormRegister<SettingsFormData>;
  errors: FieldErrors<SettingsFormData>;
  isDark: boolean;
}

const PaymentDetailsForm = ({ register, errors, isDark }: PaymentDetailsFormProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const inputCls = "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all border focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15";

  const fields = [
    { id: "edit-bank-name", name: "bankName" as keyof SettingsFormData, placeholder: "e.g. GTBank" },
    { id: "edit-account-name", name: "bankAccountName" as keyof SettingsFormData, placeholder: "e.g. Sholex Store" },
    { id: "edit-account-number", name: "bankAccountNumber" as keyof SettingsFormData, placeholder: "0123456789", mono: true },
    { id: "edit-whatsapp", name: "whatsappNumber" as keyof SettingsFormData, placeholder: "+2348000000000" },
  ];

  return (
    <section className="relative rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #10b981, transparent)" }} />
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}><Banknote className="w-4 h-4" /></div>
          <h2 className="text-lg font-black" style={{ color: textPrimary }}>Payment Details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(field => (
            <div key={field.name}>
              <input id={field.id} {...register(field.name)} placeholder={field.placeholder} className={`${inputCls} ${field.mono ? "font-mono tracking-widest" : ""} ${errors[field.name] ? "border-red-500/50 ring-2 ring-red-500/10" : ""}`} style={{ background: inputBg, borderColor: errors[field.name] ? undefined : inputBorder, color: textPrimary }} />
              {errors[field.name] && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold" role="alert"><AlertCircle className="w-3 h-3" /> {errors[field.name]?.message as string}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PaymentDetailsForm;