import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Tag,
  Image as ImageIcon,
  ShoppingBag,
  BadgePercent,
  Users,
  Star,
  Settings,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ACCENT = "#e8622a";
const GROUPS_STORAGE_KEY = "sholex:admin:sidebar-collapsed-groups";

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  end?: boolean;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: "admin.groups.main",
    items: [{ to: "/admin", labelKey: "admin.dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    labelKey: "admin.groups.catalog",
    items: [
      { to: "/admin/products", labelKey: "admin.products", icon: Package },
      { to: "/admin/categories", labelKey: "admin.categories", icon: Tag },
      { to: "/admin/hero-slides", labelKey: "admin.heroSlides", icon: ImageIcon },
    ],
  },
  {
    labelKey: "admin.groups.sales",
    items: [
      { to: "/admin/orders", labelKey: "admin.orders", icon: ShoppingBag },
      { to: "/admin/coupons", labelKey: "admin.coupons", icon: BadgePercent },
    ],
  },
  {
    labelKey: "admin.groups.customers",
    items: [
      { to: "/admin/users", labelKey: "admin.users", icon: Users },
      { to: "/admin/reviews", labelKey: "admin.reviews", icon: Star },
    ],
  },
];

const SETTINGS_ITEMS: NavItem[] = [
  { to: "/admin/settings", labelKey: "admin.settings", icon: Settings },
  { to: "/admin/legal", labelKey: "admin.legalPages", icon: FileText },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const AdminSidebar = ({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) => {
  const { t } = useTranslation();

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(
    () => {
      if (typeof window === "undefined") return {};
      try {
        return JSON.parse(localStorage.getItem(GROUPS_STORAGE_KEY) || "{}");
      } catch {
        return {};
      }
    },
  );

  useEffect(() => {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(collapsedGroups));
  }, [collapsedGroups]);

  const toggleGroup = (labelKey: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [labelKey]: !prev[labelKey] }));

  const navLinkClass = (isActive: boolean) =>
    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150
      ${
        isActive
          ? "bg-[#e8622a]/10 text-[#e8622a]"
          : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white"
      }
      ${collapsed ? "lg:justify-center lg:px-2" : ""}`;

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 z-50 h-screen flex flex-col
          border-r border-gray-200 dark:border-white/[0.08]
          bg-white dark:bg-[#0F0F10]
          transition-[width,transform] duration-200 ease-out
          w-[260px] lg:translate-x-0
          ${collapsed ? "lg:w-[72px]" : "lg:w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Admin navigation"
      >
        {/* Header */}
        <div
          className={`flex items-center h-16 shrink-0 border-b border-gray-200 dark:border-white/[0.08] px-4
            ${collapsed ? "lg:justify-center lg:px-2" : "justify-between"}`}
        >
          <Link
            to="/admin"
            className="flex items-center gap-2 font-black tracking-tight text-lg text-gray-900 dark:text-white"
            onClick={onMobileClose}
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-black"
              style={{ background: ACCENT }}
              aria-hidden="true"
            >
              S
            </span>
            {!collapsed && (
              <span className="hidden lg:inline">
                Sholex<span className="text-[#e8622a]">Admin</span>
              </span>
            )}
            <span className="lg:hidden">
              Sholex<span className="text-[#e8622a]">Admin</span>
            </span>
          </Link>

          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Close admin menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Nav body */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-4">
          {NAV_GROUPS.map((group) => {
            const isGroupCollapsed = collapsedGroups[group.labelKey] ?? false;
            return (
              <div key={group.labelKey}>
                {/* Group header — clickable toggle in expanded mode, dot in rail mode */}
                {!collapsed ? (
                  <button
                    onClick={() => toggleGroup(group.labelKey)}
                    className="w-full flex items-center justify-between px-3 mb-1.5
                      text-[10px] font-extrabold uppercase tracking-[0.15em]
                      text-gray-400 dark:text-gray-600
                      hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                    aria-expanded={!isGroupCollapsed}
                  >
                    <span>{t(group.labelKey)}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        isGroupCollapsed ? "-rotate-90" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <p
                    className="hidden lg:block px-3 mb-2 text-center text-[10px] font-extrabold text-gray-400 dark:text-gray-600"
                    aria-hidden="true"
                  >
                    ·
                  </p>
                )}

                {/* Items */}
                {!isGroupCollapsed && (
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.to}>
                          <NavLink
                            to={item.to}
                            end={item.end}
                            onClick={onMobileClose}
                            className={({ isActive }) => navLinkClass(isActive)}
                            title={collapsed ? t(item.labelKey) : undefined}
                          >
                            {({ isActive }) => (
                              <>
                                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                                <span
                                  className={`truncate ${collapsed ? "lg:hidden" : ""}`}
                                >
                                  {t(item.labelKey)}
                                </span>
                                {isActive && (
                                  <motion.span
                                    layoutId="admin-sidebar-active"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                                    style={{ background: ACCENT }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 30,
                                    }}
                                    aria-hidden="true"
                                  />
                                )}
                              </>
                            )}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-gray-200 dark:border-white/[0.08] py-3 px-2 space-y-1">
          {SETTINGS_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) => navLinkClass(isActive)}
                title={collapsed ? t(item.labelKey) : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>
                      {t(item.labelKey)}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="admin-sidebar-active-bottom"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                        style={{ background: ACCENT }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold
              text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white
              transition-all duration-150
              ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
            title={collapsed ? t("userMenu.viewStore") : undefined}
          >
            <ExternalLink className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>
              {t("userMenu.viewStore")}
            </span>
          </Link>

          <button
            onClick={onToggleCollapsed}
            className={`hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold
              text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white
              transition-all duration-150
              ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 shrink-0" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span className="truncate">{t("admin.collapseSidebar")}</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;