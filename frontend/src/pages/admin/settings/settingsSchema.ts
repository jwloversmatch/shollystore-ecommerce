import { z } from "zod";

// ─── Flat settings fields (editable via main settings form) ─────────────────
export const settingsSchema = z.object({
  whatsappNumber: z.string().optional(),
  heroTagline: z.string().optional(),
  heroTitle: z.string().optional(),
  heroDescription: z.string().optional(),
  specialOfferTitle: z.string().optional(),
  specialOfferText: z.string().optional(),
  landingMode: z.boolean().optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// ─── Bank account types (now managed separately) ────────────────────────────
export interface BankAccount {
  _id: string;
  label: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isDefault: boolean;
  isActive: boolean;
}

export type BankAccountInput = Omit<BankAccount, "_id" | "isDefault" | "isActive">;

// ─── Settings data as returned from the API ─────────────────────────────────
export interface SettingsData {
  _id?: string;
  bankAccounts: BankAccount[];
  whatsappNumber?: string;
  heroTagline?: string;
  heroTitle?: string;
  heroDescription?: string;
  specialOfferTitle?: string;
  specialOfferText?: string;
  landingMode?: boolean;
}