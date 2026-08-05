import { Shield } from "lucide-react";

const ACCENT = "#e8622a";

interface UserData { _id:string; email:string; role:"user"|"admin"; }

interface UserManagementTableProps {
  users: UserData[];
  onRoleUpdate: (id: string, role: "user" | "admin") => void;
  isDark: boolean;
}

const UserManagementTable = ({ users, onRoleUpdate, isDark }: UserManagementTableProps) => {
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const theadBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const sectionBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
      <div className="flex justify-between items-center px-5 py-4 border-b" style={{ borderColor: sectionBorder }}>
        <h2 className="font-black flex items-center gap-2" style={{ color: textPrimary }}><Shield className="w-4 h-4" style={{ color:"#8b5cf6" }} /> User Management</h2>
        <span className="text-[10px] font-semibold" style={{ color: textMuted }}>{users.length} users</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="User management">
          <thead style={{ background: theadBg }}>
            <tr>
              {["Email","Current Role","Change Role"].map(h => (
                <th key={h} scope="col" className="px-3 sm:px-5 py-3 text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap" style={{ color: textMuted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t transition-colors" style={{ borderColor: tableBorder }}>
                <td className="px-3 sm:px-5 py-3.5 text-sm max-w-[150px] sm:max-w-[250px] truncate min-w-[0]" style={{ color: textSecondary }}>{u.email}</td>
                <td className="px-3 sm:px-5 py-3.5 whitespace-nowrap">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap" style={{ background:u.role==="admin"?`${ACCENT}15`:"rgba(156,163,175,0.1)", color:u.role==="admin"?ACCENT:"#9ca3af", border:`1px solid ${u.role==="admin"?`${ACCENT}30`:"rgba(156,163,175,0.2)"}` }}>{u.role}</span>
                </td>
                <td className="px-3 sm:px-5 py-3.5 whitespace-nowrap">
                  <label htmlFor={`role-${u._id}`} className="sr-only">Change role for {u.email}</label>
                  <select id={`role-${u._id}`} value={u.role} onChange={e => onRoleUpdate(u._id, e.target.value as "user"|"admin")} className="text-xs font-bold px-3 py-1.5 rounded-xl outline-none cursor-pointer transition-all whitespace-nowrap" style={{ background: inputBg, color: textSecondary, border:`1px solid ${inputBorder}` }}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={3} className="px-5 py-12 text-center text-sm" style={{ color: textMuted }}>No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementTable;