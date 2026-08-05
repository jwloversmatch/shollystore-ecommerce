// import { useState, useMemo, useRef } from "react";
// import { useFocusTrap } from "../../hooks/useFocusTrap";
// import { useNavigate } from "react-router-dom";
// import { AnimatePresence } from "framer-motion";
// import {
//   useGetAllOrdersQuery,
//   useUpdateOrderStatusMutation,
// } from "../../features/api/apiSlice";
// import {
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   Filter,
//   X,
//   ShoppingBag,
//   CheckCircle,
//   Clock,
//   Phone,
//   Eye,
//   MapPin,
//   CreditCard,
//   Calendar,
//   Package,
//   Ticket,
//   XCircle,
// } from "lucide-react";
// import {
//   StatsCardSkeleton,
//   OrderRowSkeleton,
// } from "../../components/Skeletons";
// import { useTheme } from "../../context/ThemeContext";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface OrderItem {
//   _id: string;
//   user: { email: string; name?: string; phone?: string };
//   name?: string;
//   phone?: string;
//   totalPrice: number;
//   status: string;
//   createdAt: string;
//   paymentMethod?: string;
//   orderItems: Array<{ name: string; qty: number; price: number }>;
//   shippingAddress?: {
//     address: string;
//     city: string;
//     postalCode?: string;
//     country?: string;
//   };
//   couponCode?: string;
//   discount?: number;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────
// const PAYMENT_METHOD_LABELS: Record<string, string> = {
//   paystack: "Paystack",
//   bank_transfer: "Bank Transfer",
//   whatsapp: "WhatsApp",
// };
// const STATUS_OPTIONS = [
//   "All",
//   "Pending",
//   "Paid",
//   "Shipped",
//   "Delivered",
//   "Cancelled",
// ];
// const PAYMENT_OPTIONS = ["All", "paystack", "bank_transfer", "whatsapp"];
// const STATUS_FLOW: Record<string, string[]> = {
//   Pending: ["Pending", "Paid", "Cancelled"],
//   Paid: ["Paid", "Shipped"],
//   Shipped: ["Shipped", "Delivered"],
//   Delivered: ["Delivered"],
//   Cancelled: ["Cancelled"],
// };
// const ALL_STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"];

// const Orders = () => {
//   const navigate = useNavigate();
//   const { theme } = useTheme();
//   const isDark = theme === "dark";

//   const [page, setPage] = useState(1);
//   const limit = 10;
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [paymentFilter, setPaymentFilter] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [showFilters, setShowFilters] = useState(false);
//   const { data, isLoading, refetch } = useGetAllOrdersQuery({
//     page,
//     limit,
//     status: statusFilter,
//     paymentMethod: paymentFilter,
//     search: searchTerm,
//     startDate,
//     endDate,
//   });
//   const [updateStatus] = useUpdateOrderStatusMutation();
//   const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
//   const orderModalRef = useRef<HTMLDivElement>(null);

//   // Theme styles
//   const bg = isDark ? "#0A0A0B" : "#FCFAF5";
//   const cardBg = isDark ? "#141414" : "rgba(255,255,255,0.8)";
//   const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
//   const textPrimary = isDark ? "#fff" : "#1f2937";
//   const textSecondary = isDark ? "#9ca3af" : "#6b7280";
//   const textMuted = isDark ? "#6b7280" : "#9ca3af";
//   const inputBg = isDark ? "#1c1c1c" : "#fff";
//   const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
//   const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
//   const theadBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
//   const modalBg = isDark ? "#141414" : "#fff";
//   const modalOverlay = isDark ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.4)";
//   const filterBg = isDark ? "#141414" : "rgba(255,255,255,0.8)";

//   const handleStatusChange = async (orderId: string, newStatus: string) => {
//     try {
//       await updateStatus({ id: orderId, status: newStatus }).unwrap();
//       refetch();
//     } catch (error) {
//       console.error("Failed to update status:", error);
//     }
//   };

//   const handleClearFilters = () => {
//     setStatusFilter("All");
//     setPaymentFilter("All");
//     setSearchTerm("");
//     setStartDate("");
//     setEndDate("");
//     setPage(1);
//   };

//   const orders = useMemo(() => data?.orders || [], [data?.orders]);
//   const totalPages = data?.totalPages || 1;

//   const stats = useMemo(() => {
//     const total = orders.length;
//     return {
//       total,
//       paid: orders.filter((o: OrderItem) => o.status === "Paid").length,
//       pending: orders.filter((o: OrderItem) => o.status === "Pending").length,
//       cancelled: orders.filter((o: OrderItem) => o.status === "Cancelled")
//         .length,
//     };
//   }, [orders]);

//   useFocusTrap(orderModalRef, !!selectedOrder, () => setSelectedOrder(null));

//   const statusColors = (status: string) => {
//     const colors: Record<string, { bg: string; text: string }> = {
//       Pending: {
//         bg: isDark ? "rgba(251,191,36,0.1)" : "#fef3c7",
//         text: isDark ? "#fbbf24" : "#92400e",
//       },
//       Paid: {
//         bg: isDark ? "rgba(52,211,153,0.1)" : "#d1fae5",
//         text: isDark ? "#34d399" : "#065f46",
//       },
//       Shipped: {
//         bg: isDark ? "rgba(96,165,250,0.1)" : "#dbeafe",
//         text: isDark ? "#60a5fa" : "#1e40af",
//       },
//       Delivered: {
//         bg: isDark ? "rgba(156,163,175,0.1)" : "#f3f4f6",
//         text: isDark ? "#9ca3af" : "#374151",
//       },
//       Cancelled: {
//         bg: isDark ? "rgba(239,68,68,0.1)" : "#fee2e2",
//         text: isDark ? "#f87171" : "#991b1b",
//       },
//     };
//     return (
//       colors[status] || {
//         bg: isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6",
//         text: textSecondary,
//       }
//     );
//   };

//   if (isLoading) {
//     return (
//       <main
//         id="main-content"
//         tabIndex={-1}
//         className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 focus:outline-none"
//         style={{
//           background: bg,
//           paddingTop: "calc(56px + env(safe-area-inset-top, 0px))",
//         }}
//       >
//         <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <StatsCardSkeleton key={i} dark={isDark} />
//           ))}
//         </div>
//         <div
//           className="rounded-2xl border"
//           style={{ background: cardBg, borderColor: cardBorder }}
//         >
//           {Array.from({ length: 5 }).map((_, i) => (
//             <OrderRowSkeleton key={i} dark={isDark} />
//           ))}
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main
//       id="main-content"
//       tabIndex={-1}
//       className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8 focus:outline-none"
//       style={{
//         background: bg,
//         paddingTop: "calc(56px + env(safe-area-inset-top, 0px))",
//       }}
//     >
//       {/* Header */}
//       <header className="flex flex-row items-center justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => navigate("/admin")}
//             className="p-2 rounded-xl border transition-colors"
//             style={{
//               background: inputBg,
//               borderColor: inputBorder,
//               color: textSecondary,
//             }}
//             aria-label="Back to admin dashboard"
//           >
//             <ArrowLeft className="w-5 h-5" aria-hidden="true" />
//           </button>
//           <div>
//             <h1
//               className="text-2xl md:text-3xl font-bold"
//               style={{ color: textPrimary }}
//             >
//               All Orders
//             </h1>
//             <p className="text-xs sm:text-sm mt-1" style={{ color: textMuted }}>
//               View and manage every customer order
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowFilters(!showFilters)}
//           className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border transition text-sm font-medium"
//           style={{
//             background: inputBg,
//             borderColor: inputBorder,
//             color: textSecondary,
//           }}
//           aria-expanded={showFilters}
//           aria-controls="filters-panel"
//         >
//           <Filter className="w-4 h-4" aria-hidden="true" />
//           <span className="hidden sm:inline">Filters</span>
//         </button>
//       </header>

//       {/* Stats Cards */}
//       <div
//         className="grid grid-cols-1 sm:grid-cols-4 gap-4"
//         role="group"
//         aria-label="Order statistics"
//       >
//         {[
//           {
//             title: "Total",
//             value: stats.total,
//             icon: <ShoppingBag className="w-5 h-5" aria-hidden="true" />,
//             color: "#3b82f6",
//             bg: isDark ? "rgba(59,130,246,0.1)" : "#dbeafe",
//           },
//           {
//             title: "Paid",
//             value: stats.paid,
//             icon: <CheckCircle className="w-5 h-5" aria-hidden="true" />,
//             color: "#10b981",
//             bg: isDark ? "rgba(16,185,129,0.1)" : "#d1fae5",
//           },
//           {
//             title: "Pending",
//             value: stats.pending,
//             icon: <Clock className="w-5 h-5" aria-hidden="true" />,
//             color: "#f59e0b",
//             bg: isDark ? "rgba(245,158,11,0.1)" : "#fef3c7",
//           },
//           {
//             title: "Cancelled",
//             value: stats.cancelled,
//             icon: <XCircle className="w-5 h-5" aria-hidden="true" />,
//             color: "#ef4444",
//             bg: isDark ? "rgba(239,68,68,0.1)" : "#fee2e2",
//           },
//         ].map((stat, idx) => (
//           <div
//             key={idx}
//             className="rounded-2xl shadow-sm border p-4 flex items-center gap-4"
//             style={{ background: cardBg, borderColor: cardBorder }}
//           >
//             <div
//               className="p-3 rounded-xl"
//               style={{ background: stat.bg, color: stat.color }}
//             >
//               {stat.icon}
//             </div>
//             <div>
//               <p
//                 className="text-xs uppercase font-bold tracking-widest"
//                 style={{ color: textMuted }}
//               >
//                 {stat.title}
//               </p>
//               <p className="text-lg font-bold" style={{ color: stat.color }}>
//                 {stat.value}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Filters Panel */}
//       <AnimatePresence>
//         {showFilters && (
//           <div
//             id="filters-panel"
//             role="region"
//             aria-label="Order filters"
//             className="rounded-2xl shadow-sm border p-4 sm:p-6 overflow-hidden"
//             style={{ background: filterBg, borderColor: cardBorder }}
//           >
//             <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
//               <div className="flex-1 min-w-[120px]">
//                 <label
//                   htmlFor="filter-status"
//                   className="block text-xs font-medium mb-1"
//                   style={{ color: textSecondary }}
//                 >
//                   Status
//                 </label>
//                 <select
//                   id="filter-status"
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="w-full border rounded-xl px-3 py-2 outline-none text-sm"
//                   style={{
//                     background: inputBg,
//                     borderColor: inputBorder,
//                     color: textPrimary,
//                   }}
//                 >
//                   {STATUS_OPTIONS.map((s) => (
//                     <option key={s} value={s}>
//                       {s}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex-1 min-w-[120px]">
//                 <label
//                   htmlFor="filter-payment"
//                   className="block text-xs font-medium mb-1"
//                   style={{ color: textSecondary }}
//                 >
//                   Payment
//                 </label>
//                 <select
//                   id="filter-payment"
//                   value={paymentFilter}
//                   onChange={(e) => setPaymentFilter(e.target.value)}
//                   className="w-full border rounded-xl px-3 py-2 outline-none text-sm"
//                   style={{
//                     background: inputBg,
//                     borderColor: inputBorder,
//                     color: textPrimary,
//                   }}
//                 >
//                   {PAYMENT_OPTIONS.map((p) => (
//                     <option key={p} value={p}>
//                       {p === "All" ? "All" : PAYMENT_METHOD_LABELS[p]}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex-1 min-w-[160px]">
//                 <label
//                   htmlFor="filter-search"
//                   className="block text-xs font-medium mb-1"
//                   style={{ color: textSecondary }}
//                 >
//                   Search Email
//                 </label>
//                 <div className="relative">
//                   <Search
//                     className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
//                     style={{ color: textMuted }}
//                     aria-hidden="true"
//                   />
//                   <input
//                     id="filter-search"
//                     type="text"
//                     placeholder="Search email..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none text-sm"
//                     style={{
//                       background: inputBg,
//                       borderColor: inputBorder,
//                       color: textPrimary,
//                     }}
//                   />
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <div>
//                   <label
//                     htmlFor="filter-start-date"
//                     className="block text-xs font-medium mb-1"
//                     style={{ color: textSecondary }}
//                   >
//                     From
//                   </label>
//                   <input
//                     id="filter-start-date"
//                     type="date"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                     className="border rounded-xl px-3 py-2 outline-none text-sm"
//                     style={{
//                       background: inputBg,
//                       borderColor: inputBorder,
//                       color: textPrimary,
//                     }}
//                   />
//                 </div>
//                 <div>
//                   <label
//                     htmlFor="filter-end-date"
//                     className="block text-xs font-medium mb-1"
//                     style={{ color: textSecondary }}
//                   >
//                     To
//                   </label>
//                   <input
//                     id="filter-end-date"
//                     type="date"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                     className="border rounded-xl px-3 py-2 outline-none text-sm"
//                     style={{
//                       background: inputBg,
//                       borderColor: inputBorder,
//                       color: textPrimary,
//                     }}
//                   />
//                 </div>
//               </div>
//               <button
//                 onClick={handleClearFilters}
//                 className="px-4 py-2 rounded-xl transition text-sm font-medium"
//                 style={{
//                   background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
//                   color: "#f87171",
//                 }}
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Orders Table */}
//       <div
//         className="rounded-2xl shadow-sm border overflow-hidden"
//         style={{ background: cardBg, borderColor: cardBorder }}
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full text-left" aria-label="Orders list">
//             <caption className="sr-only">
//               List of all customer orders with status and actions
//             </caption>
//             <thead style={{ background: theadBg }}>
//               <tr>
//                 {[
//                   "Customer",
//                   "Items",
//                   "Total",
//                   "Date",
//                   "Payment",
//                   "Discount",
//                   "Status",
//                   "Details",
//                 ].map((h) => (
//                   <th
//                     key={h}
//                     scope="col"
//                     className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider ${h === "Date" || h === "Payment" ? "hidden sm:table-cell" : ""}`}
//                     style={{ color: textMuted }}
//                   >
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order: OrderItem) => {
//                 const isLocked =
//                   order.status === "Delivered" || order.status === "Cancelled";
//                 const statusStyle = statusColors(order.status);
//                 return (
//                   <tr
//                     key={order._id}
//                     className="transition-colors"
//                     style={{ borderColor: tableBorder }}
//                   >
//                     <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
//                       <span
//                         className="font-medium"
//                         style={{ color: textPrimary }}
//                       >
//                         {order.user?.name || order.name || "N/A"}
//                       </span>
//                       <span className="block" style={{ color: textSecondary }}>
//                         {order.user?.email}
//                       </span>
//                       {(order.user?.phone || order.phone) && (
//                         <span
//                           className="flex items-center gap-1 mt-0.5"
//                           style={{ color: textMuted }}
//                         >
//                           <Phone className="w-3 h-3" aria-hidden="true" />
//                           {order.user?.phone || order.phone}
//                         </span>
//                       )}
//                     </td>
//                     <td
//                       className="px-4 sm:px-6 py-3 text-xs sm:text-sm"
//                       style={{ color: textSecondary }}
//                     >
//                       {order.orderItems?.length > 0 ? (
//                         order.orderItems.map((item, idx) => (
//                           <span key={idx}>
//                             {item.qty}x {item.name}
//                             {idx < order.orderItems.length - 1 ? ", " : ""}
//                           </span>
//                         ))
//                       ) : (
//                         <span style={{ color: textMuted }}>—</span>
//                       )}
//                     </td>
//                     <td
//                       className="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm"
//                       style={{ color: textPrimary }}
//                     >
//                       ₦{order.totalPrice.toLocaleString()}
//                     </td>
//                     <td
//                       className="hidden sm:table-cell px-4 sm:px-6 py-3 text-xs sm:text-sm"
//                       style={{ color: textMuted }}
//                     >
//                       {new Date(order.createdAt).toLocaleDateString()}
//                     </td>
//                     <td
//                       className="hidden sm:table-cell px-4 sm:px-6 py-3 text-xs sm:text-sm"
//                       style={{ color: textSecondary }}
//                     >
//                       {PAYMENT_METHOD_LABELS[order.paymentMethod || ""] || "—"}
//                     </td>
//                     <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
//                       {order.couponCode ? (
//                         <span
//                           className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
//                           style={{
//                             background: isDark
//                               ? "rgba(16,185,129,0.1)"
//                               : "#d1fae5",
//                             color: isDark ? "#34d399" : "#065f46",
//                           }}
//                         >
//                           <Ticket className="w-3 h-3" aria-hidden="true" />
//                           {order.couponCode} (-₦
//                           {order.discount?.toLocaleString() || 0})
//                         </span>
//                       ) : (
//                         <span style={{ color: textMuted }}>—</span>
//                       )}
//                     </td>
//                     <td className="px-4 sm:px-6 py-3">
//                       <div className="flex items-center gap-2">
//                         <label
//                           htmlFor={`status-${order._id}`}
//                           className="sr-only"
//                         >
//                           Status for order {order._id.slice(-8)}
//                         </label>
//                         <select
//                           id={`status-${order._id}`}
//                           value={order.status}
//                           onChange={(e) =>
//                             handleStatusChange(order._id, e.target.value)
//                           }
//                           disabled={isLocked}
//                           className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border-0 cursor-pointer outline-none transition-all"
//                           style={{
//                             background: statusStyle.bg,
//                             color: statusStyle.text,
//                             opacity: isLocked ? 0.5 : 1,
//                             cursor: isLocked ? "not-allowed" : "pointer",
//                           }}
//                         >
//                           {ALL_STATUSES.map((s) => (
//                             <option
//                               key={s}
//                               value={s}
//                               disabled={!STATUS_FLOW[order.status]?.includes(s)}
//                             >
//                               {s}
//                             </option>
//                           ))}
//                         </select>
//                         {order.status === "Pending" && (
//                           <button
//                             onClick={() =>
//                               handleStatusChange(order._id, "Cancelled")
//                             }
//                             className="text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors whitespace-nowrap"
//                             style={{
//                               background: isDark
//                                 ? "rgba(239,68,68,0.1)"
//                                 : "#fef2f2",
//                               color: "#f87171",
//                               borderColor: isDark
//                                 ? "rgba(239,68,68,0.2)"
//                                 : "#fecaca",
//                             }}
//                             aria-label={`Cancel order ${order._id.slice(-8)}`}
//                           >
//                             ✕ Cancel
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-4 sm:px-6 py-3">
//                       <button
//                         onClick={() => setSelectedOrder(order)}
//                         className="flex items-center gap-1 text-xs sm:text-sm font-medium"
//                         style={{ color: "#e8622a" }}
//                         aria-label={`View details for order ${order._id.slice(-8)}`}
//                       >
//                         <Eye className="w-4 h-4" aria-hidden="true" /> View
//                       </button>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {orders.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={8}
//                     className="px-4 sm:px-6 py-12 text-center text-sm"
//                     style={{ color: textMuted }}
//                   >
//                     No orders found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <nav
//             className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 border-t gap-2"
//             style={{ borderColor: cardBorder }}
//             aria-label="Pagination"
//           >
//             <span
//               className="text-xs sm:text-sm"
//               style={{ color: textMuted }}
//               aria-live="polite"
//             >
//               Page {page} of {totalPages}
//             </span>
//             <div className="flex gap-1">
//               <button
//                 onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                 disabled={page === 1}
//                 className="p-1.5 rounded disabled:opacity-40 transition"
//                 style={{ color: textSecondary }}
//                 aria-label="Previous page"
//               >
//                 <ChevronLeft className="w-4 h-4" aria-hidden="true" />
//               </button>
//               <button
//                 onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//                 disabled={page === totalPages}
//                 className="p-1.5 rounded disabled:opacity-40 transition"
//                 style={{ color: textSecondary }}
//                 aria-label="Next page"
//               >
//                 <ChevronRight className="w-4 h-4" aria-hidden="true" />
//               </button>
//             </div>
//           </nav>
//         )}
//       </div>

//       {/* Order Detail Modal */}
//       <AnimatePresence>
//         {selectedOrder && (
//           <>
//             <div
//               className="fixed inset-0 z-50"
//               style={{ background: modalOverlay, backdropFilter: "blur(8px)" }}
//               onClick={() => setSelectedOrder(null)}
//               role="presentation"
//               aria-hidden="true"
//             />
//             <div
//               className="fixed inset-0 z-50 flex items-center justify-center p-4"
//               role="dialog"
//               aria-modal="true"
//               aria-labelledby="order-detail-title"
//             >
//               <div
//                 ref={orderModalRef}
//                 className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border"
//                 style={{ background: modalBg, borderColor: cardBorder }}
//               >
//                 <div
//                   className="sticky top-0 p-4 sm:p-6 border-b flex justify-between items-center"
//                   style={{ background: modalBg, borderColor: cardBorder }}
//                 >
//                   <h2
//                     id="order-detail-title"
//                     className="text-xl font-bold"
//                     style={{ color: textPrimary }}
//                   >
//                     Order #{selectedOrder._id.slice(-8).toUpperCase()}
//                   </h2>
//                   <button
//                     onClick={() => setSelectedOrder(null)}
//                     className="p-2 rounded-xl transition"
//                     style={{ color: textSecondary }}
//                     aria-label="Close order details"
//                   >
//                     <X className="w-5 h-5" aria-hidden="true" />
//                   </button>
//                 </div>
//                 <div className="p-4 sm:p-6 space-y-6">
//                   <div className="flex flex-wrap gap-3 items-center">
//                     <span
//                       className="px-3 py-1 rounded-full text-xs font-bold"
//                       style={{
//                         background: statusColors(selectedOrder.status).bg,
//                         color: statusColors(selectedOrder.status).text,
//                       }}
//                     >
//                       {selectedOrder.status}
//                     </span>
//                     <span
//                       className="text-sm flex items-center gap-1"
//                       style={{ color: textMuted }}
//                     >
//                       <Calendar className="w-4 h-4" aria-hidden="true" />
//                       {new Date(selectedOrder.createdAt).toLocaleDateString(
//                         "en-NG",
//                         { year: "numeric", month: "long", day: "numeric" },
//                       )}
//                     </span>
//                     {selectedOrder.paymentMethod && (
//                       <span
//                         className="text-sm flex items-center gap-1"
//                         style={{ color: textMuted }}
//                       >
//                         <CreditCard className="w-4 h-4" aria-hidden="true" />
//                         {PAYMENT_METHOD_LABELS[selectedOrder.paymentMethod] ||
//                           selectedOrder.paymentMethod}
//                       </span>
//                     )}
//                   </div>
//                   <div
//                     className="rounded-xl p-4"
//                     style={{ background: inputBg }}
//                     role="group"
//                     aria-label="Customer information"
//                   >
//                     <p
//                       className="text-xs uppercase tracking-wider mb-1"
//                       style={{ color: textMuted }}
//                     >
//                       Customer
//                     </p>
//                     <p className="font-medium" style={{ color: textPrimary }}>
//                       {selectedOrder.user?.name || selectedOrder.name || "N/A"}
//                     </p>
//                     <p className="text-sm" style={{ color: textSecondary }}>
//                       {selectedOrder.user?.email}
//                     </p>
//                     {(selectedOrder.user?.phone || selectedOrder.phone) && (
//                       <p
//                         className="text-sm flex items-center gap-1"
//                         style={{ color: textSecondary }}
//                       >
//                         <Phone className="w-3.5 h-3.5" aria-hidden="true" />{" "}
//                         {selectedOrder.user?.phone || selectedOrder.phone}
//                       </p>
//                     )}
//                   </div>
//                   {selectedOrder.couponCode && (
//                     <div
//                       className="rounded-xl p-4 border"
//                       style={{
//                         background: isDark ? "rgba(16,185,129,0.1)" : "#d1fae5",
//                         borderColor: isDark
//                           ? "rgba(16,185,129,0.2)"
//                           : "#a7f3d0",
//                       }}
//                       role="group"
//                       aria-label="Discount information"
//                     >
//                       <p
//                         className="text-xs uppercase tracking-wider mb-1 font-semibold"
//                         style={{ color: isDark ? "#34d399" : "#065f46" }}
//                       >
//                         Discount Applied
//                       </p>
//                       <div className="flex items-center gap-2">
//                         <Ticket
//                           className="w-5 h-5"
//                           style={{ color: isDark ? "#34d399" : "#059669" }}
//                           aria-hidden="true"
//                         />
//                         <span
//                           className="font-medium"
//                           style={{ color: isDark ? "#34d399" : "#065f46" }}
//                         >
//                           {selectedOrder.couponCode}
//                         </span>
//                         <span style={{ color: isDark ? "#34d399" : "#047857" }}>
//                           (-₦{selectedOrder.discount?.toLocaleString() || 0})
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                   {selectedOrder.shippingAddress && (
//                     <div
//                       className="rounded-xl p-4"
//                       style={{ background: inputBg }}
//                       role="group"
//                       aria-label="Shipping address"
//                     >
//                       <p
//                         className="text-xs uppercase tracking-wider mb-1"
//                         style={{ color: textMuted }}
//                       >
//                         Shipping Address
//                       </p>
//                       <p
//                         className="text-sm flex items-start gap-2"
//                         style={{ color: textPrimary }}
//                       >
//                         <MapPin
//                           className="w-4 h-4 mt-0.5 shrink-0"
//                           style={{ color: textMuted }}
//                           aria-hidden="true"
//                         />
//                         {selectedOrder.shippingAddress.address},{" "}
//                         {selectedOrder.shippingAddress.city}
//                         {selectedOrder.shippingAddress.postalCode
//                           ? `, ${selectedOrder.shippingAddress.postalCode}`
//                           : ""}
//                         {selectedOrder.shippingAddress.country
//                           ? `, ${selectedOrder.shippingAddress.country}`
//                           : ""}
//                       </p>
//                     </div>
//                   )}
//                   <div role="group" aria-label="Order items">
//                     <h3
//                       className="font-semibold mb-3 flex items-center gap-2"
//                       style={{ color: textPrimary }}
//                     >
//                       <Package
//                         className="w-4 h-4"
//                         style={{ color: "#e8622a" }}
//                         aria-hidden="true"
//                       />
//                       Items
//                     </h3>
//                     <div className="space-y-2">
//                       {selectedOrder.orderItems.map((item, i) => (
//                         <div
//                           key={i}
//                           className="flex justify-between items-center text-sm rounded-lg p-3"
//                           style={{ background: inputBg }}
//                         >
//                           <span
//                             className="font-medium"
//                             style={{ color: textPrimary }}
//                           >
//                             {item.name}
//                           </span>
//                           <span style={{ color: textMuted }}>
//                             {item.qty} × ₦{item.price.toLocaleString()}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   <div
//                     className="flex justify-between items-center pt-4 border-t"
//                     style={{ borderColor: cardBorder }}
//                     role="group"
//                     aria-label="Order total"
//                   >
//                     <span
//                       className="font-semibold text-lg"
//                       style={{ color: textPrimary }}
//                     >
//                       Total
//                     </span>
//                     <span
//                       className="text-2xl font-bold"
//                       style={{ color: "#e8622a" }}
//                     >
//                       ₦{selectedOrder.totalPrice.toLocaleString()}
//                     </span>
//                   </div>
//                   {selectedOrder.status !== "Delivered" &&
//                     selectedOrder.status !== "Cancelled" && (
//                       <div className="flex items-center gap-3 pt-2">
//                         <label
//                           htmlFor={`modal-status-${selectedOrder._id}`}
//                           className="text-sm"
//                           style={{ color: textSecondary }}
//                         >
//                           Update Status:
//                         </label>
//                         <select
//                           id={`modal-status-${selectedOrder._id}`}
//                           value={selectedOrder.status}
//                           onChange={(e) => {
//                             handleStatusChange(
//                               selectedOrder._id,
//                               e.target.value,
//                             );
//                             setSelectedOrder({
//                               ...selectedOrder,
//                               status: e.target.value,
//                             });
//                           }}
//                           className="px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer outline-none transition-all"
//                           style={{
//                             background: statusColors(selectedOrder.status).bg,
//                             color: statusColors(selectedOrder.status).text,
//                           }}
//                         >
//                           {ALL_STATUSES.filter((s) =>
//                             STATUS_FLOW[selectedOrder.status]?.includes(s),
//                           ).map((s) => (
//                             <option key={s} value={s}>
//                               {s}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )}
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </AnimatePresence>
//     </main>
//   );
// };

// export default Orders;
