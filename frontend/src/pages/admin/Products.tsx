import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadImageMutation,
  useUpdateStockMutation,
  useGetCategoriesQuery,
  useSendMarketingEmailMutation,
} from '../../features/api/apiSlice';
import {
  Search,
  Trash2,
  Edit2,
  Plus,
  X,
  UploadCloud,
  AlertCircle,
  ArrowLeft,
  Minus,
  Mail,
} from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ProductRowSkeleton } from '../../components/Skeletons';

// ---------- Types ----------
interface ProductItem {
  _id: string;
  name: string;
  slug?: string;
  images?: string[];
  price: number;
  stock: number;
  description?: string;
  category?: string;
  createdAt?: string;
}

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

// ---------- Zod Validation Schema ----------
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine((val) => Number(val) > 0, 'Price must be greater than 0'),
  stock: z
    .string()
    .min(1, 'Stock is required')
    .refine((val) => Number(val) >= 0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

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

// ---------- Component ----------
const Products = () => {
  const navigate = useNavigate();
  const {
    data: products = [],
    isLoading,
  } = useGetProductsQuery({});
  const { data: categories = [] } = useGetCategoriesQuery({});
  const [deleteProduct] = useDeleteProductMutation();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [uploadImage] = useUploadImageMutation();
  const [updateStock] = useUpdateStockMutation();
  const [sendMarketingEmail, { isLoading: isSendingMarketing }] = useSendMarketingEmailMutation();

  // ---------- UI State ----------
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showLowStock, setShowLowStock] = useState(false);

  // ---------- Modal / Drawer State ----------
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // ---------- Confirmation Modal State ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<{
    type: 'delete';
    id: string;
  } | null>(null);

  // ---------- Marketing Modal State ----------
  const [marketingModalOpen, setMarketingModalOpen] = useState(false);
  const [selectedProductForMarketing, setSelectedProductForMarketing] = useState<ProductItem | null>(null);
  const [marketingType, setMarketingType] = useState<'new_arrival' | 'back_in_stock'>('new_arrival');
  const [customMessage, setCustomMessage] = useState('');

  // ✅ New arrival notification checkbox (only for new product)
  const [notifyCustomers, setNotifyCustomers] = useState(false);

  // ---------- React Hook Form ----------
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  // ---------- Derived Categories (for filter) ----------
  const filterCategories = useMemo(() => {
    const all = (products as ProductItem[])
      .map((p) => p.category)
      .filter((c): c is string => typeof c === 'string' && c.length > 0);
    return ['All', ...Array.from(new Set(all))];
  }, [products]);

  // ---------- Filtered & Searched Products ----------
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (categoryFilter !== 'All') {
      filtered = filtered.filter((p: ProductItem) => p.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((p: ProductItem) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showLowStock) {
      filtered = filtered.filter((p: ProductItem) => p.stock < 5);
    }

    return filtered.slice().sort((a: ProductItem, b: ProductItem) =>
      b._id.localeCompare(a._id)
    );
  }, [products, searchTerm, categoryFilter, showLowStock]);

  // ---------- Handlers ----------
  const handleOpenDrawer = (product?: ProductItem) => {
    if (product) {
      setEditingProduct(product);
      reset({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category || '',
        description: product.description || '',
      });
      setFile(null);
      setNotifyCustomers(false); // not used when editing
    } else {
      setEditingProduct(null);
      reset({
        name: '',
        price: '',
        stock: '',
        category: '',
        description: '',
      });
      setFile(null);
      setNotifyCustomers(false);
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
    setFile(null);
    setNotifyCustomers(false);
  };

  const handleDeleteClick = (id: string) => {
    setModalAction({ type: 'delete', id });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!modalAction || modalAction.type !== 'delete') return;
    await deleteProduct(modalAction.id).unwrap();
    setModalAction(null);
  };

  const handleQuickStock = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await updateStock({ id, stock: newStock }).unwrap();
    } catch (error) {
      console.error('Stock update failed:', error);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      let imageUrl = editingProduct?.images?.[0] || '';
      if (file) {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        const uploadRes = await uploadImage(formData).unwrap();
        imageUrl = uploadRes.url;
        setUploading(false);
      }

      const productData = {
        name: data.name,
        price: Number(data.price),
        stock: Number(data.stock),
        description: data.description || '',
        category: data.category,
        images: imageUrl ? [imageUrl] : [],
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      };

      if (editingProduct) {
        await updateProduct({
          id: editingProduct._id,
          ...productData,
        }).unwrap();
      } else {
        // ✅ Include notifyCustomers flag when creating a new product
        await createProduct({ ...productData, notifyCustomers }).unwrap();
      }

      handleCloseDrawer();
    } catch (err) {
      const error = err as { data?: { message: string } };
      console.error('Failed to save product:', error.data?.message || error);
      toast.error('Error saving product. Please try again.');
    }
  };

  // ✅ Marketing email handlers
  const openMarketingModal = (product: ProductItem, type: 'new_arrival' | 'back_in_stock') => {
    setSelectedProductForMarketing(product);
    setMarketingType(type);
    setCustomMessage('');
    setMarketingModalOpen(true);
  };

  const handleSendMarketing = async () => {
    if (!selectedProductForMarketing) return;
    try {
      await sendMarketingEmail({
        type: marketingType,
        productId: selectedProductForMarketing._id,
        customMessage: marketingType === 'new_arrival' ? customMessage : undefined,
      }).unwrap();
      toast.success('Emails sent to customers!');
      setMarketingModalOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Failed to send emails');
    }
  };

  const placeholderImage = 'https://via.placeholder.com/150';

  // ---------- Loading state ----------
if (isLoading) {
  return (
    <div className="p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
  // ---------- Render ----------
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6 md:space-y-8"
    >
      {/* --- Confirmation Modal --- */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* --- Header --- */}
      <motion.div variants={itemFadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 text-gray-600"
            aria-label="Go back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Products</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage your product catalog</p>
          </div>
        </div>

        <div className="flex justify-end w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-2 bg-leaf-green text-white px-4 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </motion.button>
        </div>
      </motion.div>

      {/* --- Filters & Search --- */}
      <motion.div
        variants={itemFadeUp}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-leaf-green text-sm bg-white/70"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-leaf-green bg-white text-sm"
        >
          {filterCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
            showLowStock
              ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-200'
              : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
          }`}
        >
          {showLowStock ? 'Showing Low Stock' : 'Low Stock'}
        </button>
      </motion.div>

      {/* --- Product Table (scrollable, no pagination) --- */}
      <motion.div
        variants={itemFadeUp}
        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 sticky top-0 z-10">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-gray-500 text-sm">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: ProductItem, idx: number) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className="transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3">
                      <img
                        src={product.images?.[0] || placeholderImage}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = placeholderImage; }}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-medium text-xs sm:text-sm text-gray-800">
                      {product.name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-gray-700">
                      ₦{product.price.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuickStock(product._id, product.stock, -1)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>
                        <span className={`font-semibold text-sm ${product.stock < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                          {product.stock}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuickStock(product._id, product.stock, 1)}
                          className="p-1.5 rounded-lg hover:bg-leaf-green/10 text-leaf-green transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                        {product.stock < 5 && (
                          <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className="text-[10px] px-2 py-0.5 bg-pastel-green text-leaf-green rounded-full font-bold uppercase tracking-wider">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <button
                        onClick={() => handleOpenDrawer(product)}
                        className="text-blue-600 hover:text-blue-800 transition p-1.5 rounded-lg hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product._id)}
                        className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openMarketingModal(product, product.stock > 0 ? 'new_arrival' : 'back_in_stock')}
                        className="text-leaf-green hover:text-green-700 transition p-1.5 rounded-lg hover:bg-leaf-green/10 ml-1"
                        title="Notify customers"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* --- Slide‑in Drawer (Add/Edit) --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={handleCloseDrawer}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-full sm:max-w-xl bg-white/95 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={handleCloseDrawer} className="p-2 rounded-full hover:bg-gray-100 transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    {...register('name')}
                    className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                    placeholder="e.g. Organic Apple Juice"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      {...register('price')}
                      className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                      placeholder="2500"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.price.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      {...register('stock')}
                      className={`w-full border ${errors.stock ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                      placeholder="20"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.stock.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    {...register('category')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green bg-white"
                  >
                    {categories.map((cat: CategoryItem) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent resize-none"
                    placeholder="Brief product description..."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:bg-leaf-green/10 file:text-leaf-green hover:file:bg-leaf-green/20"
                    />
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <UploadCloud className="w-4 h-4 animate-pulse" />
                        Uploading...
                      </div>
                    )}
                    {file && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">New image preview:</span>
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="mt-1 w-20 h-20 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    )}
                    {editingProduct?.images?.[0] && !file && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Current image:</span>
                        <img
                          src={editingProduct.images[0]}
                          alt="Current"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = placeholderImage; }}
                          className="mt-1 w-20 h-20 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ Checkbox – only for new product */}
                {!editingProduct && (
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      id="notifyCustomers"
                      checked={notifyCustomers}
                      onChange={(e) => setNotifyCustomers(e.target.checked)}
                      className="w-4 h-4 text-leaf-green focus:ring-leaf-green rounded"
                    />
                    <label htmlFor="notifyCustomers" className="text-sm text-gray-700 font-medium">
                      Notify customers of new arrival
                    </label>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-leaf-green text-white rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition disabled:opacity-60"
                  >
                    {isSubmitting || uploading
                      ? 'Saving...'
                      : editingProduct
                      ? 'Update Product'
                      : 'Save Product'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Marketing Email Modal --- */}
      <AnimatePresence>
        {marketingModalOpen && selectedProductForMarketing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setMarketingModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Notify Customers</h2>
                  <button onClick={() => setMarketingModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  You are about to send an email about <strong>{selectedProductForMarketing.name}</strong> to all customers.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={marketingType}
                      onChange={(e) => setMarketingType(e.target.value as 'new_arrival' | 'back_in_stock')}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                    >
                      <option value="new_arrival">New Arrival</option>
                      <option value="back_in_stock">Back in Stock</option>
                    </select>
                  </div>

                  {marketingType === 'new_arrival' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom Message (optional)</label>
                      <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-leaf-green text-sm"
                        placeholder="Write a short message..."
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setMarketingModalOpen(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendMarketing}
                      disabled={isSendingMarketing}
                      className="px-4 py-2 bg-leaf-green text-white rounded-xl font-medium shadow-md hover:bg-green-700 transition disabled:opacity-60 text-sm flex items-center gap-2"
                    >
                      {isSendingMarketing ? 'Sending...' : 'Send Emails'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Products;