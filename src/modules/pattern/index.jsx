import { useMemo } from 'react'
import GameBase from '../../components/GameBase'
import ChoiceGrid from '../../components/ChoiceGrid'
import { generate } from './generator'

// Displays a sequence with a blank at the end (numbers or shapes).
function SequenceVisual({ items, isNumber, highlightLast }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-white rounded-2xl border-2 border-ink/10 p-5">
      {items.map((it, i) => (
        <span
          key={i}
          className={`inline-flex items-center justify-center ${
            isNumber
              ? 'w-14 h-14 rounded-xl bg-sun/20 font-display text-3xl text-ink'
              : 'text-4xl'
          } ${highlightLast && i === items.length - 1 ? 'ring-4 ring-coral/50 bg-coral/15' : ''}`}
        >
          {it}
        </span>
      ))}
      <span className="inline-flex items-center justify-center w-14 h-14 rounded-xl border-4 border-dashed border-ink/30 text-2xl text-ink/40">
        ?
      </span>
    </div>
  )
}

export default function PatternGame({ moduleId, gameId, difficulty, questionCount, color, gameName, gameEmoji, onFinish, onQuestionResult, questions: externalQuestions }) {
  const questions = useMemo(
    () => (externalQuestions?.length ? externalQuestions : generate(gameId, difficulty, questionCount)),
    [externalQuestions, gameId, difficulty, questionCount],
  )

  const renderBody = (q, helpers) => (
    <div className="flex flex-col gap-4">
      {q.seq && <SequenceVisual {...q.seq} />}
      <ChoiceGrid
        options={q.options}
        helpers={helpers}
        isCorrect={q.isCorrect}
        columns={q.columns || 2}
        big={q.big}
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
