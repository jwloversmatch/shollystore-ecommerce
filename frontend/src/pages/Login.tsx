import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoginMutation } from "../features/api/apiSlice";
import { setCredentials } from "../features/auth/authSlice";
import {
  Mail, Lock, AlertCircle, Eye, EyeOff,
  ArrowRight, Loader2, Store, Shield, Zap, Star,
} from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

// ─── Brand constants ──────────────────────────────────────────────────────────
const BRAND_NAME = "ShollyStore";
const BRAND_TAGLINE = "Your One‑Stop Shop";

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";

// ─── Schema ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormData = z.infer<typeof loginSchema>;

// ─── Shared input class builder (now supports light/dark) ─────────────────────
const buildInputCls = (hasError: boolean, extraPr = "pr-4") =>
  [
    "w-full pl-11 py-3.5 rounded-xl text-sm",
    "bg-gray-100 dark:bg-[#1c1c1c]",
    "text-gray-900 dark:text-white",
    "placeholder-gray-500 dark:placeholder-gray-600",
    "outline-none transition-all duration-200",
    extraPr,
    hasError
      ? "border border-red-500/50 ring-2 ring-red-500/10"
      : "border border-gray-300 dark:border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
  ].join(" ");

// ═══════════════════════════════════════════════════════════════════════════════
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const from = (location.state as { from?: string })?.from;

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login({ email: data.email, password: data.password }).unwrap();
      dispatch(setCredentials({ user: res.user, token: res.token }));
      toast.success("Welcome back! 🎉");

      const destination = from
        ? from
        : res.user.role === "admin"
        ? "/admin"
        : "/shop";

      navigate(destination, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const apiError = (error as { data?: { message: string } })?.data?.message;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-16 relative overflow-hidden
        bg-[#FCFAF5] dark:bg-[#0A0A0B]"
    >
      <SEO
        title="Sign In"
        description={`Log in to your ${BRAND_NAME} account to manage orders, track deliveries, and enjoy exclusive deals.`}
      />

      {/* Ambient orbs */}
      <motion.div
        animate={{ x: ["-12%", "12%", "-12%"], y: ["-8%", "10%", "-8%"] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="absolute pointer-events-none rounded-full blur-[130px]"
        style={{
          width: 640, height: 640, top: -200, left: -200,
          background: ACCENT, opacity: 0.07,
        }}
      />
      <motion.div
        animate={{ x: ["12%", "-12%", "12%"], y: ["12%", "-10%", "12%"] }}
        transition={{ repeat: Infinity, duration: 38, ease: "linear" }}
        className="absolute pointer-events-none rounded-full blur-[130px]"
        style={{
          width: 600, height: 600, bottom: -200, right: -200,
          background: "#10b981", opacity: 0.045,
        }}
      />

      {/* Dot-grid texture – now light/dark */}
      <div
        className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)]
          dark:bg-[radial-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)]
          bg-[length:28px_28px]"
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden grid md:grid-cols-[1fr_1.1fr]
          bg-[#FCFAF5] dark:bg-[#111111]
          border border-gray-200 dark:border-white/[0.07]
          shadow-lg dark:shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
        style={{ minHeight: 620 }}
      >

        {/* Left panel – keeps dark brand aesthetic */}
        <div
          className="hidden md:flex flex-col justify-between p-10 lg:p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(148deg,#1c0a00 0%,#130800 40%,#0A0A0B 100%)" }}
        >
          <div className="absolute top-0 inset-x-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
          <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-[80px] pointer-events-none"
            style={{ background: ACCENT, opacity: 0.07 }} />

          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${ACCENT}20` }}>
                <Store className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">{BRAND_NAME}</span>
            </div>
            <p className="text-gray-600 text-sm font-semibold pl-0.5">{BRAND_TAGLINE}</p>
          </div>

          {/* Hero plate circle */}
          <div className="flex flex-col items-center gap-7">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-5 rounded-full border-2 border-dashed pointer-events-none"
                style={{ borderColor: `${ACCENT}28` }} />
              <div className="absolute -inset-2 rounded-full pointer-events-none"
                style={{ boxShadow: `0 0 0 1px ${ACCENT}22` }} />
              <div className="w-44 h-44 lg:w-48 lg:h-48 rounded-full overflow-hidden"
                style={{ boxShadow: `0 0 0 4px ${ACCENT}, 0 28px 64px rgba(0,0,0,0.75), 0 0 50px ${ACCENT}14` }}>
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80"
                  alt="Online shopping" className="w-full h-full object-cover" />
              </div>
              {/* Floating chips */}
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}
                className="absolute -right-10 top-3 rounded-2xl px-3.5 py-2.5 border text-left
                  bg-[#1c1c1c] border-white/[0.08]">
                <div className="text-[9px] text-gray-600 font-extrabold uppercase tracking-wider">Rating</div>
                <div className="text-sm font-black" style={{ color: "#F59E0B" }}>4.9 ★</div>
              </motion.div>
              <motion.div animate={{ y: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 4.3, ease: "easeInOut" }}
                className="absolute -left-12 bottom-4 rounded-2xl px-3.5 py-2.5 border text-left
                  bg-[#1c1c1c] border-white/[0.08]">
                <div className="text-[9px] text-gray-600 font-extrabold uppercase tracking-wider">Members</div>
                <div className="text-sm font-black text-white">2K+</div>
              </motion.div>
            </div>
            <div className="text-center">
              <h3 className="text-white font-black text-xl tracking-tight mb-1">Shop the Best</h3>
              <p className="text-gray-600 text-sm">Quality products at unbeatable prices.</p>
            </div>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-2.5">
            {[
              { icon: <Shield  className="w-3.5 h-3.5" />, label: "Secure & encrypted login"  },
              { icon: <Zap     className="w-3.5 h-3.5" />, label: "Instant order tracking"    },
              { icon: <Star    className="w-3.5 h-3.5" />, label: "Exclusive member deals"    },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ background: `${ACCENT}08`, borderColor: `${ACCENT}1a`, color: ACCENT }}>
                {f.icon}
                <span className="text-xs font-semibold text-gray-400">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right panel – form (now adapts to light/dark) */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12
          bg-[#FCFAF5] dark:bg-[#141414]">

          {/* Mobile logo */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${ACCENT}20` }}>
              <Store className="w-4 h-4" style={{ color: ACCENT }} />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              {BRAND_NAME}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2" style={{ color: ACCENT }}>
              Welcome back
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
              Sign in to<br className="hidden sm:block" /> your account
            </h2>
            <p className="text-gray-500 dark:text-gray-600 text-sm mt-3">
              No account yet?{" "}
              <Link to="/register" className="font-bold transition-opacity hover:opacity-80" style={{ color: ACCENT }}>
                Get started →
              </Link>
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>

            {/* Email */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: errors.email ? "#ef4444" : "#4b5563" }} />
                <input type="email" autoComplete="email" placeholder="you@example.com"
                  {...register("email")} className={buildInputCls(!!errors.email)} />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p key="email-err" initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] font-bold transition-opacity hover:opacity-75" style={{ color: ACCENT }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: errors.password ? "#ef4444" : "#4b5563" }} />
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••"
                  {...register("password")} className={buildInputCls(!!errors.password, "pr-12")} />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-0.5">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p key="pw-err" initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* API error banner */}
            <AnimatePresence>
              {apiError && (
                <motion.div key="api-err" initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl border text-sm"
                  style={{ background: "rgba(239,68,68,0.07)", borderColor: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
              <motion.button type="submit" disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02, boxShadow: `0 18px 44px ${ACCENT}55` } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group transition-all disabled:opacity-55 disabled:cursor-not-allowed"
                style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}>
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Signing in…</>
                ) : (
                  <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Divider + guest/register buttons */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}
            className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]" />
            <span className="text-[11px] text-gray-500 dark:text-gray-600 font-semibold shrink-0">or continue as</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
            className="mt-4 flex gap-3">
            <Link to="/"
              className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400
                bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.08]
                hover:border-gray-300 dark:hover:border-white/[0.12] hover:text-gray-900 dark:hover:text-white
                transition-all text-center">
              Guest Browsing
            </Link>
            <Link to="/register"
              className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all text-center"
              style={{ background: `${ACCENT}12`, borderColor: `${ACCENT}30`, color: ACCENT }}>
              New Account
            </Link>
          </motion.div>

          {/* Fine print */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-7 text-center text-[11px] text-gray-500 dark:text-gray-600 leading-relaxed">
            By signing in you agree to our{" "}
            <Link to="/terms" className="underline hover:text-gray-500 transition-colors">Terms</Link>
            {" "}and{" "}
            <Link to="/privacy" className="underline hover:text-gray-500 transition-colors">Privacy Policy</Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;