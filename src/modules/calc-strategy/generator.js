// 运算策略 (calc-strategy) question generators.
// Focus: flexible computation strategies — splitting, making-round, multiple methods, choosing tools.
// NOT about speed; about observing, reasoning and trying different approaches.

import { randInt, pick, shuffle, generateUnique } from '../../utils/helpers'

const rangeMax = (difficulty) => (difficulty === 1 ? 10 : difficulty === 2 ? 20 : 100)

// 拆分计算: pick the correct way to split an addend and compute.
const splitCalc = (difficulty) => {
  const max = rangeMax(difficulty)
  const a = randInt(2, Math.max(3, Math.floor(max * 0.6)))
  const b = randInt(2, Math.max(3, max - a))
  const total = a + b
  // split b into a "nice" part p and the rest q (p + q === b)
  let p, q
  if (b >= 10) {
    p = Math.floor(b / 10) * 10
    q = b - p
    if (q === 0) { p -= 10; q = 10 }
  } else {
    p = randInt(1, b - 1)
    q = b - p
  }
  const correct = `${a} + ${p} + ${q} = ${total}`
  const wrongResult = `${a} + ${p} + ${q} = ${total + pick([1, 2, -1])}`
  const wrongSplit = `${a} + ${p + 1} + ${q} = ${total}`
  const wrongBoth = `${a} + ${p + 1} + ${q + 1} = ${total + 1}`
  const options = [...new Set([correct, wrongResult, wrongSplit, wrongBoth])].slice(0, 4)
  while (options.length < 4) options.push(`${a} + ${p} + ${q + options.length} = ${total + 3}`)
  return {
    question: pick([
      `${a} + ${b} 怎么拆分计算是对的？`,
      `把 ${b} 拆开再加 ${a}，哪个算对了？`,
      `巧算 ${a}+${b}，正确的拆分是？`,
    ]),
    speakText: `把 ${b} 拆开来算，哪个是对的？`,
    hint: `把 ${b} 拆成 ${p} 和 ${q}，先算 ${a} + ${p}，再加 ${q}。`,
    options: shuffle(options).map((v) => ({ value: v, label: v })),
    isCorrect: (opt) => opt.value === correct,
    columns: 2,
  }
}

// 凑整计算: choose the simplest "make a round number" method.
const makeRound = (difficulty) => {
  const tens = difficulty === 1 ? 1 : difficulty === 2 ? 2 : randInt(2, 9)
  const base = tens * 10
  const offset = randInt(1, 4)
  const a = base - offset            // e.g. 38 (= 40 - 2)
  const b = randInt(5, difficulty === 1 ? 9 : difficulty === 2 ? 20 : 50)
  const total = a + b
  const round = offset               // amount needed to round a up to base
  const correct = `${base} + ${b} - ${round} = ${total}`
  const wrongAdd = `${base} + ${b} + ${round} = ${total}`
  const wrongResult = `${base} + ${b} - ${round} = ${total + pick([1, -1])}`
  const wrongRound = `${base} + ${b} - ${round + 1} = ${total}`
  const options = [...new Set([correct, wrongAdd, wrongResult, wrongRound])].slice(0, 4)
  while (options.length < 4) options.push(`${base} + ${b} - ${round + options.length} = ${total + 2}`)
  return {
    question: `${a} + ${b}，用凑整的方法算，哪个最简便？`,
    speakText: `把 ${a} 凑成整十数再算，哪个最简便？`,
    hint: `把 ${a} 看成 ${base}（多加了 ${round}），算完再减回 ${round}。`,
    options: shuffle(options).map((v) => ({ value: v, label: v })),
    isCorrect: (opt) => opt.value === correct,
    columns: 2,
  }
}

// 一题多解: pick another correct way to compute the same problem.
const multiMethod = (difficulty) => {
  const max = rangeMax(difficulty)
  const modes = difficulty === 1
    ? ['split', 'commute', 'same-sum']
    : difficulty === 2
      ? ['split', 'commute', 'make-ten', 'near-double', 'strategy']
      : ['split', 'make-ten', 'near-double', 'strategy', 'tens']
  const mode = pick(modes)

  if (mode === 'strategy') {
    const items = [
      { q: `${randInt(11, 18)}+${randInt(3, 9)}，哪种想法更合适？`, a: '拆分凑十', opts: ['拆分凑十', '只加个位', '随便猜', '改成减法'] },
      { q: `${randInt(12, 19)}−${randInt(5, 9)}，个位不够减，怎么想？`, a: '破十再减', opts: ['破十再减', '直接个位相减', '不用算', '先加再减'] },
      { q: '8+5 怎样算更快？', a: '拆成凑十', opts: ['拆成凑十', '从 1 数到 13', '只看个位', '改成减法'] },
    ]
    const s = pick(items)
    return {
      question: s.q,
      speakText: '哪种想法更合适？',
      hint: '想一想哪一种最清楚、不容易错。',
      options: shuffle(s.opts.map((x) => ({ value: x, label: x, correct: x === s.a }))),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  if (mode === 'make-ten') {
    const a = randInt(6, 9)
    const b = randInt(10 - a + 1, 9)
    const total = a + b
    const need = 10 - a
    const rest = b - need
    const correct = `${a} + ${need} + ${rest} = ${total}`
    return {
      question: `${a}+${b} 用凑十法，哪个也对？`,
      speakText: '用凑十法，哪个也对？',
      hint: `先凑 ${a}+${need}=10，再加 ${rest}。`,
      options: shuffle([
        { value: correct, label: correct, correct: true },
        { value: 'w1', label: `${a} + ${need} + ${rest} = ${total + 1}`, correct: false },
        { value: 'w2', label: `${a} + ${b} = ${total - 1}`, correct: false },
        { value: 'w3', label: `${a} - ${need} + ${rest} = ${total}`, correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  if (mode === 'near-double') {
    const a = randInt(5, Math.min(12, Math.floor(max / 2) + 4))
    const total = a + a + 1
    const correct = `${a} + ${a} + 1 = ${total}`
    return {
      question: `${a}+${a + 1}，用加倍的想法，哪个也对？`,
      speakText: '用加倍的想法，哪个也对？',
      hint: `${a}+${a} 再加 1。`,
      options: shuffle([
        { value: correct, label: correct, correct: true },
        { value: 'w1', label: `${a} + ${a} = ${total}`, correct: false },
        { value: 'w2', label: `${a} + ${a} - 1 = ${total}`, correct: false },
        { value: 'w3', label: `${a + 1} + ${a + 1} = ${total}`, correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  if (mode === 'tens') {
    const tens = randInt(2, 7) * 10
    const ones = randInt(3, 9)
    const b = randInt(4, 15)
    const total = tens + ones + b
    const correct = `${tens} + ${b} + ${ones} = ${total}`
    return {
      question: `${tens + ones}+${b}=${total}，更简便的算法是？`,
      speakText: '更简便的算法是哪个？',
      hint: '先把整十算清楚，再加个位。',
      options: shuffle([
        { value: correct, label: correct, correct: true },
        { value: 'w1', label: `${tens} + ${b} + ${ones} = ${total + 1}`, correct: false },
        { value: 'w2', label: `${ones} + ${b} = ${total}`, correct: false },
        { value: 'w3', label: `${tens + ones} - ${b} = ${total}`, correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  if (mode === 'commute') {
    const a = randInt(3, Math.max(4, Math.floor(max * 0.6)))
    const b = randInt(2, Math.max(3, max - a))
    const total = a + b
    return {
      question: `${a}+${b}=${total}，交换顺序也对的是？`,
      speakText: '交换顺序哪个也对？',
      hint: '加数换位置，得数不变。',
      options: shuffle([
        { value: 'c', label: `${b}+${a}=${total}`, correct: true },
        { value: 'w1', label: `${a}+${b}=${total + 1}`, correct: false },
        { value: 'w2', label: `${a}-${b}=${total}`, correct: false },
        { value: 'w3', label: `${total}+${a}=${b}`, correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  if (mode === 'same-sum') {
    const total = randInt(difficulty === 1 ? 8 : 12, max)
    const a = randInt(2, total - 2)
    const b = total - a
    let c = randInt(1, total - 1)
    if (c === a) c = c === 1 ? 2 : c - 1
    const d = total - c
    return {
      question: `${a}+${b}=${total}，得数相同的另一道是？`,
      speakText: '哪个得数也一样？',
      hint: '得数相同就可以。',
      options: shuffle([
        { value: 'c', label: `${c}+${d}=${total}`, correct: true },
        { value: 'w1', label: `${c}+${d}=${total + 1}`, correct: false },
        { value: 'w2', label: `${a}+${b}=${total - 1}`, correct: false },
        { value: 'w3', label: `${a}-${b}=${total}`, correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  const a = randInt(3, Math.max(4, Math.floor(max * 0.6)))
  const b = randInt(2, Math.max(3, max - a))
  const total = a + b
  const b1 = randInt(1, b - 1)
  const b2 = b - b1
  const correct = `${a} + ${b1} + ${b2} = ${total}`
  return {
    question: `${a} + ${b} = ？，用拆分的算法，哪个也对？`,
    speakText: '用拆分的算法，哪个也对？',
    hint: `把 ${b} 拆成 ${b1} 和 ${b2}。`,
    options: shuffle([
      { value: correct, label: correct, correct: true },
      { value: 'w1', label: `${a} + ${b1} + ${b2} = ${total + 1}`, correct: false },
      { value: 'w2', label: `${a} + ${b} = ${total - 1}`, correct: false },
      { value: 'w3', label: `${a} + ${b1 + 1} + ${b2} = ${total}`, correct: false },
    ]),
    isCorrect: (opt) => opt.correct,
    columns: 2,
  }
}

// 解题工具箱: choose the best strategy for a situation.
const STRATEGIES = [
  { value: 'draw', label: '🎨 画图' },
  { value: 'split', label: '✂️ 拆分' },
  { value: 'list', label: '📋 列表' },
  { value: 'back', label: '↩️ 倒推' },
]
const SCENARIOS = [
  { text: '一排小朋友，小红前面有 3 人，后面有 2 人，一共有几人？', answer: 'draw', why: '画一画、数一数就清楚了。' },
  { text: '计算 8 + 5，怎样算更快更准？', answer: 'split', why: '把数拆开凑十，更好算。' },
  { text: '一个数加上 6 等于 15，这个数是几？', answer: 'back', why: '从结果 15 往回减 6。' },
  { text: '周一存 1 元、周二存 2 元……想知道周五一共存了几元。', answer: 'list', why: '列个表，一天一天记清楚。' },
  { text: '停车场原来有一些车，开走 4 辆后还剩 7 辆，原来有几辆？', answer: 'back', why: '从剩下的往回加。' },
  { text: '小明排在第 5 个，他后面还有 6 个，一共有几个小朋友？', answer: 'draw', why: '画出来数一数最直观。' },
  { text: '计算 9 + 6，怎样更简便？', answer: 'split', why: '拆成凑十再相加。' },
  { text: '每天读几页书，想记录一周读了多少页。', answer: 'list', why: '用表格记录最清楚。' },
  { text: '从 20 里连续减去 4，减到 0 要减几次？', answer: 'list', why: '列出来不容易乱。' },
  { text: '盒子里有一些球，拿走 3 个还剩 8 个，原来几个？', answer: 'back', why: '从剩下的往回加。' },
  { text: '左边 5 个，右边比左边多 2 个，一共几个？先怎么想？', answer: 'draw', why: '画出来左右两边再加。' },
  { text: '15−7 个位不够减，用什么办法？', answer: 'split', why: '破十：把15拆开再减。' },
]
const toolBox = () => {
  const s = pick(SCENARIOS)
  const options = shuffle(STRATEGIES.map((st) => ({ ...st, correct: st.value === s.answer })))
  return {
    question: s.text,
    speakText: '这道题用什么方法最好？',
    hint: s.why,
    options,
    isCorrect: (opt) => opt.correct,
    columns: 2,
  }
}

export const generators = {
  'split-calc': splitCalc,
  'make-round': makeRound,
  'multi-method': multiMethod,
  'tool-box': toolBox,
}

export const generate = (gameId, difficulty, count) =>
  generateUnique(() => generators[gameId](difficulty), count)
