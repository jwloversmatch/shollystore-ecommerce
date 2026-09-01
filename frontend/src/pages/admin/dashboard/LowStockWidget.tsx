import { Package, Plus } from "lucide-react";
import type { ProductItem } from "../../../types/home";

interface Props {
  products: ProductItem[];
  onRestock: (id: string, current: number, delta: number) => void;
  isDark: boolean;
}

const LowStockWidget = ({ products, onRestock, isDark }: Props) => {
  const threshold = 5;
  const lowItems = products.filter((p) => (p.stock ?? 0) < threshold);

  const bg = isDark ? "#141414" : "#fff";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const accent = "#e8622a";

  if (lowItems.length === 0) {
    return (
      <div className="rounded-2xl p-5" style={{ background: bg, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5" style={{ color: accent }} />
          <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Low Stock</h2>
        </div>
        <p className="text-sm" style={{ color: textMuted }}>All products are sufficiently stocked.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5" style={{ color: accent }} />
        <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Low Stock Alerts</h2>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
          {lowItems.length} items
        </span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {lowItems.map((product) => (
          <div key={product._id} className="flex items-center justify-between p-2 rounded-xl" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
            <span className="text-sm font-semibold truncate max-w-[140px]" style={{ color: textPrimary }}>{product.name}</span>
            <span className="text-xs font-bold" style={{ color: "#f87171" }}>{product.stock ?? 0} left</span>
            <button
              onClick={() => onRestock(product._id, product.stock ?? 0, 10)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}
              aria-label={`Add 10 to ${product.name}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockWidget;