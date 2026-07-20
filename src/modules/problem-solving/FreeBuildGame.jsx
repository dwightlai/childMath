import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { playClick, playCelebrate, playPop } from '../../utils/audio'

// FreeBuildGame: open-ended block building. Use exactly N blocks to make any shape.
export default function FreeBuildGame({ difficulty, questionCount, onFinish }) {
  const target = useMemo(() => (difficulty === 1 ? 5 : difficulty === 2 ? 6 : 8), [difficulty])
  const SIZE = 5
  const [grid, setGrid] = useState(() => Array(SIZE * SIZE).fill(false))
  const [won, setWon] = useState(false)

  const used = grid.filter(Boolean).length

  const toggle = (i) => {
    if (won) return
    playClick()
    setGrid((g) => g.map((v, j) => (j === i ? !v : v)))
  }

  const finish = () => {
    if (used === target) {
      setWon(true)
      playCelebrate()
      setTimeout(() => onFinish && onFinish({ correct: 1, answered: 1, stars: 3 }), 900)
    } else {
      playPop()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-5">
      <div className="card-sticker p-5 w-full text-center">
        <p className="font-display text-2xl text-ink mb-1">用 {target} 块积木 🧱 拼一个你喜欢的图形</p>
        <p className="text-ink-soft">点一点格子放积木，再点一下可以拿走。拼好后点"完成"！</p>
        <p className="font-display text-xl text-ink mt-2">
          已用：<span className={used === target ? 'text-leaf-deep' : 'text-sun-deep'}>{used}</span> / {target} 块
        </p>
      </div>

      <div className="card-sticker p-4">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${SIZE}, 48px)` }}>
          {grid.map((filled, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className="rounded-md border-2 border-ink/10 transition-all active:scale-90"
              style={{
                width: 48, height: 48,
                background: filled ? '#2EC4B6' : '#f3ead8',
                boxShadow: filled ? 'inset 0 -4px 0 rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {filled && <span className="text-xl">🧱</span>}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={finish}
        disabled={won}
        className={`btn-chunky text-xl px-10 py-3 ${used === target ? 'bg-mint text-white' : 'bg-ink/20 text-ink/50'}`}
      >
        完成 ✨
      </button>

      {used !== target && !won && (
        <p className="text-ink-soft text-center">
          {used < target ? `还差 ${target - used} 块，继续加！` : `多放了 ${used - target} 块，拿走一些～`}
        </p>
      )}
      {won && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-display text-3xl text-mint-deep">
          🎉 独一无二的作品！
        </motion.p>
      )}
    </div>
  )
}
