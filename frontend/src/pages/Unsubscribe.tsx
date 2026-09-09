import { useState } from "react";
import { motion } from "framer-motion";
import { useUnsubscribeFromNewsletterMutation } from "../features/api/apiSlice";
import { Mail, Loader2, CheckCircle2, XCircle } from "lucide-react";
import SEO from "../components/SEO";

type UnsubStatus = "idle" | "loading" | "success" | "error";

const Unsubscribe = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<UnsubStatus>("idle");
  const [message, setMessage] = useState("");
  const [unsubscribe] = useUnsubscribeFromNewsletterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await unsubscribe(email.trim()).unwrap();
      setStatus("success");
      setMessage(res.message || "You have been unsubscribed successfully.");
      setEmail("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setStatus("error");
      setMessage("Failed to unsubscribe. Please check the email and try again.");
    }
  };

  return (
    <>
      <SEO
        title="Unsubscribe"
        description="Unsubscribe from Sholex newsletter."
      />
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] dark:bg-[#0A0A0B] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 p-6 shadow-lg"
        >
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
            Unsubscribe
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Enter the email address you used to subscribe and we'll remove you from our newsletter.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={status === "loading"}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-[#e8622a]/60"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3 rounded-xl text-white font-bold bg-[#e8622a] hover:bg-[#c9511f] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              Unsubscribe
            </button>
          </form>
          {status === "success" && (
            <p className="mt-4 text-sm text-green-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {message}
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-sm text-red-500 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {message}
            </p>
          )}
        </motion.div>
      </main>
    </>
  );
};

export default Unsubscribe;