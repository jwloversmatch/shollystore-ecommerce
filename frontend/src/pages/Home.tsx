import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useGetProductsQuery,
  useGetHeroSlidesQuery,
  useGetCategoriesQuery,
  useGetPublicSettingsQuery,
} from "../features/api/apiSlice";
import Footer from "./Footer";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import ProductQuickViewModal from "../components/ProductQuickViewModal";
import type { ProductItem, CategoryItem } from "../types/home";
import { ACCENT } from "../types/home";

// Import all home sub‑components
import HomeLoading from "./home/HomeLoading";
import HomeHero from "./home/HomeHero";
import HomeMarquee from "./home/HomeMarquee";
import HomeFeatures from "./home/HomeFeatures";
import HomeCategoryBrowser from "./home/HomeCategoryBrowser";
import HomeProductGrid from "./home/HomeProductGrid";
import HomeSpecialOffer from "./home/HomeSpecialOffer";

const Home = () => {
  const { data: products, isLoading: pLoad } = useGetProductsQuery({});
  const { data: heroSlides, isLoading: sLoad } = useGetHeroSlidesQuery({});
  const { data: categories = [], isLoading: cLoad } = useGetCategoriesQuery({});
  const { data: publicSettings } = useGetPublicSettingsQuery({});

  const landingMode = publicSettings?.landingMode || false;
  const isPageLoading = pLoad || sLoad || cLoad;

  const displayProducts = useMemo<ProductItem[]>(
    () => products || [],
    [products]
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [modalProduct, setModalProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    if (!heroSlides?.length) return;
    const id = setInterval(() => {
      setDirection(1);
      setCurrentIndex((p) => (p + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [heroSlides]);

  const handleNext = () => {
    if (!heroSlides?.length) return;
    setDirection(1);
    setCurrentIndex((p) => (p + 1) % heroSlides.length);
  };
  const handlePrev = () => {
    if (!heroSlides?.length) return;
    setDirection(-1);
    setCurrentIndex((p) => (p - 1 + heroSlides.length) % heroSlides.length);
  };

  const categoryList = useMemo(
    () => ["All", ...categories.map((c: CategoryItem) => c.name)],
    [categories]
  );
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: displayProducts.length };
    categories.forEach((c: CategoryItem) => {
      counts[c.name] = displayProducts.filter(
        (p) => p.category === c.name
      ).length;
    });
    return counts;
  }, [displayProducts, categories]);

  const filteredProducts = useMemo(() => {
    let f = displayProducts;
    if (selectedCategory !== "All")
      f = f.filter((p) => p.category === selectedCategory);
    if (searchTerm.trim())
      f = f.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return f.slice().sort((a, b) => b._id.localeCompare(a._id));
  }, [displayProducts, selectedCategory, searchTerm]);

  const heroTagline = publicSettings?.heroTagline || "🔥 Premium Food Store";
  const heroTitle =
    publicSettings?.heroTitle || "Taste the | Difference";
  const heroDescription =
    publicSettings?.heroDescription ||
    "Premium ingredients, unbeatable prices. Everything your kitchen needs, delivered fast.";
  const specialOfferTitle =
    publicSettings?.specialOfferTitle || "Today's Special";
  const specialOfferText =
    publicSettings?.specialOfferText ||
    "Get ₦500 off your first order over ₦10,000. Use code FIRST500";

  const [heroPart1, heroPart2] = heroTitle.includes("|")
    ? heroTitle.split("|").map((s: string) => s.trim())
    : [heroTitle, ""];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: heroTitle.replace("|", "").trim(),
    url: "https://shollystore-ecommerce.vercel.app",
    logo: "https://shollystore-ecommerce.vercel.app/logo.png",
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://shollystore-ecommerce.vercel.app",
  };

  if (isPageLoading) return <HomeLoading />;

  const categoryNames = categories.map((c: CategoryItem) => c.name);

  return (
    <div className="min-h-screen bg-[#0A0A0B] relative overflow-x-hidden">
      <SEO
        title={heroTitle.replace("|", "").trim()}
        description={heroDescription}
        canonicalUrl="https://shollystore-ecommerce.vercel.app"
      />
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />

      {/* Ambient background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ["-15%", "15%", "-15%"], y: ["-8%", "8%", "-8%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07]"
          style={{ background: ACCENT }}
        />
        <motion.div
          animate={{ x: ["15%", "-15%", "15%"], y: ["8%", "-8%", "8%"] }}
          transition={{ repeat: Infinity, duration: 38, ease: "linear" }}
          className="absolute bottom-0 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.05]"
          style={{ background: "#10b981" }}
        />
      </div>

      <HomeHero
        landingMode={landingMode}
        heroTagline={heroTagline}
        heroTitle={heroTitle}
        heroDescription={heroDescription}
        heroPart1={heroPart1}
        heroPart2={heroPart2}
        displayProductsCount={displayProducts.length}
        heroSlides={heroSlides}
        currentIndex={currentIndex}
        direction={direction}
        handlePrev={handlePrev}
        handleNext={handleNext}
        setDirection={setDirection}
        setCurrentIndex={setCurrentIndex}
      />

      <HomeMarquee categoryNames={categoryNames} />
      <HomeFeatures />
      <HomeCategoryBrowser
        categoryList={categoryList}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
      />
      <HomeProductGrid
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredProducts={filteredProducts}
        categoryList={categoryList}
        setModalProduct={setModalProduct}
      />
      <HomeSpecialOffer
        specialOfferTitle={specialOfferTitle}
        specialOfferText={specialOfferText}
      />

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