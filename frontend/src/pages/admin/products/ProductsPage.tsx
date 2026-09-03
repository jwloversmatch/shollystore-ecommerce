import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useUpdateStockMutation,
} from "../../../features/api/apiSlice";
import { Search, Plus, Flame, ArrowLeft, FileSpreadsheet } from "lucide-react";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { ProductRowSkeleton } from "../../../components/Skeletons";
import { useTheme } from "../../../context/ThemeContext";
import ProductDrawer from "./ProductDrawer";
import MarketingModal from "./MarketingModal";
import ProductTable from "./ProductTable";
import BulkProductUpload from "./BulkProductUpload";
import type { ProductItem } from "../../../types/home";

const ACCENT = "#e8622a";

const getCategoryId = (cat: ProductItem["category"]): string => {
  if (!cat) return "";
  return typeof cat === "string" ? cat : cat._id;
};

const handleExportCSV = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const url = `${import.meta.env.VITE_API_URL}/admin/products/export`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `products-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error("CSV export failed:", err);
    toast.error("Failed to export products");
  }
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    data: productsData,
    isLoading,
    refetch, // ✅ added refetch for instant refresh
  } = useGetProductsQuery({ limit: 9999 });

  const products = useMemo<ProductItem[]>(
    () => productsData?.products ?? [],
    [productsData?.products],
  );

  const [deleteProduct] = useDeleteProductMutation();
  const [updateStock] = useUpdateStockMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter] = useState("All");
  const [showLowStock, setShowLowStock] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<{
    type: "delete";
    id: string;
  } | null>(null);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [marketingProduct, setMarketingProduct] = useState<ProductItem | null>(
    null,
  );
  const [bulkOpen, setBulkOpen] = useState(false);

  // Theme styles
  const bg = isDark ? "#0A0A0B" : "#FCFAF5";
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  // ✅ Enhanced search filter
  const filteredProducts = useMemo(() => {
    let f = products;
    if (categoryFilter !== "All")
      f = f.filter((p) => getCategoryId(p.category) === categoryFilter);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      f = f.filter((p) => {
        const categoryName =
          typeof p.category === "string"
            ? p.category
            : p.category?.name?.toLowerCase() || "";
        const sku = p.sku?.toLowerCase() || "";
        const brand = p.brand?.toLowerCase() || "";
        const tags = (p.tags || []).join(" ").toLowerCase();

        return (
          p.name.toLowerCase().includes(term) ||
          categoryName.includes(term) ||
          sku.includes(term) ||
          brand.includes(term) ||
          tags.includes(term)
        );
      });
    }

    if (showLowStock) f = f.filter((p) => (p.stock ?? 0) < 5);
    return f.slice().sort((a, b) => b._id.localeCompare(a._id));
  }, [products, searchTerm, categoryFilter, showLowStock]);

  const handleOpenDrawer = (product?: ProductItem) => {
    setEditingProduct(product || null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
  };

  const confirmDelete = async () => {
    if (!modalAction || modalAction.type !== "delete") return;
    try {
      await deleteProduct(modalAction.id).unwrap();
      toast.success("Product deleted");
      refetch(); // ✅ refresh after delete
    } catch {
      toast.error("Failed to delete product");
    }
    setModalOpen(false);
    setModalAction(null);
  };

  const handleQuickStock = async (id: string, cur: number, delta: number) => {
    try {
      await updateStock({ id, stock: Math.max(0, cur + delta) }).unwrap();
      refetch(); // ✅ refresh after stock change
    } catch {
      toast.error("Failed to update stock");
    }
  };

  const handleDeleteClick = (id: string) => {
    setModalAction({ type: "delete", id });
    setModalOpen(true);
  };

  const handleMarketingClick = (product: ProductItem) => {
    setMarketingProduct(product);
    setMarketingOpen(true);
  };

  if (isLoading) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 pb-28 md:pb-10 focus:outline-none pt-[calc(80px+env(safe-area-inset-top,0px))] md:pt-[calc(96px+env(safe-area-inset-top,0px))]"
        style={{ background: bg }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductRowSkeleton key={i} dark={isDark} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 pb-28 md:pb-10 focus:outline-none pt-[calc(80px+env(safe-area-inset-top,0px))] md:pt-[calc(96px+env(safe-area-inset-top,0px))]"
      style={{ background: bg }}
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

      {/* Bulk upload modal */}
      <AnimatePresence>
        {bulkOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setBulkOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <BulkProductUpload onClose={() => setBulkOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textMuted,
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
            <h1
              className="text-2xl md:text-3xl font-black leading-none"
              style={{ color: textPrimary }}
            >
              Products
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: textMuted }}
              aria-live="polite"
            >
              {products.length} products in catalog
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0 border"
            style={{
              background: inputBg,
              borderColor: inputBorder,
              color: "#10b981",
            }}
            aria-label="Export products to CSV"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Bulk import button */}
          <button
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0 border"
            style={{
              background: inputBg,
              borderColor: inputBorder,
              color: textPrimary,
            }}
            aria-label="Bulk import products"
          >
            <FileSpreadsheet className="w-4 h-4" aria-hidden="true" /> Bulk
            Import
          </button>

          {/* Add product button */}
          <button
            onClick={() => handleOpenDrawer()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm shrink-0"
            style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}
            aria-label="Add new product"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> Add Product
          </button>
        </div>
      </header>

      {/* Filter bar */}
      <div
        className="flex flex-col sm:flex-row gap-3 rounded-2xl p-4"
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        role="search"
        aria-label="Filter products"
      >
        <div className="relative flex-1">
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: textMuted }}
            aria-hidden="true"
          />
          <input
            id="product-search"
            type="search"
            placeholder="Search by name, category, SKU, brand, or tags…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border transition-all"
            style={{
              background: inputBg,
              borderColor: inputBorder,
              color: textPrimary,
            }}
          />
        </div>
        <button
          onClick={() => setShowLowStock((v) => !v)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border"
          style={{
            background: showLowStock ? "rgba(239,68,68,0.12)" : inputBg,
            color: showLowStock ? "#f87171" : textMuted,
            borderColor: showLowStock ? "rgba(239,68,68,0.35)" : inputBorder,
          }}
          aria-pressed={showLowStock}
        >
          {showLowStock ? "⚠ Low Stock" : "Low Stock"}
        </button>
      </div>

      {/* Products table */}
      <ProductTable
        products={filteredProducts}
        onEdit={handleOpenDrawer}
        onDelete={handleDeleteClick}
        onMarketing={handleMarketingClick}
        onStockUpdate={handleQuickStock}
        isDark={isDark}
      />

      {/* Slide-in Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <ProductDrawer
            key={editingProduct?._id || "new"}
            product={editingProduct}
            onClose={handleCloseDrawer}
            isDark={isDark}
            onSaved={refetch}   
          />
        )}
      </AnimatePresence>

      {/* Marketing Modal */}
      <AnimatePresence>
        {marketingOpen && marketingProduct && (
          <MarketingModal
            product={marketingProduct}
            onClose={() => setMarketingOpen(false)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default ProductsPage;