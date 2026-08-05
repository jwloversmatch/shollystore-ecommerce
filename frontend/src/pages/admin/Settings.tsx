import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetSettingsChangesQuery,
} from "../../features/api/apiSlice";
import {
  ArrowLeft,
  Banknote,
  MessageCircle,
  Building,
  Pencil,
  Trash2,
  Check,
  Home,
  History,
  Flame,
  AlertCircle,
  Loader2,
  ChevronDown,
  Bell,
  Send,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../components/ConfirmationModal";
import { useTheme } from "../../context/ThemeContext";

const ACCENT = "#e8622a";

const settingsSchema = z.object({
  bankAccountName: z.string().min(1, "Account name is required"),
  bankAccountNumber: z.string().min(1, "Account number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  heroTagline: z.string().optional(),
  heroTitle: z.string().optional(),
  heroDescription: z.string().optional(),
  specialOfferTitle: z.string().optional(),
  specialOfferText: z.string().optional(),
  landingMode: z.boolean().optional(),
});
type SettingsFormData = z.infer<typeof settingsSchema>;

interface ChangeLogItem {
  _id: string;
  field: string;
  oldValue: string;
  newValue: string;
  adminEmail: string;
  changedAt: string;
}

const Toggle = ({
  on,
  onToggle,
  disabled,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label?: string;
}) => (
  <button
    type="button"
    onClick={onToggle}
    disabled={disabled}
    className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 disabled:opacity-50"
    style={{
      background: on ? ACCENT : "#2d2d2d",
      boxShadow: on ? `0 0 10px ${ACCENT}55` : "none",
    }}
    role="switch"
    aria-checked={on}
    aria-label={label || "Toggle"}
  >
    <span
      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300"
      style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
    />
  </button>
);

const Settings = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [clearModal, setClearModal] = useState(false);
  const [showAudit, setShowAudit] = useState(false);

  const { data: settings, isLoading, refetch } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: updating }] = useUpdateSettingsMutation();
  const { data: changeLogs = [] } = useGetSettingsChangesQuery({});

  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushUrl, setPushUrl] = useState("");
  const [sendingPush, setSendingPush] = useState(false);

  // Theme-based styles
  const bg = isDark ? "#0A0A0B" : "#FCFAF5";
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
  const sectionBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const theadBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const tableBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const hoverBg = isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.02)";

  const inputCls = (hasError: boolean) =>
    [
      "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200",
      hasError
        ? "border border-red-500/50 ring-2 ring-red-500/10"
        : "border focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
    ].join(" ");

  const inputStyle = (hasError: boolean) => ({
    background: inputBg,
    borderColor: hasError ? undefined : inputBorder,
    color: textPrimary,
  });

  const textareaCls = (hasError: boolean) =>
    [
      "w-full px-4 py-3.5 rounded-xl text-sm outline-none resize-none transition-all duration-200",
      hasError
        ? "border border-red-500/50 ring-2 ring-red-500/10"
        : "border focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
    ].join(" ");

  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      toast.error("Title and body are required");
      return;
    }
    const token = localStorage.getItem("token");
    setSendingPush(true);
    try {
      const API_BASE =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE}/push/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: pushTitle.trim(),
          body: pushBody.trim(),
          url: pushUrl.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast.success("Push notification sent!");
      setPushTitle("");
      setPushBody("");
      setPushUrl("");
    } catch {
      toast.error("Failed to send push notification");
    } finally {
      setSendingPush(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (settings) {
      reset({
        bankAccountName: settings.bankAccountName || "",
        bankAccountNumber: settings.bankAccountNumber || "",
        bankName: settings.bankName || "",
        whatsappNumber: settings.whatsappNumber || "",
        heroTagline: settings.heroTagline || "",
        heroTitle: settings.heroTitle || "",
        heroDescription: settings.heroDescription || "",
        specialOfferTitle: settings.specialOfferTitle || "",
        specialOfferText: settings.specialOfferText || "",
        landingMode: settings.landingMode || false,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateSettings(data).unwrap();
      toast.success("Settings updated!");
      refetch();
      setIsEditing(false);
    } catch {
      toast.error("Failed to update settings.");
    }
  };

  const toggleLandingMode = async () => {
    try {
      await updateSettings({ landingMode: !settings?.landingMode }).unwrap();
      toast.success(
        `Landing mode ${!settings?.landingMode ? "enabled" : "disabled"}`,
      );
      refetch();
    } catch {
      toast.error("Failed to toggle landing mode.");
    }
  };

  const handleClearAll = async () => {
    try {
      await updateSettings({
        bankAccountName: "",
        bankAccountNumber: "",
        bankName: "",
        whatsappNumber: "",
        heroTagline: "",
        heroTitle: "",
        heroDescription: "",
        specialOfferTitle: "",
        specialOfferText: "",
        landingMode: false,
      }).unwrap();
      toast.success("Settings cleared!");
      refetch();
      setIsEditing(false);
      setClearModal(false);
    } catch {
      toast.error("Failed to clear settings.");
    }
  };

  const hasPayment = !!(
    settings?.bankAccountName ||
    settings?.bankAccountNumber ||
    settings?.bankName ||
    settings?.whatsappNumber
  );

  if (isLoading) {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-28 md:pb-10 focus:outline-none"
        style={{
          background: bg,
          paddingTop: "calc(56px + env(safe-area-inset-top, 0px))",
        }}
      >
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-6"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
            >
              <div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-16 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen p-4 md:p-6 max-w-4xl mx-auto space-y-5 pb-28 md:pb-10 focus:outline-none"
      style={{
        background: bg,
        paddingTop: "calc(56px + env(safe-area-inset-top, 0px))",
      }}
    >
      <ConfirmationModal
        isOpen={clearModal}
        onClose={() => setClearModal(false)}
        onConfirm={handleClearAll}
        title="Clear All Settings?"
        message="This will remove all payment details and homepage content. This cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        type="danger"
      />

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:text-white transition-colors shrink-0"
            style={{
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textMuted,
            }}
            aria-label="Back to admin dashboard"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame
                className="w-3.5 h-3.5"
                style={{ color: ACCENT }}
                aria-hidden="true"
              />
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: ACCENT }}
              >
                Admin
              </p>
            </div>
            <h1
              className="text-2xl md:text-3xl font-black leading-none"
              style={{ color: textPrimary }}
            >
              Store Settings
            </h1>
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-3">
            {hasPayment && (
              <button
                onClick={() => setClearModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 transition-colors"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
                aria-label="Clear all settings"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" /> Clear All
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{
                background: ACCENT,
                boxShadow: `0 6px 18px ${ACCENT}44`,
              }}
              aria-label="Edit store settings"
            >
              <Pencil className="w-4 h-4" aria-hidden="true" /> Edit Settings
            </button>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {!isEditing && (
          <div className="space-y-5" role="region" aria-label="View settings">
            {/* Homepage Content */}
            <section
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: cardShadow,
              }}
            >
              <div
                className="absolute top-0 inset-x-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                }}
              />
              <div className="p-6 md:p-7">
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${ACCENT}18`, color: ACCENT }}
                  >
                    <Home className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h2
                    className="text-lg font-black"
                    style={{ color: textPrimary }}
                  >
                    Homepage Content
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {[
                    { label: "Hero Tagline", value: settings?.heroTagline },
                    { label: "Hero Title", value: settings?.heroTitle },
                    {
                      label: "Special Offer Title",
                      value: settings?.specialOfferTitle,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-4 rounded-xl"
                      style={{
                        background: inputBg,
                        border: `1px solid ${inputBorder}`,
                      }}
                    >
                      <p
                        className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1.5"
                        style={{ color: textMuted }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: textPrimary }}
                      >
                        {item.value || "—"}
                      </p>
                    </div>
                  ))}
                </div>
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                  }}
                >
                  <p
                    className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1.5"
                    style={{ color: textMuted }}
                  >
                    Hero Description
                  </p>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: textPrimary }}
                  >
                    {settings?.heroDescription || "—"}
                  </p>
                </div>
                <div
                  className="mt-3 p-4 rounded-xl"
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                  }}
                >
                  <p
                    className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1.5"
                    style={{ color: textMuted }}
                  >
                    Special Offer Text
                  </p>
                  <p
                    className="font-semibold text-sm"
                    style={{ color: textPrimary }}
                  >
                    {settings?.specialOfferText || "—"}
                  </p>
                </div>
                <div
                  className="mt-4 flex items-center justify-between p-4 rounded-xl"
                  style={{
                    background: inputBg,
                    border: `1px solid ${inputBorder}`,
                  }}
                >
                  <div>
                    <p
                      className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1"
                      style={{ color: textMuted }}
                    >
                      Landing Mode
                    </p>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: textPrimary }}
                    >
                      {settings?.landingMode
                        ? "Enabled — Full-screen hero"
                        : "Disabled — Regular layout"}
                    </p>
                  </div>
                  <Toggle
                    on={!!settings?.landingMode}
                    onToggle={toggleLandingMode}
                    label="Toggle landing mode"
                  />
                </div>
              </div>
            </section>

            {/* Payment Details */}
            <section
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: cardShadow,
              }}
            >
              <div
                className="absolute top-0 inset-x-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, #10b981, transparent)`,
                }}
              />
              <div className="p-6 md:p-7">
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      color: "#10b981",
                    }}
                  >
                    <Banknote className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h2
                    className="text-lg font-black"
                    style={{ color: textPrimary }}
                  >
                    Payment Details
                  </h2>
                </div>
                {hasPayment ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        icon: (
                          <Building
                            className="w-4 h-4 mt-0.5 shrink-0"
                            style={{ color: "#10b981" }}
                          />
                        ),
                        label: "Bank",
                        value: settings?.bankName,
                      },
                      {
                        icon: (
                          <Banknote
                            className="w-4 h-4 mt-0.5 shrink-0"
                            style={{ color: "#10b981" }}
                          />
                        ),
                        label: "Account Name",
                        value: settings?.bankAccountName,
                      },
                      {
                        icon: (
                          <Banknote
                            className="w-4 h-4 mt-0.5 shrink-0"
                            style={{ color: "#10b981" }}
                          />
                        ),
                        label: "Account Number",
                        value: settings?.bankAccountNumber,
                        mono: true,
                      },
                      {
                        icon: (
                          <MessageCircle
                            className="w-4 h-4 mt-0.5 shrink-0"
                            style={{ color: "#25D366" }}
                          />
                        ),
                        label: "WhatsApp",
                        value: settings?.whatsappNumber,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 p-4 rounded-xl"
                        style={{
                          background: inputBg,
                          border: `1px solid ${inputBorder}`,
                        }}
                      >
                        {item.icon}
                        <div>
                          <p
                            className="text-[9px] font-extrabold uppercase tracking-[0.2em] mb-1"
                            style={{ color: textMuted }}
                          >
                            {item.label}
                          </p>
                          <p
                            className={`font-semibold text-sm ${item.mono ? "font-mono tracking-widest" : ""}`}
                            style={{ color: textPrimary }}
                          >
                            {item.value || "—"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-3 p-5 rounded-xl"
                    style={{
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: textMuted,
                    }}
                  >
                    <AlertCircle
                      className="w-5 h-5 shrink-0"
                      aria-hidden="true"
                    />
                    <p className="text-sm">
                      No payment details configured yet. Click{" "}
                      <strong style={{ color: textPrimary }}>
                        Edit Settings
                      </strong>{" "}
                      to add them.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Push Notifications */}
            <section
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: cardShadow,
              }}
            >
              <div
                className="absolute top-0 inset-x-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, #8b5cf6, transparent)`,
                }}
              />
              <div className="p-6 md:p-7">
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(139,92,246,0.12)",
                      color: "#8b5cf6",
                    }}
                  >
                    <Bell className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h2
                    className="text-lg font-black"
                    style={{ color: textPrimary }}
                  >
                    Push Notifications
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="push-title"
                      className="text-[10px] font-extrabold uppercase tracking-widest block mb-2"
                      style={{ color: textMuted }}
                    >
                      Notification Title
                    </label>
                    <input
                      id="push-title"
                      type="text"
                      value={pushTitle}
                      onChange={(e) => setPushTitle(e.target.value)}
                      placeholder="New Arrival"
                      className={inputCls(false)}
                      style={inputStyle(false)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="push-body"
                      className="text-[10px] font-extrabold uppercase tracking-widest block mb-2"
                      style={{ color: textMuted }}
                    >
                      Message Body
                    </label>
                    <input
                      id="push-body"
                      type="text"
                      value={pushBody}
                      onChange={(e) => setPushBody(e.target.value)}
                      placeholder="Check out our latest products!"
                      className={inputCls(false)}
                      style={inputStyle(false)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="push-url"
                      className="text-[10px] font-extrabold uppercase tracking-widest block mb-2"
                      style={{ color: textMuted }}
                    >
                      Click URL{" "}
                      <span style={{ color: textMuted }}>(optional)</span>
                    </label>
                    <input
                      id="push-url"
                      type="text"
                      value={pushUrl}
                      onChange={(e) => setPushUrl(e.target.value)}
                      placeholder="https://Sholex.vercel.app/shop"
                      className={inputCls(false)}
                      style={inputStyle(false)}
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleSendPush}
                    disabled={
                      sendingPush || !pushTitle.trim() || !pushBody.trim()
                    }
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55"
                    style={{
                      background: "#8b5cf6",
                      boxShadow: "0 6px 18px #8b5cf644",
                    }}
                  >
                    {sendingPush ? (
                      <>
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          aria-hidden="true"
                        />{" "}
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" aria-hidden="true" />{" "}
                        Broadcast Notification
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {isEditing && (
          <div className="space-y-5" role="region" aria-label="Edit settings">
            {/* Homepage Content Form */}
            <section
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: cardShadow,
              }}
            >
              <div
                className="absolute top-0 inset-x-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                }}
              />
              <div className="p-6 md:p-7">
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${ACCENT}18`, color: ACCENT }}
                  >
                    <Home className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h2
                    className="text-lg font-black"
                    style={{ color: textPrimary }}
                  >
                    Homepage Content
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label
                      className="text-[10px] font-extrabold uppercase tracking-widest block mb-2"
                      style={{ color: textMuted }}
                    >
                      Hero Tagline
                    </label>
                    <input
                      {...register("heroTagline")}
                      placeholder="e.g. 🔥 Premium Food Store"
                      className={inputCls(false)}
                      style={inputStyle(false)}
                      id="edit-hero-tagline"
                    />
                  </div>
                  <div>
                    <label
                      className="text-[10px] font-extrabold uppercase tracking-widest block mb-2"
                      style={{ color: textMuted }}
                    >
                      Hero Title{" "}
                      <span style={{ color: textMuted }}>
                        Use " | " to split title
                      </span>
                    </label>
                    <input
                      {...register("heroTitle")}
                      placeholder="e.g. Taste the | Difference"
                      className={inputCls(false)}
                      style={inputStyle(false)}
                      id="edit-hero-title"
                    />
                  </div>
                  <div>
                    <label
                      className="text-[10px] font-extrabold uppercase tracking-widest block mb-2"
                      style={{ color: textMuted }}
                    >
                      Hero Description
                    </label>
                    <textarea
                      {...register("heroDescription")}
                      rows={3}
                      placeholder="A short description of your store…"
                      className={textareaCls(false)}
                      style={inputStyle(false)}
                      id="edit-hero-desc"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-[10px] font-extrabold uppercase tracking-widest block mb-2"
                        style={{ color: textMuted }}
                      >
                        Special Offer Title
                      </label>
                      <input
                        {...register("specialOfferTitle")}
                        placeholder="e.g. Today's Special"
                        className={inputCls(false)}
                        style={inputStyle(false)}
                        id="edit-offer-title"
                      />
                    </div>
                    <div>
                      <label
                        className="text-[10px] font-extrabold uppercase tracking-widest block mb-2"
                        style={{ color: textMuted }}
                      >
                        Special Offer Text
                      </label>
                      <input
                        {...register("specialOfferText")}
                        placeholder="e.g. Get ₦500 off orders over ₦10k"
                        className={inputCls(false)}
                        style={inputStyle(false)}
                        id="edit-offer-text"
                      />
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                    }}
                  >
                    <div>
                      <p
                        className="text-[10px] font-extrabold uppercase tracking-widest mb-1"
                        style={{ color: textMuted }}
                      >
                        Landing Mode
                      </p>
                      <p className="text-xs" style={{ color: textSecondary }}>
                        Show full-screen hero instead of regular layout
                      </p>
                    </div>
                    <Toggle
                      on={!!settings?.landingMode}
                      onToggle={toggleLandingMode}
                      label="Toggle landing mode"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Details Form */}
            <section
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: cardShadow,
              }}
            >
              <div
                className="absolute top-0 inset-x-0 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, #10b981, transparent)`,
                }}
              />
              <div className="p-6 md:p-7">
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      color: "#10b981",
                    }}
                  >
                    <Banknote className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h2
                    className="text-lg font-black"
                    style={{ color: textPrimary }}
                  >
                    Payment Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      id: "edit-bank-name",
                      name: "bankName",
                      placeholder: "e.g. GTBank",
                    },
                    {
                      id: "edit-account-name",
                      name: "bankAccountName",
                      placeholder: "e.g. Sholex Store",
                    },
                    {
                      id: "edit-account-number",
                      name: "bankAccountNumber",
                      placeholder: "0123456789",
                      mono: true,
                    },
                    {
                      id: "edit-whatsapp",
                      name: "whatsappNumber",
                      placeholder: "+2348000000000",
                    },
                  ].map((field) => (
                    <div key={field.name}>
                      <input
                        id={field.id}
                        {...register(field.name as keyof SettingsFormData)}
                        placeholder={field.placeholder}
                        className={`${inputCls(!!errors[field.name as keyof SettingsFormData])} ${field.mono ? "font-mono tracking-widest" : ""}`}
                        style={inputStyle(
                          !!errors[field.name as keyof SettingsFormData],
                        )}
                      />
                      {errors[field.name as keyof SettingsFormData] && (
                        <p
                          className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                          role="alert"
                        >
                          <AlertCircle className="w-3 h-3" aria-hidden="true" />{" "}
                          {
                            errors[field.name as keyof SettingsFormData]
                              ?.message as string
                          }
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Save / Cancel */}
            <div className="flex justify-end gap-3 pb-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-3 rounded-xl text-sm font-bold transition-colors"
                style={{
                  background: inputBg,
                  border: `1px solid ${inputBorder}`,
                  color: textMuted,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={updating}
                className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55"
                style={{
                  background: ACCENT,
                  boxShadow: `0 6px 18px ${ACCENT}44`,
                }}
              >
                {updating ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      aria-hidden="true"
                    />{" "}
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" /> Save All
                    Settings
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Log */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <button
          onClick={() => setShowAudit((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
          style={{ background: hoverBg }}
          aria-expanded={showAudit}
          aria-controls="audit-log-table"
        >
          <span
            className="flex items-center gap-2.5 text-sm font-black"
            style={{ color: textSecondary }}
          >
            <History
              className="w-4 h-4"
              style={{ color: "#8b5cf6" }}
              aria-hidden="true"
            />{" "}
            Audit Log
            <span
              className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}
            >
              {changeLogs.length}
            </span>
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showAudit ? "rotate-180" : ""}`}
            style={{ color: textMuted }}
            aria-hidden="true"
          />
        </button>
        <AnimatePresence>
          {showAudit && (
            <div
              id="audit-log-table"
              className="overflow-hidden border-t"
              style={{ borderColor: sectionBorder }}
            >
              <div
                className="overflow-x-auto max-h-64 overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: `${ACCENT}40 transparent`,
                }}
              >
                <table
                  className="w-full text-left"
                  aria-label="Settings change history"
                >
                  <caption className="sr-only">
                    History of all settings changes
                  </caption>
                  <thead style={{ background: theadBg }}>
                    <tr>
                      {["Field", "Old Value", "New Value", "Admin", "Date"].map(
                        (h) => (
                          <th
                            key={h}
                            scope="col"
                            className="px-5 py-3 text-[9px] font-extrabold uppercase tracking-widest"
                            style={{ color: textMuted }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {changeLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-8 text-center text-sm"
                          style={{ color: textMuted }}
                        >
                          No changes logged yet.
                        </td>
                      </tr>
                    ) : (
                      changeLogs.map((log: ChangeLogItem) => (
                        <tr
                          key={log._id}
                          className="border-t transition-colors"
                          style={{ borderColor: tableBorder }}
                        >
                          <td className="px-5 py-3">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: "rgba(139,92,246,0.1)",
                                color: "#a78bfa",
                              }}
                            >
                              {log.field}
                            </span>
                          </td>
                          <td
                            className="px-5 py-3 text-xs max-w-[100px] truncate"
                            style={{ color: textMuted }}
                          >
                            {log.oldValue || "—"}
                          </td>
                          <td
                            className="px-5 py-3 text-xs max-w-[100px] truncate"
                            style={{ color: textPrimary }}
                          >
                            {log.newValue || "—"}
                          </td>
                          <td
                            className="px-5 py-3 text-xs truncate max-w-[120px]"
                            style={{ color: textSecondary }}
                          >
                            {log.adminEmail}
                          </td>
                          <td
                            className="px-5 py-3 text-xs whitespace-nowrap"
                            style={{ color: textMuted }}
                          >
                            {new Date(log.changedAt).toLocaleString("en-NG", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Settings;
