import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Coupon } from '../models/Coupon';
import { paystack, PaystackError, ValidationError } from '../config/paystack';
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

    // 2. Build order document
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

    // 3. Payment flow
    if (paymentMethod === 'paystack') {
      try {
        const amountInKobo = Math.round(totalPrice * 100);
        const orderIdString = createdOrder._id.toString();

        const paymentData = await paystack.initializePayment(
          req.user!.email,
          amountInKobo,
          orderIdString,
        );

        if (!paymentData.status) {
          // Paystack returned an unsuccessful status – remove the order
          await Order.findByIdAndDelete(createdOrder._id);
          res.status(400).json({ success: false, message: 'Paystack error' });
          return;
        }

        // Paystack succeeded – now notify admin
        await sendAdminOrderNotification(createdOrder, 'created');

        res.status(201).json({
          success: true,
          order: createdOrder,
          paymentUrl: paymentData.data.authorization_url,
          reference: paymentData.data.reference,
        });
      } catch (paystackError) {
        // Paystack threw an exception – delete the pending order
        await Order.findByIdAndDelete(createdOrder._id);
        throw paystackError; // re-throw to be handled by the outer catch
      }
    } else {
      // Non‑Paystack methods: notify admin immediately
      await sendAdminOrderNotification(createdOrder, 'created');

      res.status(201).json({
        success: true,
        order: createdOrder,
        paymentMethod,
      });
    }
  } catch (error: any) {
    // Specific Paystack / validation errors
    if (error instanceof ValidationError) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    if (error instanceof PaystackError) {
      res.status(502).json({ success: false, message: 'Payment processing failed. Please try again.' });
      return;
    }
    // Fallback
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// @desc    Paystack Webhook (Server-to-Server verification)
// @route   POST /api/orders/webhook
export const paystackWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const rawBody = req.body;

    if (!signature || !rawBody) {
      res.status(401).send('Unauthorized');
      return;
    }

    const isValid = paystack.verifyWebhookSignature(rawBody.toString(), signature);
    if (!isValid) {
      res.status(401).send('Unauthorized');
      return;
    }

    const event = JSON.parse(rawBody.toString());
    if (event.event === 'charge.success') {
      const orderId = event.data.metadata.order_id;
      const order = await Order.findById(orderId);
      if (!order) {
        res.status(404).send('Order not found');
        return;
      }

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

      if (order.couponCode) {
        await Coupon.updateOne(
          { code: order.couponCode.toUpperCase() },
          { $inc: { usedCount: 1 } }
        );
      }

      await sendAdminOrderNotification(order, 'updated', 'Paid');

      try {
        const user = await User.findById(order.user);
        if (user) {
          const originalSubtotal = order.orderItems.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
          );
          await sendOrderConfirmation(
            user.email,
            order._id.toString(),
            order.totalPrice,
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

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const reference = req.params.reference as string;
    const result = await paystack.verifyPayment(reference);
    res.json(result);
  } catch (error) {
    if (error instanceof PaystackError) {
      return res.status(502).json({ success: false, message: 'Payment verification failed.' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
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