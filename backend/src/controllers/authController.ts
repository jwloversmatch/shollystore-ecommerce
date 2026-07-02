import { Request, Response } from 'express';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { generateToken } from '../utils/generateToken';
import { sendVerificationEmail } from '../services/email.service';

// @desc    Register a new user (with email verification)
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone } = req.body;   // ✅ accept phone

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      email,
      password,
      name: name || '',
      phone: phone || '',        // ✅ store phone
      verificationToken,
      isVerified: false,
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.query.token as string;

    if (!token) {
      res.status(400).json({ success: false, message: 'Verification token is missing.' });
      return;
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
export const resendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: 'No account found with this email.' });
      return;
    }
    if (user.isVerified) {
      res.status(400).json({ success: false, message: 'This email is already verified. Please log in.' });
      return;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.json({ success: true, message: 'Verification email resent successfully. Please check your inbox.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token (only if verified)
// @route   POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }) as IUser | null;

    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
      });
      return;
    }

    // ✅ Include phone in response
    res.json({
      success: true,
      _id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,             // added
      role: user.role,
      createdAt: user.createdAt,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};