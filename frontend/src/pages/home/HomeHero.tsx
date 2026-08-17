import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Shirt, Zap, Wine, Truck, ShieldCheck, Star, TrendingUp } from "lucide-react";
import { ACCENT, PLACEHOLDER, fadeUp, stagger } from "../../types/home";
import type { HeroSlide } from "../../types/home";
import { getCloudinaryUrl } from "../../utils/cloudinary";
import { useState, useEffect } from "react";

interface HomeHeroProps {
  landingMode: boolean;
  heroTagline: string;
  heroTitle: string;
  heroDescription: string;
  heroPart1: string;
  heroPart2: string;
  displayProductsCount: number;
  heroSlides: HeroSlide[] | undefined;
  currentIndex: number;
  direction: number;
  handlePrev: () => void;
  handleNext: () => void;
  setDirection: (dir: number) => void;
  setCurrentIndex: (idx: number) => void;
  onShopNow: () => void;
}

const categories = [
  { icon: <Shirt className="w-4 h-4" />, name: "Fashion", color: "#ec4899" },
  { icon: <Wine className="w-4 h-4" />, name: "Beverages", color: "#8b5cf6" },
  { icon: <Zap className="w-4 h-4" />, name: "Essentials", color: "#f59e0b" },
];

const trustBadges = [
  { icon: <Truck className="w-4 h-4" />, text: "Fast Delivery" },
  { icon: <ShieldCheck className="w-4 h-4" />, text: "Secure Payment" },
  { icon: <Star className="w-4 h-4" />, text: "Top Rated" },
];

// Animated counter hook — starts counting immediately on mount
const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

const HomeHero = ({
  landingMode,
  heroTagline,
  heroTitle,
  heroDescription,
  heroPart1,
  heroPart2,
  displayProductsCount,
  heroSlides,
  currentIndex,
  direction,
  handlePrev,
  handleNext,
  setDirection,
  setCurrentIndex,
  onShopNow,
}: HomeHeroProps) => {
  const animatedProducts = useCountUp(displayProductsCount, 2500);
  const animatedCategories = useCountUp(categories.length, 1500);

  if (landingMode) {
    return (
      <section className="min-h-screen flex flex-col justify-center items-center px-6 text-center pt-20 pb-10 bg-[#FCFAF5] dark:bg-transparent relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <motion.div
            animate={{ x: ["-20%", "20%", "-20%"], y: ["-10%", "10%", "-10%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="absolute top-0 -left-20 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.04]"
            style={{ background: ACCENT }}
          />
          <motion.div
            animate={{ x: ["20%", "-20%", "20%"], y: ["10%", "-10%", "10%"] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="absolute bottom-0 -right-20 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.03]"
            style={{ background: "#3b82f6" }}
          />
        </div>

        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border backdrop-blur-sm relative"
          style={{
            background: "rgba(232,98,42,0.1)",
            borderColor: "rgba(232,98,42,0.3)",
            color: ACCENT,
          }}
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" /> {heroTagline}
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
            style={{ background: ACCENT }}
          />
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-8xl font-black leading-[1.02] mt-8 max-w-5xl text-gray-900 dark:text-white"
        >
          {heroPart2 ? (
            <>
              {heroPart1}{" "}
              <span
                className="relative inline-block"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT} 0%, #f59e0b 50%, ${ACCENT} 100%)`,
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {heroPart2}
              </span>
            </>
          ) : (
            heroTitle
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-2xl mt-6 leading-relaxed"
        >
          {heroDescription}
        </motion.p>

        {/* Interactive category pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mt-10"
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold border cursor-pointer transition-all group"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "#9ca3af",
              }}
            >
              <span style={{ color: cat.color }}>{cat.icon}</span>
              {cat.name}
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-8 md:gap-12 mt-12"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              {animatedProducts.toLocaleString()}+
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold uppercase tracking-wider">Products</div>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-white/10" aria-hidden="true" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              {animatedCategories}+
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold uppercase tracking-wider">Categories</div>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-white/10" aria-hidden="true" />
          <div className="text-center">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" aria-hidden="true" />
              <span className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">4.9</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold uppercase tracking-wider">Rating</div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          {trustBadges.map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#6b7280",
              }}
            >
              <span style={{ color: ACCENT }}>{badge.icon}</span>
              {badge.text}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 20px 50px ${ACCENT}55` }}
            whileTap={{ scale: 0.96 }}
            onClick={onShopNow}
            className="flex items-center gap-3 px-12 py-4.5 rounded-full font-bold text-white text-lg group shadow-2xl"
            style={{ background: ACCENT }}
          >
            Start Shopping
            <motion.span
              animate={{ x: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </motion.span>
          </motion.button>
        </motion.div>
      </section>
    );
  }

  // Build a sliding window of up to 4 products from heroSlides for the plain grid display.
  // currentIndex still addresses individual slides (unchanged contract with the parent),
  // so prev/next simply shift which consecutive run of products is visible.
  const slides = heroSlides ?? [];
  const maxVisible = 4;
  const visibleCount = Math.min(slides.length, maxVisible);
  const canCycle = slides.length > maxVisible;
  const visibleSlides =
    slides.length > 0
      ? Array.from({ length: visibleCount }, (_, i) => {
          const idx = (((currentIndex + i) % slides.length) + slides.length) % slides.length;
          return slides[idx];
        })
      : [];
  const gridLayoutClass =
    visibleCount === 1
      ? "grid-cols-1 grid-rows-1"
      : visibleCount === 2
      ? "grid-cols-2 grid-rows-1"
      : visibleCount === 3
      ? "grid-cols-2 grid-rows-2"
      : "grid-cols-2 grid-rows-3";

  return (
    <section className="relative max-w-7xl mx-auto px-6 pt-20 md:pt-32 pb-20 grid md:grid-cols-2 items-center gap-16">
      {/* Left column */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
        <motion.span
          variants={fadeUp(0)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border backdrop-blur-sm"
          style={{ background: "rgba(232,98,42,0.1)", borderColor: "rgba(232,98,42,0.3)", color: ACCENT }}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> {heroTagline}
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: ACCENT }}
          />
        </motion.span>

        <motion.h1
          variants={fadeUp(0.08)}
          className="text-5xl md:text-7xl font-black leading-[1.04] text-gray-900 dark:text-white"
        >
          {heroPart2 ? (
            <>
              {heroPart1}{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, #f59e0b)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {heroPart2}
              </span>
            </>
          ) : (
            heroTitle
          )}
        </motion.h1>

        <motion.p variants={fadeUp(0.14)} className="text-gray-500 dark:text-gray-400 text-lg max-w-lg leading-relaxed">
          {heroDescription}
        </motion.p>

        {/* Category pills */}
        <motion.div variants={fadeUp(0.2)} className="flex flex-wrap gap-2.5">
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "#9ca3af",
              }}
            >
              <span style={{ color: cat.color }}>{cat.icon}</span>
              {cat.name}
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp(0.24)} className="flex items-center gap-5 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 14px 36px ${ACCENT}50` }}
            whileTap={{ scale: 0.96 }}
            onClick={onShopNow}
            className="flex items-center gap-2.5 px-9 py-4 rounded-full font-bold text-white group shadow-lg"
            style={{ background: ACCENT }}
          >
            Shop Now
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </motion.span>
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["👕", "🥤", "⚡"].map((emoji, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="w-9 h-9 rounded-full border-2 border-white dark:border-[#0A0A0B] bg-gray-100 dark:bg-[#1c1c1c] flex items-center justify-center text-sm"
                  aria-hidden="true"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {displayProductsCount.toLocaleString()}+
              </div>
              <div className="text-xs text-gray-500">Products</div>
            </div>
          </div>
        </motion.div>

        {/* Trust badges for non-landing */}
        <motion.div variants={fadeUp(0.3)} className="flex items-center gap-4 pt-2">
          {trustBadges.map((badge) => (
            <div key={badge.text} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span style={{ color: ACCENT }}>{badge.icon}</span>
              {badge.text}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right column: product showcase */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="flex justify-center items-center"
      >
        <div className="relative w-full max-w-[360px] md:max-w-[440px] lg:max-w-[500px]">
          {slides.length > 0 ? (
            <>
              <div
                className={`grid gap-3 md:gap-3.5 h-[300px] md:h-[400px] lg:h-[460px] ${gridLayoutClass}`}
                role="group"
                aria-roledescription="carousel"
                aria-label="Featured products"
              >
                <AnimatePresence custom={direction} initial={false}>
                  {visibleSlides.map((slide, i) => {
                    const isBigTile = visibleCount === 1 || (visibleCount >= 3 && i === 0);
                    const spanClass =
                      visibleCount === 3 && i === 0
                        ? "row-span-2"
                        : visibleCount === 4 && i === 0
                        ? "row-span-3"
                        : "";
                    return (
                      <motion.div
                        key={`${currentIndex}-${i}`}
                        custom={direction}
                        initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className={`relative overflow-hidden bg-gray-100 dark:bg-[#1c1c1c] ${
                          isBigTile ? "rounded-3xl shadow-lg" : "rounded-2xl shadow-md"
                        } ${spanClass}`}
                      >
                        <img
                          src={getCloudinaryUrl(slide.imageUrl, isBigTile ? 700 : 400)}
                          alt={slide.title || "Product photo"}
                          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {canCycle && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Show previous products"
                    className="absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 shadow-md flex items-center justify-center hover:scale-105 transition-transform z-10"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Show next products"
                    className="absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 shadow-md flex items-center justify-center hover:scale-105 transition-transform z-10"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" aria-hidden="true" />
                  </button>
                </>
              )}

              {canCycle && slides.length <= 10 && (
                <div className="flex justify-center gap-2 mt-4" role="group" aria-label="Product page navigation">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                      aria-label={`Show products starting at item ${i + 1}`}
                      aria-current={i === currentIndex ? "true" : undefined}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === currentIndex ? "20px" : "6px",
                        background: i === currentIndex ? ACCENT : "rgba(120,120,120,0.25)",
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-[300px] md:h-[400px] lg:h-[460px] rounded-3xl bg-gray-100 dark:bg-[#1c1c1c] flex items-center justify-center text-gray-500 dark:text-gray-600">
              <TrendingUp className="w-12 h-12 opacity-30" aria-hidden="true" />
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default HomeHero;