const ACCENT = "#e8622a";

interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label?: string;
}

const Toggle = ({ on, onToggle, disabled, label }: ToggleProps) => (
  <button type="button" onClick={onToggle} disabled={disabled} className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 disabled:opacity-50" style={{ background: on ? ACCENT : "#2d2d2d", boxShadow: on ? `0 0 10px ${ACCENT}55` : "none" }} role="switch" aria-checked={on} aria-label={label || "Toggle"}>
    <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300" style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
  </button>
);

export default Toggle;