// frontend/src/pages/admin/settings/SettingsPage.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetSettingsChangesQuery,
} from "../../../features/api/apiSlice";
import { AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { useTheme } from "../../../context/ThemeContext";
import SettingsHeader from "./SettingsHeader";
import HomepageContent from "./HomepageContent";
import HomepageContentForm from "./HomepageContentForm";
import PaymentDetails from "./PaymentDetails";
import PaymentDetailsForm from "./PaymentDetailsForm";
import PushNotifications from "./PushNotifications";
import AuditLog from "./AuditLog";
import { settingsSchema, type SettingsFormData } from "./settingsSchema";

const ACCENT = "#e8622a";

export interface ChangeLogItem {
  _id: string; field: string; oldValue: string; newValue: string;
  adminEmail: string; changedAt: string;
}

const SettingsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [clearModal, setClearModal] = useState(false);

  const { data: settings, isLoading, refetch } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: updating }] = useUpdateSettingsMutation();
  const { data: changeLogs = [] } = useGetSettingsChangesQuery({});

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (settings) {
      reset({
        bankAccountName: settings.bankAccountName || "",
        bankAccountNumber: settings.bankAccountNumber || "",
        bankName: settings.bankName || "",
        whatsappNumber: settings.whatsappNumber || "",
        heroTagline: settings.heroTagline || "",
        heroTitle: settings.heroTitle || "",
        heroDescription: settings.heroDescription || "",
        specialOfferTitle: settings.specialOfferTitle || "",
        specialOfferText: settings.specialOfferText || "",
        landingMode: settings.landingMode || false,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try { await updateSettings(data).unwrap(); toast.success("Settings updated!"); refetch(); setIsEditing(false); }
    catch { toast.error("Failed to update settings."); }
  };

  const toggleLandingMode = async () => {
    try { await updateSettings({ landingMode: !settings?.landingMode }).unwrap(); toast.success(`Landing mode ${!settings?.landingMode ? "enabled" : "disabled"}`); refetch(); }
    catch { toast.error("Failed to toggle landing mode."); }
  };

  const handleClearAll = async () => {
    try {
      await updateSettings({ bankAccountName: "", bankAccountNumber: "", bankName: "", whatsappNumber: "", heroTagline: "", heroTitle: "", heroDescription: "", specialOfferTitle: "", specialOfferText: "", landingMode: false }).unwrap();
      toast.success("Settings cleared!"); refetch(); setIsEditing(false); setClearModal(false);
    } catch { toast.error("Failed to clear settings."); }
  };

  const hasPayment = !!(settings?.bankAccountName || settings?.bankAccountNumber || settings?.bankName || settings?.whatsappNumber);

  // Theme styles
  const bg = isDark ? "#0A0A0B" : "#FCFAF5";
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  if (isLoading) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-28 md:pb-10 focus:outline-none pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-[calc(80px+env(safe-area-inset-top,0px))] lg:pt-[calc(88px+env(safe-area-inset-top,0px))]"
        style={{ background: bg }}
      >
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, j) => <div key={j} className="h-16 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />)}
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-28 md:pb-10 focus:outline-none pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-[calc(80px+env(safe-area-inset-top,0px))] lg:pt-[calc(88px+env(safe-area-inset-top,0px))]"
      style={{ background: bg }}
    >
      <ConfirmationModal isOpen={clearModal} onClose={() => setClearModal(false)} onConfirm={handleClearAll} title="Clear All Settings?" message="This will remove all payment details and homepage content. This cannot be undone." confirmText="Clear All" cancelText="Cancel" type="danger" />

      {/* Header */}
      <SettingsHeader isEditing={isEditing} hasPayment={hasPayment} onEdit={() => setIsEditing(true)} onClear={() => setClearModal(true)} isDark={isDark} />

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <div className="space-y-5" role="region" aria-label="View settings">
            <HomepageContent settings={settings} onToggleLandingMode={toggleLandingMode} isDark={isDark} />
            <PaymentDetails settings={settings} isDark={isDark} />
            <PushNotifications isDark={isDark} />
          </div>
        ) : (
          <div className="space-y-5" role="region" aria-label="Edit settings">
            <HomepageContentForm register={register} errors={errors} settings={settings} onToggleLandingMode={toggleLandingMode} isDark={isDark} />
            <PaymentDetailsForm register={register} errors={errors} isDark={isDark} />
            <div className="flex justify-end gap-3 pb-2">
              <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-3 rounded-xl text-sm font-bold transition-colors" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}>Cancel</button>
              <button type="button" onClick={handleSubmit(onSubmit)} disabled={updating} className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55" style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}>{updating ? "Saving…" : "Save All Settings"}</button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Log */}
      <AuditLog changeLogs={changeLogs} isDark={isDark} />
    </main>
  );
};

export default SettingsPage;