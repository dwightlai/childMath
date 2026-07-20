// Question generators for the Spatial Thinking module (quiz-style games).
import { randInt, pick, shuffle } from '../../utils/helpers'

// ---- 图形旋转 (rotate) ----
// Simple asymmetric SVG shapes; answer is the shape rotated by N degrees.
const ROTATE_SHAPES = [
  { id: 'flag', d: 'M10 10 L50 10 L50 30 L30 30 L30 50 L10 50 Z', name: '小旗' },
  { id: 'L', d: 'M10 10 L30 10 L30 40 L50 40 L50 55 L10 55 Z', name: 'L形' },
  { id: 'tri', d: 'M10 50 L30 10 L50 50 Z', name: '三角形' },
  { id: 'step', d: 'M10 30 L30 30 L30 10 L50 10 L50 55 L10 55 Z', name: '楼梯' },
]
const rotate = (difficulty) => {
  const shape = pick(ROTATE_SHAPES)
  const angles = difficulty === 1 ? [90] : difficulty === 2 ? [90, 180] : [90, 180, 270]
  const angle = pick(angles)
  const correct = angle
  const wrongAngles = [90, 180, 270].filter((a) => a !== correct)
  const options = shuffle([correct, ...wrongAngles]).map((a) => ({ value: a, rotate: a }))
  return {
    question: `把"${shape.name}"顺时针转 ${angle}°，会变成哪个样子？`,
    speakText: `把图形顺时针转${angle}度，会变成哪个样子？`,
    hint: '想象图形转过去，开口朝哪边？',
    options,
    isCorrect: (opt) => opt.value === correct,
    columns: 3,
    rotate: { shape, angle },
  }
}

// ---- 数图形 (count-shapes) ----
// Predefined composite figures with known triangle/square counts.
const COUNT_FIGURES = [
  { id: 'sq-diag', triangles: 4, desc: '正方形里画了两条对角线', small: 4, big: 0, label: '三角形' },
  { id: 'tri-mid', triangles: 3, desc: '大三角形中间画了一条线', small: 2, big: 1, label: '三角形' },
  { id: 'two-tri', triangles: 2, desc: '两个三角形拼在一起', small: 2, big: 0, label: '三角形' },
  { id: 'rect-two', squares: 3, desc: '一个长方形被分成两半', small: 2, big: 1, label: '长方形' },
]
const countShapes = (difficulty) => {
  const fig = difficulty === 1 ? pick(COUNT_FIGURES.slice(0, 2)) : pick(COUNT_FIGURES)
  const total = fig.triangles || fig.squares
  const options = shuffle([total, total + 1, Math.max(1, total - 1), total + 2].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)).map((v) => ({ value: v, label: `${v} 个` }))
  return {
    question: `数一数，图里一共有几个${fig.label}？（大的小的都算）`,
    speakText: `图里一共有几个${fig.label}？`,
    hint: '先数小的，再看看有没有大一点的。',
    options,
    isCorrect: (opt) => opt.value === total,
    columns: 4,
    countFigure: fig,
  }
}

// ---- 对称画 (symmetry) ----
// Pixel half-figures on a 4x4 grid; child picks the correct full symmetric figure.
const HALF_FIGURES = [
  [[1, 0], [1, 1], [1, 2], [1, 3]],           // vertical bar
  [[0, 0], [1, 0], [1, 1], [1, 2]],           // L shape
  [[0, 1], [1, 0], [1, 1], [1, 2], [0, 3]],   // diamond-ish
  [[1, 0], [1, 1], [0, 1], [0, 2], [1, 2], [1, 3]], // zigzag
]
const symmetry = (difficulty) => {
  const half = pick(HALF_FIGURES)
  const makeKey = (cells) => cells.map((c) => c.join(',')).sort().join('|')
  // correct full figure = half + mirror (mirror col = 3 - col, but half is cols 0-1, mirror cols 2-3)
  const mirrored = half.map(([r, c]) => [r, 3 - c])
  const correctCells = [...half, ...mirrored]
  // distractors: asymmetric variants
  const variants = [
    [...half, ...half.map(([r, c]) => [r, 3 - c === 3 ? 2 : 3])], // wrong mirror
    [...half, ...mirrored.slice(0, -1)], // missing one
    [...half, ...mirrored.map(([r, c]) => [(r + 1) % 4, c])], // shifted
  ]
  const options = shuffle([
    { value: 'correct', cells: correctCells, correct: true },
    ...variants.slice(0, 3).map((cells, i) => ({ value: `w${i}`, cells, correct: false })),
  ])
  return {
    question: '左边是图形的一半，哪一个是它完整的对称图形？',
    speakText: '哪一个是完整的对称图形？',
    hint: '对称图形左右两边要一模一样，像照镜子。',
    options,
    isCorrect: (opt) => opt.correct,
    columns: 2,
    symmetry: { half },
  }
}

// ---- 积木计数 (block-count) ----
// Stacked blocks in simple layers; count total.
const blockCount = (difficulty) => {
  const layers = difficulty === 1 ? 2 : 3
  const perLayer = difficulty === 1 ? randInt(2, 3) : randInt(2, 4)
  // build a roughly-pyramid stack
  const stack = Array.from({ length: layers }, (_, i) => Math.max(1, perLayer - i))
  const total = stack.reduce((a, b) => a + b, 0)
  const options = shuffle([total, total + 1, Math.max(1, total - 1), total + 2].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)).map((v) => ({ value: v, label: `${v} 块` }))
  return {
    question: '这堆积木一共有多少块？（藏起来的也要数）',
    speakText: '这堆积木一共有多少块？',
    hint: '一层一层数，别忘了被挡住看不见的积木。',
    options,
    isCorrect: (opt) => opt.value === total,
    columns: 4,
    blocks: stack,
  }
}

// ---- 七巧板 (tangram): which piece fills the hole ----
const TANGRAM_PUZZLES = [
  {
    id: 'tri-hole',
    hole: 'M60 10 L110 10 L110 60 Z', // right triangle hole
    correct: { d: 'M10 10 L60 10 L60 60 Z', name: '三角形' },
    others: [
      { d: 'M10 10 L60 10 L60 60 L10 60 Z', name: '正方形' },
      { d: 'M10 40 L35 10 L60 40 Z', name: '小三角' },
      { d: 'M10 10 L60 10 L45 60 L25 60 Z', name: '梯形' },
    ],
  },
  {
    id: 'sq-hole',
    hole: 'M60 20 L100 20 L100 60 L60 60 Z', // square hole
    correct: { d: 'M10 20 L50 20 L50 60 L10 60 Z', name: '正方形' },
    others: [
      { d: 'M10 60 L30 20 L50 60 Z', name: '三角形' },
      { d: 'M10 20 L50 20 L50 60 Z', name: '直角三角形' },
      { d: 'M10 20 L50 20 L40 60 L20 60 Z', name: '梯形' },
    ],
  },
]
const tangram = (difficulty) => {
  const p = pick(TANGRAM_PUZZLES)
  const options = shuffle([
    { value: 'correct', d: p.correct.d, name: p.correct.name, correct: true },
    ...p.others.map((o, i) => ({ value: `w${i}`, d: o.d, name: o.name, correct: false })),
  ])
  return {
    question: '图形上缺了一块，哪一块正好能补上去？',
    speakText: '哪一块正好能补上缺口的形状？',
    hint: '看看缺口是什么形状，找一模一样的。',
    options,
    isCorrect: (opt) => opt.correct,
    columns: 4,
    tangram: { hole: p.hole },
  }
}

export const generators = {
  rotate,
  'count-shapes': countShapes,
  symmetry,
  'block-count': blockCount,
  tangram,
}

export const generate = (gameId, difficulty, count) =>
  Array.from({ length: count }, () => generators[gameId](difficulty))
