// 数学表达 (math-expression) question generators.
// Focus: reflecting on and expressing HOW you solved something — methods, step order, spotting mistakes.
// my-method & find-mistake are quiz-style; step-order is an interactive drag game (see StepOrderGame.jsx).

import { pick, shuffle, generateUnique } from '../../utils/helpers'

// 我用的方法: show a simple solved problem, ask which method was used.
const METHOD_OPTIONS = [
  { value: 'draw', label: '🎨 画图' },
  { value: 'count', label: '🔢 数一数' },
  { value: 'split', label: '✂️ 拆分' },
  { value: 'guess', label: '💭 猜一猜' },
]
const METHOD_PROBLEMS = [
  { method: 'count', problem: '数一数：🍎🍎🍎🍎🍎 一共有几个苹果？', answer: '5 个', why: '一个一个数出来的，用"数一数"。' },
  { method: 'count', problem: '数一数：⭐⭐⭐⭐⭐⭐ 一共有几颗星？', answer: '6 颗', why: '一个一个数出来的，用"数一数"。' },
  { method: 'draw', problem: '小明前面有 2 人，后面有 3 人，一共有几人？', answer: '6 人', why: '画一画排队的图，一数就清楚。' },
  { method: 'draw', problem: '把 8 颗糖分给两个小朋友，怎样分才公平？', answer: '每人 4 颗', why: '画一画、分一分就明白了。' },
  { method: 'split', problem: '计算 8 + 7 = ？', answer: '15', why: '把 7 拆成 2 和 5，先凑十再加。' },
  { method: 'split', problem: '计算 9 + 6 = ？', answer: '15', why: '把 6 拆成 1 和 5，先凑十再加。' },
  { method: 'guess', problem: '一个数比 6 大，又比 9 小，它可能是几？', answer: '7 或 8', why: '先猜一猜，再验证对不对。' },
  { method: 'guess', problem: '盒子里的糖比 3 颗多，比 6 颗少，可能是几颗？', answer: '4 或 5 颗', why: '先猜一猜，再验证对不对。' },
]
const myMethod = () => {
  const p = pick(METHOD_PROBLEMS)
  const options = shuffle(METHOD_OPTIONS.map((m) => ({ ...m, correct: m.value === p.method })))
  return {
    question: `这道题：${p.problem} 你主要用了什么方法？`,
    speakText: '你是用什么方法想出来的？',
    hint: p.why,
    options,
    isCorrect: (opt) => opt.correct,
    columns: 2,
    method: { problem: p.problem, answer: p.answer },
  }
}

// 找错误: a worked solution where ONE step is wrong; click the wrong step.
const MISTAKE_TEMPLATES = [
  {
    problem: '计算 6 + 7',
    steps: [
      { text: '先想凑十：6 再加 4 就是 10', wrong: false },
      { text: '把 7 分成 4 和 3', wrong: false },
      { text: '10 + 3 = 12', wrong: true },
    ],
    fix: '10 + 3 应该等于 13，不是 12。',
  },
  {
    problem: '计算 9 + 5',
    steps: [
      { text: '把 5 分成 1 和 4', wrong: false },
      { text: '9 + 1 = 10', wrong: false },
      { text: '10 + 4 = 15', wrong: true },
    ],
    fix: '10 + 4 应该等于 14，不是 15。',
  },
  {
    problem: '小明有 12 颗糖，吃了 5 颗，还剩几颗？',
    steps: [
      { text: '原来有 12 颗', wrong: false },
      { text: '吃了 5 颗，要用减法', wrong: false },
      { text: '12 - 5 = 8', wrong: true },
    ],
    fix: '12 - 5 应该等于 7，不是 8。',
  },
  {
    problem: '车上 8 人，下去 3 人，又上来 2 人，现在几人？',
    steps: [
      { text: '先算下去后：8 - 3 = 5', wrong: false },
      { text: '再算上来后：5 + 2 = 6', wrong: false },
      { text: '所以现在有 7 人', wrong: true },
    ],
    fix: '5 + 2 = 7？不对，应该是 6 人。',
  },
  {
    problem: '一排有 4 个，一共有 3 排，共有几个？',
    steps: [
      { text: '每排 4 个，有 3 排', wrong: false },
      { text: '用加法：4 + 3', wrong: true },
      { text: '一共有 7 个', wrong: false },
    ],
    fix: '应该是 4 + 4 + 3 排相加，不是 4 + 3。',
  },
]
const findMistake = () => {
  const t = pick(MISTAKE_TEMPLATES)
  const options = t.steps.map((s, i) => ({
    value: i,
    label: `第${i + 1}步：${s.text}`,
    correct: s.wrong,
  }))
  return {
    question: `小朋友这样解「${t.problem}」，哪一步错了？点出来！`,
    speakText: '哪一步做错了？',
    hint: t.fix,
    options,
    isCorrect: (opt) => opt.correct,
    columns: 1,
  }
}

export const generators = {
  'my-method': myMethod,
  'find-mistake': findMistake,
}

export const generate = (gameId, difficulty, count) =>
  generateUnique(() => generators[gameId](difficulty), count)
