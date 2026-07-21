import { generateDailyPlan, isAiReady } from './ai-service'
import { buildAbilitySummary } from './ability-model'
import { useAbilityStore } from '../stores/useAbilityStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { MODULES, getModule } from '../data/config'
import { pick } from '../utils/helpers'
import { idbGetJson, idbSetJson, idbRemove, idbListKeys } from '../db/idb'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const CACHE_PREFIX = 'childmath-daily-plan-'

const WEEKDAY_FOCUS = {
  1: 'quantity-relation',
  2: 'spatial',
  3: 'pattern',
  4: 'logic',
  5: 'calc-strategy',
}

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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

function validatePlan(plan) {
  if (!plan || !plan.focusModule) return null
  const focus = getModule(plan.focusModule)
  if (!focus) return null
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

async function cleanOldPlans() {
  try {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
    const keys = await idbListKeys(CACHE_PREFIX)
    for (const key of keys) {
      const dateStr = key.slice(CACHE_PREFIX.length)
      const ts = new Date(dateStr).getTime()
      if (Number.isNaN(ts) || ts < cutoff) await idbRemove(key)
    }
  } catch {
    /* ignore */
  }
}

export async function getDailyPlan() {
  const key = CACHE_PREFIX + todayKey()

  try {
    const cached = await idbGetJson(key)
    if (cached) return cached
  } catch {
    /* fall through */
  }

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

  if (!plan) plan = buildLocalPlan()

  try {
    await idbSetJson(key, plan)
  } catch {
    /* ignore */
  }
  cleanOldPlans()
  return plan
}
