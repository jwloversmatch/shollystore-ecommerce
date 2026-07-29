import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {  AnimatePresence } from 'framer-motion';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../features/api/apiSlice';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Filter, X, ShoppingBag, CheckCircle, Clock, Phone, Eye, MapPin, CreditCard, Calendar, Package, Ticket, XCircle } from 'lucide-react';
import { StatsCardSkeleton, OrderRowSkeleton } from '../../components/Skeletons';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  _id: string; user: { email: string; name?: string; phone?: string }; name?: string; phone?: string;
  totalPrice: number; status: string; createdAt: string; paymentMethod?: string;
  orderItems: Array<{ name: string; qty: number; price: number }>;
  shippingAddress?: { address: string; city: string; postalCode?: string; country?: string };
  couponCode?: string; discount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAYMENT_METHOD_LABELS: Record<string, string> = { paystack: 'Paystack', bank_transfer: 'Bank Transfer', whatsapp: 'WhatsApp' };
const STATUS_COLORS: Record<string, string> = { Pending: 'bg-yellow-100 text-yellow-700', Paid: 'bg-green-100 text-green-700', Shipped: 'bg-blue-100 text-blue-700', Delivered: 'bg-gray-100 text-gray-700', Cancelled: 'bg-red-100 text-red-700' };
const STATUS_OPTIONS = ['All', 'Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];
const PAYMENT_OPTIONS = ['All', 'paystack', 'bank_transfer', 'whatsapp'];
const STATUS_FLOW: Record<string, string[]> = { Pending: ['Pending','Paid','Cancelled'], Paid: ['Paid','Shipped'], Shipped: ['Shipped','Delivered'], Delivered: ['Delivered'], Cancelled: ['Cancelled'] };
const ALL_STATUSES = ['Pending','Paid','Shipped','Delivered','Cancelled'];


const Orders = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1); const limit = 10;
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(''); const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { data, isLoading, refetch } = useGetAllOrdersQuery({ page, limit, status: statusFilter, paymentMethod: paymentFilter, search: searchTerm, startDate, endDate });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try { await updateStatus({ id: orderId, status: newStatus }).unwrap(); refetch(); }
    catch (error) { console.error('Failed to update status:', error); }
  };

  const handleClearFilters = () => { setStatusFilter('All'); setPaymentFilter('All'); setSearchTerm(''); setStartDate(''); setEndDate(''); setPage(1); };

  const orders = useMemo(() => data?.orders || [], [data?.orders]);
  const totalPages = data?.totalPages || 1;

  const stats = useMemo(() => {
    const total = orders.length;
    return { total, paid: orders.filter((o: OrderItem) => o.status === 'Paid').length, pending: orders.filter((o: OrderItem) => o.status === 'Pending').length, cancelled: orders.filter((o: OrderItem) => o.status === 'Cancelled').length };
  }, [orders]);

  if (isLoading) {
    return (
      <main id="main-content" className="p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}</div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100">{Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)}</div>
      </main>
    );
  }

  return (
    <main id="main-content" className="p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <header className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 rounded-xl hover:bg-gray-100 border border-gray-200 text-gray-600" aria-label="Back to admin dashboard"><ArrowLeft className="w-5 h-5" aria-hidden="true" /></button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">All Orders</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">View and manage every customer order</p>
          </div>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition text-sm font-medium" aria-expanded={showFilters} aria-controls="filters-panel">
          <Filter className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4" aria-label="Order statistics">
        {[
          { title: 'Total', value: stats.total, icon: <ShoppingBag className="w-5 h-5" aria-hidden="true" />, color: 'text-blue-600', bg: 'bg-blue-100' },
          { title: 'Paid', value: stats.paid, icon: <CheckCircle className="w-5 h-5" aria-hidden="true" />, color: 'text-green-600', bg: 'bg-green-100' },
          { title: 'Pending', value: stats.pending, icon: <Clock className="w-5 h-5" aria-hidden="true" />, color: 'text-yellow-600', bg: 'bg-yellow-100' },
          { title: 'Cancelled', value: stats.cancelled, icon: <XCircle className="w-5 h-5" aria-hidden="true" />, color: 'text-red-600', bg: 'bg-red-100' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{stat.title}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <div id="filters-panel" role="region" aria-label="Order filters" className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
              <div className="flex-1 min-w-[120px]">
                <label htmlFor="filter-status" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select id="filter-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm">
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label htmlFor="filter-payment" className="block text-xs font-medium text-gray-700 mb-1">Payment</label>
                <select id="filter-payment" value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm">
                  {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p === 'All' ? 'All' : PAYMENT_METHOD_LABELS[p]}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label htmlFor="filter-search" className="block text-xs font-medium text-gray-700 mb-1">Search Email</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" aria-hidden="true" />
                  <input id="filter-search" type="text" placeholder="Search email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-leaf-green text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <div>
                  <label htmlFor="filter-start-date" className="block text-xs font-medium text-gray-700 mb-1">From</label>
                  <input id="filter-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm" />
                </div>
                <div>
                  <label htmlFor="filter-end-date" className="block text-xs font-medium text-gray-700 mb-1">To</label>
                  <input id="filter-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm" />
                </div>
              </div>
              <button onClick={handleClearFilters} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm font-medium">Clear Filters</button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Orders Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Orders list">
            <caption className="sr-only">List of all customer orders with status and actions</caption>
            <thead className="bg-gray-50/50">
              <tr>
                {['Customer','Items','Total','Date','Payment','Discount','Status','Details'].map(h => (
                  <th key={h} scope="col" className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider ${h === 'Date' || h === 'Payment' ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order: OrderItem) => {
                const isLocked = order.status === 'Delivered' || order.status === 'Cancelled';
                return (
                  <tr key={order._id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                      <span className="font-medium text-gray-800">{order.user?.name || order.name || 'N/A'}</span>
                      <span className="block text-gray-600">{order.user?.email}</span>
                      {(order.user?.phone || order.phone) && (
                        <span className="text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" aria-hidden="true" />{order.user?.phone || order.phone}</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                      {order.orderItems?.length > 0 ? order.orderItems.map((item, idx) => <span key={idx}>{item.qty}x {item.name}{idx < order.orderItems.length - 1 ? ', ' : ''}</span>) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm text-gray-800">₦{order.totalPrice.toLocaleString()}</td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-3 text-xs sm:text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-3 text-xs sm:text-sm text-gray-600 capitalize">{PAYMENT_METHOD_LABELS[order.paymentMethod || ''] || '—'}</td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                      {order.couponCode ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium"><Ticket className="w-3 h-3" aria-hidden="true" />{order.couponCode} (-₦{order.discount?.toLocaleString() || 0})</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`status-${order._id}`} className="sr-only">Status for order {order._id.slice(-8)}</label>
                        <select id={`status-${order._id}`} value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} disabled={isLocked} className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border-0 focus:ring-2 focus:ring-leaf-green ${STATUS_COLORS[order.status]} cursor-pointer outline-none transition-all`} style={{ opacity: isLocked ? 0.5 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}>
                          {ALL_STATUSES.map(s => <option key={s} value={s} disabled={!STATUS_FLOW[order.status]?.includes(s)}>{s}</option>)}
                        </select>
                        {order.status === 'Pending' && (
                          <button onClick={() => handleStatusChange(order._id, 'Cancelled')} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap" aria-label={`Cancel order ${order._id.slice(-8)}`}>✕ Cancel</button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <button onClick={() => setSelectedOrder(order)} className="text-leaf-green hover:underline flex items-center gap-1 text-xs sm:text-sm font-medium" aria-label={`View details for order ${order._id.slice(-8)}`}><Eye className="w-4 h-4" aria-hidden="true" /> View</button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-4 sm:px-6 py-12 text-center text-gray-500 text-sm">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 border-t border-gray-100 gap-2" aria-label="Pagination">
            <span className="text-xs sm:text-sm text-gray-500" aria-live="polite">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 transition" aria-label="Previous page"><ChevronLeft className="w-4 h-4" aria-hidden="true" /></button>
              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 transition" aria-label="Next page"><ChevronRight className="w-4 h-4" aria-hidden="true" /></button>
            </div>
          </nav>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setSelectedOrder(null)} role="presentation" aria-hidden="true" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-white/40">
                <div className="sticky top-0 bg-white/90 backdrop-blur-md p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 id="order-detail-title" className="text-xl font-bold text-gray-800">Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-gray-100 transition" aria-label="Close order details"><X className="w-5 h-5 text-gray-600" aria-hidden="true" /></button>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[selectedOrder.status]}`}>{selectedOrder.status}</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" aria-hidden="true" />{new Date(selectedOrder.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    {selectedOrder.paymentMethod && <span className="text-sm text-gray-500 flex items-center gap-1"><CreditCard className="w-4 h-4" aria-hidden="true" />{PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}</span>}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4" aria-label="Customer information">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-medium text-gray-800">{selectedOrder.user?.name || selectedOrder.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.user?.email}</p>
                    {(selectedOrder.user?.phone || selectedOrder.phone) && <p className="text-sm text-gray-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5" aria-hidden="true" /> {selectedOrder.user?.phone || selectedOrder.phone}</p>}
                  </div>
                  {selectedOrder.couponCode && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100" aria-label="Discount information">
                      <p className="text-xs text-green-600 uppercase tracking-wider mb-1 font-semibold">Discount Applied</p>
                      <div className="flex items-center gap-2"><Ticket className="w-5 h-5 text-green-600" aria-hidden="true" /><span className="font-medium text-green-800">{selectedOrder.couponCode}</span><span className="text-green-700">(-₦{selectedOrder.discount?.toLocaleString() || 0})</span></div>
                    </div>
                  )}
                  {selectedOrder.shippingAddress && (
                    <div className="bg-gray-50 rounded-xl p-4" aria-label="Shipping address">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-800 flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}{selectedOrder.shippingAddress.postalCode ? `, ${selectedOrder.shippingAddress.postalCode}` : ''}{selectedOrder.shippingAddress.country ? `, ${selectedOrder.shippingAddress.country}` : ''}</p>
                    </div>
                  )}
                  <div aria-label="Order items">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-leaf-green" aria-hidden="true" />Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.orderItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-3"><span className="text-gray-700 font-medium">{item.name}</span><span className="text-gray-500">{item.qty} × ₦{item.price.toLocaleString()}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100" aria-label="Order total">
                    <span className="text-gray-800 font-semibold text-lg">Total</span>
                    <span className="text-2xl font-bold text-leaf-green">₦{selectedOrder.totalPrice.toLocaleString()}</span>
                  </div>
                  {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
                    <div className="flex items-center gap-3 pt-2">
                      <label htmlFor={`modal-status-${selectedOrder._id}`} className="text-sm text-gray-600">Update Status:</label>
                      <select id={`modal-status-${selectedOrder._id}`} value={selectedOrder.status} onChange={(e) => { handleStatusChange(selectedOrder._id, e.target.value); setSelectedOrder({ ...selectedOrder, status: e.target.value }); }} className={`px-3 py-1.5 rounded-full text-xs font-bold border-0 focus:ring-2 focus:ring-leaf-green ${STATUS_COLORS[selectedOrder.status]} cursor-pointer outline-none transition-all`}>
                        {ALL_STATUSES.filter(s => STATUS_FLOW[selectedOrder.status]?.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Orders;