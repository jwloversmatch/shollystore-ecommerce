import { CreditCard, Banknote } from "lucide-react";
import type { PaymentMethodId } from "./types";

export const ACCENT = "#e8622a";
export const SUCCESS_GREEN = "#10b981";
export const PENDING_AMBER = "#f59e0b";

export const FOCUS_RING =
  "focus-within:ring-2 focus-within:ring-[#e8622a] focus-within:ring-offset-2";

export const PAYMENT_METHODS: ReadonlyArray<{
  id: PaymentMethodId;
  label: string;
  sub: string;
  Icon: typeof CreditCard;
  color: string;
}> = [
  {
    id: "paystack",
    label: "Pay Online",
    sub: "Card, USSD, or bank transfer via Paystack",
    Icon: CreditCard,
    color: "#3b82f6",
  },
  {
    id: "bank_transfer",
    label: "Direct Bank Transfer",
    sub: "Send money to our account, then confirm on WhatsApp",
    Icon: Banknote,
    color: SUCCESS_GREEN,
  },
];