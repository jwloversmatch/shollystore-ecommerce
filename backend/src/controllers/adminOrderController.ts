import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';
import {
  sendAdminOrderNotification,
  sendOrderStatusUpdateEmail,
} from '../services/email.service';

// Helper to reduce stock when order transitions from Pending
const reduceStockForOrder = async (order: any) => {
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      const newStock = Math.max(0, product.stock - item.qty);
      await Product.findByIdAndUpdate(item.product, { stock: newStock });
    }
  }
};

// @desc    Get admin dashboard stats (recent orders + revenue excluding Pending)
// @route   GET /api/admin/orders
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Populate user email and name for the dashboard
    const recentOrders = await Order.find()
      .populate('user', 'email name')
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
        .populate('user', 'email name') // now includes name
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

    const order = await Order.findById(id).populate('user', 'email name');
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.status === 'Pending' && status !== 'Pending') {
      await reduceStockForOrder(order);
    }

    order.status = status;
    await order.save();

    await sendAdminOrderNotification(order, 'updated', status);

    // Notify user (if email exists)
    if (['Shipped', 'Delivered'].includes(status)) {
      // Safely cast user to populated shape
      const populatedUser = order.user as unknown as { email?: string; name?: string } | null;
      if (populatedUser?.email) {
        await sendOrderStatusUpdateEmail(
          populatedUser.email,
          order._id.toString(),
          status,
          order.totalPrice,
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