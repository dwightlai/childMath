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

function ClockVisual({ hour, minute = 0 }) {
  const h = ((hour % 12) + 12) % 12
  const m = Math.max(0, Math.min(59, minute))
  const minuteAngle = m * 6
  const hourAngle = h * 30 + m * 0.5
  const cx = 100
  const cy = 100
  const hand = (angle, len, width, color) => {
    const rad = ((angle - 90) * Math.PI) / 180
    const x2 = cx + Math.cos(rad) * len
    const y2 = cy + Math.sin(rad) * len
    return (
      <line
        x1={cx}
        y1={cy}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
    )
  }
  return (
    <div className="flex justify-center bg-white rounded-2xl border-2 border-ink/10 p-4">
      <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-56 sm:h-56" aria-label={`钟面 ${hour} 点`}>
        <circle cx={cx} cy={cy} r="92" fill="#FFF8E7" stroke="#3D405B" strokeWidth="4" />
        <circle cx={cx} cy={cy} r="84" fill="none" stroke="#e8ddc7" strokeWidth="2" />
        {Array.from({ length: 12 }).map((_, i) => {
          const n = i + 1
          const a = ((n * 30 - 90) * Math.PI) / 180
          const tx = cx + Math.cos(a) * 68
          const ty = cy + Math.sin(a) * 68
          const tickOuter = 88
          const tickInner = n % 3 === 0 ? 76 : 80
          const ox = cx + Math.cos(a) * tickOuter
          const oy = cy + Math.sin(a) * tickOuter
          const ix = cx + Math.cos(a) * tickInner
          const iy = cy + Math.sin(a) * tickInner
          return (
            <g key={n}>
              <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="#3D405B" strokeWidth={n % 3 === 0 ? 3 : 2} />
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="18"
                fontWeight="700"
                fill="#3D405B"
              >
                {n}
              </text>
            </g>
          )
        })}
        {hand(hourAngle, 48, 6, '#EF476F')}
        {hand(minuteAngle, 66, 4, '#4CC9F0')}
        <circle cx={cx} cy={cy} r="6" fill="#3D405B" />
      </svg>
    </div>
  )
}

function hydrateClock(q) {
  if (q.clock) return q
  const m = (q.question || '').match(/(?:短针|时针)[^0-9]*(\d{1,2})[^0-9]*(?:长针|分针)[^0-9]*12/)
  if (m) return { ...q, clock: { hour: Number(m[1]), minute: 0 } }
  const m2 = (q.question || '').match(/现在(?:是)?\s*(\d{1,2})\s*点/)
  if (m2 && /再过|过\s*\d+\s*小时|钟/.test(q.question || '')) {
    return { ...q, clock: { hour: Number(m2[1]), minute: 0 } }
  }
  return q
}

export default function ProblemSolvingGame({ moduleId, gameId, difficulty, questionCount, color, gameName, gameEmoji, onFinish, onQuestionResult, questions: externalQuestions }) {
  const isQuiz = gameId === 'route' || gameId === 'life-math'
  const questions = useMemo(() => {
    const raw = isQuiz
      ? (externalQuestions?.length ? externalQuestions : generate(gameId, difficulty, questionCount))
      : []
    return gameId === 'life-math' ? raw.map(hydrateClock) : raw
  }, [isQuiz, gameId, difficulty, questionCount, externalQuestions])

  // Interactive, open-ended games.
  if (gameId === 'fair-share') return <FairShareGame difficulty={difficulty} questionCount={questionCount} onFinish={onFinish} />
  if (gameId === 'make-change') return <MakeChangeGame difficulty={difficulty} questionCount={questionCount} onFinish={onFinish} />
  if (gameId === 'free-build') return <FreeBuildGame difficulty={difficulty} questionCount={questionCount} onFinish={onFinish} />

  const renderBody = (q, helpers) => (
    <div className="flex flex-col gap-4">
      {q.routeGrid && <RouteVisual routeGrid={q.routeGrid} />}
      {q.clock && <ClockVisual hour={q.clock.hour} minute={q.clock.minute || 0} />}
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
