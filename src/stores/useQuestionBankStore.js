// Local question bank: persists AI-generated questions so they can be reused
// later (e.g. when the AI is unavailable), building up a personal library.
//
// Storage structure (v2 — per-difficulty buckets):
//   bank: { 'moduleId/gameId': { 1: [...], 2: [...], 3: [...] } }
//
// We store the *raw* AI question objects (plain JSON with an `answer` field)
// rather than the runtime shape, because the runtime shape contains an
// `isCorrect` function which cannot be serialized to localStorage. Callers
// re-hydrate stored items via `normalizeQuestion` from question-loader.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shuffle } from '../utils/helpers'

// Cap per game per difficulty level.
const MAX_PER_BUCKET = 100

export const useQuestionBankStore = create(
  persist(
    (set, get) => ({
      // bank: { 'moduleId/gameId': { 1: [rawQ,...], 2: [...], 3: [...] } }
      bank: {},

      /**
       * Add raw AI question objects for a game at a given difficulty level.
       * Deduplicates by question text and keeps at most MAX_PER_BUCKET entries.
       */
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

      /**
       * Return up to `count` stored raw questions for a game at the given
       * difficulty level, shuffled. Returns [] if not enough questions.
       */
      getQuestions(moduleId, gameId, count, difficultyLevel = 1) {
        const key = `${moduleId}/${gameId}`
        const lvl = Number(difficultyLevel) || 1
        const gameBuckets = get().bank[key]
        if (!gameBuckets) return []
        const all = gameBuckets[lvl] || []
        if (all.length < count) return []
        return shuffle(all).slice(0, count)
      },

      /** Total number of stored questions across all games and levels. */
      totalCount() {
        let total = 0
        for (const gameBuckets of Object.values(get().bank)) {
          for (const arr of Object.values(gameBuckets)) {
            total += arr.length
          }
        }
        return total
      },

      /** Count per difficulty level: { 1: n, 2: n, 3: n } */
      countByLevel() {
        const counts = { 1: 0, 2: 0, 3: 0 }
        for (const gameBuckets of Object.values(get().bank)) {
          for (const [lvl, arr] of Object.entries(gameBuckets)) {
            counts[lvl] = (counts[lvl] || 0) + arr.length
          }
        }
        return counts
      },

      /** Empty the whole bank. */
      clearBank() {
        set({ bank: {} })
      },

      /**
       * Bulk import: merge a pre-built bank object (same structure as internal).
       * Used by the batch-fill script output.
       */
      importBank(importedBank) {
        if (!importedBank || typeof importedBank !== 'object') return
        const current = get().bank
        const merged = { ...current }
        for (const [key, buckets] of Object.entries(importedBank)) {
          if (!merged[key]) {
            merged[key] = buckets
          } else {
            // Merge per level with dedup
            const existing = merged[key]
            for (const [lvl, arr] of Object.entries(buckets)) {
              const prev = existing[lvl] || []
              const seen = new Set(prev.map((q) => (q.question || '').trim()))
              const fresh = arr.filter((q) => q && q.question && !seen.has((q.question || '').trim()))
              existing[lvl] = [...fresh, ...prev].slice(0, MAX_PER_BUCKET)
            }
          }
        }
        set({ bank: merged })
      },
    }),
    {
      name: 'childmath-question-bank',
      // Migrate v1 flat-array format to v2 bucketed format on load.
      migrate: (persisted) => {
        const bank = persisted?.bank
        if (!bank || typeof bank !== 'object') return persisted
        // Detect v1: values are arrays (not objects with numeric keys)
        const firstVal = Object.values(bank)[0]
        if (Array.isArray(firstVal)) {
          // v1 → v2: move all existing questions into level 1 bucket
          const migrated = {}
          for (const [key, arr] of Object.entries(bank)) {
            migrated[key] = { 1: arr.slice(0, MAX_PER_BUCKET) }
          }
          return { ...persisted, bank: migrated }
        }
        return persisted
      },
    },
  ),
)
