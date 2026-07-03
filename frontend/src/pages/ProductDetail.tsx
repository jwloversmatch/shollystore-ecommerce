import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { ShoppingCart, ArrowLeft, ImageOff, Minus, Plus } from 'lucide-react';
import { useGetProductsQuery } from '../features/api/apiSlice';

// ---------- Local product type ----------
interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  images?: string[];
}

const placeholderImage = 'https://via.placeholder.com/600';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [imageError, setImageError] = useState(false);

  const { data: products = [], isLoading } = useGetProductsQuery({});
  const product = products.find((p: Product) => p.slug === slug);   // ✅ typed

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pastel-pink via-pastel-green to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-leaf-green" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pastel-pink via-pastel-green to-white p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
        <button onClick={() => navigate('/')} className="bg-leaf-green text-white px-6 py-3 rounded-xl font-bold">
          Go to Home
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('Sorry, this item is out of stock!');
      return;
    }
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        image: product.images?.[0] || placeholderImage,
        price: product.price,
        qty,
        stock: product.stock,
      })
    );
    toast.success(`Added ${product.name} to cart!`);
  };

  const increment = () => {
    if (product.stock && qty < product.stock) setQty((prev) => prev + 1);
  };
  const decrement = () => {
    if (qty > 1) setQty((prev) => prev - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-20 md:pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto"
    >
      <SEO
        title={product.name}
        description={`Buy ${product.name} from LotceWieth. ${product.description || ''}`}
        ogImage={product.images?.[0]}
        ogType="product"
      />

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-xl">
          {product.images?.[0] && !imageError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-80 md:h-96 object-contain rounded-2xl"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-80 md:h-96 flex items-center justify-center bg-gray-100 rounded-2xl text-gray-400">
              <ImageOff className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{product.name}</h1>
            <span className="inline-block mt-2 px-3 py-1 bg-pastel-green text-leaf-green text-xs font-bold uppercase rounded-full">
              {product.category}
            </span>
          </div>

          <p className="text-leaf-green font-bold text-3xl md:text-4xl">
            ₦{product.price.toLocaleString()}
          </p>

          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-gray-700">
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity & Add to Cart */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={decrement}
                  disabled={qty <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold w-8 text-center">{qty}</span>
                <button
                  onClick={increment}
                  disabled={qty >= product.stock}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full sm:w-auto bg-leaf-green text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;