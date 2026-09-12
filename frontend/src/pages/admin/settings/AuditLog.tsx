import { History } from "lucide-react";
import type { ChangeLogItem } from "./settingsSchema";

interface AuditLogProps {
  changeLogs: ChangeLogItem[];
}

const AuditLog = ({ changeLogs }: AuditLogProps) => {
  if (changeLogs.length === 0) {
    return (
      <div className="flex items-center gap-3 p-6 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-gray-500 dark:text-gray-400">
        <History className="w-5 h-5 shrink-0" aria-hidden="true" />
        <p className="text-sm">No changes logged yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-left" aria-label="Settings change history">
        <thead>
          <tr>
            {["Field", "Old Value", "New Value", "Admin", "Date"].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-3 py-3 text-[9px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {changeLogs.map((log) => (
            <tr
              key={log._id}
              className="border-t border-gray-100 dark:border-white/[0.06]"
            >
              <td className="px-3 py-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">
                  {log.field}
                </span>
              </td>
              <td className="px-3 py-3 text-xs max-w-[140px] truncate text-gray-400 dark:text-gray-500">
                {log.oldValue || "—"}
              </td>
              <td className="px-3 py-3 text-xs max-w-[140px] truncate text-gray-900 dark:text-[#E7E9EA]">
                {log.newValue || "—"}
              </td>
              <td className="px-3 py-3 text-xs truncate max-w-[160px] text-gray-500 dark:text-gray-400">
                {log.adminEmail}
              </td>
              <td className="px-3 py-3 text-xs whitespace-nowrap text-gray-400 dark:text-gray-500">
                {new Date(log.changedAt).toLocaleString("en-NG", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLog;