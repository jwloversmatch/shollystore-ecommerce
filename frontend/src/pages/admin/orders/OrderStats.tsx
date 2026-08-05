import { useMemo } from "react";
import { ShoppingBag, CheckCircle, Clock, XCircle } from "lucide-react";
import type { OrderItem } from "./OrdersPage";

interface OrderStatsProps {
  orders: OrderItem[];
  isDark: boolean;
}

const OrderStats = ({ orders, isDark }: OrderStatsProps) => {
  const cardBg = isDark ? "#141414" : "rgba(255,255,255,0.8)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";

  const stats = useMemo(() => ({
    total: orders.length,
    paid: orders.filter(o => o.status === "Paid").length,
    pending: orders.filter(o => o.status === "Pending").length,
    cancelled: orders.filter(o => o.status === "Cancelled").length,
  }), [orders]);

  const items = [
    { title: "Total", value: stats.total, icon: <ShoppingBag className="w-5 h-5" />, color: "#3b82f6", bg: isDark ? "rgba(59,130,246,0.1)" : "#dbeafe" },
    { title: "Paid", value: stats.paid, icon: <CheckCircle className="w-5 h-5" />, color: "#10b981", bg: isDark ? "rgba(16,185,129,0.1)" : "#d1fae5" },
    { title: "Pending", value: stats.pending, icon: <Clock className="w-5 h-5" />, color: "#f59e0b", bg: isDark ? "rgba(245,158,11,0.1)" : "#fef3c7" },
    { title: "Cancelled", value: stats.cancelled, icon: <XCircle className="w-5 h-5" />, color: "#ef4444", bg: isDark ? "rgba(239,68,68,0.1)" : "#fee2e2" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4" role="group" aria-label="Order statistics">
      {items.map((stat, idx) => (
        <div key={idx} className="rounded-2xl shadow-sm border p-4 flex items-center gap-4" style={{ background: cardBg, borderColor: cardBorder }}>
          <div className="p-3 rounded-xl" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
          <div>
            <p className="text-xs uppercase font-bold tracking-widest" style={{ color: textMuted }}>{stat.title}</p>
            <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStats;