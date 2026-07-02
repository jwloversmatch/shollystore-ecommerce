import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../features/api/apiSlice';
import {
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ArrowLeft,
  FolderOpen,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

// ---------- Animation Variants ----------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

const Categories = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading, refetch } = useGetCategoriesQuery({});
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory({ name: newName }).unwrap();
      setNewName('');
      setIsCreating(false);
      refetch();
      toast.success('Category created');
    } catch (error) {
      const err = error as { data?: { message: string } };
      toast.error(err.data?.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await updateCategory({ id, name: editingName }).unwrap();
      setEditingId(null);
      setEditingName('');
      refetch();
      toast.success('Category updated');
    } catch (error) {
      const err = error as { data?: { message: string } };
      toast.error(err.data?.message || 'Failed to update category');
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete).unwrap();
      refetch();
      toast.success('Category deleted');
    } catch (error) {
      const err = error as { data?: { message: string } };
      toast.error(err.data?.message || 'Failed to delete category');
    } finally {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="rounded-full h-12 w-12 border-4 border-leaf-green/30 border-t-leaf-green"
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-4xl mx-auto space-y-6"
    >
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Header */}
      <motion.div variants={itemFadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-xl hover:bg-gray-100 border border-gray-200 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Categories</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage product categories for your store</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-leaf-green text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </motion.button>
      </motion.div>

      {/* Create new category */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Category name (e.g., Soft Drinks)"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-leaf-green text-white px-4 py-2.5 rounded-xl font-medium hover:bg-green-700 transition text-sm"
                  >
                    <Check className="w-4 h-4" /> Save
                  </motion.button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewName('');
                    }}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-300 transition text-sm font-medium"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Grid / List */}
      <motion.div variants={itemFadeUp} className="space-y-3">
        {categories?.length === 0 && !isLoading ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No categories yet</h3>
            <p className="text-gray-500 text-sm">Create your first category to start organizing products.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {categories?.map((cat: Category) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                layout
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                {editingId === cat._id ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleUpdate(cat._id)}
                        className="flex items-center gap-1 bg-leaf-green text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </motion.button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName('');
                        }}
                        className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-300 transition"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-base sm:text-lg">{cat.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          /{cat.slug}
                        </span>
                        {cat.createdAt && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(cat.createdAt).toLocaleDateString('en-NG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingId(cat._id);
                          setEditingName(cat.name);
                        }}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(cat._id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Categories;