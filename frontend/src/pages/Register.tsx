import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegisterMutation } from "../features/api/apiSlice";
import { Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

// Zod Validation Schema with custom refinement for password matching
const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();

  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({ email: data.email, password: data.password }).unwrap();
      reset();
      setRegisteredEmail(data.email);
      setRegistrationSuccess(true);
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  const errorMessage = (error as { data?: { message: string } })?.data?.message;

  const shakeVariants = {
    shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } },
  };

  // After successful registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1920&q=80)" }}
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-0"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <Mail className="w-16 h-16 text-leaf-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <strong>{registeredEmail}</strong>. Please click the link to activate your account.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-leaf-green text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1920&q=80)",
      }}
    >
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-0"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 grid md:grid-cols-2 min-h-[600px]"
      >
        {/* Left Side - Visuals */}
        <div className="relative hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-blob-orange/20 via-pastel-green/30 to-white/30 border-r border-white/40">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative z-10"
          >
            <img
              src="https://images.unsplash.com/photo-1622483767020-b3e0f38c2fec?auto=format&fit=crop&w=600&q=80"
              alt="Fresh Oranges and Mint"
              className="w-64 h-auto rounded-2xl shadow-xl border-4 border-white/50 object-cover"
            />
          </motion.div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 z-10 tracking-tight">Join Us</h2>
          <p className="text-gray-600 text-center mt-2 z-10 max-w-[200px]">Start your healthier living journey today.</p>
          <div className="absolute top-10 right-10 w-24 h-24 bg-leaf-green/20 rounded-full blur-3xl"></div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center md:text-left">Create Account</h2>
          <p className="text-gray-500 mb-8 text-center md:text-left text-sm">Join us and enjoy fresh organic delights.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Confirm Password Field with Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={`w-full border ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-200"
                  } rounded-xl pl-10 pr-10 py-3 outline-none focus:ring-2 focus:ring-leaf-green focus:border-transparent transition-all placeholder:text-gray-400`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.confirmPassword.message}
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
                  <span>{errorMessage || "Registration failed"}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-blob-orange text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blob-orange/30 hover:shadow-blob-orange/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blob-orange font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;