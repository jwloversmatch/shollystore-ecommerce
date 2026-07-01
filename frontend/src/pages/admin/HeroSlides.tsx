import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useGetAllHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
  useUploadImageMutation,
} from '../../features/api/apiSlice';
import { ArrowLeft, Plus, Trash2, Edit, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal'; // Import modal

interface HeroSlide {
  _id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
}

const HeroSlides = () => {
  const navigate = useNavigate();
  const { data: slides, isLoading, refetch } = useGetAllHeroSlidesQuery({});
  const [createSlide] = useCreateHeroSlideMutation();
  const [updateSlide] = useUpdateHeroSlideMutation();
  const [deleteSlide] = useDeleteHeroSlideMutation();
  const [uploadImage] = useUploadImageMutation();

  // Modal state
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

  // Delete confirmation modal state
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
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

  if (isLoading) return <div className="p-6">Loading slides...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pt-20 md:pt-24 max-w-7xl mx-auto"
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

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-xl hover:bg-gray-100 border border-gray-200 text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Hero Slides</h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-leaf-green text-white px-4 py-2 rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Subtitle</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Active</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slides.map((slide: HeroSlide) => (
                <tr key={slide._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <img src={slide.imageUrl} alt={slide.title} className="w-16 h-16 rounded-lg object-cover" />
                  </td>
                  <td className="px-6 py-4 font-medium">{slide.title}</td>
                  <td className="px-6 py-4 text-gray-600">{slide.subtitle}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{slide.order}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => moveSlide(slide._id, 'up')} className="text-gray-400 hover:text-gray-600"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => moveSlide(slide._id, 'down')} className="text-gray-400 hover:text-gray-600"><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={() => handleOpenModal(slide)} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteClick(slide._id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full"
          >
            <h2 className="text-2xl font-bold mb-4">{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-leaf-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-leaf-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full border rounded-xl px-4 py-2"
                />
                {formData.imageUrl && !file && (
                  <img src={formData.imageUrl} alt="Current" className="mt-2 w-24 h-24 rounded object-cover" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-leaf-green"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-leaf-green focus:ring-leaf-green"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-leaf-green text-white rounded-xl hover:bg-green-700 disabled:opacity-60"
                >
                  {uploading ? 'Uploading...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default HeroSlides;