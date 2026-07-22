import { Request, Response } from 'express';
import mongoose from 'mongoose'; 
import { Order, IOrder } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { Coupon } from '../models/Coupon';
import {
  sendAdminOrderNotification,
  sendOrderStatusUpdateEmail,
} from '../services/email.service';

// Helper to reduce stock (handles variants)
const reduceStockForOrder = async (order: IOrder) => {
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (item.variant && (item.variant.sku || item.variant.color || item.variant.size)) {
      // Find matching variant
      const variant = product.variants?.find(
        v => v.sku === item.variant?.sku ||
             (v.color === item.variant?.color && v.size === item.variant?.size)
      );
      if (variant) {
        if (variant.stock !== undefined) {
          variant.stock = Math.max(0, variant.stock - item.qty);
        }
        // Reduce parent stock too (if separate)
        product.stock = Math.max(0, product.stock - item.qty);
        await product.save();
      }
    } else {
      // No variant – reduce main stock
      product.stock = Math.max(0, product.stock - item.qty);
      await product.save();
    }
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/orders
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const recentOrders = await Order.find()
      .populate('user', 'email name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'Pending' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      orders: recentOrders,
      totalRevenue,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    if (req.query.paymentMethod && req.query.paymentMethod !== 'All') {
      filter.paymentMethod = req.query.paymentMethod;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      const users = await User.find({ email: searchRegex }).select('_id');
      const userIds = users.map((u) => u._id);
      filter.user = { $in: userIds };
    }
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'email name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    res.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      totalRevenue,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Fetch with typed result
    const order = await Order.findById(id).populate('user', 'email name phone') as IOrder | null;
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Reduce stock if moving from Pending
    if (order.status === 'Pending' && status !== 'Pending') {
      await reduceStockForOrder(order);
    }

    // Update status field only
    await Order.updateOne({ _id: order._id }, { $set: { status } });

    // Handle coupon increment exactly once when turning to Paid
    if (status === 'Paid' && order.status !== 'Paid' && order.couponCode) {
      await Coupon.updateOne(
        { code: order.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // Update in‑memory status
    order.status = status;

    // Notify admin
    await sendAdminOrderNotification(order, 'updated', status);

    // Notify customer if shipped/delivered
    if (['Shipped', 'Delivered'].includes(status)) {
      const populatedUser = order.user as unknown as { email?: string; name?: string; phone?: string } | null;
      if (populatedUser?.email) {
        const originalSubtotal = order.orderItems.reduce(
          (sum, item) => sum + item.price * item.qty,
          0
        );
        await sendOrderStatusUpdateEmail(
          populatedUser.email,
          (order._id as mongoose.Types.ObjectId).toString(),
          status,
          order.totalPrice,
          populatedUser.name,
          order.discount || 0,
          order.couponCode,
          originalSubtotal
        );
      }
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalesAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalStats = await Order.aggregate([
      { $match: { status: 'Paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const categorySales = await Order.aggregate([
      { $match: { status: 'Paid' } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          totalSales: { $sum: '$orderItems.qty' },
          revenue: {
            $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] },
          },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json({
      totalRevenue: totalStats[0]?.totalRevenue || 0,
      totalOrders: totalStats[0]?.totalOrders || 0,
      categorySales,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTopProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: 'Paid' } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalQuantity: { $sum: '$orderItems.qty' },
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: '$productInfo._id',
          name: '$productInfo.name',
          images: '$productInfo.images',
          price: '$productInfo.price',
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);
    res.json(topProducts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await User.countDocuments({ role: 'user' });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUniqueOrderCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Order.distinct('user');
    res.json({ count: customers.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};