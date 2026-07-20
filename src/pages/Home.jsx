import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MODULES, getModule } from '../data/config'
import { useProgressStore, recommendModule } from '../stores/useProgressStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { playClick } from '../utils/audio'
import { getDailyPlan } from '../services/daily-plan'

const COLOR_BG = {
  sun: 'bg-sun', sky: 'bg-sky', leaf: 'bg-leaf',
  coral: 'bg-coral', grape: 'bg-grape', mint: 'bg-mint',
  peach: 'bg-peach', berry: 'bg-berry', rose: 'bg-rose',
}
const COLOR_DEEP = {
  sun: 'text-sun-deep', sky: 'text-sky-deep', leaf: 'text-leaf-deep',
  coral: 'text-coral-deep', grape: 'text-grape-deep', mint: 'text-mint-deep',
  peach: 'text-peach-deep', berry: 'text-berry-deep', rose: 'text-rose-deep',
}

export default function Home() {
  const navigate = useNavigate()
  const { totalStars, streak, moduleStats } = useProgressStore()
  const difficulty = useSettingsStore((s) => s.difficulty)
  const aiEnabled = useSettingsStore((s) => s.aiEnabled)

  // Today's training plan (AI-generated or local fallback).
  const [plan, setPlan] = useState(null)
  useEffect(() => {
    let cancelled = false
    getDailyPlan().then((p) => {
      if (!cancelled) setPlan(p)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const focusModule = plan ? getModule(plan.focusModule) : null
  const recommended = focusModule || recommendModule(moduleStats)

  const startModule = (moduleId) => {
    playClick()
    navigate(`/session/${moduleId}`)
  }

  return (
    <div className="min-h-full pb-16">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-sun via-sun to-sun-deep px-6 pt-5 pb-12 rounded-b-[2rem]">
        {/* floating decorations */}
        <span className="absolute top-4 right-8 text-3xl animate-float">🎈</span>
        <span className="absolute top-3 right-24 text-2xl animate-float" style={{ animationDelay: '1s' }}>➕</span>
        <span className="absolute bottom-4 left-8 text-2xl animate-float" style={{ animationDelay: '0.5s' }}>✖️</span>

        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.2)]">
              数学小天才
            </h1>
            <p className="text-white/90 font-bold text-sm mt-0.5">今天也要来玩数学游戏哦！</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Link
              to="/gallery"
              onClick={() => playClick()}
              className="btn-chunky bg-white/90 text-ink px-3 py-1.5 text-base"
            >
              📖 图鉴
            </Link>
            <Link
              to="/mistakes"
              onClick={() => playClick()}
              className="btn-chunky bg-white/90 text-ink px-3 py-1.5 text-base"
            >
              📝 错题
            </Link>
            <Link
              to="/progress"
              onClick={() => playClick()}
              className="btn-chunky bg-white/90 text-ink px-3 py-1.5 text-base"
            >
              🌟 成长
            </Link>
            <Link
              to="/settings"
              onClick={() => playClick()}
              className="btn-chunky bg-white/90 text-ink px-3 py-1.5 text-base"
            >
              ⚙️
            </Link>
          </div>
        </div>

        {/* stats strip */}
        <div className="max-w-4xl mx-auto mt-3 flex gap-3">
          <div className="bg-white/95 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-display text-xl text-ink leading-none">{totalStars}</p>
              <p className="text-[10px] text-ink-soft font-bold">总星星</p>
            </div>
          </div>
          <div className="bg-white/95 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-display text-xl text-ink leading-none">{streak}</p>
              <p className="text-[10px] text-ink-soft font-bold">连续天数</p>
            </div>
          </div>
        </div>
      </header>

      {/* Recommended card - overlaps header */}
      <div className="max-w-4xl mx-auto px-6 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-sticker p-4 flex items-center gap-3"
        >
          <span className="text-4xl animate-wiggle inline-block">{recommended.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-ink-soft font-bold text-xs flex items-center gap-1.5">
              今日推荐
              {plan && !plan.isLocal && (
                <span className="inline-flex items-center gap-0.5 bg-grape/15 text-grape-deep rounded-full px-2 py-0.5 text-xs">
                  🤖 AI 计划
                </span>
              )}
            </p>
            <p className="font-display text-xl text-ink">{recommended.name}</p>
            <p className="text-ink-soft text-xs">
              {plan ? `今天是${plan.weekday}，重点训练：${recommended.shortName}` : recommended.desc}
            </p>
            {plan?.reason && <p className="text-ink-soft/70 text-xs mt-0.5">{plan.reason}</p>}
          </div>
          <button
            type="button"
            onClick={() => startModule(recommended.id)}
            className={`btn-chunky ${COLOR_BG[recommended.color]} text-white text-lg px-5 py-2.5`}
          >
            出发 ➜
          </button>
        </motion.div>
      </div>

      {/* Module map */}
      <main className="max-w-4xl mx-auto px-6 mt-6">
        <h2 className="font-display text-2xl text-ink mb-1">选一个小岛去探险吧！</h2>
        <p className="text-ink-soft text-sm mb-4">每个小岛都有好玩的数学游戏</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m, i) => {
            const stars = moduleStats[m.id]?.stars || 0
            return (
              <motion.button
                key={m.id}
                type="button"
                onClick={() => startModule(m.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="card-sticker p-4 text-left relative overflow-hidden group cursor-pointer"
              >
                {/* colored corner blob */}
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${COLOR_BG[m.color]} opacity-20 group-hover:opacity-40 transition-opacity`} />
                <div className="flex items-start gap-3 relative">
                  <span className={`text-4xl inline-block group-hover:animate-wiggle`}>{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-display text-xl ${COLOR_DEEP[m.color]}`}>{m.name}</h3>
                      <span className="text-[10px] font-bold text-white bg-ink/15 rounded-full px-1.5 py-0.5">
                        {m.games.length}游戏
                      </span>
                    </div>
                    <p className="text-ink-soft text-xs mt-0.5 truncate">{m.desc}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm">⭐</span>
                      <span className="font-display text-lg text-ink">{stars}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
