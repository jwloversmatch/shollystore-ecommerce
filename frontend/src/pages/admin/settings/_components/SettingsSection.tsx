interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  accentGradient?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection = ({
  title,
  description,
  icon,
  iconBg = "rgba(232,98,42,0.12)",
  iconColor = "#e8622a",
  accentGradient = "linear-gradient(90deg, transparent, #e8622a, transparent)",
  action,
  children,
}: SettingsSectionProps) => (
  <section
    className="relative rounded-2xl overflow-hidden
      bg-white dark:bg-[#17181A]
      border border-gray-200 dark:border-white/[0.07]
      shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
  >
    <div
      className="absolute top-0 inset-x-0 h-px"
      style={{ background: accentGradient }}
      aria-hidden="true"
    />
    <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: iconBg, color: iconColor }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-black text-gray-900 dark:text-[#E7E9EA]">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

export default SettingsSection;