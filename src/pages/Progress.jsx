import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MODULES } from '../data/config'
import { useProgressStore } from '../stores/useProgressStore'
import { playClick } from '../utils/audio'

const COLOR_HEX = {
  sun: '#FFB703', sky: '#4CC9F0', leaf: '#80B918',
  coral: '#FF6B6B', grape: '#B388EB', mint: '#2EC4B6',
  peach: '#FF9F1C', berry: '#F15BB5', rose: '#EF476F',
}

// N-axis radar chart built with SVG (one axis per module).
function RadarChart({ moduleStats }) {
  const size = 300
  const cx = size / 2
  const cy = size / 2
  const radius = 100
  const n = MODULES.length

  // Normalize each module's stars to 0-1 (cap at 30 for full).
  const values = MODULES.map((m) => Math.min(1, (moduleStats[m.id]?.stars || 0) / 30))

  const point = (i, scale) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return [cx + Math.cos(angle) * radius * scale, cy + Math.sin(angle) * radius * scale]
  }

  const polyPoints = values.map((v, i) => point(i, Math.max(0.08, v)).join(',')).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* grid rings */}
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon
          key={r}
          points={MODULES.map((_, i) => point(i, r).join(',')).join(' ')}
          fill="none"
          stroke="#e8ddc7"
          strokeWidth="1.5"
        />
      ))}
      {/* axes + labels */}
      {MODULES.map((m, i) => {
        const [x, y] = point(i, 1)
        const [lx, ly] = point(i, 1.32)
        return (
          <g key={m.id}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#e8ddc7" strokeWidth="1.5" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold" fill="#3D405B">
              {m.emoji}{m.shortName}
            </text>
          </g>
        )
      })}
      {/* data polygon */}
      <polygon points={polyPoints} fill="rgba(255,183,3,0.35)" stroke="#FB8500" strokeWidth="2.5" strokeLinejoin="round" />
      {/* data points */}
      {values.map((v, i) => {
        const [x, y] = point(i, Math.max(0.08, v))
        return <circle key={i} cx={x} cy={y} r="4" fill="#FB8500" />
      })}
    </svg>
  )
}

// Current-month calendar with trained days highlighted.
function Calendar({ dailyLog }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = now.getDate()

  const keyFor = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-ink-soft mb-1">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />
          const trained = dailyLog[keyFor(d)]
          const isToday = d === today
          return (
            <div
              key={d}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold relative ${
                trained ? 'bg-sun text-white' : 'bg-white text-ink border border-ink/10'
              } ${isToday ? 'ring-2 ring-coral' : ''}`}
            >
              {d}
              {trained && <span className="absolute -top-1 -right-1 text-xs">⭐</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Progress() {
  const { totalStars, streak, badges, dailyLog, moduleStats } = useProgressStore()
  const trainedDays = Object.keys(dailyLog).length

  return (
    <div className="min-h-full pb-16">
      <header className="bg-gradient-to-br from-sky to-sky-deep px-6 pt-5 pb-12 rounded-b-[2rem] relative overflow-hidden">
        <span className="absolute top-4 right-8 text-3xl animate-float">🌈</span>
        <span className="absolute bottom-4 left-8 text-2xl animate-float" style={{ animationDelay: '1s' }}>📈</span>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.2)]">成长记录</h1>
            <p className="text-white/90 font-bold text-sm mt-0.5">看看你有多棒！</p>
          </div>
          <Link to="/" onClick={() => playClick()} className="btn-chunky bg-white/90 text-ink px-3 py-1.5 text-base">
            ← 回首页
          </Link>
        </div>
        <div className="max-w-4xl mx-auto mt-3 flex gap-3 flex-wrap">
          {[
            { emoji: '⭐', num: totalStars, label: '总星星' },
            { emoji: '🔥', num: streak, label: '连续天数' },
            { emoji: '📅', num: trainedDays, label: '训练天数' },
            { emoji: '🏅', num: badges.length, label: '徽章' },
          ].map((s) => (
            <div key={s.label} className="bg-white/95 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="font-display text-xl text-ink leading-none">{s.num}</p>
                <p className="text-[10px] text-ink-soft font-bold">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-sticker p-5">
          <h2 className="font-display text-2xl text-ink mb-2">🧠 能力雷达图</h2>
          <div className="flex justify-center">
            <RadarChart moduleStats={moduleStats} />
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-sticker p-5">
          <h2 className="font-display text-2xl text-ink mb-3">📅 训练日历</h2>
          <Calendar dailyLog={dailyLog} />
        </motion.div>

        {/* Badge wall */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-sticker p-5 md:col-span-2">
          <h2 className="font-display text-2xl text-ink mb-3">🏅 徽章墙</h2>
          {badges.length === 0 ? (
            <p className="text-ink-soft text-center py-6">还没有徽章，快去完成一次训练吧！🚀</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {badges.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring' }}
                  className="flex flex-col items-center gap-1 bg-sun/10 border-2 border-sun/40 rounded-2xl px-5 py-3"
                >
                  <span className="text-4xl">{b.emoji}</span>
                  <span className="font-bold text-ink text-sm">{b.name}</span>
                  <span className="text-xs text-ink-soft">{b.date}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Per-module stars */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-sticker p-5 md:col-span-2">
          <h2 className="font-display text-2xl text-ink mb-3">🗺️ 各小岛进度</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODULES.map((m) => {
              const s = moduleStats[m.id] || { stars: 0, correct: 0, answered: 0 }
              const acc = s.answered > 0 ? Math.round((s.correct / s.answered) * 100) : 0
              return (
                <div key={m.id} className="flex items-center gap-3 bg-cream rounded-2xl px-4 py-3 border border-ink/10">
                  <span className="text-3xl">{m.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-ink" style={{ color: COLOR_HEX[m.color] }}>{m.name}</p>
                    <p className="text-xs text-ink-soft">⭐ {s.stars} 颗 · 正确率 {acc}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
