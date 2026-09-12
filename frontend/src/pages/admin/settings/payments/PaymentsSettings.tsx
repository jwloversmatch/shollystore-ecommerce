import { useState } from "react";
import toast from "react-hot-toast";
import { Banknote, Pencil } from "lucide-react";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
  useSetDefaultBankAccountMutation,
} from "../../../../features/api/apiSlice";
import SettingsSection from "../_components/SettingsSection";
import PaymentDetails from "../PaymentDetails";
import PaymentDetailsForm from "../PaymentDetailsForm";
import type { BankAccount } from "../settingsSchema";

const PaymentsSettings = () => {
  const { data: settings, isLoading, refetch } = useGetSettingsQuery({});
  const [updateSettings] = useUpdateSettingsMutation();
  const [addBankAccount] = useAddBankAccountMutation();
  const [updateBankAccount] = useUpdateBankAccountMutation();
  const [deleteBankAccount] = useDeleteBankAccountMutation();
  const [setDefaultBankAccount] = useSetDefaultBankAccountMutation();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateWhatsapp = async (number: string) => {
    try {
      await updateSettings({ whatsappNumber: number }).unwrap();
      toast.success("WhatsApp number updated!");
      refetch();
    } catch {
      toast.error("Failed to update WhatsApp number.");
    }
  };

  const handleAddAccount = async (
    data: Omit<BankAccount, "_id" | "isDefault" | "isActive">,
  ) => {
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

  if (isLoading) {
    return (
      <SettingsSection
        title="Payment Details"
        icon={<Banknote className="w-4 h-4" />}
        iconBg="rgba(16,185,129,0.12)"
        iconColor="#10b981"
        accentGradient="linear-gradient(90deg, transparent, #10b981, transparent)"
      >
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
      title="Payment Details"
      description="Bank accounts and payment contact for your store."
      icon={<Banknote className="w-4 h-4" />}
      iconBg="rgba(16,185,129,0.12)"
      iconColor="#10b981"
      accentGradient="linear-gradient(90deg, transparent, #10b981, transparent)"
      action={
        !isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white
              bg-emerald-500 hover:bg-emerald-600 shadow-[0_6px_18px_rgba(16,185,129,0.3)]
              transition-colors"
            aria-label="Edit payment details"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-5 py-2 rounded-xl text-sm font-bold
              bg-gray-100 dark:bg-white/[0.06]
              border border-gray-200 dark:border-white/10
              text-gray-500 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Done
          </button>
        )
      }
    >
      {isEditing ? (
        <PaymentDetailsForm
          settings={settings}
          whatsappNumber={settings?.whatsappNumber || ""}
          onUpdateWhatsapp={handleUpdateWhatsapp}
          onAddAccount={handleAddAccount}
          onUpdateAccount={handleUpdateAccount}
          onDeleteAccount={handleDeleteAccount}
          onSetDefault={handleSetDefault}
        />
      ) : (
        <PaymentDetails settings={settings} />
      )}
    </SettingsSection>
  );
};

export default PaymentsSettings;