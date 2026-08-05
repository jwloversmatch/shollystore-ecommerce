import { useState } from "react";
import { Bell, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

interface PushNotificationsProps {
  isDark: boolean;
}

const PushNotifications = ({ isDark }: PushNotificationsProps) => {
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushUrl, setPushUrl] = useState("");
  const [sendingPush, setSendingPush] = useState(false);

  const cardBg = isDark ? "#141414" : "#fff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardShadow = isDark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 4px 16px rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "#6b7280" : "#9ca3af";
  const inputBg = isDark ? "#1c1c1c" : "#f3f4f6";
  const inputBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const inputCls = "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all border focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15";

  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) { toast.error("Title and body are required"); return; }
    const token = localStorage.getItem("token");
    setSendingPush(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE}/push/send`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: pushTitle.trim(), body: pushBody.trim(), url: pushUrl.trim() || undefined }) });
      if (!res.ok) throw new Error("Failed to send");
      toast.success("Push notification sent!");
      setPushTitle(""); setPushBody(""); setPushUrl("");
    } catch { toast.error("Failed to send push notification"); }
    finally { setSendingPush(false); }
  };

  return (
    <section className="relative rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)" }} />
      <div className="p-6 md:p-7">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}><Bell className="w-4 h-4" /></div>
          <h2 className="text-lg font-black" style={{ color: textPrimary }}>Push Notifications</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label htmlFor="push-title" className="text-[10px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: textMuted }}>Notification Title</label><input id="push-title" type="text" value={pushTitle} onChange={e => setPushTitle(e.target.value)} placeholder="New Arrival" className={inputCls} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} /></div>
          <div><label htmlFor="push-body" className="text-[10px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: textMuted }}>Message Body</label><input id="push-body" type="text" value={pushBody} onChange={e => setPushBody(e.target.value)} placeholder="Check out our latest products!" className={inputCls} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} /></div>
          <div className="sm:col-span-2"><label htmlFor="push-url" className="text-[10px] font-extrabold uppercase tracking-widest block mb-2" style={{ color: textMuted }}>Click URL <span style={{ color: textMuted }}>(optional)</span></label><input id="push-url" type="text" value={pushUrl} onChange={e => setPushUrl(e.target.value)} className={inputCls} style={{ background: inputBg, borderColor: inputBorder, color: textPrimary }} /></div>
        </div>
        <div className="mt-5 flex justify-end">
          <button onClick={handleSendPush} disabled={sendingPush || !pushTitle.trim() || !pushBody.trim()} className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm transition-all disabled:opacity-55" style={{ background: "#8b5cf6", boxShadow: "0 6px 18px #8b5cf644" }}>{sendingPush ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Broadcast Notification</>}</button>
        </div>
      </div>
    </section>
  );
};

export default PushNotifications;