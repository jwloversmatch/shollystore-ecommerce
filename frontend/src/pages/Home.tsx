import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetProductsQuery,
  useGetHeroSlidesQuery,
  useGetCategoriesQuery,
} from '../features/api/apiSlice';
import ProductCard from '../components/ProductCard';
import Footer from './Footer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Auto-slide
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

  // Animation variants (fade for carousel)
  const variants = {
    enter: { opacity: 0, scale: 0.95 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
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
      
      <section className="max-w-7xl mx-auto px-6 pt-20 md:pt-24 pb-16 md:pb-20 grid md:grid-cols-2 items-center gap-12">
        {/* Left side: Text */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <span className="bg-white/40 px-4 py-1.5 rounded-full text-sm font-medium text-blob-orange inline-block mb-4 backdrop-blur-sm border border-white/60">
            🧊 Ice Cold & Organic
          </span>
          <h1 className="text-4xl md:text-7xl font-bold text-gray-900 leading-[1.1] mb-6">
            Premium <br /> 
            <span className="text-leaf-green">Beverages</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-8 max-w-md">
            Your favorite drinks — from Fanta and Coke to refreshing Malt and pure water. Stocked fresh and delivered ice-cold to your doorstep.
          </p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-blob-orange text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all">
            Grab a Drink
          </motion.button>
        </motion.div>

        {/* Right side: Carousel without text overlay */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center items-center h-[450px] md:h-[550px]"
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
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    src={heroSlides[currentIndex].imageUrl}
                    alt={heroSlides[currentIndex].title || 'Hero slide'}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </AnimatePresence>

                {/* Navigation arrows */}
                <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white">
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white">
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
                      className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? 'bg-leaf-green w-8' : 'bg-gray-300'
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

      {/* Products section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-4 md:mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Our Best Sellers</h2>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="wait">
              {filteredProducts.map((product: ProductItem) => (
                <motion.div key={product._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                  <ProductCard _id={product._id} name={product.name} price={product.price} image={product.images?.[0] || 'https://via.placeholder.com/150'} category={product.category || 'General'} stock={product.stock} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Home;