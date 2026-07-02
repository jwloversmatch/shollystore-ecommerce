import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../../features/api/apiSlice';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  ShoppingBag,
  CheckCircle,
  Clock,
  Phone,
  Eye,
  MapPin,
  CreditCard,
  Calendar,
  Package,
} from 'lucide-react';

// ---------- Types (updated: user object includes phone) ----------
interface OrderItem {
  _id: string;
  user: { email: string; phone?: string };   // 👈 phone from populated user
  name?: string;                              // order snapshot name
  phone?: string;                             // order snapshot phone (fallback)
  totalPrice: number;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  orderItems: Array<{ name: string; qty: number; price: number }>;
  shippingAddress?: {
    address: string;
    city: string;
    postalCode?: string;
    country?: string;
  };
}

// ---------- Constants ----------
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paystack: 'Paystack',
  bank_transfer: 'Bank Transfer',
  whatsapp: 'WhatsApp',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-gray-100 text-gray-700',
};

const STATUS_OPTIONS = ['All', 'Pending', 'Paid', 'Shipped', 'Delivered'];
const PAYMENT_OPTIONS = ['All', 'paystack', 'bank_transfer', 'whatsapp'];

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
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

// ---------- Component ----------
const Orders = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, refetch } = useGetAllOrdersQuery({
    page,
    limit,
    status: statusFilter,
    paymentMethod: paymentFilter,
    search: searchTerm,
    startDate,
    endDate,
  });

  const [updateStatus] = useUpdateOrderStatusMutation();

  // Modal state for order details
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus({ id: orderId, status: newStatus }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('All');
    setPaymentFilter('All');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const orders = useMemo(() => data?.orders || [], [data?.orders]);
  const totalPages = data?.totalPages || 1;

  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((o: OrderItem) => o.status === 'Paid').length;
    const pending = orders.filter((o: OrderItem) => o.status === 'Pending').length;
    return { total, paid, pending };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-4 border-leaf-green/30 border-t-leaf-green"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6 md:space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemFadeUp} className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-xl hover:bg-gray-100 border border-gray-200 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">All Orders</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">View and manage every customer order</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition text-sm font-medium"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Total', value: stats.total, icon: <ShoppingBag className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
          { title: 'Paid', value: stats.paid, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
          { title: 'Pending', value: stats.pending, icon: <Clock className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemFadeUp}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{stat.title}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Payment</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                >
                  {PAYMENT_OPTIONS.map(p => (
                    <option key={p} value={p}>{p === 'All' ? 'All' : PAYMENT_METHOD_LABELS[p]}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">Search Email</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Table */}
      <motion.div variants={itemFadeUp} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order: OrderItem) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  className="transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                    <div className="flex flex-col">
                      {order.name && <span className="font-medium text-gray-800">{order.name}</span>}
                      <span className="text-gray-600">{order.user?.email}</span>
                      {/* Show current phone from populated user if available, else order snapshot */}
                      {(order.user?.phone || order.phone) && (
                        <span className="text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {order.user?.phone || order.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                    {order.orderItems?.length > 0 ? (
                      order.orderItems.map((item, idx) => (
                        <span key={idx}>
                          {item.qty}x {item.name}
                          {idx < order.orderItems.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm text-gray-800">
                    ₦{order.totalPrice.toLocaleString()}
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-3 text-xs sm:text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-3 text-xs sm:text-sm text-gray-600 capitalize">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod || ''] || '—'}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border-0 focus:ring-2 focus:ring-leaf-green ${STATUS_COLORS[order.status]} cursor-pointer outline-none transition-all`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-leaf-green hover:underline flex items-center gap-1 text-xs sm:text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 border-t border-gray-100 gap-2">
            <span className="text-xs sm:text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-white/40">
                <div className="sticky top-0 bg-white/90 backdrop-blur-md p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedOrder.createdAt).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {selectedOrder.paymentMethod && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}
                      </span>
                    )}
                  </div>

                  {/* Customer info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-medium text-gray-800">{selectedOrder.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.user?.email}</p>
                    {(selectedOrder.user?.phone || selectedOrder.phone) && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {selectedOrder.user?.phone || selectedOrder.phone}
                      </p>
                    )}
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-800 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                        {selectedOrder.shippingAddress.postalCode ? `, ${selectedOrder.shippingAddress.postalCode}` : ''}
                        {selectedOrder.shippingAddress.country ? `, ${selectedOrder.shippingAddress.country}` : ''}
                      </p>
                    </div>
                  )}

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-leaf-green" />
                      Items
                    </h3>
                    <div className="space-y-2">
                      {selectedOrder.orderItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-3">
                          <span className="text-gray-700 font-medium">{item.name}</span>
                          <span className="text-gray-500">{item.qty} × ₦{item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-gray-800 font-semibold text-lg">Total</span>
                    <span className="text-2xl font-bold text-leaf-green">
                      ₦{selectedOrder.totalPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Quick status update inside modal */}
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-sm text-gray-600">Update Status:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        handleStatusChange(selectedOrder._id, e.target.value);
                        // update the selectedOrder locally for immediate feedback
                        setSelectedOrder({
                          ...selectedOrder,
                          status: e.target.value,
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 focus:ring-2 focus:ring-leaf-green ${STATUS_COLORS[selectedOrder.status]} cursor-pointer outline-none transition-all`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Orders;