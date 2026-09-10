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
  Home,
  X,
  Store,
  Heart,
  Truck,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const ACCENT = "#e8622a";
const BRAND_NAME = "SHOLEX";

// Custom staircase/fries icon
const StairsIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="9" y2="18" />
  </svg>
);

const CUSTOMER_LINKS = [
  { to: "/shop", labelKey: "nav.shop" },
  { to: "/track-order", labelKey: "nav.trackOrder" },
  { to: "/about", labelKey: "nav.about" },
  { to: "/contact", labelKey: "nav.contact" },
];

const MOBILE_SECONDARY_LINKS = [
  { to: "/about", labelKey: "nav.about" },
  { to: "/contact", labelKey: "nav.contact" },
  { to: "/privacy", labelKey: "nav.privacy" },
  { to: "/terms", labelKey: "nav.terms" },
  { to: "/returns", labelKey: "nav.returns" },
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
    badge && badge > 0
      ? `${label}, ${badge} ${badge === 1 ? "item" : "items"}`
      : label;

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

// ─── User dropdown menu ───────────────────────────────────────────────────────
const UserMenu = ({ mobile = false }: { mobile?: boolean }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);
  const wishlistIds = useSelector((s: RootState) => s.wishlist.ids);
  const wishlistCount = wishlistIds.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigator.serviceWorker.controller?.postMessage({
      type: "CLEAR_API_CACHE",
    });
    navigate("/");
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex items-center justify-center rounded-full border transition-colors ${
          mobile
            ? "w-10 h-10 bg-transparent border-transparent"
            : "w-10 h-10 bg-gray-100 dark:bg-[#1c1c1c] border-gray-200 dark:border-white/10 hover:border-[#e8622a]/50"
        }`}
      >
        <User
          className="w-5 h-5 text-gray-600 dark:text-gray-400"
          aria-hidden="true"
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: mobile ? 10 : -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: mobile ? 10 : -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-48 rounded-xl shadow-xl border overflow-hidden bg-white dark:bg-[#141414] border-gray-200 dark:border-white/[0.08] ${
              mobile ? "bottom-full mb-2 right-0" : "top-full mt-2 right-0"
            }`}
            role="menu"
            aria-label="User menu"
          >
            {/* Admin Dashboard link (admins only) */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#e8622a] hover:bg-[#e8622a]/5 transition-colors"
                role="menuitem"
              >
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                {t("userMenu.adminDashboard")}
              </Link>
            )}

            {user?.role === "user" && (
              <>
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  role="menuitem"
                >
                  <User className="w-4 h-4" aria-hidden="true" />
                  {t("userMenu.account")}
                </Link>
                <Link
                  to="/account?tab=wishlist"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  role="menuitem"
                >
                  <Heart className="w-4 h-4" aria-hidden="true" />
                  {t("userMenu.wishlist")}
                  {wishlistCount > 0 && (
                    <span
                      className="ml-auto text-[10px] font-black rounded-full px-2 py-0.5"
                      style={{ background: `${ACCENT}20`, color: ACCENT }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              {t("userMenu.logout")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user } = useSelector((s: RootState) => s.auth);
  const { cartItems } = useSelector((s: RootState) => s.cart);
  const wishlistIds = useSelector((s: RootState) => s.wishlist.ids);
  const { pathname, search } = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const liveRegionRef = useRef<HTMLSpanElement>(null);
  const prevTotalQtyRef = useRef<number | null>(null);

  const totalQty = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const wishlistCount = wishlistIds.length;
  const showCart = !user || user.role === "user";
  const isWishlistActive =
    pathname === "/account" && search.includes("tab=wishlist");

  useEffect(() => {
    if (
      prevTotalQtyRef.current !== null &&
      prevTotalQtyRef.current !== totalQty &&
      liveRegionRef.current
    ) {
      liveRegionRef.current.textContent = `Cart updated: ${totalQty} ${
        totalQty === 1 ? "item" : "items"
      }`;
    }
    prevTotalQtyRef.current = totalQty;
  }, [totalQty]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };


  const desktopLinkCls = (path: string) =>
    `flex items-center gap-1.5 text-sm font-bold transition-colors duration-150 ${
      isActive(path)
        ? "text-[#e8622a]"
        : "text-gray-600 dark:text-gray-500 hover:text-black dark:hover:text-white"
    }`;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <span
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#e8622a] focus:text-white focus:rounded-xl focus:font-bold"
      >
        {t("nav.skipToContent")}
      </a>

      {/* ══════ DESKTOP — fixed top bar ═══════ */}
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
          {/* Left: logo + customer nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl font-black tracking-tight shrink-0 flex items-center gap-2 text-gray-900 dark:text-white"
              aria-label={`${BRAND_NAME} - Home`}
            >
              <Store
                className="w-6 h-6"
                style={{ color: ACCENT }}
                aria-hidden="true"
              />
              <span>{BRAND_NAME}</span>
            </Link>

            {(!user || user.role === "user") && (
              <div className="flex items-center gap-6">
                {CUSTOMER_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={desktopLinkCls(link.to)}
                    aria-current={isActive(link.to) ? "page" : undefined}
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-4 shrink-0">
            <ThemeToggle />

            {/* Language Switcher */}
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              aria-label={t("nav.language")}
              className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300"
            >
              <option value="en">EN</option>
              <option value="pcm">PCM</option>
            </select>

            {showCart && (
              <Link
                to="/cart"
                className="relative p-1"
                aria-label={`${t("nav.cart")} ${totalQty} ${
                  totalQty === 1 ? t("common.item") : t("common.items")
                }`}
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

            {(!user || user.role === "user") && (
              <Link
                to="/track-order"
                className="relative p-1"
                aria-label={t("nav.trackOrder")}
              >
                <Truck
                  className={`w-5 h-5 transition-colors ${
                    isActive("/track-order")
                      ? "text-[#e8622a]"
                      : "text-gray-600 dark:text-gray-500 hover:text-black dark:hover:text-white"
                  }`}
                  aria-hidden="true"
                />
              </Link>
            )}

            {user?.role === "user" && (
              <Link
                to="/account?tab=wishlist"
                className="relative p-1"
                aria-label={`${t("nav.wishlist")} ${wishlistCount}`}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isWishlistActive
                      ? "text-[#e8622a]"
                      : "text-gray-600 dark:text-gray-500 hover:text-black dark:hover:text-white"
                  }`}
                  aria-hidden="true"
                />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-[9px] font-black min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1"
                    style={{ background: ACCENT }}
                    aria-hidden="true"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <UserMenu />
            ) : (
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: "#c9511f",
                    boxShadow: "0 4px 14px #c9511f55",
                  }}
                >
                  <User className="w-4 h-4" aria-hidden="true" />{" "}
                  {t("nav.login")}
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* ══════ MOBILE — top bar + bottom nav + hamburger menu ══════ */}
      {createPortal(
        <>
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
                to="/"
                className="text-xl font-black tracking-tight flex items-center gap-1.5 text-gray-900 dark:text-white"
                aria-label={`${BRAND_NAME} - Home`}
              >
                <Store
                  className="w-5 h-5"
                  style={{ color: ACCENT }}
                  aria-hidden="true"
                />
                <span>{BRAND_NAME}</span>
              </Link>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <select
                  value={i18n.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  aria-label={t("nav.language")}
                  className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/10 text-xs text-gray-700 dark:text-gray-300"
                >
                  <option value="en">EN</option>
                  <option value="pcm">PCM</option>
                </select>
                {(!user || user.role === "user") && (
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-xl transition-colors"
                    style={{ color: mobileMenuOpen ? ACCENT : "#6b7280" }}
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-secondary-menu"
                  >
                    {mobileMenuOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <StairsIcon className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </nav>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                id="mobile-secondary-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="fixed top-[56px] left-0 right-0 z-30 md:hidden bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-white/[0.08] shadow-lg"
                style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
              >
                <div className="px-5 py-4 space-y-1">
                  {MOBILE_SECONDARY_LINKS.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                to="/"
                icon={<Home className="w-5 h-5" />}
                label={t("nav.home")}
                active={pathname === "/"}
              />

              {(!user || user.role === "user") && (
                <NavBtn
                  to="/shop"
                  icon={<ShoppingBag className="w-5 h-5" />}
                  label={t("nav.shop")}
                  active={isActive("/shop")}
                />
              )}

              {showCart && (
                <NavBtn
                  to="/cart"
                  icon={<ShoppingCart className="w-5 h-5" />}
                  label={t("nav.cart")}
                  active={isActive("/cart")}
                  badge={totalQty}
                />
              )}

              {(!user || user.role === "user") && (
                <NavBtn
                  to="/track-order"
                  icon={<Truck className="w-5 h-5" />}
                  label={t("nav.trackOrder")}
                  active={isActive("/track-order")}
                />
              )}

              {user?.role === "user" && (
                <div className="flex flex-col items-center justify-center">
                  <UserMenu mobile />
                </div>
              )}

              {user?.role === "admin" && (
                <NavBtn
                  to="/admin"
                  icon={<LayoutDashboard className="w-5 h-5" />}
                  label={t("admin.label")}
                  active={false}
                />
              )}

              {!user && (
                <NavBtn
                  to="/login"
                  icon={<User className="w-5 h-5" />}
                  label={t("nav.login")}
                  active={isActive("/login")}
                />
              )}
            </div>
          </nav>
        </>,
        document.body,
      )}
    </>
  );
};

export default Navbar;