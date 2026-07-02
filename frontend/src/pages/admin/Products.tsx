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
} from '../../features/api/apiSlice';
import {
  Search,
  Trash2,
  Edit2,
  Plus,
  X,
  UploadCloud,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Minus,
} from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

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

  // ---------- UI State ----------
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showLowStock, setShowLowStock] = useState(false); // ✅ New filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // ---------- Filtered & Searched Products (with Low Stock filter) ----------
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter((p: ProductItem) => p.category === categoryFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((p: ProductItem) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ✅ Low Stock filter (stock < 5)
    if (showLowStock) {
      filtered = filtered.filter((p: ProductItem) => p.stock < 5);
    }

    return filtered.slice().sort((a: ProductItem, b: ProductItem) => 
      b._id.localeCompare(a._id)
    );
  }, [products, searchTerm, categoryFilter, showLowStock]);

  // ---------- Pagination ----------
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
    setFile(null);
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

  // Quick stock increment/decrement
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
        await createProduct(productData).unwrap();
      }

      handleCloseDrawer();
    } catch (err) {
      const error = err as { data?: { message: string } };
      console.error('Failed to save product:', error.data?.message || error);
      toast.error('Error saving product. Please try again.');
    }
  };

  // ---------- Render ----------
  return (
    <div className="p-4 md:p-6 pt-20 md:pt-24 max-w-7xl mx-auto space-y-4 md:space-y-6">
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

      {/* --- Header with Back Button --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        
        {/* Add Product button – always right-aligned */}
        <div className="flex justify-end w-full sm:w-auto">
          <button
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-1 sm:gap-2 bg-leaf-green text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition-all text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* --- Filters & Search --- */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-leaf-green bg-white text-sm"
        >
          {filterCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {/* ✅ Low Stock filter toggle */}
        <button
          onClick={() => setShowLowStock(!showLowStock)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
            showLowStock
              ? 'bg-red-100 text-red-700 border-red-300 ring-2 ring-red-200'
              : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
          }`}
        >
          {showLowStock ? 'Showing Low Stock' : 'Low Stock'}
        </button>
      </div>

      {/* --- Product Table --- */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 py-4 sm:py-8 text-center text-gray-500 text-sm">
                    Loading products...
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 py-4 sm:py-8 text-center text-gray-500 text-sm">
                    No products found.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product: ProductItem) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className="transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={product.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-200"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm text-gray-800">
                      {product.name}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                      ₦{product.price.toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() =>
                            handleQuickStock(product._id, product.stock, -1)
                          }
                          className="p-1 rounded hover:bg-red-50 text-red-500 transition"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span
                          className={`font-semibold text-xs sm:text-sm ${
                            product.stock < 5 ? 'text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {product.stock}
                        </span>
                        <button
                          onClick={() =>
                            handleQuickStock(product._id, product.stock, 1)
                          }
                          className="p-1 rounded hover:bg-leaf-green/10 text-leaf-green transition"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        {product.stock < 5 && (
                          <span className="text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-bold ml-1 sm:ml-2">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-pastel-green text-leaf-green rounded-full font-bold uppercase tracking-wider">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right space-x-1 sm:space-x-2">
                      <button
                        onClick={() => handleOpenDrawer(product)}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 inline-block" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product._id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 inline-block" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 gap-2">
            <span className="text-xs sm:text-sm text-gray-500">
              Showing {startIndex + 1} –{' '}
              {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{' '}
              {filteredProducts.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- Slide‑in Drawer (Add/Edit) --- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={handleCloseDrawer}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-full sm:max-w-xl bg-white/90 backdrop-blur-xl shadow-2xl z-50 overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={handleCloseDrawer}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    {...register('name')}
                    className={`w-full border ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    } rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                    placeholder="e.g. Organic Apple Juice"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Price & Stock (2 columns) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      {...register('price')}
                      className={`w-full border ${
                        errors.price ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                      placeholder="2500"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      {...register('stock')}
                      className={`w-full border ${
                        errors.stock ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent`}
                      placeholder="20"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.stock.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category - dynamic from backend */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
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
                      <AlertCircle className="w-3 h-3" />
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent resize-none"
                    placeholder="Brief product description..."
                  />
                </div>

                {/* Image Upload Section with Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Image
                  </label>
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
                    
                    {/* New image preview when a file is selected */}
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

                    {/* Existing image preview if editing and no new file selected */}
                    {editingProduct?.images?.[0] && !file && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Current image:</span>
                        <img
                          src={editingProduct.images[0]}
                          alt="Current"
                          className="mt-1 w-20 h-20 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="px-4 py-2 bg-leaf-green text-white rounded-xl font-medium shadow-lg hover:shadow-leaf-green/30 transition disabled:opacity-60"
                  >
                    {isSubmitting || uploading
                      ? 'Saving...'
                      : editingProduct
                      ? 'Update Product'
                      : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;