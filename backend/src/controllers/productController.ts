import { Request, Response } from 'express';
import { Product } from '../models/Product';

// @desc    Fetch all products
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};