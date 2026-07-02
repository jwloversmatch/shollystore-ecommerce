import { useState, useMemo, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetProductsQuery,
  useGetHeroSlidesQuery,
  useGetCategoriesQuery,
} from '../features/api/apiSlice';
import ProductCard from '../components/ProductCard';
import Footer from './Footer';
import { ChevronLeft, ChevronRight, Package, Truck, CreditCard, Star } from 'lucide-react';

interface ProductItem {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  category?: string;
  stock?: number;
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

const Home = () => {
  const { data: products, isLoading } = useGetProductsQuery({});
  const { data: heroSlides, isLoading: slidesLoading } = useGetHeroSlidesQuery({});
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery({});

  const displayProducts = useMemo<ProductItem[]>(() => products || [], [products]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  // ✅ Keep useInView only for the entrance animation
  useInView(carouselRef, { once: false, amount: 0.3 });

  // ✅ Auto-slide – always active, regardless of visibility
  useEffect(() => {
    if (!heroSlides || heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
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
    setCurrentIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Build category list: "All" + fetched category names
  const categoryList = useMemo(() => {
    const names = categories.map((c: CategoryItem) => c.name);
    return ['All', ...names];
  }, [categories]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return displayProducts;
    return displayProducts.filter((p: ProductItem) => p.category === selectedCategory);
  }, [displayProducts, selectedCategory]);

  // Lighter animation variants (removed scale to reduce layout shifting)
  const variants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  if (isLoading || slidesLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pastel-pink via-pastel-green to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-leaf-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pastel-pink via-pastel-green to-white -z-10" />
      
      {/* --- 1. Hero Section --- */}
      <section className="max-w-7xl mx-auto px-6 pt-20 md:pt-24 pb-16 md:pb-20 grid md:grid-cols-2 items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="bg-white/40 px-4 py-1.5 rounded-full text-sm font-medium text-blob-orange inline-block mb-4 backdrop-blur-sm border border-white/60">
            📦 Bulk Beverage Store
          </span>
          <h1 className="text-4xl md:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
            Your Everyday <br /> 
            <span className="text-leaf-green">Drink Superstore</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-8 max-w-md">
            From classic Fanta and Coke to refreshing Malt and premium bottled water — all available in convenient packs. Perfect for stocking your home, office, or event.
          </p>
          <motion.button 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blob-orange text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer will-change-transform"
          >
            Explore Our Range
          </motion.button>
        </motion.div>

        {/* Right side: Carousel */}
        <motion.div 
          ref={carouselRef}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative flex justify-center items-center h-[450px] md:h-[550px] will-change-transform"
        >
          <div className="relative w-full max-w-lg aspect-square group">
            {heroSlides && heroSlides.length > 0 ? (
              <>
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.img
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    src={heroSlides[currentIndex].imageUrl}
                    alt={heroSlides[currentIndex].title || 'Hero slide'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain drop-shadow-2xl will-change-transform"
                  />
                </AnimatePresence>

                {/* Navigation arrows */}
                <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>

                {/* Dots */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {heroSlides.map((_: HeroSlide, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? 'bg-leaf-green w-6' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-3xl text-gray-500">
                No hero slides yet. Admin can add them.
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* --- 2. Why Choose Us Section --- */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {[
            { icon: <Package className="w-8 h-8 text-leaf-green" />, title: 'Bulk Packs', desc: 'Stock your home, office, or event with ease.' },
            { icon: <Truck className="w-8 h-8 text-blob-orange" />, title: 'Fast Delivery', desc: 'Reliable delivery across Nigeria.' },
            { icon: <CreditCard className="w-8 h-8 text-blue-600" />, title: 'Secure Payments', desc: 'Paystack, Bank Transfer & WhatsApp.' },
            { icon: <Star className="w-8 h-8 text-yellow-500" />, title: 'Authentic Brands', desc: '100% trusted and genuine products.' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all text-center will-change-transform"
            >
              <div className="bg-pastel-pink/30 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* --- 3. Shop by Category Section --- */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-4 md:mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Shop by Category</h2>
          {selectedCategory !== 'All' && (
            <button 
              onClick={() => setSelectedCategory('All')}
              className="text-sm text-gray-500 hover:text-leaf-green transition-colors underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {categoryList.filter(cat => cat !== 'All').map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(cat)}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border p-4 md:p-6 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 ${
                selectedCategory === cat ? 'border-leaf-green ring-2 ring-leaf-green/20' : 'border-gray-100'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-pastel-pink/30 flex items-center justify-center text-2xl">
                🍹
              </div>
              <span className="font-medium text-gray-700 text-sm md:text-base">{cat}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* --- 4. Best Sellers / Products Section --- */}
      <section id="products-grid" className="max-w-7xl mx-auto px-4 md:px-6 mt-8 md:mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {selectedCategory === 'All' ? 'Our Best Sellers' : selectedCategory}
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide no-scrollbar">
            {categoryList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-leaf-green text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-leaf-green'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white h-64 rounded-2xl animate-pulse border border-gray-100 shadow-sm"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence mode="wait">
              {filteredProducts.map((product: ProductItem) => (
                <motion.div 
                  key={product._id} 
                  layout 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard _id={product._id} name={product.name} price={product.price} image={product.images?.[0] || 'https://via.placeholder.com/150'} category={product.category || 'General'} stock={product.stock} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* --- 5. Special Offers Banner --- */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-12 md:mt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blob-orange/20 to-leaf-green/20 rounded-3xl p-8 md:p-12 text-center border border-white/40 backdrop-blur-sm will-change-transform"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">Stock Up & Save</h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Get <span className="font-bold text-leaf-green">₦500 off</span> your first bulk order of ₦10,000 or more. Use code <span className="font-bold text-leaf-green">FIRST500</span>
          </p>
          <button
            onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-leaf-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
          >
            Shop Now
          </button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;