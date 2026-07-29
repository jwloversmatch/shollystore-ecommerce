import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

// ─── Shared input class builder ──────────────────────────────────────────────
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

      // ✅ Admin always goes to /admin, ignoring the 'from' parameter
      const destination = res.user.role === "admin"
        ? "/admin"
        : from || "/shop";

      window.location.replace(destination);
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const apiError = (error as { data?: { message: string } })?.data?.message;

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-16 relative overflow-hidden bg-[#FCFAF5] dark:bg-[#0A0A0B]">
      <SEO
        title="Sign In"
        description={`Log in to your ${BRAND_NAME} account to manage orders, track deliveries, and enjoy exclusive deals.`}
      />

      {/* Ambient orbs – hidden from screen readers */}
      <div aria-hidden="true">
        <motion.div animate={{ x: ["-12%", "12%", "-12%"], y: ["-8%", "10%", "-8%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute pointer-events-none rounded-full blur-[130px]"
          style={{ width: 640, height: 640, top: -200, left: -200, background: ACCENT, opacity: 0.07 }} />
        <motion.div animate={{ x: ["12%", "-12%", "12%"], y: ["12%", "-10%", "12%"] }}
          transition={{ repeat: Infinity, duration: 38, ease: "linear" }}
          className="absolute pointer-events-none rounded-full blur-[130px]"
          style={{ width: 600, height: 600, bottom: -200, right: -200, background: "#10b981", opacity: 0.045 }} />
      </div>

      {/* Dot-grid texture – hidden from screen readers */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:28px_28px]" aria-hidden="true" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden grid md:grid-cols-[1fr_1.1fr] bg-[#FCFAF5] dark:bg-[#111111] border border-gray-200 dark:border-white/[0.07] shadow-lg dark:shadow-[0_40px_100px_rgba(0,0,0,0.7)]" style={{ minHeight: 620 }}>

        {/* Left panel – decorative, hidden from screen readers */}
        <div className="hidden md:flex flex-col justify-between p-10 lg:p-12 relative overflow-hidden" style={{ background: "linear-gradient(148deg,#1c0a00 0%,#130800 40%,#0A0A0B 100%)" }} aria-hidden="true">
          <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />
          <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-[80px] pointer-events-none" style={{ background: ACCENT, opacity: 0.07 }} />

          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                <Store className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">{BRAND_NAME}</span>
            </div>
            <p className="text-gray-600 text-sm font-semibold pl-0.5">{BRAND_TAGLINE}</p>
          </div>

          <div className="flex flex-col items-center gap-7">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-5 rounded-full border-2 border-dashed pointer-events-none" style={{ borderColor: `${ACCENT}28` }} />
              <div className="absolute -inset-2 rounded-full pointer-events-none" style={{ boxShadow: `0 0 0 1px ${ACCENT}22` }} />
              <div className="w-44 h-44 lg:w-48 lg:h-48 rounded-full overflow-hidden" style={{ boxShadow: `0 0 0 4px ${ACCENT}, 0 28px 64px rgba(0,0,0,0.75), 0 0 50px ${ACCENT}14` }}>
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80" alt="" className="w-full h-full object-cover" />
              </div>
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}
                className="absolute -right-10 top-3 rounded-2xl px-3.5 py-2.5 border text-left bg-[#1c1c1c] border-white/[0.08]">
                <div className="text-[9px] text-gray-600 font-extrabold uppercase tracking-wider">Rating</div>
                <div className="text-sm font-black" style={{ color: "#F59E0B" }}>4.9 ★</div>
              </motion.div>
              <motion.div animate={{ y: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 4.3, ease: "easeInOut" }}
                className="absolute -left-12 bottom-4 rounded-2xl px-3.5 py-2.5 border text-left bg-[#1c1c1c] border-white/[0.08]">
                <div className="text-[9px] text-gray-600 font-extrabold uppercase tracking-wider">Members</div>
                <div className="text-sm font-black text-white">2K+</div>
              </motion.div>
            </div>
            <div className="text-center">
              <div className="text-white font-black text-xl tracking-tight mb-1">Shop the Best</div>
              <p className="text-gray-600 text-sm">Quality products at unbeatable prices.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              { icon: <Shield className="w-3.5 h-3.5" />, label: "Secure & encrypted login" },
              { icon: <Zap className="w-3.5 h-3.5" />, label: "Instant order tracking" },
              { icon: <Star className="w-3.5 h-3.5" />, label: "Exclusive member deals" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: `${ACCENT}08`, borderColor: `${ACCENT}1a`, color: ACCENT }}>
                {f.icon}
                <span className="text-xs font-semibold text-gray-400">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel – form */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 bg-[#FCFAF5] dark:bg-[#141414]">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <Store className="w-4 h-4" style={{ color: ACCENT }} aria-hidden="true" />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{BRAND_NAME}</span>
          </div>

          {/* Heading */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2" style={{ color: ACCENT }}>Welcome back</p>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">Sign in to<br className="hidden sm:block" /> your account</h1>
            <p className="text-gray-500 dark:text-gray-600 text-sm mt-3">
              No account yet?{" "}
              <Link to="/register" className="font-bold transition-opacity hover:opacity-80" style={{ color: ACCENT }}>Get started →</Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate aria-label="Sign in form">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: errors.email ? "#ef4444" : "#4b5563" }} aria-hidden="true" />
                <input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} className={buildInputCls(!!errors.email)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "login-email-error" : undefined} />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <div id="login-email-error" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" /> {errors.email.message}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="login-password" className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-bold transition-opacity hover:opacity-75" style={{ color: ACCENT }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: errors.password ? "#ef4444" : "#4b5563" }} aria-hidden="true" />
                <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" {...register("password")} className={buildInputCls(!!errors.password, "pr-12")} aria-invalid={!!errors.password} aria-describedby={errors.password ? "login-password-error" : undefined} />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-0.5" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <div id="login-password-error" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" /> {errors.password.message}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* API error banner */}
            <AnimatePresence>
              {apiError && (
                <div role="alert" className="flex items-start gap-2.5 p-3.5 rounded-xl border text-sm" style={{ background: "rgba(239,68,68,0.07)", borderColor: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{apiError}</span>
                </div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div>
              <button type="submit" disabled={isLoading}
                className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group transition-all disabled:opacity-55 disabled:cursor-not-allowed"
                style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}>
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Signing in…</>
                ) : (
                  <>Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" /></>
                )}
              </button>
            </div>
          </form>

          {/* Divider + guest/register buttons */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]" />
            <span className="text-[11px] text-gray-500 dark:text-gray-600 font-semibold shrink-0">or continue as</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.06]" />
          </div>

          <div className="mt-4 flex gap-3">
            <Link to="/" className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.12] hover:text-gray-900 dark:hover:text-white transition-all text-center">Guest Browsing</Link>
            <Link to="/register" className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all text-center" style={{ background: `${ACCENT}12`, borderColor: `${ACCENT}30`, color: ACCENT }}>New Account</Link>
          </div>

          {/* Fine print */}
          <p className="mt-7 text-center text-[11px] text-gray-500 dark:text-gray-600 leading-relaxed">
            By signing in you agree to our{" "}
            <Link to="/terms" className="underline hover:text-gray-500 transition-colors">Terms</Link>{" "}and{" "}
            <Link to="/privacy" className="underline hover:text-gray-500 transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;