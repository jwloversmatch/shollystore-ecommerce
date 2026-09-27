import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { RootState } from "../store";
import {
  useSubscribePushMutation,
  useUnsubscribePushMutation,
} from "../features/api/apiSlice";

const ACCENT = "#e8622a";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const PushNotificationManager = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const [subscribePush] = useSubscribePushMutation();
  const [unsubscribePush] = useUnsubscribePushMutation();

  const [permission, setPermission] = useState<NotificationPermission>(() =>
    "Notification" in window ? Notification.permission : "default",
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

  const checkSubscription = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      const subscription = await reg?.pushManager.getSubscription();
      setSubscribed(!!subscription);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkSubscription();
  }, [checkSubscription]);

  const handleSubscribe = async () => {
    if (!VAPID_PUBLIC_KEY) {
      console.error("VAPID public key missing");
      return;
    }

    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        console.warn("No service worker registration");
        return;
      }

            const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = subscription.toJSON();

      // PushSubscriptionJSON has optional fields; the API wants them required.
      // Guard so we never send `undefined` as `endpoint`.
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Subscription is missing required fields");
      }

      // RTK Query automatically attaches the auth header via baseQuery.
      await subscribePush({
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        },
        expirationTime: json.expirationTime ?? null,
      }).unwrap();

      setSubscribed(true);
    } catch (error) {
      console.error("Failed to subscribe:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const subscription = await reg?.pushManager.getSubscription();
      if (!subscription) return;

      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      try {
        await unsubscribePush({ endpoint }).unwrap();
      } catch {
        console.warn("Server unsubscribe failed — DB record may remain");
      }

      setSubscribed(false);
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border p-6 md:p-7 bg-white dark:bg-[#17181A] border-gray-200 dark:border-white/[0.07]"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${ACCENT}18` }}
        >
          <Bell className="w-5 h-5" style={{ color: ACCENT }} />
        </div>
        <div>
          <h3 className="text-base font-black text-gray-900 dark:text-white">
            Push Notifications
          </h3>
          <p className="text-gray-500 text-xs">
            {subscribed
              ? "You're subscribed to instant updates"
              : "Get notified about new products and offers"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              subscribed ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
            }`}
          />
          <span className="text-sm text-gray-400">
            {subscribed ? "Active" : "Inactive"}
          </span>
        </div>

        <button
          onClick={subscribed ? handleUnsubscribe : handleSubscribe}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            subscribed
              ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30"
              : "text-white"
          }`}
          style={{
            background: subscribed ? undefined : ACCENT,
            borderColor: subscribed ? undefined : ACCENT,
            boxShadow: subscribed ? "none" : `0 4px 14px ${ACCENT}44`,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : subscribed ? (
            <BellOff className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          {subscribed ? "Unsubscribe" : "Enable Notifications"}
        </button>
      </div>

      {permission === "denied" && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">
          Notifications are blocked in your browser. Enable them in your device
          settings.
        </p>
      )}
    </motion.div>
  );
};

export default PushNotificationManager;