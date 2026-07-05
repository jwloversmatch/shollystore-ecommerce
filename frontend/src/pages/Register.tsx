import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterMutation } from "../features/api/apiSlice";
import {
  Mail, Lock, AlertCircle, Eye, EyeOff, User, Phone,
  ArrowRight, Loader2, ChefHat, CheckCircle, Users, Package, Star,
} from "lucide-react";
import SEO from "../components/SEO";

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";

// ─── Schema ───────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    name:            z.string().optional(),
    phone:           z.string().optional(),
    email:           z.string().email("Please enter a valid email address"),
    password:        z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path:    ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Input class helper ───────────────────────────────────────────────────────
const buildInputCls = (hasError: boolean, extraPl = "pl-11", extraPr = "pr-4") =>
  [
    "w-full py-3.5 rounded-xl text-sm text-white",
    "bg-[#1c1c1c] placeholder-gray-600 outline-none transition-all duration-200",
    extraPl, extraPr,
    hasError
      ? "border border-red-500/50 ring-2 ring-red-500/10"
      : "border border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
  ].join(" ");

// ── Dark background with orbs (moved outside to avoid re-creation) ───────────
const DarkBg = () => (
  <>
    <motion.div
      animate={{ x: ["-12%", "12%", "-12%"], y: ["-8%", "10%", "-8%"] }}
      transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      className="absolute pointer-events-none rounded-full blur-[130px]"
      style={{ width: 640, height: 640, top: -200, left: -200, background: ACCENT, opacity: 0.065 }}
    />
    <motion.div
      animate={{ x: ["12%", "-12%", "12%"], y: ["12%", "-10%", "12%"] }}
      transition={{ repeat: Infinity, duration: 38, ease: "linear" }}
      className="absolute pointer-events-none rounded-full blur-[130px]"
      style={{ width: 600, height: 600, bottom: -200, right: -200, background: "#10b981", opacity: 0.04 }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize:  "28px 28px",
      }}
    />
  </>
);

// ═══════════════════════════════════════════════════════════════════════════════
const Register = () => {
  const [showPw,        setShowPw]        = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [sentEmail,     setSentEmail]     = useState("");
  const navigate = useNavigate();

  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const { register, handleSubmit, formState: { errors }, reset } =
    useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email:    data.email,
        password: data.password,
        name:     data.name  || "",
        phone:    data.phone || "",
      }).unwrap();
      reset();
      setSentEmail(data.email);
      setSuccess(true);
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  const apiError = (error as { data?: { message: string } })?.data?.message;

  // ══════ SUCCESS SCREEN ════════════════════════════════════════════════════════
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: "#0A0A0B" }}>
        <SEO title="Check Your Email" description="Please verify your email to activate your Ires Kitchen account." />
        <DarkBg />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10 text-center"
          style={{
            background: "#141414",
            border:     "1px solid rgba(255,255,255,0.07)",
            boxShadow:  "0 40px 90px rgba(0,0,0,0.65)",
          }}
        >
          {/* Accent top line */}
          <div className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
            style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

          {/* Animated check circle */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-full border-2 border-dashed pointer-events-none"
                style={{ borderColor: `${ACCENT}35` }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: `${ACCENT}15`, boxShadow: `0 0 0 3px ${ACCENT}` }}
              >
                <CheckCircle className="w-9 h-9" style={{ color: ACCENT }} />
              </motion.div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2"
            style={{ color: ACCENT }}
          >
            Almost there
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="text-3xl font-black text-white mb-3 leading-tight"
          >
            Check your inbox
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-gray-500 text-sm leading-relaxed mb-2"
          >
            We've sent a verification link to
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
            className="inline-block px-4 py-2 rounded-xl border mb-6 text-sm font-bold text-white"
            style={{ background: "#1c1c1c", borderColor: "rgba(255,255,255,0.1)" }}
          >
            {sentEmail}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-gray-600 text-xs mb-8 leading-relaxed"
          >
            Click the link in the email to activate your account.
            Check your spam folder if you don't see it within a few minutes.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.03, boxShadow: `0 16px 40px ${ACCENT}55` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group"
            style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
          >
            Go to Home
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-5 text-xs text-gray-700"
          >
            Wrong email?{" "}
            <button onClick={() => setSuccess(false)} className="font-bold hover:opacity-75 transition-opacity" style={{ color: ACCENT }}>
              Go back
            </button>
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // ══════ MAIN REGISTER FORM ════════════════════════════════════════════════════
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-14 relative overflow-hidden"
      style={{ background: "#0A0A0B" }}
    >
      <SEO
        title="Create an Account"
        description="Join Ires Kitchen and start ordering delicious meals with fast delivery across Nigeria."
      />
      <DarkBg />

      {/* ════════ MAIN CARD ════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden grid md:grid-cols-[1fr_1.15fr]"
        style={{
          background:  "#111111",
          border:      "1px solid rgba(255,255,255,0.07)",
          boxShadow:   "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)",
          minHeight:   600,
        }}
      >

        {/* ══ LEFT PANEL (desktop only) ══════════════════════════════════════ */}
        <div
          className="hidden md:flex flex-col justify-between p-10 lg:p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(148deg,#001a0a 0%,#0d1308 40%,#0A0A0B 100%)" }}
        >
          {/* Top green hairline */}
          <div className="absolute top-0 inset-x-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #10b981, transparent)" }} />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[90px] pointer-events-none"
            style={{ background: "#10b981", opacity: 0.06 }} />

          {/* Logo */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                <ChefHat className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Ires<span style={{ color: ACCENT }}>Kitchen</span>
              </span>
            </div>
            <p className="text-gray-600 text-sm font-semibold pl-0.5">Join the community</p>
          </div>

          {/* Hero plate */}
          <div className="flex flex-col items-center gap-7">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-5 rounded-full border-2 border-dashed pointer-events-none"
                style={{ borderColor: "rgba(16,185,129,0.22)" }}
              />
              <div className="absolute -inset-2 rounded-full pointer-events-none"
                style={{ boxShadow: "0 0 0 1px rgba(16,185,129,0.18)" }} />
              <div
                className="w-44 h-44 lg:w-48 lg:h-48 rounded-full overflow-hidden"
                style={{ boxShadow: `0 0 0 4px #10b981, 0 28px 64px rgba(0,0,0,0.75), 0 0 50px rgba(16,185,129,0.12)` }}
              >
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
                  alt="Premium food spread"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating chips */}
              <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                className="absolute -right-12 top-2 rounded-2xl px-3.5 py-2.5 border text-left"
                style={{ background: "#1c1c1c", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="text-[9px] text-gray-600 font-extrabold uppercase tracking-wider">Members</div>
                <div className="text-sm font-black text-white">2K+</div>
              </motion.div>
              <motion.div animate={{ y: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="absolute -left-12 bottom-3 rounded-2xl px-3.5 py-2.5 border text-left"
                style={{ background: "#1c1c1c", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="text-[9px] text-gray-600 font-extrabold uppercase tracking-wider">Products</div>
                <div className="text-sm font-black" style={{ color: "#10b981" }}>50+</div>
              </motion.div>
            </div>

            <div className="text-center">
              <h3 className="text-white font-black text-xl tracking-tight mb-1">Start Your Journey</h3>
              <p className="text-gray-600 text-sm">Fresh food at your fingertips.</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <Users  className="w-4 h-4" />, label: "Members",  val: "2K+"    },
              { icon: <Package className="w-4 h-4" />, label: "Products", val: "50+"    },
              { icon: <Star    className="w-4 h-4" />, label: "Rating",   val: "4.9 ★" },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl border"
                style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.18)", color: "#10b981" }}>
                {s.icon}
                <span className="text-white font-black text-sm">{s.val}</span>
                <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT PANEL — form ════════════════════════════════════════════════ */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12" style={{ background: "#141414" }}>

          {/* Mobile logo */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="md:hidden flex items-center gap-2 mb-7">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
              <ChefHat className="w-4 h-4" style={{ color: ACCENT }} />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Ires<span style={{ color: ACCENT }}>Kitchen</span>
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2" style={{ color: ACCENT }}>
              New here?
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Create your<br className="hidden sm:block" /> account
            </h2>
            <p className="text-gray-600 text-sm mt-3">
              Already a member?{" "}
              <Link to="/login" className="font-bold hover:opacity-80 transition-opacity" style={{ color: ACCENT }}>
                Sign in →
              </Link>
            </p>
          </motion.div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>

            {/* Name + Phone — side by side on sm+ */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
                  Full Name <span className="text-gray-700 normal-case tracking-normal">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-600" />
                  <input type="text" {...register("name")} placeholder="John Doe"
                    className={buildInputCls(false)} />
                </div>
              </div>
              {/* Phone */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
                  Phone <span className="text-gray-700 normal-case tracking-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-600" />
                  <input type="tel" {...register("phone")} placeholder="+234 800 000 0000"
                    className={buildInputCls(false)} />
                </div>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.19 }}>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
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
                  <motion.p key="em-err"
                    initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password + Confirm — side by side on sm+ */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Password */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: errors.password ? "#ef4444" : "#4b5563" }} />
                  <input type={showPw ? "text" : "password"} placeholder="••••••••"
                    autoComplete="new-password" {...register("password")}
                    className={buildInputCls(!!errors.password, "pl-11", "pr-12")} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-0.5">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p key="pw-err"
                      initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: errors.confirmPassword ? "#ef4444" : "#4b5563" }} />
                  <input type={showConfirmPw ? "text" : "password"} placeholder="••••••••"
                    autoComplete="new-password" {...register("confirmPassword")}
                    className={buildInputCls(!!errors.confirmPassword, "pl-11", "pr-12")} />
                  <button type="button" onClick={() => setShowConfirmPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-0.5">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p key="cpw-err"
                      initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* API error */}
            <AnimatePresence>
              {apiError && (
                <motion.div key="api-err"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl border text-sm"
                  style={{ background: "rgba(239,68,68,0.07)", borderColor: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <motion.button
                type="submit" disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02, boxShadow: `0 18px 44px ${ACCENT}55` } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group transition-all disabled:opacity-55 disabled:cursor-not-allowed"
                style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}>
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Creating account…</>
                ) : (
                  <>Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Fine print */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
            className="mt-6 text-center text-[11px] text-gray-700 leading-relaxed">
            By creating an account you agree to our{" "}
            <Link to="/terms"   className="underline hover:text-gray-500 transition-colors">Terms</Link>
            {" "}and{" "}
            <Link to="/privacy" className="underline hover:text-gray-500 transition-colors">Privacy Policy</Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;