import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import { RootState } from "../store";
import { logout } from "../features/auth/authSlice";
import {
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  Image,
  Tag,
  BadgePercent,
  Home,
  MoreHorizontal,
  X,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useState, useRef } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";
const BRAND_NAME = "SHOLEX ENTERPRISES";


const ADMIN_LINKS = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" aria-hidden="true" />,
  },
  {
    to: "/admin/hero-slides",
    label: "Hero Slides",
    icon: <Image className="w-5 h-5" aria-hidden="true" />,
  },
  {
    to: "/admin/categories",
    label: "Categories",
    icon: <Tag className="w-5 h-5" aria-hidden="true" />,
  },
  {
    to: "/admin/coupons",
    label: "Coupons",
    icon: <BadgePercent className="w-5 h-5" aria-hidden="true" />,
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: <Settings className="w-5 h-5" aria-hidden="true" />,
  },
];

// ─── Bottom-nav button ────────────────────────────────────────────────────────
interface NavBtnProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
}
const NavBtn: React.FC<NavBtnProps> = ({ to, icon, label, active, badge }) => {
  const accessibleLabel =
    badge && badge > 0 ? `${label}, ${badge} ${badge === 1 ? "item" : "items"}` : label;

  return (
    <Link
      to={to}
      className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[52px] group"
      aria-label={accessibleLabel}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <motion.div
          layoutId="bottom-nav-indicator"
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full"
          style={{ background: ACCENT }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          aria-hidden="true"
        />
      )}
      <div
        className="relative transition-transform duration-150 group-active:scale-90"
        style={{ color: active ? ACCENT : "#6b7280" }}
        aria-hidden="true"
      >
        {icon}
        {(badge ?? 0) > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 text-white text-[8px] font-black min-w-[14px] min-h-[14px] rounded-full flex items-center justify-center px-0.5"
            style={{ background: ACCENT }}
          >
            {badge}
          </span>
        )}
      </div>
      <span
        className="text-[9px] font-extrabold uppercase tracking-wide"
        style={{ color: active ? ACCENT : "#6b7280" }}
        aria-hidden="true"
      >
        {label}
      </span>
    </Link>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Navbar = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const { cartItems } = useSelector((s: RootState) => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [adminDrawer, setAdminDrawer] = useState(false);
 const drawerRef = useRef<HTMLDivElement>(null);

  const totalQty = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const showCart = !user || user.role === "user";

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setAdminDrawer(false);
  };

  const desktopLinkCls = (path: string) =>
    `flex items-center gap-1.5 text-sm font-bold transition-colors duration-150 ${
      isActive(path)
        ? "text-[#e8622a]"
        : "text-gray-600 dark:text-gray-500 hover:text-black dark:hover:text-white"
    }`;

  // Focus trap for the admin bottom sheet: moves focus in on open, cycles
  // Tab within it, closes on Escape, restores focus to the trigger on close.
useFocusTrap(drawerRef, adminDrawer, () => setAdminDrawer(false));

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <>
            {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#e8622a] focus:text-white focus:rounded-xl focus:font-bold"
      >
        Skip to main content
      </a>

      {/* ══════ DESKTOP — fixed top bar (left exactly where it was) ═══════ */}
      <nav
        className="hidden md:block fixed top-0 left-0 right-0 z-50"
        aria-label="Main navigation"
      >
        <div
          className="absolute inset-0 
          bg-[#FCFAF5]/95 dark:bg-[#111]/95 
          backdrop-blur-xl 
          border-b border-gray-200 dark:border-white/[0.08] 
          shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        />
        <div className="relative max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            to={user?.role === "admin" ? "/admin" : "/"}
            className="text-2xl font-black tracking-tight shrink-0 flex items-center gap-2 text-gray-900 dark:text-white"
            aria-label={`${BRAND_NAME} - Home`}
          >
            <Store className="w-6 h-6" style={{ color: ACCENT }} aria-hidden="true" />
            <span>{BRAND_NAME}</span>
          </Link>

          {/* Admin links */}
          {user?.role === "admin" && (
            <div className="flex items-center gap-5">
              {ADMIN_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={desktopLinkCls(l.to)}
                  aria-current={isActive(l.to) ? "page" : undefined}
                >
                  {l.icon} {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* User links */}
          {user?.role === "user" && (
            <Link
              to="/account"
              className={desktopLinkCls("/account")}
              aria-current={isActive("/account") ? "page" : undefined}
            >
              <User className="w-4 h-4" aria-hidden="true" /> Account
            </Link>
          )}

          {/* Right: cart + auth + theme toggle */}
          <div className="flex items-center gap-4 shrink-0">
            <ThemeToggle />

            {showCart && (
              <Link
                to="/cart"
                className="relative p-1"
                aria-label={`Cart with ${totalQty} ${totalQty === 1 ? "item" : "items"}`}
              >
                <ShoppingCart
                  className={`w-5 h-5 transition-colors ${
                    isActive("/cart")
                      ? "text-[#e8622a]"
                      : "text-gray-600 dark:text-gray-500 hover:text-black dark:hover:text-white"
                  }`}
                  aria-hidden="true"
                />
                <AnimatePresence>
                  {totalQty > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 text-white text-[9px] font-black min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1"
                      style={{ background: ACCENT }}
                      aria-hidden="true"
                    >
                      {totalQty}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )}

            {user ? (
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" /> Logout
              </motion.button>
            ) : (
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: ACCENT,
                    boxShadow: `0 4px 14px ${ACCENT}55`,
                  }}
                >
                  <User className="w-4 h-4" aria-hidden="true" /> Login
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* ══════ Everything mobile-fixed is portaled straight to <body> ══════ */}
      {createPortal(
        <>
          {/* ══════ MOBILE — FIXED top bar ═══════════════════════════════ */}
          <nav
            className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-5
              bg-[#FCFAF5] dark:bg-[#0A0A0B] border-b border-gray-200 dark:border-white/[0.06]"
            style={{
              paddingTop: "env(safe-area-inset-top, 0px)",
              height: "calc(56px + env(safe-area-inset-top, 0px))",
              boxSizing: "border-box",
            }}
            aria-label="Mobile navigation"
          >
            <div className="flex justify-between items-center w-full">
              <Link
                to={user?.role === "admin" ? "/admin" : "/"}
                className="text-xl font-black tracking-tight flex items-center gap-1.5 text-gray-900 dark:text-white"
                aria-label={`${BRAND_NAME} - Home`}
              >
                <Store className="w-5 h-5" style={{ color: ACCENT }} aria-hidden="true" />
                <span>{BRAND_NAME}</span>
              </Link>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                {showCart && (
                  <Link
                    to="/cart"
                    className="relative p-1.5 rounded-xl transition-colors"
                    style={{ color: isActive("/cart") ? ACCENT : "#6b7280" }}
                    aria-label={`Cart with ${totalQty} ${totalQty === 1 ? "item" : "items"}`}
                  >
                    <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                    {totalQty > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 text-white text-[8px] font-black min-w-[15px] min-h-[15px] rounded-full flex items-center justify-center px-0.5"
                        style={{ background: ACCENT }}
                        aria-hidden="true"
                      >
                        {totalQty}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            </div>
          </nav>

          {/* ══════ MOBILE — fixed bottom nav ══════════════════════════════ */}
          <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-40
        bg-[#FCFAF5] dark:bg-[#111111] border-t border-gray-200 dark:border-white/[0.07]"
            aria-label="Bottom navigation"
          >
            <div
              className="flex justify-around items-center px-2 py-1"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <NavBtn
                to={user?.role === "admin" ? "/admin" : "/"}
                icon={<Home className="w-5 h-5" />}
                label="Home"
                active={
                  user?.role === "admin" ? pathname === "/admin" : pathname === "/"
                }
              />

              {showCart && (
                <NavBtn
                  to="/cart"
                  icon={<ShoppingCart className="w-5 h-5" />}
                  label="Cart"
                  active={isActive("/cart")}
                  badge={totalQty}
                />
              )}

              {user?.role === "admin" && (
                <NavBtn
                  to="/admin/coupons"
                  icon={<BadgePercent className="w-5 h-5" />}
                  label="Coupons"
                  active={isActive("/admin/coupons")}
                />
              )}

              {user?.role === "user" && (
                <NavBtn
                  to="/account"
                  icon={<User className="w-5 h-5" />}
                  label="Account"
                  active={isActive("/account")}
                />
              )}

              {!user && (
                <NavBtn
                  to="/login"
                  icon={<User className="w-5 h-5" />}
                  label="Login"
                  active={isActive("/login")}
                />
              )}

              {user?.role === "admin" && (
                <button
  onClick={() => setAdminDrawer(true)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[52px] transition-colors duration-150"
                  style={{ color: adminDrawer ? ACCENT : "#6b7280" }}
                  aria-label="More admin options"
                  aria-haspopup="dialog"
                  aria-expanded={adminDrawer}
                  aria-controls="admin-drawer-sheet"
                >
                  <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                  <span className="text-[9px] font-extrabold uppercase tracking-wide">
                    More
                  </span>
                </button>
              )}

              {user?.role === "user" && (
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[52px] text-gray-600 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                  <span className="text-[9px] font-extrabold uppercase tracking-wide">
                    Logout
                  </span>
                </button>
              )}
            </div>
          </nav>

          {/* ══════ ADMIN BOTTOM SHEET (mobile) ═══════════════════════════ */}
          <AnimatePresence>
            {adminDrawer && (
              <>
                <motion.div
                  key="scrim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] md:hidden bg-black/70 dark:bg-black/70"
                  onClick={() => setAdminDrawer(false)}
                  aria-hidden="true"
                />

                <motion.div
                  key="sheet"
                  ref={drawerRef}
                  id="admin-drawer-sheet"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 32 }}
                  className="fixed bottom-0 inset-x-0 z-[70] rounded-t-3xl md:hidden
                    bg-[#FCFAF5] dark:bg-[#141414] border-t border-gray-200 dark:border-white/[0.09]"
                  style={{
                    paddingBottom: "env(safe-area-inset-bottom, 24px)",
                    boxSizing: "border-box",
                  }}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="admin-drawer-title"
                >
                  <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
                    <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-white/15" />
                  </div>

                  <div className="flex justify-between items-center px-6 py-4">
                    <div>
                      <p
                        className="text-xs font-extrabold uppercase tracking-widest"
                        style={{ color: ACCENT }}
                      >
                        Admin
                      </p>
                      <h2
                        id="admin-drawer-title"
                        className="text-xl font-black text-gray-900 dark:text-white"
                      >
                        Menu
                      </h2>
                    </div>
                    <motion.button
                      onClick={() => setAdminDrawer(false)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-200 dark:bg-white/7"
                      aria-label="Close admin menu"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 px-5 pb-2">
                    {ADMIN_LINKS.map((l, i) => {
                      const active = isActive(l.to);
                      return (
                        <motion.div
                          key={l.to}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Link
                            to={l.to}
                            onClick={() => setAdminDrawer(false)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                              active
                                ? "bg-[#e8622a]/15 border-[#e8622a]/40 text-[#e8622a]"
                                : "bg-gray-200 dark:bg-[#1c1c1c] border-gray-300 dark:border-white/6 text-gray-700 dark:text-[#9ca3af]"
                            }`}
                            aria-current={active ? "page" : undefined}
                          >
                            {l.icon}
                            <span className="text-sm font-bold">{l.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="px-5 pt-3 pb-2">
                    <motion.button
                      onClick={handleLogout}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-red-400 border border-red-500/20 transition-colors bg-red-50 dark:bg-red-500/6"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" /> Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
};

export default Navbar;