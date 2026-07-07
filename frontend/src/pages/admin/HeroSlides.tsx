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

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = '#e8622a';

// ─── Interfaces ────────────────────────────────────────────────────────────────
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

  // ══════ LOADING SKELETON (dark theme) ═════════════════════════════════════════
  if (isLoading) {
    return (
      <div
        className="min-h-screen p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6"
        style={{ background: '#0A0A0B' }}
      >
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 w-32 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
              <div className="h-3 w-48 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-28 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
        </div>

        {/* Table skeleton card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                <tr>
                  {['Image', 'Title', 'Subtitle', 'Active', 'Order', 'Actions'].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <tr
                    key={idx}
                    className="border-t"
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <td className="px-4 sm:px-6 py-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-32 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-48 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-5 w-16 rounded-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="h-4 w-8 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex justify-end gap-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-lg bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse"
                          />
                        ))}
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

  // ══════ MAIN PAGE (dark theme) ════════════════════════════════════════════════
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6"
      style={{ background: '#0A0A0B' }}
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
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate('/admin')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors shrink-0"
            style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}18` }}>
                <ToggleRight className="w-3 h-3" style={{ color: ACCENT }} />
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
                Admin
              </p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-none">Hero Slides</h1>
            <p className="text-gray-600 text-sm mt-0.5">Manage homepage hero carousel slides</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: `0 12px 28px ${ACCENT}55` }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
          style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </motion.button>
      </motion.div>

      {/* Table */}
      <motion.div
        variants={itemFadeUp}
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
              <tr>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Image</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Title</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Subtitle</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Active</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600">Order</th>
                <th className="px-4 sm:px-6 py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((slide: HeroSlide, idx: number) => (
                <motion.tr
                  key={slide._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.015)' }}
                  className="border-t transition-colors"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <td className="px-4 sm:px-6 py-3">
                    <img
                      src={slide.imageUrl || PLACEHOLDER_IMAGE}
                      alt={slide.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border"
                      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    />
                  </td>
                  <td className="px-4 sm:px-6 py-3 font-semibold text-sm text-white">{slide.title}</td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-400">{slide.subtitle}</td>
                  <td className="px-4 sm:px-6 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        slide.isActive
                          ? ''
                          : ''
                      }`}
                      style={
                        slide.isActive
                          ? { background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }
                          : { background: 'rgba(255,255,255,0.06)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      {slide.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-sm text-gray-400">{slide.order}</td>
                  <td className="px-4 sm:px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => moveSlide(slide._id, 'up')}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-white transition"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSlide(slide._id, 'down')}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-white transition"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(slide)}
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(slide._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition"
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

      {/* Modal for Add/Edit (dark theme) */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="rounded-2xl p-6 max-w-lg w-full border"
                style={{
                  background: '#141414',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 40px 90px rgba(0,0,0,0.65)',
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-white">
                    {editingSlide ? 'Edit Slide' : 'Add New Slide'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-xl hover:bg-white/5 transition text-gray-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Image</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-3 border border-dashed rounded-xl transition text-sm text-gray-500 hover:text-gray-300"
                          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                        >
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
                          className="w-14 h-14 rounded-lg object-cover border"
                          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0"
                      style={{
                        background: formData.isActive ? ACCENT : '#2d2d2d',
                        boxShadow: formData.isActive ? `0 0 10px ${ACCENT}55` : 'none',
                      }}
                    >
                      <motion.div
                        animate={{ x: formData.isActive ? 20 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                      />
                    </button>
                    <span className="text-sm font-bold text-white">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors"
                      style={{ background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={uploading}
                      whileHover={!uploading ? { scale: 1.03, boxShadow: `0 14px 36px ${ACCENT}55` } : {}}
                      whileTap={!uploading ? { scale: 0.97 } : {}}
                      className="px-5 py-3 rounded-xl font-black text-white text-sm flex items-center gap-2 transition-all disabled:opacity-55"
                      style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
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