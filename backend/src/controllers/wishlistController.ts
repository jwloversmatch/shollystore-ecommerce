import { Response } from 'express';
import mongoose from "mongoose";
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// @desc    Get user wishlist (populated)
// @route   GET /api/wishlist
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).populate('wishlist', 'name slug price images stock category');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check if already exists
    if (user.wishlist.includes(productId as any)) {
      res.status(400).json({ success: false, message: 'Product already in wishlist' });
      return;
    }

    user.wishlist.push(productId as any);
    await user.save();

    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    ) as mongoose.Types.ObjectId[];

    await user.save();

    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};