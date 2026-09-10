import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Package,
  Tag,
  Image as ImageIcon,
  ShoppingBag,
  BadgePercent,
  Users as UsersIcon,
  Star,
  Settings,
  FileText,
  ExternalLink,
  LogOut,
  Plus,
} from "lucide-react";
import { logout } from "../../features/auth/authSlice";
import { useFocusTrap } from "../../hooks/useFocusTrap";

interface Command {
  id: string;
  label: string;
  hint?: string;
  path?: string;
  action?: "logout";
  icon: React.ComponentType<{ className?: string }>;
  group: "Navigate" | "Actions";
  keywords?: string[];
}

const COMMANDS: Command[] = [
  { id: "dashboard",  label: "Dashboard",        path: "/admin",             icon: LayoutDashboard, group: "Navigate" },
  { id: "products",   label: "Products",         path: "/admin/products",    icon: Package,         group: "Navigate", keywords: ["catalog", "items"] },
  { id: "categories", label: "Categories",       path: "/admin/categories",  icon: Tag,             group: "Navigate" },
  { id: "hero",       label: "Hero Slides",      path: "/admin/hero-slides", icon: ImageIcon,       group: "Navigate", keywords: ["banner", "carousel"] },
  { id: "orders",     label: "Orders",           path: "/admin/orders",      icon: ShoppingBag,     group: "Navigate" },
  { id: "coupons",    label: "Coupons",          path: "/admin/coupons",     icon: BadgePercent,    group: "Navigate", keywords: ["discount", "promo"] },
  { id: "users",      label: "Users",            path: "/admin/users",       icon: UsersIcon,       group: "Navigate", keywords: ["customers", "accounts"] },
  { id: "reviews",    label: "Reviews",          path: "/admin/reviews",     icon: Star,            group: "Navigate" },
  { id: "settings",   label: "Settings",         path: "/admin/settings",    icon: Settings,        group: "Navigate" },
  { id: "legal",      label: "Legal Pages",      path: "/admin/legal",       icon: FileText,        group: "Navigate", keywords: ["privacy", "terms", "returns"] },

  { id: "new-product", label: "Add New Product", hint: "Opens products page", path: "/admin/products", icon: Plus,         group: "Actions" },
  { id: "view-store",  label: "View Store",      hint: "Opens storefront",    path: "/",               icon: ExternalLink, group: "Actions" },
  { id: "logout",      label: "Logout",          hint: "Sign out of admin",   action: "logout",        icon: LogOut,       group: "Actions" },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(panelRef, isOpen, onClose);

  // Reset state on open — adjust during render (React's recommended pattern).
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  // Focus the input on open — external DOM side effect, safe in an effect.
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.keywords?.some((k) => k.toLowerCase().includes(q)),
    );
  }, [query]);

  const grouped = useMemo(() => {
    const map: Record<string, Command[]> = {};
    filtered.forEach((c) => {
      if (!map[c.group]) map[c.group] = [];
      map[c.group].push(c);
    });
    return map;
  }, [filtered]);

  const flatList = useMemo(() => Object.values(grouped).flat(), [grouped]);

  // Clamp activeIndex during render — safe synchronous adjustment.
  if (flatList.length > 0 && activeIndex >= flatList.length) {
    setActiveIndex(flatList.length - 1);
  }

  const runCommand = (cmd: Command) => {
    onClose();
    if (cmd.action === "logout") {
      dispatch(logout());
      navigate("/");
      return;
    }
    if (cmd.path) navigate(cmd.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (flatList.length === 0 ? 0 : (i + 1) % flatList.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        flatList.length === 0 ? 0 : (i - 1 + flatList.length) % flatList.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = flatList[activeIndex];
      if (cmd) runCommand(cmd);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cp-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="cp-panel"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            <div
              ref={panelRef}
              className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl
                bg-white dark:bg-[#17181A]
                border border-gray-200 dark:border-white/[0.08]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-white/[0.08]">
                <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages and actions…"
                  className="flex-1 py-4 text-sm outline-none bg-transparent
                    text-gray-900 dark:text-white placeholder:text-gray-400"
                  aria-label="Search commands"
                />
                <kbd className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded
                  border border-gray-200 dark:border-white/10 text-gray-400">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[400px] overflow-y-auto py-2">
                {flatList.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-gray-500">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                ) : (
                  Object.entries(grouped).map(([group, cmds]) => (
                    <div key={group} className="py-1">
                      <p className="px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                        {group}
                      </p>
                      {cmds.map((cmd) => {
                        const idx = flatList.indexOf(cmd);
                        const isActive = idx === activeIndex;
                        const Icon = cmd.icon;
                        return (
                          <button
                            key={cmd.id}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => runCommand(cmd)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                              isActive
                                ? "bg-[#e8622a]/10 text-[#e8622a]"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                            }`}
                            aria-selected={isActive}
                            role="option"
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="flex-1 truncate font-bold">
                              {cmd.label}
                            </span>
                            {cmd.hint && (
                              <span className="text-xs text-gray-400 truncate hidden sm:inline">
                                {cmd.hint}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-2.5
                border-t border-gray-100 dark:border-white/[0.08]
                text-[10px] font-bold text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10">↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10">↵</kbd>
                    Select
                  </span>
                </div>
                <span>
                  {flatList.length} result{flatList.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;