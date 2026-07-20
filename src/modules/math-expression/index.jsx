import { useMemo } from 'react'
import GameBase from '../../components/GameBase'
import ChoiceGrid from '../../components/ChoiceGrid'
import { generate } from './generator'
import StepOrderGame from './StepOrderGame'

// Shows the already-solved problem so the child can reflect on their method.
function MethodVisual({ problem, answer }) {
  return (
    <div className="bg-dots bg-white rounded-2xl border-2 border-ink/10 p-4 text-center">
      <p className="text-xl text-ink font-bold">{problem}</p>
      <p className="text-lg text-leaf-deep mt-2">✅ 答案：{answer}</p>
    </div>
  )
}

export default function MathExpressionGame({ moduleId, gameId, difficulty, questionCount, color, gameName, gameEmoji, onFinish, onQuestionResult, questions: externalQuestions }) {
  const questions = useMemo(
    () => (gameId !== 'step-order' ? (externalQuestions?.length ? externalQuestions : generate(gameId, difficulty, questionCount)) : []),
    [externalQuestions, gameId, difficulty, questionCount],
  )

  // step-order is an interactive drag game.
  if (gameId === 'step-order') {
    return <StepOrderGame difficulty={difficulty} questionCount={questionCount} onFinish={onFinish} />
  }

  const renderBody = (q, helpers) => (
    <div className="flex flex-col gap-4">
      {q.method && <MethodVisual {...q.method} />}
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
