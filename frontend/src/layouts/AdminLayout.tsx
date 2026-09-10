import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import CommandPalette from "../components/admin/CommandPalette";

const STORAGE_KEY = "sholex:admin:sidebar-collapsed";

const AdminLayout = () => {
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Reset drawer on route change (React's official pattern)
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFAF5] dark:bg-[#0F1011]">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={`transition-[padding] duration-200 ease-out
          pt-16
          ${sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"}`}
      >
        <AdminTopbar
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuClick={() => setMobileOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="px-4 md:px-6 lg:px-8 pt-6 focus:outline-none"
          style={{
            paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Suspense
            fallback={
              <div className="flex justify-center items-center py-24">
                <div
                  className="w-10 h-10 rounded-full border-4 animate-spin"
                  style={{
                    borderColor: "#e8622a30",
                    borderTopColor: "#e8622a",
                  }}
                  role="status"
                  aria-label="Loading"
                />
              </div>
            }
          >
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </Suspense>
        </main>
      </div>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
};

export default AdminLayout;