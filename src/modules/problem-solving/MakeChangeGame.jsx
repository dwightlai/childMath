import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { playClick, playCelebrate, playPop } from '../../utils/audio'

const COINS = [
  { value: 1, emoji: '🪙', color: '#BDE0FE' },
  { value: 2, emoji: '🥈', color: '#CDEAC0' },
  { value: 5, emoji: '🥇', color: '#FFE8A3' },
]

// MakeChangeGame: pick coins that add up exactly to the target amount.
export default function MakeChangeGame({ difficulty, questionCount, onFinish }) {
  const target = useMemo(() => (difficulty === 1 ? 6 : difficulty === 2 ? 8 : 10), [difficulty])
  const [picked, setPicked] = useState([])
  const [won, setWon] = useState(false)

  const sum = picked.reduce((s, c) => s + c.value, 0)

  const addCoin = (coin) => {
    if (won) return
    playClick()
    const next = [...picked, coin]
    const s = next.reduce((x, c) => x + c.value, 0)
    if (s === target) {
      setPicked(next)
      setWon(true)
      playCelebrate()
      setTimeout(() => onFinish && onFinish({ correct: 1, answered: 1, stars: 3 }), 900)
    } else if (s > target) {
      playPop()
      // too much, shake and reset
      setPicked(next)
      setTimeout(() => setPicked([]), 800)
    } else {
      setPicked(next)
    }
  }

  const over = sum > target

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-5">
      <div className="card-sticker p-5 w-full text-center">
        <p className="font-display text-2xl text-ink mb-1">用硬币凑出 {target} 元 🪙</p>
        <p className="text-ink-soft">点一点下面的硬币，看看有几种凑法！</p>
        <div className="flex items-center justify-center gap-2 my-3 min-h-12">
          {picked.map((c, i) => (
            <motion.span key={i} initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} className="text-3xl">
              {c.emoji}
            </motion.span>
          ))}
          {picked.length === 0 && <span className="text-ink-soft">还没选硬币</span>}
        </div>
        <p className={`font-display text-2xl ${over ? 'text-coral-deep' : sum === target ? 'text-leaf-deep' : 'text-ink'}`}>
          现在一共：{sum} 元 {over && '（太多啦，重来）'}
        </p>
      </div>

      <div className="flex justify-center gap-5">
        {COINS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => addCoin(c)}
            className="flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-90 hover:scale-110"
          >
            <span
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border-4 border-ink/20"
              style={{ background: c.color, boxShadow: '0 5px 0 rgba(0,0,0,0.15)' }}
            >
              {c.emoji}
            </span>
            <span className="font-display text-xl text-ink">{c.value} 元</span>
          </button>
        ))}
      </div>

      {won && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-display text-3xl text-leaf-deep">
          🎉 正好 {target} 元，你真会凑！
        </motion.p>
      )}
    </div>
  )
}
