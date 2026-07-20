import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { playCelebrate } from '../utils/audio'

// Celebration overlay shown at the end of a session or big achievement.
export default function RewardModal({ open, stars, title, subtitle, buttonText = '太棒了！', onClose }) {
  useEffect(() => {
    if (open) playCelebrate()
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="card-sticker relative w-full max-w-md p-8 text-center overflow-hidden"
            initial={{ scale: 0.5, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* confetti */}
            {[...Array(14)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute top-0 text-xl"
                style={{ left: `${(i * 7.3 + 4) % 96}%` }}
                initial={{ y: -30, opacity: 1, rotate: 0 }}
                animate={{ y: 320, opacity: 0, rotate: i % 2 ? 180 : -180 }}
                transition={{ duration: 1.6 + (i % 5) * 0.25, delay: i * 0.06, ease: 'easeIn' }}
              >
                {['🎉', '🎊', '⭐', '🌟', '✨'][i % 5]}
              </motion.span>
            ))}

            <motion.div
              className="text-7xl mb-3"
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              🏆
            </motion.div>
            <h2 className="font-display text-3xl text-ink mb-1">{title || '闯关成功！'}</h2>
            {subtitle && <p className="text-ink-soft mb-4">{subtitle}</p>}

            <div className="flex justify-center gap-2 my-4">
              {[...Array(Math.min(stars, 5))].map((_, i) => (
                <motion.span
                  key={i}
                  className="text-5xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 300 }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-chunky bg-sun text-ink text-xl px-10 py-3 mt-2"
            >
              {buttonText}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
