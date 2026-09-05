import { useState } from "react";
import {
  Banknote,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { SettingsData, BankAccount } from "./settingsSchema";

interface PaymentDetailsFormProps {
  settings: SettingsData | undefined;
  isDark: boolean;
  onAddAccount: (
    data: Omit<BankAccount, "_id" | "isDefault" | "isActive">,
  ) => void;
  onUpdateAccount: (id: string, data: Partial<BankAccount>) => void;
  onDeleteAccount: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const PaymentDetailsForm = ({
  settings,
  isDark,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onSetDefault,
}: PaymentDetailsFormProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const inputCls =
    "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15";

  const [newAccount, setNewAccount] = useState({
    label: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  const handleAdd = () => {
    if (
      !newAccount.bankName ||
      !newAccount.accountName ||
      !newAccount.accountNumber
    )
      return;
    onAddAccount(newAccount);
    setNewAccount({
      label: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
    });
  };

  return (
    <section
      className="relative rounded-2xl overflow-hidden"
      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
    >
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, #10b981, transparent)",
        }}
      />
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}
          >
            <Banknote className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-black" style={{ color: textPrimary }}>
            Bank Accounts
          </h2>
        </div>

        {/* Existing accounts list */}
        <div className="space-y-3 mb-5">
          {settings?.bankAccounts?.map((account) => (
            <div
              key={account._id}
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{
                background: inputBg,
                border: `1px solid ${inputBorder}`,
              }}
            >
              <div className="flex-1">
                <p
                  className="font-semibold text-sm"
                  style={{ color: textPrimary }}
                >
                  {account.bankName} <span style={{ color: textMuted }}>·</span>{" "}
                  {account.accountName}
                </p>
                <p className="font-mono text-xs" style={{ color: textMuted }}>
                  {account.accountNumber}
                </p>
                <div className="flex gap-2 mt-1">
                  {account.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Default
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${account.isActive ? "text-gray-400" : "text-red-400"}`}
                  >
                    {account.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!account.isDefault && account.isActive && (
                  <button
                    onClick={() => onSetDefault(account._id)}
                    className="p-2 rounded-lg hover:bg-white/10"
                    title="Set as default"
                  >
                    <Star size={16} style={{ color: "#f59e0b" }} />
                  </button>
                )}
                <button
                  onClick={() =>
                    onUpdateAccount(account._id, {
                      isActive: !account.isActive,
                    })
                  }
                  className="p-2 rounded-lg hover:bg-white/10"
                  title={account.isActive ? "Deactivate" : "Activate"}
                >
                  <Circle
                    size={16}
                    style={{ color: account.isActive ? "#10b981" : "#ef4444" }}
                  />
                </button>
                <button
                  onClick={() => onDeleteAccount(account._id)}
                  className="p-2 rounded-lg hover:bg-white/10"
                  title="Delete"
                >
                  <Trash2 size={16} style={{ color: "#ef4444" }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new account form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={newAccount.label}
            onChange={(e) =>
              setNewAccount({ ...newAccount, label: e.target.value })
            }
            placeholder="Label (optional)"
            className={`${inputCls}`}
            style={{
              background: inputBg,
              borderColor: inputBorder,
              color: textPrimary,
            }}
          />
          <input
            value={newAccount.bankName}
            onChange={(e) =>
              setNewAccount({ ...newAccount, bankName: e.target.value })
            }
            placeholder="Bank Name"
            className={`${inputCls}`}
            style={{
              background: inputBg,
              borderColor: inputBorder,
              color: textPrimary,
            }}
          />
          <input
            value={newAccount.accountName}
            onChange={(e) =>
              setNewAccount({ ...newAccount, accountName: e.target.value })
            }
            placeholder="Account Name"
            className={`${inputCls}`}
            style={{
              background: inputBg,
              borderColor: inputBorder,
              color: textPrimary,
            }}
          />
          <input
            value={newAccount.accountNumber}
            onChange={(e) =>
              setNewAccount({ ...newAccount, accountNumber: e.target.value })
            }
            placeholder="Account Number"
            className={`${inputCls} font-mono`}
            style={{
              background: inputBg,
              borderColor: inputBorder,
              color: textPrimary,
            }}
          />
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm flex items-center gap-2"
        >
          <Plus size={16} /> Add Bank Account
        </button>
      </div>
    </section>
  );
};

export default PaymentDetailsForm;
