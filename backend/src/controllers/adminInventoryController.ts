import { Request, Response } from 'express';
import { Product } from '../models/Product';

// @desc    Explicitly update product stock directly
// @route   PUT /api/admin/inventory/:id
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    product.stock = stock;
    await product.save();
    res.json({ success: true, message: 'Stock updated', stock: product.stock });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};