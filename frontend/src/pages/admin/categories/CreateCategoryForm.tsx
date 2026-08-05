import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { CategoryTreeNode } from "./CategoriesPage";

const ACCENT = "#e8622a";

interface CreateCategoryFormProps {
  newName: string;
  setNewName: (v: string) => void;
  newParent: string;
  setNewParent: (v: string) => void;
  treeData: CategoryTreeNode[];
  renderTreeOptions: (nodes: CategoryTreeNode[], depth?: number, excludeId?: string) => React.ReactNode[];
  onCreate: () => void;
  onCancel: () => void;
  isDark: boolean;
}

const CreateCategoryForm = ({ newName, setNewName, newParent, setNewParent, treeData, renderTreeOptions, onCreate, onCancel, isDark }: CreateCategoryFormProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const inputCls = `flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all border focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15`;

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden" role="region" aria-label="Create category form">
      <div className="relative rounded-2xl p-4 md:p-5" style={{ background: cardBg, border: `1px solid ${ACCENT}40`, boxShadow: `0 0 0 1px ${ACCENT}20, 0 8px 32px rgba(0,0,0,0.4)` }}>
        <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-3" style={{ color: ACCENT }}>New Category</p>
        <div className="space-y-3">
          <label htmlFor="new-category-name" className="sr-only">Category name</label>
          <input id="new-category-name" type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name (e.g., Soft Drinks)" className={inputCls} autoFocus style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} onKeyDown={e => { if (e.key === "Enter") onCreate(); if (e.key === "Escape") onCancel(); }} />
          <label htmlFor="new-category-parent" className="sr-only">Parent category</label>
          <select id="new-category-parent" value={newParent} onChange={e => setNewParent(e.target.value)} className={`${inputCls} cursor-pointer`} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} aria-label="Select parent category">
            <option value="">Top‑level (no parent)</option>
            {renderTreeOptions(treeData)}
          </select>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onCreate} className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-white text-sm" style={{ background: ACCENT }}><Check className="w-4 h-4" /> Save</button>
          <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold transition-colors text-sm" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}><X className="w-4 h-4" /> Cancel</button>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateCategoryForm;