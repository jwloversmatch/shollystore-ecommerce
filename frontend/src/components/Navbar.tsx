import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { RootState } from '../store';
import { logout } from '../features/auth/authSlice';
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  Image,
  Tag,
  AlignRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { cartItems } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const showCart = !user || user.role === 'user';

  return (
    <nav className="sticky top-4 z-50 max-w-7xl mx-auto px-6">
      <div className="bg-white/80 backdrop-blur-md shadow-glass border border-white/40 rounded-2xl px-6 py-3 flex justify-between items-center relative">
        {/* Logo */}
        <Link
          to={user?.role === 'admin' ? '/admin' : '/'}
          className="text-2xl font-bold text-gray-800 tracking-tight"
        >
          Lotce<span className="text-leaf-green">Wieth</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {showCart && (
            <Link to="/cart" className="relative group">
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-leaf-green transition-colors" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blob-orange text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <>
              {/* Desktop Admin Links (hidden on mobile) */}
              {user.role === 'admin' && (
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-leaf-green transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link
                    to="/admin/hero-slides"
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-leaf-green transition-colors"
                  >
                    <Image className="w-4 h-4" /> Hero Slides
                  </Link>
                  <Link
                    to="/admin/categories"
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-leaf-green transition-colors"
                  >
                    <Tag className="w-4 h-4" /> Categories
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-leaf-green transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                </div>
              )}

              {/* Desktop User Links (visible for regular users) */}
              {user.role === 'user' && (
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    to="/account"
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-leaf-green transition-colors"
                  >
                    <User className="w-4 h-4" /> Account
                  </Link>
                </div>
              )}

              {/* Desktop Logout (visible for all users) */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>

              {/* Mobile Hamburger (only for admins) */}
              {user.role === 'admin' && (
                <div className="md:hidden relative">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-1 text-gray-600 hover:text-leaf-green transition-colors"
                  >
                    <AlignRight className="w-6 h-6" />
                  </button>

                  <AnimatePresence>
                    {mobileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-48 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 z-50"
                      >
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-leaf-green/10 hover:text-leaf-green rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link
                          to="/admin/hero-slides"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-leaf-green/10 hover:text-leaf-green rounded-xl transition-colors"
                        >
                          <Image className="w-4 h-4" /> Hero Slides
                        </Link>
                        <Link
                          to="/admin/categories"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-leaf-green/10 hover:text-leaf-green rounded-xl transition-colors"
                        >
                          <Tag className="w-4 h-4" /> Categories
                        </Link>
                        <Link
                          to="/admin/settings"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-leaf-green/10 hover:text-leaf-green rounded-xl transition-colors"
                        >
                          <Settings className="w-4 h-4" /> Settings
                        </Link>
                        <hr className="border-gray-100 my-1" />
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile Links for regular users (non‑admin) */}
              {user.role === 'user' && (
                <div className="md:hidden flex items-center gap-3">
                  <Link
                    to="/account"
                    className="text-gray-600 hover:text-leaf-green transition-colors p-1"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-leaf-green transition-colors"
            >
              <User className="w-4 h-4" /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;