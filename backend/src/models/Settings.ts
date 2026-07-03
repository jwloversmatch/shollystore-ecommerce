import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  whatsappNumber: string;
  // --- new fields ---
  heroTagline: string;
  heroTitle: string;
  heroDescription: string;
  specialOfferTitle: string;
  specialOfferText: string;
}

const SettingsSchema: Schema = new Schema({
  bankAccountName: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  // --- new fields with defaults ---
  heroTagline: { type: String, default: '📦 Bulk Beverage Store' },
  heroTitle: { type: String, default: 'Your Everyday | Drink Superstore' },
  heroDescription: { type: String, default: 'From classic Fanta and Coke to refreshing Malt and premium bottled water — all available in convenient packs.' },
  specialOfferTitle: { type: String, default: 'Stock Up & Save' },
  specialOfferText: { type: String, default: 'Get ₦500 off your first bulk order of ₦10,000 or more. Use code FIRST500' },
});

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);