import { useState } from "react";
import {
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  Circle,
  MessageCircle,
  Save,
} from "lucide-react";
import type { SettingsData, BankAccount } from "./settingsSchema";

interface PaymentDetailsFormProps {
  settings: SettingsData | undefined;
  whatsappNumber?: string;
  onUpdateWhatsapp: (number: string) => void;
  onAddAccount: (
    data: Omit<BankAccount, "_id" | "isDefault" | "isActive">,
  ) => void;
  onUpdateAccount: (id: string, data: Partial<BankAccount>) => void;
  onDeleteAccount: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const inputCls =
  "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E7E9EA] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15";
const labelCls =
  "flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest mb-2 text-gray-400 dark:text-gray-500";
const sectionLabelCls =
  "text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500";

const PaymentDetailsForm = ({
  settings,
  whatsappNumber = "",
  onUpdateWhatsapp,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onSetDefault,
}: PaymentDetailsFormProps) => {
  const [newAccount, setNewAccount] = useState({
    label: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  });
  const [whatsappInput, setWhatsappInput] = useState(whatsappNumber);

  const canAdd =
    !!newAccount.bankName &&
    !!newAccount.accountName &&
    !!newAccount.accountNumber;

  const handleAdd = () => {
    if (!canAdd) return;
    onAddAccount(newAccount);
    setNewAccount({
      label: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
    });
  };

  const handleSaveWhatsapp = () => {
    if (whatsappInput.trim() !== whatsappNumber) {
      onUpdateWhatsapp(whatsappInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
        <label className={labelCls}>
          <MessageCircle
            className="w-3.5 h-3.5 text-[#25D366]"
            aria-hidden="true"
          />
          WhatsApp Number
        </label>
        <div className="flex gap-2">
          <input
            value={whatsappInput}
            onChange={(e) => setWhatsappInput(e.target.value)}
            placeholder="+2348000000000"
            className={`${inputCls} flex-1`}
          />
          <button
            onClick={handleSaveWhatsapp}
            className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center gap-1.5 transition-colors shrink-0"
            title="Save WhatsApp number"
          >
            <Save size={16} aria-hidden="true" />
            Save
          </button>
        </div>
        <p className="text-xs mt-1.5 text-gray-500 dark:text-gray-400">
          Customers will send payment receipts to this number.
        </p>
      </div>

      {/* Existing accounts */}
      {(settings?.bankAccounts?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <p className={sectionLabelCls}>Bank Accounts</p>
          {settings?.bankAccounts?.map((account) => (
            <div
              key={account._id}
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-[#E7E9EA] truncate">
                  {account.bankName}{" "}
                  <span className="text-gray-400 dark:text-gray-500">·</span>{" "}
                  {account.accountName}
                </p>
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate">
                  {account.accountNumber}
                </p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {account.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 size={12} aria-hidden="true" /> Default
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      account.isActive ? "text-gray-400" : "text-red-400"
                    }`}
                  >
                    {account.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!account.isDefault && account.isActive && (
                  <button
                    onClick={() => onSetDefault(account._id)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.06] transition-colors"
                    title="Set as default"
                    aria-label={`Set ${account.bankName} as default`}
                  >
                    <Star
                      size={16}
                      className="text-amber-500"
                      aria-hidden="true"
                    />
                  </button>
                )}
                <button
                  onClick={() =>
                    onUpdateAccount(account._id, { isActive: !account.isActive })
                  }
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.06] transition-colors"
                  title={account.isActive ? "Deactivate" : "Activate"}
                  aria-label={
                    account.isActive ? "Deactivate account" : "Activate account"
                  }
                >
                  <Circle
                    size={16}
                    className={
                      account.isActive ? "text-emerald-500" : "text-red-500"
                    }
                    aria-hidden="true"
                  />
                </button>
                <button
                  onClick={() => onDeleteAccount(account._id)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.06] transition-colors"
                  title="Delete"
                  aria-label={`Delete ${account.bankName} account`}
                >
                  <Trash2
                    size={16}
                    className="text-red-500"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new */}
      <div>
        <p className={`${sectionLabelCls} mb-3`}>Add Bank Account</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={newAccount.label}
            onChange={(e) =>
              setNewAccount({ ...newAccount, label: e.target.value })
            }
            placeholder="Label (optional)"
            className={inputCls}
          />
          <input
            value={newAccount.bankName}
            onChange={(e) =>
              setNewAccount({ ...newAccount, bankName: e.target.value })
            }
            placeholder="Bank Name"
            className={inputCls}
          />
          <input
            value={newAccount.accountName}
            onChange={(e) =>
              setNewAccount({ ...newAccount, accountName: e.target.value })
            }
            placeholder="Account Name"
            className={inputCls}
          />
          <input
            value={newAccount.accountNumber}
            onChange={(e) =>
              setNewAccount({ ...newAccount, accountNumber: e.target.value })
            }
            placeholder="Account Number"
            className={`${inputCls} font-mono`}
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="mt-4 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} aria-hidden="true" /> Add Bank Account
        </button>
      </div>
    </div>
  );
};

export default PaymentDetailsForm;