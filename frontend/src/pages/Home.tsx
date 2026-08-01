import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../store";
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
  return typeof p.category === "string"
    ? p.category
    : (p.category.name ?? "General");
};

// ─── Decorative floating icons for the background ──────────────────────────
const floatingIcons = [
  { icon: "🛍️", size: "text-2xl", x: "5%", y: "15%", duration: 18, delay: 0 },
  { icon: "📦", size: "text-xl", x: "92%", y: "25%", duration: 22, delay: 1.5 },
  { icon: "💎", size: "text-3xl", x: "15%", y: "65%", duration: 20, delay: 0.8 },
  { icon: "🚀", size: "text-xl", x: "85%", y: "55%", duration: 19, delay: 2.2 },
  { icon: "⭐", size: "text-2xl", x: "45%", y: "80%", duration: 21, delay: 1 },
  { icon: "🔥", size: "text-lg", x: "75%", y: "10%", duration: 17, delay: 0.5 },
  { icon: "💫", size: "text-xl", x: "30%", y: "45%", duration: 24, delay: 3 },
  { icon: "✨", size: "text-2xl", x: "60%", y: "70%", duration: 20, delay: 1.8 },
  { icon: "🎯", size: "text-lg", x: "10%", y: "85%", duration: 23, delay: 2.5 },
  { icon: "🏷️", size: "text-xl", x: "88%", y: "75%", duration: 18, delay: 0.3 },
  { icon: "🎁", size: "text-2xl", x: "50%", y: "12%", duration: 21, delay: 1.2 },
  { icon: "💳", size: "text-lg", x: "22%", y: "35%", duration: 19, delay: 2.8 },
];

const Home = () => {
  const { data: productsResp } = useGetProductsQuery({ limit: 9999 });
  const { data: heroSlides, isLoading: sLoad } = useGetHeroSlidesQuery({});
  const { data: categories = [], isLoading: cLoad } = useGetCategoriesQuery({});
  const { data: publicSettings } = useGetPublicSettingsQuery({});
  const navigate = useNavigate();
  const { user } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/shop", { replace: true });
      }
    }
  }, [user, navigate]);

  const landingMode = publicSettings?.landingMode || false;
  const isPageLoading = !productsResp || sLoad || cLoad;

  const displayProducts = useMemo<ProductItem[]>(
    () => productsResp?.products || [],
    [productsResp],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [modalProduct, setModalProduct] = useState<ProductItem | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (!heroSlides?.length || prefersReducedMotion || isCarouselPaused) return;
    const id = setInterval(() => {
      setDirection(1);
      setCurrentIndex((p) => (p + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [heroSlides, prefersReducedMotion, isCarouselPaused]);

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
      count: displayProducts.filter((p) => getProductCategoryName(p) === c.name)
        .length,
    }));
  }, [categories, displayProducts]);

  const heroTagline = publicSettings?.heroTagline || "🔥 Your One‑Stop Shop";
  const heroTitle = publicSettings?.heroTitle || "Shop the | Best Deals";
  const heroDescription =
    publicSettings?.heroDescription ||
    "Quality products, unbeatable prices. Everything you need, delivered fast.";
  const specialOfferTitle =
    publicSettings?.specialOfferTitle || "Special Offer";
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

  if (user) return <HomeLoading />;
  if (isPageLoading) return <HomeLoading />;

  const categoryNames = categories.map((c: CategoryItem) => c.name);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen relative overflow-x-hidden focus:outline-none pt-14 md:pt-20"
      style={{
        background: "linear-gradient(180deg, #FCFAF5 0%, #FFF8F3 30%, #FCFAF5 60%, #FFF5F0 100%)",
      }}
    >
      <SEO
        title={heroTitle.replace("|", "").trim()}
        description={heroDescription}
        canonicalUrl="https://shollystore-ecommerce.vercel.app"
      />
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />

      {/* ══════ Rich Background Elements ══════ */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        
        {/* Large ambient gradient orbs */}
        <motion.div
          animate={{ x: ["-20%", "15%", "-20%"], y: ["-10%", "10%", "-10%"] }}
          transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[150px]"
          style={{ background: `${ACCENT}`, opacity: 0.06 }}
        />
        <motion.div
          animate={{ x: ["15%", "-20%", "15%"], y: ["8%", "-12%", "8%"] }}
          transition={{ repeat: Infinity, duration: 42, ease: "linear" }}
          className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: "#3b82f6", opacity: 0.04 }}
        />
        <motion.div
          animate={{ x: ["-10%", "10%", "-10%"], y: ["5%", "-5%", "5%"] }}
          transition={{ repeat: Infinity, duration: 38, ease: "linear" }}
          className="absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full blur-[150px]"
          style={{ background: "#10b981", opacity: 0.04 }}
        />
        <motion.div
          animate={{ x: ["10%", "-10%", "10%"], y: ["-5%", "5%", "-5%"] }}
          transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
          className="absolute top-1/2 -right-20 w-[500px] h-[500px] rounded-full blur-[130px]"
          style={{ background: "#f59e0b", opacity: 0.03 }}
        />

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            backgroundPosition: "center center",
          }}
        />

        {/* Dot pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Floating emoji icons */}
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            className={`absolute ${item.size} select-none`}
            style={{ left: item.x, top: item.y }}
            animate={{
              y: ["-15px", "15px", "-15px"],
              rotate: ["-5deg", "5deg", "-5deg"],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {item.icon}
          </motion.div>
        ))}

        {/* Subtle diagonal lines */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 80px,
                rgba(0,0,0,0.008) 80px,
                rgba(0,0,0,0.008) 81px
              )
            `,
          }}
        />

        {/* Gradient lines at top */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${ACCENT}30, #3b82f630, #10b98130, transparent)`,
          }}
        />

        {/* Pulsing accent dot */}
        <motion.div
          animate={{ 
            scale: [1, 1.8, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute top-20 right-[15%] w-3 h-3 rounded-full"
          style={{ background: ACCENT }}
        />
        <motion.div
          animate={{ 
            scale: [1, 2, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-40 left-[10%] w-2 h-2 rounded-full"
          style={{ background: "#10b981" }}
        />
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 2.5 }}
          className="absolute top-1/2 right-[25%] w-2.5 h-2.5 rounded-full"
          style={{ background: "#f59e0b" }}
        />
      </div>

      {/* Dark mode background overrides */}
      <div className="dark:hidden">
        {/* Light mode already handled by inline styles */}
      </div>

      <div
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
        onFocus={() => setIsCarouselPaused(true)}
        onBlur={() => setIsCarouselPaused(false)}
      >
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
      </div>

      {/* Enter Shop CTA */}
      <section
        className="py-10 relative"
        aria-labelledby="cta-heading"
      >
        {/* Section-specific background accent */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: ACCENT, opacity: 0.03 }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              id="cta-heading"
              className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3"
            >
              Ready to explore?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
              Browse our full catalog of products across all categories.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 18px 44px ${ACCENT}55` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/shop")}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-lg text-white"
              style={{
                background: ACCENT,
                boxShadow: `0 8px 24px ${ACCENT}44`,
              }}
              aria-label="Browse the full product catalog"
            >
              Enter Shop <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <HomeMarquee categoryNames={categoryNames} />
      <HomeFeatures />

      <HomeCategoryBrowser categories={categoryData} />

      {/* Featured Products section */}
      <section
        className="py-14 md:py-18 relative"
        aria-labelledby="featured-heading"
      >
        {/* Section accent */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px]"
            style={{ background: "#10b981", opacity: 0.04 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="mb-8">
            <p
              className="text-xs font-black uppercase tracking-[0.2em] mb-2"
              style={{ color: ACCENT }}
            >
              Featured
            </p>
            <h2
              id="featured-heading"
              className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white"
            >
              Best Sellers
            </h2>
          </div>
          <FeaturedProductsGrid />
        </div>
      </section>

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
    </main>
  );
};

export default Home;