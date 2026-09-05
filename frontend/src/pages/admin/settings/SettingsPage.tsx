import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetSettingsChangesQuery,
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
  useSetDefaultBankAccountMutation,
} from "../../../features/api/apiSlice";
import { useTheme } from "../../../context/ThemeContext";
import SettingsHeader from "./SettingsHeader";
import HomepageContent from "./HomepageContent";
import HomepageContentForm from "./HomepageContentForm";
import PaymentDetails from "./PaymentDetails";
import PaymentDetailsForm from "./PaymentDetailsForm";
import PushNotifications from "./PushNotifications";
import AuditLog from "./AuditLog";
import { settingsSchema, type SettingsFormData, type BankAccount } from "./settingsSchema";

const ACCENT = "#e8622a";

export interface ChangeLogItem {
  _id: string;
  field: string;
  oldValue: string;
  newValue: string;
  adminEmail: string;
  changedAt: string;
}

const SettingsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: settings, isLoading, refetch } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: updating }] = useUpdateSettingsMutation();
  const { data: changeLogs = [] } = useGetSettingsChangesQuery({});

  // Bank account mutation hooks
  const [addBankAccount] = useAddBankAccountMutation();
  const [updateBankAccount] = useUpdateBankAccountMutation();
  const [deleteBankAccount] = useDeleteBankAccountMutation();
  const [setDefaultBankAccount] = useSetDefaultBankAccountMutation();

  // ---- Per‑section edit states ----
  const [isEditingHomepage, setIsEditingHomepage] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);

  // Flat fields form (used only for homepage content)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({ resolver: zodResolver(settingsSchema) });

  // Reset flat fields whenever settings load (but only if not currently editing homepage)
  useEffect(() => {
    if (settings && !isEditingHomepage) {
      reset({
        whatsappNumber: settings.whatsappNumber || "",
        heroTagline: settings.heroTagline || "",
        heroTitle: settings.heroTitle || "",
        heroDescription: settings.heroDescription || "",
        specialOfferTitle: settings.specialOfferTitle || "",
        specialOfferText: settings.specialOfferText || "",
        landingMode: settings.landingMode || false,
      });
    }
  }, [settings, reset, isEditingHomepage]);

  // ---- Save flat fields (homepage content) ----
  const onSaveHomepage = async (data: SettingsFormData) => {
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
      setIsEditingHomepage(false);
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

  // ---- WhatsApp number handler ----
  const handleUpdateWhatsapp = async (number: string) => {
    try {
      await updateSettings({ whatsappNumber: number }).unwrap();
      toast.success("WhatsApp number updated!");
      refetch();
    } catch {
      toast.error("Failed to update WhatsApp number.");
    }
  };

  // ---- Bank account handlers ----
  const handleAddAccount = async (data: Omit<BankAccount, "_id" | "isDefault" | "isActive">) => {
    try {
      await addBankAccount(data).unwrap();
      toast.success("Bank account added!");
      refetch();
    } catch {
      toast.error("Failed to add bank account.");
    }
  };

  const handleUpdateAccount = async (id: string, data: Partial<BankAccount>) => {
    try {
      await updateBankAccount({ id, data }).unwrap();
      toast.success("Bank account updated!");
      refetch();
    } catch {
      toast.error("Failed to update bank account.");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await deleteBankAccount(id).unwrap();
      toast.success("Bank account deleted!");
      refetch();
    } catch {
      toast.error("Failed to delete bank account.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultBankAccount(id).unwrap();
      toast.success("Default bank account updated!");
      refetch();
    } catch {
      toast.error("Failed to set default account.");
    }
  };

  // ---- Theme styles ----
  const bg = isDark ? "#0A0A0B" : "#FCFAF5";

  if (isLoading) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-28 md:pb-10 focus:outline-none pt-[calc(56px_+_env(safe-area-inset-top,0px))] md:pt-[calc(80px_+_env(safe-area-inset-top,0px))] lg:pt-[calc(88px_+_env(safe-area-inset-top,0px))]"
        style={{ background: bg }}
      >
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6" style={{ background: isDark ? "#141414" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}` }}>
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
      className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-28 md:pb-10 focus:outline-none pt-[calc(56px_+_env(safe-area-inset-top,0px))] md:pt-[calc(80px_+_env(safe-area-inset-top,0px))] lg:pt-[calc(88px_+_env(safe-area-inset-top,0px))]"
      style={{ background: bg }}
    >
      {/* Page header */}
      <SettingsHeader isDark={isDark} />

      {/* Homepage Content Section */}
      <section aria-label="Homepage Content">
        {!isEditingHomepage ? (
          <HomepageContent
            settings={settings}
            onToggleLandingMode={toggleLandingMode}
            isDark={isDark}
            onEdit={() => {
              reset({
                whatsappNumber: settings?.whatsappNumber || "",
                heroTagline: settings?.heroTagline || "",
                heroTitle: settings?.heroTitle || "",
                heroDescription: settings?.heroDescription || "",
                specialOfferTitle: settings?.specialOfferTitle || "",
                specialOfferText: settings?.specialOfferText || "",
                landingMode: settings?.landingMode || false,
              });
              setIsEditingHomepage(true);
            }}
          />
        ) : (
          <div className="space-y-4">
            <HomepageContentForm
              register={register}
              errors={errors}
              settings={settings}
              onToggleLandingMode={toggleLandingMode}
              isDark={isDark}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditingHomepage(false)}
                className="px-5 py-3 rounded-xl text-sm font-bold transition-colors"
                style={{ background: isDark ? "#1c1c1c" : "#f3f4f6", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, color: isDark ? "#6b7280" : "#9ca3af" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSaveHomepage)}
                disabled={updating}
                className="px-7 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55"
                style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
              >
                {updating ? "Saving…" : "Save Homepage"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Payment Details Section */}
      <section aria-label="Payment Details">
        {!isEditingPayment ? (
          <PaymentDetails
            settings={settings}
            isDark={isDark}
            onEdit={() => setIsEditingPayment(true)}
          />
        ) : (
          <div className="space-y-4">
            <PaymentDetailsForm
              settings={settings}
              isDark={isDark}
              whatsappNumber={settings?.whatsappNumber || ""}
              onUpdateWhatsapp={handleUpdateWhatsapp}
              onAddAccount={handleAddAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
              onSetDefault={handleSetDefault}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditingPayment(false)}
                className="px-5 py-3 rounded-xl text-sm font-bold transition-colors"
                style={{ background: isDark ? "#1c1c1c" : "#f3f4f6", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`, color: isDark ? "#6b7280" : "#9ca3af" }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Push Notifications */}
      <PushNotifications isDark={isDark} />

      {/* Audit Log */}
      <AuditLog changeLogs={changeLogs} isDark={isDark} />
    </main>
  );
};

export default SettingsPage;