import { Request, Response } from "express";
import mongoose from "mongoose";
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { sanitizeString } from "../middleware/sanitize";

// Safe import for bad-words
const Filter = require("bad-words") as {
  new (): {
    isProfane(text: string): boolean;
    clean(text: string): string;
    addWords(...words: string[]): void;
    removeWords(...words: string[]): void;
  };
};

const profanityFilter = new Filter();

// Helper: recalculate and update product's averageRating & numberOfReviews
const updateProductRatingStats = async (productId: string) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    averageRating: stats[0]?.avgRating || 0,
    numberOfReviews: stats[0]?.count || 0,
  });
};

// POST /api/products/:productId/reviews
export const createReview = async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.productId);
    const { rating, comment } = req.body;
    const userId = (req as any).user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const cleanComment = sanitizeString(comment, 500);
    if (!cleanComment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    if (profanityFilter.isProfane(cleanComment)) {
      return res.status(400).json({ message: "Review contains inappropriate language." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment: cleanComment,
    });

    await updateProductRatingStats(productId);
    res.status(201).json(review);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:productId/reviews
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.productId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: productId }),
    ]);

    res.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/products/:productId/reviews/:reviewId
export const updateReview = async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.productId);
    const reviewId = String(req.params.reviewId);
    const { rating, comment } = req.body;
    const userId = (req as any).user._id;

    const review = await Review.findOne({ _id: reviewId, product: productId, user: userId });
    if (!review) {
      return res.status(404).json({ message: "Review not found or not authorized" });
    }

    // ✅ 15-minute edit window
    const now = Date.now();
    const createdAt = new Date(review.createdAt).getTime();
    const editWindowMs = 15 * 60 * 1000; // 15 minutes
    if (now - createdAt > editWindowMs) {
      return res.status(403).json({
        message: "Review can no longer be edited. The 15-minute edit window has passed.",
      });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      const cleanComment = sanitizeString(comment, 500);
      if (!cleanComment) {
        return res.status(400).json({ message: "Comment cannot be empty" });
      }
      if (profanityFilter.isProfane(cleanComment)) {
        return res.status(400).json({ message: "Review contains inappropriate language." });
      }
      review.comment = cleanComment;
    }

    await review.save();

    await updateProductRatingStats(productId);
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/:productId/reviews/:reviewId
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const productId = String(req.params.productId);
    const reviewId = String(req.params.reviewId);
    const userId = (req as any).user._id;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      product: productId,
      user: userId,
    });
    if (!review) {
      return res.status(404).json({ message: "Review not found or not authorized" });
    }

    await updateProductRatingStats(productId);
    res.json({ message: "Review deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};