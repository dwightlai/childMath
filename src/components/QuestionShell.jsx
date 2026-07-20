import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AudioButton from './AudioButton'
import StarBurst from './StarBurst'
import { playCorrect, playWrong, playStar } from '../utils/audio'
import { PRAISE, ENCOURAGE } from '../data/config'
import { pick } from '../utils/helpers'

/**
 * QuestionShell standardizes the question experience for every game.
 *
 * Props:
 *  - question: string (question text, also used for TTS)
 *  - hint: string (optional hint shown after a wrong answer)
 *  - color: module color key
 *  - index / total: question position for progress dots
 *  - onResult(correct: bool): called once when the question is finally answered correctly
 *  - children: render function or node for the interactive body.
 *      If a function, it receives { answer, wrong, locked, feedback } helpers.
 *  - autoRead: read the question aloud when it mounts
 */
export default function QuestionShell({
  question,
  hint,
  color = 'sun',
  index = 0,
  total = 1,
  onResult,
  children,
  autoRead = false,
  speakText,
}) {
  const [wrongCount, setWrongCount] = useState(0)
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState(null) // {type:'good'|'try', text}
  const [showHint, setShowHint] = useState(false)
  const [burst, setBurst] = useState(0)

  const colorMap = {
    sun: '#FFB703', sky: '#4CC9F0', leaf: '#80B918',
    coral: '#FF6B6B', grape: '#B388EB', mint: '#2EC4B6',
    peach: '#FF9F1C', berry: '#F15BB5', rose: '#EF476F',
  }
  const accent = colorMap[color] || colorMap.sun

  // Called by the game body when the child submits an answer.
  const answer = useCallback(
    (isCorrect, selectedValue) => {
      if (solved) return
      if (isCorrect) {
        setSolved(true)
        setFeedback({ type: 'good', text: pick(PRAISE) })
        setBurst((b) => b + 1)
        playCorrect()
        playStar()
        onResult && onResult(true, wrongCount)
      } else {
        setWrongCount((c) => c + 1)
        setFeedback({ type: 'try', text: pick(ENCOURAGE) })
        if (hint) setShowHint(true)
        playWrong()
        onResult && onResult(false, wrongCount, selectedValue)
      }
    },
    [solved, wrongCount, hint, onResult],
  )

  const helpers = {
    answer,
    wrongCount,
    solved,
    locked: solved,
    feedback,
    showHint,
    accent,
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <StarBurst trigger={burst} />

      {/* progress dots */}
      {total > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(total)].map((_, i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full transition-all"
              style={{
                background: i < index ? accent : i === index ? accent : '#e8ddc7',
                opacity: i <= index ? 1 : 0.5,
                transform: i === index ? 'scale(1.35)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      )}

      {/* question header */}
      <div className="card-sticker p-4 sm:p-5 flex items-start gap-3">
        <AudioButton text={speakText || question} />
        <p className="font-display text-xl sm:text-2xl leading-relaxed text-ink flex-1 pt-1">{question}</p>
      </div>

      {/* hint */}
      <AnimatePresence>
        {showHint && hint && !solved && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-sun/15 border-2 border-dashed border-sun rounded-2xl px-4 py-2 text-ink flex items-center gap-2"
          >
            <span className="text-xl">💡</span>
            <span className="text-lg">{hint}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* interactive body */}
      <div>{typeof children === 'function' ? children(helpers) : children}</div>

      {/* feedback banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback.text + wrongCount + (solved ? 's' : '')}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center font-display text-xl sm:text-2xl py-2 ${
              feedback.type === 'good' ? 'text-leaf-deep' : 'text-sun-deep'
            }`}
          >
            {feedback.type === 'good' ? '🎉 ' : '🤔 '}
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
