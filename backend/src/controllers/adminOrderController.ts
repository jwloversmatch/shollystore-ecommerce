import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User'; 

export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    // Filter by status
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }

    // Filter by payment method
    if (req.query.paymentMethod && req.query.paymentMethod !== 'All') {
      filter.paymentMethod = req.query.paymentMethod;
    }

    // Search by user email (case-insensitive)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      // We'll populate user and then filter; but we need to use $lookup or a separate query.
      // Simpler: find users with matching email, then filter orders by userId.
      const users = await User.find({ email: searchRegex }).select('_id');
      const userIds = users.map(u => u._id);
      filter.user = { $in: userIds };
    }

    // Date range filter
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
        .populate('user', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    // Calculate summary stats for the filtered set (optional)
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
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    order.status = status;
    await order.save();
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Add this function to your existing adminOrderController.ts
export const getSalesAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get Total Stats
    const totalStats = await Order.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, totalOrders: { $sum: 1 } } }
    ]);

    // 2. Get Sales by Category (using '$lookup' to join Order items to Products)
    const categorySales = await Order.aggregate([
      { $match: { status: 'Paid' } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          totalSales: { $sum: '$orderItems.qty' },
          revenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      totalRevenue: totalStats[0]?.totalRevenue || 0,
      totalOrders: totalStats[0]?.totalOrders || 0,
      categorySales
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top 10 selling products by quantity sold
// @route   GET /api/admin/analytics/top-products
export const getTopProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: 'Paid' } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalQuantity: { $sum: '$orderItems.qty' },
          totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: '$productInfo._id',
          name: '$productInfo.name',
          images: '$productInfo.images',
          price: '$productInfo.price',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);
    res.json(topProducts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total unique customer count
// @route   GET /api/admin/analytics/customers
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