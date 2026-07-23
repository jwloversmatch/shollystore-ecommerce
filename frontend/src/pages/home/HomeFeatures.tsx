import { motion } from "framer-motion";
import { Package, Truck, CreditCard, Star } from "lucide-react";
import { fadeUp, stagger } from "../../types/home";

const features = [
  {
    icon: <Package className="w-6 h-6" />,
    label: "Bulk Orders",
    stat: "50+",
    desc: "Pack sizes available",
    color: "#e8622a",
    glow: "rgba(232,98,42,0.15)",
  },
  {
    icon: <Truck className="w-6 h-6" />,
    label: "Fast Delivery",
    stat: "24hr",
    desc: "Across Nigeria",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.15)",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    label: "Easy Payments",
    stat: "3+",
    desc: "Payment options",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.15)",
  },
  {
    icon: <Star className="w-6 h-6" />,
    label: "Customer Rating",
    stat: "4.9★",
    desc: "From verified buyers",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.15)",
  },
];

const HomeFeatures = () => (
  <section className="bg-white dark:bg-[#111111] py-16 md:py-20">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={fadeUp(i * 0.08)}
            whileHover={{
              y: -6,
              boxShadow: `0 20px 50px rgba(0,0,0,0.15), 0 0 0 1px ${f.color}22`,
            }}
            className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/5 rounded-2xl p-5 md:p-6 transition-all cursor-default relative overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${f.glow}, transparent 70%)`,
              }}
            />
            <div className="relative z-10">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}18`, color: f.color }}
              >
                {f.icon}
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{f.stat}</div>
              <div
                className="text-xs font-bold uppercase tracking-wider mt-0.5"
                style={{ color: f.color }}
              >
                {f.label}
              </div>
              <div className="text-gray-500 dark:text-gray-600 text-xs mt-1">{f.desc}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default HomeFeatures;