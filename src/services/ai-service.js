// LLM API service layer (OpenAI-compatible: DeepSeek / Qwen / Moonshot / OpenAI).
// Every function returns null on failure so callers can fall back to local generators.

import { systemPrompt, questionPrompt, dailyPlanPrompt } from './prompts'
import { buildAbilitySummary } from './ability-model'

/**
 * Low-level OpenAI-compatible chat completion call.
 * Returns the assistant message content string, or throws on error/timeout.
 */
export async function callLLM(messages, { apiBaseUrl, apiKey, modelName }, timeoutMs = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    let base = apiBaseUrl.replace(/\/+$/, '')
    // Auto-append /v1 if the user forgot it (common mistake).
    if (!/\/v\d+$/i.test(base) && !base.endsWith('/chat/completions')) {
      base += '/v1'
    }
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0.8,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    const data = await response.json()
    return data.choices?.[0]?.message?.content ?? ''
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Robustly extract and parse JSON from an LLM response.
 * Tries direct parse first, then extracts the first JSON array/object.
 */
export function parseJsonResponse(text) {
  if (!text) return null
  // 1. direct parse
  try {
    return JSON.parse(text.trim())
  } catch {
    /* fall through */
  }
  // 2. strip markdown code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim())
    } catch {
      /* fall through */
    }
  }
  // 3. extract first JSON array or object
  const arrMatch = text.match(/\[[\s\S]*\]/)
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[0])
    } catch {
      /* fall through */
    }
  }
  const objMatch = text.match(/\{[\s\S]*\}/)
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0])
    } catch {
      /* fall through */
    }
  }
  return null
}

/**
 * Generate questions for a game via the LLM.
 * Returns an array of raw AI question objects, or null on failure.
 */
export async function generateQuestions(settings, { abilitySummary, moduleName, gameName, gameDesc, count, difficulty, weakAreas }) {
  try {
    const content = await callLLM(
      [
        { role: 'system', content: systemPrompt() },
        {
          role: 'user',
          content: questionPrompt({ abilitySummary, moduleName, gameName, gameDesc, count, difficulty, weakAreas }),
        },
      ],
      settings,
      15000,
    )
    const parsed = parseJsonResponse(content)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Generate a daily training plan via the LLM.
 * Returns a plan object, or null on failure.
 */
export async function generateDailyPlan(settings, { abilitySummary, moduleList, weekdayName }) {
  try {
    const content = await callLLM(
      [
        { role: 'system', content: systemPrompt() },
        { role: 'user', content: dailyPlanPrompt({ abilitySummary, moduleList, weekdayName }) },
      ],
      settings,
      15000,
    )
    const parsed = parseJsonResponse(content)
    if (!parsed || typeof parsed !== 'object' || !parsed.focusModule) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Test the API connection with a minimal request.
 * Returns { ok: true } or { ok: false, error }.
 */
export async function testConnection(settings) {
  try {
    const content = await callLLM(
      [{ role: 'user', content: '你好，请回复"连接成功"四个字。' }],
      settings,
      10000,
    )
    return { ok: true, message: content?.slice(0, 50) || '连接成功' }
  } catch (err) {
    return { ok: false, error: err.name === 'AbortError' ? '请求超时' : `连接失败: ${err.message}` }
  }
}

/**
 * Check whether AI is configured and enabled.
 */
export function isAiReady(settings) {
  return Boolean(settings.aiEnabled && settings.apiKey && settings.apiBaseUrl && settings.modelName)
}

/**
 * Build the ability summary string from the ability store state.
 */
export { buildAbilitySummary }
