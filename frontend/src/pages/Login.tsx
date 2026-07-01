import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLoginMutation } from "../features/api/apiSlice";
import { setCredentials } from "../features/auth/authSlice";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

// Zod Validation Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const userData = await login({ email: data.email, password: data.password }).unwrap();
      dispatch(setCredentials(userData));
      if (userData.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      // Keep the API error handling for invalid credentials
      console.error("Login error:", err);
    }
  };

  const errorMessage = (error as { data?: { message: string } })?.data?.message;

  const shakeVariants = {
    shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1920&q=80)",
      }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-0"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 grid md:grid-cols-2 min-h-[550px]"
      >
        {/* Left Side - Visuals */}
        <div className="relative hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-leaf-green/20 via-pastel-pink/30 to-white/30 border-r border-white/40">
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative z-10"
          >
            <img
              src="https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=600&q=80"
              alt="Premium Citrus Juice"
              className="w-64 h-auto rounded-2xl shadow-xl border-4 border-white/50 object-cover"
            />
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold text-gray-800 z-10 tracking-tight">LotceWieth</h2>
          <p className="text-gray-600 text-center mt-2 z-10 max-w-[200px]">Organic. Refreshing. Delivered.</p>
          <div className="absolute top-10 right-10 w-24 h-24 bg-blob-orange/20 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center md:text-left">Welcome Back</h2>
          <p className="text-gray-500 mb-8 text-center md:text-left text-sm">Enter your details to sign in.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full border ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent transition-all placeholder:text-gray-400`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field with Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className={`w-full border ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  } rounded-xl pl-10 pr-10 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent transition-all placeholder:text-gray-400`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* API Error Handler */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  variants={shakeVariants}
                  initial="shake"
                  animate="shake"
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-red-50/90 backdrop-blur-sm text-red-600 text-sm p-3 rounded-xl border border-red-100"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage || "Invalid credentials"}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-leaf-green text-white py-3.5 rounded-xl font-bold shadow-lg shadow-leaf-green/30 hover:shadow-leaf-green/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-leaf-green font-semibold hover:underline">
              Get Started
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;