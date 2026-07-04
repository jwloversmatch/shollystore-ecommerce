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
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Coffee,
  GlassWater,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";

// ---------- Zod Schema ----------
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ---------- Animation variants ----------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const floatingIconAnimation = {
  animate: {
    y: [0, -8, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      repeat: Infinity,
      duration: 5,
      ease: "easeInOut" as const,
    },
  },
};

const shakeVariants = {
  shake: {
    x: [0, -12, 12, -12, 12, 0],
    transition: { duration: 0.5 },
  },
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const from = (location.state as { from?: string })?.from || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login({
        email: data.email,
        password: data.password,
      }).unwrap();
      // Backend now returns { user, token, refreshToken }
      dispatch(setCredentials({ user: res.user, token: res.token }));
      toast.success("Welcome back! 🎉");
      if (res.user.role === "admin") navigate("/admin");
      else navigate(from);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const errorMessage = (error as { data?: { message: string } })?.data?.message;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-leaf-green/5 via-pastel-pink/30 to-blob-orange/10 overflow-hidden">
      <SEO
        title="Sign In"
        description="Log in to your LotceWieth account to manage orders and track deliveries."
      />

      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: ["-10%", "10%", "-10%"],
            y: ["-5%", "15%", "-5%"],
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute top-10 -left-20 w-72 h-72 bg-leaf-green/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: ["10%", "-10%", "10%"],
            y: ["15%", "-10%", "15%"],
          }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute bottom-10 -right-20 w-96 h-96 bg-blob-orange/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pastel-pink/10 rounded-full blur-3xl"
        />
      </div>

      {/* Main card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 grid md:grid-cols-2 min-h-[600px]"
      >
        {/* Left Panel – Immersive Visuals */}
        <div className="relative hidden md:flex flex-col justify-center items-center p-10 bg-gradient-to-br from-leaf-green/20 via-pastel-pink/30 to-white/40 border-r border-white/40 overflow-hidden">
          {/* Floating beverage icons */}
          <motion.div
            variants={floatingIconAnimation}
            animate="animate"
            className="absolute top-10 left-10 text-leaf-green/30"
          >
            <Coffee className="w-12 h-12" />
          </motion.div>
          <motion.div
            variants={floatingIconAnimation}
            animate="animate"
            className="absolute bottom-10 right-10 text-blob-orange/30"
          >
            <GlassWater className="w-12 h-12" />
          </motion.div>
          <motion.div
            variants={floatingIconAnimation}
            animate="animate"
            className="absolute top-1/2 right-5 text-yellow-500/20"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>

          {/* Main image with floating animation */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative z-10"
          >
            <img
              src="https://images.unsplash.com/photo-1622483767020-b3e0f38c2fec?auto=format&fit=crop&w=600&q=80"
              alt="Fresh Beverage Selection"
              className="w-64 h-auto rounded-2xl shadow-2xl border-4 border-white/60 object-cover"
            />
          </motion.div>

          <motion.h2
            variants={itemFadeUp}
            className="mt-6 text-3xl font-bold text-gray-800 z-10 tracking-tight"
          >
            Lotce<span className="text-leaf-green">Wieth</span>
          </motion.h2>
          <motion.p
            variants={itemFadeUp}
            className="text-gray-600 text-center mt-2 z-10 max-w-[220px] text-sm"
          >
            Your everyday drink superstore.
          </motion.p>

          <motion.div variants={itemFadeUp} className="mt-8 flex gap-3">
            <span className="px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-full text-xs font-medium text-gray-700 shadow-sm">
              🚚 Free Delivery
            </span>
            <span className="px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-full text-xs font-medium text-gray-700 shadow-sm">
              🔒 Secure Payment
            </span>
          </motion.div>
        </div>

        {/* Right Panel – Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              variants={itemFadeUp}
              className="text-3xl font-bold text-gray-900 mb-2 text-center md:text-left"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              variants={itemFadeUp}
              className="text-gray-500 mb-8 text-center md:text-left text-sm"
            >
              Enter your details to sign in.
            </motion.p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <motion.div variants={itemFadeUp}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none transition-colors group-focus-within:text-leaf-green" />
                  <input
                    type="email"
                    {...register("email")}
                    className={`w-full border ${
                      errors.email ? "border-red-500" : "border-gray-200"
                    } rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent transition-all placeholder:text-gray-400 bg-white/70 backdrop-blur-sm`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" /> {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div variants={itemFadeUp}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`w-full border ${
                      errors.password ? "border-red-500" : "border-gray-200"
                    } rounded-xl pl-10 pr-10 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent transition-all placeholder:text-gray-400 bg-white/70 backdrop-blur-sm`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" /> {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Error message */}
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    key="error"
                    variants={shakeVariants}
                    initial="shake"
                    animate="shake"
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                    className="flex items-center gap-2 bg-red-50/90 backdrop-blur-sm text-red-600 text-sm p-3 rounded-xl border border-red-100"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage || "Invalid credentials"}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                variants={itemFadeUp}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(74, 143, 41, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-leaf-green text-white py-3.5 rounded-xl font-bold shadow-lg shadow-leaf-green/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <motion.p
              variants={itemFadeUp}
              className="mt-6 text-center text-sm text-gray-600"
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-leaf-green font-semibold hover:underline"
              >
                Get Started
              </Link>
            </motion.p>

            {/* Forgot Password Link */}
            <motion.p
              variants={itemFadeUp}
              className="mt-4 text-center text-sm text-gray-500"
            >
              <Link
                to="/forgot-password"
                className="text-leaf-green font-medium hover:underline"
              >
                Forgot Password?
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;