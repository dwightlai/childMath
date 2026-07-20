import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MODULES } from '../data/config'

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const emptyModuleStats = () =>
  MODULES.reduce((acc, m) => {
    acc[m.id] = { stars: 0, answered: 0, correct: 0, sessions: 0 }
    return acc
  }, {})

export const useProgressStore = create(
  persist(
    (set, get) => ({
      totalStars: 0,
      badges: [],            // [{id, name, emoji, date}]
      dailyLog: {},          // { 'YYYY-MM-DD': { stars, sessions } }
      moduleStats: emptyModuleStats(),
      streak: 0,
      lastPlayDate: null,

      // Record a completed session for a module
      recordSession: (moduleId, earnedStars, stats) => {
        const key = todayKey()
        set((state) => {
          const dailyLog = { ...state.dailyLog }
          const day = dailyLog[key] || { stars: 0, sessions: 0 }
          dailyLog[key] = { stars: day.stars + earnedStars, sessions: day.sessions + 1 }

          const moduleStats = { ...state.moduleStats }
          const ms = moduleStats[moduleId] || { stars: 0, answered: 0, correct: 0, sessions: 0 }
          moduleStats[moduleId] = {
            stars: ms.stars + earnedStars,
            answered: ms.answered + (stats?.answered || 0),
            correct: ms.correct + (stats?.correct || 0),
            sessions: ms.sessions + 1,
          }

          // streak calculation
          let streak = state.streak
          if (state.lastPlayDate !== key) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
            streak = state.lastPlayDate === yKey ? state.streak + 1 : 1
          }

          return {
            totalStars: state.totalStars + earnedStars,
            dailyLog,
            moduleStats,
            streak,
            lastPlayDate: key,
          }
        })
      },

      addBadge: (badge) =>
        set((state) => {
          if (state.badges.some((b) => b.id === badge.id)) return state
          return { badges: [...state.badges, { ...badge, date: todayKey() }] }
        }),

      resetAll: () =>
        set({
          totalStars: 0,
          badges: [],
          dailyLog: {},
          moduleStats: emptyModuleStats(),
          streak: 0,
          lastPlayDate: null,
        }),
    }),
    { name: 'childmath-progress' },
  ),
)

// Helper: recommend the weakest module (lowest stars relative to weight)
export const recommendModule = (moduleStats) => {
  let best = MODULES[0]
  let bestScore = Infinity
  for (const m of MODULES) {
    const s = moduleStats[m.id] || { stars: 0 }
    const score = s.stars / m.weight
    if (score < bestScore) {
      bestScore = score
      best = m
    }
  }
  return best
}
