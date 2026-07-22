import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  useGetProductsQuery, useDeleteProductMutation, useCreateProductMutation,
  useUpdateProductMutation, useUploadImageMutation, useUpdateStockMutation,
  useGetCategoriesQuery, useSendMarketingEmailMutation,
} from '../../features/api/apiSlice';
import {
  Search, Trash2, Edit2, Plus, X, UploadCloud, AlertCircle,
  ArrowLeft, Minus, Mail, Flame, Loader2, Package,
} from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ProductRowSkeleton } from '../../components/Skeletons';

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT      = '#e8622a';
const PLACEHOLDER = 'https://via.placeholder.com/150';

// ─── Types – use the shared type from types/home ──────────────────────────────
import type { ProductItem } from '../../types/home'; // ✅ no local interface
interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const productSchema = z.object({
  name:        z.string().min(1, 'Product name is required'),
  price:       z.string().min(1, 'Price is required').refine(v => Number(v) > 0, 'Price must be greater than 0'),
  stock:       z.string().min(1, 'Stock is required').refine(v => Number(v) >= 0, 'Stock cannot be negative'),
  category:    z.string().min(1, 'Category is required'),
  description: z.string().optional(),
});
type ProductFormData = z.infer<typeof productSchema>;

// ─── Input helpers ────────────────────────────────────────────────────────────
const buildInputCls = (hasError: boolean) =>
  ['w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none transition-all border',
    hasError
      ? 'border-red-500/50 ring-2 ring-red-500/10'
      : 'border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15',
  ].join(' ');

const formatPriceInput = (raw: string): string => {
  if (!raw) return '';
  const [intPart, decPart] = raw.split('.');
  const fmtInt = (intPart || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart !== undefined ? `${fmtInt}.${decPart}` : fmtInt;
};

const DLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">{children}</p>
);

// Helper: extract category name for display
const getCategoryName = (cat: ProductItem['category']): string => {
  if (!cat) return '';
  return typeof cat === 'string' ? cat : cat.name;
};
// Helper: extract category ID
const getCategoryId = (cat: ProductItem['category']): string => {
  if (!cat) return '';
  return typeof cat === 'string' ? cat : cat._id;
};

// ═══════════════════════════════════════════════════════════════════════════════
const Products = () => {
  const navigate = useNavigate();

  // ✅ Fetch all products for admin
  const { data: productsData, isLoading } = useGetProductsQuery({ limit: 9999 });
  // Memoize the product array so it's stable across renders
  const products = useMemo<ProductItem[]>(
    () => productsData?.products ?? [],
    [productsData?.products]
  );

  const { data: categories = [] }          = useGetCategoriesQuery({});
  const [deleteProduct]                    = useDeleteProductMutation();
  const [createProduct]                    = useCreateProductMutation();
  const [updateProduct]                    = useUpdateProductMutation();
  const [uploadImage]                      = useUploadImageMutation();
  const [updateStock]                      = useUpdateStockMutation();
  const [sendMarketingEmail, { isLoading: isSendingMarketing }] = useSendMarketingEmailMutation();

  const [searchTerm,     setSearchTerm]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showLowStock,   setShowLowStock]   = useState(false);

  const [isDrawerOpen,   setIsDrawerOpen]   = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [uploading,      setUploading]      = useState(false);
  const [file,           setFile]           = useState<File | null>(null);
  const [notifyCustomers,setNotifyCustomers]= useState(false);

  const [modalOpen,   setModalOpen]   = useState(false);
  const [modalAction, setModalAction] = useState<{ type:'delete'; id:string } | null>(null);

  const [marketingOpen,   setMarketingOpen]   = useState(false);
  const [marketingProduct,setMarketingProduct]= useState<ProductItem | null>(null);
  const [marketingType,   setMarketingType]   = useState<'new_arrival'|'back_in_stock'>('new_arrival');
  const [customMessage,   setCustomMessage]   = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<ProductFormData>({ resolver: zodResolver(productSchema) });

  const [rawPrice,       setRawPrice]       = useState('');
  const priceInputRef    = useRef<HTMLInputElement>(null);
  const pendingCursorRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingCursorRef.current !== null && priceInputRef.current) {
      priceInputRef.current.setSelectionRange(pendingCursorRef.current, pendingCursorRef.current);
      pendingCursorRef.current = null;
    }
  });

  const filterCategories = useMemo(() => {
    const opts = [{ _id: 'All', name: 'All' }, ...categories];
    return opts;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    let f = products;
    if (categoryFilter !== 'All') {
      f = f.filter((p: ProductItem) => {
        const id = getCategoryId(p.category);
        return id === categoryFilter;
      });
    }
    if (searchTerm) f = f.filter((p: ProductItem) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (showLowStock) f = f.filter((p: ProductItem) => (p.stock ?? 0) < 5);
    return f.slice().sort((a: ProductItem, b: ProductItem) => b._id.localeCompare(a._id));
  }, [products, searchTerm, categoryFilter, showLowStock]);

  // ── Drawer handlers ───────────────────────────────────────────────────────
  const handleOpenDrawer = (product?: ProductItem) => {
    if (product) {
      setEditingProduct(product);
      reset({
        name: product.name,
        price: product.price.toString(),
        stock: String(product.stock ?? 0),
        category: getCategoryId(product.category),
        description: product.description || '',
      });
      setRawPrice(product.price.toString());
    } else {
      setEditingProduct(null);
      reset({ name:'', price:'', stock:'', category:'', description:'' });
      setRawPrice('');
    }
    setFile(null); setNotifyCustomers(false); setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => { setIsDrawerOpen(false); setEditingProduct(null); setFile(null); setNotifyCustomers(false); };

  const confirmDelete = async () => {
    if (!modalAction || modalAction.type !== 'delete') return;
    await deleteProduct(modalAction.id).unwrap();
    setModalAction(null);
  };

  const handleQuickStock = async (id: string, cur: number, delta: number) => {
    try { await updateStock({ id, stock: Math.max(0, cur + delta) }).unwrap(); } catch { /* empty */ }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const cursor = el.selectionStart ?? el.value.length;
    const nonCommasBefore = el.value.slice(0, cursor).replace(/,/g, '').length;
    const stripped = el.value.replace(/,/g, '');
    let cleaned = ''; let seenDot = false; let decCount = 0;
    for (const ch of stripped) {
      if (ch >= '0' && ch <= '9') {
        if (seenDot) { if (decCount < 2) { cleaned += ch; decCount++; } } else { cleaned += ch; }
      } else if (ch === '.' && !seenDot) { seenDot = true; cleaned += ch; }
    }
    const newFormatted = formatPriceInput(cleaned);
    let charCount = 0; let newCursor = newFormatted.length;
    for (let i = 0; i < newFormatted.length; i++) {
      if (newFormatted[i] !== ',') { charCount++; if (charCount === nonCommasBefore) { newCursor = i + 1; break; } }
    }
    pendingCursorRef.current = newCursor;
    setRawPrice(cleaned); setValue('price', cleaned, { shouldValidate: true });
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      let imageUrl = editingProduct?.images?.[0] || '';
      if (file) {
        setUploading(true);
        const fd = new FormData(); fd.append('image', file);
        const res = await uploadImage(fd).unwrap();
        imageUrl = res.url; setUploading(false);
      }
      const payload = {
        name: data.name,
        price: Number(data.price),
        stock: Number(data.stock),
        description: data.description || '',
        category: data.category,
        images: imageUrl ? [imageUrl] : [],
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      };
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, ...payload }).unwrap();
      } else {
        await createProduct({ ...payload, notifyCustomers }).unwrap();
      }
      handleCloseDrawer();
    } catch (err) {
      const e = err as { data?: { message: string } };
      toast.error(e.data?.message || 'Error saving product.');
    }
  };

  const handleSendMarketing = async () => {
    if (!marketingProduct) return;
    try {
      await sendMarketingEmail({
        type: marketingType,
        productId: marketingProduct._id,
        customMessage: marketingType === 'new_arrival' ? customMessage : undefined,
      }).unwrap();
      toast.success('Emails sent!'); setMarketingOpen(false);
    } catch (err) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || 'Failed to send emails');
    }
  };

  // ══════ LOADING ════════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 pt-16 md:pt-24 max-w-7xl mx-auto space-y-5 pb-28 md:pb-10" style={{ background:'#0A0A0B' }}>
        <div className="rounded-2xl overflow-hidden" style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)' }}>
          {Array.from({ length: 8 }).map((_, i) => <ProductRowSkeleton key={i} dark />)}
        </div>
      </div>
    );
  }

  // ══════ MAIN PAGE ═══════════════════════════════════════════════════════════
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }}
      className="p-4 md:p-6 pt-16 md:pt-24 max-w-7xl mx-auto space-y-5 pb-28 md:pb-10"
      style={{ background:'#0A0A0B' }}>

      <ConfirmationModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete} title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete" cancelText="Cancel" type="danger" />

      {/* ── Header ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
            onClick={() => navigate('/admin')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors shrink-0"
            style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame className="w-3 h-3" style={{ color:ACCENT }} />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color:ACCENT }}>Admin</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-none">Products</h1>
            <p className="text-gray-600 text-xs mt-0.5">{products.length} products in catalog</p>
          </div>
        </div>
        <motion.button whileHover={{ scale:1.04, boxShadow:`0 12px 28px ${ACCENT}55` }} whileTap={{ scale:0.96 }}
          onClick={() => handleOpenDrawer()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shrink-0"
          style={{ background:ACCENT, boxShadow:`0 6px 18px ${ACCENT}44` }}>
          <Plus className="w-4 h-4" /> Add Product
        </motion.button>
      </motion.div>

      {/* ── Filter bar ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="flex flex-col sm:flex-row gap-3 rounded-2xl p-4"
        style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)' }}>

        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
          <input type="text" placeholder="Search products…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/60 transition-all" />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm text-white outline-none border border-white/[0.08] cursor-pointer"
          style={{ background:'#1c1c1c' }}
        >
          {filterCategories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button onClick={() => setShowLowStock(v => !v)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border"
          style={{
            background:   showLowStock ? 'rgba(239,68,68,0.12)' : '#1c1c1c',
            color:        showLowStock ? '#f87171' : '#6b7280',
            borderColor:  showLowStock ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.08)',
            boxShadow:    showLowStock ? '0 0 0 1px rgba(239,68,68,0.2)' : 'none',
          }}>
          {showLowStock ? '⚠ Low Stock' : 'Low Stock'}
        </button>
      </motion.div>

      {/* ── Products table ── */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 8px 32px rgba(0,0,0,0.35)' }}>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto" style={{ scrollbarWidth:'thin', scrollbarColor:`${ACCENT}40 transparent` }}>
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10" style={{ background:'#1c1c1c', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <tr>
                {['Image','Name','Price','Stock','Category','Actions'].map((h,i) => (
                  <th key={h} className={`px-4 sm:px-5 py-3.5 text-[9px] font-extrabold uppercase tracking-widest text-gray-600 ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Package className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-semibold">No products found.</p>
                  </td>
                </tr>
              ) : filteredProducts.map((product: ProductItem, idx: number) => (
                <motion.tr key={product._id}
                  initial={{ opacity:0 }} animate={{ opacity:1 }}
                  transition={{ duration:0.18, delay:idx * 0.025 }}
                  className="border-t transition-colors hover:bg-white/[0.015] group"
                  style={{ borderColor:'rgba(255,255,255,0.05)' }}>

                  {/* Image */}
                  <td className="px-4 sm:px-5 py-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border shrink-0" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
                      <img src={product.images?.[0] || PLACEHOLDER} alt={product.name} loading="lazy"
                        onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                        className="w-full h-full object-cover" />
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 sm:px-5 py-3">
                    <p className="font-bold text-white text-sm max-w-[180px] truncate">{product.name}</p>
                  </td>

                  {/* Price */}
                  <td className="px-4 sm:px-5 py-3">
                    <span className="font-black text-sm" style={{ color:ACCENT }}>₦{product.price.toLocaleString()}</span>
                  </td>

                  {/* Stock */}
                  <td className="px-4 sm:px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center rounded-xl overflow-hidden" style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.08)' }}>
                        <motion.button whileTap={{ scale:0.85 }}
                          onClick={() => handleQuickStock(product._id, product.stock ?? 0, -1)}
                          className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors">
                          <Minus className="w-3 h-3" />
                        </motion.button>
                        <span className={`w-8 text-center text-sm font-black ${(product.stock ?? 0) < 5 ? 'text-red-400' : 'text-white'}`}>
                          {product.stock ?? 0}
                        </span>
                        <motion.button whileTap={{ scale:0.85 }}
                          onClick={() => handleQuickStock(product._id, product.stock ?? 0, 1)}
                          className="w-7 h-7 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                          <Plus className="w-3 h-3" />
                        </motion.button>
                      </div>
                      {(product.stock ?? 0) < 5 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold"
                          style={{ background:'rgba(239,68,68,0.12)', color:'#f87171' }}>Low</span>
                      )}
                    </div>
                  </td>

                  {/* Category (now showing name) */}
                  <td className="px-4 sm:px-5 py-3">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background:`${ACCENT}14`, color:ACCENT, border:`1px solid ${ACCENT}25` }}>
                      {getCategoryName(product.category)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 sm:px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                        onClick={() => handleOpenDrawer(product)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background:'rgba(59,130,246,0.1)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.2)' }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                        onClick={() => { setModalAction({ type:'delete', id:product._id }); setModalOpen(true); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background:'rgba(239,68,68,0.08)', color:'#f87171', border:'1px solid rgba(239,68,68,0.18)' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                        onClick={() => { setMarketingProduct(product); setMarketingType((product.stock ?? 0) > 0 ? 'new_arrival' : 'back_in_stock'); setCustomMessage(''); setMarketingOpen(true); }}
                        title="Notify customers"
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background:'rgba(16,185,129,0.1)', color:'#34d399', border:'1px solid rgba(16,185,129,0.2)' }}>
                        <Mail className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ══ Slide-in Drawer (Add / Edit) ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div key="scrim" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-40" style={{ background:'rgba(0,0,0,0.68)', backdropFilter:'blur(8px)' }}
              onClick={handleCloseDrawer} />

            <motion.div key="drawer"
              initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
              transition={{ type:'spring', damping:30, stiffness:300 }}
              className="fixed right-0 top-0 h-full w-full max-w-xl z-50 overflow-y-auto"
              style={{ background:'#141414', borderLeft:'1px solid rgba(255,255,255,0.08)', boxShadow:'-20px 0 60px rgba(0,0,0,0.6)' }}>

              <div className="sticky top-0 z-10 flex justify-between items-center px-6 py-5 border-b"
                style={{ background:'#141414', borderColor:'rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color:ACCENT }}>
                    {editingProduct ? 'Editing' : 'New Product'}
                  </p>
                  <h2 className="text-xl font-black text-white leading-tight">
                    {editingProduct ? editingProduct.name : 'Add New Product'}
                  </h2>
                </div>
                <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                  onClick={handleCloseDrawer}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                  style={{ background:'rgba(255,255,255,0.07)' }}>
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                <div>
                  <DLabel>Product Name</DLabel>
                  <input {...register('name')} placeholder="e.g. Organic Apple Juice"
                    className={buildInputCls(!!errors.name)} />
                  {errors.name && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <DLabel>Price (₦)</DLabel>
                    <input ref={priceInputRef} type="text" inputMode="decimal"
                      value={formatPriceInput(rawPrice)} onChange={handlePriceChange} placeholder="0.00"
                      className={buildInputCls(!!errors.price)} />
                    {errors.price && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.price.message}</p>}
                  </div>
                  <div>
                    <DLabel>Stock</DLabel>
                    <input type="number" min="0" step="1" {...register('stock')} placeholder="20"
                      className={buildInputCls(!!errors.stock)} />
                    {errors.stock && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.stock.message}</p>}
                  </div>
                </div>

                <div>
                  <DLabel>Category</DLabel>
                  <select {...register('category')}
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white outline-none border border-white/[0.08] focus:border-[#e8622a]/70 transition-all cursor-pointer"
                    style={{ background:'#1c1c1c' }}>
                    <option value="" className="text-gray-600">Select a category…</option>
                    {categories.map((cat: CategoryItem) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.category.message}</p>}
                </div>

                <div>
                  <DLabel>Description</DLabel>
                  <textarea {...register('description')} rows={3} placeholder="Brief product description…"
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none resize-none border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/12 transition-all" />
                </div>

                <div>
                  <DLabel>Product Image</DLabel>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-colors hover:border-[#e8622a]/40"
                      style={{ background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.12)' }}>
                      <UploadCloud className="w-5 h-5 text-gray-600 shrink-0" />
                      <span className="text-sm text-gray-600 flex-1 truncate">
                        {file ? file.name : 'Click to choose an image…'}
                      </span>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => setFile(e.target.files?.[0] || null)} />
                    </label>
                    {uploading && (
                      <div className="flex items-center gap-2 text-sm" style={{ color:'#60a5fa' }}>
                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                      </div>
                    )}
                    {file && (
                      <div>
                        <p className="text-[10px] text-gray-600 mb-1.5 uppercase font-bold tracking-wider">Preview</p>
                        <img src={URL.createObjectURL(file)} alt="Preview"
                          className="w-20 h-20 rounded-xl object-cover border" style={{ borderColor:'rgba(255,255,255,0.1)' }} />
                      </div>
                    )}
                    {editingProduct?.images?.[0] && !file && (
                      <div>
                        <p className="text-[10px] text-gray-600 mb-1.5 uppercase font-bold tracking-wider">Current</p>
                        <img src={editingProduct.images[0]} alt="Current" loading="lazy"
                          onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                          className="w-20 h-20 rounded-xl object-cover border" style={{ borderColor:'rgba(255,255,255,0.1)' }} />
                      </div>
                    )}
                  </div>
                </div>

                {!editingProduct && (
                  <div className="flex items-center justify-between p-4 rounded-xl border"
                    style={{ background:'rgba(255,255,255,0.03)', borderColor:'rgba(255,255,255,0.07)' }}>
                    <div>
                      <p className="text-white text-sm font-bold">Notify customers</p>
                      <p className="text-gray-600 text-xs">Send a new arrival email to all subscribers</p>
                    </div>
                    <button type="button" onClick={() => setNotifyCustomers(v => !v)}
                      className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0"
                      style={{ background: notifyCustomers ? ACCENT : '#2d2d2d' }}>
                      <motion.div animate={{ x: notifyCustomers ? 20 : 2 }}
                        transition={{ type:'spring', stiffness:500, damping:32 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                    </button>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
                  <motion.button type="button" whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                    onClick={handleCloseDrawer}
                    className="px-5 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors"
                    style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.08)' }}>
                    Cancel
                  </motion.button>
                  <motion.button type="submit" disabled={isSubmitting || uploading}
                    whileHover={!(isSubmitting||uploading) ? { scale:1.03, boxShadow:`0 12px 28px ${ACCENT}55` } : {}}
                    whileTap={!(isSubmitting||uploading) ? { scale:0.97 } : {}}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55"
                    style={{ background:ACCENT, boxShadow:`0 6px 18px ${ACCENT}44` }}>
                    {(isSubmitting || uploading)
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                      : editingProduct ? 'Update Product' : 'Save Product'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ Marketing Email Modal ════════════════════════════════════════════ */}
      <AnimatePresence>
        {marketingOpen && marketingProduct && (
          <>
            <motion.div key="mscrim" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-50" style={{ background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)' }}
              onClick={() => setMarketingOpen(false)} />
            <motion.div key="mmodal"
              initial={{ opacity:0, scale:0.93, y:20 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.93, y:20 }}
              transition={{ type:'spring', stiffness:300, damping:26 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="relative w-full max-w-md rounded-2xl p-6"
                style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 40px 90px rgba(0,0,0,0.6)' }}
                onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
                  style={{ background:`linear-gradient(90deg, transparent, #10b981, transparent)` }} />
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-0.5" style={{ color:'#10b981' }}>Email Campaign</p>
                    <h2 className="text-xl font-black text-white">Notify Customers</h2>
                  </div>
                  <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
                    onClick={() => setMarketingOpen(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                    style={{ background:'rgba(255,255,255,0.07)' }}>
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  Sending email to all customers about{' '}
                  <strong className="text-white">{marketingProduct.name}</strong>.
                </p>
                <div className="space-y-4">
                  <div>
                    <DLabel>Email Type</DLabel>
                    <select value={marketingType}
                      onChange={e => setMarketingType(e.target.value as 'new_arrival'|'back_in_stock')}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border border-white/[0.08] focus:border-emerald-500/60 cursor-pointer"
                      style={{ background:'#1c1c1c' }}>
                      <option value="new_arrival">New Arrival</option>
                      <option value="back_in_stock">Back in Stock</option>
                    </select>
                  </div>
                  {marketingType === 'new_arrival' && (
                    <div>
                      <DLabel>Custom Message (optional)</DLabel>
                      <textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)} rows={3}
                        placeholder="Write a short message for customers…"
                        className="w-full px-4 py-3 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none resize-none border border-white/[0.08] focus:border-emerald-500/60 transition-all" />
                    </div>
                  )}
                  <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                    <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                      onClick={() => setMarketingOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors"
                      style={{ background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.08)' }}>
                      Cancel
                    </motion.button>
                    <motion.button onClick={handleSendMarketing} disabled={isSendingMarketing}
                      whileHover={!isSendingMarketing ? { scale:1.04 } : {}} whileTap={!isSendingMarketing ? { scale:0.97 } : {}}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-55"
                      style={{ background:'#10b981', boxShadow:'0 6px 18px rgba(16,185,129,0.35)' }}>
                      {isSendingMarketing ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Mail className="w-4 h-4" /> Send Emails</>}
                    </motion.button>
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