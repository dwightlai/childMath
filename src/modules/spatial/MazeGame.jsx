import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { playClick, playCorrect, playCelebrate } from '../../utils/audio'
import { playPop } from '../../utils/audio'

// A simple grid maze. 1 = wall, 0 = path, S = start, E = exit.
const MAZES = [
  { // easy 5x5
    grid: [
      ['S', 0, 1, 0, 0],
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 1],
      [0, 1, 1, 0, 0],
      [0, 0, 1, 1, 'E'],
    ],
  },
  { // medium 5x5
    grid: [
      ['S', 0, 0, 0, 1],
      [1, 1, 1, 0, 1],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 'E'],
    ],
  },
  { // another 5x5
    grid: [
      ['S', 1, 0, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 1, 0],
      [1, 1, 0, 1, 0],
      [0, 0, 0, 0, 'E'],
    ],
  },
]

/**
 * MazeGame: navigate a character from start to exit using arrow buttons.
 * Props: difficulty, questionCount (number of mazes), onFinish
 */
export default function MazeGame({ difficulty, questionCount, onFinish }) {
  const mazeIdx = useMemo(() => Math.floor(Math.random() * MAZES.length), [])
  const grid = MAZES[mazeIdx].grid
  const size = grid.length

  const start = useMemo(() => {
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++) if (grid[r][c] === 'S') return { r, c }
    return { r: 0, c: 0 }
  }, [grid, size])

  const [pos, setPos] = useState(start)
  const [trail, setTrail] = useState([start])
  const [won, setWon] = useState(false)
  const [bump, setBump] = useState(false)

  // Responsive cell size: fit within viewport on mobile
  const cellSize = typeof window !== 'undefined' && window.innerWidth < 480
    ? Math.min(40, Math.floor((window.innerWidth - 72) / size))
    : 52

  const move = useCallback(
    (dr, dc) => {
      if (won) return
      const nr = pos.r + dr
      const nc = pos.c + dc
      if (nr < 0 || nr >= size || nc < 0 || nc >= size || grid[nr][nc] === 1) {
        setBump(true)
        setTimeout(() => setBump(false), 300)
        playPop()
        return
      }
      playClick()
      const next = { r: nr, c: nc }
      setPos(next)
      setTrail((t) => [...t, next])
      if (grid[nr][nc] === 'E') {
        setWon(true)
        playCelebrate()
        setTimeout(() => onFinish && onFinish({ correct: 1, answered: 1, stars: 3 }), 900)
      }
    },
    [pos, won, grid, size, onFinish],
  )

  const cell = (r, c) => {
    const v = grid[r][c]
    const isWall = v === 1
    const isExit = v === 'E'
    const isStart = v === 'S'
    const isHere = pos.r === r && pos.c === c
    const inTrail = trail.some((t) => t.r === r && t.c === c)
    return (
      <div
        key={`${r}-${c}`}
        className={`relative flex items-center justify-center rounded-md ${
          isWall ? 'bg-ink/70' : isExit ? 'bg-leaf/30' : 'bg-white'
        } ${inTrail && !isHere ? 'bg-sun/20' : ''}`}
        style={{ width: cellSize, height: cellSize }}
      >
        {isExit && <span className="text-xl sm:text-2xl">🏁</span>}
        {isStart && !isHere && <span className="text-base sm:text-xl opacity-40">🏠</span>}
        {isHere && (
          <motion.span
            className="text-2xl sm:text-3xl z-10"
            animate={bump ? { x: [0, -4, 4, 0] } : { scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            🐰
          </motion.span>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-5">
      <div className="card-sticker p-4">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
          {grid.map((row, r) => row.map((_, c) => cell(r, c)))}
        </div>
      </div>

      {won && (
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="font-display text-3xl text-leaf-deep"
        >
          🎉 走出迷宫啦！
        </motion.p>
      )}

      {/* D-pad controls */}
      <div className="grid grid-cols-3 gap-2 w-48">
        <div />
        <button type="button" onClick={() => move(-1, 0)} className="btn-chunky bg-coral text-white text-2xl h-14">⬆️</button>
        <div />
        <button type="button" onClick={() => move(0, -1)} className="btn-chunky bg-coral text-white text-2xl h-14">⬅️</button>
        <button type="button" onClick={() => move(1, 0)} className="btn-chunky bg-coral text-white text-2xl h-14">⬇️</button>
        <button type="button" onClick={() => move(0, 1)} className="btn-chunky bg-coral text-white text-2xl h-14">➡️</button>
      </div>
      <p className="text-ink-soft text-center">帮小兔子 🐰 走到 🏁 终点吧！</p>
    </div>
  )
}
