import { Request, Response } from 'express';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { generateToken } from '../utils/generateToken';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendEmailChangeVerification,
} from '../services/email.service';
import { AuthRequest } from '../middleware/auth';

// ─── Security constants ────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS   = 5;
const LOCK_DURATION_MS     = 15 * 60 * 1000;        // 15 minutes
const RESET_EXPIRY_MS      = 60 * 60 * 1000;         // 1 hour
const EMAIL_CHANGE_EXPIRY  = 24 * 60 * 60 * 1000;   // 24 hours
const MAX_REFRESH_SESSIONS = 5;                       // concurrent device sessions kept

// ─── Private helpers ───────────────────────────────────────────────────────

/** SHA-256 hash a token before persisting — never store raw tokens in the DB */
const hashToken = (raw: string) =>
  crypto.createHash('sha256').update(raw).digest('hex');

/** Generate a cryptographically random token and its hash in one shot */
const makeToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hashed: hashToken(raw) };
};

/** Strip sensitive fields before sending user data to the client */
const sanitizeUser = (user: IUser) => ({
  _id:       user._id,
  email:     user.email,
  name:      user.name,
  phone:     user.phone,
  addresses: user.addresses,
  role:      user.role,
  isVerified: user.isVerified,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

/** Write a secure httpOnly refresh-token cookie */
const setRefreshCookie = (res: Response, token: string) =>
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });

const clearRefreshCookie = (res: Response) =>
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRATION & EMAIL VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/auth/register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normEmail = email.trim().toLowerCase();

    if (await User.findOne({ email: normEmail })) {
      // Generic response — prevents email enumeration
      res.status(200).json({
        success: true,
        message: 'If that email is new, a verification link has been sent.',
      });
      return;
    }

    const { raw, hashed } = makeToken();

    await User.create({
      email:             normEmail,
      password,
      name:              name?.trim() || '',
      phone:             phone?.trim() || '',
      verificationToken: hashed,   // store hash, send raw in email
      isVerified:        false,
    });

    await sendVerificationEmail(normEmail, raw);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Check your email to verify your account.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/verify-email?token=...
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = req.query.token as string;
    if (!raw) {
      res.status(400).json({ success: false, message: 'Verification token is missing.' });
      return;
    }

    const user = await User.findOne({ verificationToken: hashToken(raw) });
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
      return;
    }

    user.isVerified        = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified. You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/resend-verification
export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const normEmail = req.body.email?.trim().toLowerCase();

    // Always give the same response — prevents email enumeration
    const respond = () =>
      res.json({
        success: true,
        message: 'If an unverified account exists for that email, a new link has been sent.',
      });

    const user = await User.findOne({ email: normEmail });
    if (!user || user.isVerified) { respond(); return; }

    const { raw, hashed } = makeToken();
    user.verificationToken = hashed;
    await user.save();
    await sendVerificationEmail(normEmail, raw);

    respond();
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN, REFRESH TOKENS & SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normEmail }).select(
      '+password +loginAttempts +lockUntil +refreshTokens'
    ) as IUser | null;

    // ── Lockout check ────────────────────────────────────────────────────
    if (user?.lockUntil && user.lockUntil > new Date()) {
      const mins = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60_000);
      res.status(423).json({
        success: false,
        message: `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`,
      });
      return;
    }

    // ── Credential check ─────────────────────────────────────────────────
    if (!user || !(await user.matchPassword(password))) {
      if (user) {
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          user.lockUntil     = new Date(Date.now() + LOCK_DURATION_MS);
          user.loginAttempts = 0;
        }
        await user.save();
      }
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // ── Email verification check ─────────────────────────────────────────
    if (!user.isVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
      return;
    }

    // ── Success: reset lockout, track last login ──────────────────────────
    user.loginAttempts = 0;
    user.lockUntil     = undefined;
    user.lastLogin     = new Date();

    // ── Issue refresh token, keep only the last N sessions ────────────────
    const { raw: refreshRaw, hashed: refreshHashed } = makeToken();
    user.refreshTokens = [
      ...(user.refreshTokens || []).slice(-(MAX_REFRESH_SESSIONS - 1)),
      refreshHashed,
    ];

    await user.save();
    setRefreshCookie(res, refreshRaw);

    res.json({
      success:      true,
      user:         sanitizeUser(user),
      token:        generateToken(user._id.toString()),  // short-lived access token
      refreshToken: refreshRaw,                          // also in body for mobile clients
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/refresh  — exchange a valid refresh token for a new access token
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Accept from httpOnly cookie (web) or request body (mobile)
    const raw: string | undefined = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!raw) {
      res.status(401).json({ success: false, message: 'No refresh token provided.' });
      return;
    }

    const hashed = hashToken(raw);
    const user   = await User.findOne({ refreshTokens: hashed }).select('+refreshTokens') as IUser | null;

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
      return;
    }

    // ── Token rotation: old token out, new token in ────────────────────────
    const { raw: newRaw, hashed: newHashed } = makeToken();
    user.refreshTokens = [
      ...(user.refreshTokens || []).filter((t) => t !== hashed),
      newHashed,
    ];
    await user.save();

    setRefreshCookie(res, newRaw);
    res.json({
      success:      true,
      token:        generateToken(user._id.toString()),
      refreshToken: newRaw,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/logout
export const logoutUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const raw: string | undefined = req.cookies?.refreshToken || req.body?.refreshToken;
    if (raw && req.user) {
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { refreshTokens: hashToken(raw) } }
      );
    }
    clearRefreshCookie(res);
    res.json({ success: true, message: 'Logged out.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/logout-all  — revoke every active session for this account
export const logoutAllDevices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await User.updateOne({ _id: req.user!._id }, { $set: { refreshTokens: [] } });
    clearRefreshCookie(res);
    res.json({ success: true, message: 'Logged out from all devices.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PASSWORD MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // Generic response regardless of outcome — prevents email enumeration
    const respond = () =>
      res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });

    const user = await User.findOne({ email: req.body.email?.trim().toLowerCase() });
    if (!user) { respond(); return; }

    const { raw, hashed } = makeToken();
    user.resetPasswordToken   = hashed;
    user.resetPasswordExpires = new Date(Date.now() + RESET_EXPIRY_MS);
    await user.save();

    await sendPasswordResetEmail(user.email, raw);
    respond();
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ success: false, message: 'Token and new password are required.' });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken:   hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
      return;
    }

    user.password             = password;    // hashed by pre-save hook
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts        = 0;           // clear any lockout state
    user.lockUntil            = undefined;
    user.refreshTokens        = [];          // force re-login on all devices for security

    await user.save();
    await sendPasswordChangedEmail(user.email, user.name);
    clearRefreshCookie(res);

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/change-password  (authenticated — requires current password)
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current and new password are required.' });
      return;
    }

    const user = await User.findById(req.user!._id).select('+password') as IUser | null;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (!(await user.matchPassword(currentPassword))) {
      res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    user.password      = newPassword;
    user.refreshTokens = [];   // revoke all other sessions — they must re-login
    await user.save();

    await sendPasswordChangedEmail(user.email, user.name);
    clearRefreshCookie(res);

    res.json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (req.body.name  !== undefined) user.name  = req.body.name.trim();
    if (req.body.phone !== undefined) user.phone = req.body.phone.trim();

    const updated = await user.save();
    res.json({ success: true, user: sanitizeUser(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/change-email  — sends verification to the new address
export const changeEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { newEmail, password } = req.body;
    const normNew = newEmail?.trim().toLowerCase();

    if (!normNew || !password) {
      res.status(400).json({ success: false, message: 'New email and current password are required.' });
      return;
    }

    if (await User.findOne({ email: normNew })) {
      res.status(409).json({ success: false, message: 'That email is already in use.' });
      return;
    }

    const user = await User.findById(req.user!._id).select('+password') as IUser | null;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (!(await user.matchPassword(password))) {
      res.status(401).json({ success: false, message: 'Password is incorrect.' });
      return;
    }

    const { raw, hashed } = makeToken();
    user.emailChangeToken   = hashed;
    user.emailChangeExpires = new Date(Date.now() + EMAIL_CHANGE_EXPIRY);
    user.emailChangePending = normNew;
    await user.save();

    await sendEmailChangeVerification(normNew, raw);

    res.json({ success: true, message: 'Verification sent to your new email address. Check your inbox.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/verify-email-change?token=...
export const verifyEmailChange = async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = req.query.token as string;
    if (!raw) {
      res.status(400).json({ success: false, message: 'Token is missing.' });
      return;
    }

    const user = await User.findOne({
      emailChangeToken:   hashToken(raw),
      emailChangeExpires: { $gt: new Date() },
    });

    if (!user || !user.emailChangePending) {
      res.status(400).json({ success: false, message: 'Invalid or expired link.' });
      return;
    }

    user.email              = user.emailChangePending;
    user.emailChangeToken   = undefined;
    user.emailChangeExpires = undefined;
    user.emailChangePending = undefined;
    user.refreshTokens      = [];   // force re-login — email (identity) changed
    await user.save();

    clearRefreshCookie(res);
    res.json({ success: true, message: 'Email updated. Please log in with your new address.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/auth/account  — permanent, requires password confirmation
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ success: false, message: 'Password confirmation is required.' });
      return;
    }

    const user = await User.findById(req.user!._id).select('+password') as IUser | null;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (!(await user.matchPassword(password))) {
      res.status(401).json({ success: false, message: 'Password is incorrect.' });
      return;
    }

    await User.deleteOne({ _id: user._id });
    clearRefreshCookie(res);

    res.json({ success: true, message: 'Account permanently deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADDRESSES
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/auth/addresses
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    res.json({ success: true, addresses: user?.addresses || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/addresses
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { label, address, city, postalCode, country, isDefault } = req.body;

    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

    user.addresses.push({ label, address, city, postalCode, country, isDefault: !!isDefault });
    await user.save();

    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/addresses/:id
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const addr = (user.addresses as any).id(req.params.id);
    if (!addr) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }

    if (req.body.isDefault) {
      user.addresses.forEach((a) => {
        if (a._id?.toString() !== req.params.id) a.isDefault = false;
      });
    }

    Object.assign(addr, req.body);
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/auth/addresses/:id
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    (user.addresses as any).pull(req.params.id);
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/auth/addresses/:id/default
export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const addr = (user.addresses as any).id(req.params.id);
    if (!addr) {
      res.status(404).json({ success: false, message: 'Address not found.' });
      return;
    }

    user.addresses.forEach((a) => (a.isDefault = false));
    addr.isDefault = true;
    await user.save();

    res.json({ success: true, addresses: user.addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};