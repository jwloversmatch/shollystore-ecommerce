import { Edit2, Trash2, Mail, Minus, Plus, Package } from "lucide-react";
import { getCloudinaryUrl } from "../../../utils/cloudinary";
import type { ProductItem } from "../../../types/home";

const ACCENT = "#e8622a";
const PLACEHOLDER = "https://via.placeholder.com/150";

const getCategoryName = (cat: ProductItem["category"]): string => {
  if (!cat) return "";
  return typeof cat === "string" ? cat : cat.name;
};

interface ProductTableProps {
  products: ProductItem[];
  onEdit: (product: ProductItem) => void;
  onDelete: (id: string) => void;
  onMarketing: (product: ProductItem) => void;
  onStockUpdate: (id: string, cur: number, delta: number) => void;
  isDark: boolean;
}

const ProductTable = ({ products, onEdit, onDelete, onMarketing, onStockUpdate, isDark }: ProductTableProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const theadBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: `${ACCENT}40 transparent` }}>
        <table className="w-full text-left" aria-label="Products list">
          <caption className="sr-only">List of all products with details and actions</caption>
          <thead className="sticky top-0 z-10" style={{ background: theadBg, borderBottom: `1px solid ${tableBorder}` }}>
            <tr>
              {["Image", "Name", "Price", "Stock", "Category", "Actions"].map((h, i) => (
                <th key={h} scope="col" className={`px-4 sm:px-5 py-3.5 text-[9px] font-extrabold uppercase tracking-widest ${i === 5 ? "text-right" : ""}`} style={{ color: textMuted }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <Package className="w-10 h-10 mx-auto mb-3" style={{ color: textMuted }} aria-hidden="true" />
                  <p className="text-sm font-semibold" style={{ color: textMuted }}>No products found.</p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  style={{ borderColor: tableBorder }}
                    className="border-t transition-colors group hover:bg-white/[0.015]"
                >
                  <td className="px-4 sm:px-5 py-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: inputBorder }}>
                      <img
                        src={getCloudinaryUrl(product.images?.[0] || PLACEHOLDER, 100)}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 sm:px-5 py-3">
                    <p className="font-bold text-sm max-w-[180px] truncate" style={{ color: textPrimary }}>{product.name}</p>
                  </td>
                  <td className="px-4 sm:px-5 py-3">
                    <span className="font-black text-sm" style={{ color: ACCENT }}>₦{product.price.toLocaleString()}</span>
                  </td>
                  <td className="px-4 sm:px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center rounded-xl overflow-hidden" style={{ background: inputBg, border: `1px solid ${inputBorder}` }} role="group" aria-label={`Stock for ${product.name}: ${product.stock ?? 0}`}>
                        <button onClick={() => onStockUpdate(product._id, product.stock ?? 0, -1)} className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors" aria-label={`Decrease stock of ${product.name}`}><Minus className="w-3 h-3" aria-hidden="true" /></button>
                        <span className={`w-8 text-center text-sm font-black ${(product.stock ?? 0) < 5 ? "text-red-400" : ""}`} style={{ color: (product.stock ?? 0) < 5 ? "#f87171" : textPrimary }} aria-live="polite">{product.stock ?? 0}</span>
                        <button onClick={() => onStockUpdate(product._id, product.stock ?? 0, 1)} className="w-7 h-7 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors" aria-label={`Increase stock of ${product.name}`}><Plus className="w-3 h-3" aria-hidden="true" /></button>
                      </div>
                      {(product.stock ?? 0) < 5 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>Low</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-5 py-3">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: `${ACCENT}14`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                      {getCategoryName(product.category)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(product)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }} aria-label={`Edit ${product.name}`}><Edit2 className="w-3.5 h-3.5" aria-hidden="true" /></button>
                      <button onClick={() => onDelete(product._id)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors" style={{ background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.18)" }} aria-label={`Delete ${product.name}`}><Trash2 className="w-3.5 h-3.5" aria-hidden="true" /></button>
                      <button onClick={() => onMarketing(product)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }} aria-label={`Notify customers about ${product.name}`}><Mail className="w-3.5 h-3.5" aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;