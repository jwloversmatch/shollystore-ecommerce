import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// ---------- Address sub-document ----------
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
  label:      { type: String, default: 'Home' },
  address:    { type: String, required: true },
  city:       { type: String, required: true },
  postalCode: { type: String, default: '' },
  country:    { type: String, default: '' },
  isDefault:  { type: Boolean, default: false },
});

// ---------- User interface ----------
export interface IUser extends Document {
  // ── Core ────────────────────────────────────────────
  email:    string;
  password: string;
  name?:    string;
  phone?:   string;
  role:     'user' | 'admin';
  createdAt: Date;

  // ── Email verification ───────────────────────────────
  isVerified:         boolean;
  verificationToken?: string | null;

  // ── Addresses ────────────────────────────────────────
  addresses: IAddress[];

  // ── Session management ───────────────────────────────
  lastLogin?:    Date;
  refreshTokens: string[];   // hashed tokens, one per active device session

  // ── Login lockout ────────────────────────────────────
  loginAttempts: number;
  lockUntil?:    Date;

  // ── Password reset ───────────────────────────────────
  resetPasswordToken?:   string;   // stored as SHA-256 hash
  resetPasswordExpires?: Date;

  // ── Email change flow ────────────────────────────────
  emailChangeToken?:   string;   // stored as SHA-256 hash
  emailChangeExpires?: Date;
  emailChangePending?: string;   // new email awaiting verification

  // ── Methods ──────────────────────────────────────────
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// ---------- User schema ----------
const UserSchema: Schema = new Schema({
  // ── Core ────────────────────────────────────────────
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name:     { type: String, default: '' },
  phone:    { type: String, default: '' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },

  // ── Email verification ───────────────────────────────
  isVerified:        { type: Boolean, default: false },
  verificationToken: { type: String, default: null },

  // ── Addresses ────────────────────────────────────────
  addresses: { type: [AddressSchema], default: [] },

  // ── Session management ───────────────────────────────
  lastLogin:     { type: Date },
  refreshTokens: { type: [String], default: [] },

  // ── Login lockout ────────────────────────────────────
  loginAttempts: { type: Number, default: 0 },
  lockUntil:     { type: Date },

  // ── Password reset ───────────────────────────────────
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },

  // ── Email change ─────────────────────────────────────
  emailChangeToken:   { type: String },
  emailChangeExpires: { type: Date },
  emailChangePending: { type: String },
});

// ---------- Indexes ----------
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Token lookups — used on every auth request, keep them fast
UserSchema.index({ refreshTokens:      1 });
UserSchema.index({ resetPasswordToken: 1 });
UserSchema.index({ emailChangeToken:   1 });

// ---------- Pre-save: hash password ----------
UserSchema.pre<IUser>('save', async function (this: IUser) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---------- Instance method: compare password ----------
UserSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);