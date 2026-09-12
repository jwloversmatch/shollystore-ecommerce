import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Home, Pencil, Loader2 } from "lucide-react";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../../../../features/api/apiSlice";
import SettingsSection from "../_components/SettingsSection";
import HomepageContent from "../HomepageContent";
import HomepageContentForm from "../HomepageContentForm";
import { settingsSchema, type SettingsFormData } from "../settingsSchema";

const GeneralSettings = () => {
  const { data: settings, isLoading, refetch } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: updating }] = useUpdateSettingsMutation();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({ resolver: zodResolver(settingsSchema) });

  const onEdit = () => {
    reset({
      heroTagline: settings?.heroTagline || "",
      heroTitle: settings?.heroTitle || "",
      heroDescription: settings?.heroDescription || "",
      specialOfferTitle: settings?.specialOfferTitle || "",
      specialOfferText: settings?.specialOfferText || "",
      landingMode: settings?.landingMode || false,
    });
    setIsEditing(true);
  };

  const onSave = async (data: SettingsFormData) => {
    try {
      await updateSettings({
        heroTagline: data.heroTagline,
        heroTitle: data.heroTitle,
        heroDescription: data.heroDescription,
        specialOfferTitle: data.specialOfferTitle,
        specialOfferText: data.specialOfferText,
        landingMode: data.landingMode,
      }).unwrap();
      toast.success("Homepage settings saved!");
      refetch();
      setIsEditing(false);
    } catch {
      toast.error("Failed to save homepage settings.");
    }
  };

  const toggleLandingMode = async () => {
    try {
      await updateSettings({ landingMode: !settings?.landingMode }).unwrap();
      toast.success(`Landing mode ${!settings?.landingMode ? "enabled" : "disabled"}`);
      refetch();
    } catch {
      toast.error("Failed to toggle landing mode.");
    }
  };

  if (isLoading) {
    return (
      <SettingsSection title="Homepage Content" icon={<Home className="w-4 h-4" />}>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-gray-100 dark:bg-white/[0.03] animate-pulse"
            />
          ))}
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Homepage Content"
      description="What visitors see on your storefront."
      icon={<Home className="w-4 h-4" />}
      action={
        !isEditing ? (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white
              bg-[#e8622a] hover:bg-[#c9511f] shadow-[0_6px_18px_rgba(232,98,42,0.27)]
              transition-colors"
            aria-label="Edit homepage content"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit
          </button>
        ) : undefined
      }
    >
      {isEditing ? (
        <form onSubmit={handleSubmit(onSave)} className="space-y-5">
          <HomepageContentForm
            register={register}
            errors={errors}
            settings={settings}
            onToggleLandingMode={toggleLandingMode}
          />
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-3 rounded-xl text-sm font-bold
                bg-gray-100 dark:bg-white/[0.06]
                border border-gray-200 dark:border-white/10
                text-gray-500 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-black text-white text-sm
                bg-[#e8622a] hover:bg-[#c9511f] shadow-[0_6px_18px_rgba(232,98,42,0.27)]
                disabled:opacity-55 transition-colors"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save Homepage"
              )}
            </button>
          </div>
        </form>
      ) : (
        <HomepageContent
          settings={settings}
          onToggleLandingMode={toggleLandingMode}
        />
      )}
    </SettingsSection>
  );
};

export default GeneralSettings;