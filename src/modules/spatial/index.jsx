import { useMemo } from 'react'
import GameBase from '../../components/GameBase'
import ChoiceGrid from '../../components/ChoiceGrid'
import { generate } from './generator'
import MazeGame from './MazeGame'

// ---- Rotate visual: shows original shape ----
function RotateVisual({ shape }) {
  return (
    <div className="flex justify-center bg-white rounded-2xl border-2 border-ink/10 p-4">
      <div className="flex flex-col items-center gap-1">
        <svg width="90" height="90" viewBox="0 0 60 60">
          <path d={shape.d} fill="#FF6B6B" stroke="#EE5253" strokeWidth="2" />
        </svg>
        <span className="text-ink-soft text-sm">原图</span>
      </div>
    </div>
  )
}

// Option renderer for rotate: shape rotated by N degrees.
const renderRotateOption = (opt, picked) => (
  <svg width="70" height="70" viewBox="0 0 60 60" style={{ transform: `rotate(${opt.rotate}deg)` }}>
    <path d={opt.d || 'M10 10 L50 10 L50 30 L30 30 L30 50 L10 50 Z'} fill={picked ? '#fff' : '#FF6B6B'} stroke={picked ? '#fff' : '#EE5253'} strokeWidth="2" />
  </svg>
)

// ---- Count figure visual ----
function CountFigureVisual({ countFigure }) {
  const id = countFigure.id
  return (
    <div className="flex justify-center bg-white rounded-2xl border-2 border-ink/10 p-4">
      <svg width="140" height="140" viewBox="0 0 100 100">
        {id === 'sq-diag' && (
          <>
            <rect x="10" y="10" width="80" height="80" fill="#FFE8A3" stroke="#3D405B" strokeWidth="3" />
            <line x1="10" y1="10" x2="90" y2="90" stroke="#3D405B" strokeWidth="3" />
            <line x1="90" y1="10" x2="10" y2="90" stroke="#3D405B" strokeWidth="3" />
          </>
        )}
        {id === 'tri-mid' && (
          <>
            <polygon points="50,10 10,90 90,90" fill="#CDEAC0" stroke="#3D405B" strokeWidth="3" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="#3D405B" strokeWidth="3" />
          </>
        )}
        {id === 'two-tri' && (
          <>
            <polygon points="10,80 45,20 45,80" fill="#CDEAC0" stroke="#3D405B" strokeWidth="3" />
            <polygon points="45,80 45,20 90,80" fill="#BDE0FE" stroke="#3D405B" strokeWidth="3" />
          </>
        )}
        {id === 'rect-two' && (
          <>
            <rect x="10" y="25" width="80" height="50" fill="#FFE8A3" stroke="#3D405B" strokeWidth="3" />
            <line x1="50" y1="25" x2="50" y2="75" stroke="#3D405B" strokeWidth="3" />
          </>
        )}
      </svg>
    </div>
  )
}

// ---- Symmetry visuals ----
function PixelGrid({ cells, size = 4, cellSize = 26, showAxis = false, color = '#B388EB' }) {
  const filled = new Set(cells.map(([r, c]) => `${r},${c}`))
  return (
    <div className="relative inline-block">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
        {Array.from({ length: size * size }).map((_, i) => {
          const r = Math.floor(i / size)
          const c = i % size
          return (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: cellSize, height: cellSize,
                background: filled.has(`${r},${c}`) ? color : '#f3ead8',
              }}
            />
          )
        })}
      </div>
      {showAxis && (
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-coral/60 -translate-x-1/2" />
      )}
    </div>
  )
}

function SymmetryVisual({ half }) {
  return (
    <div className="flex justify-center bg-white rounded-2xl border-2 border-ink/10 p-4">
      <div className="flex flex-col items-center gap-1">
        <PixelGrid cells={half} showAxis color="#B388EB" />
        <span className="text-ink-soft text-sm">这是图形的一半（红线是对称轴）</span>
      </div>
    </div>
  )
}

// ---- Block visual: stacked layers ----
function BlockVisual({ blocks }) {
  return (
    <div className="flex justify-center bg-white rounded-2xl border-2 border-ink/10 p-4">
      <div className="flex flex-col-reverse items-center gap-1">
        {blocks.map((count, layer) => (
          <div key={layer} className="flex gap-1">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="rounded-md border-2 border-sky-deep"
                style={{ width: 40, height: 40, background: layer % 2 ? '#BDE0FE' : '#4CC9F0' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Tangram visual: shape with a hole ----
function TangramVisual({ hole }) {
  return (
    <div className="flex justify-center bg-white rounded-2xl border-2 border-ink/10 p-4">
      <svg width="140" height="100" viewBox="0 0 120 80">
        <rect x="5" y="5" width="110" height="70" rx="6" fill="#80B918" stroke="#55A630" strokeWidth="2" />
        <path d={hole} fill="#FFF8EC" stroke="#3D405B" strokeWidth="2" strokeDasharray="4 3" />
      </svg>
    </div>
  )
}

const renderTangramOption = (opt, picked) => (
  <svg width="60" height="60" viewBox="0 0 70 70">
    <path d={opt.d} fill={picked ? '#fff' : '#FFB703'} stroke={picked ? '#fff' : '#FB8500'} strokeWidth="2" />
  </svg>
)

export default function SpatialGame({ moduleId, gameId, difficulty, questionCount, color, gameName, gameEmoji, onFinish, onQuestionResult, questions: externalQuestions }) {
  const questions = useMemo(
    () => (gameId === 'maze' ? [] : externalQuestions?.length ? externalQuestions : generate(gameId, difficulty, questionCount)),
    [gameId, difficulty, questionCount, externalQuestions],
  )

  // Maze is a fully custom interactive game.
  if (gameId === 'maze') {
    return <MazeGame difficulty={difficulty} questionCount={questionCount} onFinish={onFinish} />
  }

  const renderBody = (q, helpers) => (
    <div className="flex flex-col gap-4">
      {q.rotate && <RotateVisual {...q.rotate} />}
      {q.countFigure && <CountFigureVisual countFigure={q.countFigure} />}
      {q.symmetry && <SymmetryVisual {...q.symmetry} />}
      {q.blocks && <BlockVisual blocks={q.blocks} />}
      {q.tangram && <TangramVisual {...q.tangram} />}
      <ChoiceGrid
        options={q.options}
        helpers={helpers}
        isCorrect={q.isCorrect}
        columns={q.columns || 2}
        renderOption={
          q.rotate
            ? (opt, picked) => renderRotateOption({ ...opt, d: q.rotate.shape.d }, picked)
            : q.tangram
            ? renderTangramOption
            : q.symmetry
            ? (opt, picked) => <PixelGrid cells={opt.cells} cellSize={18} color={picked ? '#fff' : '#B388EB'} />
            : undefined
        }
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
