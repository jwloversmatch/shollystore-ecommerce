import { Shield, ChevronRight, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ACCENT = "#e8622a";

interface UserData {
  _id: string;
  email: string;
  role: "user" | "admin";
  name?: string;
  createdAt?: string;
}

interface UserManagementTableProps {
  users: UserData[];
  onRoleUpdate: (id: string, role: "user" | "admin") => void;
  isDark: boolean;
  limit?: number;
}

const UserManagementTable = ({
  users,
  isDark,
  limit = 5,
}: UserManagementTableProps) => {
  const navigate = useNavigate();

  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark
    ? "0 8px 32px rgba(0,0,0,0.35)"
    : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const theadBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const sectionBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const rowHoverBg = isDark
    ? "hover:bg-white/[0.03]"
    : "hover:bg-gray-50";

  const previewUsers = users.slice(0, limit);
  const hasMore = users.length > limit;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: cardShadow,
      }}
    >
      {/* Header with View All */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-4 border-b"
        style={{ borderColor: sectionBorder }}
      >
        <h2
          className="font-black flex items-center gap-2 text-sm sm:text-base"
          style={{ color: textPrimary }}
        >
          <Shield
            className="w-4 h-4 shrink-0"
            style={{ color: "#8b5cf6" }}
            aria-hidden="true"
          />
          <span className="truncate">User Management</span>
        </h2>

        <Link
          to="/admin/users"
          className="shrink-0 flex items-center gap-1 text-xs font-bold transition-colors
            text-gray-500 dark:text-gray-400 hover:text-[#e8622a] dark:hover:text-[#e8622a]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8622a]/40 rounded"
          aria-label="View all users"
        >
          View all
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          className="w-full text-left"
          aria-label="Recent users preview"
        >
          <thead style={{ background: theadBg }}>
            <tr>
              {["Email", "Role"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap"
                  style={{ color: textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewUsers.map((u) => (
              <tr
                key={u._id}
                onClick={() => navigate("/admin/users")}
                className={`border-t transition-colors cursor-pointer ${rowHoverBg}`}
                style={{ borderColor: tableBorder }}
              >
                <td
                  className="px-5 py-3 text-sm max-w-[200px] truncate"
                  style={{ color: textSecondary }}
                >
                  {u.email}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
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
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="px-5 py-10 text-center text-sm"
                  style={{ color: textMuted }}
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer — link to full page */}
      {hasMore && (
        <div
          className="px-5 py-3 border-t"
          style={{ borderColor: sectionBorder }}
        >
          <Link
            to="/admin/users"
            className="flex items-center justify-center gap-1.5 text-xs font-bold transition-colors
              text-gray-500 dark:text-gray-400 hover:text-[#e8622a] dark:hover:text-[#e8622a]"
          >
            See all {users.length} users
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserManagementTable;