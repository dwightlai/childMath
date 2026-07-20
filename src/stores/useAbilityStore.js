import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  performanceScore,
  updateModuleScore,
  adaptiveDifficulty,
  findWeakGames,
} from '../services/ability-model'

const MAX_QUESTION_LOG = 200
const MAX_HISTORY = 20

const INITIAL_MODULES = [
  'number-sense',
  'quantity-relation',
  'calc-strategy',
  'pattern',
  'spatial',
  'logic',
  'problem-solving',
  'math-expression',
  'data-thinking',
]

const emptyModules = () =>
  INITIAL_MODULES.reduce((acc, id) => {
    acc[id] = { score: 50, history: [] }
    return acc
  }, {})

const emptyDifficulty = () =>
  INITIAL_MODULES.reduce((acc, id) => {
    acc[id] = { numberSize: 1, thinkingSteps: 1, abstraction: 1 }
    return acc
  }, {})

export const useAbilityStore = create(
  persist(
    (set, get) => ({
      // Per-module ability scores (0-100) with history.
      modules: emptyModules(),
      // Per-game fine-grained stats. Key: 'moduleId/gameId'.
      gameStats: {},
      // Rolling per-question log (max 200 entries).
      questionLog: [],
      // Multi-dimensional difficulty per module.
      difficultyProfile: emptyDifficulty(),

      /**
       * Record a single answered question and update the ability model.
       * result: { correct, hintUsed, timeMs }
       */
      recordAnswer: (skill, game, result) => {
        const perf = performanceScore(result)
        const entry = {
          skill,
          game,
          correct: result.correct,
          hintUsed: result.hintUsed,
          timeMs: result.timeMs,
          perf,
          ts: Date.now(),
        }

        set((state) => {
          // --- question log (trim to max) ---
          const questionLog = [...state.questionLog, entry].slice(-MAX_QUESTION_LOG)

          // --- game stats ---
          const gKey = `${skill}/${game}`
          const prev = state.gameStats[gKey] || { answered: 0, correct: 0, avgTimeMs: 0, hintsUsed: 0 }
          const answered = prev.answered + 1
          const avgTimeMs = Math.round((prev.avgTimeMs * prev.answered + result.timeMs) / answered)
          const gameStats = {
            ...state.gameStats,
            [gKey]: {
              answered,
              correct: prev.correct + (result.correct ? 1 : 0),
              avgTimeMs,
              hintsUsed: prev.hintsUsed + (result.hintUsed ? 1 : 0),
              lastUpdated: Date.now(),
            },
          }

          // --- module score (weighted moving average over recent perfs) ---
          const mod = state.modules[skill] || { score: 50, history: [] }
          const recentPerfs = questionLog.filter((q) => q.skill === skill).map((q) => q.perf)
          const score = updateModuleScore(mod.score, recentPerfs)
          const history = [...mod.history, score].slice(-MAX_HISTORY)
          const modules = { ...state.modules, [skill]: { score, history } }

          // --- adaptive difficulty ---
          const totalAnswered = questionLog.filter((q) => q.skill === skill).length
          const difficultyProfile = {
            ...state.difficultyProfile,
            [skill]: adaptiveDifficulty(score, totalAnswered),
          }

          return { questionLog, gameStats, modules, difficultyProfile }
        })
      },

      /** Get the current ability score for a module (default 50). */
      getModuleScore: (moduleId) => get().modules[moduleId]?.score ?? 50,

      /** Get the weakest games within a module. */
      getWeakGames: (moduleId, count = 2) => findWeakGames(get().gameStats, moduleId, count),

      /** Get the multi-dimensional difficulty for a module. */
      getAdaptiveDifficulty: (moduleId) =>
        get().difficultyProfile[moduleId] || { numberSize: 1, thinkingSteps: 1, abstraction: 1 },

      /** Reset the ability model (used by settings reset). */
      resetAbility: () =>
        set({
          modules: emptyModules(),
          gameStats: {},
          questionLog: [],
          difficultyProfile: emptyDifficulty(),
        }),
    }),
    { name: 'childmath-ability' },
  ),
)
