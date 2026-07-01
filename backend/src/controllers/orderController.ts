import { Request, Response } from 'express';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { initializePayment } from '../services/paystack.service';
import { sendOrderConfirmation } from '../services/email.service';
import { AuthRequest } from '../middleware/auth';

// @desc    Create Order (supports multiple payment methods)
// @route   POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderItems, shippingAddress, totalPrice, paymentMethod = 'paystack' } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ success: false, message: 'No order items' });
      return;
    }

    // 1. Check stock availability for all items (no reduction yet)
    for (const item of orderItems) {
      const product = await Product.findById(item._id);
      if (!product) {
        res.status(404).json({ success: false, message: `Product ${item._id} not found` });
        return;
      }
      if (product.stock < item.qty) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`
        });
        return;
      }
    }

    // 2. Build and save the order
    const order = new Order({
      user: req.user!._id,
      orderItems: orderItems.map((x: any) => ({
        ...x,
        product: x._id,
        _id: undefined,
      })),
      shippingAddress,
      totalPrice,
      status: 'Pending',
      paymentMethod,
      paymentDetails: paymentMethod === 'bank_transfer' ? {
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0123456789',
        bankName: process.env.BANK_NAME || 'GTBank',
      } : paymentMethod === 'whatsapp' ? {
        whatsappNumber: process.env.WHATSAPP_NUMBER || '+2348000000000',
      } : undefined,
    });

    const createdOrder = await order.save();

    // 3. Stock NOT reduced here – it will be reduced when the order leaves 'Pending' (via webhook or admin update)

    // 4. Handle payment flow
    if (paymentMethod === 'paystack') {
      const paymentData = await initializePayment(
        req.user!.email,
        totalPrice,
        (createdOrder._id as unknown as string)
      );
      if (!paymentData.status) {
        res.status(400).json({ success: false, message: 'Paystack error' });
        return;
      }
      res.status(201).json({
        success: true,
        order: createdOrder,
        paymentUrl: paymentData.data.authorization_url,
        reference: paymentData.data.reference,
      });
    } else {
      // Bank Transfer or WhatsApp: no redirect
      res.status(201).json({
        success: true,
        order: createdOrder,
        paymentMethod,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Paystack Webhook (Server-to-Server verification)
// @route   POST /api/orders/webhook
export const paystackWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      res.status(401).send('Unauthorized');
      return;
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const orderId = event.data.metadata.order_id;

      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).send('Order not found');
        return;
      }

      // Only reduce stock if order was Pending (first time it's being confirmed)
      if (order.status === 'Pending') {
        for (const item of order.orderItems) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
        }
      }

      order.status = 'Paid';
      order.paymentResult = {
        id: event.data.id,
        status: event.data.status,
        update_time: event.data.paid_at,
      };
      await order.save();

      // Send email confirmation
      try {
        const user = await User.findById(order.user);
        if (user) {
          await sendOrderConfirmation(
            user.email,
            order._id.toString(),
            order.totalPrice
          );
        }
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
      }
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Webhook processing failed');
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user!._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};