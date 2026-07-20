// Ability model algorithms: scoring, adaptive difficulty, weak-area detection.

import { clamp } from '../utils/helpers'

/**
 * Compute a single-attempt performance score (0-100).
 * correct + no hint + fast  -> 100
 * correct + no hint + slow  -> 85
 * correct + hint used       -> 70
 * wrong + hint used         -> 30
 * wrong + no hint           -> 10
 */
export function performanceScore({ correct, hintUsed, timeMs }) {
  if (correct) {
    if (hintUsed) return 70
    return timeMs < 15000 ? 100 : 85
  }
  return hintUsed ? 30 : 10
}

/**
 * Update a module score using weighted moving average.
 * Recent 10 answers carry 80% weight; the prior score carries 20%.
 */
export function updateModuleScore(oldScore, recentPerformances) {
  if (!recentPerformances.length) return oldScore
  const recent = recentPerformances.slice(-10)
  const recentAvg = recent.reduce((sum, p) => sum + p, 0) / recent.length
  const next = oldScore * 0.2 + recentAvg * 0.8
  return Math.round(clamp(next, 0, 100))
}

/**
 * Map an ability score to multi-dimensional difficulty parameters.
 * Cold start (fewer than 5 recorded answers) always yields level 1.
 */
export function adaptiveDifficulty(score, totalAnswered) {
  if (totalAnswered < 5) {
    return { numberSize: 1, thinkingSteps: 1, abstraction: 1 }
  }
  if (score < 40) return { numberSize: 1, thinkingSteps: 1, abstraction: 1 }
  if (score < 60) return { numberSize: 2, thinkingSteps: 1, abstraction: 1 }
  if (score <= 75) return { numberSize: 2, thinkingSteps: 2, abstraction: 2 }
  return { numberSize: 3, thinkingSteps: 2, abstraction: 3 }
}

/**
 * Collapse multi-dimensional difficulty into the legacy 1-3 integer
 * used by the local generators.
 */
export function difficultyToLevel({ numberSize, thinkingSteps, abstraction }) {
  const avg = (numberSize + thinkingSteps + abstraction) / 3
  if (avg <= 1.34) return 1
  if (avg <= 2.34) return 2
  return 3
}

/**
 * Find the weakest games within a module (lowest accuracy, min 3 answers).
 * Returns an array of { gameId, accuracy, answered }.
 */
export function findWeakGames(gameStats, moduleId, count = 2) {
  const entries = Object.entries(gameStats)
    .filter(([key, s]) => key.startsWith(`${moduleId}/`) && s.answered >= 3)
    .map(([key, s]) => ({
      gameId: key.split('/')[1],
      accuracy: s.correct / s.answered,
      answered: s.answered,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
  return entries.slice(0, count)
}

/**
 * Build a compact ability-profile summary for AI prompts.
 */
export function buildAbilitySummary(modules, gameStats) {
  const lines = Object.entries(modules).map(([id, m]) => {
    const weak = findWeakGames(gameStats, id, 2)
    const weakText = weak.length ? `（薄弱：${weak.map((w) => w.gameId).join('、')}）` : ''
    return `- ${id}: ${m.score}分${weakText}`
  })
  return lines.join('\n')
}
