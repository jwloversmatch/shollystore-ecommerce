import {
  Banknote,
  Building,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { SettingsData } from "./settingsSchema";

interface PaymentDetailsProps {
  settings: SettingsData | undefined;
}

const cellCls =
  "flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]";
const cellLabelCls =
  "text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1 text-gray-400 dark:text-gray-500";
const cellValueCls = "font-semibold text-sm text-gray-900 dark:text-[#E7E9EA]";

const PaymentDetails = ({ settings }: PaymentDetailsProps) => {
  const defaultAccount =
    settings?.bankAccounts?.find((acc) => acc.isDefault && acc.isActive) ||
    settings?.bankAccounts?.find((acc) => acc.isActive) ||
    null;

  return (
    <div className="space-y-4">
      {defaultAccount ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={cellCls}>
              <Building
                className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              <div>
                <p className={cellLabelCls}>Bank</p>
                <p className={cellValueCls}>{defaultAccount.bankName}</p>
              </div>
            </div>
            <div className={cellCls}>
              <Banknote
                className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              <div>
                <p className={cellLabelCls}>Account Name</p>
                <p className={cellValueCls}>{defaultAccount.accountName}</p>
              </div>
            </div>
            <div className={cellCls}>
              <Banknote
                className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              <div>
                <p className={cellLabelCls}>Account Number</p>
                <p className={`${cellValueCls} font-mono tracking-widest`}>
                  {defaultAccount.accountNumber}
                </p>
              </div>
            </div>
          </div>
          {defaultAccount.isDefault && (
            <p className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <CheckCircle2 size={14} aria-hidden="true" /> Default account
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 p-5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <p className="text-sm">
            No bank accounts configured yet. Click <strong>Edit</strong> to add
            one.
          </p>
        </div>
      )}

      {settings?.whatsappNumber && (
        <div className={cellCls}>
          <MessageCircle
            className="w-4 h-4 mt-0.5 shrink-0 text-[#25D366]"
            aria-hidden="true"
          />
          <div>
            <p className={cellLabelCls}>WhatsApp</p>
            <p className={cellValueCls}>{settings.whatsappNumber}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;