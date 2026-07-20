import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { playClick, playCelebrate, playPop } from '../../utils/audio'

// FairShareGame: split candies equally between two friends.
// Tap a friend to give them the next candy. Finish when all are shared equally.
export default function FairShareGame({ difficulty, questionCount, onFinish }) {
  const total = useMemo(() => (difficulty === 1 ? 6 : difficulty === 2 ? 8 : 10), [difficulty])
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)
  const [won, setWon] = useState(false)

  const remaining = total - a - b
  const give = (who) => {
    if (won || remaining <= 0) return
    playClick()
    const na = who === 'a' ? a + 1 : a
    const nb = who === 'b' ? b + 1 : b
    setA(na)
    setB(nb)
    if (na + nb === total) {
      if (na === nb) {
        setWon(true)
        playCelebrate()
        setTimeout(() => onFinish && onFinish({ correct: 1, answered: 1, stars: 3 }), 900)
      } else {
        playPop()
        // reset after a moment
        setTimeout(() => { setA(0); setB(0) }, 1000)
      }
    }
  }

  const uneven = a + b === total && a !== b

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-5">
      <div className="card-sticker p-5 w-full text-center">
        <p className="font-display text-2xl text-ink mb-1">把 {total} 颗糖 🍬 公平地分给两个好朋友</p>
        <p className="text-ink-soft">点一点下面的小朋友，把糖分给他们，要一样多哦！</p>
        <div className="flex justify-center gap-1 my-3 flex-wrap">
          {Array.from({ length: remaining }).map((_, i) => (
            <span key={i} className="text-3xl">🍬</span>
          ))}
          {remaining === 0 && <span className="text-ink-soft text-lg">糖分完啦！</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full">
        {[{ id: 'a', name: '小熊', emoji: '🐻', count: a }, { id: 'b', name: '小兔', emoji: '🐰', count: b }].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => give(p.id)}
            className="card-sticker p-5 flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 hover:-translate-y-1"
          >
            <span className="text-6xl">{p.emoji}</span>
            <span className="font-display text-xl text-ink">{p.name}</span>
            <div className="flex flex-wrap justify-center gap-1 min-h-9">
              {Array.from({ length: p.count }).map((_, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl">🍬</motion.span>
              ))}
            </div>
            <span className="text-ink-soft">{p.count} 颗</span>
          </button>
        ))}
      </div>

      {uneven && (
        <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="font-display text-xl text-sun-deep">
          🤔 不一样多，再试一次吧！
        </motion.p>
      )}
      {won && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-display text-3xl text-leaf-deep">
          🎉 分得真公平！
        </motion.p>
      )}
    </div>
  )
}
