// Daily training plan: AI-generated when available, local fallback otherwise.
// Cached per day in localStorage so the API is hit at most once per day.

import { generateDailyPlan, isAiReady } from './ai-service'
import { buildAbilitySummary } from './ability-model'
import { useAbilityStore } from '../stores/useAbilityStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { MODULES, getModule } from '../data/config'
import { pick } from '../utils/helpers'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const CACHE_PREFIX = 'childmath-daily-plan-'

// Weekday rotation: which ability to focus on each day (JS getDay(): 0=Sun ... 6=Sat).
// Weekends (0, 6) fall back to the weakest module (free choice + reinforcement).
const WEEKDAY_FOCUS = {
  1: 'quantity-relation', // 周一 数量关系
  2: 'spatial',           // 周二 空间思维
  3: 'pattern',           // 周三 规律发现
  4: 'logic',             // 周四 逻辑推理
  5: 'calc-strategy',     // 周五 运算策略
}

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Find the weakest module by ability score. */
function findWeakest(ability) {
  let weakest = MODULES[0]
  let lowest = Infinity
  for (const m of MODULES) {
    const score = ability.modules[m.id]?.score ?? 50
    if (score < lowest) {
      lowest = score
      weakest = m
    }
  }
  return weakest
}

/** Build a plan locally: weekday rotation on Mon-Fri, weakest module on weekends. */
function buildLocalPlan() {
  const ability = useAbilityStore.getState()
  const day = new Date().getDay()
  const weekdayName = WEEKDAYS[day]

  let focus
  let reason
  if (WEEKDAY_FOCUS[day] && getModule(WEEKDAY_FOCUS[day])) {
    focus = getModule(WEEKDAY_FOCUS[day])
    reason = `${weekdayName}的重点训练是${focus.name}`
  } else {
    focus = findWeakest(ability)
    reason = `${focus.name}是目前最需要加强的能力，周末好好练一练`
  }

  const warmupGame = pick(getModule('number-sense').games)
  const coreGame = pick(focus.games)
  return {
    focusModule: focus.id,
    reason,
    focus: `今天重点练一练${focus.shortName}`,
    weekday: weekdayName,
    warmup: { module: 'number-sense', game: warmupGame.id },
    core: { module: focus.id, game: coreGame.id },
    challenge: { module: focus.id, game: pick(focus.games).id },
    isLocal: true,
  }
}

/** Ensure the AI plan references real modules/games; repair or reject. */
function validatePlan(plan) {
  if (!plan || !plan.focusModule) return null
  const focus = getModule(plan.focusModule)
  if (!focus) return null
  // Sanitize each phase's module/game reference.
  const fix = (phase, fallbackModule) => {
    const mod = getModule(phase?.module) || fallbackModule
    const game = mod.games.find((g) => g.id === phase?.game) || pick(mod.games)
    return { module: mod.id, game: game.id }
  }
  return {
    focusModule: focus.id,
    reason: plan.reason || `今天重点训练${focus.name}`,
    focus: plan.focus || `今天重点练一练${focus.shortName}`,
    weekday: WEEKDAYS[new Date().getDay()],
    warmup: fix(plan.warmup, getModule('number-sense')),
    core: fix(plan.core, focus),
    challenge: fix(plan.challenge, focus),
    isLocal: false,
  }
}

/** Remove daily-plan cache entries older than 7 days. */
function cleanOldPlans() {
  try {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(CACHE_PREFIX)) continue
      const dateStr = key.slice(CACHE_PREFIX.length)
      const ts = new Date(dateStr).getTime()
      if (Number.isNaN(ts) || ts < cutoff) localStorage.removeItem(key)
    }
  } catch {
    /* ignore */
  }
}

/**
 * Get today's training plan. Uses the day cache, tries AI, falls back to local.
 */
export async function getDailyPlan() {
  const key = CACHE_PREFIX + todayKey()

  // 1. cache hit
  try {
    const cached = localStorage.getItem(key)
    if (cached) return JSON.parse(cached)
  } catch {
    /* fall through */
  }

  // 2. try AI
  let plan = null
  const settings = useSettingsStore.getState()
  if (isAiReady(settings)) {
    const ability = useAbilityStore.getState()
    const abilitySummary = buildAbilitySummary(ability.modules, ability.gameStats)
    const weekdayName = WEEKDAYS[new Date().getDay()]
    const raw = await generateDailyPlan(
      { apiBaseUrl: settings.apiBaseUrl, apiKey: settings.apiKey, modelName: settings.modelName },
      { abilitySummary, moduleList: MODULES, weekdayName },
    )
    plan = validatePlan(raw)
  }

  // 3. local fallback
  if (!plan) plan = buildLocalPlan()

  // 4. cache + cleanup
  try {
    localStorage.setItem(key, JSON.stringify(plan))
  } catch {
    /* ignore */
  }
  cleanOldPlans()
  return plan
}
