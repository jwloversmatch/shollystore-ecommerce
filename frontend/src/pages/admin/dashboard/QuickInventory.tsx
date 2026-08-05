import { Package, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { getCloudinaryUrl } from "../../../utils/cloudinary";
import type { ProductItem } from "../../../types/home";

const ACCENT = "#e8622a";

const getCategoryName = (cat: ProductItem["category"]): string => {
  if (!cat) return "Uncategorized";
  return typeof cat === "string" ? cat : cat.name;
};

interface QuickInventoryProps {
  products: ProductItem[];
  onStockUpdate: (id: string, cur: number, delta: number) => void;
  onDelete: (id: string) => void;
  onViewAll: () => void;
  isDark: boolean;
}

const QuickInventory = ({ products, onStockUpdate, onDelete, onViewAll, isDark }: QuickInventoryProps) => {
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
        <h2 className="font-black flex items-center gap-2" style={{ color: textPrimary }}><Package className="w-4 h-4" style={{ color: ACCENT }} /> Quick Inventory</h2>
        <button onClick={onViewAll} className="text-xs font-bold flex items-center gap-1 hover:opacity-75 transition-opacity" style={{ color: ACCENT }}>View all <ArrowRight className="w-3 h-3" /></button>
      </div>
      <div className="p-4 space-y-2 max-h-72 overflow-y-auto" style={{ scrollbarWidth:"thin", scrollbarColor:`${ACCENT}40 transparent` }}>
        {products.map(p => (
          <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border" style={{ borderColor: inputBorder }}>
              <img src={getCloudinaryUrl(p.images?.[0] || "https://via.placeholder.com/40", 80)} alt={p.name} className="w-full h-full object-cover" onError={e => { e.currentTarget.src="https://via.placeholder.com/40"; }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: textPrimary }}>{p.name}</p>
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background:`${ACCENT}15`, color:ACCENT }}>{getCategoryName(p.category)}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0" role="group" aria-label={`Stock for ${p.name}: ${p.stock ?? 0}`}>
              <div className="flex items-center rounded-xl overflow-hidden" style={{ background: isDark ? "#111" : "#e5e7eb", border: `1px solid ${inputBorder}` }}>
                <button onClick={() => onStockUpdate(p._id, p.stock ?? 0, -1)} className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors" aria-label={`Decrease stock of ${p.name}`}><Minus className="w-3 h-3" /></button>
                <span className={`w-8 text-center text-xs font-black ${(p.stock??0)<5?"text-red-400":""}`} style={{ color: (p.stock??0)<5 ? "#f87171" : textPrimary }} aria-live="polite">{p.stock ?? 0}</span>
                <button onClick={() => onStockUpdate(p._id, p.stock ?? 0, 1)} className="w-7 h-7 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors" aria-label={`Increase stock of ${p.name}`}><Plus className="w-3 h-3" /></button>
              </div>
              {(p.stock??0) < 5 && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold" style={{ background:"rgba(239,68,68,0.12)", color:"#f87171" }}>Low</span>}
              <button onClick={() => onDelete(p._id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:text-red-400 transition-colors" style={{ color: textMuted }} aria-label={`Delete ${p.name}`}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickInventory;