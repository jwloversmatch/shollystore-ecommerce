import Toggle from "./Toggle";
import type { SettingsData } from "./settingsSchema";

interface HomepageContentProps {
  settings: SettingsData | undefined;
  onToggleLandingMode: () => void;
}

const cellCls =
  "p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]";
const labelCls =
  "text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1.5 text-gray-400 dark:text-gray-500";
const valueCls = "font-semibold text-sm text-gray-900 dark:text-[#E7E9EA]";

const HomepageContent = ({
  settings,
  onToggleLandingMode,
}: HomepageContentProps) => {
  const items = [
    { label: "Hero Tagline", value: settings?.heroTagline },
    { label: "Hero Title", value: settings?.heroTitle },
    { label: "Special Offer Title", value: settings?.specialOfferTitle },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className={cellCls}>
            <p className={labelCls}>{item.label}</p>
            <p className={valueCls}>{item.value || "—"}</p>
          </div>
        ))}
      </div>
      <div className={cellCls}>
        <p className={labelCls}>Hero Description</p>
        <p className={valueCls}>{settings?.heroDescription || "—"}</p>
      </div>
      <div className={cellCls}>
        <p className={labelCls}>Special Offer Text</p>
        <p className={valueCls}>{settings?.specialOfferText || "—"}</p>
      </div>
      <div className={`${cellCls} flex items-center justify-between gap-4`}>
        <div>
          <p className={`${labelCls} mb-1`}>Landing Mode</p>
          <p className={valueCls}>
            {settings?.landingMode
              ? "Enabled — Full-screen hero"
              : "Disabled — Regular layout"}
          </p>
        </div>
        <Toggle
          on={!!settings?.landingMode}
          onToggle={onToggleLandingMode}
          label="Toggle landing mode"
        />
      </div>
    </div>
  );
};

export default HomepageContent;