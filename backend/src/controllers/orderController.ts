import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, IOrder } from '../models/Order';   // ✅ import IOrder now exported
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
    const {
      orderItems,
      shippingAddress,
      totalPrice,
      subtotal,
      taxAmount,
      paymentMethod = 'paystack',
      couponCode,
      discount,
      notes,
      isGift,
      giftMessage,
      shippingInfo,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ success: false, message: 'No order items' });
      return;
    }

    // 1. Validate stock (including variants)
    for (const item of orderItems) {
      const product = await Product.findById(item._id);
      if (!product) {
        res.status(404).json({ success: false, message: `Product ${item._id} not found` });
        return;
      }

      if (item.variant && (item.variant.sku || item.variant.color || item.variant.size)) {
        const variant = product.variants?.find(
          v => v.sku === item.variant?.sku || (v.color === item.variant?.color && v.size === item.variant?.size)
        );
        if (!variant) {
          res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
          return;
        }
        const available = variant.stock ?? product.stock;
        if (available < item.qty) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name} (${variant.color || ''} ${variant.size || ''}). Available: ${available}`,
          });
          return;
        }
      } else {
        if (product.stock < item.qty) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          });
          return;
        }
      }
    }

    // 2. Build order document
    const orderData = {
      user: req.user!._id,
      name: req.user!.name || '',
      phone: req.user!.phone || '',
      email: req.user!.email,
      orderItems: orderItems.map((x: any) => ({
        name: x.name,
        qty: x.qty,
        price: x.price,
        product: x._id,
        image: x.image || undefined,
        variant: x.variant || undefined,
      })),
      shippingAddress,
      totalPrice,
      subtotal: subtotal || totalPrice - (discount || 0),
      taxAmount: taxAmount || 0,
      status: 'Pending' as const,
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
      notes: notes || undefined,
      isGift: isGift || false,
      giftMessage: giftMessage || undefined,
      shippingInfo: shippingInfo || {},
    };

    const createdOrder = await Order.create(orderData) as IOrder;

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
          await Order.findByIdAndDelete(createdOrder._id);
          res.status(400).json({ success: false, message: 'Paystack error' });
          return;
        }

        await sendAdminOrderNotification(createdOrder, 'created');

        res.status(201).json({
          success: true,
          order: createdOrder,
          paymentUrl: paymentData.data.authorization_url,
          reference: paymentData.data.reference,
        });
      } catch (paystackError) {
        await Order.findByIdAndDelete(createdOrder._id);
        throw paystackError;
      }
    } else {
      try {
        const originalSubtotal = orderItems.reduce(
          (sum: number, item: any) => sum + item.price * item.qty, 0
        );
        await sendOrderConfirmation(
          req.user!.email,
          createdOrder._id.toString(),
          totalPrice,
          req.user!.name,
          discount || 0,
          couponCode,
          originalSubtotal
        );
      } catch (emailError) {
        console.error('Failed to send customer order confirmation email:', emailError);
      }

      await sendAdminOrderNotification(createdOrder, 'created');

      res.status(201).json({
        success: true,
        order: createdOrder,
        paymentMethod,
      });
    }
  } catch (error: any) {
    if (error instanceof ValidationError) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    if (error instanceof PaystackError) {
      res.status(502).json({ success: false, message: 'Payment processing failed. Please try again.' });
      return;
    }
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
      const order = await Order.findById(orderId) as IOrder | null;
      if (!order) {
        res.status(404).send('Order not found');
        return;
      }

      if (order.status === 'Pending') {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (!product) continue;

          if (item.variant && (item.variant.sku || item.variant.color || item.variant.size)) {
            const variant = product.variants?.find(
              v => v.sku === item.variant?.sku || (v.color === item.variant?.color && v.size === item.variant?.size)
            );
            if (variant) {
              if (variant.stock !== undefined) {
                variant.stock = Math.max(0, variant.stock - item.qty);
              }
              product.stock = Math.max(0, product.stock - item.qty);
              await product.save();
            }
          } else {
            product.stock = Math.max(0, product.stock - item.qty);
            await product.save();
          }
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
          { code: (order.couponCode as string).toUpperCase() },
          { $inc: { usedCount: 1 } }
        );
      }

      await sendAdminOrderNotification(order, 'updated', 'Paid');

      try {
        const user = await User.findById(order.user);
        if (user) {
          const originalSubtotal = order.orderItems.reduce(
            (sum: number, item) => sum + item.price * item.qty, 0  // ✅ item is now properly typed
          );
          await sendOrderConfirmation(
            user.email,
            order._id.toString(),
            order.totalPrice,
            user.name,
            order.discount || 0,
            (order.couponCode as string),
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