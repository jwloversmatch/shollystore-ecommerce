import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../features/api/apiSlice';
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
} from 'lucide-react';

interface OrderItem {
  _id: string;
  user: { email: string };
  name?: string;         // customer name stored at order time
  phone?: string;        // customer phone stored at order time
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

const Orders = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Filter state
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-green"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-4 md:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-xl hover:bg-gray-100 border border-gray-200 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">All Orders</h1>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-xs sm:text-sm font-medium whitespace-nowrap"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-xl shrink-0">
            <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm text-gray-500">Total</p>
            <p className="text-base sm:text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-green-100 rounded-xl shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm text-gray-500">Paid</p>
            <p className="text-base sm:text-xl font-bold text-green-600">{stats.paid}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-yellow-100 rounded-xl shrink-0">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm text-gray-500">Pending</p>
            <p className="text-base sm:text-xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
            {/* Status filter */}
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-xs sm:text-sm"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Payment method filter */}
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Payment</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-xs sm:text-sm"
              >
                {PAYMENT_OPTIONS.map(p => (
                  <option key={p} value={p}>{p === 'All' ? 'All' : PAYMENT_METHOD_LABELS[p]}</option>
                ))}
              </select>
            </div>

            {/* Search by user email */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Search Email</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-leaf-green text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Date range */}
            <div className="flex gap-2 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Clear filters */}
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition flex items-center gap-1 text-xs sm:text-sm"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Orders Table – now displays customer name & phone */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider min-w-[160px]">Customer</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">Items</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="hidden sm:table-cell px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="hidden sm:table-cell px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">Address</th>
                <th className="px-3 sm:px-6 py-2 sm:py-4 text-[10px] sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order: OrderItem) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  className="transition-colors"
                >
                  <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                    {/* Show name if available, then email, then phone if present */}
                    <div className="flex flex-col">
                      {order.name && <span className="font-medium text-gray-800">{order.name}</span>}
                      <span className="text-gray-600">{order.user?.email}</span>
                      {order.phone && (
                        <span className="text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {order.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                    {order.orderItems && order.orderItems.length > 0 ? (
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
                  <td className="px-3 sm:px-6 py-2 sm:py-4 font-medium text-xs sm:text-sm text-gray-800">
                    ₦{order.totalPrice.toLocaleString()}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-xs font-medium text-gray-600 capitalize">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod || ''] || '—'}
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                    {order.shippingAddress ? (
                      <>
                        {order.shippingAddress.address}, {order.shippingAddress.city}
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-3 sm:px-6 py-2 sm:py-4 border-t border-gray-100 gap-2">
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
      </div>
    </motion.div>
  );
};

export default Orders;