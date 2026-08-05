import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Plus } from "lucide-react";

const ACCENT = "#e8622a";

interface CategoriesHeaderProps {
  categoriesCount: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onAddCategory: () => void;
  isDark: boolean;
}

const CategoriesHeader = ({ categoriesCount, onExpandAll, onCollapseAll, onAddCategory, isDark }: CategoriesHeaderProps) => {
  const navigate = useNavigate();
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin")} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }} aria-label="Back to admin dashboard">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Flame className="w-3 h-3" style={{ color: ACCENT }} />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Admin</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-black leading-none" style={{ color: textPrimary }}>Categories</h1>
          <p className="text-xs mt-0.5" style={{ color: textMuted }} aria-live="polite">{categoriesCount} categories · Organise your products</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onExpandAll} className="px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", borderColor: inputBorder, color: textPrimary }}>Expand All</button>
        <button onClick={onCollapseAll} className="px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", borderColor: inputBorder, color: textPrimary }}>Collapse All</button>
        <button onClick={onAddCategory} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shrink-0" style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}><Plus className="w-4 h-4" /> Add Category</button>
      </div>
    </header>
  );
};

export default CategoriesHeader;