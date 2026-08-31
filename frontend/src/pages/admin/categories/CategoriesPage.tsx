// frontend/src/pages/admin/categories/CategoriesPage.tsx
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../../features/api/apiSlice";
import toast from "react-hot-toast";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { useTheme } from "../../../context/ThemeContext";
import CategoriesHeader from "./CategoriesHeader";
import CreateCategoryForm from "./CreateCategoryForm";
import CategoryList from "./CategoryList";
import CategoryRowSkeleton from "./CategoryRowSkeleton";

// ─── Constants ─────────────────────────────────────────────────────────────────

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface CategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  parent?: { _id: string; name: string } | null;
  createdAt: string;
  children?: CategoryTreeNode[];
}

// ═══════════════════════════════════════════════════════════════════════════════
const CategoriesPage = () => {
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

  if (isLoading) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto pb-28 md:pb-10 space-y-5 focus:outline-none pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-[calc(80px+env(safe-area-inset-top,0px))] lg:pt-[calc(88px+env(safe-area-inset-top,0px))]"
        style={{ background: bg }}
      >
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
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto pb-28 md:pb-10 space-y-5 focus:outline-none pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-[calc(80px+env(safe-area-inset-top,0px))] lg:pt-[calc(88px+env(safe-area-inset-top,0px))]"
      style={{ background: bg }}
    >
      <ConfirmationModal isOpen={deleteModal} onClose={() => setDeleteModal(false)} onConfirm={confirmDelete} title="Delete Category" message="Are you sure you want to delete this category? This action cannot be undone." confirmText="Delete" cancelText="Cancel" type="danger" />

      {/* Header */}
      <CategoriesHeader
        categoriesCount={categories.length}
        onExpandAll={() => toggleAll(true)}
        onCollapseAll={() => toggleAll(false)}
        onAddCategory={() => { setIsCreating(true); setEditingId(null); }}
        isDark={isDark}
      />

      {/* Create new category */}
      <AnimatePresence>
        {isCreating && (
          <CreateCategoryForm
            newName={newName}
            setNewName={setNewName}
            newParent={newParent}
            setNewParent={setNewParent}
            treeData={treeData}
            renderTreeOptions={renderTreeOptions}
            onCreate={handleCreate}
            onCancel={() => { setIsCreating(false); setNewName(""); setNewParent(""); }}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Category list */}
      <CategoryList
        treeData={treeData}
        categories={categories}
        editingId={editingId}
        editingName={editingName}
        editingParent={editingParent}
        expandedMap={expandedMap}
        onToggleExpand={toggleExpand}
        onStartEdit={(id, name, parentId) => { setEditingId(id); setEditingName(name); setEditingParent(parentId); setIsCreating(false); }}
        onCancelEdit={() => { setEditingId(null); setEditingName(""); setEditingParent(""); }}
        onSaveEdit={handleUpdate}
        onDeleteClick={(id) => { setToDelete(id); setDeleteModal(true); }}
        onStartCreate={() => setIsCreating(true)}
        renderTreeOptions={renderTreeOptions}
        setEditingName={setEditingName}
        setEditingParent={setEditingParent}
        isDark={isDark}
      />
    </main>
  );
};

export default CategoriesPage;