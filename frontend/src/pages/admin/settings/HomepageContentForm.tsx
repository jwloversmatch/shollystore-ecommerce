import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Home } from "lucide-react";
import Toggle from "./Toggle";
import type { SettingsFormData, SettingsData } from "./settingsSchema";

const ACCENT = "#e8622a";

interface HomepageContentFormProps {
  register: UseFormRegister<SettingsFormData>;
  errors: FieldErrors<SettingsFormData>;
  settings: SettingsData | undefined;
  onToggleLandingMode: () => void;
  isDark: boolean;
}

const HomepageContentForm = ({ register, settings, onToggleLandingMode, isDark }: HomepageContentFormProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const inputCls = "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all border focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15";

  return (
    <section className="relative rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18`, color: ACCENT }}><Home className="w-4 h-4" /></div>
          <h2 className="text-lg font-black" style={{ color: textPrimary }}>Homepage Content</h2>
        </div>
        <div className="space-y-4">
          <div><label className="text-[10px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: textMuted }}>Hero Tagline</label><input {...register("heroTagline")} placeholder="e.g. 🔥 Premium Food Store" className={inputCls} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} /></div>
          <div><label className="text-[10px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: textMuted }}>Hero Title <span style={{ color: textMuted }}>Use " | " to split title</span></label><input {...register("heroTitle")} placeholder="e.g. Taste the | Difference" className={inputCls} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} /></div>
          <div><label className="text-[10px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: textMuted }}>Hero Description</label><textarea {...register("heroDescription")} rows={3} placeholder="A short description of your store…" className={`${inputCls} resize-none`} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-[10px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: textMuted }}>Special Offer Title</label><input {...register("specialOfferTitle")} placeholder="e.g. Today's Special" className={inputCls} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} /></div>
            <div><label className="text-[10px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: textMuted }}>Special Offer Text</label><input {...register("specialOfferText")} placeholder="e.g. Get ₦500 off orders over ₦10k" className={inputCls} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} /></div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
            <div><p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: textMuted }}>Landing Mode</p><p className="text-xs" style={{ color: textSecondary }}>Show full-screen hero instead of regular layout</p></div>
            <Toggle on={!!settings?.landingMode} onToggle={onToggleLandingMode} label="Toggle landing mode" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageContentForm;