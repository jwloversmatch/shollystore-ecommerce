import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterMutation } from "../features/api/apiSlice";
import {
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  Loader2,
  Store,
  CheckCircle,
  Users,
  Package,
  Star,
} from "lucide-react";
import SEO from "../components/SEO";

// ─── Brand constants ──────────────────────────────────────────────────────────
const BRAND_NAME = "ShollyStore";
const BRAND_TAGLINE = "Join Our Community";

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = "#e8622a";

// ─── Schema ───────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Input class helper ──────────────────────────────────────────────────────
const buildInputCls = (
  hasError: boolean,
  extraPl = "pl-11",
  extraPr = "pr-4",
) =>
  [
    "w-full py-3.5 rounded-xl text-sm",
    "bg-gray-100 dark:bg-[#1c1c1c]",
    "text-gray-900 dark:text-white",
    "placeholder-gray-500 dark:placeholder-gray-600",
    "outline-none transition-all duration-200",
    extraPl,
    extraPr,
    hasError
      ? "border border-red-500/50 ring-2 ring-red-500/10"
      : "border border-gray-300 dark:border-white/[0.08] focus:border-[#e8622a]/70 focus:ring-2 focus:ring-[#e8622a]/15",
  ].join(" ");

// ─── Ambient background (hidden from screen readers) ─────────────────────────
const AmbientBg = () => (
  <div aria-hidden="true">
    <motion.div
      animate={{ x: ["-12%", "12%", "-12%"], y: ["-8%", "10%", "-8%"] }}
      transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      className="absolute pointer-events-none rounded-full blur-[130px]"
      style={{
        width: 640,
        height: 640,
        top: -200,
        left: -200,
        background: ACCENT,
        opacity: 0.065,
      }}
    />
    <motion.div
      animate={{ x: ["12%", "-12%", "12%"], y: ["12%", "-10%", "12%"] }}
      transition={{ repeat: Infinity, duration: 38, ease: "linear" }}
      className="absolute pointer-events-none rounded-full blur-[130px]"
      style={{
        width: 600,
        height: 600,
        bottom: -200,
        right: -200,
        background: "#10b981",
        opacity: 0.04,
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none
        bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)]
        dark:bg-[radial-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)]
        bg-[length:28px_28px]"
    />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
const Register = () => {
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const navigate = useNavigate();

  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name || "",
        phone: data.phone || "",
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
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none"
      >
        <SEO
          title="Check Your Email"
          description={`Please verify your email to activate your ${BRAND_NAME} account.`}
        />
        <AmbientBg />

        <div className="relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10 text-center bg-[#FCFAF5] dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07] shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.65)]">
          <div
            className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
            }}
          />

          <div className="flex justify-center mb-6">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: `${ACCENT}15`,
                  boxShadow: `0 0 0 3px ${ACCENT}`,
                }}
              >
                <CheckCircle
                  className="w-9 h-9"
                  style={{ color: ACCENT }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2"
            style={{ color: ACCENT }}
          >
            Almost there
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
            Check your inbox
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-2">
            We've sent a verification link to
          </p>
          <div className="inline-block px-4 py-2 rounded-xl border mb-6 text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-[#1c1c1c] border-gray-200 dark:border-white/[0.1]">
            {sentEmail}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-8 leading-relaxed">
            Click the link in the email to activate your account. Check your
            spam folder if you don't see it within a few minutes.
          </p>

          <button
            onClick={() => navigate("/")}
            className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group"
            style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
          >
            Go to Home{" "}
            <ArrowRight
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </button>

          <p className="mt-5 text-xs text-gray-500 dark:text-gray-600">
            Wrong email?{" "}
            <button
              onClick={() => setSuccess(false)}
              className="font-bold hover:opacity-75 transition-opacity"
              style={{ color: ACCENT }}
            >
              Go back
            </button>
          </p>
        </div>
      </main>
    );
  }

  // ══════ MAIN REGISTER FORM ════════════════════════════════════════════════════
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center px-4 py-10 sm:py-14 relative overflow-hidden bg-[#FCFAF5] dark:bg-[#0A0A0B] focus:outline-none"
    >
      <SEO
        title="Create an Account"
        description={`Join ${BRAND_NAME} and start shopping from a wide range of products with fast delivery.`}
      />
      <AmbientBg />

      <div
        className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden grid md:grid-cols-[1fr_1.15fr] bg-[#FCFAF5] dark:bg-[#111111] border border-gray-200 dark:border-white/[0.07] shadow-lg dark:shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
        style={{ minHeight: 600 }}
      >
        {/* LEFT PANEL — decorative, hidden from screen readers */}
        <div
          className="hidden md:flex flex-col justify-between p-10 lg:p-12 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(148deg,#001a0a 0%,#0d1308 40%,#0A0A0B 100%)",
          }}
          aria-hidden="true"
        >
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #10b981, transparent)",
            }}
          />
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[90px] pointer-events-none"
            style={{ background: "#10b981", opacity: 0.06 }}
          />

          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${ACCENT}20` }}
              >
                <Store className="w-5 h-5" style={{ color: ACCENT }} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                {BRAND_NAME}
              </span>
            </div>
            <p className="text-gray-600 text-sm font-semibold pl-0.5">
              {BRAND_TAGLINE}
            </p>
          </div>

          <div className="flex flex-col items-center gap-7">
            <div className="relative">
              <div
                className="w-44 h-44 lg:w-48 lg:h-48 rounded-full overflow-hidden"
                style={{
                  boxShadow: `0 0 0 4px #10b981, 0 28px 64px rgba(0,0,0,0.75), 0 0 50px rgba(16,185,129,0.12)`,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-white font-black text-xl tracking-tight mb-1">
                Start Your Journey
              </div>
              <p className="text-gray-600 text-sm">
                Everything you need, delivered fast.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                icon: <Users className="w-4 h-4" />,
                label: "Members",
                val: "2K+",
              },
              {
                icon: <Package className="w-4 h-4" />,
                label: "Products",
                val: "50+",
              },
              {
                icon: <Star className="w-4 h-4" />,
                label: "Rating",
                val: "4.9 ★",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl border"
                style={{
                  background: "rgba(16,185,129,0.06)",
                  borderColor: "rgba(16,185,129,0.18)",
                  color: "#10b981",
                }}
              >
                {s.icon}
                <span className="text-white font-black text-sm">{s.val}</span>
                <span className="text-gray-600 text-[9px] font-bold uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL — form */}
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 bg-[#FCFAF5] dark:bg-[#141414]">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-7">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${ACCENT}20` }}
            >
              <Store
                className="w-4 h-4"
                style={{ color: ACCENT }}
                aria-hidden="true"
              />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              {BRAND_NAME}
            </span>
          </div>

          {/* Heading */}
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.22em] mb-2"
              style={{ color: ACCENT }}
            >
              New here?
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
              Create your
              <br className="hidden sm:block" /> account
            </h1>
            <p className="text-gray-500 dark:text-gray-600 text-sm mt-3">
              Already a member?{" "}
              <Link
                to="/login"
                className="font-bold hover:opacity-80 transition-opacity"
                style={{ color: ACCENT }}
              >
                Sign in →
              </Link>
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-7 space-y-4"
            noValidate
            aria-label="Registration form"
          >
            {/* Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="register-name"
                  className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                >
                  Full Name{" "}
                  <span className="text-gray-400 dark:text-gray-700 normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400 dark:text-gray-600"
                    aria-hidden="true"
                  />
                  <input
                    id="register-name"
                    type="text"
                    {...register("name")}
                    placeholder="John Doe"
                    className={buildInputCls(false)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="register-phone"
                  className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                >
                  Phone{" "}
                  <span className="text-gray-400 dark:text-gray-700 normal-case tracking-normal">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400 dark:text-gray-600"
                    aria-hidden="true"
                  />
                  <input
                    id="register-phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="+234 800 000 0000"
                    className={buildInputCls(false)}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: errors.email ? "#ef4444" : "#4b5563" }}
                  aria-hidden="true"
                />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={buildInputCls(!!errors.email)}
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email ? "register-email-error" : undefined
                  }
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <div
                    id="register-email-error"
                    role="alert"
                    className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                  >
                    <AlertCircle
                      className="w-3 h-3 shrink-0"
                      aria-hidden="true"
                    />{" "}
                    {errors.email.message}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: errors.password ? "#ef4444" : "#4b5563" }}
                    aria-hidden="true"
                  />
                  <input
                    id="register-password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register("password")}
                    className={buildInputCls(
                      !!errors.password,
                      "pl-11",
                      "pr-12",
                    )}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "register-password-error" : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-0.5"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <div
                      id="register-password-error"
                      role="alert"
                      className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                    >
                      <AlertCircle
                        className="w-3 h-3 shrink-0"
                        aria-hidden="true"
                      />{" "}
                      {errors.password.message}
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <CheckCircle
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{
                      color: errors.confirmPassword ? "#ef4444" : "#4b5563",
                    }}
                    aria-hidden="true"
                  />
                  <input
                    id="register-confirm-password"
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    className={buildInputCls(
                      !!errors.confirmPassword,
                      "pl-11",
                      "pr-12",
                    )}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword
                        ? "register-confirm-password-error"
                        : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-0.5"
                    aria-label={
                      showConfirmPw
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPw ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <div
                      id="register-confirm-password-error"
                      role="alert"
                      className="mt-1.5 text-xs text-red-400 flex items-center gap-1 font-semibold"
                    >
                      <AlertCircle
                        className="w-3 h-3 shrink-0"
                        aria-hidden="true"
                      />{" "}
                      {errors.confirmPassword.message}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* API error */}
            <AnimatePresence>
              {apiError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3.5 rounded-xl border text-sm"
                  style={{
                    background: "rgba(239,68,68,0.07)",
                    borderColor: "rgba(239,68,68,0.2)",
                    color: "#f87171",
                  }}
                >
                  <AlertCircle
                    className="w-4 h-4 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{apiError}</span>
                </div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-black text-white text-[15px] flex items-center justify-center gap-2.5 group transition-all disabled:opacity-55 disabled:cursor-not-allowed"
                style={{
                  background: ACCENT,
                  boxShadow: `0 8px 24px ${ACCENT}44`,
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="w-5 h-5 animate-spin"
                      aria-hidden="true"
                    />{" "}
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account{" "}
                    <ArrowRight
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Fine print */}
          <p className="mt-6 text-center text-[11px] text-gray-500 dark:text-gray-600 leading-relaxed">
            By creating an account you agree to our{" "}
            <Link
              to="/terms"
              className="underline hover:text-gray-500 transition-colors"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline hover:text-gray-500 transition-colors"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;
