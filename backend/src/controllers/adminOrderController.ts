import { Request, Response } from "express";
import mongoose from "mongoose";
import { Order, IOrder } from "../models/Order";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Coupon } from "../models/Coupon";
import {
  sendAdminOrderNotification,
  sendOrderStatusUpdateEmail,
} from "../services/email.service";

// Helper to reduce stock (handles variants)
const reduceStockForOrder = async (order: IOrder) => {
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (
      item.variant &&
      (item.variant.sku || item.variant.color || item.variant.size)
    ) {
      const variant = product.variants?.find(
        (v) =>
          v.sku === item.variant?.sku ||
          (v.color === item.variant?.color && v.size === item.variant?.size),
      );
      if (variant) {
        if (variant.stock !== undefined) {
          variant.stock = Math.max(0, variant.stock - item.qty);
        }
        product.stock = Math.max(0, product.stock - item.qty);
        await product.save();
        await product.checkLowStockAndNotify(); // ✅ low stock check
      }
    } else {
      product.stock = Math.max(0, product.stock - item.qty);
      await product.save();
      await product.checkLowStockAndNotify(); // ✅ low stock check
    }
  }
};

// ─── Formatting helpers for CSV export ───────────────────────────────────────
const formatAmount = (value: number): string => {
  return Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatPaymentMethod = (method?: string): string => {
  if (!method) return "N/A";

  const map: Record<string, string> = {
    bank_transfer: "Bank Transfer",
    paystack: "Paystack",
    card: "Card",
    cash_on_delivery: "Cash on Delivery",
    ussd: "USSD",
  };

  return (
    map[method] ||
    method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
};
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get admin dashboard stats
// @route   GET /api/admin/orders
export const getAdminStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const recentOrders = await Order.find()
      .populate("user", "email name phone")
      .sort({ createdAt: -1 })
      .limit(5);

    // Exclude both Pending AND Cancelled from revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $nin: ["Pending", "Cancelled"] } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
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

export const getAllOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status;
    }
    if (req.query.paymentMethod && req.query.paymentMethod !== "All") {
      filter.paymentMethod = req.query.paymentMethod;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, "i");
      const users = await User.find({ email: searchRegex }).select("_id");
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
        .populate("user", "email name phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalPrice,
      0,
    );

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

export const updateOrderStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = (await Order.findById(id).populate(
      "user",
      "email name phone",
    )) as IOrder | null;
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Reduce stock only if moving from Pending to a non-Cancelled status
    if (
      order.status === "Pending" &&
      status !== "Pending" &&
      status !== "Cancelled"
    ) {
      await reduceStockForOrder(order);
    }

    await Order.updateOne({ _id: order._id }, { $set: { status } });

    if (status === "Paid" && order.status !== "Paid" && order.couponCode) {
      await Coupon.updateOne(
        { code: order.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } },
      );
    }

    order.status = status;

    sendAdminOrderNotification(order, "updated", status).catch((err) =>
      console.error("Failed to send admin order notification:", err),
    );

    if (["Shipped", "Delivered"].includes(status)) {
      const populatedUser = order.user as unknown as {
        email?: string;
        name?: string;
        phone?: string;
      } | null;
      if (populatedUser?.email) {
        const originalSubtotal = order.orderItems.reduce(
          (sum, item) => sum + item.price * item.qty,
          0,
        );
        sendOrderStatusUpdateEmail(
          populatedUser.email,
          (order._id as mongoose.Types.ObjectId).toString(),
          status,
          order.totalPrice,
          populatedUser.name,
          order.discount || 0,
          order.couponCode,
          originalSubtotal,
        ).catch((err) =>
          console.error("Failed to send order status update email:", err),
        );
      }
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalesAnalytics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const totalStats = await Order.aggregate([
      { $match: { status: "Paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const categorySales = await Order.aggregate([
      { $match: { status: "Paid" } },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          totalSales: { $sum: "$orderItems.qty" },
          revenue: {
            $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] },
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

export const getTopProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const topProducts = await Order.aggregate([
      // Include all sales that are not pending or cancelled
      { $match: { status: { $nin: ["Pending", "Cancelled"] } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          totalQuantity: { $sum: "$orderItems.qty" },
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: "$productInfo._id",
          name: "$productInfo.name",
          images: "$productInfo.images",
          price: "$productInfo.price",
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

export const getCustomerCount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const count = await User.countDocuments({ role: "user" });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUniqueOrderCustomers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const customers = await Order.distinct("user");
    res.json({ count: customers.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Revenue Trend (new) ──────────────────────────────────────────────────────
// @desc    Get daily revenue trend for chart
// @route   GET /api/admin/orders/analytics/revenue-trend?days=30
export const getRevenueTrend = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: ["Paid", "Shipped", "Delivered"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with zero values
    const result: { date: string; revenue: number; orders: number }[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const revenueMap = new Map(revenueData.map((d) => [d._id, d]));

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const data = revenueMap.get(dateStr);
      result.push({
        date: dateStr,
        revenue: data?.revenue || 0,
        orders: data?.orders || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Export Orders CSV (new) ──────────────────────────────────────────────────
// @desc    Export filtered orders as CSV
// @route   GET /api/admin/orders/export
export const exportOrdersCSV = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status;
    }
    if (req.query.paymentMethod && req.query.paymentMethod !== "All") {
      filter.paymentMethod = req.query.paymentMethod;
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, "i");
      const users = await User.find({ email: searchRegex }).select("_id");
      const userIds = users.map((u) => u._id);
      filter.user = { $in: userIds };
    }
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        (filter.createdAt as Record<string, unknown>).$gte = new Date(
          req.query.startDate as string,
        );
      }
      if (req.query.endDate) {
        (filter.createdAt as Record<string, unknown>).$lte = new Date(
          req.query.endDate as string,
        );
      }
    }

    const orders = await Order.find(filter)
      .populate("user", "email name phone")
      .sort({ createdAt: -1 })
      .lean();

    // CSV headers
    const headers = [
      "Order ID",
      "Customer Name",
      "Email",
      "Phone",
      "Total (₦)",
      "Status",
      "Payment Method",
      "Date",
      "Items",
      "Shipping Address",
      "Coupon",
      "Discount (₦)",
    ].join(",");

    // CSV rows
    const rows = orders
      .map((order: any) => {
        const items = order.orderItems
          .map((i: any) => `${i.qty}x ${i.name}`)
          .join("; ");
        const shipping = order.shippingAddress
          ? `${order.shippingAddress.address}, ${order.shippingAddress.city}`
          : "N/A";
        return [
          order._id.toString(),
          `"${order.user?.name || "N/A"}"`,
          `"${order.user?.email || "N/A"}"`,
          `"${order.user?.phone || "N/A"}"`,
          `"${formatAmount(order.totalPrice)}"`,
          `"${order.status}"`,                  
          `"${formatPaymentMethod(order.paymentMethod)}"`, 
          `"${new Date(order.createdAt).toLocaleDateString("en-NG")}"`,
          `"${items}"`,
          `"${shipping}"`,
          `"${order.couponCode || "N/A"}"`,
          `"${formatAmount(order.discount || 0)}"`, 
        ].join(",");
      })
      .join("\n");

    const csv = `${headers}\n${rows}`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=orders-export-${new Date().toISOString().split("T")[0]}.csv`,
    );
    // Add BOM for Excel UTF-8 support
    res.send("\ufeff" + csv);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};