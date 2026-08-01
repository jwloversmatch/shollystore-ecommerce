import { useState, useMemo, useRef, useLayoutEffect } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadImageMutation,
  useUpdateStockMutation,
  useGetCategoryTreeQuery,
  useSendMarketingEmailMutation,
} from "../../features/api/apiSlice";
import {
  Search,
  Trash2,
  Edit2,
  Plus,
  X,
  AlertCircle,
  ArrowLeft,
  Minus,
  Mail,
  Flame,
  Loader2,
  Package,
  Upload,
} from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import { ProductRowSkeleton } from "../../components/Skeletons";
import { getCloudinaryUrl } from "../../utils/cloudinary";

const ACCENT = "#e8622a";
const PLACEHOLDER = "https://via.placeholder.com/150";

import type { ProductItem } from "../../types/home";

// ✅ Updated interface to handle tree children
interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
  children?: CategoryItem[];
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((v) => Number(v) > 0, "Price must be greater than 0"),
  stock: z
    .string()
    .min(1, "Stock is required")
    .refine((v) => Number(v) >= 0, "Stock cannot be negative"),
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

const buildInputCls = (hasError: boolean) =>
  [
    "w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none transition-all border",
    hasError
      ? "border border-red-500/50 ring-2 ring-red-500/10"
      : "border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
  ].join(" ");

const formatPriceInput = (raw: string): string => {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const fmtInt = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${fmtInt}.${decPart}` : fmtInt;
};

const DLabel = ({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) => (
  <div className="mb-2">
    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
      {children}
    </p>
    {hint && (
      <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{hint}</p>
    )}
  </div>
);

const getCategoryName = (cat: ProductItem["category"]): string => {
  if (!cat) return "";
  return typeof cat === "string" ? cat : cat.name;
};
const getCategoryId = (cat: ProductItem["category"]): string => {
  if (!cat) return "";
  return typeof cat === "string" ? cat : cat._id;
};

const Products = () => {
  const navigate = useNavigate();
  const { data: productsData, isLoading } = useGetProductsQuery({
    limit: 9999,
  });
  const products = useMemo<ProductItem[]>(
    () => productsData?.products ?? [],
    [productsData?.products],
  );

  // Fetch the tree structure instead of flat list
  const { data: categoryTree = [] } = useGetCategoryTreeQuery({});

  const [deleteProduct] = useDeleteProductMutation();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [uploadImage] = useUploadImageMutation();
  const [updateStock] = useUpdateStockMutation();
  const [sendMarketingEmail, { isLoading: isSendingMarketing }] =
    useSendMarketingEmailMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showLowStock, setShowLowStock] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [notifyCustomers, setNotifyCustomers] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<{
    type: "delete";
    id: string;
  } | null>(null);

  const [marketingOpen, setMarketingOpen] = useState(false);
  const [marketingProduct, setMarketingProduct] = useState<ProductItem | null>(
    null,
  );
  const [marketingType, setMarketingType] = useState<
    "new_arrival" | "back_in_stock"
  >("new_arrival");
  const [customMessage, setCustomMessage] = useState("");
  const marketingModalRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) });
  const isFeatured = useWatch({ control, name: "isFeatured" });

  const [rawPrice, setRawPrice] = useState("");
  const [rawCompareAt, setRawCompareAt] = useState("");
  const priceInputRef = useRef<HTMLInputElement>(null);
  const compareAtRef = useRef<HTMLInputElement>(null);
  const pendingCursorRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingCursorRef.current !== null && priceInputRef.current) {
      priceInputRef.current.setSelectionRange(
        pendingCursorRef.current,
        pendingCursorRef.current,
      );
      pendingCursorRef.current = null;
    }
  });

  const { filterCategories } = useMemo(() => {
    const flatten = (nodes: CategoryItem[]): CategoryItem[] => {
      return nodes.reduce<CategoryItem[]>((acc, node) => {
        acc.push(node);
        if (node.children && node.children.length > 0) {
          acc.push(...flatten(node.children));
        }
        return acc;
      }, []);
    };
    const flat = flatten(categoryTree);
    const filtered = [{ _id: "All", name: "All" }, ...flat];
    return { flatCategories: flat, filterCategories: filtered };
  }, [categoryTree]);

  // ✅ Recursive helper to render indented options for the Category Dropdown
  const renderCategoryOptions = (nodes: CategoryItem[], depth = 0): React.ReactNode[] => {
    return nodes.reduce<React.ReactNode[]>((acc, node) => {
      acc.push(
        <option key={node._id} value={node._id}>
          {'— '.repeat(depth)}{node.name}
        </option>
      );
      if (node.children && node.children.length > 0) {
        acc.push(...renderCategoryOptions(node.children, depth + 1));
      }
      return acc;
    }, []);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
    setFiles([]);
    setNotifyCustomers(false);
    setVariants([]);
  };

  useFocusTrap(drawerRef, isDrawerOpen, handleCloseDrawer);
  useFocusTrap(marketingModalRef, marketingOpen, () => setMarketingOpen(false));

  const filteredProducts = useMemo(() => {
    let f = products;
    if (categoryFilter !== "All")
      f = f.filter(
        (p: ProductItem) => getCategoryId(p.category) === categoryFilter,
      );
    if (searchTerm)
      f = f.filter((p: ProductItem) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    if (showLowStock) f = f.filter((p: ProductItem) => (p.stock ?? 0) < 5);
    return f
      .slice()
      .sort((a: ProductItem, b: ProductItem) => b._id.localeCompare(a._id));
  }, [products, searchTerm, categoryFilter, showLowStock]);

  const handleOpenDrawer = (product?: ProductItem) => {
    if (product) {
      setEditingProduct(product);
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
      setRawPrice(product.price.toString());
      setRawCompareAt(product.compareAtPrice?.toString() || "");
      setVariants(
        product.variants?.map((v) => ({
          sku: v.sku || "",
          color: v.color || "",
          size: v.size || "",
          price: v.price || 0,
          stock: v.stock || 0,
          compareAtPrice: v.compareAtPrice || 0,
          isActive: v.isActive,
          images: v.images || [],
        })) || [],
      );
    } else {
      setEditingProduct(null);
      reset({
        name: "",
        price: "",
        stock: "",
        category: "",
        description: "",
        brand: "",
        sku: "",
        tags: "",
        compareAtPrice: "",
        discountPercent: "",
        isFeatured: false,
      });
      setRawPrice("");
      setRawCompareAt("");
      setVariants([]);
    }
    setFiles([]);
    setNotifyCustomers(false);
    setIsDrawerOpen(true);
  };

  const confirmDelete = async () => {
    if (!modalAction || modalAction.type !== "delete") return;
    try {
      await deleteProduct(modalAction.id).unwrap();
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
    setModalOpen(false);
    setModalAction(null);
  };
  const handleQuickStock = async (id: string, cur: number, delta: number) => {
    try {
      await updateStock({ id, stock: Math.max(0, cur + delta) }).unwrap();
    } catch {
      toast.error("Failed to update stock");
    }
  };
  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setRaw: React.Dispatch<React.SetStateAction<string>>,
    fieldName: "price" | "compareAtPrice",
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
        if (seenDot) {
          if (decCount < 2) {
            cleaned += ch;
            decCount++;
          }
        } else {
          cleaned += ch;
        }
      } else if (ch === "." && !seenDot) {
        seenDot = true;
        cleaned += ch;
      }
    }
    const newFormatted = formatPriceInput(cleaned);
    let charCount = 0;
    let newCursor = newFormatted.length;
    for (let i = 0; i < newFormatted.length; i++) {
      if (newFormatted[i] !== ",") {
        charCount++;
        if (charCount === nonCommasBefore) {
          newCursor = i + 1;
          break;
        }
      }
    }
    pendingCursorRef.current = newCursor;
    setRaw(cleaned);
    setValue(fieldName, cleaned, { shouldValidate: true });
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const imageUrls: string[] = editingProduct?.images?.slice() || [];
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
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
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
        compareAtPrice: data.compareAtPrice
          ? Number(data.compareAtPrice)
          : undefined,
        stock: Number(data.stock),
        description: data.description || "",
        category: data.category,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        slug: data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        brand: data.brand || undefined,
        sku: data.sku || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        discount:
          data.discountPercent && Number(data.discountPercent) > 0
            ? { percentage: Number(data.discountPercent) }
            : undefined,
        isFeatured: data.isFeatured || false,
        variants: validVariants.length > 0 ? validVariants : undefined,
      };
      if (editingProduct) {
        await updateProduct({ id: editingProduct._id, ...payload }).unwrap();
        toast.success("Product updated successfully");
      } else {
        await createProduct({ ...payload, notifyCustomers }).unwrap();
        toast.success("Product created successfully");
      }
      handleCloseDrawer();
    } catch (err) {
      const e = err as { data?: { message: string } };
      toast.error(e.data?.message || "Error saving product.");
    }
  };

  const handleSendMarketing = async () => {
    if (!marketingProduct) return;
    try {
      await sendMarketingEmail({
        type: marketingType,
        productId: marketingProduct._id,
        customMessage:
          marketingType === "new_arrival" ? customMessage : undefined,
      }).unwrap();
      toast.success("Marketing emails sent!");
      setMarketingOpen(false);
    } catch (err) {
      const e = err as { data?: { message?: string } };
      toast.error(e?.data?.message || "Failed to send emails");
    }
  };

  if (isLoading) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="p-4 md:p-6 pt-16 md:pt-24 max-w-7xl mx-auto space-y-5 pb-28 md:pb-10 focus:outline-none"
        style={{ background: "#0A0A0B" }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductRowSkeleton key={i} dark />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="p-4 md:p-6 pt-16 md:pt-24 max-w-7xl mx-auto space-y-5 pb-28 md:pb-10 focus:outline-none"
      style={{ background: "#0A0A0B" }}
    >
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

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors shrink-0"
            style={{
              background: "#1c1c1c",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            aria-label="Back to admin dashboard"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame
                className="w-3 h-3"
                style={{ color: ACCENT }}
                aria-hidden="true"
              />
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: ACCENT }}
              >
                Admin
              </p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-none">
              Products
            </h1>
            <p className="text-gray-600 text-xs mt-0.5" aria-live="polite">
              {products.length} products in catalog
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenDrawer()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shrink-0"
          style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
          aria-label="Add new product"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Add Product
        </button>
      </header>

      {/* Filter bar */}
      <div
        className="flex flex-col sm:flex-row gap-3 rounded-2xl p-4"
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
        role="search"
        aria-label="Filter products"
      >
        <div className="relative flex-1">
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="product-search"
            type="search"
            placeholder="Search products…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none border border-white/[0.08] focus:border-[#e8622a]/60 transition-all"
          />
        </div>
        <label htmlFor="product-category-filter" className="sr-only">
          Filter by category
        </label>
        <select
          id="product-category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm text-white outline-none border border-white/[0.08] cursor-pointer"
          style={{ background: "#1c1c1c" }}
        >
          {filterCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowLowStock((v) => !v)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border"
          style={{
            background: showLowStock ? "rgba(239,68,68,0.12)" : "#1c1c1c",
            color: showLowStock ? "#f87171" : "#6b7280",
            borderColor: showLowStock
              ? "rgba(239,68,68,0.35)"
              : "rgba(255,255,255,0.08)",
            boxShadow: showLowStock ? "0 0 0 1px rgba(239,68,68,0.2)" : "none",
          }}
          aria-pressed={showLowStock}
        >
          {showLowStock ? "⚠ Low Stock" : "Low Stock"}
        </button>
      </div>

      {/* Products table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}
      >
        <div
          className="overflow-x-auto max-h-[600px] overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: `${ACCENT}40 transparent`,
          }}
        >
          <table className="w-full text-left" aria-label="Products list">
            <caption className="sr-only">
              List of all products with details and actions
            </caption>
            <thead
              className="sticky top-0 z-10"
              style={{
                background: "#1c1c1c",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <tr>
                {["Image", "Name", "Price", "Stock", "Category", "Actions"].map(
                  (h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`px-4 sm:px-5 py-3.5 text-[9px] font-extrabold uppercase tracking-widest text-gray-600 ${i === 5 ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Package
                      className="w-10 h-10 text-gray-700 mx-auto mb-3"
                      aria-hidden="true"
                    />
                    <p className="text-gray-600 text-sm font-semibold">
                      No products found.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product: ProductItem) => (
                  <tr
                    key={product._id}
                    className="border-t transition-colors hover:bg-white/[0.015] group"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}
                  >
                    <td className="px-4 sm:px-5 py-3">
                      <div
                        className="w-11 h-11 rounded-xl overflow-hidden border shrink-0"
                        style={{ borderColor: "rgba(255,255,255,0.08)" }}
                      >
                        <img
                          src={getCloudinaryUrl(
                            product.images?.[0] || PLACEHOLDER,
                            100,
                          )}
                          alt={product.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER;
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <p className="font-bold text-white text-sm max-w-[180px] truncate">
                        {product.name}
                      </p>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <span
                        className="font-black text-sm"
                        style={{ color: ACCENT }}
                      >
                        ₦{product.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="flex items-center rounded-xl overflow-hidden"
                          style={{
                            background: "#1c1c1c",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                          role="group"
                          aria-label={`Stock for ${product.name}: ${product.stock ?? 0}`}
                        >
                          <button
                            onClick={() =>
                              handleQuickStock(
                                product._id,
                                product.stock ?? 0,
                                -1,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
                            aria-label={`Decrease stock of ${product.name}`}
                          >
                            <Minus className="w-3 h-3" aria-hidden="true" />
                          </button>
                          <span
                            className={`w-8 text-center text-sm font-black ${(product.stock ?? 0) < 5 ? "text-red-400" : "text-white"}`}
                            aria-live="polite"
                          >
                            {product.stock ?? 0}
                          </span>
                          <button
                            onClick={() =>
                              handleQuickStock(
                                product._id,
                                product.stock ?? 0,
                                1,
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            aria-label={`Increase stock of ${product.name}`}
                          >
                            <Plus className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </div>
                        {(product.stock ?? 0) < 5 && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold"
                            style={{
                              background: "rgba(239,68,68,0.12)",
                              color: "#f87171",
                            }}
                          >
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{
                          background: `${ACCENT}14`,
                          color: ACCENT,
                          border: `1px solid ${ACCENT}25`,
                        }}
                      >
                        {getCategoryName(product.category)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenDrawer(product)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                          style={{
                            background: "rgba(59,130,246,0.1)",
                            color: "#60a5fa",
                            border: "1px solid rgba(59,130,246,0.2)",
                          }}
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => {
                            setModalAction({ type: "delete", id: product._id });
                            setModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            color: "#f87171",
                            border: "1px solid rgba(239,68,68,0.18)",
                          }}
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => {
                            setMarketingProduct(product);
                            setMarketingType(
                              (product.stock ?? 0) > 0
                                ? "new_arrival"
                                : "back_in_stock",
                            );
                            setCustomMessage("");
                            setMarketingOpen(true);
                          }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                          style={{
                            background: "rgba(16,185,129,0.1)",
                            color: "#34d399",
                            border: "1px solid rgba(16,185,129,0.2)",
                          }}
                          aria-label={`Notify customers about ${product.name}`}
                        >
                          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(0,0,0,0.68)",
                backdropFilter: "blur(8px)",
              }}
              onClick={handleCloseDrawer}
              role="presentation"
              aria-hidden="true"
            />
            <div
              ref={drawerRef}
              className="fixed right-0 top-0 h-full w-full max-w-xl z-50 overflow-y-auto"
              style={{
                background: "#141414",
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
            >
              <div
                className="sticky top-0 z-10 flex justify-between items-center px-6 py-5 border-b"
                style={{
                  background: "#141414",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                <div>
                  <p
                    className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
                    style={{ color: ACCENT }}
                  >
                    {editingProduct ? "Editing" : "New Product"}
                  </p>
                  <h2
                    id="drawer-title"
                    className="text-xl font-black text-white leading-tight"
                  >
                    {editingProduct ? editingProduct.name : "Add New Product"}
                  </h2>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-6 space-y-5"
                aria-label={
                  editingProduct
                    ? `Edit ${editingProduct.name}`
                    : "Create new product"
                }
              >
                {/* Product Name */}
                <div>
                  <DLabel>Product Name</DLabel>
                  <label htmlFor="prod-name" className="sr-only">
                    Product Name
                  </label>
                  <input
                    id="prod-name"
                    {...register("name")}
                    placeholder="e.g. Luxury Lace Wig"
                    className={buildInputCls(!!errors.name)}
                  />
                  {errors.name && (
                    <p
                      className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                      role="alert"
                    >
                      <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <DLabel hint="A brief description of the product.">
                    Description (optional)
                  </DLabel>
                  <label htmlFor="prod-description" className="sr-only">
                    Description
                  </label>
                  <textarea
                    id="prod-description"
                    {...register("description")}
                    rows={3}
                    placeholder="Describe your product..."
                    className={buildInputCls(false) + " resize-none"}
                  />
                </div>

                {/* Price & Stock Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <DLabel>Price (₦)</DLabel>
                    <label htmlFor="prod-price" className="sr-only">
                      Price
                    </label>
                    <input
                      id="prod-price"
                      ref={priceInputRef}
                      type="text"
                      inputMode="decimal"
                      value={formatPriceInput(rawPrice)}
                      onChange={(e) =>
                        handlePriceChange(e, setRawPrice, "price")
                      }
                      placeholder="0.00"
                      className={buildInputCls(!!errors.price)}
                    />
                    {errors.price && (
                      <p
                        className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                        role="alert"
                      >
                        <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <DLabel hint="The original price before discount.">
                      Compare at Price (optional)
                    </DLabel>
                    <label htmlFor="prod-compare-at" className="sr-only">
                      Compare at price
                    </label>
                    <input
                      id="prod-compare-at"
                      ref={compareAtRef}
                      type="text"
                      inputMode="decimal"
                      value={formatPriceInput(rawCompareAt)}
                      onChange={(e) =>
                        handlePriceChange(e, setRawCompareAt, "compareAtPrice")
                      }
                      placeholder="e.g. 5,000"
                      className={buildInputCls(false)}
                    />
                  </div>
                  <div>
                    <DLabel>Stock</DLabel>
                    <label htmlFor="prod-stock" className="sr-only">
                      Stock
                    </label>
                    <input
                      id="prod-stock"
                      type="number"
                      min="0"
                      step="1"
                      {...register("stock")}
                      placeholder="20"
                      className={buildInputCls(!!errors.stock)}
                    />
                    {errors.stock && (
                      <p
                        className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                        role="alert"
                      >
                        <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                        {errors.stock.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <DLabel hint="Enter a discount percentage.">
                      Discount (%)
                    </DLabel>
                    <label htmlFor="prod-discount" className="sr-only">
                      Discount percentage
                    </label>
                    <input
                      id="prod-discount"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      {...register("discountPercent")}
                      placeholder="10"
                      className={buildInputCls(false)}
                    />
                  </div>
                </div>

                {/* Brand & SKU */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <DLabel>Brand (optional)</DLabel>
                    <label htmlFor="prod-brand" className="sr-only">
                      Brand
                    </label>
                    <input
                      id="prod-brand"
                      {...register("brand")}
                      placeholder="e.g. Louis Vuitton"
                      className={buildInputCls(false)}
                    />
                  </div>
                  <div>
                    <DLabel>SKU (optional)</DLabel>
                    <label htmlFor="prod-sku" className="sr-only">
                      SKU
                    </label>
                    <input
                      id="prod-sku"
                      {...register("sku")}
                      placeholder="e.g. APL-123"
                      className={buildInputCls(false)}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <DLabel hint="Comma-separated tags (e.g. New, Sale, Trending)">
                    Tags (optional)
                  </DLabel>
                  <label htmlFor="prod-tags" className="sr-only">
                    Tags
                  </label>
                  <input
                    id="prod-tags"
                    {...register("tags")}
                    placeholder="e.g. New, Sale, Trending"
                    className={buildInputCls(false)}
                  />
                </div>

                {/* Category */}
                <div>
                  <DLabel>Category</DLabel>
                  <label htmlFor="prod-category" className="sr-only">
                    Category
                  </label>
                  <select
                    id="prod-category"
                    {...register("category")}
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white outline-none border border-white/[0.08] focus:border-[#e8622a]/70 transition-all cursor-pointer"
                    style={{ background: "#1c1c1c" }}
                  >
                    <option value="" className="text-gray-600">
                      Select a category…
                    </option>
                    {renderCategoryOptions(categoryTree)}
                  </select>
                  {errors.category && (
                    <p
                      className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                      role="alert"
                    >
                      <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <DLabel hint="Upload product images. First image will be the main image.">
                    Product Images
                  </DLabel>

                  {/* Show existing images if editing */}
                  {editingProduct?.images &&
                    editingProduct.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {editingProduct.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-xl overflow-hidden border border-white/[0.08] aspect-square"
                          >
                            <img
                              src={getCloudinaryUrl(img, 200)}
                              alt={`Product image ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages =
                                  editingProduct.images?.filter(
                                    (_, i) => i !== idx,
                                  ) || [];
                                setEditingProduct({
                                  ...editingProduct,
                                  images: newImages,
                                });
                              }}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={`Remove image ${idx + 1}`}
                            >
                              <X
                                className="w-3 h-3 text-white"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Upload new images */}
                  <label
                    className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-[#e8622a]/60"
                    style={{
                      borderColor: "rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {uploading ? (
                        <>
                          <Loader2
                            className="w-6 h-6 animate-spin"
                            style={{ color: ACCENT }}
                            aria-hidden="true"
                          />
                          <p className="text-xs text-gray-500">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Upload
                            className="w-6 h-6 text-gray-500"
                            aria-hidden="true"
                          />
                          <p className="text-xs text-gray-500">
                            <span
                              className="font-bold"
                              style={{ color: ACCENT }}
                            >
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-[10px] text-gray-600">
                            PNG, JPG, WEBP up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const selectedFiles = Array.from(e.target.files || []);
                        setFiles((prev) => [...prev, ...selectedFiles]);
                      }}
                    />
                  </label>

                  {/* Show newly selected files */}
                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                        New Images ({files.length})
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {files.map((file, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-xl overflow-hidden border border-white/[0.08] aspect-square"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New image ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFiles(files.filter((_, i) => i !== idx))
                              }
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={`Remove new image ${idx + 1}`}
                            >
                              <X
                                className="w-3 h-3 text-white"
                                aria-hidden="true"
                              />
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
                      onClick={() =>
                        setVariants([
                          ...variants,
                          {
                            sku: "",
                            color: "",
                            size: "",
                            price: 0,
                            stock: 0,
                            compareAtPrice: 0,
                          },
                        ])
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                      style={{ background: ACCENT }}
                    >
                      <Plus className="w-3 h-3" aria-hidden="true" /> Add
                      Variant
                    </button>
                  </div>

                  {variants.length > 0 ? (
                    <div className="space-y-3">
                      {variants.map((variant, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border space-y-3"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            borderColor: "rgba(255,255,255,0.07)",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400">
                              Variant {idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setVariants(
                                  variants.filter((_, i) => i !== idx),
                                )
                              }
                              className="text-red-400 hover:text-red-300 transition-colors"
                              aria-label={`Remove variant ${idx + 1}`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor={`variant-${idx}-color`}
                                className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 block mb-1"
                              >
                                Color
                              </label>
                              <input
                                id={`variant-${idx}-color`}
                                type="text"
                                value={variant.color || ""}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[idx].color = e.target.value;
                                  setVariants(newVariants);
                                }}
                                placeholder="e.g. Red"
                                className={buildInputCls(false)}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`variant-${idx}-size`}
                                className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 block mb-1"
                              >
                                Size
                              </label>
                              <input
                                id={`variant-${idx}-size`}
                                type="text"
                                value={variant.size || ""}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[idx].size = e.target.value;
                                  setVariants(newVariants);
                                }}
                                placeholder="e.g. L"
                                className={buildInputCls(false)}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`variant-${idx}-price`}
                                className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 block mb-1"
                              >
                                Price (₦)
                              </label>
                              <input
                                id={`variant-${idx}-price`}
                                type="number"
                                value={variant.price || ""}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[idx].price = Number(
                                    e.target.value,
                                  );
                                  setVariants(newVariants);
                                }}
                                placeholder="0"
                                className={buildInputCls(false)}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`variant-${idx}-stock`}
                                className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 block mb-1"
                              >
                                Stock
                              </label>
                              <input
                                id={`variant-${idx}-stock`}
                                type="number"
                                value={variant.stock || ""}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[idx].stock = Number(
                                    e.target.value,
                                  );
                                  setVariants(newVariants);
                                }}
                                placeholder="0"
                                className={buildInputCls(false)}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`variant-${idx}-compare-at`}
                                className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 block mb-1"
                              >
                                Compare At Price
                              </label>
                              <input
                                id={`variant-${idx}-compare-at`}
                                type="number"
                                value={variant.compareAtPrice || ""}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[idx].compareAtPrice = Number(
                                    e.target.value,
                                  );
                                  setVariants(newVariants);
                                }}
                                placeholder="0"
                                className={buildInputCls(false)}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor={`variant-${idx}-sku`}
                                className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 block mb-1"
                              >
                                SKU
                              </label>
                              <input
                                id={`variant-${idx}-sku`}
                                type="text"
                                value={variant.sku || ""}
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[idx].sku = e.target.value;
                                  setVariants(newVariants);
                                }}
                                placeholder="e.g. VAR-001"
                                className={buildInputCls(false)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 text-center py-4">
                      No variants added yet. Click "Add Variant" to create one.
                    </p>
                  )}
                </div>

                {/* Featured toggle */}
                <div
                  className="flex items-center justify-between p-4 rounded-xl border"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <span
                    id="featured-label"
                    className="text-white text-sm font-bold"
                  >
                    Featured Product
                  </span>
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
                      style={{
                        transform: isFeatured
                          ? "translateX(20px)"
                          : "translateX(0)",
                      }}
                    />
                  </button>
                </div>

                {/* Notify customers toggle - only for new products */}
                {!editingProduct && (
                  <div
                    className="flex items-center justify-between p-4 rounded-xl border"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(255,255,255,0.07)",
                    }}
                  >
                    <span
                      id="notify-label"
                      className="text-white text-sm font-bold"
                    >
                      Notify customers
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifyCustomers((v) => !v)}
                      className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0"
                      style={{
                        background: notifyCustomers ? ACCENT : "#2d2d2d",
                      }}
                      role="switch"
                      aria-checked={notifyCustomers}
                      aria-labelledby="notify-label"
                    >
                      <span
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300"
                        style={{
                          transform: notifyCustomers
                            ? "translateX(20px)"
                            : "translateX(0)",
                        }}
                      />
                    </button>
                  </div>
                )}

                {/* Footer buttons */}
                <div
                  className="flex justify-end gap-3 pt-4 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="px-5 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors"
                    style={{
                      background: "#1c1c1c",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55"
                    style={{
                      background: ACCENT,
                      boxShadow: `0 6px 18px ${ACCENT}44`,
                    }}
                  >
                    {isSubmitting || uploading ? (
                      <>
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          aria-hidden="true"
                        />{" "}
                        Saving…
                      </>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Save Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Marketing Email Modal */}
      <AnimatePresence>
        {marketingOpen && marketingProduct && (
          <>
            <div
              className="fixed inset-0 z-50"
              style={{
                background: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(8px)",
              }}
              onClick={() => setMarketingOpen(false)}
              role="presentation"
              aria-hidden="true"
            />
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="marketing-modal-title"
            >
              <div
                ref={marketingModalRef}
                className="relative w-full max-w-md rounded-2xl p-6"
                style={{
                  background: "#141414",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
                  style={{
                    background: `linear-gradient(90deg, transparent, #10b981, transparent)`,
                  }}
                />
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <p
                      className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-0.5"
                      style={{ color: "#10b981" }}
                    >
                      Email Campaign
                    </p>
                    <h2
                      id="marketing-modal-title"
                      className="text-xl font-black text-white"
                    >
                      Notify Customers
                    </h2>
                  </div>
                  <button
                    onClick={() => setMarketingOpen(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  Sending email to all customers about{" "}
                  <strong className="text-white">
                    {marketingProduct.name}
                  </strong>
                  .
                </p>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="marketing-type"
                      className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2"
                    >
                      Email Type
                    </label>
                    <select
                      id="marketing-type"
                      value={marketingType}
                      onChange={(e) =>
                        setMarketingType(
                          e.target.value as "new_arrival" | "back_in_stock",
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border border-white/[0.08] focus:border-emerald-500/60 cursor-pointer"
                      style={{ background: "#1c1c1c" }}
                    >
                      <option value="new_arrival">New Arrival</option>
                      <option value="back_in_stock">Back in Stock</option>
                    </select>
                  </div>
                  {marketingType === "new_arrival" && (
                    <div>
                      <label
                        htmlFor="marketing-message"
                        className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2"
                      >
                        Custom Message (optional)
                      </label>
                      <textarea
                        id="marketing-message"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={3}
                        placeholder="Write a short message for customers…"
                        className="w-full px-4 py-3 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none resize-none border border-white/[0.08] focus:border-emerald-500/60 transition-all"
                      />
                    </div>
                  )}
                  <div
                    className="flex justify-end gap-3 pt-3 border-t"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <button
                      onClick={() => setMarketingOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors"
                      style={{
                        background: "#1c1c1c",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendMarketing}
                      disabled={isSendingMarketing}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-55"
                      style={{
                        background: "#10b981",
                        boxShadow: "0 6px 18px rgba(16,185,129,0.35)",
                      }}
                      aria-label={
                        isSendingMarketing
                          ? "Sending emails"
                          : `Send ${marketingType === "new_arrival" ? "new arrival" : "back in stock"} email about ${marketingProduct.name}`
                      }
                    >
                      {isSendingMarketing ? (
                        <>
                          <Loader2
                            className="w-4 h-4 animate-spin"
                            aria-hidden="true"
                          />{" "}
                          Sending…
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" aria-hidden="true" /> Send
                          Emails
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Products;