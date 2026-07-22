import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shuffle } from '../utils/helpers'
import { persistStorage } from '../db/persistStorage'

const MAX_PER_BUCKET = 250

export const useQuestionBankStore = create(
  persist(
    (set, get) => ({
      bank: {},
      bankVersion: 0,

      addQuestions(moduleId, gameId, rawQuestions, difficultyLevel = 1) {
        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) return
        const key = `${moduleId}/${gameId}`
        const lvl = Number(difficultyLevel) || 1
        const gameBuckets = get().bank[key] || {}
        const existing = gameBuckets[lvl] || []
        const seen = new Set(existing.map((q) => (q.question || '').trim()))
        const fresh = rawQuestions.filter(
          (q) => q && q.question && !seen.has((q.question || '').trim()),
        )
        if (fresh.length === 0) return
        const merged = [...fresh, ...existing].slice(0, MAX_PER_BUCKET)
        const updatedBuckets = { ...gameBuckets, [lvl]: merged }
        set((state) => ({ bank: { ...state.bank, [key]: updatedBuckets } }))
      },

      getQuestions(moduleId, gameId, count, difficultyLevel = 1) {
        const key = `${moduleId}/${gameId}`
        const lvl = Number(difficultyLevel) || 1
        const gameBuckets = get().bank[key]
        if (!gameBuckets) return []
        const all = gameBuckets[lvl] || []
        const seen = new Set()
        const unique = []
        for (const q of shuffle(all)) {
          const t = (q.question || '').trim()
          if (!t || seen.has(t)) continue
          seen.add(t)
          unique.push(q)
          if (unique.length >= count) break
        }
        if (unique.length < count) return []
        return unique
      },

      totalCount() {
        let total = 0
        for (const gameBuckets of Object.values(get().bank)) {
          for (const arr of Object.values(gameBuckets)) {
            total += arr.length
          }
        }
        return total
      },

      countByLevel() {
        const counts = { 1: 0, 2: 0, 3: 0 }
        for (const gameBuckets of Object.values(get().bank)) {
          for (const [lvl, arr] of Object.entries(gameBuckets)) {
            counts[lvl] = (counts[lvl] || 0) + arr.length
          }
        }
        return counts
      },

      clearBank() {
        set({ bank: {}, bankVersion: 0 })
      },

      importBank(importedBank, version = 0) {
        if (!importedBank || typeof importedBank !== 'object') return
        const ver = Number(version) || 0
        if (ver > 0 && ver > (get().bankVersion || 0)) {
          set({ bank: importedBank, bankVersion: ver })
          return
        }
        const current = get().bank
        const merged = { ...current }
        for (const [key, buckets] of Object.entries(importedBank)) {
          if (!merged[key]) {
            merged[key] = buckets
          } else {
            const existing = merged[key]
            for (const [lvl, arr] of Object.entries(buckets)) {
              const prev = existing[lvl] || []
              const seen = new Set(prev.map((q) => (q.question || '').trim()))
              const fresh = arr.filter((q) => q && q.question && !seen.has((q.question || '').trim()))
              existing[lvl] = [...fresh, ...prev].slice(0, MAX_PER_BUCKET)
            }
          }
        }
        set({ bank: merged, bankVersion: Math.max(get().bankVersion || 0, ver) })
      },
    }),
    {
      name: 'childmath-question-bank',
      storage: persistStorage,
      migrate: (persisted) => {
        const bank = persisted?.bank
        if (!bank || typeof bank !== 'object') return persisted
        const firstVal = Object.values(bank)[0]
        if (Array.isArray(firstVal)) {
          const migrated = {}
          for (const [key, arr] of Object.entries(bank)) {
            migrated[key] = { 1: arr.slice(0, MAX_PER_BUCKET) }
          }
          return { ...persisted, bank: migrated, bankVersion: persisted.bankVersion || 0 }
        }
        return persisted
      },
    },
  ),
)
