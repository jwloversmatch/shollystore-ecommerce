import { TrendingUp } from "lucide-react";
import { getCloudinaryUrl } from "../../../utils/cloudinary";

const ACCENT = "#e8622a";

interface TopProduct {
  _id: string; name: string; images: string[]; price: number;
  totalQuantity: number; totalRevenue: number;
}

interface TopProductsListProps {
  products: TopProduct[];
  isDark: boolean;
}

const TopProductsList = ({ products, isDark }: TopProductsListProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const sectionBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
      <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor: sectionBorder }}>
        <h2 className="font-black flex items-center gap-2" style={{ color: textPrimary }}><TrendingUp className="w-4 h-4" style={{ color: ACCENT }} /> Top Selling</h2>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: textMuted }}>By orders</span>
      </div>
      <div className="p-4 space-y-2.5">
        {products.length === 0 ? (
          <p className="text-center py-14 text-sm" style={{ color: textMuted }}>No sales data yet.</p>
        ) : products.map((p, idx) => (
          <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0" style={{ background: `${ACCENT}18`, color: ACCENT }} aria-label={`Rank ${idx+1}`}>{idx+1}</div>
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <img src={getCloudinaryUrl(p.images?.[0] || "https://via.placeholder.com/40", 80)} alt={p.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.src="https://via.placeholder.com/40"; }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: textPrimary }}>{p.name}</p>
              <p className="text-xs" style={{ color: textMuted }}>{p.totalQuantity} units sold</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-black text-sm" style={{ color: textPrimary }}>₦{p.price.toLocaleString()}</p>
              <p className="text-[10px]" style={{ color: textMuted }}>₦{p.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProductsList;