import { useMemo } from 'react'
import GameBase from '../../components/GameBase'
import ChoiceGrid from '../../components/ChoiceGrid'
import { generate } from './generator'

// Two rows of items for comparison games.
function RowVisual({ a, b, emoji }) {
  return (
    <div className="flex flex-col gap-3 bg-white rounded-2xl border-2 border-ink/10 p-4">
      <div className="flex items-center gap-2">
        <span className="w-16 text-ink-soft shrink-0">第一行</span>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: a }).map((_, i) => (
            <span key={i} className="text-2xl">{emoji}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-16 text-ink-soft shrink-0">第二行</span>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: b }).map((_, i) => (
            <span key={i} className="text-2xl">{emoji}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Big emoji scene for story theater.
function StoryVisual({ emoji }) {
  return (
    <div className="flex justify-center bg-dots bg-white rounded-2xl border-2 border-ink/10 py-4">
      <span className="text-6xl animate-float inline-block">{emoji}</span>
    </div>
  )
}

export default function QuantityRelationGame({ moduleId, gameId, difficulty, questionCount, color, gameName, gameEmoji, onFinish, onQuestionResult, questions: externalQuestions }) {
  const questions = useMemo(
    () => (externalQuestions?.length ? externalQuestions : generate(gameId, difficulty, questionCount)),
    [externalQuestions, gameId, difficulty, questionCount],
  )

  const renderBody = (q, helpers) => (
    <div className="flex flex-col gap-4">
      {q.story && <StoryVisual {...q.story} />}
      {q.rows && <RowVisual {...q.rows} />}
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
