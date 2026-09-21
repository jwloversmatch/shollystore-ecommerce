import { motion } from "framer-motion";
import { ACCENT } from "../constants";

const AmbientBg = () => (
  <div aria-hidden="true">
    <motion.div
      animate={{ x: ["-12%", "12%", "-12%"], y: ["-8%", "8%", "-8%"] }}
      transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
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
      className="fixed pointer-events-none rounded-full blur-[130px] -z-10"
      style={{
        width: 600,
        height: 600,
        bottom: -200,
        right: -200,
        background: "#10b981",
        opacity: 0.04,
      }}
    />
    <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:28px_28px]" />
  </div>
);

export default AmbientBg;