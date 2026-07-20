import { useMemo } from 'react'
import GameBase from '../../components/GameBase'
import ChoiceGrid from '../../components/ChoiceGrid'
import { generate } from './generator'

// Renders a scattered or grid group of countable items.
function CountItems({ count, item, scattered }) {
  const positions = useMemo(() => {
    if (!scattered) return null
    return Array.from({ length: count }, (_, i) => ({
      left: `${(i * 37 + 8) % 88}%`,
      top: `${(i * 53 + 10) % 78}%`,
      rotate: (i * 47) % 40 - 20,
    }))
  }, [count, scattered])

  if (scattered) {
    return (
      <div className="relative w-full h-44 bg-dots rounded-2xl bg-white border-2 border-ink/10 overflow-hidden">
        {positions.map((p, i) => (
          <span
            key={i}
            className="absolute text-2xl"
            style={{ left: p.left, top: p.top, transform: `rotate(${p.rotate}deg)` }}
          >
            {item}
          </span>
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-wrap justify-center gap-2 bg-dots rounded-2xl bg-white border-2 border-ink/10 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-3xl">{item}</span>
      ))}
    </div>
  )
}

// Visual for split-number: shows total as a bar split into two groups.
function SplitVisual({ total, part }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-white rounded-2xl border-2 border-ink/10 p-4">
      <div className="flex flex-wrap justify-center gap-1 max-w-md">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`w-6 h-6 rounded-full inline-block ${i < part ? 'bg-sun' : 'bg-sky'}`}
          />
        ))}
      </div>
      <p className="text-ink-soft text-lg">
        <span className="text-sun-deep font-bold">●</span> 是 {part} 个，
        <span className="text-sky-deep font-bold">●</span> 是多少个？
      </p>
    </div>
  )
}

// Visual for compare: shows the two sides big.
function CompareVisual({ left, right }) {
  return (
    <div className="flex items-center justify-center gap-4 bg-white rounded-2xl border-2 border-ink/10 p-5">
      <span className="font-display text-4xl text-coral-deep">{left}</span>
      <span className="w-14 h-14 rounded-full border-4 border-dashed border-ink/30 flex items-center justify-center text-2xl text-ink/40">?</span>
      <span className="font-display text-4xl text-sky-deep">{right}</span>
    </div>
  )
}

/**
 * NumberSenseGame renders any number-sense game.
 * Props: gameId, difficulty, questionCount, color, gameName, gameEmoji, onFinish
 */
export default function NumberSenseGame({ moduleId, gameId, difficulty, questionCount, color, gameName, gameEmoji, onFinish, onQuestionResult, questions: externalQuestions }) {
  const questions = useMemo(
    () => (externalQuestions?.length ? externalQuestions : generate(gameId, difficulty, questionCount)),
    [externalQuestions, gameId, difficulty, questionCount],
  )

  const renderBody = (q, helpers) => (
    <div className="flex flex-col gap-4">
      {q.countItems && <CountItems {...q.countItems} />}
      {q.visual && <SplitVisual {...q.visual} />}
      {q.compare && <CompareVisual {...q.compare} />}
      <ChoiceGrid
        options={q.options}
        helpers={helpers}
        isCorrect={q.isCorrect}
        columns={q.columns || 2}
      />
    </div>
  )

  return (
    <GameBase
      questions={questions}
      color={color}
      gameName={gameName}
      gameEmoji={gameEmoji}
      moduleId={moduleId}
      gameId={gameId}
      renderBody={renderBody}
      onFinish={onFinish}
      onQuestionResult={onQuestionResult}
    />
  )
}
