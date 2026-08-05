import { useState, useMemo, useRef } from "react";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "../../../features/api/apiSlice";
import { ArrowLeft, Filter, Download } from "lucide-react";
import { StatsCardSkeleton, OrderRowSkeleton } from "../../../components/Skeletons";
import { useTheme } from "../../../context/ThemeContext";
import OrderStats from "./OrderStats";
import OrderFilters from "./OrderFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailModal from "./OrderDetailModal";

export interface OrderItem {
  _id: string;
  user: { email: string; name?: string; phone?: string };
  name?: string; phone?: string;
  totalPrice: number; status: string; createdAt: string; paymentMethod?: string;
  orderItems: Array<{ name: string; qty: number; price: number }>;
  shippingAddress?: { address: string; city: string; postalCode?: string; country?: string };
  couponCode?: string; discount?: number;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [page, setPage] = useState(1);
  const limit = 10;
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { data, isLoading, refetch } = useGetAllOrdersQuery({ page, limit, status: statusFilter, paymentMethod: paymentFilter, search: searchTerm, startDate, endDate });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const orderModalRef = useRef<HTMLDivElement>(null);

  const bg = isDark ? "#0A0A0B" : "#FCFAF5";
  const cardBg = isDark ? "#141414" : "rgba(255,255,255,0.8)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#1f2937";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#fff";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try { await updateStatus({ id: orderId, status: newStatus }).unwrap(); refetch(); }
    catch (error) { console.error("Failed to update status:", error); }
  };

  const handleClearFilters = () => { setStatusFilter("All"); setPaymentFilter("All"); setSearchTerm(""); setStartDate(""); setEndDate(""); setPage(1); };

  const orders = useMemo(() => data?.orders || [], [data?.orders]);
  const totalPages = data?.totalPages || 1;

  // CSV Export with auth token
  const handleExportCSV = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const url = `${import.meta.env.VITE_API_URL}/admin/orders/export?status=${statusFilter}&paymentMethod=${paymentFilter}&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("CSV export failed:", err);
    }
  };

  useFocusTrap(orderModalRef, !!selectedOrder, () => setSelectedOrder(null));

  if (isLoading) {
    return (
      <main id="main-content" tabIndex={-1} className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 focus:outline-none" style={{ background: bg, paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} dark={isDark} />)}</div>
        <div className="rounded-2xl border" style={{ background: cardBg, borderColor: cardBorder }}>{Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} dark={isDark} />)}</div>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8 focus:outline-none" style={{ background: bg, paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))' }}>
      {/* Header */}
      <header className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin")} className="p-2 rounded-xl border transition-colors" style={{ background: inputBg, borderColor: inputBorder, color: textSecondary }} aria-label="Back to admin dashboard"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: textPrimary }}>All Orders</h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: textMuted }}>View and manage every customer order</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border transition text-sm font-medium"
            style={{ background: inputBg, borderColor: inputBorder, color: "#10b981" }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border transition text-sm font-medium" style={{ background: inputBg, borderColor: inputBorder, color: textSecondary }} aria-expanded={showFilters} aria-controls="filters-panel">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <OrderStats orders={orders} isDark={isDark} />

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <OrderFilters
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            onClear={handleClearFilters}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Orders Table */}
      <OrdersTable
        orders={orders}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onStatusChange={handleStatusChange}
        onViewOrder={setSelectedOrder}
        isDark={isDark}
      />

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
            modalRef={orderModalRef}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default OrdersPage;