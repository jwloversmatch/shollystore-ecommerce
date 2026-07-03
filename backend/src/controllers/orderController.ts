import { Request, Response } from 'express';
import crypto from 'crypto';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { initializePayment } from '../services/paystack.service';
import {
  sendOrderConfirmation,
  sendAdminOrderNotification,
} from '../services/email.service';
import { AuthRequest } from '../middleware/auth';

// @desc    Create Order (supports multiple payment methods)
// @route   POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderItems, shippingAddress, totalPrice, paymentMethod = 'paystack', couponCode, discount } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ success: false, message: 'No order items' });
      return;
    }

    // 1. Check stock availability
    for (const item of orderItems) {
      const product = await Product.findById(item._id);
      if (!product) {
        res.status(404).json({ success: false, message: `Product ${item._id} not found` });
        return;
      }
      if (product.stock < item.qty) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`,
        });
        return;
      }
    }

    // 2. Build order document – include name, phone, couponCode and discount
    const order = new Order({
      user: req.user!._id,
      name: req.user!.name || '',
      phone: req.user!.phone || '',
      orderItems: orderItems.map((x: any) => ({
        ...x,
        product: x._id,
        _id: undefined,
      })),
      shippingAddress,
      totalPrice,
      status: 'Pending',
      paymentMethod,
      paymentDetails:
        paymentMethod === 'bank_transfer'
          ? {
              accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0123456789',
              bankName: process.env.BANK_NAME || 'GTBank',
            }
          : paymentMethod === 'whatsapp'
          ? {
              whatsappNumber: process.env.WHATSAPP_NUMBER || '+2348000000000',
            }
          : undefined,
      couponCode: couponCode || undefined,
      discount: discount || 0,
    });

    const createdOrder = await order.save();

    // 3. Notify admin
    await sendAdminOrderNotification(createdOrder, 'created');

    // 4. Payment flow
    if (paymentMethod === 'paystack') {
      const paymentData = await initializePayment(
        req.user!.email,
        totalPrice,
        (createdOrder._id as unknown as string),
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

      const oldStatus = order.status;
      order.status = 'Paid';
      order.paymentResult = {
        id: event.data.id,
        status: event.data.status,
        update_time: event.data.paid_at,
      };
      await order.save();

      // Notify admin about status change
      await sendAdminOrderNotification(order, 'updated', 'Paid');

      // Send email confirmation to user with full breakdown
      try {
        const user = await User.findById(order.user);
        if (user) {
          // Compute original subtotal from order items
          const originalSubtotal = order.orderItems.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
          );

          await sendOrderConfirmation(
            user.email,
            order._id.toString(),
            order.totalPrice,          // final total
            user.name,
            order.discount || 0,
            order.couponCode,
            originalSubtotal
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
    const orders = await Order.find({ user: req.user!._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};