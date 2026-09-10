import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ExternalLink,
  LogOut,
  ChevronDown,
  Store,
  User as UserIcon,
} from "lucide-react";
import type { RootState } from "../../store";
import { logout } from "../../features/auth/authSlice";
import ThemeToggle from "../ThemeToggle";

interface AdminTopbarProps {
  sidebarCollapsed: boolean;
  onMobileMenuClick: () => void;
}

const AdminTopbar = ({
  sidebarCollapsed,
  onMobileMenuClick,
}: AdminTopbarProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A";

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 flex items-center gap-3 px-4
        bg-white/90 dark:bg-[#0F0F10]/90 backdrop-blur-xl
        border-b border-gray-200 dark:border-white/[0.08]
        transition-[left] duration-200 ease-out
        left-0 ${sidebarCollapsed ? "lg:left-[72px]" : "lg:left-[260px]"}`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuClick}
        className="lg:hidden p-2 -ml-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        aria-label="Open admin menu"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Title (mobile only, gives context) */}
      <span className="lg:hidden text-sm font-bold text-gray-700 dark:text-gray-300 truncate">
        {t("admin.label")}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right cluster */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language switcher */}
        <select
          value={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
          aria-label={t("nav.language")}
          className="hidden sm:block px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-white/[0.06]
            border border-gray-200 dark:border-white/10
            text-xs font-bold text-gray-700 dark:text-gray-300
            focus:outline-none focus:ring-2 focus:ring-[#e8622a]/40"
        >
          <option value="en">EN</option>
          <option value="pcm">PCM</option>
        </select>

        <ThemeToggle />

        {/* Store shortcut */}
        <Link
          to="/"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
            text-gray-600 dark:text-gray-400
            bg-gray-100 dark:bg-white/[0.06]
            border border-gray-200 dark:border-white/10
            hover:text-gray-900 dark:hover:text-white hover:border-[#e8622a]/50
            transition-colors"
          aria-label={t("userMenu.viewStore")}
        >
          <Store className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden md:inline">{t("userMenu.viewStore")}</span>
        </Link>

        {/* Account dropdown */}
        <div ref={accountRef} className="relative">
          <button
            onClick={() => setAccountOpen((o) => !o)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Account menu"
            aria-haspopup="true"
            aria-expanded={accountOpen}
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
              style={{ background: "#e8622a" }}
              aria-hidden="true"
            >
              {initial}
            </span>
            <ChevronDown
              className={`hidden sm:block w-3.5 h-3.5 text-gray-400 transition-transform ${
                accountOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence>
            {accountOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 rounded-2xl shadow-xl border overflow-hidden
                  bg-white dark:bg-[#141414]
                  border-gray-200 dark:border-white/[0.08]"
                role="menu"
                aria-label="Account menu"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <Link
                  to="/account"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                  role="menuitem"
                >
                  <UserIcon className="w-4 h-4" aria-hidden="true" />
                  {t("userMenu.account")}
                </Link>

                <Link
                  to="/"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                  role="menuitem"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  {t("userMenu.viewStore")}
                </Link>

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
      </div>
    </header>
  );
};

export default AdminTopbar;