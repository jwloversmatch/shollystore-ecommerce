import { Home } from "lucide-react";
import Toggle from "./Toggle";
import type { SettingsData } from "./settingsSchema";

const ACCENT = "#e8622a";

interface HomepageContentProps {
  settings: SettingsData | undefined;
  onToggleLandingMode: () => void;
  isDark: boolean;
}

const HomepageContent = ({ settings, onToggleLandingMode, isDark }: HomepageContentProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  const items = [
    { label: "Hero Tagline", value: settings?.heroTagline },
    { label: "Hero Title", value: settings?.heroTitle },
    { label: "Special Offer Title", value: settings?.specialOfferTitle },
  ];

  return (
    <section className="relative rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18`, color: ACCENT }}><Home className="w-4 h-4" /></div>
          <h2 className="text-lg font-black" style={{ color: textPrimary }}>Homepage Content</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {items.map(item => (
            <div key={item.label} className="p-4 rounded-xl" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1.5" style={{ color: textMuted }}>{item.label}</p>
              <p className="font-semibold text-sm" style={{ color: textPrimary }}>{item.value || "—"}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1.5" style={{ color: textMuted }}>Hero Description</p>
          <p className="font-semibold text-sm" style={{ color: textPrimary }}>{settings?.heroDescription || "—"}</p>
        </div>
        <div className="mt-3 p-4 rounded-xl" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1.5" style={{ color: textMuted }}>Special Offer Text</p>
          <p className="font-semibold text-sm" style={{ color: textPrimary }}>{settings?.specialOfferText || "—"}</p>
        </div>
        <div className="mt-4 flex items-center justify-between p-4 rounded-xl" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1" style={{ color: textMuted }}>Landing Mode</p>
            <p className="font-semibold text-sm" style={{ color: textPrimary }}>{settings?.landingMode ? "Enabled — Full-screen hero" : "Disabled — Regular layout"}</p>
          </div>
          <Toggle on={!!settings?.landingMode} onToggle={onToggleLandingMode} label="Toggle landing mode" />
        </div>
      </div>
    </section>
  );
};

export default HomepageContent;