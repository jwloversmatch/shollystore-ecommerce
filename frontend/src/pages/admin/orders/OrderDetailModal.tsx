import { X, Calendar, CreditCard, Phone, MapPin, Package, Ticket } from "lucide-react";
import type { OrderItem } from "./OrdersPage";

const PAYMENT_LABELS: Record<string, string> = { paystack: "Paystack", bank_transfer: "Bank Transfer", whatsapp: "WhatsApp" };
const ALL_STATUSES = ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"];
const STATUS_FLOW: Record<string, string[]> = { Pending: ["Pending","Paid","Cancelled"], Paid: ["Paid","Shipped"], Shipped: ["Shipped","Delivered"], Delivered: ["Delivered"], Cancelled: ["Cancelled"] };

interface OrderDetailModalProps {
  order: OrderItem;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  modalRef: React.RefObject<HTMLDivElement | null>;
  isDark: boolean;
}

const OrderDetailModal = ({ order, onClose, onStatusChange, modalRef, isDark }: OrderDetailModalProps) => {
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const modalBg = isDark ? "#141414" : "#fff";
  const modalOverlay = isDark ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.4)";
  const textPrimary = isDark ? "#fff" : "#1f2937";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";

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

  const s = statusColors(order.status);

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: modalOverlay, backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
        <div ref={modalRef} className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border" style={{ background: modalBg, borderColor: cardBorder }}>
          <div className="sticky top-0 p-4 sm:p-6 border-b flex justify-between items-center" style={{ background: modalBg, borderColor: cardBorder }}>
            <h2 id="order-detail-title" className="text-xl font-bold" style={{ color: textPrimary }}>Order #{order._id.slice(-8).toUpperCase()}</h2>
            <button onClick={onClose} className="p-2 rounded-xl transition" style={{ color: textSecondary }}><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.text }}>{order.status}</span>
              <span className="text-sm flex items-center gap-1" style={{ color: textMuted }}><Calendar className="w-4 h-4" />{new Date(order.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</span>
              {order.paymentMethod && <span className="text-sm flex items-center gap-1" style={{ color: textMuted }}><CreditCard className="w-4 h-4" />{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>}
            </div>
            <div className="rounded-xl p-4" style={{ background: inputBg }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: textMuted }}>Customer</p>
              <p className="font-medium" style={{ color: textPrimary }}>{order.user?.name || order.name || "N/A"}</p>
              <p className="text-sm" style={{ color: textSecondary }}>{order.user?.email}</p>
              {(order.user?.phone || order.phone) && <p className="text-sm flex items-center gap-1" style={{ color: textSecondary }}><Phone className="w-3.5 h-3.5" />{order.user?.phone || order.phone}</p>}
            </div>
            {order.couponCode && (
              <div className="rounded-xl p-4 border" style={{ background: isDark ? "rgba(16,185,129,0.1)" : "#d1fae5", borderColor: isDark ? "rgba(16,185,129,0.2)" : "#a7f3d0" }}>
                <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: isDark ? "#34d399" : "#065f46" }}>Discount Applied</p>
                <div className="flex items-center gap-2"><Ticket className="w-5 h-5" style={{ color: isDark ? "#34d399" : "#059669" }} /><span className="font-medium" style={{ color: isDark ? "#34d399" : "#065f46" }}>{order.couponCode}</span><span style={{ color: isDark ? "#34d399" : "#047857" }}>(-₦{order.discount?.toLocaleString() || 0})</span></div>
              </div>
            )}
            {order.shippingAddress && (
              <div className="rounded-xl p-4" style={{ background: inputBg }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: textMuted }}>Shipping Address</p>
                <p className="text-sm flex items-start gap-2" style={{ color: textPrimary }}><MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: textMuted }} />{order.shippingAddress.address}, {order.shippingAddress.city}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: textPrimary }}><Package className="w-4 h-4" style={{ color: "#e8622a" }} />Items</h3>
              <div className="space-y-2">{order.orderItems.map((item, i) => <div key={i} className="flex justify-between items-center text-sm rounded-lg p-3" style={{ background: inputBg }}><span className="font-medium" style={{ color: textPrimary }}>{item.name}</span><span style={{ color: textMuted }}>{item.qty} × ₦{item.price.toLocaleString()}</span></div>)}</div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: cardBorder }}>
              <span className="font-semibold text-lg" style={{ color: textPrimary }}>Total</span>
              <span className="text-2xl font-bold" style={{ color: "#e8622a" }}>₦{order.totalPrice.toLocaleString()}</span>
            </div>
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <div className="flex items-center gap-3 pt-2">
                <label htmlFor={`modal-status-${order._id}`} className="text-sm" style={{ color: textSecondary }}>Update Status:</label>
                <select id={`modal-status-${order._id}`} value={order.status} onChange={e => { onStatusChange(order._id, e.target.value); }} className="px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer outline-none transition-all" style={{ background: s.bg, color: s.text }}>{ALL_STATUSES.filter(st => STATUS_FLOW[order.status]?.includes(st)).map(st => <option key={st} value={st}>{st}</option>)}</select>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailModal;