import { useState } from 'react'
import { motion } from 'framer-motion'
import { playClick } from '../utils/audio'

/**
 * A grid of big, friendly option tiles.
 * Props:
 *  - options: array of { value, label, emoji } (label/emoji optional; value used as label)
 *  - helpers: QuestionShell helpers ({ answer, solved, accent })
 *  - isCorrect(option): returns bool
 *  - columns: grid columns (2, 3, 4)
 *  - big: larger tiles for fewer options
 */
export default function ChoiceGrid({ options, helpers, isCorrect, columns = 2, big = false, renderOption }) {
  const [shake, setShake] = useState(null)
  const [picked, setPicked] = useState(null)

  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-3 sm:grid-cols-5',
  }[columns] || 'grid-cols-2'

  const handle = (opt) => {
    if (helpers.solved) return
    playClick()
    const correct = isCorrect(opt)
    if (!correct) {
      setShake(opt.value)
      setTimeout(() => setShake(null), 450)
    } else {
      setPicked(opt.value)
    }
    helpers.answer(correct, opt.value)
  }

  return (
    <div className={`grid ${cols} gap-3 sm:gap-4`}>
      {options.map((opt) => {
        const isPickedCorrect = picked === opt.value && helpers.solved
        const isShaking = shake === opt.value
        return (
          <motion.button
            key={String(opt.value)}
            type="button"
            onClick={() => handle(opt)}
            disabled={helpers.solved}
            animate={isShaking ? { x: [0, -8, 8, -6, 6, 0] } : isPickedCorrect ? { scale: [1, 1.12, 1] } : {}}
            transition={{ duration: 0.4 }}
            className={`option-tile ${big ? 'min-h-24 text-4xl p-4' : 'min-h-16 text-2xl p-3'} ${
              isPickedCorrect ? 'text-white' : 'bg-white text-ink border-2 border-ink/10'
            } ${helpers.solved && !isPickedCorrect ? 'opacity-40' : ''}`}
            style={isPickedCorrect ? { background: helpers.accent } : undefined}
          >
            {renderOption ? (
              renderOption(opt, isPickedCorrect)
            ) : (
              <span className="flex items-center gap-2">
                {opt.emoji && <span>{opt.emoji}</span>}
                <span>{opt.label ?? opt.value}</span>
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
