import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  CreditCard,
  Bell,
  History,
  ChevronLeft,
  Settings as SettingsIcon,
} from "lucide-react";

const SECTIONS = [
  { to: "/admin/settings/general",       label: "General",       icon: Home },
  { to: "/admin/settings/payments",      label: "Payments",      icon: CreditCard },
  { to: "/admin/settings/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings/activity",      label: "Activity Log",  icon: History },
];

const SettingsLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Page header */}
      <header className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin")}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            bg-gray-100 dark:bg-white/[0.06]
            border border-gray-200 dark:border-white/10
            text-gray-500 dark:text-gray-400
            hover:text-gray-900 dark:hover:text-white
            transition-colors"
          aria-label="Back to admin dashboard"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <SettingsIcon className="w-3.5 h-3.5 text-[#e8622a]" aria-hidden="true" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#e8622a]">
              Admin
            </p>
          </div>
          <h1 className="text-2xl md:text-3xl font-black leading-none text-gray-900 dark:text-[#E7E9EA]">
            Settings
          </h1>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Section rail */}
        <nav
          className="md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible
            pb-2 md:pb-0 -mx-1 px-1"
          aria-label="Settings sections"
        >
          {SECTIONS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap
                transition-colors ${
                  isActive
                    ? "bg-[#e8622a]/10 text-[#e8622a]"
                    : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Section content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;