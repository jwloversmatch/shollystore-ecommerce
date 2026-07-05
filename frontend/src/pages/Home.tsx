import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetProductsQuery,
  useGetHeroSlidesQuery,
  useGetCategoriesQuery,
  useGetPublicSettingsQuery,
} from "../features/api/apiSlice";
import ProductCard from "../components/ProductCard";
import Footer from "./Footer";
import {
  ChevronLeft, ChevronRight, Package, Truck,
  CreditCard, Star, Sparkles, ArrowRight, Search, Flame,
} from "lucide-react";
import SEO from "../components/SEO";
import StructuredData from "../components/StructuredData";
import ProductQuickViewModal from "../components/ProductQuickViewModal";

// ── Interfaces ─────────────────────────────────────────────────────────────
interface ProductItem {
  _id: string; name: string; price: number;
  images?: string[]; category?: string; stock?: number;
  slug?: string; description?: string;
}
interface HeroSlide {
  _id: string; imageUrl: string; title?: string;
  subtitle?: string; order: number; isActive: boolean;
}
interface CategoryItem { _id: string; name: string; slug: string; }

const PLACEHOLDER = "https://via.placeholder.com/600x600?text=No+Image";
const ACCENT      = "#e8622a";

// ── Reusable variants ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.6, ease: "easeOut" as const } },
});
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };

// ── Dark skeleton cards ──────────────────────────────────────────────────────
const DarkSkeleton = () => (
  <div className="flex flex-col items-center gap-0 animate-pulse">
    <div className="w-28 h-28 rounded-full bg-[#1c1c1c] z-10" />
    <div className="w-full h-40 -mt-14 rounded-[26px] bg-[#141414]" />
    <div className="mt-3.5 w-28 h-9 rounded-full bg-[#1c1c1c]" />
  </div>
);

const Home = () => {
  const { data: products,     isLoading: pLoad  } = useGetProductsQuery({});
  const { data: heroSlides,   isLoading: sLoad  } = useGetHeroSlidesQuery({});
  const { data: categories = [], isLoading: cLoad } = useGetCategoriesQuery({});
  const { data: publicSettings }                   = useGetPublicSettingsQuery({});

  const landingMode   = publicSettings?.landingMode || false;
  const isPageLoading = pLoad || sLoad || cLoad;

  const displayProducts = useMemo<ProductItem[]>(() => products || [], [products]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm,        setSearchTerm]       = useState("");
  const [currentIndex,      setCurrentIndex]     = useState(0);
  const [direction,         setDirection]        = useState(0);
  const [modalProduct,      setModalProduct]     = useState<ProductItem | null>(null);

  useEffect(() => {
    if (!heroSlides?.length) return;
    const id = setInterval(() => {
      setDirection(1);
      setCurrentIndex(p => (p + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [heroSlides]);

  const handleNext = () => { if (!heroSlides?.length) return; setDirection(1);  setCurrentIndex(p => (p + 1) % heroSlides.length); };
  const handlePrev = () => { if (!heroSlides?.length) return; setDirection(-1); setCurrentIndex(p => (p - 1 + heroSlides.length) % heroSlides.length); };

  const categoryList = useMemo(() => ["All", ...categories.map((c: CategoryItem) => c.name)], [categories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: displayProducts.length };
    categories.forEach((c: CategoryItem) => {
      counts[c.name] = displayProducts.filter(p => p.category === c.name).length;
    });
    return counts;
  }, [displayProducts, categories]);

  const filteredProducts = useMemo(() => {
    let f = displayProducts;
    if (selectedCategory !== "All") f = f.filter(p => p.category === selectedCategory);
    if (searchTerm.trim())          f = f.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return f.slice().sort((a, b) => b._id.localeCompare(a._id));
  }, [displayProducts, selectedCategory, searchTerm]);

  const heroTagline       = publicSettings?.heroTagline      || "🔥 Premium Food Store";
  const heroTitle         = publicSettings?.heroTitle        || "Taste the | Difference";
  const heroDescription   = publicSettings?.heroDescription  || "Premium ingredients, unbeatable prices. Everything your kitchen needs, delivered fast.";
  const specialOfferTitle = publicSettings?.specialOfferTitle || "Today's Special";
  const specialOfferText  = publicSettings?.specialOfferText  || "Get ₦500 off your first order over ₦10,000. Use code FIRST500";

  const [heroPart1, heroPart2] = heroTitle.includes("|")
    ? heroTitle.split("|").map((s: string) => s.trim())
    : [heroTitle, ""];

  const organizationSchema = { "@context": "https://schema.org", "@type": "Organization", name: heroTitle.replace("|", "").trim(), url: "https://shollystore-ecommerce.vercel.app", logo: "https://shollystore-ecommerce.vercel.app/logo.png" };
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", url: "https://shollystore-ecommerce.vercel.app" };

  // Loading screen – now with comfortable padding
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 pt-16">
          {Array.from({ length: 8 }).map((_, i) => <DarkSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const categoryNames = categories.map((c: CategoryItem) => c.name);

  return (
    <div className="min-h-screen bg-[#0A0A0B] relative overflow-x-hidden">
      <SEO title={heroTitle.replace("|", "").trim()} description={heroDescription} canonicalUrl="https://shollystore-ecommerce.vercel.app" />
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />

      {/* Ambient background orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div animate={{ x: ["-15%","15%","-15%"], y: ["-8%","8%","-8%"] }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07]" style={{ background: ACCENT }} />
        <motion.div animate={{ x: ["15%","-15%","15%"], y: ["8%","-8%","8%"] }} transition={{ repeat: Infinity, duration: 38, ease: "linear" }}
          className="absolute bottom-0 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.05]" style={{ background: "#10b981" }} />
      </div>

      {/* ════════ HERO ═══════════════════════════════════════════════════════ */}
      {landingMode ? (
        /* Landing mode — full‑screen centred */
        <section className="min-h-screen flex flex-col justify-center items-center px-6 text-center pt-20">
          <motion.span initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border"
            style={{ background:'rgba(232,98,42,0.12)', borderColor:'rgba(232,98,42,0.35)', color: ACCENT }}>
            <Flame className="w-3.5 h-3.5" /> {heroTagline}
          </motion.span>

          <motion.h1 initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
            className="text-5xl md:text-8xl font-black text-white leading-[1.05] mt-6 max-w-4xl">
            {heroPart2 ? (
              <>{heroPart1}{" "}
                <span className="relative">
                  <span style={{ background:`linear-gradient(135deg, ${ACCENT}, #FFB347)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                    {heroPart2}
                  </span>
                </span>
              </>
            ) : heroTitle}
          </motion.h1>

          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
            className="text-gray-400 text-lg md:text-xl max-w-xl mt-6">
            {heroDescription}
          </motion.p>

          <motion.button initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.32 }}
            whileHover={{ scale:1.05, boxShadow:`0 16px 40px ${ACCENT}50` }} whileTap={{ scale:0.96 }}
            onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior:"smooth" })}
            className="mt-10 flex items-center gap-2.5 px-10 py-4 rounded-full font-bold text-white text-lg group"
            style={{ background: ACCENT, boxShadow:`0 10px 28px ${ACCENT}44` }}>
            Browse Menu <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </section>

      ) : (
        /* Regular mode — two‑column with carousel */
        <section className="relative max-w-7xl mx-auto px-6 pt-20 md:pt-28 pb-16 grid md:grid-cols-2 items-center gap-14">

          {/* Left: text */}
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
            <motion.span variants={fadeUp(0)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border"
              style={{ background:'rgba(232,98,42,0.12)', borderColor:'rgba(232,98,42,0.3)', color: ACCENT }}>
              <Flame className="w-3.5 h-3.5" /> {heroTagline}
            </motion.span>

            <motion.h1 variants={fadeUp(0.08)} className="text-5xl md:text-7xl font-black text-white leading-[1.06]">
              {heroPart2 ? (
                <>{heroPart1}{" "}
                  <span style={{ background:`linear-gradient(135deg, ${ACCENT}, #FFB347)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                    {heroPart2}
                  </span>
                </>
              ) : heroTitle}
            </motion.h1>

            <motion.p variants={fadeUp(0.16)} className="text-gray-400 text-lg max-w-md">
              {heroDescription}
            </motion.p>

            <motion.div variants={fadeUp(0.24)} className="flex items-center gap-4 flex-wrap">
              <motion.button
                whileHover={{ scale:1.04, boxShadow:`0 14px 36px ${ACCENT}50` }} whileTap={{ scale:0.96 }}
                onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior:"smooth" })}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-white group"
                style={{ background: ACCENT, boxShadow:`0 8px 24px ${ACCENT}44` }}>
                Explore Menu <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <div className="flex items-center gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0A0B] overflow-hidden bg-[#1c1c1c]">
                    {displayProducts[i - 1]?.images?.[0] && (
                      <img src={displayProducts[i - 1].images![0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
                <span className="text-gray-500 text-sm ml-1">{displayProducts.length}+ items</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: carousel */}
          <motion.div initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.9, delay:0.15 }}
            className="flex justify-center items-center">
            <motion.div animate={{ y:[0,-14,0] }} transition={{ repeat:Infinity, duration:5.5, ease:"easeInOut" }}
              className="relative">
              <motion.div animate={{ rotate:360 }} transition={{ duration:22, repeat:Infinity, ease:"linear" }}
                className="absolute -inset-6 rounded-full border-2 border-dashed pointer-events-none"
                style={{ borderColor:`${ACCENT}30` }} />
              <div className="absolute -inset-3 rounded-full pointer-events-none"
                style={{ boxShadow:`0 0 0 1.5px ${ACCENT}25` }} />

              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden group"
                style={{ boxShadow:`0 0 0 4px ${ACCENT}, 0 24px 80px rgba(0,0,0,0.7), 0 0 60px ${ACCENT}20` }}>
                {heroSlides && heroSlides.length > 0 ? (
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.img key={currentIndex} custom={direction}
                      variants={{ enter:(d:number)=>({ x:d>0?180:-180, opacity:0, scale:0.92 }), center:{ x:0, opacity:1, scale:1 }, exit:(d:number)=>({ x:d>0?-180:180, opacity:0, scale:0.92 }) }}
                      initial="enter" animate="center" exit="exit"
                      transition={{ type:"spring", stiffness:280, damping:28 }}
                      src={heroSlides[currentIndex].imageUrl}
                      alt={heroSlides[currentIndex].title || ""}
                      onError={e => { e.currentTarget.src = PLACEHOLDER; }}
                      className="w-full h-full object-cover absolute inset-0" />
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full bg-[#1c1c1c] flex items-center justify-center text-gray-600">No images</div>
                )}

                <button onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {heroSlides && heroSlides.length > 1 && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {heroSlides.map((_: HeroSlide, i: number) => (
                    <button key={i} onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-6" : "w-1.5 bg-white/20"}`}
                      style={i === currentIndex ? { background: ACCENT } : {}} />
                  ))}
                </div>
              )}

              <motion.div animate={{ y:[-4,4,-4] }} transition={{ repeat:Infinity, duration:3.5, ease:"easeInOut" }}
                className="absolute -right-4 top-8 bg-[#141414] border border-white/10 rounded-2xl px-3.5 py-2.5 shadow-xl">
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Products</div>
                <div className="text-xl font-black text-white">{displayProducts.length}+</div>
              </motion.div>
              <motion.div animate={{ y:[4,-4,4] }} transition={{ repeat:Infinity, duration:4, ease:"easeInOut" }}
                className="absolute -left-6 bottom-12 bg-[#141414] border border-white/10 rounded-2xl px-3.5 py-2.5 shadow-xl">
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Rating</div>
                <div className="text-xl font-black" style={{ color:"#F59E0B" }}>4.9 ★</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* ── MARQUEE, FEATURES, CATEGORIES, PRODUCTS, SPECIAL OFFER ── */}

      {categoryNames.length > 0 && (
        <div className="w-full overflow-hidden py-3.5 mt-8" style={{ background: ACCENT }}>
          <motion.div className="flex gap-10 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
            {[...categoryNames, ...categoryNames, ...categoryNames, ...categoryNames].map((cat: string, i: number) => (
              <span key={i} className="text-white font-extrabold text-sm tracking-widest uppercase flex items-center gap-3">
                <span className="opacity-60">◆</span> {cat}
              </span>
            ))}
          </motion.div>
        </div>
      )}

      <section className="bg-[#111111] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once:true, margin:"-60px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon:<Package className="w-6 h-6"/>,   label:"Bulk Orders",      stat:"50+",   desc:"Pack sizes available",     color:"#e8622a", glow:"rgba(232,98,42,0.15)"  },
              { icon:<Truck className="w-6 h-6"/>,     label:"Fast Delivery",    stat:"24hr",  desc:"Across Nigeria",           color:"#3b82f6", glow:"rgba(59,130,246,0.15)"  },
              { icon:<CreditCard className="w-6 h-6"/>,label:"Easy Payments",    stat:"3+",    desc:"Payment options",          color:"#8b5cf6", glow:"rgba(139,92,246,0.15)"  },
              { icon:<Star className="w-6 h-6"/>,      label:"Customer Rating",  stat:"4.9★",  desc:"From verified buyers",     color:"#F59E0B", glow:"rgba(245,158,11,0.15)"  },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp(i * 0.08)}
                whileHover={{ y:-6, boxShadow:`0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px ${f.color}22` }}
                className="bg-[#141414] border border-white/5 rounded-2xl p-5 md:p-6 transition-all cursor-default relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background:`radial-gradient(circle at 30% 30%, ${f.glow}, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background:`${f.color}18`, color: f.color }}>
                    {f.icon}
                  </div>
                  <div className="text-3xl font-black text-white">{f.stat}</div>
                  <div className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: f.color }}>{f.label}</div>
                  <div className="text-gray-600 text-xs mt-1">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-14 md:py-18 bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
                className="text-xs font-black uppercase tracking-[0.2em] mb-2" style={{ color: ACCENT }}>
                Browse
              </motion.p>
              <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                className="text-3xl md:text-4xl font-black text-white">
                Shop by Category
              </motion.h2>
            </div>
            {selectedCategory !== "All" && (
              <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }}
                onClick={() => setSelectedCategory("All")}
                className="text-sm font-semibold text-gray-500 hover:text-white transition-colors pb-1 border-b border-gray-700">
                Clear filter
              </motion.button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4">
            {categoryList.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <motion.button key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                  className="flex-shrink-0 relative flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition-all min-w-[100px]"
                  style={{
                    background:     active ? ACCENT : "#141414",
                    borderColor:    active ? ACCENT : "rgba(255,255,255,0.06)",
                    boxShadow:      active ? `0 8px 24px ${ACCENT}44` : "none",
                  }}>
                  <span className="text-2xl">🍽️</span>
                  <span className={`text-xs font-bold whitespace-nowrap ${active ? "text-white" : "text-gray-400"}`}>{cat}</span>
                  {categoryCounts[cat] > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: active ? "rgba(255,255,255,0.25)" : ACCENT, color:"white" }}>
                      {categoryCounts[cat]}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="products-grid" className="bg-[#111111] py-14 md:py-18">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-1" style={{ color: ACCENT }}>
                {selectedCategory === "All" ? "All Products" : selectedCategory}
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                {selectedCategory === "All" ? "Best Sellers" : selectedCategory}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type="text" placeholder="Search..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1c1c1c] border border-white/8 text-white placeholder-gray-600 rounded-xl outline-none text-sm focus:border-[#e8622a]/50 transition-colors"
                  style={{ borderColor:"rgba(255,255,255,0.07)" }} />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {categoryList.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border"
                    style={{
                      background:   selectedCategory === cat ? ACCENT : "transparent",
                      color:        selectedCategory === cat ? "white" : "#6b7280",
                      borderColor:  selectedCategory === cat ? ACCENT : "rgba(255,255,255,0.08)",
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 md:gap-x-6 pt-16">
            <AnimatePresence mode="popLayout">
              {filteredProducts.length > 0 ? filteredProducts.map((product: ProductItem) => (
                <motion.div key={product._id} layout
                  initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                  exit={{ opacity:0, scale:0.9, transition:{ duration:0.18 } }}
                  transition={{ type:"spring", stiffness:300, damping:24 }}>
                  <ProductCard
                    _id={product._id} name={product.name} price={product.price}
                    image={product.images?.[0] || PLACEHOLDER}
                    category={product.category || "General"}
                    stock={product.stock}
                    onClick={() => setModalProduct(product)} />
                </motion.div>
              )) : (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="col-span-full py-24 flex flex-col items-center gap-3 text-gray-600">
                  <span className="text-5xl">🔍</span>
                  <p className="text-lg font-semibold">No products found</p>
                  <button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
                    className="text-sm underline hover:text-gray-400 transition-colors">Clear filters</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#0A0A0B] py-14 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-60px" }}
            transition={{ duration:0.7, ease:"easeOut" }}
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
            style={{ background:"linear-gradient(140deg, #180a00 0%, #0A0A0B 45%, #001509 100%)" }}>
            <div className="absolute top-0 inset-x-0 h-px" style={{ background:`linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
            <div className="absolute bottom-0 inset-x-0 h-px" style={{ background:"linear-gradient(90deg, transparent, #10b981, transparent)" }} />
            <motion.div animate={{ rotate:360 }} transition={{ duration:16, repeat:Infinity, ease:"linear" }}
              className="absolute top-6 right-6 opacity-30" style={{ color: ACCENT }}>
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <motion.div animate={{ rotate:-360 }} transition={{ duration:20, repeat:Infinity, ease:"linear" }}
              className="absolute bottom-6 left-6 opacity-20" style={{ color:"#10b981" }}>
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <motion.div initial={{ scale:0.8, opacity:0 }} whileInView={{ scale:1, opacity:1 }} viewport={{ once:true }}
              transition={{ type:"spring", stiffness:300, damping:22 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold mb-6"
              style={{ background:"rgba(232,98,42,0.1)", borderColor:"rgba(232,98,42,0.3)", color: ACCENT }}>
              <Flame className="w-3.5 h-3.5" /> Limited Offer
            </motion.div>
            <motion.h2 initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.1 }}
              className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
              {specialOfferTitle}
            </motion.h2>
            <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.2 }}
              className="text-gray-500 text-lg mb-10 max-w-lg mx-auto">
              {specialOfferText}
            </motion.p>
            <motion.button initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.28 }}
              whileHover={{ scale:1.05, boxShadow:`0 18px 45px ${ACCENT}55` }} whileTap={{ scale:0.96 }}
              onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior:"smooth" })}
              className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full font-bold text-lg text-white group"
              style={{ background: ACCENT, boxShadow:`0 10px 28px ${ACCENT}44` }}>
              Shop Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <ProductQuickViewModal product={modalProduct} isOpen={!!modalProduct} onClose={() => setModalProduct(null)} />
      <Footer />
    </div>
  );
};

export default Home;