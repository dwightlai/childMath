import { motion, AnimatePresence } from 'framer-motion'

// Floating star particles shown on correct answers.
export default function StarBurst({ trigger }) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <div key={trigger} className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const dist = 90 + (i % 3) * 30
            return (
              <motion.span
                key={i}
                className="absolute text-3xl"
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist - 40,
                  scale: [0, 1.3, 1],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              >
                ⭐
              </motion.span>
            )
          })}
        </div>
      )}
    </AnimatePresence>
  )
}
