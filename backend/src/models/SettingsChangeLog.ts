import mongoose, { Document, Schema } from 'mongoose';

export interface ISettingsChangeLog extends Document {
  adminEmail: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: Date;
}

const SettingsChangeLogSchema: Schema = new Schema({
  adminEmail: { type: String, required: true },
  field: { type: String, required: true },
  oldValue: { type: String, required: true },
  newValue: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
});

export const SettingsChangeLog = mongoose.model<ISettingsChangeLog>('SettingsChangeLog', SettingsChangeLogSchema);