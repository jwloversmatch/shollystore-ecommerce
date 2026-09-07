import { useState, useMemo } from "react";
import { Shield, Search, ChevronLeft, ChevronRight } from "lucide-react";

const ACCENT = "#e8622a";

interface UserData {
  _id: string;
  email: string;
  role: "user" | "admin";
}

interface UserManagementTableProps {
  users: UserData[];
  onRoleUpdate: (id: string, role: "user" | "admin") => void;
  isDark: boolean;
}

const PAGE_SIZE = 10; // Adjust as needed

const UserManagementTable = ({
  users,
  onRoleUpdate,
  isDark,
}: UserManagementTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Styling variables (unchanged)
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

  // Filter users based on search term (email or role)
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const q = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  // Slice users for current page
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: cardShadow,
      }}
    >
      <div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: sectionBorder }}
      >
        <h2
          className="font-black flex items-center gap-2"
          style={{ color: textPrimary }}
        >
          <Shield className="w-4 h-4" style={{ color: "#8b5cf6" }} />
          User Management
        </h2>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: textMuted }}
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page when search changes
            }}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm font-medium outline-none transition-colors"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textPrimary,
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="User management">
          <thead style={{ background: theadBg }}>
            <tr>
              {["Email", "Current Role", "Change Role"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-3 sm:px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap"
                  style={{ color: textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((u) => (
              <tr
                key={u._id}
                className="border-t transition-colors"
                style={{ borderColor: tableBorder }}
              >
                <td
                  className="px-3 sm:px-5 py-3.5 text-sm max-w-[150px] sm:max-w-[250px] truncate min-w-[0]"
                  style={{ color: textSecondary }}
                >
                  {u.email}
                </td>
                <td className="px-3 sm:px-5 py-3.5 whitespace-nowrap">
                  <span
                    className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap"
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
                <td className="px-3 sm:px-5 py-3.5 whitespace-nowrap">
                  <label htmlFor={`role-${u._id}`} className="sr-only">
                    Change role for {u.email}
                  </label>
                  <select
                    id={`role-${u._id}`}
                    value={u.role}
                    onChange={(e) =>
                      onRoleUpdate(u._id, e.target.value as "user" | "admin")
                    }
                    className="text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer transition-all whitespace-nowrap"
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
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: textMuted }}
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {filteredUsers.length > 0 && (
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-3 px-5 py-3 border-t"
          style={{ borderColor: sectionBorder }}
        >
          <span className="text-xs" style={{ color: textMuted }}>
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of{" "}
            {filteredUsers.length} users
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition"
              style={{ borderColor: inputBorder, color: textPrimary }}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold" style={{ color: textPrimary }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/5 transition"
              style={{ borderColor: inputBorder, color: textPrimary }}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;