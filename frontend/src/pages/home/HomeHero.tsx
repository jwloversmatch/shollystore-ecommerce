import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Flame, ArrowRight } from "lucide-react";
import { ACCENT, PLACEHOLDER, fadeUp, stagger } from "../../types/home";
import type { HeroSlide } from "../../types/home";

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
}

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
}: HomeHeroProps) => {
  if (landingMode) {
    return (
      <section className="min-h-screen flex flex-col justify-center items-center px-6 text-center pt-20 bg-gray-50 dark:bg-transparent">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border"
          style={{
            background: "rgba(232,98,42,0.12)",
            borderColor: "rgba(232,98,42,0.35)",
            color: ACCENT,
          }}
        >
          <Flame className="w-3.5 h-3.5" /> {heroTagline}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-5xl md:text-8xl font-black leading-[1.05] mt-6 max-w-4xl text-gray-900 dark:text-white"
        >
          {heroPart2 ? (
            <>
              {heroPart1}{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, #FFB347)`,
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
          transition={{ delay: 0.22 }}
          className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-xl mt-6"
        >
          {heroDescription}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          whileHover={{ scale: 1.05, boxShadow: `0 16px 40px ${ACCENT}50` }}
          whileTap={{ scale: 0.96 }}
          onClick={() =>
            document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })
          }
          className="mt-10 flex items-center gap-2.5 px-10 py-4 rounded-full font-bold text-white text-lg group"
          style={{ background: ACCENT, boxShadow: `0 10px 28px ${ACCENT}44` }}
        >
          Browse Menu{" "}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </section>
    );
  }

  return (
    <section className="relative max-w-7xl mx-auto px-6 pt-20 md:pt-28 pb-16 grid md:grid-cols-2 items-center gap-14">
      {/* Left column */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
        <motion.span
          variants={fadeUp(0)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border"
          style={{ background: "rgba(232,98,42,0.12)", borderColor: "rgba(232,98,42,0.3)", color: ACCENT }}
        >
          <Flame className="w-3.5 h-3.5" /> {heroTagline}
        </motion.span>

        <motion.h1
          variants={fadeUp(0.08)}
          className="text-5xl md:text-7xl font-black leading-[1.06] text-gray-900 dark:text-white"
        >
          {heroPart2 ? (
            <>
              {heroPart1}{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, #FFB347)`,
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

        <motion.p variants={fadeUp(0.16)} className="text-gray-500 dark:text-gray-400 text-lg max-w-md">
          {heroDescription}
        </motion.p>

        <motion.div variants={fadeUp(0.24)} className="flex items-center gap-4 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: `0 14px 36px ${ACCENT}50` }}
            whileTap={{ scale: 0.96 }}
            onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-white group"
            style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
          >
            Explore Menu{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-[#0A0A0B] overflow-hidden bg-gray-100 dark:bg-[#1c1c1c]" />
            ))}
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">{displayProductsCount}+ items</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Right column: carousel */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.15 }}
        className="flex justify-center items-center"
      >
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-6 rounded-full border-2 border-dashed pointer-events-none"
            style={{ borderColor: `${ACCENT}30` }}
          />
          <div className="absolute -inset-3 rounded-full pointer-events-none" style={{ boxShadow: `0 0 0 1.5px ${ACCENT}25` }} />

          <div
            className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden group"
            style={{ boxShadow: `0 0 0 4px ${ACCENT}, 0 24px 80px rgba(0,0,0,0.5), 0 0 60px ${ACCENT}20` }}
          >
            {heroSlides && heroSlides.length > 0 ? (
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.img
                  key={currentIndex}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ x: d > 0 ? 180 : -180, opacity: 0, scale: 0.92 }),
                    center: { x: 0, opacity: 1, scale: 1 },
                    exit: (d: number) => ({ x: d > 0 ? -180 : 180, opacity: 0, scale: 0.92 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  src={heroSlides[currentIndex].imageUrl}
                  alt={heroSlides[currentIndex].title || ""}
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                  className="w-full h-full object-cover absolute inset-0"
                />
              </AnimatePresence>
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-[#1c1c1c] flex items-center justify-center text-gray-500 dark:text-gray-600">
                No images
              </div>
            )}

            <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {heroSlides && heroSlides.length > 1 && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {heroSlides.map((_: HeroSlide, i: number) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-6" : "w-1.5 bg-gray-300 dark:bg-white/20"}`}
                  style={i === currentIndex ? { background: ACCENT } : {}}
                />
              ))}
            </div>
          )}

          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="absolute -right-4 top-8 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl px-3.5 py-2.5 shadow-lg dark:shadow-xl"
          >
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Products</div>
            <div className="text-xl font-black text-gray-900 dark:text-white">{displayProductsCount}+</div>
          </motion.div>
          <motion.div
            animate={{ y: [4, -4, 4] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -left-6 bottom-12 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 rounded-2xl px-3.5 py-2.5 shadow-lg dark:shadow-xl"
          >
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Rating</div>
            <div className="text-xl font-black text-yellow-500">4.9 ★</div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HomeHero;