import { useMemo } from 'react'
import GameBase from '../../components/GameBase'
import ChoiceGrid from '../../components/ChoiceGrid'
import { generate } from './generator'

// Displays the characters and clues for logic puzzles.
function LogicVisual({ characters, clues }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-ink/10 p-4 flex flex-col gap-3">
      <div className="flex justify-center gap-4">
        {characters.map((c, i) => (
          <span key={i} className="text-5xl animate-float inline-block" style={{ animationDelay: `${i * 0.3}s` }}>
            {c}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {clues.map((clue, i) => (
          <div key={i} className="flex items-start gap-2 bg-grape/10 rounded-xl px-3 py-2">
            <span className="text-lg">🔎</span>
            <span className="text-ink text-lg leading-snug">{clue}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LogicGame({ moduleId, gameId, difficulty, questionCount, color, gameName, gameEmoji, onFinish, onQuestionResult, questions: externalQuestions }) {
  const questions = useMemo(
    () => (externalQuestions?.length ? externalQuestions : generate(gameId, difficulty, questionCount)),
    [externalQuestions, gameId, difficulty, questionCount],
  )

  const renderBody = (q, helpers) => (
    <div className="flex flex-col gap-4">
      {q.logic && <LogicVisual {...q.logic} />}
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
