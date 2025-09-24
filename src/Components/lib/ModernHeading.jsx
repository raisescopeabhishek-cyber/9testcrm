import { motion } from "framer-motion";
import "./ModernHeading.css";

export default function ModernHeading({ text }) {
  return (
    <div className="modern-heading relative inline-block">
      {/* Main animated heading */}
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="heading-text"
      >
        {text}
        <span className="heading-shine"></span>
      </motion.h1>

      {/* Neon curved underline */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="heading-underline"
      >
        <svg
          width="100%"
          height="8"
          viewBox="0 0 100 8"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,8 C25,0 75,0 100,8"
            fill="none"
            stroke="url(#neonGradient)"
            strokeWidth="2"
            className="neon-path"
          />
          <defs>
            <linearGradient id="neonGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#facc15" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
