// Question generators for the Problem Solving module (quiz-style: route counting).
import { randInt, pick, shuffle } from '../../utils/helpers'

// ---- 路线探索 (route): count paths on a small grid ----
// Grid from top-left to bottom-right moving only right/down.
// Number of paths on an m x n grid = C(m+n, m). We keep grids tiny.
const ROUTE_GRIDS = [
  { rows: 2, cols: 2, paths: 2 },  // 1x1 steps -> C(2,1)=2
  { rows: 2, cols: 3, paths: 3 },  // C(3,1)=3
  { rows: 3, cols: 3, paths: 6 },  // C(4,2)=6
]
const route = (difficulty) => {
  const g = difficulty === 1 ? pick(ROUTE_GRIDS.slice(0, 2)) : pick(ROUTE_GRIDS)
  const options = shuffle([g.paths, g.paths + 1, Math.max(1, g.paths - 1), g.paths + 2]
    .filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)).map((v) => ({ value: v, label: `${v} 条` }))
  return {
    question: '只能向右或向下走，从 🏠 到 🏫 一共有几条不同的路线？',
    speakText: '从起点到终点一共有几条不同的路线？',
    hint: '试着用手指把每条路线都走一遍，别重复也别漏掉。',
    options,
    isCorrect: (opt) => opt.value === g.paths,
    columns: 4,
    routeGrid: g,
  }
}

// ---- 生活数学 (life-math): turn a real-life scene into the right expression ----
const LIFE_TEMPLATES = [
  () => {
    const a = randInt(2, 9), b = randInt(2, 9)
    return {
      text: `超市里苹果 ${a} 元，香蕉 ${b} 元，两样一起买要几元？`,
      answer: `${a} + ${b} = ${a + b}`,
      hint: '两样一起买，要把价钱合起来。',
    }
  },
  () => {
    const money = randInt(8, 15), cost = randInt(2, money - 1)
    return {
      text: `你有 ${money} 元，买了一支 ${cost} 元的笔，应找回几元？`,
      answer: `${money} - ${cost} = ${money - cost}`,
      hint: '找回的钱 = 付出的 - 花掉的。',
    }
  },
  () => {
    const start = randInt(6, 12), off = randInt(1, start - 3), on = randInt(1, 5)
    return {
      text: `车上有 ${start} 人，到站下去 ${off} 人，又上来 ${on} 人，现在车上有几人？`,
      answer: `${start} - ${off} + ${on} = ${start - off + on}`,
      hint: '先减下去的，再加上来的。',
    }
  },
  () => {
    const a = randInt(3, 9), b = randInt(2, 8)
    return {
      text: `小明有 ${a} 颗糖，小红又给了他 ${b} 颗，现在一共有几颗？`,
      answer: `${a} + ${b} = ${a + b}`,
      hint: '"又给了"表示变多，用加法。',
    }
  },
  () => {
    const total = randInt(8, 15), eaten = randInt(2, total - 2)
    return {
      text: `盘子里有 ${total} 块饼干，吃掉 ${eaten} 块，还剩几块？`,
      answer: `${total} - ${eaten} = ${total - eaten}`,
      hint: '"吃掉"表示变少，用减法。',
    }
  },
]
const lifeMath = () => {
  const s = pick(LIFE_TEMPLATES)()
  const nums = s.text.match(/\d+/g).map(Number)
  const [x, y] = [nums[0], nums[1] || 1]
  const pool = [
    `${x} + ${y} = ${x + y}`,
    `${x} - ${y} = ${x - y}`,
    `${x} + ${y} = ${x + y + 1}`,
    `${x} - ${y} = ${Math.max(0, x - y - 1)}`,
  ]
  const options = [...new Set(pool.includes(s.answer) ? pool : [s.answer, ...pool])].slice(0, 4)
  if (!options.includes(s.answer)) options[0] = s.answer
  return {
    question: s.text,
    speakText: s.text,
    hint: s.hint,
    options: shuffle(options).map((v) => ({ value: v, label: v })),
    isCorrect: (opt) => opt.value === s.answer,
    columns: 2,
  }
}

export const generators = { route, 'life-math': lifeMath }

export const generate = (gameId, difficulty, count) =>
  Array.from({ length: count }, () => generators[gameId](difficulty))
