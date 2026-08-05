import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Pencil, Trash2 } from "lucide-react";

const ACCENT = "#e8622a";

interface SettingsHeaderProps {
  isEditing: boolean;
  hasPayment: boolean;
  onEdit: () => void;
  onClear: () => void;
  isDark: boolean;
}

const SettingsHeader = ({ isEditing, hasPayment, onEdit, onClear, isDark }: SettingsHeaderProps) => {
  const navigate = useNavigate();
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin")} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }} aria-label="Back to admin dashboard"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Flame className="w-3.5 h-3.5" style={{ color: ACCENT }} />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>Admin</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-black leading-none" style={{ color: textPrimary }}>Store Settings</h1>
        </div>
      </div>
      {!isEditing && (
        <div className="flex items-center gap-3">
          {hasPayment && <button onClick={onClear} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 transition-colors" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}><Trash2 className="w-4 h-4" /> Clear All</button>}
          <button onClick={onEdit} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: ACCENT, boxShadow: `0 6px 18px ${ACCENT}44` }}><Pencil className="w-4 h-4" /> Edit Settings</button>
        </div>
      )}
    </header>
  );
};

export default SettingsHeader;