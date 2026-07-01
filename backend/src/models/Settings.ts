import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  whatsappNumber: string;
}

const SettingsSchema: Schema = new Schema({
  bankAccountName: { type: String, default: '' },
  bankAccountNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
});

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);