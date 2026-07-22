import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useGetAdminStatsQuery, useUpdateOrderStatusMutation, useGetProductsQuery,
  useDeleteProductMutation, useGetSalesAnalyticsQuery, useGetTopProductsQuery,
  useGetUsersQuery, useUpdateUserRoleMutation, useUpdateStockMutation,
  useGetOrderCustomerCountQuery,
} from "../../features/api/apiSlice";
import {
  TrendingUp, ShoppingBag, AlertTriangle, Package, Users, RefreshCw,
  PlusCircle, ArrowRight, BarChart3, PieChart, Shield, Minus, Plus, Trash2, Flame,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend,
} from "recharts";
import ConfirmationModal from "../../components/ConfirmationModal";
import SEO from "../../components/SEO";
import {
  StatsCardSkeleton,
  ChartSkeleton,
  OrderRowSkeleton,
  TableRowSkeleton,
  DarkCardSkeleton,
} from "../../components/Skeletons";
// ✅ Import the shared ProductItem type
import type { ProductItem } from "../../types/home";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";

const STATUS_DARK: Record<string, { bg: string; text: string; border: string }> = {
  Pending:   { bg:"rgba(251,191,36,0.10)",  text:"#fbbf24", border:"rgba(251,191,36,0.3)"  },
  Paid:      { bg:"rgba(52,211,153,0.10)",  text:"#34d399", border:"rgba(52,211,153,0.3)"  },
  Shipped:   { bg:"rgba(96,165,250,0.10)",  text:"#60a5fa", border:"rgba(96,165,250,0.3)"  },
  Delivered: { bg:"rgba(156,163,175,0.10)", text:"#9ca3af", border:"rgba(156,163,175,0.25)"},
};
const STATUS_PIE: Record<string, string> = {
  Pending:"#fbbf24", Paid:"#34d399", Shipped:"#60a5fa", Delivered:"#6b7280",
};
const CHART_COLORS = ["#e8622a","#10b981","#3b82f6","#f59e0b","#8b5cf6","#ec4899"];
const PAYMENT_LABELS: Record<string, string> = {
  paystack:"Paystack", bank_transfer:"Bank Transfer", whatsapp:"WhatsApp",
};

// ─── Interfaces ────────────────────────────────────────────────────────────────
interface OrderItem  { _id:string; user:{email:string}; totalPrice:number; status:string; createdAt?:string; paymentMethod?:string; }
// ❌ Local ProductItem removed – using imported type
interface CategorySale{ _id:string; totalSales:number; revenue:number; }
interface TopProduct { _id:string; name:string; images:string[]; price:number; totalQuantity:number; totalRevenue:number; }
interface UserData   { _id:string; email:string; role:"user"|"admin"; }

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; dataKey?: string }>;
  label?: string;
}

// ─── Helper to safely get category name ───────────────────────────────────────
const getCategoryName = (cat: ProductItem['category']): string => {
  if (!cat) return 'Uncategorized';
  return typeof cat === 'string' ? cat : cat.name;
};

// ─── Animation variants ────────────────────────────────────────────────────────
const stagger  = { hidden:{}, visible:{ transition:{ staggerChildren:0.08, delayChildren:0.05 } } };
const fadeUp   = { hidden:{opacity:0,y:20}, visible:{ opacity:1, y:0, transition:{ type:"spring" as const, stiffness:280, damping:24 } } };

// ─── Reusable dark card shell ──────────────────────────────────────────────────
const DarkCard = ({ children, className="" }: { children:React.ReactNode; className?:string }) => (
  <div className={`rounded-2xl overflow-hidden ${className}`}
    style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 8px 32px rgba(0,0,0,0.35)" }}>
    {children}
  </div>
);

// ─── Dark chart tooltips ───────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  const isRevenue = payload[0].dataKey === "revenue";
  return (
    <div className="rounded-xl px-4 py-3 text-sm" style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.1)", boxShadow:"0 12px 30px rgba(0,0,0,0.5)" }}>
      <p className="text-gray-500 font-semibold text-xs mb-1.5 uppercase tracking-wider">{label || payload[0].name}</p>
      <p className="font-black text-lg" style={{ color:ACCENT }}>
        {isRevenue ? `₦${val?.toLocaleString()}` : val}
      </p>
    </div>
  );
};

const PieTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-sm" style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.1)" }}>
      <p className="font-bold" style={{ color: STATUS_PIE[payload[0].name] || ACCENT }}>{payload[0].name}</p>
      <p className="text-white font-black">{payload[0].value}</p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete,  setProductToDelete]  = useState<string | null>(null);

  const { data:statsData,    isLoading:statsLoading,    refetch:refetchStats    } = useGetAdminStatsQuery({});
  // ✅ Extract products from the paginated response
  const { data:productsResponse, isLoading:productsLoading, refetch:refetchProducts } = useGetProductsQuery({ limit: 9999 });
  const { data:analyticsData,isLoading:analyticsLoading,refetch:refetchAnalytics} = useGetSalesAnalyticsQuery({});
  const { data:topProductsData, refetch:refetchTopProducts } = useGetTopProductsQuery({});
  const { data:orderCustomerData }                           = useGetOrderCustomerCountQuery({});
  const { data:usersData, refetch:refetchUsers }             = useGetUsersQuery({});

  const [updateStatus]  = useUpdateOrderStatusMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [updateUserRole]= useUpdateUserRoleMutation();
  const [updateStock]   = useUpdateStockMutation();

  const stats      = statsData   || { orders:[], totalRevenue:0 };
  // ✅ Use imported ProductItem type; array is correctly typed
  const products   = useMemo<ProductItem[]>(() => productsResponse?.products || [], [productsResponse]);
  const analytics  = analyticsData || { totalRevenue:0, totalOrders:0, categorySales:[] };
  const topProducts: TopProduct[] = topProductsData || [];
  const users: UserData[] = usersData || [];

  const lowStockCount = useMemo(() => products.filter(p => (p.stock ?? 0) < 5).length, [products]);
  const realCustomers  = orderCustomerData?.count || 0;

  const statusPieData = useMemo(() => {
    const dist: Record<string,number> = {};
    (stats.orders || []).forEach((o: OrderItem) => { dist[o.status] = (dist[o.status] || 0) + 1; });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [stats.orders]);

  const sortedProducts = useMemo(() => [...products].sort((a,b) => b._id.localeCompare(a._id)), [products]);

  const handleDeleteClick  = (id: string) => { setProductToDelete(id); setDeleteModalOpen(true); };
  const confirmDelete      = async () => { if (!productToDelete) return; await deleteProduct(productToDelete); refetchProducts(); setDeleteModalOpen(false); setProductToDelete(null); };
  const handleStatusChange = async (id: string, status: string) => { try { await updateStatus({ id, status }).unwrap(); refetchStats(); } catch { /* Handle error silently */ } };
  const handleStockUpdate  = async (id: string, cur: number, delta: number) => { try { await updateStock({ id, stock: Math.max(0, cur + delta) }).unwrap(); refetchProducts(); } catch { /* Handle error silently */ } };
  const handleRoleUpdate   = async (id: string, role: "user"|"admin") => { try { await updateUserRole({ id, role }).unwrap(); refetchUsers(); } catch { /* Handle error silently */ } };
  const handleRefresh      = () => { refetchStats(); refetchProducts(); refetchAnalytics(); refetchTopProducts(); refetchUsers(); };

  // ══════ LOADING SKELETON ═════════════════════════════════════════════════════
  if (statsLoading || productsLoading || analyticsLoading) {
    return (
      <div
        className="min-h-screen p-4 md:p-6 pt-16 md:pt-24 max-w-7xl mx-auto space-y-5 md:space-y-6 pb-28 md:pb-10"
        style={{ background: "#0A0A0B" }}
      >
        <SEO title="Admin Dashboard" description="Manage your store." />

        {/* Header skeleton */}
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

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} dark />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <DarkCardSkeleton>
              <div className="p-5">
                <div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />
                <ChartSkeleton height={230} />
              </div>
            </DarkCardSkeleton>
          </div>
          <div>
            <DarkCardSkeleton>
              <div className="p-5">
                <div className="h-6 w-32 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />
                <ChartSkeleton height={200} />
              </div>
            </DarkCardSkeleton>
          </div>
        </div>

        {/* Quick Inventory + Top Products skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DarkCardSkeleton>
            <div className="p-5">
              <div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-3/4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    <div className="h-3 w-1/4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-8 rounded-lg bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    <div className="w-6 h-6 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </DarkCardSkeleton>
          <DarkCardSkeleton>
            <div className="p-5">
              <div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-3/4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    <div className="h-3 w-1/4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-16 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    <div className="h-3 w-12 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </DarkCardSkeleton>
        </div>

        {/* Recent Orders skeleton */}
        <DarkCardSkeleton>
          <div className="p-5">
            <div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <OrderRowSkeleton key={i} dark />
            ))}
          </div>
        </DarkCardSkeleton>

        {/* User Management skeleton */}
        <DarkCardSkeleton>
          <div className="p-5">
            <div className="h-6 w-48 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={3} dark />
            ))}
          </div>
        </DarkCardSkeleton>
      </div>
    );
  }

  // ══════ MAIN DASHBOARD ════════════════════════════════════════════════════════
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible"
      className="min-h-screen p-4 md:p-6 pt-16 md:pt-24 max-w-7xl mx-auto space-y-5 md:space-y-6 pb-28 md:pb-10"
      style={{ background:"#0A0A0B" }}>
      <SEO title="Admin Dashboard" description="Manage your store, track sales, oversee orders & users." />

      <ConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete} title="Delete Product"
        message="Are you sure? This action cannot be undone." confirmText="Delete" cancelText="Cancel" type="danger" />

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${ACCENT}18` }}>
              <Flame className="w-4 h-4" style={{ color:ACCENT }} />
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color:ACCENT }}>Admin</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Command Center</h1>
          <p className="text-gray-600 text-sm mt-0.5">Real-time overview of your store.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }} onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors"
            style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.08)" }}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </motion.button>
          <motion.button whileHover={{ scale:1.04, boxShadow:`0 12px 28px ${ACCENT}55` }} whileTap={{ scale:0.96 }}
            onClick={() => navigate("/admin/products")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
            style={{ background:ACCENT, boxShadow:`0 6px 18px ${ACCENT}44` }}>
            <PlusCircle className="w-4 h-4" /> Add Product
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div variants={stagger} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Total Revenue",     value:`₦${stats.totalRevenue.toLocaleString()}`, icon:<TrendingUp className="w-5 h-5"/>, color:"#e8622a", bg:"rgba(232,98,42,0.12)"  },
          { label:"Recent Orders",     value: stats.orders?.length || 0,                icon:<ShoppingBag className="w-5 h-5"/>, color:"#3b82f6", bg:"rgba(59,130,246,0.12)" },
          { label:"Customers",         value: realCustomers,                             icon:<Users className="w-5 h-5"/>,       color:"#8b5cf6", bg:"rgba(139,92,246,0.12)"  },
          { label:"Low Stock Alerts",  value: lowStockCount,                             icon:<AlertTriangle className="w-5 h-5"/>,color:"#ef4444", bg:"rgba(239,68,68,0.12)"  },
        ].map((s, i) => (
          <motion.div key={i} variants={fadeUp}
            className="relative rounded-2xl p-4 md:p-5 overflow-hidden"
            style={{ background:"#141414", border:`1px solid ${s.color}22`, boxShadow:`0 8px 24px rgba(0,0,0,0.3)` }}>
            <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl pointer-events-none" style={{ background:s.color, opacity:0.18 }} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-600 mb-2">{s.label}</p>
                <p className="text-xl md:text-3xl font-black text-white leading-none">{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:s.bg, color:s.color }}>
                {s.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <DarkCard>
            <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
              <h2 className="font-black text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color:ACCENT }} /> Sales by Category
              </h2>
              <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Revenue (₦)</p>
            </div>
            <div className="p-5">
              {analytics.categorySales.length === 0 ? (
                <p className="text-gray-700 text-center py-14 text-sm">No paid orders yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={analytics.categorySales} margin={{ top:8, right:0, left:0, bottom:0 }}>
                    <XAxis dataKey="_id" tick={{ fontSize:10, fill:"#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:10, fill:"#6b7280" }} axisLine={false} tickLine={false}
                      tickFormatter={(v:number) => `₦${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="revenue" radius={[8,8,0,0]} barSize={28}>
                      {analytics.categorySales.map((_:CategorySale, i:number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </DarkCard>
        </motion.div>

        <motion.div variants={fadeUp}>
          <DarkCard className="h-full">
            <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
              <h2 className="font-black text-white flex items-center gap-2">
                <PieChart className="w-4 h-4" style={{ color:"#10b981" }} /> Order Status
              </h2>
            </div>
            <div className="p-5">
              {statusPieData.length === 0 ? (
                <p className="text-gray-700 text-center py-14 text-sm">No orders yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <RePieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value">
                      {statusPieData.map((e, i) => (
                        <Cell key={i} fill={STATUS_PIE[e.name] || "#6b7280"} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle"
                      formatter={(v:string) => <span style={{ color:"#9ca3af", fontSize:11, fontWeight:700 }}>{v}</span>} />
                    <Tooltip content={<PieTooltip />} />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </div>
          </DarkCard>
        </motion.div>
      </div>

      {/* ── Quick Inventory + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={fadeUp}>
          <DarkCard>
            <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
              <h2 className="font-black text-white flex items-center gap-2">
                <Package className="w-4 h-4" style={{ color:ACCENT }} /> Quick Inventory
              </h2>
              <button onClick={() => navigate("/admin/products")}
                className="text-xs font-bold flex items-center gap-1 hover:opacity-75 transition-opacity" style={{ color:ACCENT }}>
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto"
              style={{ scrollbarWidth:"thin", scrollbarColor:`${ACCENT}40 transparent` }}>
              {sortedProducts.slice(0,6).map(p => (
                <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border" style={{ borderColor:"rgba(255,255,255,0.08)" }}>
                    <img src={p.images?.[0] || "https://via.placeholder.com/40"} alt={p.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.src="https://via.placeholder.com/40"; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{p.name}</p>
                    {/* ✅ Use safe category helper */}
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{ background:`${ACCENT}15`, color:ACCENT }}>
                      {getCategoryName(p.category)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center rounded-xl overflow-hidden"
                      style={{ background:"#111", border:"1px solid rgba(255,255,255,0.08)" }}>
                      <motion.button whileTap={{ scale:0.85 }} onClick={() => handleStockUpdate(p._id, p.stock ?? 0, -1)}
                        className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors">
                        <Minus className="w-3 h-3" />
                      </motion.button>
                      <span className={`w-8 text-center text-xs font-black ${(p.stock ?? 0) < 5 ? "text-red-400" : "text-white"}`}>
                        {p.stock ?? 0}
                      </span>
                      <motion.button whileTap={{ scale:0.85 }} onClick={() => handleStockUpdate(p._id, p.stock ?? 0, 1)}
                        className="w-7 h-7 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>
                    {(p.stock ?? 0) < 5 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold"
                        style={{ background:"rgba(239,68,68,0.12)", color:"#f87171" }}>Low</span>
                    )}
                    <motion.button whileTap={{ scale:0.9 }} onClick={() => handleDeleteClick(p._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-700 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </DarkCard>
        </motion.div>

        <motion.div variants={fadeUp}>
          <DarkCard>
            <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
              <h2 className="font-black text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color:ACCENT }} /> Top Selling
              </h2>
              <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">By orders</span>
            </div>
            <div className="p-4 space-y-2.5">
              {topProducts.length === 0 ? (
                <p className="text-gray-700 text-center py-14 text-sm">No sales data yet.</p>
              ) : topProducts.slice(0,5).map((p, idx) => (
                <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background:`${ACCENT}18`, color:ACCENT }}>
                    {idx + 1}
                  </div>
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                    <img src={p.images?.[0] || "https://via.placeholder.com/40"} alt={p.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.src="https://via.placeholder.com/40"; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{p.name}</p>
                    <p className="text-gray-600 text-xs">{p.totalQuantity} units sold</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-black text-sm">₦{p.price.toLocaleString()}</p>
                    <p className="text-gray-600 text-[10px]">₦{p.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </DarkCard>
        </motion.div>
      </div>

      {/* ── Recent Orders Table ── */}
      <motion.div variants={fadeUp}>
        <DarkCard>
          <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" style={{ color:"#3b82f6" }} /> Recent Orders
            </h2>
            <button onClick={() => navigate("/admin/orders")}
              className="text-xs font-bold flex items-center gap-1 hover:opacity-75 transition-opacity" style={{ color:ACCENT }}>
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background:"rgba(255,255,255,0.03)" }}>
                <tr>
                  {["Customer","Total","Date","Payment","Status"].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats.orders || []).slice(0,5).map((order: OrderItem) => (
                  <tr key={order._id} className="border-t transition-colors hover:bg-white/[0.015]"
                    style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                    <td className="px-5 py-3.5 text-sm text-gray-400 max-w-[160px] truncate">{order.user?.email}</td>
                    <td className="px-5 py-3.5 text-sm font-black text-white">₦{order.totalPrice.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-NG", { day:"numeric", month:"short" }) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background:"rgba(255,255,255,0.06)", color:"#9ca3af" }}>
                        {PAYMENT_LABELS[order.paymentMethod || ""] || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <select value={order.status}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-xl outline-none cursor-pointer transition-all appearance-none"
                        style={{
                          background: STATUS_DARK[order.status]?.bg   || "rgba(255,255,255,0.07)",
                          color:      STATUS_DARK[order.status]?.text  || "#fff",
                          border:     `1px solid ${STATUS_DARK[order.status]?.border || "rgba(255,255,255,0.1)"}`,
                        }}>
                        {["Pending","Paid","Shipped","Delivered"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DarkCard>
      </motion.div>

      {/* ── User Management ── */}
      <motion.div variants={fadeUp}>
        <DarkCard>
          <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
            <h2 className="font-black text-white flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color:"#8b5cf6" }} /> User Management
            </h2>
            <span className="text-[10px] text-gray-600 font-semibold">{users.length} users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background:"rgba(255,255,255,0.03)" }}>
                <tr>
                  {["Email","Current Role","Change Role"].map(h => (
                    <th key={h} className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.slice(0,10).map((u: UserData) => (
                  <tr key={u._id} className="border-t transition-colors hover:bg-white/[0.015]"
                    style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                    <td className="px-5 py-3.5 text-sm text-gray-400 max-w-[200px] truncate">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          background: u.role === "admin" ? `${ACCENT}15` : "rgba(156,163,175,0.1)",
                          color:      u.role === "admin" ? ACCENT : "#9ca3af",
                          border:     `1px solid ${u.role === "admin" ? `${ACCENT}30` : "rgba(156,163,175,0.2)"}`,
                        }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <select value={u.role}
                        onChange={e => handleRoleUpdate(u._id, e.target.value as "user"|"admin")}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer transition-all"
                        style={{
                          background: "#1c1c1c",
                          color:      "#9ca3af",
                          border:     "1px solid rgba(255,255,255,0.08)",
                        }}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DarkCard>
      </motion.div>

    </motion.div>
  );
};

export default Dashboard;