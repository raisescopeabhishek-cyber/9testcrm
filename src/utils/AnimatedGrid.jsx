import { motion, AnimatePresence } from "framer-motion";

export const AnimatedGrid = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(rgba(34,197,94,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.18) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        maskImage:
          "radial-gradient(120% 80% at 50% -10%, black 55%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(120% 80% at 50% -10%, black 55%, transparent 80%)",
      }}
    />
    <motion.div
      className="absolute inset-0 opacity-20"
      animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
      transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      style={{
        background:
          "repeating-linear-gradient(90deg, rgba(59,130,246,0.08) 0 2px, transparent 2px 8px)",
      }}
    />
  </div>
);

