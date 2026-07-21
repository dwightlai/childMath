// Loads questions for a game: tries AI generation first, returns null to signal
// callers to fall back to the local generators.

import { generateQuestions, isAiReady } from './ai-service'
import { buildAbilitySummary, difficultyToLevel } from './ability-model'
import { useAbilityStore } from '../stores/useAbilityStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useQuestionBankStore } from '../stores/useQuestionBankStore'
import { getModule } from '../data/config'

// Games that are fully interactive (drag/build/maze) — AI multiple-choice
// questions do not apply to them, so we always use the local implementation.
export const INTERACTIVE_GAMES = new Set(['maze', 'fair-share', 'make-change', 'free-build', 'step-order'])

// Short descriptions of each quiz-style game, used to guide the AI.
const GAME_DESCS = {
  'make-ten': '给出一个数，选出能和它凑成10的数',
  'split-number': '把一个数拆成两部分，已知一部分求另一部分',
  'quick-count': '数一数图中物品的总数',
  'find-friend': '选出两个合起来等于目标数的数字',
  compare: '比较两个数或算式的大小，选 > < =',
  estimate: '不逐个数，估计一堆物品大约有多少',
  'story-theater': '根据一个小故事情境选出正确的算式',
  arrange: '用圆片摆出题目描述的数量关系',
  'more-less': '比较两排物品，判断谁多谁少或多几个',
  detective: '从一段话中找出有用的数学条件',
  'multi-solve': '同一个问题，选出所有正确的解法',
  sequence: '观察数字或图形序列，填出下一个',
  'odd-one-out': '在一组事物中找出不同类的那个',
  designer: '观察规律，选出接下来应该出现的图形',
  'shape-pattern': '观察图形排列规律，预测下一个',
  judge: '判断给出的规律和答案是否正确',
  tangram: '选出能拼出目标图形的七巧板块',
  rotate: '想象图形旋转后的样子，选出正确答案',
  'count-shapes': '数出大图形中包含几个小图形',
  symmetry: '根据对称轴选出图形的另一半',
  'block-count': '数出立体图形用了几个小方块',
  'who-is-who': '根据线索条件匹配人物和物品',
  ordering: '根据条件排出正确的顺序',
  'true-false': '判断哪句话一定正确',
  'little-detective': '根据多条线索找出答案',
  route: '数出从起点到终点的不同路线数量',
  'life-math': '把购物、分东西等生活场景变成正确的算式',
  'split-calc': '把一个加法算式中的数拆分，选出正确的拆分计算方式',
  'make-round': '用凑整的方法计算，选出最简便的算法',
  'multi-method': '同一道计算题，选出另一种正确的算法',
  'tool-box': '根据题目情境选择最合适的解题策略(画图/拆分/列表/倒推)',
  'count-sort': '把一堆物品按类别分类，数出某一类的数量',
  'read-chart': '根据简单的统计图(柱状图)回答问题，如谁最多、相差多少',
  'compare-data': '比较两组数据，判断哪组多或多多少',
  'simple-survey': '根据一个小调查的统计结果回答总数、最多或合计等问题',
  'my-method': '展示一道已解决的简单题，让孩子选出自己用了什么方法(画图/数一数/拆分/猜一猜)',
  'find-mistake': '展示一段含错误的解题步骤，让孩子找出哪一步错了',
}

/**
 * Convert a raw AI question object into the shape GameBase/ChoiceGrid expect.
 */
export function normalizeQuestion(aiQ) {
  const options = (aiQ.options || []).map((o) =>
    typeof o === 'object' && o !== null
      ? { value: o.value, label: o.label ?? String(o.value) }
      : { value: o, label: String(o) },
  )
  const n = options.length
  return {
    question: aiQ.question || '',
    speakText: aiQ.speakText || aiQ.question || '',
    hint: aiQ.hint || '',
    encouragement: aiQ.encouragement || '',
    options,
    isCorrect: (opt) => String(opt.value) === String(aiQ.answer),
    columns: n <= 3 ? 3 : n === 4 ? 4 : 2,
  }
}

/**
 * Attempt to load AI-generated questions for a game.
 * Returns a normalized question array, or null (caller falls back to local).
 */
export async function loadAiQuestions(moduleId, gameId, count) {
  const settings = useSettingsStore.getState()
  if (INTERACTIVE_GAMES.has(gameId)) return null

  const module = getModule(moduleId)
  if (!module) return null
  const game = module.games.find((g) => g.id === gameId)
  if (!game) return null

  // 1) Try live AI generation first (when configured).
  if (isAiReady(settings)) {
    try {
      const ability = useAbilityStore.getState()
      const abilitySummary = buildAbilitySummary(ability.modules, ability.gameStats)
      const adaptiveDiff = ability.getAdaptiveDifficulty(moduleId)
      const difficultyLevel = difficultyToLevel(adaptiveDiff)
      const weakAreas = ability.getWeakGames(moduleId, 2).map((w) => w.gameId)

      const raw = await generateQuestions(
        { apiBaseUrl: settings.apiBaseUrl, apiKey: settings.apiKey, modelName: settings.modelName },
        {
          abilitySummary,
          moduleName: module.name,
          gameName: game.name,
          gameDesc: GAME_DESCS[gameId] || module.desc,
          count,
          difficulty: adaptiveDiff,
          weakAreas,
        },
      )
      if (raw) {
        // Persist the fresh AI questions into the local bank at the current difficulty level.
        useQuestionBankStore.getState().addQuestions(moduleId, gameId, raw, difficultyLevel)
        const normalized = raw
          .map(normalizeQuestion)
          .filter((q) => q.question && q.options.length >= 2)
        if (normalized.length) return normalized
      }
    } catch (err) {
      // AI failed (network error, timeout, bad response) — silently fall through to bank/local.
      console.warn('[question-loader] AI generation failed, falling back:', err?.message || err)
    }
  }

  // 2) Fall back to bank at the manual difficulty setting.
  const level = settings.difficulty || 1
  const banked = useQuestionBankStore.getState().getQuestions(moduleId, gameId, count, level)
  if (banked.length) {
    const normalized = banked
      .map(normalizeQuestion)
      .filter((q) => q.question && q.options.length >= 2)
    if (normalized.length) return normalized
  }

  // 3) Signal the caller to use the algorithmic local generators.
  return null
}
