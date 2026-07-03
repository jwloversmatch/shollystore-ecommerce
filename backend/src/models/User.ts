import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// ---------- Address sub‑document ----------
export interface IAddress {
  _id?: string;
  label: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
}

const AddressSchema = new Schema({
  label: { type: String, default: 'Home' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, default: '' },
  country: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
});

// ---------- User interface ----------
export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  isVerified: boolean;
  verificationToken: string | null;
  addresses: IAddress[];                     // ✅ multiple addresses
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// ---------- User schema ----------
const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  addresses: { type: [AddressSchema], default: [] },   // ✅ replaced shippingAddress
});

// ---------- Indexes ----------
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Hash password before saving
UserSchema.pre<IUser>('save', async function (this: IUser) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);