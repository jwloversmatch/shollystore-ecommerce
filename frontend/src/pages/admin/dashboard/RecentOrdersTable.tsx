import { ShoppingBag, ArrowRight } from "lucide-react";

const ACCENT = "#e8622a";
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Pending: { bg:"rgba(251,191,36,0.10)", text:"#fbbf24", border:"rgba(251,191,36,0.3)" },
  Paid: { bg:"rgba(52,211,153,0.10)", text:"#34d399", border:"rgba(52,211,153,0.3)" },
  Shipped: { bg:"rgba(96,165,250,0.10)", text:"#60a5fa", border:"rgba(96,165,250,0.3)" },
  Delivered: { bg:"rgba(156,163,175,0.10)", text:"#9ca3af", border:"rgba(156,163,175,0.25)"},
  Cancelled: { bg:"rgba(239,68,68,0.10)", text:"#f87171", border:"rgba(239,68,68,0.3)" },
};
const PAYMENT_LABELS: Record<string, string> = { paystack:"Paystack", bank_transfer:"Bank Transfer", whatsapp:"WhatsApp" };
const STATUS_FLOW: Record<string, string[]> = { Pending:["Pending","Paid","Cancelled"], Paid:["Paid","Shipped"], Shipped:["Shipped","Delivered"], Delivered:["Delivered"], Cancelled:["Cancelled"] };

interface OrderItem { _id:string; user:{email:string}; totalPrice:number; status:string; createdAt?:string; paymentMethod?:string; }

interface RecentOrdersTableProps {
  orders: OrderItem[];
  onStatusChange: (id: string, status: string) => void;
  onViewAll: () => void;
  isDark: boolean;
}

const RecentOrdersTable = ({ orders, onStatusChange, onViewAll, isDark }: RecentOrdersTableProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const theadBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const sectionBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
      <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor: sectionBorder }}>
        <h2 className="font-black flex items-center gap-2" style={{ color: textPrimary }}><ShoppingBag className="w-4 h-4" style={{ color:"#3b82f6" }} /> Recent Orders</h2>
        <button onClick={onViewAll} className="text-xs font-bold flex items-center gap-1 hover:opacity-75 transition-opacity" style={{ color: ACCENT }}>View all <ArrowRight className="w-3 h-3" /></button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="Recent orders">
          <thead style={{ background: theadBg }}>
            <tr>
              {["Customer","Total","Date","Payment","Status"].map(h => (
                <th key={h} scope="col" className="px-3 sm:px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap" style={{ color: textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-t transition-colors" style={{ borderColor: tableBorder }}>
                <td className="px-3 sm:px-5 py-3.5 text-sm max-w-[120px] sm:max-w-[200px] truncate min-w-[0]" style={{ color: textSecondary }}>{order.user?.email}</td>
                <td className="px-3 sm:px-5 py-3.5 text-sm font-black whitespace-nowrap" style={{ color: textPrimary }}>₦{order.totalPrice.toLocaleString()}</td>
                <td className="px-3 sm:px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: textMuted }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"short"}) : "—"}</td>
                <td className="px-3 sm:px-5 py-3.5 whitespace-nowrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: textSecondary }}>{PAYMENT_LABELS[order.paymentMethod||""]||"—"}</span>
                </td>
                <td className="px-3 sm:px-5 py-3.5">
                  <div className="flex items-center gap-2 flex-wrap whitespace-nowrap">
                    <label htmlFor={`status-${order._id}`} className="sr-only">Status for order {order._id.slice(-8)}</label>
                    <select id={`status-${order._id}`} value={order.status} onChange={e => onStatusChange(order._id, e.target.value)} disabled={order.status==="Delivered"||order.status==="Cancelled"}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-xl outline-none cursor-pointer transition-all appearance-none"
                      style={{ background:STATUS_COLORS[order.status]?.bg||"rgba(255,255,255,0.07)", color:STATUS_COLORS[order.status]?.text||"#fff", border:`1px solid ${STATUS_COLORS[order.status]?.border||"rgba(255,255,255,0.1)"}`, opacity:order.status==="Delivered"||order.status==="Cancelled"?0.5:1 }}>
                      {STATUS_FLOW[order.status]?.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {order.status==="Pending" && (
                      <button onClick={() => onStatusChange(order._id,"Cancelled")} className="text-[10px] font-bold px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors whitespace-nowrap" aria-label={`Cancel order ${order._id.slice(-8)}`}>✕ Cancel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: textMuted }}>No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;