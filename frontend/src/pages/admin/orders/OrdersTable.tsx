import { ChevronLeft, ChevronRight, Phone, Eye, Ticket } from "lucide-react";
import type { OrderItem } from "./OrdersPage";

const PAYMENT_LABELS: Record<string, string> = { paystack: "Paystack", bank_transfer: "Bank Transfer", whatsapp: "WhatsApp" };
const ALL_STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"];
const STATUS_FLOW: Record<string, string[]> = { Pending: ["Pending","Paid","Cancelled"], Paid: ["Paid","Shipped"], Shipped: ["Shipped","Delivered"], Delivered: ["Delivered"], Cancelled: ["Cancelled"] };

interface OrdersTableProps {
  orders: OrderItem[];
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onStatusChange: (id: string, status: string) => void;
  onViewOrder: (order: OrderItem) => void;
  isDark: boolean;
}

const OrdersTable = ({ orders, page, totalPages, onPageChange, onStatusChange, onViewOrder, isDark }: OrdersTableProps) => {
  const cardBg = isDark ? "#141414" : "rgba(255,255,255,0.8)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#1f2937";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const theadBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  const statusColors = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      Pending: { bg: isDark ? "rgba(251,191,36,0.1)" : "#fef3c7", text: isDark ? "#fbbf24" : "#92400e" },
      Paid: { bg: isDark ? "rgba(52,211,153,0.1)" : "#d1fae5", text: isDark ? "#34d399" : "#065f46" },
      Shipped: { bg: isDark ? "rgba(96,165,250,0.1)" : "#dbeafe", text: isDark ? "#60a5fa" : "#1e40af" },
      Delivered: { bg: isDark ? "rgba(156,163,175,0.1)" : "#f3f4f6", text: isDark ? "#9ca3af" : "#374151" },
      Cancelled: { bg: isDark ? "rgba(239,68,68,0.1)" : "#fee2e2", text: isDark ? "#f87171" : "#991b1b" },
    };
    return colors[status] || { bg: isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6", text: textSecondary };
  };

  const headers = ["Customer","Items","Total","Date","Payment","Discount","Status","Details"];

  return (
    <div className="rounded-2xl shadow-sm border overflow-hidden" style={{ background: cardBg, borderColor: cardBorder }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="Orders list">
          <thead style={{ background: theadBg }}>
            <tr>
              {headers.map(h => (
                <th key={h} scope="col" className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider ${h === "Date" || h === "Payment" ? "hidden sm:table-cell" : ""}`} style={{ color: textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const isLocked = order.status === "Delivered" || order.status === "Cancelled";
              const s = statusColors(order.status);
              return (
                <tr key={order._id} className="transition-colors" style={{ borderColor: tableBorder }}>
                  <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">
                    <span className="font-medium" style={{ color: textPrimary }}>{order.user?.name || order.name || "N/A"}</span>
                    <span className="block" style={{ color: textSecondary }}>{order.user?.email}</span>
                    {(order.user?.phone || order.phone) && <span className="flex items-center gap-1 mt-0.5" style={{ color: textMuted }}><Phone className="w-3 h-3" />{order.user?.phone || order.phone}</span>}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm" style={{ color: textSecondary }}>{order.orderItems?.length > 0 ? order.orderItems.map((item, idx) => <span key={idx}>{item.qty}x {item.name}{idx < order.orderItems.length - 1 ? ", " : ""}</span>) : <span style={{ color: textMuted }}>—</span>}</td>
                  <td className="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm" style={{ color: textPrimary }}>₦{order.totalPrice.toLocaleString()}</td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-3 text-xs sm:text-sm" style={{ color: textMuted }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-3 text-xs sm:text-sm" style={{ color: textSecondary }}>{PAYMENT_LABELS[order.paymentMethod || ""] || "—"}</td>
                  <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm">{order.couponCode ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: isDark ? "rgba(16,185,129,0.1)" : "#d1fae5", color: isDark ? "#34d399" : "#065f46" }}><Ticket className="w-3 h-3" />{order.couponCode} (-₦{order.discount?.toLocaleString() || 0})</span> : <span style={{ color: textMuted }}>—</span>}</td>
                  <td className="px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor={`status-${order._id}`} className="sr-only">Status for order {order._id.slice(-8)}</label>
                      <select id={`status-${order._id}`} value={order.status} onChange={e => onStatusChange(order._id, e.target.value)} disabled={isLocked} className="px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border-0 cursor-pointer outline-none transition-all" style={{ background: s.bg, color: s.text, opacity: isLocked ? 0.5 : 1, cursor: isLocked ? "not-allowed" : "pointer" }}>{ALL_STATUSES.map(st => <option key={st} value={st} disabled={!STATUS_FLOW[order.status]?.includes(st)}>{st}</option>)}</select>
                      {order.status === "Pending" && <button onClick={() => onStatusChange(order._id, "Cancelled")} className="text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors whitespace-nowrap" style={{ background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2", color: "#f87171", borderColor: isDark ? "rgba(239,68,68,0.2)" : "#fecaca" }}>✕ Cancel</button>}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <button onClick={() => onViewOrder(order)} className="flex items-center gap-1 text-xs sm:text-sm font-medium" style={{ color: "#e8622a" }}><Eye className="w-4 h-4" /> View</button>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && <tr><td colSpan={8} className="px-4 sm:px-6 py-12 text-center text-sm" style={{ color: textMuted }}>No orders found.</td></tr>}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <nav className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 border-t gap-2" style={{ borderColor: cardBorder }} aria-label="Pagination">
          <span className="text-xs sm:text-sm" style={{ color: textMuted }}>Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => onPageChange(Math.max(page - 1, 1))} disabled={page === 1} className="p-1.5 rounded disabled:opacity-40 transition" style={{ color: textSecondary }}><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => onPageChange(Math.min(page + 1, totalPages))} disabled={page === totalPages} className="p-1.5 rounded disabled:opacity-40 transition" style={{ color: textSecondary }}><ChevronRight className="w-4 h-4" /></button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default OrdersTable;