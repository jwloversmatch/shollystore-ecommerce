import { Calendar, Tag, ChevronRight, ChevronDown, Edit, Trash2, Check, X } from "lucide-react";
import type { CategoryTreeNode } from "./CategoriesPage";

const ACCENT = "#e8622a";

interface CategoryRowProps {
  cat: CategoryTreeNode;
  depth: number;
  isEditing: boolean;
  editingName: string;
  editingParent: string;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggleExpand: (id: string) => void;
  onStartEdit: (id: string, name: string, parentId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onDeleteClick: (id: string) => void;
  renderTreeOptions: (nodes: CategoryTreeNode[], depth?: number, excludeId?: string) => React.ReactNode[];
  setEditingName: (v: string) => void;
  setEditingParent: (v: string) => void;
  isDark: boolean;
}

const CategoryRow = ({
  cat, isEditing, editingName, editingParent, isExpanded, hasChildren,
  onToggleExpand, onStartEdit, onCancelEdit, onSaveEdit, onDeleteClick,
  renderTreeOptions, setEditingName, setEditingParent, isDark,
}: CategoryRowProps) => {
  const parentName = cat.parent?.name || "Top‑level";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const accentBg = `${ACCENT}15`;
  const accentBorder = `${ACCENT}25`;
  const blueBg = "rgba(59,130,246,0.1)";
  const blueText = "#60a5fa";
  const blueBorder = "rgba(59,130,246,0.2)";
  const redBg = "rgba(239,68,68,0.08)";
  const redText = "#f87171";
  const redBorder = "rgba(239,68,68,0.18)";
  const greenBg = "rgba(16,185,129,0.1)";
  const greenText = "#34d399";
  const tagBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const inputCls = `flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all border focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15`;

  if (isEditing) {
    return (
      <div className="p-4 md:p-5" role="group" aria-label={`Editing category: ${cat.name}`}>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2.5" style={{ color: ACCENT }}>Editing</p>
        <div className="space-y-3">
          <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} className={inputCls} autoFocus style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} onKeyDown={e => { if (e.key === "Enter") onSaveEdit(cat._id); if (e.key === "Escape") onCancelEdit(); }} />
          <select value={editingParent} onChange={e => setEditingParent(e.target.value)} className={`${inputCls} cursor-pointer`} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} aria-label="Select parent category">
            <option value="">Top‑level (no parent)</option>
            {renderTreeOptions([], 0, cat._id)}
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => onSaveEdit(cat._id)} className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-white text-sm" style={{ background: ACCENT }}><Check className="w-4 h-4" /> Save</button>
          <button onClick={onCancelEdit} className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold transition-colors text-sm" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}><X className="w-4 h-4" /> Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 md:p-5 group">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {hasChildren && (
          <button onClick={(e) => { e.stopPropagation(); onToggleExpand(cat._id); }} className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 hover:bg-white/5" style={{ color: textMuted, transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }} aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
        {!hasChildren && <div className="w-8" />}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-black" style={{ background: accentBg, color: ACCENT, border: `1px solid ${accentBorder}` }}><Tag className="w-4 h-4" /></div>
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-base truncate" style={{ color: textPrimary }}>{cat.name}</h3>
          <div className="flex items-center gap-2.5 mt-1 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tagBg, color: textMuted }}>/{cat.slug}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: cat.parent ? blueBg : greenBg, color: cat.parent ? blueText : greenText }}>
              {cat.parent ? <><ChevronRight className="w-3 h-3" /> {parentName}</> : <>Top‑level</>}
            </span>
            {cat.createdAt && <span className="text-[10px] flex items-center gap-1 font-medium" style={{ color: textMuted }}><Calendar className="w-3 h-3" />{new Date(cat.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}</span>}
            {hasChildren && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tagBg, color: textMuted, border: `1px solid ${inputBorder}` }}>{cat.children!.length} sub</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-4">
        <button onClick={() => onStartEdit(cat._id, cat.name, cat.parent?._id || "")} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: blueBg, color: blueText, border: `1px solid ${blueBorder}` }} aria-label={`Edit category ${cat.name}`}><Edit className="w-4 h-4" /></button>
        <button onClick={() => onDeleteClick(cat._id)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: redBg, color: redText, border: `1px solid ${redBorder}` }} aria-label={`Delete category ${cat.name}`}><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
};

export default CategoryRow;