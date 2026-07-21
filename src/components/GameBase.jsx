import { useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import QuestionShell from './QuestionShell'
import ProgressBar from './ProgressBar'
import { useMistakeStore } from '../stores/useMistakeStore'

/**
 * GameBase runs a sequence of questions for a single game.
 *
 * Props:
 *  - questions: array of question objects (already generated for the difficulty)
 *  - color: module color key
 *  - gameName / gameEmoji: shown in the header
 *  - moduleId / gameId: for mistake recording (optional)
 *  - renderBody(question, helpers): renders the interactive body inside QuestionShell
 *  - onFinish(result): called with { correct, answered, stars } when all done
 *  - onQuestionResult(result): called once per solved question with { correct, hintUsed, timeMs }
 *  - showHeader: whether to show the top bar (Session provides its own)
 */
export default function GameBase({ questions, color, gameName, gameEmoji, moduleId, gameId, renderBody, onFinish, onQuestionResult, showHeader = true }) {
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(false)
  const stats = useRef({ correct: 0, answered: 0 })
  const finishedRef = useRef(false)
  const startTimeRef = useRef(Date.now())
  const advanceTimerRef = useRef(0)
  const idxRef = useRef(0)

  const total = questions.length
  const q = questions[idx]

  useEffect(() => {
    startTimeRef.current = Date.now()
    idxRef.current = idx
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current)
    }
  }, [idx])

  const finishIfNeeded = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setDone(true)
    const { correct, answered } = stats.current
    const ratio = answered > 0 ? correct / answered : 0
    const stars = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1
    onFinish && onFinish({ correct, answered, stars })
  }, [onFinish])

  const handleResultAndAdvance = useCallback(
    (isCorrect, wrongCount, selectedValue) => {
      const curIdx = idxRef.current
      const curQ = questions[curIdx]
      stats.current.answered += 1
      if (isCorrect) {
        stats.current.correct += 1
        if (onQuestionResult) {
          onQuestionResult({
            correct: true,
            hintUsed: (wrongCount || 0) > 0,
            timeMs: Date.now() - startTimeRef.current,
          })
        }
        if (curQ?._mistakeId) {
          useMistakeStore.getState().markMastered(curQ._mistakeId)
        }
        if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current)
        advanceTimerRef.current = window.setTimeout(() => {
          if (curIdx + 1 < total) setIdx(curIdx + 1)
          else finishIfNeeded()
        }, 900)
      } else if (moduleId && gameId) {
        const correctOpt = curQ?.options?.find((o) => curQ.isCorrect(o))
        useMistakeStore.getState().addMistake({
          moduleId,
          gameId,
          gameName,
          gameEmoji,
          question: curQ?.question || '',
          options: curQ?.options || [],
          correctValue: correctOpt?.value ?? '',
          wrongValue: selectedValue ?? '',
          hint: curQ?.hint || '',
        })
      }
    },
    [onQuestionResult, moduleId, gameId, gameName, gameEmoji, questions, total, finishIfNeeded],
  )

  if (!q) return null

  return (
    <div className="w-full flex flex-col gap-4">
      {showHeader && (
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl">{gameEmoji}</span>
          <h3 className="font-display text-xl sm:text-2xl text-ink">{gameName}</h3>
          <div className="flex-1">
            <ProgressBar value={idx + (done ? 1 : 0)} max={total} color={color} />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <QuestionShell
            question={q.question}
            speakText={q.speakText}
            hint={q.hint}
            color={color}
            index={idx}
            total={total}
            onResult={handleResultAndAdvance}
          >
            {(helpers) => renderBody(q, helpers)}
          </QuestionShell>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
