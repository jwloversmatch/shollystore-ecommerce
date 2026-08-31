import { useState, useMemo } from "react";
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
  useGetRevenueTrendQuery,
} from "../../../features/api/apiSlice";
import {
  TrendingUp, ShoppingBag, AlertTriangle, Users,
  RefreshCw, PlusCircle, Flame,
} from "lucide-react";
import ConfirmationModal from "../../../components/ConfirmationModal";
import SEO from "../../../components/SEO";
import {
  StatsCardSkeleton, ChartSkeleton, OrderRowSkeleton,
  TableRowSkeleton, DarkCardSkeleton,
} from "../../../components/Skeletons";
import { useTheme } from "../../../context/ThemeContext";
import type { ProductItem } from "../../../types/home";
import DashboardCharts from "./DashboardCharts";
import QuickInventory from "./QuickInventory";
import TopProductsList from "./TopProductsList";
import RecentOrdersTable from "./RecentOrdersTable";
import UserManagementTable from "./UserManagementTable";

const ACCENT = "#e8622a";

export interface OrderItem {
  _id: string;
  user: { email: string };
  totalPrice: number;
  status: string;
  createdAt?: string;
  paymentMethod?: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetAdminStatsQuery({});
  const { data: productsResponse, isLoading: productsLoading, refetch: refetchProducts } = useGetProductsQuery({ limit: 9999 });
  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = useGetSalesAnalyticsQuery({});
  const { data: topProductsData, refetch: refetchTopProducts } = useGetTopProductsQuery({});
  const { data: orderCustomerData } = useGetOrderCustomerCountQuery({});
  const { data: usersData, refetch: refetchUsers } = useGetUsersQuery({});
  const { data: revenueTrendData } = useGetRevenueTrendQuery(30);

  const [updateStatus] = useUpdateOrderStatusMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [updateStock] = useUpdateStockMutation();

  const stats = statsData || { orders: [], totalRevenue: 0 };
  const products = useMemo<ProductItem[]>(() => {
    const data = productsResponse as { products?: ProductItem[] } | undefined;
    return data?.products ?? [];
  }, [productsResponse]);
  const analytics = analyticsData || { totalRevenue: 0, totalOrders: 0, categorySales: [] };
  const topProducts = topProductsData || [];
  const users = usersData || [];
  const revenueTrend = revenueTrendData?.data || [];

  const lowStockCount = useMemo(() => products.filter(p => (p.stock ?? 0) < 5).length, [products]);
  const realCustomers = orderCustomerData?.count || 0;

  const statusPieData = useMemo(() => {
    const dist: Record<string, number> = {};
    (stats.orders || []).forEach((o: OrderItem) => { dist[o.status] = (dist[o.status] || 0) + 1; });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [stats.orders]);

  const sortedProducts = useMemo(() => [...products].sort((a, b) => b._id.localeCompare(a._id)), [products]);

  const handleDeleteClick = (id: string) => { setProductToDelete(id); setDeleteModalOpen(true); };
  const confirmDelete = async () => { if (!productToDelete) return; await deleteProduct(productToDelete); refetchProducts(); setDeleteModalOpen(false); setProductToDelete(null); };
  const handleStatusChange = async (id: string, status: string) => { try { await updateStatus({ id, status }).unwrap(); refetchStats(); } catch (err) { console.error("Status update failed", err); } };
  const handleStockUpdate = async (id: string, cur: number, delta: number) => { try { await updateStock({ id, stock: Math.max(0, cur + delta) }).unwrap(); refetchProducts(); } catch (err) { console.error("Stock update failed", err); } };
  const handleRoleUpdate = async (id: string, role: "user" | "admin") => { try { await updateUserRole({ id, role }).unwrap(); refetchUsers(); } catch (err) { console.error("Role update failed", err); } };
  const handleRefresh = () => { refetchStats(); refetchProducts(); refetchAnalytics(); refetchTopProducts(); refetchUsers(); };

  const bg = isDark ? "#0A0A0B" : "#FCFAF5";
  const cardBg = isDark ? "#141414" : "#fff";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  if (statsLoading || productsLoading || analyticsLoading) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-5 md:space-y-6 pb-28 md:pb-10 focus:outline-none pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-[calc(80px+env(safe-area-inset-top,0px))] lg:pt-[calc(88px+env(safe-area-inset-top,0px))]"
        style={{ background: bg }}
      >
        <SEO title="Admin Dashboard" description="Manage your store." />
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-5 md:space-y-6 pb-28 md:pb-10 focus:outline-none pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-[calc(80px+env(safe-area-inset-top,0px))] lg:pt-[calc(88px+env(safe-area-inset-top,0px))]"
      style={{ background: bg }}
    >
      <SEO title="Admin Dashboard" description="Manage your store, track sales, oversee orders & users." />
      <ConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title="Delete Product" message="Are you sure? This action cannot be undone." confirmText="Delete" cancelText="Cancel" type="danger" />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18` }}><Flame className="w-4 h-4" style={{ color: ACCENT }} aria-hidden="true" /></div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Admin</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: textPrimary }}>Command Center</h1>
          <p className="text-sm mt-0.5" style={{ color: textMuted }}>Real-time overview of your store.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textSecondary }} aria-label="Refresh dashboard data"><RefreshCw className="w-4 h-4" aria-hidden="true" /> Refresh</button>
          <button onClick={() => navigate("/admin/products")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }} aria-label="Add new product"><PlusCircle className="w-4 h-4" aria-hidden="true" /> Add Product</button>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="group" aria-label="Store statistics">
        {[
          { label: "Total Revenue", value: `₦${stats.totalRevenue.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: "#e8622a", bg: "rgba(232,98,42,0.12)" },
          { label: "Recent Orders", value: stats.orders?.length || 0, icon: <ShoppingBag className="w-5 h-5" />, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
          { label: "Customers", value: realCustomers, icon: <Users className="w-5 h-5" />, color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
          { label: "Low Stock Alerts", value: lowStockCount, icon: <AlertTriangle className="w-5 h-5" />, color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
        ].map((s, i) => (
          <div key={i} className="relative rounded-2xl p-4 md:p-5 overflow-hidden" style={{ background: cardBg, border: `1px solid ${s.color}22`, boxShadow: cardShadow }}>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl pointer-events-none" style={{ background: s.color, opacity: 0.18 }} aria-hidden="true" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2" style={{ color: textMuted }}>{s.label}</p>
                <p className="text-xl md:text-3xl font-black leading-none" style={{ color: textPrimary }}>{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts analytics={analytics} statusPieData={statusPieData} revenueTrend={revenueTrend} isDark={isDark} />

      {/* Quick Inventory + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <QuickInventory products={sortedProducts.slice(0, 6)} onStockUpdate={handleStockUpdate} onDelete={handleDeleteClick} onViewAll={() => navigate("/admin/products")} isDark={isDark} />
        <TopProductsList products={topProducts.slice(0, 5)} isDark={isDark} />
      </div>

      {/* Recent Orders */}
      <RecentOrdersTable orders={(stats.orders || []).slice(0, 5)} onStatusChange={handleStatusChange} onViewAll={() => navigate("/admin/orders")} isDark={isDark} />

      {/* User Management */}
      <UserManagementTable users={users.slice(0, 10)} onRoleUpdate={handleRoleUpdate} isDark={isDark} />
    </main>
  );
};

const DashboardSkeleton = () => (
  <>
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-2">
        <div className="h-5 w-32 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
        <div className="h-8 w-48 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-24 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
        <div className="h-10 w-32 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
      </div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} dark />)}</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2"><DarkCardSkeleton><div className="p-5"><div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" /><ChartSkeleton height={230} /></div></DarkCardSkeleton></div>
      <div><DarkCardSkeleton><div className="p-5"><div className="h-6 w-32 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" /><ChartSkeleton height={200} /></div></DarkCardSkeleton></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <DarkCardSkeleton><div className="p-5"><div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />{Array.from({ length: 4 }).map((_, i) => <OrderRowSkeleton key={i} dark />)}</div></DarkCardSkeleton>
      <DarkCardSkeleton><div className="p-5"><div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={3} dark />)}</div></DarkCardSkeleton>
    </div>
    <DarkCardSkeleton><div className="p-5"><div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />{Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} dark />)}</div></DarkCardSkeleton>
    <DarkCardSkeleton><div className="p-5"><div className="h-6 w-48 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />{Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} cols={3} dark />)}</div></DarkCardSkeleton>
  </>
);

export default DashboardPage;