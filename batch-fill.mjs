/**
 * batch-fill.mjs — 批量调用 DeepSeek API 为本地题库灌题。
 *
 * 用法：
 *   1. 设置环境变量（或在脚本顶部修改 CONFIG）：
 *      DEEPSEEK_API_KEY=sk-xxx
 *      DEEPSEEK_BASE_URL=https://api.deepseek.com/v1   (可选，默认此值)
 *      DEEPSEEK_MODEL=deepseek-v4-flash                 (可选，默认此值)
 *   2. 运行：node batch-fill.mjs
 *   3. 生成 question-bank-fill.json，在设置页点「📥 导入」即可。
 *
 * 参数（可选环境变量）：
 *   QUESTIONS_PER_BUCKET=20   每个游戏每个难度生成多少题（默认20）
 *   BATCH_SIZE=5              每次 API 调用生成几题（默认5）
 *   DELAY_MS=2000             两次 API 调用之间的间隔毫秒（默认2000，防限流）
 *   LEVELS=2,3                只生成指定难度（默认1,2,3全部）
 *   MODULES=spatial,logic     只生成指定模块（默认全部）
 *
 * 预计耗时：37游戏 × 3难度 × 4批次 = 444次调用 ≈ 15-30分钟
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
  questionsPerBucket: Number(process.env.QUESTIONS_PER_BUCKET) || 20,
  batchSize: Number(process.env.BATCH_SIZE) || 5,
  delayMs: Number(process.env.DELAY_MS) || 2000,
  levels: (process.env.LEVELS || '1,2,3').split(',').map(Number),
  onlyModules: process.env.MODULES ? process.env.MODULES.split(',') : null,
}

// ─── GAME DEFINITIONS (mirrors config.js + question-loader GAME_DESCS) ────────
const MODULES = [
  { id: 'number-sense', name: '数感乐园', games: [
    { id: 'make-ten', name: '凑十游戏', desc: '给出一个数，选出能和它凑成10的数' },
    { id: 'split-number', name: '数字拆分', desc: '把一个数拆成两部分，已知一部分求另一部分' },
    { id: 'quick-count', name: '快速点数', desc: '数一数图中物品的总数' },
    { id: 'find-friend', name: '数字找朋友', desc: '选出两个合起来等于目标数的数字' },
    { id: 'compare', name: '比大小挑战', desc: '比较两个数或算式的大小，选 > < =' },
    { id: 'estimate', name: '估一估', desc: '不逐个数，估计一堆物品大约有多少' },
  ]},
  { id: 'quantity-relation', name: '关系小镇', games: [
    { id: 'story-theater', name: '故事小剧场', desc: '根据一个小故事情境选出正确的算式' },
    { id: 'arrange', name: '摆一摆', desc: '用圆片摆出题目描述的数量关系' },
    { id: 'more-less', name: '谁多谁少', desc: '比较两排物品，判断谁多谁少或多几个' },
    { id: 'detective', name: '条件小侦探', desc: '从一段话中找出有用的数学条件' },
    { id: 'multi-solve', name: '一题多解', desc: '同一个问题，选出所有正确的解法' },
  ]},
  { id: 'calc-strategy', name: '运算策略', games: [
    { id: 'split-calc', name: '拆分计算', desc: '把一个加法算式中的数拆分，选出正确的拆分计算方式' },
    { id: 'make-round', name: '凑整计算', desc: '用凑整的方法计算，选出最简便的算法' },
    { id: 'multi-method', name: '一题多解', desc: '同一道计算题，选出另一种正确的算法' },
    { id: 'tool-box', name: '解题工具箱', desc: '根据题目情境选择最合适的解题策略(画图/拆分/列表/倒推)' },
  ]},
  { id: 'pattern', name: '规律森林', games: [
    { id: 'sequence', name: '接龙填空', desc: '观察数字或图形序列，填出下一个' },
    { id: 'odd-one-out', name: '找不同', desc: '在一组事物中找出不同类的那个' },
    { id: 'designer', name: '规律设计师', desc: '观察规律，选出接下来应该出现的图形' },
    { id: 'shape-pattern', name: '图形变换', desc: '观察图形排列规律，预测下一个' },
    { id: 'judge', name: '对错判断', desc: '判断给出的规律和答案是否正确' },
  ]},
  { id: 'spatial', name: '空间城堡', games: [
    { id: 'tangram', name: '七巧板拼图', desc: '选出能拼出目标图形的七巧板块' },
    { id: 'rotate', name: '图形旋转', desc: '想象图形旋转后的样子，选出正确答案' },
    { id: 'count-shapes', name: '数图形', desc: '数出大图形中包含几个小图形' },
    { id: 'symmetry', name: '对称画', desc: '根据对称轴选出图形的另一半' },
    { id: 'block-count', name: '积木计数', desc: '数出立体图形用了几个小方块' },
  ]},
  { id: 'logic', name: '推理侦探社', games: [
    { id: 'who-is-who', name: '谁是谁', desc: '根据线索条件匹配人物和物品' },
    { id: 'ordering', name: '排序挑战', desc: '根据条件排出正确的顺序' },
    { id: 'true-false', name: '真假话', desc: '判断哪句话一定正确' },
    { id: 'little-detective', name: '小侦探', desc: '根据多条线索找出答案' },
  ]},
  { id: 'problem-solving', name: '挑战擂台(建模)', games: [
    { id: 'route', name: '路线探索', desc: '数出从起点到终点的不同路线数量' },
    { id: 'life-math', name: '生活数学', desc: '把购物、分东西等生活场景变成正确的算式' },
  ]},
  { id: 'math-expression', name: '数学表达', games: [
    { id: 'my-method', name: '我用的方法', desc: '展示一道已解决的简单题，让孩子选出自己用了什么方法(画图/数一数/拆分/猜一猜)' },
    { id: 'find-mistake', name: '找错误', desc: '展示一段含错误的解题步骤，让孩子找出哪一步错了' },
  ]},
  { id: 'data-thinking', name: '数据意识', games: [
    { id: 'count-sort', name: '分类统计', desc: '把一堆物品按类别分类，数出某一类的数量' },
    { id: 'read-chart', name: '看图回答', desc: '根据简单的统计图(柱状图)回答问题，如谁最多、相差多少' },
    { id: 'compare-data', name: '数据比较', desc: '比较两组数据，判断哪组多或多多少' },
    { id: 'simple-survey', name: '小调查员', desc: '根据一个小调查的统计结果回答总数、最多或合计等问题' },
  ]},
]

// Filter modules if specified
const activeModules = CONFIG.onlyModules
  ? MODULES.filter((m) => CONFIG.onlyModules.includes(m.id))
  : MODULES

// ─── DIFFICULTY DESCRIPTIONS ──────────────────────────────────────────────────
const DIFFICULTY_DESC = {
  1: { numberSize: 1, thinkingSteps: 1, abstraction: 1, label: '简单（10以内，单步直观）' },
  2: { numberSize: 2, thinkingSteps: 2, abstraction: 2, label: '进阶（20以内，2步思考）' },
  3: { numberSize: 3, thinkingSteps: 2, abstraction: 3, label: '挑战（100以内，多步抽象）' },
}

// ─── PROMPT BUILDERS ──────────────────────────────────────────────────────────
function systemPrompt() {
  return `你是一名儿童数学思维训练专家，面向6-7岁（一年级升二年级）的孩子。
你的任务是设计有趣、适龄的数学思维训练题目。

核心原则：
- 不训练计算速度，强调观察、推理、尝试
- 文字量少，语言简单，适合7岁儿童阅读
- 答错不惩罚，提示要温和有引导性
- 题目要有趣味性，贴近孩子的生活（糖果、小动物、玩具等）
- 严格按照要求的JSON格式输出，不要输出任何其他文字`
}

function questionPrompt({ moduleName, gameName, gameDesc, count, difficulty, level }) {
  const d = DIFFICULTY_DESC[level]
  return `目标模块：${moduleName}
当前难度：${d.label}（数字大小=${d.numberSize}，思考步骤=${d.thinkingSteps}，抽象程度=${d.abstraction}）

请为游戏"${gameName}"（${gameDesc}）生成 ${count} 道选择题。

要求：
- 难度严格匹配上述参数：数字范围、步骤数、抽象程度
- 每道题3-4个选项，只有一个正确答案
- 每道题配有引导提示（hint）和鼓励语（encouragement）
- 题目之间不要重复，尽量多样化
- 难度参数越高，数字越大、步骤越多、越抽象

严格按以下JSON数组格式输出（不要其他文字）：
[
  {
    "question": "题目文字",
    "speakText": "朗读文字（去掉符号，适合语音播报）",
    "options": [{"value": "选项值", "label": "显示文字"}],
    "answer": "正确选项的value",
    "hint": "引导提示",
    "encouragement": "答对后的鼓励语"
  }
]`
}

// ─── API CALL ─────────────────────────────────────────────────────────────────
async function callAPI(messages) {
  const base = CONFIG.baseUrl.replace(/\/+$/, '')
  const url = `${base}/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: CONFIG.model,
      messages,
      temperature: 0.85,
      max_tokens: 3000,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

function parseJson(text) {
  if (!text) return null
  try { return JSON.parse(text.trim()) } catch { /* */ }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) { try { return JSON.parse(fenced[1].trim()) } catch { /* */ } }
  const arr = text.match(/\[[\s\S]*\]/)
  if (arr) { try { return JSON.parse(arr[0]) } catch { /* */ } }
  return null
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!CONFIG.apiKey) {
    console.error('❌ 请设置环境变量 DEEPSEEK_API_KEY=sk-xxx')
    console.error('   例：$env:DEEPSEEK_API_KEY="sk-xxx"; node batch-fill.mjs')
    process.exit(1)
  }

  // Load existing output for resume support
  const outPath = resolve(__dirname, 'question-bank-fill.json')
  let bank = {}
  if (existsSync(outPath)) {
    try {
      const existing = JSON.parse(readFileSync(outPath, 'utf-8'))
      bank = existing.bank || existing
      console.log(`📂 已加载现有题库：${countAll(bank)} 题，将跳过已有桶`)
    } catch { /* start fresh */ }
  }

  const batchesPerBucket = Math.ceil(CONFIG.questionsPerBucket / CONFIG.batchSize)
  const totalCalls = activeModules.reduce(
    (sum, m) => sum + m.games.length * CONFIG.levels.length * batchesPerBucket, 0,
  )
  let callIdx = 0
  let totalGenerated = 0
  let errors = 0

  console.log(`\n🚀 开始批量生成`)
  console.log(`   模块：${activeModules.length} 个，游戏：${activeModules.reduce((s, m) => s + m.games.length, 0)} 个`)
  console.log(`   难度：${CONFIG.levels.join(', ')}，每桶目标：${CONFIG.questionsPerBucket} 题`)
  console.log(`   预计 API 调用：${totalCalls} 次，间隔 ${CONFIG.delayMs}ms`)
  console.log(`   预计耗时：${Math.ceil(totalCalls * (CONFIG.delayMs + 5000) / 60000)} 分钟\n`)

  for (const mod of activeModules) {
    for (const game of mod.games) {
      const key = `${mod.id}/${game.id}`
      if (!bank[key]) bank[key] = {}

      for (const level of CONFIG.levels) {
        const existing = bank[key][level] || []
        if (existing.length >= CONFIG.questionsPerBucket) {
          console.log(`  ⏭️  ${key} L${level} 已有 ${existing.length} 题，跳过`)
          continue
        }

        if (!bank[key][level]) bank[key][level] = []
        const needed = CONFIG.questionsPerBucket - bank[key][level].length
        const batches = Math.ceil(needed / CONFIG.batchSize)

        for (let b = 0; b < batches; b++) {
          callIdx++
          const count = Math.min(CONFIG.batchSize, needed - b * CONFIG.batchSize)
          process.stdout.write(`  [${callIdx}/${totalCalls}] ${key} L${level} 批次${b + 1}/${batches}...`)

          try {
            const content = await callAPI([
              { role: 'system', content: systemPrompt() },
              { role: 'user', content: questionPrompt({ moduleName: mod.name, gameName: game.name, gameDesc: game.desc, count, difficulty: DIFFICULTY_DESC[level], level }) },
            ])
            const parsed = parseJson(content)
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Dedup
              const seen = new Set(bank[key][level].map((q) => (q.question || '').trim()))
              const fresh = parsed.filter((q) => q && q.question && !seen.has((q.question || '').trim()))
              bank[key][level].push(...fresh)
              totalGenerated += fresh.length
              console.log(` ✓ +${fresh.length} (共${bank[key][level].length})`)
            } else {
              console.log(` ⚠️ 解析失败`)
              errors++
            }
          } catch (err) {
            console.log(` ❌ ${err.message}`)
            errors++
            // Wait longer on error
            await sleep(CONFIG.delayMs * 3)
          }

          // Rate limit delay
          if (callIdx < totalCalls) await sleep(CONFIG.delayMs)
        }

        // Save incrementally after each bucket
        writeFileSync(outPath, JSON.stringify({ bank }, null, 0))
      }
    }
  }

  // Final save
  writeFileSync(outPath, JSON.stringify({ bank }, null, 0))
  console.log(`\n✅ 完成！共生成 ${totalGenerated} 题新题，错误 ${errors} 次`)
  console.log(`   题库总计：${countAll(bank)} 题`)
  console.log(`   输出文件：${outPath}`)
  console.log(`   下一步：在设置页点「📥 导入」选择此文件即可`)
}

function countAll(bank) {
  let n = 0
  for (const buckets of Object.values(bank)) {
    for (const arr of Object.values(buckets)) n += arr.length
  }
  return n
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

main().catch((err) => { console.error('Fatal:', err); process.exit(1) })
