import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Users as UsersIcon,
  UserCheck,
  UserCog,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Mail,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
} from "../../../features/api/apiSlice";
import { useTheme } from "../../../context/ThemeContext";

const ACCENT = "#e8622a";

type RoleFilter = "all" | "admin" | "user";
type SortKey = "email" | "role";
type SortDir = "asc" | "desc";

interface UserData {
  _id: string;
  email: string;
  role: "user" | "admin";
  name?: string;
  createdAt?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const UserManagementPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { data: users = [], isLoading, isError } = useGetUsersQuery({});
  const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortKey, setSortKey] = useState<SortKey>("email");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Theme tokens
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark
    ? "0 8px 32px rgba(0,0,0,0.35)"
    : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const theadBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const sectionBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u: UserData) => u.role === "admin").length;
    const regular = users.filter((u: UserData) => u.role === "user").length;
    const ratio = total > 0 ? Math.round((admins / total) * 100) : 0;
    return { total, admins, regular, ratio };
  }, [users]);

  // Filter + sort
  const filteredUsers = useMemo(() => {
    let result = [...users] as UserData[];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          u.role.toLowerCase().includes(q),
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    result.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [users, searchTerm, roleFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, safePage, pageSize]);

  const rangeStart = filteredUsers.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filteredUsers.length);

  const resetToFirstPage = () => setCurrentPage(1);

  const handleSearchChange = (v: string) => {
    setSearchTerm(v);
    resetToFirstPage();
  };

  const handleRoleFilterChange = (v: RoleFilter) => {
    setRoleFilter(v);
    resetToFirstPage();
  };

  const handlePageSizeChange = (v: number) => {
    setPageSize(v);
    resetToFirstPage();
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleRoleUpdate = async (id: string, role: "user" | "admin") => {
    try {
      await updateUserRole({ id, role }).unwrap();
      toast.success(`Role updated to ${role}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  // ─── Loading / error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-[#1F2123] animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-gray-200 dark:bg-[#1F2123] animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-gray-200 dark:bg-[#1F2123] animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-sm font-bold text-red-500">
          Failed to load users. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: `${ACCENT}18` }}
            >
              <UsersIcon
                className="w-3.5 h-3.5"
                style={{ color: ACCENT }}
                aria-hidden="true"
              />
            </span>
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
              style={{ color: ACCENT }}
            >
              Admin
            </p>
          </div>
          <h1
            className="text-2xl md:text-3xl font-black leading-tight"
            style={{ color: textPrimary }}
          >
            User Management
          </h1>
          <p className="text-sm mt-1" style={{ color: textMuted }}>
            Manage roles, permissions, and access for all users.
          </p>
        </div>

        <button
          onClick={() => {
            // CSV export — replace with real export endpoint if needed
            const csv = [
              "email,role",
              ...filteredUsers.map((u) => `${u.email},${u.role}`),
            ].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "users.csv";
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Exported users.csv");
          }}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
            text-gray-700 dark:text-gray-300
            bg-white dark:bg-white/5
            border border-gray-200 dark:border-white/10
            hover:border-[#e8622a]/50 transition-colors"
          aria-label="Export users as CSV"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Export
        </button>
      </header>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          isDark={isDark}
          icon={<UsersIcon className="w-5 h-5" />}
          label="Total Users"
          value={stats.total.toLocaleString()}
          accent="#8b5cf6"
        />
        <StatCard
          isDark={isDark}
          icon={<ShieldCheck className="w-5 h-5" />}
          label="Admins"
          value={stats.admins.toLocaleString()}
          accent={ACCENT}
        />
        <StatCard
          isDark={isDark}
          icon={<UserCheck className="w-5 h-5" />}
          label="Regular Users"
          value={stats.regular.toLocaleString()}
          accent="#10b981"
        />
        <StatCard
          isDark={isDark}
          icon={<UserCog className="w-5 h-5" />}
          label="Admin Ratio"
          value={`${stats.ratio}%`}
          accent="#3b82f6"
        />
      </div>

      {/* Toolbar + table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: cardShadow,
        }}
      >
        {/* Toolbar */}
        <div
          className="flex flex-col lg:flex-row lg:items-center gap-3 p-4 border-b"
          style={{ borderColor: sectionBorder }}
        >
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: textMuted }}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by email, name, or role…"
              aria-label="Search users"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all
                focus:ring-2 focus:ring-[#e8622a]/30"
              style={{
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                color: textPrimary,
              }}
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" style={{ color: textMuted }} />
              </button>
            )}
          </div>

          {/* Role filter pills */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl shrink-0"
            style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
            role="group"
            aria-label="Filter by role"
          >
            {(
              [
                { v: "all", label: "All" },
                { v: "admin", label: "Admins" },
                { v: "user", label: "Users" },
              ] as const
            ).map((opt) => {
              const active = roleFilter === opt.v;
              return (
                <button
                  key={opt.v}
                  onClick={() => handleRoleFilterChange(opt.v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    active
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  style={active ? { background: ACCENT } : {}}
                  aria-pressed={active}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Page size */}
          <div className="flex items-center gap-2 shrink-0">
            <label
              htmlFor="page-size"
              className="text-xs font-bold whitespace-nowrap"
              style={{ color: textMuted }}
            >
              Rows
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2.5 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer"
              style={{
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                color: textPrimary,
              }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="User management">
            <thead style={{ background: theadBg }}>
              <tr>
                <SortHeader
                  label="Email"
                  sortKey="email"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                  color={textMuted}
                />
                <SortHeader
                  label="Role"
                  sortKey="role"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                  color={textMuted}
                />
                <th
                  scope="col"
                  className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap text-right"
                  style={{ color: textMuted }}
                >
                  Change Role
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedUsers.map((u) => (
                  <motion.tr
                    key={u._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="border-t transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    style={{ borderColor: tableBorder }}
                  >
                    <td
                      className="px-5 py-3.5 text-sm max-w-[320px] truncate"
                      style={{ color: textSecondary }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                          style={{ background: "#8b5cf6" }}
                          aria-hidden="true"
                        >
                          {u.email.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          background:
                            u.role === "admin"
                              ? `${ACCENT}15`
                              : "rgba(156,163,175,0.1)",
                          color: u.role === "admin" ? ACCENT : "#9ca3af",
                          border: `1px solid ${
                            u.role === "admin"
                              ? `${ACCENT}30`
                              : "rgba(156,163,175,0.2)"
                          }`,
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <label htmlFor={`role-${u._id}`} className="sr-only">
                        Change role for {u.email}
                      </label>
                      <select
                        id={`role-${u._id}`}
                        value={u.role}
                        disabled={isUpdating}
                        onChange={(e) =>
                          handleRoleUpdate(
                            u._id,
                            e.target.value as "user" | "admin",
                          )
                        }
                        className="text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer
                          disabled:opacity-50 transition-all focus:ring-2 focus:ring-[#e8622a]/30"
                        style={{
                          background: inputBg,
                          color: textSecondary,
                          border: `1px solid ${inputBorder}`,
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-16 text-center">
                    <Mail
                      className="w-10 h-10 mx-auto mb-3"
                      style={{ color: textMuted }}
                      aria-hidden="true"
                    />
                    <p className="text-sm font-bold mb-1" style={{ color: textPrimary }}>
                      No users match your filters
                    </p>
                    <p className="text-xs" style={{ color: textMuted }}>
                      Try adjusting your search or role filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {filteredUsers.length > 0 && (
          <div
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-5 py-3.5 border-t"
            style={{ borderColor: sectionBorder }}
          >
            <span className="text-xs font-semibold" style={{ color: textMuted }}>
              Showing{" "}
              <span style={{ color: textPrimary }}>
                {rangeStart}–{rangeEnd}
              </span>{" "}
              of{" "}
              <span style={{ color: textPrimary }}>
                {filteredUsers.length.toLocaleString()}
              </span>{" "}
              users
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30
                  hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                style={{ color: textPrimary }}
                aria-label="First page"
              >
                ««
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border disabled:opacity-30
                  hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                style={{ borderColor: inputBorder, color: textPrimary }}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span
                className="px-3 text-sm font-bold whitespace-nowrap"
                style={{ color: textPrimary }}
              >
                {safePage} <span style={{ color: textMuted }}>of</span>{" "}
                {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border disabled:opacity-30
                  hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                style={{ borderColor: inputBorder, color: textPrimary }}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30
                  hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                style={{ color: textPrimary }}
                aria-label="Last page"
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>

      {isUpdating && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#17181A] border border-gray-200 dark:border-white/10 shadow-lg">
          <Loader2 className="w-4 h-4 animate-spin text-[#e8622a]" />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            Updating role…
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  isDark,
  icon,
  label,
  value,
  accent,
}: {
  isDark: boolean;
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl p-5 flex items-start gap-3"
      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
    >
      <span
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}15`, color: accent }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p
          className="text-[10px] font-extrabold uppercase tracking-widest mb-1"
          style={{ color: textMuted }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-black leading-none truncate"
          style={{ color: textPrimary }}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Sortable header ──────────────────────────────────────────────────────────
function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  color,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  color: string;
}) {
  const active = activeKey === sortKey;
  return (
    <th
      scope="col"
      className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap"
      style={{ color }}
    >
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1.5 hover:text-[#e8622a] transition-colors"
        aria-label={`Sort by ${label} ${active && dir === "asc" ? "descending" : "ascending"}`}
      >
        {label}
        <ArrowUpDown
          className={`w-3 h-3 transition-opacity ${active ? "opacity-100" : "opacity-40"}`}
          aria-hidden="true"
        />
      </button>
    </th>
  );
}

export default UserManagementPage;