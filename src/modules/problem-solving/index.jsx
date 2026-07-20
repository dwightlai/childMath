import { useMemo } from 'react'
import GameBase from '../../components/GameBase'
import ChoiceGrid from '../../components/ChoiceGrid'
import { generate } from './generator'
import FairShareGame from './FairShareGame'
import MakeChangeGame from './MakeChangeGame'
import FreeBuildGame from './FreeBuildGame'

// Visual for route counting: a small grid with start and end.
function RouteVisual({ routeGrid }) {
  const { rows, cols } = routeGrid
  return (
    <div className="flex justify-center bg-white rounded-2xl border-2 border-ink/10 p-4">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 56px)` }}>
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols)
          const c = i % cols
          const isStart = r === 0 && c === 0
          const isEnd = r === rows - 1 && c === cols - 1
          return (
            <div
              key={i}
              className={`flex items-center justify-center rounded-md text-2xl ${
                isStart ? 'bg-sun/30' : isEnd ? 'bg-mint/30' : 'bg-dots bg-cream'
              } border-2 border-ink/10`}
              style={{ width: 56, height: 56 }}
            >
              {isStart ? '🏠' : isEnd ? '🏫' : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ProblemSolvingGame({ moduleId, gameId, difficulty, questionCount, color, gameName, gameEmoji, onFinish, onQuestionResult, questions: externalQuestions }) {
  const isQuiz = gameId === 'route' || gameId === 'life-math'
  const questions = useMemo(
    () => (isQuiz ? (externalQuestions?.length ? externalQuestions : generate(gameId, difficulty, questionCount)) : []),
    [isQuiz, gameId, difficulty, questionCount, externalQuestions],
  )

  // Interactive, open-ended games.
  if (gameId === 'fair-share') return <FairShareGame difficulty={difficulty} questionCount={questionCount} onFinish={onFinish} />
  if (gameId === 'make-change') return <MakeChangeGame difficulty={difficulty} questionCount={questionCount} onFinish={onFinish} />
  if (gameId === 'free-build') return <FreeBuildGame difficulty={difficulty} questionCount={questionCount} onFinish={onFinish} />

  // Route counting is quiz-style.
  const renderBody = (q, helpers) => (
    <div className="flex flex-col gap-4">
      {q.routeGrid && <RouteVisual routeGrid={q.routeGrid} />}
      <ChoiceGrid options={q.options} helpers={helpers} isCorrect={q.isCorrect} columns={q.columns || 2} />
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
