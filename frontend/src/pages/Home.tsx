import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetProductsQuery,
  useGetHeroSlidesQuery,
  useGetCategoriesQuery,
} from "../features/api/apiSlice";
import ProductCard from "../components/ProductCard";
import Footer from "./Footer";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CreditCard,
  Star,
  Sparkles,
  ArrowRight,
  Search,
} from "lucide-react";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import { ProductCardSkeleton } from "../components/Skeletons";

// ---------- Interfaces ----------
interface ProductItem {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  category?: string;
  stock?: number;
  slug?: string;
  description?: string;
}

interface HeroSlide {
  _id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  order: number;
  isActive: boolean;
}

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

const PLACEHOLDER = "https://via.placeholder.com/600x600?text=No+Image";

// ---------- Animation variants ----------
const fadeInUpHidden = { opacity: 0, y: 40 };
const fadeInUpVisible = (i = 0) => ({
  opacity: 1,
  y: 0,
  transition: {
    delay: i * 0.1,
    duration: 0.6,
    ease: "easeOut" as const,
  },
});

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 200 : -200,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -200 : 200,
    opacity: 0,
    scale: 0.95,
  }),
};

// ---------- Component ----------
const Home = () => {
  const { data: products, isLoading: productsLoading } = useGetProductsQuery(
    {},
  );
  const { data: heroSlides, isLoading: slidesLoading } = useGetHeroSlidesQuery(
    {},
  );
  const { data: categories = [], isLoading: categoriesLoading } =
    useGetCategoriesQuery({});

  const isPageLoading = productsLoading || slidesLoading || categoriesLoading;

  const displayProducts = useMemo<ProductItem[]>(
    () => products || [],
    [products],
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Quick‑view modal
  const [modalProduct, setModalProduct] = useState<ProductItem | null>(null);

  // Auto‑slide
  useEffect(() => {
    if (!heroSlides || heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides]);

  const handleNext = () => {
    if (!heroSlides || heroSlides.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
  };
  const handlePrev = () => {
    if (!heroSlides || heroSlides.length === 0) return;
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  // Category list with counts
  const categoryList = useMemo(() => {
    const names = categories.map((c: CategoryItem) => c.name);
    return ["All", ...names];
  }, [categories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: displayProducts.length };
    categories.forEach((cat: CategoryItem) => {
      counts[cat.name] = displayProducts.filter(
        (p) => p.category === cat.name,
      ).length;
    });
    return counts;
  }, [displayProducts, categories]);

  const filteredProducts = useMemo(() => {
    let filtered = displayProducts;
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return filtered.slice().sort((a, b) => b._id.localeCompare(a._id));
  }, [displayProducts, selectedCategory, searchTerm]);

  // ---------- JSON-LD Schemas ----------
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LotceWieth",
    url: "https://shollystore-ecommerce.vercel.app",
    logo: "https://shollystore-ecommerce.vercel.app/logo.png",
    sameAs: [
      "https://facebook.com/lotcewieth",
      "https://instagram.com/lotcewieth",
      "https://twitter.com/lotcewieth",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+234-800-000-0000",
      contactType: "customer service",
      areaServed: "NG",
      availableLanguage: "en",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://shollystore-ecommerce.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://shollystore-ecommerce.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  // Loading state – show skeleton grid
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pastel-pink via-pastel-green to-white pt-20 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* SEO & Structured Data */}
      <SEO
        title="Your Everyday Drink Superstore"
        description="LotceWieth brings the coldest, most refreshing beverages straight to your doorstep across Nigeria. From classic Fanta and Coke to refreshing Malt and premium bottled water — all available in convenient packs."
        canonicalUrl="https://shollystore-ecommerce.vercel.app"
      />
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />

      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ["-10%", "10%", "-10%"], y: ["-5%", "5%", "-5%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-blob-orange/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: ["10%", "-10%", "10%"], y: ["5%", "-5%", "5%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute top-1/3 -right-20 w-96 h-96 bg-leaf-green/20 rounded-full blur-3xl"
        />
      </div>

      {/* ========== 1. HERO SECTION ========== */}
      <section className="relative max-w-7xl mx-auto px-6 pt-28 md:pt-36 pb-20 md:pb-28 grid md:grid-cols-2 items-center gap-12">
        {/* Left Content – Staggered */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <motion.span
            variants={{ hidden: fadeInUpHidden, visible: fadeInUpVisible }}
            custom={0}
            className="bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-blob-orange inline-block border border-white/40 shadow-sm"
          >
            📦 Bulk Beverage Store
          </motion.span>
          <motion.h1
            variants={{ hidden: fadeInUpHidden, visible: fadeInUpVisible }}
            custom={1}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1]"
          >
            Your Everyday{" "}
            <span className="bg-gradient-to-r from-leaf-green to-emerald-500 bg-clip-text text-transparent">
              Drink Superstore
            </span>
          </motion.h1>
          <motion.p
            variants={{ hidden: fadeInUpHidden, visible: fadeInUpVisible }}
            custom={2}
            className="text-gray-600 text-lg md:text-xl max-w-md"
          >
            From classic Fanta and Coke to refreshing Malt and premium bottled
            water — all available in convenient packs.
          </motion.p>
          <motion.div
            variants={{ hidden: fadeInUpHidden, visible: fadeInUpVisible }}
            custom={3}
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(251, 146, 60, 0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                document
                  .getElementById("products-grid")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-blob-orange text-white px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
            >
              Explore Our Range
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Right: Carousel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center items-center h-[450px] md:h-[550px]"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative w-full max-w-lg aspect-square group"
          >
            {heroSlides && heroSlides.length > 0 ? (
              <>
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.img
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    src={heroSlides[currentIndex].imageUrl}
                    alt={heroSlides[currentIndex].title || "Hero slide"}
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER;
                    }}
                    className="w-full h-full object-contain drop-shadow-2xl absolute inset-0"
                  />
                </AnimatePresence>

                {/* Navigation arrows */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white z-10"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white z-10"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </motion.button>

                {/* Dots */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {heroSlides.map((_: HeroSlide, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        idx === currentIndex
                          ? "bg-leaf-green w-8"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-3xl text-gray-500">
                No hero slides yet.
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ========== 2. WHY CHOOSE US ========== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            {
              icon: <Package className="w-8 h-8" />,
              title: "Bulk Packs",
              desc: "Stock up for home, office, or events.",
              color: "text-leaf-green",
            },
            {
              icon: <Truck className="w-8 h-8" />,
              title: "Fast Delivery",
              desc: "Reliable delivery across Nigeria.",
              color: "text-blob-orange",
            },
            {
              icon: <CreditCard className="w-8 h-8" />,
              title: "Secure Payments",
              desc: "Paystack, Bank Transfer & WhatsApp.",
              color: "text-blue-600",
            },
            {
              icon: <Star className="w-8 h-8" />,
              title: "Authentic Brands",
              desc: "100% trusted and genuine products.",
              color: "text-yellow-500",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={{ hidden: fadeInUpHidden, visible: fadeInUpVisible }}
              custom={idx}
              whileHover={{
                y: -8,
                boxShadow: "0 20px 30px -10px rgba(0,0,0,0.1)",
              }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 text-center transition-shadow"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className={`bg-pastel-pink/30 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center mb-4 ${item.color}`}
              >
                {item.icon}
              </motion.div>
              <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ========== 3. SHOP BY CATEGORY ========== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Shop by Category
          </h2>
          {selectedCategory !== "All" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedCategory("All")}
              className="text-sm text-leaf-green font-medium hover:underline"
            >
              Clear filter
            </motion.button>
          )}
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {categoryList
            .filter((cat) => cat !== "All")
            .map((cat) => (
              <motion.button
                key={cat}
                variants={{ hidden: fadeInUpHidden, visible: fadeInUpVisible }}
                whileHover={{ scale: 1.03, backgroundColor: "#f0fdf4" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat)}
                className={`relative bg-white/80 backdrop-blur-sm rounded-2xl border p-5 flex flex-col items-center gap-2 transition-all ${
                  selectedCategory === cat
                    ? "border-leaf-green ring-2 ring-leaf-green/30 shadow-md"
                    : "border-gray-100 shadow-sm"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-pastel-pink/30 flex items-center justify-center text-2xl">
                  🍹
                </div>
                <span className="font-medium text-gray-700 text-sm">{cat}</span>
                {categoryCounts[cat] > 0 && (
                  <span className="absolute -top-1 -right-1 bg-leaf-green text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                    {categoryCounts[cat]}
                  </span>
                )}
                {selectedCategory === cat && (
                  <motion.div
                    layoutId="selectedCategory"
                    className="absolute inset-0 rounded-2xl border-2 border-leaf-green"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
        </motion.div>
      </section>

      {/* ========== 4. PRODUCTS GRID (with search + original popLayout animation) ========== */}
      <section
        id="products-grid"
        className="max-w-7xl mx-auto px-4 md:px-6 mt-12 md:mt-16"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            {selectedCategory === "All" ? "Our Best Sellers" : selectedCategory}
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-leaf-green text-sm bg-white/70"
              />
            </div>
            {/* Category filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categoryList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-leaf-green text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-leaf-green"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ✅ Original popLayout animation – products scale in and out */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
  <AnimatePresence mode="wait">
    {filteredProducts.map((product: ProductItem) => (
      <motion.div
        key={product._id}
        layout
        initial={{ opacity: 0, y: 40 }}          // start 40px below
        animate={{ opacity: 1, y: 0 }}           // slide up to normal position
        exit={{ opacity: 0 }}                     // just fade out
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <ProductCard
          _id={product._id}
          name={product.name}
          price={product.price}
          image={product.images?.[0] || "https://via.placeholder.com/150"}
          category={product.category || "General"}
          stock={product.stock}
          onClick={() => setModalProduct(product)}
        />
      </motion.div>
    ))}
  </AnimatePresence>
</motion.div>
      </section>

      {/* ========== 5. SPECIAL OFFERS BANNER ========== */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-16 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative bg-gradient-to-r from-blob-orange/20 to-leaf-green/20 rounded-3xl p-10 md:p-14 text-center border border-white/40 backdrop-blur-sm overflow-hidden"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute top-5 right-5 text-leaf-green/40"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Stock Up & Save
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
            Get{" "}
            <motion.span
              whileHover={{ scale: 1.1 }}
              className="font-bold text-leaf-green inline-block"
            >
              ₦500 off
            </motion.span>{" "}
            your first bulk order of ₦10,000 or more. Use code{" "}
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="font-bold bg-leaf-green/10 px-3 py-1 rounded-lg text-leaf-green"
            >
              FIRST500
            </motion.span>
          </p>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(74, 143, 41, 0.3)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              document
                .getElementById("products-grid")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-leaf-green text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-green-700 transition-all flex items-center gap-2 mx-auto"
          >
            Shop Now
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>

      {/* Quick‑view modal */}
      <ProductQuickViewModal
        product={modalProduct}
        isOpen={!!modalProduct}
        onClose={() => setModalProduct(null)}
      />

      <Footer />
    </div>
  );
};

export default Home;
