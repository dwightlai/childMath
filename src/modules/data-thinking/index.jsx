import { useMemo } from 'react'
import GameBase from '../../components/GameBase'
import ChoiceGrid from '../../components/ChoiceGrid'
import { generate } from './generator'

// A mixed pile of emoji items (count-sort).
function ItemsVisual({ items }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 bg-white rounded-2xl border-2 border-ink/10 p-4">
      {items.map((e, i) => (
        <span key={i} className="text-3xl">{e}</span>
      ))}
    </div>
  )
}

// Simple bar chart (read-chart).
function ChartVisual({ names, values, emoji }) {
  const max = Math.max(...values)
  return (
    <div className="bg-white rounded-2xl border-2 border-ink/10 p-4">
      <div className="flex items-end justify-around gap-3 h-44">
        {names.map((nm, i) => (
          <div key={nm} className="flex flex-col items-center flex-1 h-full justify-end">
            <span className="text-lg font-bold text-ink mb-1">{values[i]}</span>
            <div
              className="w-full max-w-14 rounded-t-xl bg-sky transition-all"
              style={{ height: `${(values[i] / max) * 100}%` }}
            />
            <span className="mt-1 text-sm text-ink-soft">{emoji}{nm}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Two rows of items (compare-data).
function RowVisual({ a, b, emoji }) {
  return (
    <div className="flex flex-col gap-3 bg-white rounded-2xl border-2 border-ink/10 p-4">
      <div className="flex items-center gap-2">
        <span className="w-16 text-ink-soft shrink-0">第一组</span>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: a }).map((_, i) => (
            <span key={i} className="text-2xl">{emoji}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-16 text-ink-soft shrink-0">第二组</span>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: b }).map((_, i) => (
            <span key={i} className="text-2xl">{emoji}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Survey result list (simple-survey).
function SurveyVisual({ cats, counts }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-ink/10 p-4 flex flex-col gap-2">
      {cats.map((c, i) => (
        <div key={c.name} className="flex items-center gap-3">
          <span className="text-2xl">{c.emoji}</span>
          <span className="w-16 text-ink">{c.name}</span>
          <div className="flex gap-1">
            {Array.from({ length: counts[i] }).map((_, k) => (
              <span key={k} className="text-xl">🙂</span>
            ))}
          </div>
          <span className="ml-auto font-bold text-ink">{counts[i]}人</span>
        </div>
      ))}
    </div>
  )
}

export default function DataThinkingGame({ moduleId, gameId, difficulty, questionCount, color, gameName, gameEmoji, onFinish, onQuestionResult, questions: externalQuestions }) {
  const questions = useMemo(
    () => (externalQuestions?.length ? externalQuestions : generate(gameId, difficulty, questionCount)),
    [externalQuestions, gameId, difficulty, questionCount],
  )

  const renderBody = (q, helpers) => (
    <div className="flex flex-col gap-4">
      {q.items && <ItemsVisual items={q.items} />}
      {q.chart && <ChartVisual {...q.chart} />}
      {q.rows && <RowVisual {...q.rows} />}
      {q.survey && <SurveyVisual {...q.survey} />}
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
