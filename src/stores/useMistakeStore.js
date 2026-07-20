// Mistake book: records wrong answers so children can review and re-practice.
// Each mistake stores enough info to reconstruct a practice question.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Max mistakes to keep (prevent unbounded growth).
const MAX_MISTAKES = 500

export const useMistakeStore = create(
  persist(
    (set, get) => ({
      // mistakes: [{ id, moduleId, gameId, gameName, gameEmoji, question, options, correctValue, wrongValue, hint, timestamp, wrongCount }]
      mistakes: [],

      /**
       * Record a wrong answer. If the same question was already wrong,
       * increment its wrongCount instead of adding a duplicate.
       */
      addMistake({ moduleId, gameId, gameName, gameEmoji, question, options, correctValue, wrongValue, hint }) {
        const mistakes = get().mistakes
        // Check for existing same-question mistake (same module+game+question text)
        const existingIdx = mistakes.findIndex(
          (m) => m.moduleId === moduleId && m.gameId === gameId && m.question === question,
        )
        if (existingIdx >= 0) {
          const updated = [...mistakes]
          updated[existingIdx] = {
            ...updated[existingIdx],
            wrongCount: (updated[existingIdx].wrongCount || 1) + 1,
            wrongValue,
            timestamp: Date.now(),
          }
          set({ mistakes: updated })
        } else {
          const entry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            moduleId,
            gameId,
            gameName,
            gameEmoji,
            question,
            options,
            correctValue,
            wrongValue,
            hint: hint || '',
            timestamp: Date.now(),
            wrongCount: 1,
          }
          const merged = [entry, ...mistakes].slice(0, MAX_MISTAKES)
          set({ mistakes: merged })
        }
      },

      /** Mark a mistake as mastered (remove from active list). */
      markMastered(id) {
        set({ mistakes: get().mistakes.filter((m) => m.id !== id) })
      },

      /** Get all mistakes, optionally filtered by module. */
      getMistakes(moduleId) {
        const all = get().mistakes
        if (!moduleId) return all
        return all.filter((m) => m.moduleId === moduleId)
      },

      /** Get mistakes grouped by module for display. */
      getGrouped() {
        const groups = {}
        for (const m of get().mistakes) {
          if (!groups[m.moduleId]) {
            groups[m.moduleId] = { moduleId: m.moduleId, gameName: m.gameName, gameEmoji: m.gameEmoji, items: [] }
          }
          groups[m.moduleId].items.push(m)
        }
        return Object.values(groups).sort((a, b) => b.items.length - a.items.length)
      },

      /**
       * Build practice questions from mistakes for a given module.
       * Returns an array compatible with GameBase/normalizeQuestion format.
       */
      getPracticeQuestions(moduleId, count = 5) {
        const pool = get().mistakes.filter((m) => m.moduleId === moduleId)
        if (pool.length === 0) return []
        // Prioritize most-wrong questions, then shuffle within same count
        const sorted = [...pool].sort((a, b) => (b.wrongCount || 1) - (a.wrongCount || 1))
        const selected = sorted.slice(0, count)
        // Shuffle selected so order isn't always the same
        for (let i = selected.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[selected[i], selected[j]] = [selected[j], selected[i]]
        }
        return selected.map((m) => ({
          question: m.question,
          speakText: m.question,
          hint: m.hint,
          encouragement: '这次一定能做对！',
          options: m.options,
          isCorrect: (opt) => String(opt.value) === String(m.correctValue),
          columns: m.options.length <= 3 ? 3 : m.options.length === 4 ? 4 : 2,
          // Attach mistake id so we can mark mastered on correct answer
          _mistakeId: m.id,
        }))
      },

      /** Total mistake count. */
      totalCount() {
        return get().mistakes.length
      },

      /** Clear all mistakes. */
      clearAll() {
        set({ mistakes: [] })
      },
    }),
    { name: 'childmath-mistakes' },
  ),
)
