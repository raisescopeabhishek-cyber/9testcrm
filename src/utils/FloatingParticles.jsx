import { motion, AnimatePresence } from "framer-motion";

export const FloatingParticles = () => {
  


    return   <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-green-400 rounded-full"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -100, opacity: [0, 1, 0] }}
                transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}
          </div>
    
}