import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../features/api/apiSlice";
import {
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ArrowLeft,
  FolderOpen,
  Calendar,
  Flame,
  Tag,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";
import { DarkCardSkeleton } from "../../components/Skeletons";
import { useTheme } from "../../context/ThemeContext";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  parent?: { _id: string; name: string } | null;
  createdAt: string;
  children?: CategoryTreeNode[];
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const CategoryRowSkeleton = ({ isDark }: { isDark: boolean }) => (
  <DarkCardSkeleton>
    <div className="flex items-center justify-between p-4 md:p-5" role="status" aria-label="Loading category">
      <span className="sr-only">Loading...</span>
      <div className="flex items-center gap-3.5 flex-1">
        <div className="w-11 h-11 rounded-xl shrink-0 animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 rounded-lg animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 rounded-full animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
            <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
        <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: isDark ? "#1c1c1c" : "#e5e7eb" }} />
      </div>
    </div>
  </DarkCardSkeleton>
);

// ═══════════════════════════════════════════════════════════════════════════════
const Categories = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: treeData = [], isLoading, refetch } = useGetCategoryTreeQuery({});

  const flattenCategories = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
    return nodes.reduce<CategoryTreeNode[]>((acc, node) => {
      acc.push(node);
      if (node.children && node.children.length > 0) {
        acc.push(...flattenCategories(node.children));
      }
      return acc;
    }, []);
  };
  const categories = flattenCategories(treeData);

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingParent, setEditingParent] = useState<string>("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // Theme styles
  const bg = isDark ? "#0A0A0B" : "#FCFAF5";
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
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

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (expand: boolean) => {
    const getAllParentIds = (nodes: CategoryTreeNode[]): string[] => {
      let ids: string[] = [];
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          ids.push(node._id);
          ids = ids.concat(getAllParentIds(node.children));
        }
      });
      return ids;
    };
    const allParentIds = getAllParentIds(treeData);
    const newMap: Record<string, boolean> = {};
    allParentIds.forEach((id) => { newMap[id] = expand; });
    setExpandedMap(newMap);
  };

  const renderTreeOptions = (nodes: CategoryTreeNode[], depth = 0, excludeId?: string): React.ReactNode[] => {
    return nodes.reduce<React.ReactNode[]>((acc, node) => {
      if (node._id !== excludeId) {
        acc.push(<option key={node._id} value={node._id}>{'— '.repeat(depth)}{node.name}</option>);
        if (node.children && node.children.length > 0) {
          acc.push(...renderTreeOptions(node.children, depth + 1, excludeId));
        }
      }
      return acc;
    }, []);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory({ name: newName, parent: newParent || null }).unwrap();
      setNewName(""); setNewParent(""); setIsCreating(false);
      refetch();
      toast.success("Category created");
    } catch (err) {
      const e = err as { data?: { message: string } };
      toast.error(e.data?.message || "Failed to create category");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await updateCategory({ id, name: editingName, parent: editingParent || null }).unwrap();
      setEditingId(null); setEditingName(""); setEditingParent("");
      refetch();
      toast.success("Category updated");
    } catch (err) {
      const e = err as { data?: { message: string } };
      toast.error(e.data?.message || "Failed to update category");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCategory(toDelete).unwrap();
      refetch();
      toast.success("Category deleted");
    } catch (err) {
      const e = err as { data?: { message: string } };
      toast.error(e.data?.message || "Failed to delete category");
    } finally {
      setDeleteModal(false); setToDelete(null);
    }
  };

  const renderCategoryRows = (nodes: CategoryTreeNode[], depth = 0) => {
    return nodes.map((cat, idx) => {
      const parentName = cat.parent?.name || "Top‑level";
      const hasChildren = !!(cat.children && cat.children.length > 0);
      const isExpanded = expandedMap[cat._id] ?? false;

      return (
        <React.Fragment key={cat._id}>
          <motion.div
            layout
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 300, damping: 26, delay: idx * 0.04 }}
            className="relative rounded-2xl overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, marginLeft: depth > 0 ? `${depth * 20}px` : "0px" }}
            role="listitem"
          >
            {editingId === cat._id ? (
              <div className="p-4 md:p-5" role="group" aria-label={`Editing category: ${cat.name}`}>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2.5" style={{ color: ACCENT }}>Editing</p>
                <div className="space-y-3">
                  <label htmlFor={`edit-category-name-${cat._id}`} className="sr-only">Category name</label>
                  <input id={`edit-category-name-${cat._id}`} type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className={inputCls} autoFocus style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(cat._id); if (e.key === "Escape") { setEditingId(null); setEditingName(""); } }} />
                  <label htmlFor={`edit-category-parent-${cat._id}`} className="sr-only">Parent category</label>
                  <select id={`edit-category-parent-${cat._id}`} value={editingParent} onChange={(e) => setEditingParent(e.target.value)} className={`${inputCls} cursor-pointer`} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} aria-label="Select parent category">
                    <option value="">Top‑level (no parent)</option>
                    {renderTreeOptions(treeData, 0, cat._id)}
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleUpdate(cat._id)} className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-white text-sm" style={{ background: ACCENT }} aria-label={`Save changes to ${cat.name}`}><Check className="w-4 h-4" aria-hidden="true" /> Save</button>
                  <button onClick={() => { setEditingId(null); setEditingName(""); setEditingParent(""); }} className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold transition-colors text-sm" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}><X className="w-4 h-4" aria-hidden="true" /> Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 md:p-5 group">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {hasChildren && (
                    <button onClick={(e) => { e.stopPropagation(); toggleExpand(cat._id); }} className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 hover:bg-white/5" style={{ color: textMuted, transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }} aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}>
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                  {!hasChildren && <div className="w-8" />}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-black" style={{ background: accentBg, color: ACCENT, border: `1px solid ${accentBorder}` }} aria-hidden="true"><Tag className="w-4 h-4" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-base truncate" style={{ color: textPrimary }}>{cat.name}</h3>
                    <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tagBg, color: textMuted }}>/{cat.slug}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: cat.parent ? blueBg : greenBg, color: cat.parent ? blueText : greenText }}>
                        {cat.parent ? <><ChevronRight className="w-3 h-3" aria-hidden="true" /> {parentName}</> : <>Top‑level</>}
                      </span>
                      {cat.createdAt && (
                        <span className="text-[10px] flex items-center gap-1 font-medium" style={{ color: textMuted }}><Calendar className="w-3 h-3" aria-hidden="true" />{new Date(cat.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}</span>
                      )}
                      {hasChildren && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: tagBg, color: textMuted, border: `1px solid ${inputBorder}` }}>{cat.children!.length} sub</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-4">
                  <button onClick={() => { setEditingId(cat._id); setEditingName(cat.name); setEditingParent(cat.parent?._id || ""); setIsCreating(false); }} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: blueBg, color: blueText, border: `1px solid ${blueBorder}` }} aria-label={`Edit category ${cat.name}`}><Edit className="w-4 h-4" aria-hidden="true" /></button>
                  <button onClick={() => { setToDelete(cat._id); setDeleteModal(true); }} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ background: redBg, color: redText, border: `1px solid ${redBorder}` }} aria-label={`Delete category ${cat.name}`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                </div>
              </div>
            )}
          </motion.div>
          {hasChildren && isExpanded && renderCategoryRows(cat.children!, depth + 1)}
        </React.Fragment>
      );
    });
  };

  if (isLoading) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen p-4 md:p-6 pt-16 md:pt-24 max-w-4xl mx-auto pb-28 md:pb-10 space-y-5 focus:outline-none" style={{ background: bg }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: cardBg }} />
            <div className="space-y-1.5">
              <div className="h-4 w-16 rounded animate-pulse" style={{ background: cardBg }} />
              <div className="h-7 w-36 rounded-lg animate-pulse" style={{ background: cardBg }} />
            </div>
          </div>
          <div className="h-10 w-36 rounded-xl animate-pulse" style={{ background: cardBg }} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <CategoryRowSkeleton key={i} isDark={isDark} />)}
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen p-4 md:p-6 pt-16 md:pt-24 max-w-4xl mx-auto pb-28 md:pb-10 space-y-5 focus:outline-none" style={{ background: bg }}>
      <ConfirmationModal isOpen={deleteModal} onClose={() => setDeleteModal(false)} onConfirm={confirmDelete} title="Delete Category" message="Are you sure you want to delete this category? This action cannot be undone." confirmText="Delete" cancelText="Cancel" type="danger" />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin")} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }} aria-label="Back to admin dashboard"><ArrowLeft className="w-5 h-5" aria-hidden="true" /></button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame className="w-3 h-3" style={{ color: ACCENT }} aria-hidden="true" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Admin</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black leading-none" style={{ color: textPrimary }}>Categories</h1>
            <p className="text-xs mt-0.5" style={{ color: textMuted }} aria-live="polite">{categories.length} categories · Organise your products</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toggleAll(true)} className="px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", borderColor: inputBorder, color: textPrimary }} aria-label="Expand all categories">Expand All</button>
          <button onClick={() => toggleAll(false)} className="px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", borderColor: inputBorder, color: textPrimary }} aria-label="Collapse all categories">Collapse All</button>
          <button onClick={() => { setIsCreating(true); setEditingId(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shrink-0" style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }} aria-label="Add new category"><Plus className="w-4 h-4" aria-hidden="true" /> Add Category</button>
        </div>
      </header>

      {/* Create new category */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden" role="region" aria-label="Create category form">
            <div className="relative rounded-2xl p-4 md:p-5" style={{ background: cardBg, border: `1px solid ${ACCENT}40`, boxShadow: `0 0 0 1px ${ACCENT}20, 0 8px 32px rgba(0,0,0,0.4)` }}>
              <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-3" style={{ color: ACCENT }}>New Category</p>
              <div className="space-y-3">
                <label htmlFor="new-category-name" className="sr-only">Category name</label>
                <input id="new-category-name" type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Category name (e.g., Soft Drinks)" className={inputCls} autoFocus style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setIsCreating(false); setNewName(""); } }} />
                <label htmlFor="new-category-parent" className="sr-only">Parent category</label>
                <select id="new-category-parent" value={newParent} onChange={(e) => setNewParent(e.target.value)} className={`${inputCls} cursor-pointer`} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} aria-label="Select parent category">
                  <option value="">Top‑level (no parent)</option>
                  {renderTreeOptions(treeData)}
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleCreate} className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-white text-sm" style={{ background: ACCENT }}><Check className="w-4 h-4" aria-hidden="true" /> Save</button>
                <button onClick={() => { setIsCreating(false); setNewName(""); setNewParent(""); }} className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold transition-colors text-sm" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}><X className="w-4 h-4" aria-hidden="true" /> Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category list */}
      <div className="space-y-3" role="list" aria-label="Category list">
        {!categories.length ? (
          <div className="relative rounded-2xl p-10 text-center" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}12`, boxShadow: `0 0 0 3px ${ACCENT}` }}><FolderOpen className="w-9 h-9" style={{ color: ACCENT }} aria-hidden="true" /></div>
              </div>
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2" style={{ color: ACCENT }}>Empty</p>
            <h2 className="text-xl font-black mb-2" style={{ color: textPrimary }}>No categories yet</h2>
            <p className="text-sm mb-6" style={{ color: textMuted }}>Create your first category to start organising products.</p>
            <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm" style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}><Plus className="w-4 h-4" aria-hidden="true" /> Create First Category</button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {renderCategoryRows(treeData)}
          </AnimatePresence>
        )}
      </div>
    </main>
  );
};

export default Categories;