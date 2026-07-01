import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../features/api/apiSlice';
import { Plus, Trash2, Edit, Check, X, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

const Categories = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading, refetch } = useGetCategoriesQuery({});
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  // State for new category
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // State for editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // State for delete confirmation modal
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-green"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-4xl mx-auto space-y-4 md:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-xl hover:bg-gray-100 border border-gray-200 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Categories</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-leaf-green text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition-all text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Category</span>
        </button>
      </div>

      {/* Create new category input */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col sm:flex-row gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-leaf-green text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition text-sm"
            >
              <Check className="w-4 h-4" /> Save
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewName('');
              }}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-300 transition text-sm"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Categories list */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {categories?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No categories yet. Add one to get started.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories?.map((cat: Category) => (
              <li key={cat._id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/50 transition-colors">
                {editingId === cat._id ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(cat._id)}
                        className="flex items-center gap-1 bg-leaf-green text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName('');
                        }}
                        className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-300 transition"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-gray-800">{cat.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(cat._id);
                          setEditingName(cat.name);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cat._id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

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
    </motion.div>
  );
};

export default Categories;