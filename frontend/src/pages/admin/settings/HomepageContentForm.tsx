import { UseFormRegister, FieldErrors } from "react-hook-form";
import Toggle from "./Toggle";
import type { SettingsFormData, SettingsData } from "./settingsSchema";

interface HomepageContentFormProps {
  register: UseFormRegister<SettingsFormData>;
  errors: FieldErrors<SettingsFormData>;
  settings: SettingsData | undefined;
  onToggleLandingMode: () => void;
}

const inputCls =
  "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all border bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E7E9EA] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15";
const labelCls =
  "text-[10px] font-extrabold uppercase tracking-widest block mb-2 text-gray-400 dark:text-gray-500";

const HomepageContentForm = ({
  register,
  settings,
  onToggleLandingMode,
}: HomepageContentFormProps) => (
  <div className="space-y-4">
    <div>
      <label className={labelCls}>Hero Tagline</label>
      <input
        {...register("heroTagline")}
        placeholder="e.g. 🔥 Premium Food Store"
        className={inputCls}
      />
    </div>
    <div>
      <label className={labelCls}>
        Hero Title{" "}
        <span className="normal-case tracking-normal font-medium">
          — use " | " to split
        </span>
      </label>
      <input
        {...register("heroTitle")}
        placeholder="e.g. Taste the | Difference"
        className={inputCls}
      />
    </div>
    <div>
      <label className={labelCls}>Hero Description</label>
      <textarea
        {...register("heroDescription")}
        rows={3}
        placeholder="A short description of your store…"
        className={`${inputCls} resize-none`}
      />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Special Offer Title</label>
        <input
          {...register("specialOfferTitle")}
          placeholder="e.g. Today's Special"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Special Offer Text</label>
        <input
          {...register("specialOfferText")}
          placeholder="e.g. Get ₦500 off orders over ₦10k"
          className={inputCls}
        />
      </div>
    </div>
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10">
      <div>
        <p className={`${labelCls} mb-1`}>Landing Mode</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Show full-screen hero instead of regular layout
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

export default HomepageContentForm;