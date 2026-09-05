import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBankAccount {
  _id: Types.ObjectId;
  label: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isDefault: boolean;
  isActive: boolean;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    label: { type: String, default: '' },
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export interface ISettings extends Document {
  bankAccounts: Types.DocumentArray<IBankAccount>;
  whatsappNumber: string;
  // --- homepage content fields ---
  heroTagline: string;
  heroTitle: string;
  heroDescription: string;
  specialOfferTitle: string;
  specialOfferText: string;
  landingMode: boolean;
}

const SettingsSchema: Schema = new Schema({
  bankAccounts: { type: [BankAccountSchema], default: [] },
  whatsappNumber: { type: String, default: '' },
  // --- homepage content fields with defaults ---
  landingMode: { type: Boolean, default: false },
  heroTagline: { type: String, default: '📦 Bulk Beverage Store' },
  heroTitle: { type: String, default: 'Your Everyday | Drink Superstore' },
  heroDescription: { type: String, default: 'From classic Fanta and Coke to refreshing Malt and premium bottled water — all available in convenient packs.' },
  specialOfferTitle: { type: String, default: 'Stock Up & Save' },
  specialOfferText: { type: String, default: 'Get ₦500 off your first bulk order of ₦10,000 or more. Use code FIRST500' },
});

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);