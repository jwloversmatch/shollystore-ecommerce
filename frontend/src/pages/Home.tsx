import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetProductsQuery,
  useGetHeroSlidesQuery,
  useGetCategoriesQuery,
  useGetPublicSettingsQuery,
} from "../features/api/apiSlice";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import type { ProductItem, CategoryItem } from "../types/home";
import { ACCENT } from "../types/home";

import HomeLoading from "./home/HomeLoading";
import HomeHero from "./home/HomeHero";

// Lazy-load below-the-fold and on-demand components
const HomeMarquee = lazy(() => import("./home/HomeMarquee"));
const HomeFeatures = lazy(() => import("./home/HomeFeatures"));
const HomeSpecialOffer = lazy(() => import("./home/HomeSpecialOffer"));
const HomeHowItWorks = lazy(() => import("./home/HomeHowItWorks"));
const FeaturedProductsGrid = lazy(() => import("../components/FeaturedProductsGrid"));
const HomePromoBanners = lazy(() => import("./home/HomePromoBanners"));
const HomeNewArrivals = lazy(() => import("./home/HomeNewArrivals"));
const HomeTestimonials = lazy(() => import("./home/HomeTestimonials"));
const ProductQuickViewModal = lazy(() => import("../components/ProductQuickViewModal"));

import { ArrowRight } from "lucide-react";

const Home = () => {
  const { data: productsResp } = useGetProductsQuery({ limit: 9999 });
  const { data: heroSlides, isLoading: sLoad } = useGetHeroSlidesQuery({});
  const { data: categories = [], isLoading: cLoad } = useGetCategoriesQuery({});
  const { data: publicSettings } = useGetPublicSettingsQuery({});
  const navigate = useNavigate();

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
    name: "Sholex",
    url: "https://Sholex.vercel.app",
    logo: "https://Sholex.vercel.app/logo.png",
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://Sholex.vercel.app",
  };

  if (isPageLoading) return <HomeLoading />;

  const categoryNames = categories.map((c: CategoryItem) => c.name);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[#FCFAF5] dark:bg-[#0A0A0B] relative overflow-x-hidden focus:outline-none pt-14 md:pt-20"
    >
      <SEO
        title={heroTitle.replace("|", "").trim()}
        description={heroDescription}
        canonicalUrl="https://Sholex.vercel.app"
      />
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />

      {/* Ambient background orbs — CSS-only, no JS, no framer-motion */}
      <div
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07] animate-orb-1"
          style={{ background: ACCENT }}
        />
        <div
          className="absolute bottom-0 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.05] animate-orb-2"
          style={{ background: "#10b981" }}
        />
      </div>

      {/* Hero carousel — loaded eagerly (above the fold) */}
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
          onShopNow={() => navigate("/shop")}
        />
      </div>

      <Suspense fallback={null}>
        {/* Promo banners */}
        <HomePromoBanners />

        {/* Enter Shop CTA — CSS transitions instead of framer-motion */}
        <section
          className="py-10 bg-[#FCFAF5] dark:bg-[#0A0A0B]"
          aria-labelledby="cta-heading"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
            <div className="animate-fade-up">
              <h2
                id="cta-heading"
                className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3"
              >
                Ready to explore?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                Browse our full catalog of products across all categories.
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-black text-lg text-white
                  transition-transform duration-200 ease-out
                  hover:scale-105 active:scale-[0.97]"
                style={{
                  background: ACCENT,
                  boxShadow: `0 8px 24px ${ACCENT}44`,
                }}
                aria-label="Browse the full product catalog"
              >
                Enter Shop <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <HomeMarquee categoryNames={categoryNames} />
        <HomeFeatures />
        <HomeHowItWorks />

        {/* Featured Products */}
        <section
          className="bg-[#FCFAF5] dark:bg-[#111111] py-14 md:py-18"
          aria-labelledby="featured-heading"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">
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

        {/* New Arrivals */}
        <HomeNewArrivals />

        {/* Testimonials */}
        <HomeTestimonials />

        {/* Special Offer */}
        <HomeSpecialOffer
          specialOfferTitle={specialOfferTitle}
          specialOfferText={specialOfferText}
          onShopNow={() => navigate("/shop")}
        />
      </Suspense>

      {/* Quick View Modal — only loaded when a product is selected */}
      {modalProduct && (
        <Suspense fallback={null}>
          <ProductQuickViewModal
            product={modalProduct}
            isOpen={!!modalProduct}
            onClose={() => setModalProduct(null)}
          />
        </Suspense>
      )}
    </main>
  );
};

export default Home;