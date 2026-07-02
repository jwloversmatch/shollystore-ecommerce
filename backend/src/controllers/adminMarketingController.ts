import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';
import { getAllUserEmails, sendNewArrivalEmail, sendBackInStockEmail } from '../services/marketingEmail.service';

// @desc    Send a new arrival or back-in-stock email to all customers
// @route   POST /api/admin/marketing/send
export const sendMarketingEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, productId, customMessage } = req.body;

    if (!type || !productId) {
      res.status(400).json({ success: false, message: 'Type and productId are required.' });
      return;
    }

    if (!['new_arrival', 'back_in_stock'].includes(type)) {
      res.status(400).json({ success: false, message: 'Invalid type. Must be new_arrival or back_in_stock.' });
      return;
    }

    // Fetch product details
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Get all customer emails
    const recipients = await getAllUserEmails();
    if (recipients.length === 0) {
      res.status(400).json({ success: false, message: 'No customers to send to.' });
      return;
    }

    const productImage = product.images?.[0] || '';
    const productUrl = `${process.env.CLIENT_URL || 'https://lotcewieth.com'}/products/${product.slug || product._id}`;

    // Send the appropriate email (this is non‑blocking)
    if (type === 'new_arrival') {
      await sendNewArrivalEmail(recipients, product.name, productImage, productUrl, customMessage || product.description);
    } else if (type === 'back_in_stock') {
      await sendBackInStockEmail(recipients, product.name, productImage, productUrl);
    }

    res.json({ success: true, message: `Emails are being sent to ${recipients.length} customers.` });
  } catch (error: any) {
    console.error('Marketing email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};