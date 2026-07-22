import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";        // ✅ new
import { RootState } from "../store";              // ✅ new
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

import HomeLoading from "./home/HomeLoading";
import HomeHero from "./home/HomeHero";
import HomeMarquee from "./home/HomeMarquee";
import HomeFeatures from "./home/HomeFeatures";
import HomeCategoryBrowser from "./home/HomeCategoryBrowser";
import HomeSpecialOffer from "./home/HomeSpecialOffer";
import FeaturedProductsGrid from "../components/FeaturedProductsGrid";
import { ArrowRight } from "lucide-react";

const getProductCategoryName = (p: ProductItem): string => {
  if (!p.category) return "General";
  return typeof p.category === "string" ? p.category : p.category.name ?? "General";
};

const Home = () => {
  const { data: productsResp } = useGetProductsQuery({ limit: 9999 });
  const { data: heroSlides, isLoading: sLoad } = useGetHeroSlidesQuery({});
  const { data: categories = [], isLoading: cLoad } = useGetCategoriesQuery({});
  const { data: publicSettings } = useGetPublicSettingsQuery({});
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);   // ✅ new

  // ✅ Redirect authenticated users to shop
  useEffect(() => {
    if (user) {
      navigate("/shop", { replace: true });
    }
  }, [user, navigate]);

  const landingMode = publicSettings?.landingMode || false;
  const isPageLoading = !productsResp || sLoad || cLoad;

  const displayProducts = useMemo<ProductItem[]>(
    () => productsResp?.products || [],
    [productsResp]
  );

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

  const categoryData = useMemo(() => {
    return categories.map((c: CategoryItem) => ({
      name: c.name,
      slug: c.slug,
      count: displayProducts.filter(
        (p) => getProductCategoryName(p) === c.name
      ).length,
    }));
  }, [categories, displayProducts]);

  const heroTagline = publicSettings?.heroTagline || "🔥 Your One‑Stop Shop";
  const heroTitle = publicSettings?.heroTitle || "Shop the | Best Deals";
  const heroDescription =
    publicSettings?.heroDescription ||
    "Quality products, unbeatable prices. Everything you need, delivered fast.";
  const specialOfferTitle = publicSettings?.specialOfferTitle || "Special Offer";
  const specialOfferText =
    publicSettings?.specialOfferText ||
    "Get ₦500 off your first order over ₦10,000. Use code FIRST500";

  const [heroPart1, heroPart2] = heroTitle.includes("|")
    ? heroTitle.split("|").map((s: string) => s.trim())
    : [heroTitle, ""];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ShollyStore",
    url: "https://shollystore-ecommerce.vercel.app",
    logo: "https://shollystore-ecommerce.vercel.app/logo.png",
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://shollystore-ecommerce.vercel.app",
  };

  // If user is logged in, the effect above will redirect, so we can show a brief loading/fallback
  if (user) {
    return <HomeLoading />;
  }

  if (isPageLoading) return <HomeLoading />;

  const categoryNames = categories.map((c: CategoryItem) => c.name);

  return (
    <div className="min-h-screen bg-[#0A0A0B] relative overflow-x-hidden">
      <SEO title={heroTitle.replace("|", "").trim()} description={heroDescription} canonicalUrl="https://shollystore-ecommerce.vercel.app" />
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

      {/* Enter Shop CTA */}
      <section className="py-10 bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Ready to explore?</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">Browse our full catalog of products across all categories.</p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 18px 44px ${ACCENT}55` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-lg text-white"
              style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
            >
              Enter Shop <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <HomeMarquee categoryNames={categoryNames} />
      <HomeFeatures />

      <HomeCategoryBrowser categories={categoryData} />

      <section className="bg-[#111111] py-14 md:py-18">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-2" style={{ color: ACCENT }}>Featured</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Best Sellers</h2>
          </div>
          <FeaturedProductsGrid />
        </div>
      </section>

      <HomeSpecialOffer specialOfferTitle={specialOfferTitle} specialOfferText={specialOfferText} />

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