import { motion } from "framer-motion";
import { Search, ShoppingCart, Truck } from "lucide-react";
import { ACCENT } from "../../types/home";

const steps = [
  {
    icon: <Search className="w-6 h-6" aria-hidden="true" />,
    title: "Browse Products",
    text: "Explore thousands of quality items across categories, with clear prices and ratings.",
  },
  {
    icon: <ShoppingCart className="w-6 h-6" aria-hidden="true" />,
    title: "Checkout Securely",
    text: "Pay using Paystack, WhatsApp Pay, or bank transfer – all protected and fast.",
  },
  {
    icon: <Truck className="w-6 h-6" aria-hidden="true" />,
    title: "Fast Delivery",
    text: "Your order is processed immediately and delivered quickly across Nigeria.",
  },
];

const HomeHowItWorks = () => (
  <section
    className="py-14 md:py-18 bg-white dark:bg-[#141414] border-y border-gray-200 dark:border-white/[0.06]"
    aria-labelledby="how-it-works-heading"
  >
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="text-center mb-10">
        <p
          className="text-xs font-black uppercase tracking-[0.2em] mb-2"
          style={{ color: ACCENT }}
        >
          Simple Steps
        </p>
        <h2
          id="how-it-works-heading"
          className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white"
        >
          How It Works
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 dark:bg-[#1c1c1c] border border-gray-200 dark:border-white/[0.06]"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${ACCENT}18`, color: ACCENT }}
            >
              {step.icon}
            </div>
            <h3 className="font-black text-lg mb-2 text-gray-900 dark:text-white">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {step.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeHowItWorks;