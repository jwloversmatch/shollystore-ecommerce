import { Search } from "lucide-react";

const STATUS_OPTIONS = ["All", "Pending", "Paid", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_OPTIONS = ["All", "paystack", "bank_transfer", "whatsapp"];
const PAYMENT_LABELS: Record<string, string> = { paystack: "Paystack", bank_transfer: "Bank Transfer", whatsapp: "WhatsApp" };

interface OrderFiltersProps {
  statusFilter: string; setStatusFilter: (v: string) => void;
  paymentFilter: string; setPaymentFilter: (v: string) => void;
  searchTerm: string; setSearchTerm: (v: string) => void;
  startDate: string; setStartDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  onClear: () => void;
  isDark: boolean;
}

const OrderFilters = ({ statusFilter, setStatusFilter, paymentFilter, setPaymentFilter, searchTerm, setSearchTerm, startDate, setStartDate, endDate, setEndDate, onClear, isDark }: OrderFiltersProps) => {
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textPrimary = isDark ? "#fff" : "#1f2937";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#fff";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const filterBg = isDark ? "#141414" : "rgba(255,255,255,0.8)";

  return (
    <div id="filters-panel" role="region" aria-label="Order filters" className="rounded-2xl shadow-sm border p-4 sm:p-6 overflow-hidden" style={{ background: filterBg, borderColor: cardBorder }}>
      <div className="flex flex-wrap gap-3 sm:gap-4 items-end">
        <div className="flex-1 min-w-[120px]">
          <label htmlFor="filter-status" className="block text-xs font-medium mb-1" style={{ color: textSecondary }}>Status</label>
          <select id="filter-status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full border rounded-xl px-3 py-2 outline-none text-sm" style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label htmlFor="filter-payment" className="block text-xs font-medium mb-1" style={{ color: textSecondary }}>Payment</label>
          <select id="filter-payment" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="w-full border rounded-xl px-3 py-2 outline-none text-sm" style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}>{PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p === "All" ? "All" : PAYMENT_LABELS[p]}</option>)}</select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label htmlFor="filter-search" className="block text-xs font-medium mb-1" style={{ color: textSecondary }}>Search Email</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textMuted }} />
            <input id="filter-search" type="text" placeholder="Search email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none text-sm" style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} />
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <label htmlFor="filter-start-date" className="block text-xs font-medium mb-1" style={{ color: textSecondary }}>From</label>
            <input id="filter-start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded-xl px-3 py-2 outline-none text-sm" style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} />
          </div>
          <div>
            <label htmlFor="filter-end-date" className="block text-xs font-medium mb-1" style={{ color: textSecondary }}>To</label>
            <input id="filter-end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded-xl px-3 py-2 outline-none text-sm" style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} />
          </div>
        </div>
        <button onClick={onClear} className="px-4 py-2 rounded-xl transition text-sm font-medium" style={{ background: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2", color: "#f87171" }}>Clear Filters</button>
      </div>
    </div>
  );
};

export default OrderFilters;