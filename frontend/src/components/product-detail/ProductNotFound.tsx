import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ImageOff, ArrowLeft } from "lucide-react";
import { ACCENT } from "./constants";

const ProductNotFound = () => {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#FCFAF5] dark:bg-[#0A0A0B]">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm text-center rounded-3xl p-10
          bg-[#FCFAF5] dark:bg-[#141414]
          border border-gray-200 dark:border-white/[0.07]
          shadow-lg dark:shadow-[0_40px_90px_rgba(0,0,0,0.6)]"
      >
        <div
          className="absolute top-0 inset-x-0 h-px rounded-t-3xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
          }}
        />
        <div className="flex justify-center mb-5">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-full border-2 border-dashed"
              style={{ borderColor: `${ACCENT}28` }}
            />
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: `${ACCENT}12`,
                boxShadow: `0 0 0 3px ${ACCENT}`,
              }}
            >
              <ImageOff
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
          404
        </p>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Product Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
          This product doesn't exist or may have been removed.
        </p>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/")}
          className="w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2"
          style={{ background: ACCENT, boxShadow: `0 8px 24px ${ACCENT}44` }}
          aria-label="Go back to store homepage"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to Store
        </motion.button>
      </motion.div>
    </main>
  );
};

export default ProductNotFound;
