import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

const inputCls =
  "w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all border bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-900 dark:text-[#E7E9EA] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15";
const labelCls =
  "text-[10px] font-extrabold uppercase tracking-widest block mb-2 text-gray-400 dark:text-gray-500";

const PushNotifications = () => {
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushUrl, setPushUrl] = useState("");
  const [sendingPush, setSendingPush] = useState(false);

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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="push-title" className={labelCls}>
            Notification Title
          </label>
          <input
            id="push-title"
            type="text"
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            placeholder="New Arrival"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="push-body" className={labelCls}>
            Message Body
          </label>
          <input
            id="push-body"
            type="text"
            value={pushBody}
            onChange={(e) => setPushBody(e.target.value)}
            placeholder="Check out our latest products!"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="push-url" className={labelCls}>
            Click URL{" "}
            <span className="normal-case tracking-normal font-medium">
              (optional)
            </span>
          </label>
          <input
            id="push-url"
            type="text"
            value={pushUrl}
            onChange={(e) => setPushUrl(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSendPush}
          disabled={sendingPush || !pushTitle.trim() || !pushBody.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-white text-sm
            bg-violet-500 hover:bg-violet-600 shadow-[0_6px_18px_rgba(139,92,246,0.27)]
            disabled:opacity-55 transition-colors"
        >
          {sendingPush ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />{" "}
              Sending…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" aria-hidden="true" /> Broadcast
              Notification
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PushNotifications;