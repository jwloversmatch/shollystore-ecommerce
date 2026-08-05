import { z } from "zod";

export const settingsSchema = z.object({
  bankAccountName: z.string().min(1, "Account name is required"),
  bankAccountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  heroTagline: z.string().optional(),
  heroTitle: z.string().optional(),
  heroDescription: z.string().optional(),
  specialOfferTitle: z.string().optional(),
  specialOfferText: z.string().optional(),
  landingMode: z.boolean().optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// Settings data as returned from the API
export interface SettingsData {
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
  whatsappNumber?: string;
  heroTagline?: string;
  heroTitle?: string;
  heroDescription?: string;
  specialOfferTitle?: string;
  specialOfferText?: string;
  landingMode?: boolean;
}