import { Request, Response } from 'express';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { generateToken } from '../utils/generateToken';
import { sendVerificationEmail } from '../services/email.service';
import { AuthRequest } from '../middleware/auth';

// @desc    Register a new user (with email verification)
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone } = req.body;

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
      phone: phone || '',
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

    res.json({
      success: true,
      _id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      addresses: user.addresses,            // ✅ now returns the full addresses array
      role: user.role,
      createdAt: user.createdAt,
      token: generateToken(user._id.toString()),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile (name & phone only – addresses have their own endpoints)
// @route   PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();

    res.json({
      success: true,
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      addresses: updatedUser.addresses,      // ✅ return updated addresses as well
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------------------------------
// ADDRESS CRUD
// ------------------------------------------------------------------

// @desc    Get user's addresses
// @route   GET /api/auth/addresses
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    res.json(user?.addresses || []);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new address
// @route   POST /api/auth/addresses
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { label, address, city, postalCode, country, isDefault } = req.body;

    // If this address is set as default, unset all others
    if (isDefault) {
      user.addresses.forEach((addr) => addr.isDefault = false);
    }

    user.addresses.push({ label, address, city, postalCode, country, isDefault });
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an address
// @route   PUT /api/auth/addresses/:id
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // TypeScript doesn't know about Mongoose subdoc .id(), so we cast
    const address = (user.addresses as any).id(req.params.id);
    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    // Update fields
    Object.assign(address, req.body);

    // If this address is now default, unset others
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr._id?.toString() !== req.params.id) addr.isDefault = false;
      });
    }

    await user.save();
    res.json(user.addresses);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an address
// @route   DELETE /api/auth/addresses/:id
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    (user.addresses as any).pull(req.params.id);
    await user.save();
    res.json(user.addresses);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set an address as default
// @route   PUT /api/auth/addresses/:id/default
export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const address = (user.addresses as any).id(req.params.id);
    if (!address) {
      res.status(404).json({ success: false, message: 'Address not found' });
      return;
    }

    user.addresses.forEach((addr) => addr.isDefault = false);
    address.isDefault = true;
    await user.save();
    res.json(user.addresses);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};