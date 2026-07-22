import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetCategoriesQuery, useCreateCategoryMutation,
  useUpdateCategoryMutation, useDeleteCategoryMutation,
} from '../../features/api/apiSlice';
import { Plus, Trash2, Edit, Check, X, ArrowLeft, FolderOpen, Calendar, Flame, Tag, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { DarkCardSkeleton } from '../../components/Skeletons';

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = '#e8622a';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Category {
  _id: string;
  name: string;
  slug: string;
  parent?: { _id: string; name: string } | null;
  createdAt: string;
}

// ─── Input class helper ────────────────────────────────────────────────────────
const inputCls =
  'flex-1 px-4 py-3 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none transition-all border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15';

// ─── Skeleton row matching the category card layout ───────────────────────────
const CategoryRowSkeleton = () => (
  <DarkCardSkeleton>
    <div className="flex items-center justify-between p-4 md:p-5">
      <div className="flex items-center gap-3.5 flex-1">
        <div className="w-11 h-11 rounded-xl shrink-0 animate-pulse" style={{ background: '#1c1c1c' }} />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 rounded-lg animate-pulse" style={{ background: '#1c1c1c' }} />
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 rounded-full animate-pulse" style={{ background: '#1c1c1c' }} />
            <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: '#1c1c1c' }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: '#1c1c1c' }} />
        <div className="w-9 h-9 rounded-xl animate-pulse" style={{ background: '#1c1c1c' }} />
      </div>
    </div>
  </DarkCardSkeleton>
);

// ═══════════════════════════════════════════════════════════════════════════════
const Categories = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading, refetch } = useGetCategoriesQuery({});
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [newName,      setNewName]      = useState('');
  const [newParent,    setNewParent]    = useState<string>('');
  const [isCreating,   setIsCreating]   = useState(false);

  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editingName,  setEditingName]  = useState('');
  const [editingParent,setEditingParent]= useState<string>('');

  const [deleteModal,  setDeleteModal]  = useState(false);
  const [toDelete,     setToDelete]     = useState<string | null>(null);

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory({
        name: newName,
        parent: newParent || null,
      }).unwrap();
      setNewName(''); setNewParent(''); setIsCreating(false); refetch();
      toast.success('Category created');
    } catch (err) {
      const e = err as { data?: { message: string } };
      toast.error(e.data?.message || 'Failed to create category');
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await updateCategory({
        id,
        name: editingName,
        parent: editingParent || null,
      }).unwrap();
      setEditingId(null); setEditingName(''); setEditingParent(''); refetch();
      toast.success('Category updated');
    } catch (err) {
      const e = err as { data?: { message: string } };
      toast.error(e.data?.message || 'Failed to update category');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCategory(toDelete).unwrap(); refetch(); toast.success('Category deleted');
    } catch (err) {
      const e = err as { data?: { message: string } };
      toast.error(e.data?.message || 'Failed to delete category');
    } finally { setDeleteModal(false); setToDelete(null); }
  };

  // ══════ SKELETON LOADING ══════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 pt-16 md:pt-24 max-w-4xl mx-auto pb-28 md:pb-10 space-y-5"
        style={{ background: '#0A0A0B' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: '#141414' }} />
            <div className="space-y-1.5">
              <div className="h-4 w-16 rounded animate-pulse" style={{ background: '#141414' }} />
              <div className="h-7 w-36 rounded-lg animate-pulse" style={{ background: '#141414' }} />
            </div>
          </div>
          <div className="h-10 w-36 rounded-xl animate-pulse" style={{ background: '#141414' }} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <CategoryRowSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // ══════ MAIN PAGE ═════════════════════════════════════════════════════════
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
      className="min-h-screen p-4 md:p-6 pt-16 md:pt-24 max-w-4xl mx-auto pb-28 md:pb-10 space-y-5"
      style={{ background: '#0A0A0B' }}>

      <ConfirmationModal isOpen={deleteModal} onClose={() => setDeleteModal(false)}
        onConfirm={confirmDelete} title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete" cancelText="Cancel" type="danger" />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => navigate('/admin')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors shrink-0"
            style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame className="w-3 h-3" style={{ color: ACCENT }} />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Admin</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-none">Categories</h1>
            <p className="text-gray-600 text-xs mt-0.5">{categories.length} categories · Organise your products</p>
          </div>
        </div>

        <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 28px ${ACCENT}55` }} whileTap={{ scale: 0.96 }}
          onClick={() => { setIsCreating(true); setEditingId(null); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shrink-0"
          style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}>
          <Plus className="w-4 h-4" /> Add Category
        </motion.button>
      </div>

      {/* ── Create new category ── */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }}
            className="overflow-hidden">
            <div className="relative rounded-2xl p-4 md:p-5"
              style={{ background: '#141414', border: `1px solid ${ACCENT}40`, boxShadow: `0 0 0 1px ${ACCENT}20, 0 8px 32px rgba(0,0,0,0.4)` }}>
              <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-3" style={{ color: ACCENT }}>New Category</p>

              <div className="space-y-3">
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Category name (e.g., Soft Drinks)"
                  className={inputCls} autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setIsCreating(false); setNewName(''); } }} />

                {/* Parent selector – all categories are available as parent */}
                <select value={newParent} onChange={e => setNewParent(e.target.value)}
                  className={`${inputCls} cursor-pointer`}>
                  <option value="">Top‑level (no parent)</option>
                  {categories.map((cat: Category) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-4">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={handleCreate}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: ACCENT }}>
                  <Check className="w-4 h-4" /> Save
                </motion.button>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => { setIsCreating(false); setNewName(''); setNewParent(''); }}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-gray-500 hover:text-white transition-colors text-sm"
                  style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <X className="w-4 h-4" /> Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Category list ── */}
      <div className="space-y-3">
        {!categories.length ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl p-10 text-center"
            style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex justify-center mb-5">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-4 rounded-full border-2 border-dashed pointer-events-none"
                  style={{ borderColor: `${ACCENT}28` }} />
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: `${ACCENT}12`, boxShadow: `0 0 0 3px ${ACCENT}` }}>
                  <FolderOpen className="w-9 h-9" style={{ color: ACCENT }} />
                </div>
              </div>
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2" style={{ color: ACCENT }}>Empty</p>
            <h3 className="text-xl font-black text-white mb-2">No categories yet</h3>
            <p className="text-gray-600 text-sm mb-6">Create your first category to start organising products.</p>
            <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 28px ${ACCENT}55` }} whileTap={{ scale: 0.96 }}
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}>
              <Plus className="w-4 h-4" /> Create First Category
            </motion.button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {categories.map((cat: Category, idx: number) => {
              const parentName = cat.parent?.name || 'Top‑level';
              return (
                <motion.div key={cat._id} layout
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26, delay: idx * 0.04 }}
                  className="relative rounded-2xl overflow-hidden"
                  style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}>

                  {editingId === cat._id ? (
                    /* ── Edit row ── */
                    <div className="p-4 md:p-5">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2.5" style={{ color: ACCENT }}>Editing</p>
                      <div className="space-y-3">
                        <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)}
                          className={inputCls} autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') handleUpdate(cat._id); if (e.key === 'Escape') { setEditingId(null); setEditingName(''); } }} />
                        <select value={editingParent} onChange={e => setEditingParent(e.target.value)}
                          className={`${inputCls} cursor-pointer`}>
                          <option value="">Top‑level (no parent)</option>
                          {/* exclude the category itself to avoid circular reference */}
                          {categories
                            .filter((c: Category) => c._id !== cat._id)
                            .map((c: Category) => (
                              <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          onClick={() => handleUpdate(cat._id)}
                          className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-white text-sm"
                          style={{ background: ACCENT }}>
                          <Check className="w-4 h-4" /> Save
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          onClick={() => { setEditingId(null); setEditingName(''); setEditingParent(''); }}
                          className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-gray-500 hover:text-white transition-colors text-sm"
                          style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <X className="w-4 h-4" /> Cancel
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    /* ── View row ── */
                    <div className="flex items-center justify-between p-4 md:p-5 group">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg font-black"
                          style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
                          <Tag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-white text-base truncate">{cat.name}</h3>
                          <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(255,255,255,0.06)', color: '#6b7280' }}>
                              /{cat.slug}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                              style={{ background: cat.parent ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)', color: cat.parent ? '#60a5fa' : '#34d399' }}>
                              {cat.parent ? (
                                <><ChevronRight className="w-3 h-3" /> {parentName}</>
                              ) : (
                                <>Top‑level</>
                              )}
                            </span>
                            {cat.createdAt && (
                              <span className="text-[10px] text-gray-700 flex items-center gap-1 font-medium">
                                <Calendar className="w-3 h-3" />
                                {new Date(cat.createdAt).toLocaleDateString('en-NG', { year:'numeric', month:'short', day:'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-4 opacity-60 group-hover:opacity-100 transition-opacity">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setEditingId(cat._id);
                            setEditingName(cat.name);
                            setEditingParent(cat.parent?._id || '');
                            setIsCreating(false);
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => { setToDelete(cat._id); setDeleteModal(true); }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                          style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.18)' }}>
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default Categories;