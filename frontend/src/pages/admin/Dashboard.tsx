import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useGetAdminStatsQuery,
  useUpdateOrderStatusMutation,
  useGetProductsQuery,
  useDeleteProductMutation,
  useGetSalesAnalyticsQuery,
  useGetTopProductsQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateStockMutation,
  useGetOrderCustomerCountQuery,
} from "../../features/api/apiSlice";
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Package,
  Users,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  Shield,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ConfirmationModal from "../../components/ConfirmationModal";

// ---------- Interfaces ----------
interface OrderItem {
  _id: string;
  user: { email: string };
  totalPrice: number;
  status: string;
  createdAt?: string;
  paymentMethod?: string;
}

interface ProductItem {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  category?: string;
  stock: number;
}

interface CategorySale {
  _id: string;
  totalSales: number;
  revenue: number;
}

interface TopProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  totalQuantity: number;
  totalRevenue: number;
}

interface UserData {
  _id: string;
  email: string;
  role: "user" | "admin";
}

// ---------- Animation Variants ----------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
};

// ---------- Constants ----------
const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Paid: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Delivered: "bg-gray-100 text-gray-700",
};

const STATUS_BG: Record<string, string> = {
  Pending: "#fbbf24",
  Paid: "#34d399",
  Shipped: "#60a5fa",
  Delivered: "#9ca3af",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paystack: "Paystack",
  bank_transfer: "Bank Transfer",
  whatsapp: "WhatsApp",
};

// ---------- Dashboard Component ----------
const Dashboard = () => {
  const navigate = useNavigate();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetAdminStatsQuery({});
  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useGetProductsQuery({});
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useGetSalesAnalyticsQuery({});
  const { data: topProductsData, refetch: refetchTopProducts } =
    useGetTopProductsQuery({});
  const { data: orderCustomerData } = useGetOrderCustomerCountQuery({});
  const realTotalCustomers = orderCustomerData?.count || 0;

  const [updateStatus] = useUpdateOrderStatusMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [updateStock] = useUpdateStockMutation();

  // Normalize data
  const stats = statsData || { orders: [], totalRevenue: 0 };
  const products = useMemo<ProductItem[]>(() => productsData || [], [productsData]);
  const analytics = analyticsData || { totalRevenue: 0, totalOrders: 0, categorySales: [] };
  const realTopProducts: TopProduct[] = topProductsData || [];
  const { data: usersData, refetch: refetchUsers } = useGetUsersQuery({});
  const users: UserData[] = usersData || [];

  const lowStockCount = useMemo(() => products.filter((p) => p.stock < 5).length, [products]);

  const statusDistribution = stats.orders?.reduce(
    (acc: Record<string, number>, order: OrderItem) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const statusPieData = useMemo(
    () =>
      Object.entries(statusDistribution || {}).map(([key, value]) => ({
        name: key,
        value,
      })),
    [statusDistribution]
  );

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => b._id.localeCompare(a._id));
  }, [products]);

  // Handlers
  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    await deleteProduct(productToDelete);
    refetchProducts();
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap();
      refetchStats();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleStockUpdate = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await updateStock({ id, stock: newStock }).unwrap();
      refetchProducts();
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: "user" | "admin") => {
    try {
      await updateUserRole({ id: userId, role: newRole }).unwrap();
      refetchUsers();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchProducts();
    refetchAnalytics();
    refetchTopProducts();
    refetchUsers();
  };

  // Loading state – smooth spinner
  if (statsLoading || productsLoading || analyticsLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[80vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-16 w-16 rounded-full border-4 border-leaf-green/30 border-t-leaf-green"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-6 pt-16 md:pt-24 max-w-7xl mx-auto space-y-6 md:space-y-8"
    >
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Header with subtle gradient */}
      <motion.div variants={itemFadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Command Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store, track sales, oversee orders & users.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all text-sm font-medium text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 bg-leaf-green text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition-all text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Product
          </motion.button>
        </div>
      </motion.div>

      {/* Stat Cards – premium glass morphism with staggered entrance */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            title: "Total Revenue",
            value: `₦${stats.totalRevenue.toLocaleString()}`,
            icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
            color: "text-leaf-green",
            bg: "bg-leaf-green/10",
            border: "border-leaf-green/20",
          },
          {
            title: "Total Orders",
            value: stats.orders?.length || 0,
            icon: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
            color: "text-blue-600",
            bg: "bg-blue-100",
            border: "border-blue-200",
          },
          {
            title: "Ordering Customers",
            value: realTotalCustomers,
            icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
            color: "text-purple-600",
            bg: "bg-purple-100",
            border: "border-purple-200",
          },
          {
            title: "Low Stock Alerts",
            value: lowStockCount,
            icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />,
            color: "text-red-600",
            bg: "bg-red-100",
            border: "border-red-200",
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemFadeUp}
            className={`relative bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border ${stat.border} p-4 sm:p-6 transition-all duration-300 flex items-center justify-between overflow-hidden`}
          >
            <div>
              <p className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-gray-500">
                {stat.title}
              </p>
              <p className={`text-lg sm:text-2xl font-bold mt-1 sm:mt-2 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
            <div className={`${stat.bg} p-2.5 sm:p-3 rounded-xl backdrop-blur-sm`}>
              {stat.icon}
            </div>
            <div className={`absolute -top-10 -right-10 w-24 h-24 ${stat.bg} blur-2xl opacity-40`} />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts + Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Sales Bar Chart */}
        <motion.div
          variants={itemFadeUp}
          className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blob-orange" />
              Sales by Category
            </h2>
          </div>
          {analytics.categorySales.length === 0 ? (
            <p className="text-gray-400 text-center py-12 text-sm">No paid orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.categorySales} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `₦${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as CategorySale;
                      return (
                        <div className="bg-white/90 backdrop-blur-md rounded-lg p-3 shadow-lg border border-gray-100">
                          <p className="text-sm font-medium text-gray-800">{data._id}</p>
                          <p className="text-sm text-leaf-green font-semibold">₦{data.revenue.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#4a8f29" radius={[8, 8, 0, 0]} barSize={30}>
                  {analytics.categorySales.map((_: CategorySale, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? "#ffa687" : index === 1 ? "#4a8f29" : "#60a5fa"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Order Status Pie Chart */}
        <motion.div
          variants={itemFadeUp}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-leaf-green" />
              Order Status
            </h2>
          </div>
          {statusPieData.length === 0 ? (
            <p className="text-gray-400 text-center py-12 text-sm">No orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_BG[entry.name] || "#9ca3af"} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  formatter={(value: string) => (
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{value}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Quick Inventory + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Inventory */}
        <motion.div variants={itemFadeUp} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-leaf-green" />
              Quick Inventory
            </h2>
            <button
              onClick={() => navigate("/admin/products")}
              className="text-xs sm:text-sm font-medium text-leaf-green hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {sortedProducts.slice(0, 5).map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-leaf-green/50 transition group">
                <div className="flex items-center gap-3">
                  <img
                    src={p.images?.[0] || "https://via.placeholder.com/40"}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/40"; }}
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-800">{p.name}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-pastel-green text-leaf-green rounded-full font-bold uppercase tracking-wider">
                      {p.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                    <button
                      onClick={() => handleStockUpdate(p._id, p.stock, -1)}
                      className="p-1.5 hover:bg-red-50 text-red-500 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-sm font-semibold text-gray-700 min-w-[20px] text-center">{p.stock}</span>
                    <button
                      onClick={() => handleStockUpdate(p._id, p.stock, 1)}
                      className="p-1.5 hover:bg-leaf-green/10 text-leaf-green transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {p.stock < 5 && (
                    <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">Low</span>
                  )}
                  <button
                    onClick={() => handleDeleteClick(p._id)}
                    className="text-gray-400 hover:text-red-500 transition ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div variants={itemFadeUp} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blob-orange" />
              Top Selling
            </h2>
            <span className="text-[10px] sm:text-xs text-gray-400">Based on real orders</span>
          </div>
          {realTopProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-12 text-sm">No sales data yet.</p>
          ) : (
            <div className="space-y-2.5">
              {realTopProducts.slice(0, 5).map((p, idx) => (
                <div key={p._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-leaf-green/10 flex items-center justify-center text-xs font-bold text-leaf-green">
                      {idx + 1}
                    </div>
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/40"}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                      onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/40"; }}
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-800">{p.name}</p>
                      <p className="text-[10px] text-gray-500">Qty: {p.totalQuantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">₦{p.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div variants={itemFadeUp} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm sm:text-xl font-semibold text-gray-800">Recent Orders</h2>
          <button
            onClick={() => navigate("/admin/orders")}
            className="text-xs sm:text-sm font-medium text-leaf-green hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.orders?.slice(0, 5).map((order: OrderItem) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  className="transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">{order.user?.email}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-800">
                    ₦{order.totalPrice.toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm text-gray-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-medium text-gray-600 capitalize">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod || ""] || "—"}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold border-0 focus:ring-2 focus:ring-leaf-green ${STATUS_COLORS[order.status]} cursor-pointer outline-none transition-all`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* User Management Section */}
      <motion.div variants={itemFadeUp} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-sm sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            User Management
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.slice(0, 10).map((u) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  className="transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">{u.email}</td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                        u.role === "admin" ? "bg-leaf-green/20 text-leaf-green" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleUpdate(u._id, e.target.value as "user" | "admin")}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-200 text-[10px] sm:text-sm font-medium outline-none focus:ring-2 focus:ring-leaf-green bg-white cursor-pointer transition-all"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;