import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  useGetSettingsQuery, useUpdateSettingsMutation, useGetSettingsChangesQuery,
} from "../../features/api/apiSlice";
import {
  ArrowLeft, Banknote, MessageCircle, Building, Pencil, Trash2,
  Check, Home, History, Flame, AlertCircle, Loader2, ChevronDown,
  Bell, Send,
} from "lucide-react";   // added Bell and Send
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationModal from "../../components/ConfirmationModal";

// ─── Constants ─────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";

// ─── Schema ───────────────────────────────────────────────────────────────────
const settingsSchema = z.object({
  bankAccountName:   z.string().min(1, "Account name is required"),
  bankAccountNumber: z.string().min(1, "Account number is required"),
  bankName:          z.string().min(1, "Bank name is required"),
  whatsappNumber:    z.string().min(1, "WhatsApp number is required"),
  heroTagline:       z.string().optional(),
  heroTitle:         z.string().optional(),
  heroDescription:   z.string().optional(),
  specialOfferTitle: z.string().optional(),
  specialOfferText:  z.string().optional(),
  landingMode:       z.boolean().optional(),
});
type SettingsFormData = z.infer<typeof settingsSchema>;

interface ChangeLogItem {
  _id: string; field: string; oldValue: string;
  newValue: string; adminEmail: string; changedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputCls = (hasError: boolean) =>
  ["w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none transition-all duration-200",
    hasError
      ? "border border-red-500/50 ring-2 ring-red-500/10"
      : "border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
  ].join(" ");

const textareaCls = (hasError: boolean) =>
  ["w-full px-4 py-3.5 rounded-xl text-sm text-white bg-[#1c1c1c] placeholder-gray-600 outline-none resize-none transition-all duration-200",
    hasError
      ? "border border-red-500/50 ring-2 ring-red-500/10"
      : "border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
  ].join(" ");

// ─── Reusable components ──────────────────────────────────────────────────────
const DarkCard = ({ children, accentColor = ACCENT }: { children: React.ReactNode; accentColor?: string }) => (
  <div className="relative rounded-2xl overflow-hidden"
    style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 8px 32px rgba(0,0,0,0.35)" }}>
    <div className="absolute top-0 inset-x-0 h-px"
      style={{ background:`linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
    {children}
  </div>
);

const Toggle = ({ on, onToggle, disabled }: { on: boolean; onToggle: () => void; disabled?: boolean }) => (
  <button type="button" onClick={onToggle} disabled={disabled}
    className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 disabled:opacity-50"
    style={{ background: on ? ACCENT : "#2d2d2d", boxShadow: on ? `0 0 10px ${ACCENT}55` : "none" }}>
    <motion.div
      animate={{ x: on ? 20 : 2 }}
      transition={{ type:"spring", stiffness:500, damping:32 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" />
  </button>
);

const InfoRow = ({ label, value, mono }: { label: string; value?: string; mono?: boolean }) => (
  <div className="p-4 rounded-xl" style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.06)" }}>
    <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-600 mb-1.5">{label}</p>
    <p className={`text-white font-semibold text-sm ${mono ? "font-mono tracking-widest" : ""}`}>
      {value || <span className="text-gray-700">—</span>}
    </p>
  </div>
);

const SectionLabel = ({ icon, label, color = ACCENT }: { icon: React.ReactNode; label: string; color?: string }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${color}18`, color }}>
      {icon}
    </div>
    <h2 className="text-lg font-black text-white">{label}</h2>
  </div>
);

const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="flex items-baseline gap-2 mb-2">
    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500">{children}</label>
    {hint && <span className="text-gray-700 text-[10px] normal-case tracking-normal">{hint}</span>}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
const Settings = () => {
  const navigate = useNavigate();
  const [isEditing,     setIsEditing]     = useState(false);
  const [clearModal,    setClearModal]    = useState(false);
  const [showAudit,     setShowAudit]     = useState(false);

  const { data:settings, isLoading, refetch } = useGetSettingsQuery({});
  const [updateSettings, { isLoading:updating }] = useUpdateSettingsMutation();
  const { data:changeLogs = [] }               = useGetSettingsChangesQuery({});

  // ── Push notification state ──────────────────────────────────────────────
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody,  setPushBody]  = useState("");
  const [pushUrl,   setPushUrl]   = useState("");
  const [sendingPush, setSendingPush] = useState(false);

  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      toast.error("Title and body are required");
      return;
    }
    const token = localStorage.getItem("token");
    setSendingPush(true);
    try {
      const res = await fetch("/api/push/send", {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to send push notification");
    } finally {
      setSendingPush(false);
    }
  };

  const { register, handleSubmit, reset, formState:{ errors } } =
    useForm<SettingsFormData>({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (settings) {
      reset({
        bankAccountName:   settings.bankAccountName   || "",
        bankAccountNumber: settings.bankAccountNumber || "",
        bankName:          settings.bankName          || "",
        whatsappNumber:    settings.whatsappNumber    || "",
        heroTagline:       settings.heroTagline       || "",
        heroTitle:         settings.heroTitle         || "",
        heroDescription:   settings.heroDescription   || "",
        specialOfferTitle: settings.specialOfferTitle || "",
        specialOfferText:  settings.specialOfferText  || "",
        landingMode:       settings.landingMode       || false,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await updateSettings(data).unwrap();
      toast.success("Settings updated!");
      refetch(); setIsEditing(false);
    } catch { toast.error("Failed to update settings."); }
  };

  const toggleLandingMode = async () => {
    try {
      await updateSettings({ landingMode: !settings?.landingMode }).unwrap();
      toast.success(`Landing mode ${!settings?.landingMode ? "enabled" : "disabled"}`);
      refetch();
    } catch { toast.error("Failed to toggle landing mode."); }
  };

  const handleClearAll = async () => {
    try {
      await updateSettings({
        bankAccountName:"", bankAccountNumber:"", bankName:"", whatsappNumber:"",
        heroTagline:"", heroTitle:"", heroDescription:"",
        specialOfferTitle:"", specialOfferText:"", landingMode:false,
      }).unwrap();
      toast.success("Settings cleared!"); refetch(); setIsEditing(false); setClearModal(false);
    } catch { toast.error("Failed to clear settings."); }
  };

  const hasPayment = !!(settings?.bankAccountName || settings?.bankAccountNumber || settings?.bankName || settings?.whatsappNumber);

  // ══════ LOADING SKELETON ═════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div
        className="min-h-screen p-4 md:p-6 pt-16 md:pt-24 max-w-4xl mx-auto space-y-5 pb-28 md:pb-10"
        style={{ background: "#0A0A0B" }}
      >
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-20 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            <div className="h-6 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
          </div>
        </div>

        {/* Homepage Content card skeleton */}
        <div className="relative rounded-2xl overflow-hidden p-6 md:p-7 space-y-4"
          style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            <div className="h-5 w-40 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl" style={{ background: "#1c1c1c" }}>
              <div className="h-3 w-20 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-2" />
              <div className="h-5 w-3/4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            </div>
            <div className="p-4 rounded-xl" style={{ background: "#1c1c1c" }}>
              <div className="h-3 w-20 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-2" />
              <div className="h-5 w-3/4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "#1c1c1c" }}>
            <div className="h-3 w-24 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse mb-2" />
            <div className="h-5 w-full rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#1c1c1c" }}>
            <div className="space-y-1">
              <div className="h-3 w-24 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
              <div className="h-4 w-48 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            </div>
            <div className="w-11 h-6 rounded-full bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
          </div>
        </div>

        {/* Payment Details card skeleton */}
        <div className="relative rounded-2xl overflow-hidden p-6 md:p-7 space-y-4"
          style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
            <div className="h-5 w-36 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl flex items-start gap-3" style={{ background: "#1c1c1c" }}>
                <div className="w-4 h-4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-20 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                  <div className="h-5 w-3/4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit log placeholder */}
        <div className="rounded-2xl p-5 flex items-center gap-3"
          style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-4 h-4 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
          <div className="h-4 w-24 rounded bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 bg-[length:200%_100%] animate-pulse" />
        </div>
      </div>
    );
  }

  // ══════ MAIN PAGE ════════════════════════════════════════════════════════════
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
      className="min-h-screen p-4 md:p-6 pt-16 md:pt-24 max-w-4xl mx-auto space-y-5 pb-28 md:pb-10"
      style={{ background:"#0A0A0B" }}>

      <ConfirmationModal isOpen={clearModal} onClose={() => setClearModal(false)}
        onConfirm={handleClearAll} title="Clear All Settings?"
        message="This will remove all payment details and homepage content. This cannot be undone."
        confirmText="Clear All" cancelText="Cancel" type="danger" />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
            onClick={() => navigate("/admin")}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors shrink-0"
            style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.08)" }}>
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame className="w-3.5 h-3.5" style={{ color:ACCENT }} />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color:ACCENT }}>Admin</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-none">Store Settings</h1>
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-3">
            {hasPayment && (
              <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                onClick={() => setClearModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 transition-colors"
                style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
                <Trash2 className="w-4 h-4" /> Clear All
              </motion.button>
            )}
            <motion.button whileHover={{ scale:1.04, boxShadow:`0 10px 24px ${ACCENT}55` }} whileTap={{ scale:0.96 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background:ACCENT, boxShadow:`0 6px 18px ${ACCENT}44` }}>
              <Pencil className="w-4 h-4" /> Edit Settings
            </motion.button>
          </div>
        )}
      </div>

      {/* ════ VIEW MODE ══════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {!isEditing && (
          <motion.div key="view"
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
            transition={{ duration:0.3 }}
            className="space-y-5">

            {/* Homepage Content */}
            <DarkCard>
              <div className="p-6 md:p-7">
                <SectionLabel icon={<Home className="w-4 h-4" />} label="Homepage Content" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <InfoRow label="Hero Tagline"    value={settings?.heroTagline}       />
                  <InfoRow label="Hero Title"       value={settings?.heroTitle}         />
                  <InfoRow label="Special Offer Title" value={settings?.specialOfferTitle} />
                </div>
                <InfoRow label="Hero Description"  value={settings?.heroDescription}  />
                <div className="mt-3">
                  <InfoRow label="Special Offer Text" value={settings?.specialOfferText} />
                </div>

                <div className="mt-4 flex items-center justify-between p-4 rounded-xl"
                  style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-600 mb-1">Landing Mode</p>
                    <p className="text-white font-semibold text-sm">
                      {settings?.landingMode ? "Enabled — Full-screen hero" : "Disabled — Regular layout"}
                    </p>
                  </div>
                  <Toggle on={!!settings?.landingMode} onToggle={toggleLandingMode} />
                </div>
              </div>
            </DarkCard>

            {/* Payment Details */}
            <DarkCard accentColor="#10b981">
              <div className="p-6 md:p-7">
                <SectionLabel icon={<Banknote className="w-4 h-4" />} label="Payment Details" color="#10b981" />
                {hasPayment ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.06)" }}>
                      <Building className="w-4 h-4 mt-0.5 shrink-0" style={{ color:"#10b981" }} />
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-600 mb-1">Bank</p>
                        <p className="text-white font-semibold text-sm">{settings?.bankName || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.06)" }}>
                      <Banknote className="w-4 h-4 mt-0.5 shrink-0" style={{ color:"#10b981" }} />
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-600 mb-1">Account Name</p>
                        <p className="text-white font-semibold text-sm">{settings?.bankAccountName || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.06)" }}>
                      <Banknote className="w-4 h-4 mt-0.5 shrink-0" style={{ color:"#10b981" }} />
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-600 mb-1">Account Number</p>
                        <p className="text-white font-semibold text-sm font-mono tracking-widest">{settings?.bankAccountNumber || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.06)" }}>
                      <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color:"#25D366" }} />
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-600 mb-1">WhatsApp</p>
                        <p className="text-white font-semibold text-sm">{settings?.whatsappNumber || "—"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-5 rounded-xl text-gray-600"
                    style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.06)" }}>
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">No payment details configured yet. Click <strong className="text-white">Edit Settings</strong> to add them.</p>
                  </div>
                )}
              </div>
            </DarkCard>

            {/* ✨ Push Notifications Card (always visible) */}
            <DarkCard accentColor="#8b5cf6">
              <div className="p-6 md:p-7">
                <SectionLabel icon={<Bell className="w-4 h-4" />} label="Push Notifications" color="#8b5cf6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Notification Title</Label>
                    <input
                      type="text"
                      value={pushTitle}
                      onChange={(e) => setPushTitle(e.target.value)}
                      placeholder="New Arrival"
                      className={inputCls(false)}
                    />
                  </div>
                  <div>
                    <Label>Message Body</Label>
                    <input
                      type="text"
                      value={pushBody}
                      onChange={(e) => setPushBody(e.target.value)}
                      placeholder="Check out our latest products!"
                      className={inputCls(false)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label hint="optional">Click URL</Label>
                    <input
                      type="text"
                      value={pushUrl}
                      onChange={(e) => setPushUrl(e.target.value)}
                      placeholder="https://shollystore-ecommerce.vercel.app/shop"
                      className={inputCls(false)}
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: `0 12px 28px #8b5cf644` }}
                    whileTap={{ scale: 0.98 }}
                    disabled={sendingPush || !pushTitle.trim() || !pushBody.trim()}
                    onClick={handleSendPush}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55"
                    style={{ background: "#8b5cf6", boxShadow: "0 6px 18px #8b5cf644" }}
                  >
                    {sendingPush ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="w-4 h-4" /> Broadcast Notification</>
                    )}
                  </motion.button>
                </div>
              </div>
            </DarkCard>
          </motion.div>
        )}

        {/* ════ EDIT MODE ════════════════════════════════════════════════════════ */}
        {isEditing && (
          <motion.div key="edit"
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
            transition={{ duration:0.3 }}
            className="space-y-5">

            {/* Homepage Content Form */}
            <DarkCard>
              <div className="p-6 md:p-7">
                <SectionLabel icon={<Home className="w-4 h-4" />} label="Homepage Content" />
                <div className="space-y-4">
                  <div>
                    <Label>Hero Tagline</Label>
                    <input {...register("heroTagline")} placeholder="e.g. 🔥 Premium Food Store" className={inputCls(false)} />
                  </div>
                  <div>
                    <Label hint='Use " | " to split title into two colours'>Hero Title</Label>
                    <input {...register("heroTitle")} placeholder='e.g. Taste the | Difference' className={inputCls(false)} />
                  </div>
                  <div>
                    <Label>Hero Description</Label>
                    <textarea {...register("heroDescription")} rows={3} placeholder="A short description of your store…" className={textareaCls(false)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Special Offer Title</Label>
                      <input {...register("specialOfferTitle")} placeholder="e.g. Today's Special" className={inputCls(false)} />
                    </div>
                    <div>
                      <Label>Special Offer Text</Label>
                      <input {...register("specialOfferText")} placeholder="e.g. Get ₦500 off orders over ₦10k" className={inputCls(false)} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-1">Landing Mode</p>
                      <p className="text-gray-400 text-xs">Show full-screen hero instead of the regular layout</p>
                    </div>
                    <Toggle on={!!settings?.landingMode} onToggle={toggleLandingMode} />
                  </div>
                </div>
              </div>
            </DarkCard>

            {/* Payment Details Form */}
            <DarkCard accentColor="#10b981">
              <div className="p-6 md:p-7">
                <SectionLabel icon={<Banknote className="w-4 h-4" />} label="Payment Details" color="#10b981" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Bank Name</Label>
                    <input {...register("bankName")} placeholder="e.g. GTBank" className={inputCls(!!errors.bankName)} />
                    {errors.bankName && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.bankName.message}</p>}
                  </div>
                  <div>
                    <Label>Account Name</Label>
                    <input {...register("bankAccountName")} placeholder="e.g. LotceWieth Store" className={inputCls(!!errors.bankAccountName)} />
                    {errors.bankAccountName && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.bankAccountName.message}</p>}
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <input {...register("bankAccountNumber")} placeholder="0123456789" className={inputCls(!!errors.bankAccountNumber) + " font-mono tracking-widest"} />
                    {errors.bankAccountNumber && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.bankAccountNumber.message}</p>}
                  </div>
                  <div>
                    <Label>WhatsApp Number</Label>
                    <input {...register("whatsappNumber")} placeholder="+2348000000000" className={inputCls(!!errors.whatsappNumber)} />
                    {errors.whatsappNumber && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" /> {errors.whatsappNumber.message}</p>}
                  </div>
                </div>
              </div>
            </DarkCard>

            {/* Save / Cancel */}
            <div className="flex justify-end gap-3 pb-2">
              <motion.button type="button" whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                onClick={() => setIsEditing(false)}
                className="px-5 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-white transition-colors"
                style={{ background:"#1c1c1c", border:"1px solid rgba(255,255,255,0.08)" }}>
                Cancel
              </motion.button>
              <motion.button type="button" onClick={handleSubmit(onSubmit)} disabled={updating}
                whileHover={!updating ? { scale:1.03, boxShadow:`0 14px 36px ${ACCENT}55` } : {}}
                whileTap={!updating ? { scale:0.97 } : {}}
                className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55"
                style={{ background:ACCENT, boxShadow:`0 6px 18px ${ACCENT}44` }}>
                {updating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  <><Check className="w-4 h-4" /> Save All Settings</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Audit Log ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={() => setShowAudit(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors">
          <span className="flex items-center gap-2.5 text-sm font-black text-gray-400">
            <History className="w-4 h-4" style={{ color:"#8b5cf6" }} /> Audit Log
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
              style={{ background:"rgba(139,92,246,0.12)", color:"#8b5cf6" }}>
              {changeLogs.length}
            </span>
          </span>
          <motion.div animate={{ rotate: showAudit ? 180 : 0 }} transition={{ duration:0.25 }}>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showAudit && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
              transition={{ duration:0.3 }}
              className="overflow-hidden border-t" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
              <div className="overflow-x-auto max-h-64 overflow-y-auto"
                style={{ scrollbarWidth:"thin", scrollbarColor:`${ACCENT}40 transparent` }}>
                <table className="w-full text-left">
                  <thead style={{ background:"rgba(255,255,255,0.03)" }}>
                    <tr>
                      {["Field","Old Value","New Value","Admin","Date"].map(h => (
                        <th key={h} className="px-5 py-3 text-[9px] font-extrabold uppercase tracking-widest text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {changeLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-gray-700 text-sm">No changes logged yet.</td>
                      </tr>
                    ) : changeLogs.map((log: ChangeLogItem) => (
                      <tr key={log._id} className="border-t transition-colors hover:bg-white/[0.015]"
                        style={{ borderColor:"rgba(255,255,255,0.05)" }}>
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background:"rgba(139,92,246,0.1)", color:"#a78bfa" }}>{log.field}</span>
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs max-w-[100px] truncate">{log.oldValue || "—"}</td>
                        <td className="px-5 py-3 text-white text-xs max-w-[100px] truncate">{log.newValue || "—"}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs truncate max-w-[120px]">{log.adminEmail}</td>
                        <td className="px-5 py-3 text-gray-700 text-xs whitespace-nowrap">
                          {new Date(log.changedAt).toLocaleString("en-NG", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
};

export default Settings;