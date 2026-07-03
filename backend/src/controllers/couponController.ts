import { Request, Response } from "express";
import { Coupon } from "../models/Coupon";

// @desc    Get all coupons
// @route   GET /api/admin/coupons
export const getCoupons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a coupon
// @route   POST /api/admin/coupons
export const createCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a coupon
// @route   PUT /api/admin/coupons/:id
export const updateCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!coupon) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }
    res.json(coupon);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/admin/coupons/:id
export const deleteCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate a coupon (public)
// @route   POST /api/coupons/validate
export const validateCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }

    if (!coupon.isActive) {
      res
        .status(400)
        .json({ success: false, message: "Coupon is no longer active" });
      return;
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      res.status(400).json({ success: false, message: "Coupon has expired" });
      return;
    }

    if (
      (coupon.usageLimit ?? 0) > 0 &&
      coupon.usedCount >= (coupon.usageLimit ?? 0)
    ) {
      res
        .status(400)
        .json({ success: false, message: "Coupon usage limit reached" });
      return;
    }

    if (orderTotal < (coupon.minOrderAmount || 0)) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount of ₦${coupon.minOrderAmount} required`,
      });
      return;
    }

    const discount =
      coupon.discountType === "percentage"
        ? Math.round((orderTotal * coupon.discountAmount) / 100)
        : coupon.discountAmount;

    res.json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        discount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
