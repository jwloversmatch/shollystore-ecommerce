import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { RootState } from '../store';
import { logout } from '../features/auth/authSlice';
import {
  ShoppingCart, User, LogOut, LayoutDashboard, Settings,
  Image, Tag, BadgePercent, Home, MoreHorizontal, X, Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = '#e8622a';

const ADMIN_LINKS = [
  { to: '/admin',              label: 'Dashboard',  icon: <LayoutDashboard className="w-5 h-5" /> },
  { to: '/admin/hero-slides',  label: 'Hero Slides', icon: <Image className="w-5 h-5" />          },
  { to: '/admin/categories',   label: 'Categories', icon: <Tag className="w-5 h-5" />             },
  { to: '/admin/coupons',      label: 'Coupons',    icon: <BadgePercent className="w-5 h-5" />    },
  { to: '/admin/settings',     label: 'Settings',   icon: <Settings className="w-5 h-5" />        },
];

// ─── Bottom-nav button ────────────────────────────────────────────────────────
interface NavBtnProps {
  to: string; icon: React.ReactNode; label: string; active: boolean; badge?: number;
}
const NavBtn: React.FC<NavBtnProps> = ({ to, icon, label, active, badge }) => (
  <Link to={to} className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[52px] group">
    {active && (
      <motion.div
        layoutId="bottom-nav-indicator"
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full"
        style={{ background: ACCENT }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      />
    )}
    <div className="relative transition-transform duration-150 group-active:scale-90"
      style={{ color: active ? ACCENT : '#6b7280' }}>
      {icon}
      {(badge ?? 0) > 0 && (
        <span className="absolute -top-1.5 -right-1.5 text-white text-[8px] font-black min-w-[14px] min-h-[14px] rounded-full flex items-center justify-center px-0.5"
          style={{ background: ACCENT }}>
          {badge}
        </span>
      )}
    </div>
    <span className="text-[9px] font-extrabold uppercase tracking-wide"
      style={{ color: active ? ACCENT : '#6b7280' }}>
      {label}
    </span>
  </Link>
);

// ─── Main component ───────────────────────────────────────────────────────────
const Navbar = () => {
  const { user }      = useSelector((s: RootState) => s.auth);
  const { cartItems } = useSelector((s: RootState) => s.cart);
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const { pathname }  = useLocation();

  const [adminDrawer, setAdminDrawer] = useState(false);

  const totalQty = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const showCart = !user || user.role === 'user';

  const isActive = (path: string) => {
    if (path === '/')      return pathname === '/';
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setAdminDrawer(false);
  };

  const desktopLinkCls = (path: string) =>
    `flex items-center gap-1.5 text-sm font-bold transition-colors duration-150 ${
      isActive(path) ? 'text-[#e8622a]' : 'text-gray-500 hover:text-white'
    }`;

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ══════ DESKTOP — fixed top bar, overlays hero ═══════════════════════ */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(17,17,17,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin' : '/'}
            className="text-2xl font-black text-white tracking-tight shrink-0 flex items-center gap-1.5">
            <Flame className="w-5 h-5" style={{ color: ACCENT }} />
            Lotce<span style={{ color: ACCENT }}>Wieth</span>
          </Link>

          {/* Admin links */}
          {user?.role === 'admin' && (
            <div className="flex items-center gap-5">
              {ADMIN_LINKS.map(l => (
                <Link key={l.to} to={l.to} className={desktopLinkCls(l.to)}>
                  {l.icon} {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* User links */}
          {user?.role === 'user' && (
            <Link to="/account" className={desktopLinkCls('/account')}>
              <User className="w-4 h-4" /> Account
            </Link>
          )}

          {/* Right: cart + auth */}
          <div className="flex items-center gap-4 shrink-0">
            {showCart && (
              <Link to="/cart" className="relative p-1">
                <ShoppingCart className={`w-5 h-5 transition-colors ${isActive('/cart') ? 'text-[#e8622a]' : 'text-gray-500 hover:text-white'}`} />
                <AnimatePresence>
                  {totalQty > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 text-white text-[9px] font-black min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1"
                      style={{ background: ACCENT }}>
                      {totalQty}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )}

            {user ? (
              <motion.button onClick={handleLogout} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </motion.button>
            ) : (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: ACCENT, boxShadow: `0 4px 14px ${ACCENT}55` }}>
                  <User className="w-4 h-4" /> Login
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* ══════ MOBILE — FIXED top bar (no longer reserves space) ══════════ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-5 py-4"
        style={{
          background:     'rgba(10,10,11,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom:   '1px solid rgba(255,255,255,0.06)',
        }}>
        <Link to={user?.role === 'admin' ? '/admin' : '/'}
          className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
          <Flame className="w-4 h-4" style={{ color: ACCENT }} />
          Lotce<span style={{ color: ACCENT }}>Wieth</span>
        </Link>

        {showCart && (
          <Link to="/cart" className="relative p-1.5 rounded-xl transition-colors"
            style={{ color: isActive('/cart') ? ACCENT : '#6b7280' }}>
            <ShoppingCart className="w-5 h-5" />
            {totalQty > 0 && (
              <span className="absolute -top-0.5 -right-0.5 text-white text-[8px] font-black min-w-[15px] min-h-[15px] rounded-full flex items-center justify-center px-0.5"
                style={{ background: ACCENT }}>
                {totalQty}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* ══════ MOBILE — fixed bottom nav ════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50"
        style={{
          background:    '#111111',
          borderTop:     '1px solid rgba(255,255,255,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom, 6px)',
        }}>
        <div className="flex justify-around items-center px-2 pt-2 pb-1">

          <NavBtn to={user?.role === 'admin' ? '/admin' : '/'} icon={<Home className="w-5 h-5" />}
            label="Home" active={user?.role === 'admin' ? pathname === '/admin' : pathname === '/'} />

          {showCart && (
            <NavBtn to="/cart" icon={<ShoppingCart className="w-5 h-5" />}
              label="Cart" active={isActive('/cart')} badge={totalQty} />
          )}

          {user?.role === 'admin' && (
            <NavBtn to="/admin/coupons" icon={<BadgePercent className="w-5 h-5" />}
              label="Coupons" active={isActive('/admin/coupons')} />
          )}

          {user?.role === 'user' && (
            <NavBtn to="/account" icon={<User className="w-5 h-5" />}
              label="Account" active={isActive('/account')} />
          )}

          {!user && (
            <NavBtn to="/login" icon={<User className="w-5 h-5" />}
              label="Login" active={isActive('/login')} />
          )}

          {user?.role === 'admin' && (
            <button onClick={() => setAdminDrawer(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[52px] transition-colors duration-150"
              style={{ color: adminDrawer ? ACCENT : '#6b7280' }}>
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[9px] font-extrabold uppercase tracking-wide">More</span>
            </button>
          )}

          {user?.role === 'user' && (
            <button onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[52px] text-gray-600 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-[9px] font-extrabold uppercase tracking-wide">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* ══════ ADMIN BOTTOM SHEET (mobile) ══════════════════════════════════ */}
      <AnimatePresence>
        {adminDrawer && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] md:hidden"
              style={{ background: 'rgba(0,0,0,0.72)' }}
              onClick={() => setAdminDrawer(false)} />

            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed bottom-0 inset-x-0 z-[70] rounded-t-3xl md:hidden"
              style={{
                background:  '#141414',
                borderTop:   `1px solid rgba(255,255,255,0.09)`,
                paddingBottom: 'env(safe-area-inset-bottom, 24px)',
              }}>

              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              <div className="flex justify-between items-center px-6 py-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-widest" style={{ color: ACCENT }}>Admin</p>
                  <h2 className="text-xl font-black text-white">Menu</h2>
                </div>
                <motion.button onClick={() => setAdminDrawer(false)}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-3 px-5 pb-2">
                {ADMIN_LINKS.map((l, i) => {
                  const active = isActive(l.to);
                  return (
                    <motion.div key={l.to}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}>
                      <Link to={l.to} onClick={() => setAdminDrawer(false)}
                        className="flex items-center gap-3 p-4 rounded-2xl border transition-all"
                        style={{
                          background:  active ? `${ACCENT}15` : '#1c1c1c',
                          borderColor: active ? `${ACCENT}40` : 'rgba(255,255,255,0.06)',
                          color:       active ? ACCENT : '#9ca3af',
                        }}>
                        {l.icon}
                        <span className="text-sm font-bold">{l.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-5 pt-3 pb-2">
                <motion.button onClick={handleLogout}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-red-400 border border-red-500/20 transition-colors"
                  style={{ background: 'rgba(239,68,68,0.06)' }}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="md:hidden h-[72px]" aria-hidden />
    </>
  );
};

export default Navbar;