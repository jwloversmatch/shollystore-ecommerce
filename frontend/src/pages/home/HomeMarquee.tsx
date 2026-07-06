import { motion } from "framer-motion";
import { ACCENT } from "../../types/home";

interface HomeMarqueeProps {
  categoryNames: string[];
}

const HomeMarquee = ({ categoryNames }: HomeMarqueeProps) => {
  if (categoryNames.length === 0) return null;

  return (
    <div className="w-full overflow-hidden py-3.5 mt-8" style={{ background: ACCENT }}>
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...categoryNames, ...categoryNames, ...categoryNames, ...categoryNames].map(
          (cat, i) => (
            <span
              key={i}
              className="text-white font-extrabold text-sm tracking-widest uppercase flex items-center gap-3"
            >
              <span className="opacity-60">◆</span> {cat}
            </span>
          )
        )}
      </motion.div>
    </div>
  );
};

export default HomeMarquee;