import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Plus } from "lucide-react";
import CategoryRow from "./CategoryRow";
import type { CategoryTreeNode } from "./CategoriesPage";

const ACCENT = "#e8622a";

interface CategoryListProps {
  treeData: CategoryTreeNode[];
  categories: CategoryTreeNode[];
  editingId: string | null;
  editingName: string;
  editingParent: string;
  expandedMap: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onStartEdit: (id: string, name: string, parentId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onDeleteClick: (id: string) => void;
  onStartCreate: () => void;
  renderTreeOptions: (nodes: CategoryTreeNode[], depth?: number, excludeId?: string) => React.ReactNode[];
  setEditingName: (v: string) => void;
  setEditingParent: (v: string) => void;
  isDark: boolean;
}

const CategoryList = ({
  treeData, categories, editingId, editingName, editingParent, expandedMap,
  onToggleExpand, onStartEdit, onCancelEdit, onSaveEdit, onDeleteClick, onStartCreate,
  renderTreeOptions, setEditingName, setEditingParent, isDark,
}: CategoryListProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";


  const renderCategoryRows = (nodes: CategoryTreeNode[], depth = 0): React.ReactNode[] => {
    return nodes.map((cat, idx) => {
      const hasChildren = !!(cat.children && cat.children.length > 0);
      const isExpanded = expandedMap[cat._id] ?? false;

      return (
        <React.Fragment key={cat._id}>
          <motion.div layout initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }} transition={{ type: "spring", stiffness: 300, damping: 26, delay: idx * 0.04 }} className="relative rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, marginLeft: depth > 0 ? `${depth * 20}px` : "0px" }} role="listitem">
            <CategoryRow
              cat={cat}
              depth={depth}
              isEditing={editingId === cat._id}
              editingName={editingName}
              editingParent={editingParent}
              isExpanded={isExpanded}
              hasChildren={hasChildren}
              onToggleExpand={onToggleExpand}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onDeleteClick={onDeleteClick}
              renderTreeOptions={renderTreeOptions}
              setEditingName={setEditingName}
              setEditingParent={setEditingParent}
              isDark={isDark}
            />
          </motion.div>
          {hasChildren && isExpanded && renderCategoryRows(cat.children!, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="space-y-3" role="list" aria-label="Category list">
      {!categories.length ? (
        <div className="relative rounded-2xl p-10 text-center" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}12`, boxShadow: `0 0 0 3px ${ACCENT}` }}>
                <FolderOpen className="w-9 h-9" style={{ color: ACCENT }} />
              </div>
            </div>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2" style={{ color: ACCENT }}>Empty</p>
          <h2 className="text-xl font-black mb-2" style={{ color: textPrimary }}>No categories yet</h2>
          <p className="text-sm mb-6" style={{ color: textMuted }}>Create your first category to start organising products.</p>
          <button onClick={onStartCreate} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}><Plus className="w-4 h-4" /> Create First Category</button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {renderCategoryRows(treeData)}
        </AnimatePresence>
      )}
    </div>
  );
};

export default CategoryList;