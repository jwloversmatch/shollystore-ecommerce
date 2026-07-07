import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetAllHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useUploadImageMutation,
} from '../../features/api/apiSlice';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  X,
  UploadCloud,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

interface HeroSlide {
  _id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
}

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150';

// Animation variants
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

const HeroSlides = () => {
  const navigate = useNavigate();
  const { data: slides, isLoading, refetch } = useGetAllHeroSlidesQuery({});
  const [createSlide] = useCreateHeroSlideMutation();
  const [updateSlide] = useUpdateHeroSlideMutation();
  const [deleteSlide] = useDeleteHeroSlideMutation();
  const [uploadImage] = useUploadImageMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    isActive: true,
    order: 0,
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  const handleOpenModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        subtitle: slide.subtitle,
        imageUrl: slide.imageUrl,
        isActive: slide.isActive,
        order: slide.order,
      });
    } else {
      setEditingSlide(null);
      setFormData({ title: '', subtitle: '', imageUrl: '', isActive: true, order: 0 });
    }
    setFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.imageUrl;
      if (file) {
        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        const uploadRes = await uploadImage(formDataUpload).unwrap();
        imageUrl = uploadRes.url;
        setUploading(false);
      }

      const slideData = { ...formData, imageUrl, order: Number(formData.order) };

      if (editingSlide) {
        await updateSlide({ id: editingSlide._id, ...slideData }).unwrap();
        toast.success('Slide updated!');
      } else {
        await createSlide(slideData).unwrap();
        toast.success('Slide created!');
      }
      refetch();
      handleCloseModal();
    } catch {
      toast.error('Failed to save slide.');
    }
  };

  const handleDeleteClick = (id: string) => {
    setSlideToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!slideToDelete) return;
    await deleteSlide(slideToDelete);
    refetch();
    setDeleteModalOpen(false);
    setSlideToDelete(null);
  };

  const moveSlide = async (id: string, direction: 'up' | 'down') => {
    const index = slides.findIndex((s: HeroSlide) => s._id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === slides.length - 1)
    ) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const current = slides[index];
    const neighbour = slides[swapIndex];
    await Promise.all([
      updateSlide({ id: current._id, ...current, order: neighbour.order }).unwrap(),
      updateSlide({ id: neighbour._id, ...neighbour, order: current.order }).unwrap(),
    ]);
    refetch();
  };

  // ══════ LOADING SKELETON ════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-40 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
          <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-xl" />
        </div>

        {/* Table skeleton card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  {['Image', 'Title', 'Subtitle', 'Active', 'Order', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-200 animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-5 w-16 bg-gray-200 animate-pulse rounded-full" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-8 bg-gray-200 animate-pulse rounded" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg" />
                        <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg" />
                        <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg" />
                        <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ══════ MAIN PAGE ════════════════════════════════════════════════════════════
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6"
    >
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Slide"
        message="Are you sure you want to delete this hero slide? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Header */}
      <motion.div variants={itemFadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-xl hover:bg-gray-100 border border-gray-200 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Hero Slides</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage homepage hero carousel slides</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-leaf-green text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </motion.button>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemFadeUp} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Subtitle</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Active</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slides.map((slide: HeroSlide, idx: number) => (
                <motion.tr
                  key={slide._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  className="transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3">
                    <img
                      src={slide.imageUrl || PLACEHOLDER_IMAGE}
                      alt={slide.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-gray-200 shadow-sm"
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-3 font-medium text-sm text-gray-800">{slide.title}</td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">{slide.subtitle}</td>
                  <td className="px-4 sm:px-6 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {slide.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-600">{slide.order}</td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => moveSlide(slide._id, 'up')}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSlide(slide._id, 'down')}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(slide)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-800 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(slide._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal for Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-lg w-full border border-white/40">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingSlide ? 'Edit Slide' : 'Add New Slide'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-xl hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-xl hover:border-leaf-green transition text-sm text-gray-500">
                          <UploadCloud className="w-5 h-5" />
                          {file ? file.name : 'Click to upload image'}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                      {(formData.imageUrl || file) && (
                        <img
                          src={file ? URL.createObjectURL(file) : formData.imageUrl}
                          alt="Preview"
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.isActive ? 'bg-leaf-green' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={uploading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 bg-leaf-green text-white rounded-xl font-medium shadow-md hover:bg-green-700 transition disabled:opacity-60 text-sm flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Save'
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HeroSlides;