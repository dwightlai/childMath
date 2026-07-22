// Question generators for the Spatial Thinking module (quiz-style games).
import { randInt, pick, shuffle, generateUnique } from '../../utils/helpers'

const ROTATE_SHAPES = [
  { id: 'flag', d: 'M10 10 L50 10 L50 30 L30 30 L30 50 L10 50 Z', name: '小旗' },
  { id: 'L', d: 'M10 10 L30 10 L30 40 L50 40 L50 55 L10 55 Z', name: 'L形' },
  { id: 'tri', d: 'M10 50 L30 10 L50 50 Z', name: '三角形' },
  { id: 'step', d: 'M10 30 L30 30 L30 10 L50 10 L50 55 L10 55 Z', name: '楼梯' },
  { id: 'arrow', d: 'M30 10 L50 30 L40 30 L40 55 L20 55 L20 30 L10 30 Z', name: '箭头' },
  { id: 'C', d: 'M45 15 L20 15 L20 50 L45 50 L45 40 L30 40 L30 25 L45 25 Z', name: 'C形' },
  { id: 'boot', d: 'M15 10 L35 10 L35 35 L50 35 L50 55 L15 55 Z', name: '靴子' },
  { id: 'house', d: 'M30 8 L50 28 L42 28 L42 55 L18 55 L18 28 L10 28 Z', name: '小房子' },
]
const rotate = (difficulty) => {
  const shape = pick(ROTATE_SHAPES)
  const angles = difficulty === 1 ? [90] : difficulty === 2 ? [90, 180] : [90, 180, 270]
  const angle = pick(angles)
  const wrongAngles = [90, 180, 270].filter((a) => a !== angle)
  const options = shuffle([angle, ...wrongAngles]).map((a) => ({ value: a, rotate: a }))
  const stems = [
    `把"${shape.name}"顺时针转 ${angle}°，会变成哪个样子？`,
    `"${shape.name}"向右转 ${angle}° 后是哪个？`,
    `想象把"${shape.name}"转 ${angle}°，选正确的结果。`,
  ]
  return {
    question: pick(stems),
    speakText: `把图形顺时针转${angle}度，会变成哪个样子？`,
    hint: '想象图形转过去，开口朝哪边？',
    options,
    isCorrect: (opt) => opt.value === angle,
    columns: 3,
    rotate: { shape, angle },
  }
}

const COUNT_FIGURES = [
  { id: 'sq-diag', triangles: 4, desc: '正方形里画了两条对角线', label: '三角形' },
  { id: 'tri-mid', triangles: 3, desc: '大三角形中间画了一条线', label: '三角形' },
  { id: 'two-tri', triangles: 2, desc: '两个三角形拼在一起', label: '三角形' },
  { id: 'rect-two', squares: 3, desc: '一个长方形被分成两半', label: '长方形' },
  { id: 'tri-3', triangles: 4, desc: '大三角形被分成三个小的', label: '三角形' },
  { id: 'sq-4', squares: 5, desc: '大正方形里有四个小正方形', label: '正方形' },
  { id: 'house-tri', triangles: 3, desc: '房子形状：屋顶和两半墙', label: '三角形' },
  { id: 'star-ish', triangles: 6, desc: '六角星里藏着小三角形', label: '三角形' },
]
const countShapes = (difficulty) => {
  const pool = difficulty === 1 ? COUNT_FIGURES.slice(0, 4) : COUNT_FIGURES
  const fig = pick(pool)
  const total = fig.triangles || fig.squares
  const options = shuffle([total, total + 1, Math.max(1, total - 1), total + 2].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)).map((v) => ({ value: v, label: `${v} 个` }))
  return {
    question: pick([
      `数一数，图里一共有几个${fig.label}？（大的小的都算）`,
      `${fig.desc}，一共几个${fig.label}？`,
      `仔细数：图中有几个${fig.label}？`,
    ]),
    speakText: `图里一共有几个${fig.label}？`,
    hint: '先数小的，再看看有没有大一点的。',
    options,
    isCorrect: (opt) => opt.value === total,
    columns: 4,
    countFigure: fig,
  }
}

const cellsKey = (cells) =>
  [...new Set((cells || []).map(([r, c]) => `${r},${c}`))].sort().join('|')

const HALF_FIGURES = [
  { id: 'bar', cells: [[1, 0], [1, 1]] },
  { id: 'L', cells: [[0, 0], [1, 0], [1, 1]] },
  { id: 'block', cells: [[0, 0], [0, 1], [1, 0], [1, 1]] },
  { id: 'zig', cells: [[0, 1], [1, 0], [1, 1]] },
  { id: 'T', cells: [[0, 0], [0, 1], [1, 1]] },
  { id: 'U', cells: [[0, 0], [1, 0], [2, 0], [2, 1]] },
  { id: 'stair', cells: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { id: 'plus', cells: [[0, 1], [1, 0], [1, 1], [2, 1]] },
]

const symmetry = (difficulty) => {
  const pool = difficulty === 1 ? HALF_FIGURES.slice(0, 4) : HALF_FIGURES
  const fig = pick(pool)
  const half = fig.cells.filter(([r, c]) => r >= 0 && r < 4 && c >= 0 && c <= 1)
  const mirrored = half.map(([r, c]) => [r, 3 - c])
  const correctCells = [...half, ...mirrored]
  const correctKey = cellsKey(correctCells)

  const wrongMakers = [
    () => [...half],
    () => [...half, ...mirrored.slice(0, Math.max(1, mirrored.length - 1))],
    () => [...half, ...mirrored, [(half[0][0] + 2) % 4, half[0][1]]],
    () => [...half, ...mirrored.map(([r, c]) => [(r + 1) % 4, c])],
    () => [...half, ...mirrored.map(([r, c]) => [r === 0 ? 3 : r - 1, c])],
    () => [...half, ...half.map(([r, c]) => [(r + 1) % 4, 3 - c])],
    () => [...half, ...mirrored.map(([r, c]) => [r, c === 2 ? 3 : 2])],
    () => {
      const extra = half.map(([r, c]) => [r, 3 - c])
      return [...half, ...extra.slice(1), [(half[0][0] + 1) % 4, 3]]
    },
  ]

  const wrongs = []
  const seen = new Set([correctKey])
  for (const make of shuffle(wrongMakers)) {
    const cells = make().filter(([r, c]) => r >= 0 && r < 4 && c >= 0 && c < 4)
    const key = cellsKey(cells)
    if (!key || seen.has(key)) continue
    seen.add(key)
    wrongs.push(cells)
    if (wrongs.length >= 3) break
  }
  while (wrongs.length < 3) {
    const r = randInt(0, 3)
    const cells = [...correctCells, [r, 0], [r, 3]].filter(([rr, cc], i, arr) =>
      arr.findIndex((x) => x[0] === rr && x[1] === cc) === i)
    const key = cellsKey(cells)
    if (seen.has(key)) continue
    seen.add(key)
    wrongs.push(cells)
  }

  const options = shuffle([
    { value: 'correct', cells: correctCells, correct: true },
    ...wrongs.slice(0, 3).map((cells, i) => ({ value: `w${i}`, cells, correct: false })),
  ])
  return {
    question: pick([
      '左边是图形的一半，哪一个是它完整的对称图形？',
      '照镜子一样补全右边，选正确的对称图。',
      '哪一张是左右对称的完整图形？',
    ]),
    speakText: '哪一个是完整的对称图形？',
    hint: '对称图形左右两边要一模一样，像照镜子。',
    options,
    isCorrect: (opt) => opt.correct,
    columns: 2,
    symmetry: { half, id: fig.id },
  }
}

const blockCount = (difficulty) => {
  const layers = difficulty === 1 ? 2 : difficulty === 2 ? 3 : randInt(3, 4)
  const perLayer = difficulty === 1 ? randInt(2, 3) : randInt(2, 4)
  const stack = Array.from({ length: layers }, (_, i) => Math.max(1, perLayer - (i % 2)))
  const total = stack.reduce((a, b) => a + b, 0)
  const options = shuffle([total, total + 1, Math.max(1, total - 1), total + 2].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)).map((v) => ({ value: v, label: `${v} 块` }))
  return {
    question: pick([
      '这堆积木一共有多少块？（藏起来的也要数）',
      `一共 ${layers} 层积木，总共几块？`,
      '连被挡住的也算上，一共几块积木？',
    ]),
    speakText: '这堆积木一共有多少块？',
    hint: '一层一层数，别忘了被挡住看不见的积木。',
    options,
    isCorrect: (opt) => opt.value === total,
    columns: 4,
    blocks: stack,
  }
}

const TANGRAM_PUZZLES = [
  {
    id: 'tri-hole',
    hole: 'M60 10 L110 10 L110 60 Z',
    correct: { d: 'M10 10 L60 10 L60 60 Z', name: '三角形' },
    others: [
      { d: 'M10 10 L60 10 L60 60 L10 60 Z', name: '正方形' },
      { d: 'M10 40 L35 10 L60 40 Z', name: '小三角' },
      { d: 'M10 10 L60 10 L45 60 L25 60 Z', name: '梯形' },
    ],
  },
  {
    id: 'sq-hole',
    hole: 'M60 20 L100 20 L100 60 L60 60 Z',
    correct: { d: 'M10 20 L50 20 L50 60 L10 60 Z', name: '正方形' },
    others: [
      { d: 'M10 60 L30 20 L50 60 Z', name: '三角形' },
      { d: 'M10 20 L50 20 L50 60 Z', name: '直角三角形' },
      { d: 'M10 20 L50 20 L40 60 L20 60 Z', name: '梯形' },
    ],
  },
  {
    id: 'para-hole',
    hole: 'M70 20 L110 20 L90 55 L50 55 Z',
    correct: { d: 'M10 20 L50 20 L30 55 L-10 55 Z', name: '平行四边形' },
    others: [
      { d: 'M10 10 L50 10 L50 50 L10 50 Z', name: '正方形' },
      { d: 'M10 50 L30 10 L50 50 Z', name: '三角形' },
      { d: 'M10 20 L50 20 L40 55 L20 55 Z', name: '梯形' },
    ],
  },
  {
    id: 'trap-hole',
    hole: 'M65 15 L105 15 L115 55 L55 55 Z',
    correct: { d: 'M10 15 L50 15 L60 55 L0 55 Z', name: '梯形' },
    others: [
      { d: 'M10 10 L55 10 L55 55 L10 55 Z', name: '长方形' },
      { d: 'M10 55 L35 15 L60 55 Z', name: '三角形' },
      { d: 'M15 15 L50 15 L50 50 L15 50 Z', name: '正方形' },
    ],
  },
  {
    id: 'rtri-hole',
    hole: 'M60 15 L110 55 L60 55 Z',
    correct: { d: 'M10 15 L60 55 L10 55 Z', name: '直角三角形' },
    others: [
      { d: 'M10 15 L55 15 L55 55 L10 55 Z', name: '正方形' },
      { d: 'M10 35 L35 10 L60 35 Z', name: '等腰三角' },
      { d: 'M10 20 L55 20 L45 55 L20 55 Z', name: '梯形' },
    ],
  },
  {
    id: 'dia-hole',
    hole: 'M85 10 L115 35 L85 60 L55 35 Z',
    correct: { d: 'M30 10 L60 35 L30 60 L0 35 Z', name: '菱形' },
    others: [
      { d: 'M10 15 L55 15 L55 55 L10 55 Z', name: '正方形' },
      { d: 'M10 55 L35 15 L60 55 Z', name: '三角形' },
      { d: 'M10 20 L50 20 L60 55 L0 55 Z', name: '梯形' },
    ],
  },
]
const tangram = (difficulty) => {
  const pool = difficulty === 1 ? TANGRAM_PUZZLES.slice(0, 3) : TANGRAM_PUZZLES
  const p = pick(pool)
  const options = shuffle([
    { value: 'correct', d: p.correct.d, name: p.correct.name, correct: true },
    ...p.others.map((o, i) => ({ value: `w${i}`, d: o.d, name: o.name, correct: false })),
  ])
  return {
    question: pick([
      '图形上缺了一块，哪一块正好能补上去？',
      `缺口像${p.correct.name}，选能补上的那一块。`,
      '哪一块拼进去刚刚好？',
    ]),
    speakText: '哪一块正好能补上缺口的形状？',
    hint: '看看缺口是什么形状，找一模一样的。',
    options,
    isCorrect: (opt) => opt.correct,
    columns: 4,
    tangram: { hole: p.hole, id: p.id },
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
  generateUnique(() => generators[gameId](difficulty), count)
