import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadImageMutation,
  useGetCategoryTreeQuery,
} from "../../../features/api/apiSlice";
import { X, AlertCircle, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import type { ProductItem } from "../../../types/home";

const ACCENT = "#e8622a";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.string().min(1, "Price is required").refine((v) => Number(v) > 0, "Price must be greater than 0"),
  stock: z.string().min(1, "Stock is required").refine((v) => Number(v) >= 0, "Stock cannot be negative"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  tags: z.string().optional(),
  compareAtPrice: z.string().optional(),
  discountPercent: z.string().optional(),
  isFeatured: z.boolean().optional(),
});
type ProductFormData = z.infer<typeof productSchema>;

interface Variant {
  _id?: string;
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  stock?: number;
  compareAtPrice?: number;
  isActive?: boolean;
  images?: string[];
}

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
  children?: CategoryItem[];
}

const getCategoryId = (cat: ProductItem["category"]): string => {
  if (!cat) return "";
  return typeof cat === "string" ? cat : cat._id;
};

const formatPriceInput = (raw: string): string => {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const fmtInt = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${fmtInt}.${decPart}` : fmtInt;
};

const DLabel = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="mb-2">
    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">{children}</p>
    {hint && <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{hint}</p>}
  </div>
);

interface ProductDrawerProps {
  product: ProductItem | null;
  onClose: () => void;
  isDark: boolean;
}

const ProductDrawer = ({ product, onClose, isDark }: ProductDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [uploadImage] = useUploadImageMutation();
  const { data: categoryTree = [] } = useGetCategoryTreeQuery({});

  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [notifyCustomers, setNotifyCustomers] = useState(false);

  // Initialize state from product prop using lazy initializers
  const [variants, setVariants] = useState<Variant[]>(() =>
    product?.variants?.map((v) => ({
      sku: v.sku || "",
      color: v.color || "",
      size: v.size || "",
      price: v.price || 0,
      stock: v.stock || 0,
      compareAtPrice: v.compareAtPrice || 0,
      isActive: v.isActive,
      images: v.images || [],
    })) || []
  );
  const [existingImages, setExistingImages] = useState<string[]>(() => product?.images || []);
  const [rawPrice, setRawPrice] = useState(() => product?.price?.toString() || "");
  const [rawCompareAt, setRawCompareAt] = useState(() => product?.compareAtPrice?.toString() || "");

  const priceInputRef = useRef<HTMLInputElement>(null);
  const compareAtRef = useRef<HTMLInputElement>(null);
  const pendingCursorRef = useRef<number | null>(null);

  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) });
  const isFeatured = useWatch({ control, name: "isFeatured" });

  // Theme styles
  const drawerBg = isDark ? "#141414" : "#fff";
  const drawerBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const overlayBg = isDark ? "rgba(0,0,0,0.68)" : "rgba(0,0,0,0.4)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  useFocusTrap(drawerRef, true, onClose);

  useLayoutEffect(() => {
    if (pendingCursorRef.current !== null && priceInputRef.current) {
      priceInputRef.current.setSelectionRange(pendingCursorRef.current, pendingCursorRef.current);
      pendingCursorRef.current = null;
    }
  });

  // Reset form when product changes (react-hook-form reset is not a setState call)
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: product.price.toString(),
        stock: String(product.stock ?? 0),
        category: getCategoryId(product.category),
        description: product.description || "",
        brand: product.brand || "",
        sku: product.sku || "",
        tags: product.tags?.join(", ") || "",
        compareAtPrice: product.compareAtPrice?.toString() || "",
        discountPercent: product.discount?.percentage?.toString() || "",
        isFeatured: product.isFeatured || false,
      });
    }
  }, [product, reset]);

  const buildInputCls = (hasError: boolean) =>
    ["w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all border", hasError ? "border-red-500/50 ring-2 ring-red-500/10" : "focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15"].join(" ");

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setRaw: React.Dispatch<React.SetStateAction<string>>,
    fieldName: "price" | "compareAtPrice"
  ) => {
    const el = e.target;
    const cursor = el.selectionStart ?? el.value.length;
    const nonCommasBefore = el.value.slice(0, cursor).replace(/,/g, "").length;
    const stripped = el.value.replace(/,/g, "");
    let cleaned = "";
    let seenDot = false;
    let decCount = 0;
    for (const ch of stripped) {
      if (ch >= "0" && ch <= "9") {
        if (seenDot) { if (decCount < 2) { cleaned += ch; decCount++; } } else { cleaned += ch; }
      } else if (ch === "." && !seenDot) { seenDot = true; cleaned += ch; }
    }
    const newFormatted = formatPriceInput(cleaned);
    let charCount = 0;
    let newCursor = newFormatted.length;
    for (let i = 0; i < newFormatted.length; i++) {
      if (newFormatted[i] !== ",") { charCount++; if (charCount === nonCommasBefore) { newCursor = i + 1; break; } }
    }
    pendingCursorRef.current = newCursor;
    setRaw(cleaned);
    setValue(fieldName, cleaned, { shouldValidate: true });
  };

  const handleRemoveExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const renderCategoryOptions = (nodes: CategoryItem[], depth = 0): React.ReactNode[] => {
    return nodes.reduce<React.ReactNode[]>((acc, node) => {
      acc.push(<option key={node._id} value={node._id}>{'— '.repeat(depth)}{node.name}</option>);
      if (node.children && node.children.length > 0) {
        acc.push(...renderCategoryOptions(node.children, depth + 1));
      }
      return acc;
    }, []);
  };

  const handleVariantChange = (idx: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    (newVariants[idx] as Record<string, unknown>)[field] = value;
    setVariants(newVariants);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const imageUrls: string[] = [...existingImages];
      if (files.length > 0) {
        setUploading(true);
        for (const file of files) {
          const fd = new FormData();
          fd.append("image", file);
          const res = await uploadImage(fd).unwrap();
          imageUrls.push(res.url);
        }
        setUploading(false);
      }
      const tagsArray = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [];
      const validVariants = variants
        .filter((v) => v.size || v.color || v.sku)
        .map((v) => ({
          sku: v.sku || "",
          color: v.color || "",
          size: v.size || "",
          price: v.price || 0,
          stock: v.stock || 0,
          compareAtPrice: v.compareAtPrice || undefined,
          isActive: v.isActive !== undefined ? v.isActive : true,
          images: v.images || [],
        }));
      const payload = {
        name: data.name,
        price: Number(data.price),
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
        stock: Number(data.stock),
        description: data.description || "",
        category: data.category,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        brand: data.brand || undefined,
        sku: data.sku || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        discount: data.discountPercent && Number(data.discountPercent) > 0
          ? { percentage: Number(data.discountPercent) }
          : undefined,
        isFeatured: data.isFeatured || false,
        variants: validVariants.length > 0 ? validVariants : undefined,
      };
      if (product) {
        await updateProduct({ id: product._id, ...payload }).unwrap();
        toast.success("Product updated successfully");
      } else {
        await createProduct({ ...payload, notifyCustomers }).unwrap();
        toast.success("Product created successfully");
      }
      onClose();
    } catch (err) {
      const e = err as { data?: { message: string } };
      toast.error(e.data?.message || "Error saving product.");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: overlayBg, backdropFilter: "blur(8px)" }}
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-xl z-50 overflow-y-auto"
        style={{
          background: drawerBg,
          borderLeft: `1px solid ${drawerBorder}`,
          boxShadow: isDark ? "-20px 0 60px rgba(0,0,0,0.6)" : "-20px 0 60px rgba(0,0,0,0.1)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div
          className="sticky top-0 z-10 flex justify-between items-center px-6 py-5 border-b"
          style={{ background: drawerBg, borderColor: drawerBorder }}
        >
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
              {product ? "Editing" : "New Product"}
            </p>
            <h2 id="drawer-title" className="text-xl font-black leading-tight" style={{ color: textPrimary }}>
              {product ? product.name : "Add New Product"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.07)", color: textMuted }}
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5" aria-label={product ? `Edit ${product.name}` : "Create new product"}>
          {/* Product Name */}
          <div>
            <DLabel>Product Name</DLabel>
            <input
              id="prod-name"
              {...register("name")}
              placeholder="e.g. Luxury Lace Wig"
              className={buildInputCls(!!errors.name)}
              style={{ background: inputBg, borderColor: errors.name ? undefined : inputBorder, color: textPrimary }}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold" role="alert">
                <AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <DLabel hint="A brief description of the product.">Description (optional)</DLabel>
            <textarea
              id="prod-description"
              {...register("description")}
              rows={3}
              placeholder="Describe your product..."
              className={buildInputCls(false) + " resize-none"}
              style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
            />
          </div>

          {/* Price & Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <DLabel>Price (₦)</DLabel>
              <input
                id="prod-price"
                ref={priceInputRef}
                type="text"
                inputMode="decimal"
                value={formatPriceInput(rawPrice)}
                onChange={(e) => handlePriceChange(e, setRawPrice, "price")}
                placeholder="0.00"
                className={buildInputCls(!!errors.price)}
                style={{ background: inputBg, borderColor: errors.price ? undefined : inputBorder, color: textPrimary }}
              />
              {errors.price && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold" role="alert">
                  <AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.price.message}
                </p>
              )}
            </div>
            <div>
              <DLabel hint="The original price before discount.">Compare at Price (optional)</DLabel>
              <input
                id="prod-compare-at"
                ref={compareAtRef}
                type="text"
                inputMode="decimal"
                value={formatPriceInput(rawCompareAt)}
                onChange={(e) => handlePriceChange(e, setRawCompareAt, "compareAtPrice")}
                placeholder="e.g. 5,000"
                className={buildInputCls(false)}
                style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
              />
            </div>
            <div>
              <DLabel>Stock</DLabel>
              <input
                id="prod-stock"
                type="number"
                min="0"
                step="1"
                {...register("stock")}
                placeholder="20"
                className={buildInputCls(!!errors.stock)}
                style={{ background: inputBg, borderColor: errors.stock ? undefined : inputBorder, color: textPrimary }}
              />
              {errors.stock && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold" role="alert">
                  <AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.stock.message}
                </p>
              )}
            </div>
            <div>
              <DLabel hint="Enter a discount percentage.">Discount (%)</DLabel>
              <input
                id="prod-discount"
                type="number"
                min="0"
                max="100"
                step="1"
                {...register("discountPercent")}
                placeholder="10"
                className={buildInputCls(false)}
                style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
              />
            </div>
          </div>

          {/* Brand & SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <DLabel>Brand (optional)</DLabel>
              <input id="prod-brand" {...register("brand")} placeholder="e.g. Louis Vuitton" className={buildInputCls(false)} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} />
            </div>
            <div>
              <DLabel>SKU (optional)</DLabel>
              <input id="prod-sku" {...register("sku")} placeholder="e.g. APL-123" className={buildInputCls(false)} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <DLabel hint="Comma-separated tags (e.g. New, Sale, Trending)">Tags (optional)</DLabel>
            <input id="prod-tags" {...register("tags")} placeholder="e.g. New, Sale, Trending" className={buildInputCls(false)} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} />
          </div>

          {/* Category */}
          <div>
            <DLabel>Category</DLabel>
            <select
              id="prod-category"
              {...register("category")}
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none border transition-all cursor-pointer"
              style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
            >
              <option value="">Select a category…</option>
              {renderCategoryOptions(categoryTree)}
            </select>
            {errors.category && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold" role="alert">
                <AlertCircle className="w-3 h-3" aria-hidden="true" /> {errors.category.message}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <DLabel hint="Upload product images. First image will be the main image.">Product Images</DLabel>

            {existingImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border aspect-square" style={{ borderColor: inputBorder }}>
                    <img src={img} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove image ${idx + 1}`}
                    >
                      <X className="w-3 h-3 text-white" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label
              className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-[#e8622a]/60"
              style={{ borderColor: inputBorder, background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex flex-col items-center gap-2">
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: ACCENT }} aria-hidden="true" />
                    <p className="text-xs" style={{ color: textMuted }}>Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" style={{ color: textMuted }} aria-hidden="true" />
                    <p className="text-xs" style={{ color: textMuted }}>
                      <span className="font-bold" style={{ color: ACCENT }}>Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px]" style={{ color: textMuted }}>PNG, JPG, WEBP up to 10MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                multiple
                onChange={(e) => { setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]); }}
              />
            </label>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: textMuted }}>
                  New Images ({files.length})
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border aspect-square" style={{ borderColor: inputBorder }}>
                      <img src={URL.createObjectURL(file)} alt={`New image ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove new image ${idx + 1}`}
                      >
                        <X className="w-3 h-3 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Variants Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <DLabel>Variants</DLabel>
              <button
                type="button"
                onClick={() => setVariants([...variants, { sku: "", color: "", size: "", price: 0, stock: 0, compareAtPrice: 0 }])}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                style={{ background: ACCENT }}
              >
                <Plus className="w-3 h-3" aria-hidden="true" /> Add Variant
              </button>
            </div>

            {variants.length > 0 ? (
              <div className="space-y-3">
                {variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border space-y-3"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: inputBorder }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: textMuted }}>Variant {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        aria-label={`Remove variant ${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-widest block mb-1" style={{ color: textMuted }}>Color</label>
                        <input
                          type="text"
                          value={variant.color || ""}
                          onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                          placeholder="e.g. Red"
                          className={buildInputCls(false)}
                          style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-widest block mb-1" style={{ color: textMuted }}>Size</label>
                        <input
                          type="text"
                          value={variant.size || ""}
                          onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                          placeholder="e.g. L"
                          className={buildInputCls(false)}
                          style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-widest block mb-1" style={{ color: textMuted }}>Price (₦)</label>
                        <input
                          type="number"
                          value={variant.price || ""}
                          onChange={(e) => handleVariantChange(idx, "price", Number(e.target.value))}
                          placeholder="0"
                          className={buildInputCls(false)}
                          style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-widest block mb-1" style={{ color: textMuted }}>Stock</label>
                        <input
                          type="number"
                          value={variant.stock || ""}
                          onChange={(e) => handleVariantChange(idx, "stock", Number(e.target.value))}
                          placeholder="0"
                          className={buildInputCls(false)}
                          style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-widest block mb-1" style={{ color: textMuted }}>Compare At Price</label>
                        <input
                          type="number"
                          value={variant.compareAtPrice || ""}
                          onChange={(e) => handleVariantChange(idx, "compareAtPrice", Number(e.target.value))}
                          placeholder="0"
                          className={buildInputCls(false)}
                          style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-widest block mb-1" style={{ color: textMuted }}>SKU</label>
                        <input
                          type="text"
                          value={variant.sku || ""}
                          onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                          placeholder="e.g. VAR-001"
                          className={buildInputCls(false)}
                          style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: textMuted }}>
                No variants added yet. Click "Add Variant" to create one.
              </p>
            )}
          </div>

          {/* Featured toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: inputBorder }}>
            <span id="featured-label" className="text-sm font-bold" style={{ color: textPrimary }}>Featured Product</span>
            <button
              type="button"
              onClick={() => setValue("isFeatured", !isFeatured)}
              className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0"
              style={{ background: isFeatured ? ACCENT : "#2d2d2d" }}
              role="switch"
              aria-checked={isFeatured}
              aria-labelledby="featured-label"
            >
              <span
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300"
                style={{ transform: isFeatured ? "translateX(20px)" : "translateX(0)" }}
              />
            </button>
          </div>

          {/* Notify customers toggle */}
          {!product && (
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: inputBorder }}>
              <span id="notify-label" className="text-sm font-bold" style={{ color: textPrimary }}>Notify customers</span>
              <button
                type="button"
                onClick={() => setNotifyCustomers((v) => !v)}
                className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0"
                style={{ background: notifyCustomers ? ACCENT : "#2d2d2d" }}
                role="switch"
                aria-checked={notifyCustomers}
                aria-labelledby="notify-label"
              >
                <span
                  className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300"
                  style={{ transform: notifyCustomers ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: inputBorder }}>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-sm font-bold transition-colors"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55"
              style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
            >
              {isSubmitting || uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Saving…</>
              ) : product ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductDrawer;