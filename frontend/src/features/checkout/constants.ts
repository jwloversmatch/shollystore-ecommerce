import { CreditCard, Banknote, MessageCircle } from "lucide-react";
import type { PaymentMethodId } from "./types";

export const ACCENT = "#e8622a";

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
    label: "Paystack",
    sub: "Card / Bank Transfer",
    Icon: CreditCard,
    color: "#3b82f6",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    sub: "Manual bank deposit",
    Icon: Banknote,
    color: "#10b981",
  },
  {
    id: "whatsapp",
    label: "WhatsApp Pay",
    sub: "Chat to complete order",
    Icon: MessageCircle,
    color: "#25D366",
  },
];