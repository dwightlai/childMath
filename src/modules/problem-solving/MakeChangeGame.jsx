import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { playClick, playCelebrate, playPop } from '../../utils/audio'

const COINS = [
  { value: 1, label: '1', color: '#BDE0FE' },
  { value: 2, label: '2', color: '#CDEAC0' },
  { value: 5, label: '5', color: '#FFE8A3' },
]

function comboKey(coins) {
  const c = { 1: 0, 2: 0, 5: 0 }
  coins.forEach((x) => { c[x.value] += 1 })
  return `${c[5]}-${c[2]}-${c[1]}`
}

function comboText(key) {
  const [n5, n2, n1] = key.split('-').map(Number)
  const parts = []
  if (n5) parts.push(`${n5} 个 5 元`)
  if (n2) parts.push(`${n2} 个 2 元`)
  if (n1) parts.push(`${n1} 个 1 元`)
  return parts.join(' + ') || '无'
}

function allCombos(target) {
  const out = []
  for (let n5 = 0; n5 * 5 <= target; n5++) {
    for (let n2 = 0; n2 * 2 <= target - n5 * 5; n2++) {
      const n1 = target - n5 * 5 - n2 * 2
      out.push(`${n5}-${n2}-${n1}`)
    }
  }
  return out
}

export default function MakeChangeGame({ difficulty, onFinish }) {
  const target = useMemo(() => (difficulty === 1 ? 6 : difficulty === 2 ? 8 : 10), [difficulty])
  const need = useMemo(() => (difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5), [difficulty])
  const totalWays = useMemo(() => allCombos(target).length, [target])
  const goal = Math.min(need, totalWays)

  const [picked, setPicked] = useState([])
  const [found, setFound] = useState([])
  const [msg, setMsg] = useState('')
  const [done, setDone] = useState(false)

  const sum = picked.reduce((s, c) => s + c.value, 0)
  const over = sum > target

  const clear = () => {
    setPicked([])
    setMsg('')
  }

  const addCoin = (coin) => {
    if (done) return
    playClick()
    const next = [...picked, coin]
    const s = next.reduce((x, c) => x + c.value, 0)
    if (s > target) {
      playPop()
      setPicked(next)
      setMsg('太多啦，点「清空」再试')
      return
    }
    setPicked(next)
    setMsg('')
  }

  const submit = () => {
    if (done || sum !== target) return
    const key = comboKey(picked)
    if (found.includes(key)) {
      playPop()
      setMsg('这种凑法已经找过了，换一种试试')
      setPicked([])
      return
    }
    const nextFound = [...found, key]
    setFound(nextFound)
    setPicked([])
    playCelebrate()
    if (nextFound.length >= goal) {
      setDone(true)
      setMsg(`太棒了！找到 ${goal} 种凑法`)
      setTimeout(() => onFinish && onFinish({ correct: goal, answered: goal, stars: 3 }), 1000)
    } else {
      setMsg(`找到新凑法！还差 ${goal - nextFound.length} 种`)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
      <div className="card-sticker p-5 w-full text-center">
        <p className="font-display text-2xl text-ink mb-1">用 1、2、5 元凑出 {target} 元</p>
        <p className="text-ink-soft text-sm">
          找出 {goal} 种不同凑法（顺序不同算同一种）
        </p>
        <p className="font-display text-lg text-sky-deep mt-2">
          已找到 {found.length} / {goal} 种
        </p>
        <div className="flex items-center justify-center gap-2 my-3 min-h-12 flex-wrap">
          {picked.map((c, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-10 h-10 rounded-full flex items-center justify-center font-display text-lg border-2 border-ink/20"
              style={{ background: c.color }}
            >
              {c.label}
            </motion.span>
          ))}
          {picked.length === 0 && <span className="text-ink-soft">还没选硬币</span>}
        </div>
        <p className={`font-display text-2xl ${over ? 'text-coral-deep' : sum === target ? 'text-leaf-deep' : 'text-ink'}`}>
          现在一共：{sum} 元
        </p>
        {msg && <p className="text-ink-soft mt-2">{msg}</p>}
      </div>

      {found.length > 0 && (
        <div className="w-full rounded-2xl bg-white/80 border-2 border-ink/10 p-3 text-left">
          <p className="text-ink-soft text-sm mb-1">已经找到的凑法：</p>
          {found.map((k, i) => (
            <p key={k} className="text-ink text-sm">✓ {i + 1}. {comboText(k)}</p>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-5">
        {COINS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => addCoin(c)}
            className="flex flex-col items-center gap-1 cursor-pointer transition-transform active:scale-90 hover:scale-110"
          >
            <span
              className="w-20 h-20 rounded-full flex items-center justify-center font-display text-3xl border-4 border-ink/20"
              style={{ background: c.color, boxShadow: '0 5px 0 rgba(0,0,0,0.15)' }}
            >
              {c.label}
            </span>
            <span className="font-display text-xl text-ink">{c.value} 元</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={clear} className="px-5 py-2 rounded-xl bg-cream border-2 border-ink/15 font-display text-ink">
          清空
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={sum !== target || done}
          className="px-5 py-2 rounded-xl bg-sky text-white font-display disabled:opacity-40"
        >
          记下这种凑法
        </button>
      </div>
    </div>
  )
}
