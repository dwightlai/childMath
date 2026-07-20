import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMistakeStore } from '../stores/useMistakeStore'
import { MODULES } from '../data/config'
import { playClick } from '../utils/audio'
import GameBase from '../components/GameBase'

const MODULE_MAP = Object.fromEntries(MODULES.map((m) => [m.id, m]))

export default function Mistakes() {
  const navigate = useNavigate()
  const mistakes = useMistakeStore((s) => s.mistakes)
  const clearAll = useMistakeStore((s) => s.clearAll)
  const markMastered = useMistakeStore((s) => s.markMastered)
  const getPracticeQuestions = useMistakeStore((s) => s.getPracticeQuestions)

  const [practicing, setPracticing] = useState(null) // moduleId when in practice mode
  const [practiceQuestions, setPracticeQuestions] = useState([])
  const [filterModule, setFilterModule] = useState(null)

  const grouped = useMemo(() => {
    const groups = {}
    const pool = filterModule ? mistakes.filter((m) => m.moduleId === filterModule) : mistakes
    for (const m of pool) {
      if (!groups[m.moduleId]) {
        const mod = MODULE_MAP[m.moduleId]
        groups[m.moduleId] = {
          moduleId: m.moduleId,
          name: mod?.name || m.gameName,
          emoji: mod?.emoji || m.gameEmoji,
          color: mod?.color || 'sun',
          items: [],
        }
      }
      groups[m.moduleId].items.push(m)
    }
    return Object.values(groups).sort((a, b) => b.items.length - a.items.length)
  }, [mistakes, filterModule])

  const startPractice = (moduleId) => {
    const qs = getPracticeQuestions(moduleId, 5)
    if (qs.length === 0) return
    setPracticeQuestions(qs)
    setPracticing(moduleId)
    playClick()
  }

  const handlePracticeFinish = () => {
    setPracticing(null)
    setPracticeQuestions([])
  }

  // Practice mode
  if (practicing) {
    const mod = MODULE_MAP[practicing]
    return (
      <div className="min-h-full px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => { playClick(); handlePracticeFinish() }}
              className="btn-chunky bg-white text-ink px-4 py-2 text-base"
            >
              ← 回错题集
            </button>
            <div className="flex items-center gap-2 bg-rose/10 rounded-2xl px-4 py-2">
              <span className="text-xl">📝</span>
              <span className="font-display text-lg text-rose-deep">错题练习</span>
            </div>
            <div className="w-20" />
          </div>

          <GameBase
            questions={practiceQuestions}
            color={mod?.color || 'coral'}
            gameName={`${mod?.name || ''} 错题复习`}
            gameEmoji="📝"
            moduleId={practicing}
            gameId="mistake-practice"
            renderBody={(q, helpers) => (
              <ChoiceGridForPractice q={q} helpers={helpers} />
            )}
            onFinish={handlePracticeFinish}
          />
        </div>
      </div>
    )
  }

  // Empty state
  if (mistakes.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <span className="text-7xl mb-4">🎉</span>
        <h2 className="font-display text-3xl text-ink mb-2">太棒了！</h2>
        <p className="text-ink-soft text-lg text-center">目前没有错题记录，继续保持！</p>
        <Link
          to="/"
          onClick={() => playClick()}
          className="btn-chunky bg-sun text-white mt-6 px-6 py-3 text-lg"
        >
          回去玩游戏 🎮
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-full px-4 sm:px-6 py-6 pb-20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => { playClick(); navigate('/') }}
            className="btn-chunky bg-white text-ink px-4 py-2 text-base"
          >
            ← 首页
          </button>
          <h1 className="font-display text-2xl text-ink">📝 错题集</h1>
          <button
            type="button"
            onClick={() => { if (confirm('确定清空所有错题？')) clearAll() }}
            className="text-xs text-ink-soft underline"
          >
            清空
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center justify-between">
          <div className="text-center">
            <p className="font-display text-3xl text-rose-deep">{mistakes.length}</p>
            <p className="text-xs text-ink-soft">总错题</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl text-sun-deep">
              {mistakes.filter((m) => (m.wrongCount || 1) >= 3).length}
            </p>
            <p className="text-xs text-ink-soft">需重点复习</p>
          </div>
          <div className="text-center">
            <p className="font-display text-3xl text-leaf-deep">{grouped.length}</p>
            <p className="text-xs text-ink-soft">涉及模块</p>
          </div>
        </div>

        {/* Module filter */}
        {grouped.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <button
              type="button"
              onClick={() => setFilterModule(null)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                !filterModule ? 'bg-ink text-white' : 'bg-white text-ink-soft border border-ink/10'
              }`}
            >
              全部
            </button>
            {grouped.map((g) => (
              <button
                key={g.moduleId}
                type="button"
                onClick={() => setFilterModule(g.moduleId)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                  filterModule === g.moduleId ? 'bg-ink text-white' : 'bg-white text-ink-soft border border-ink/10'
                }`}
              >
                {g.emoji} {g.name}
              </button>
            ))}
          </div>
        )}

        {/* Grouped mistake list */}
        <div className="flex flex-col gap-4">
          {grouped.map((group) => (
            <motion.div
              key={group.moduleId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-sticker p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{group.emoji}</span>
                  <span className="font-display text-lg text-ink">{group.name}</span>
                  <span className="text-xs bg-rose/10 text-rose-deep font-bold px-2 py-0.5 rounded-full">
                    {group.items.length} 题
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => startPractice(group.moduleId)}
                  className="btn-chunky bg-leaf text-white px-4 py-1.5 text-sm"
                >
                  练一练 💪
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {group.items.slice(0, 8).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-3 bg-cream/50 rounded-xl p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink font-medium truncate">{m.question}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-leaf-deep">✓ {String(m.correctValue)}</span>
                        <span className="text-xs text-rose-deep">✗ {String(m.wrongValue)}</span>
                        {(m.wrongCount || 1) > 1 && (
                          <span className="text-xs text-sun-deep font-bold">
                            错了 {m.wrongCount} 次
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => markMastered(m.id)}
                      className="shrink-0 text-xs text-ink-soft hover:text-leaf-deep transition-colors"
                      title="已掌握，移除"
                    >
                      ✅
                    </button>
                  </div>
                ))}
                {group.items.length > 8 && (
                  <p className="text-xs text-ink-soft text-center">
                    还有 {group.items.length - 8} 题...
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Inline ChoiceGrid for practice mode (avoids circular imports)
import ChoiceGrid from '../components/ChoiceGrid'

function ChoiceGridForPractice({ q, helpers }) {
  return (
    <ChoiceGrid
      options={q.options}
      helpers={helpers}
      isCorrect={q.isCorrect}
      columns={q.columns || 2}
    />
  )
}
