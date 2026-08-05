import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { History, ChevronDown } from "lucide-react";
import type { ChangeLogItem } from "./SettingsPage";

const ACCENT = "#e8622a";

interface AuditLogProps {
  changeLogs: ChangeLogItem[];
  isDark: boolean;
}

const AuditLog = ({ changeLogs, isDark }: AuditLogProps) => {
  const [showAudit, setShowAudit] = useState(false);
  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6b7280";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const sectionBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const theadBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const hoverBg = isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.02)";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
      <button onClick={() => setShowAudit(v => !v)} className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors" style={{ background: hoverBg }} aria-expanded={showAudit} aria-controls="audit-log-table">
        <span className="flex items-center gap-2.5 text-sm font-black" style={{ color: textSecondary }}><History className="w-4 h-4" style={{ color: "#8b5cf6" }} /> Audit Log <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>{changeLogs.length}</span></span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showAudit ? "rotate-180" : ""}`} style={{ color: textMuted }} />
      </button>
      <AnimatePresence>
        {showAudit && (
          <div id="audit-log-table" className="overflow-hidden border-t" style={{ borderColor: sectionBorder }}>
            <div className="overflow-x-auto max-h-64 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: `${ACCENT}40 transparent` }}>
              <table className="w-full text-left" aria-label="Settings change history">
                <thead style={{ background: theadBg }}>
                  <tr>{["Field","Old Value","New Value","Admin","Date"].map(h => <th key={h} scope="col" className="px-5 py-3 text-[9px] font-extrabold uppercase tracking-widest" style={{ color: textMuted }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {changeLogs.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: textMuted }}>No changes logged yet.</td></tr>
                  ) : changeLogs.map(log => (
                    <tr key={log._id} className="border-t transition-colors" style={{ borderColor: tableBorder }}>
                      <td className="px-5 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa" }}>{log.field}</span></td>
                      <td className="px-5 py-3 text-xs max-w-[100px] truncate" style={{ color: textMuted }}>{log.oldValue || "—"}</td>
                      <td className="px-5 py-3 text-xs max-w-[100px] truncate" style={{ color: textPrimary }}>{log.newValue || "—"}</td>
                      <td className="px-5 py-3 text-xs truncate max-w-[120px]" style={{ color: textSecondary }}>{log.adminEmail}</td>
                      <td className="px-5 py-3 text-xs whitespace-nowrap" style={{ color: textMuted }}>{new Date(log.changedAt).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuditLog;