import { Request, Response } from "express";
import { Product } from "../models/Product";

// @desc    Fetch all products
// @route   GET /api/products
export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single product by slug
// @route   GET /api/products/:slug
export const getProductBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
