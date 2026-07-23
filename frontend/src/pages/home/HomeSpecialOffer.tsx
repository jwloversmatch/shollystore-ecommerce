import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Flame } from "lucide-react";
import { ACCENT } from "../../types/home";

interface HomeSpecialOfferProps {
  specialOfferTitle: string;
  specialOfferText: string;
}

const HomeSpecialOffer = ({
  specialOfferTitle,
  specialOfferText,
}: HomeSpecialOfferProps) => (
  <section className="bg-gray-50 dark:bg-[#0A0A0B] py-14 md:py-20 px-4 md:px-6">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
        style={{
          background:
            "linear-gradient(140deg, #180a00 0%, #0A0A0B 45%, #001509 100%)",
        }}
      >
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, #10b981, transparent)",
          }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute top-6 right-6 opacity-30"
          style={{ color: ACCENT }}
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-6 left-6 opacity-20"
          style={{ color: "#10b981" }}
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold mb-6"
          style={{
            background: "rgba(232,98,42,0.1)",
            borderColor: "rgba(232,98,42,0.3)",
            color: ACCENT,
          }}
        >
          <Flame className="w-3.5 h-3.5" /> Limited Offer
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight"
        >
          {specialOfferTitle}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg mb-10 max-w-lg mx-auto"
        >
          {specialOfferText}
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.28 }}
          whileHover={{ scale: 1.05, boxShadow: `0 18px 45px ${ACCENT}55` }}
          whileTap={{ scale: 0.96 }}
          onClick={() =>
            document
              .getElementById("products-grid")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full font-bold text-lg text-white group"
          style={{ background: ACCENT, boxShadow: `0 10px 28px ${ACCENT}44` }}
        >
          Shop Now{" "}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  </section>
);

export default HomeSpecialOffer;