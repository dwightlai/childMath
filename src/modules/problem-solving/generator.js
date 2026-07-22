// Question generators for the Problem Solving module (quiz-style: route counting).
import { randInt, pick, shuffle, generateUnique } from '../../utils/helpers'

// ---- 路线探索 (route): count paths on a small grid ----
// Grid from top-left to bottom-right moving only right/down.
// Number of paths on an m x n grid = C(m+n, m). We keep grids tiny.
const binom = (n, k) => {
  if (k < 0 || k > n) return 0
  k = Math.min(k, n - k)
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return Math.round(r)
}
const pathCount = (rows, cols) => binom(rows + cols - 2, rows - 1)

const ROUTE_GRIDS = [
  { rows: 2, cols: 2 },
  { rows: 2, cols: 3 },
  { rows: 3, cols: 2 },
  { rows: 2, cols: 4 },
  { rows: 4, cols: 2 },
  { rows: 3, cols: 3 },
  { rows: 3, cols: 4 },
  { rows: 4, cols: 3 },
].map((g) => ({ ...g, paths: pathCount(g.rows, g.cols) }))

const route = (difficulty) => {
  const pool = difficulty === 1
    ? ROUTE_GRIDS.filter((g) => g.paths <= 4)
    : difficulty === 2
      ? ROUTE_GRIDS.filter((g) => g.paths <= 6)
      : ROUTE_GRIDS
  const g = pick(pool)
  const options = shuffle([g.paths, g.paths + 1, Math.max(1, g.paths - 1), g.paths + 2]
    .filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)).map((v) => ({ value: v, label: `${v} 条` }))
  const needR = g.cols - 1
  const needD = g.rows - 1
  return {
    question: pick([
      `只能向右或向下走，从 🏠 到 🏫 一共有几条不同的路线？`,
      `从家到学校只能向右、向下，一共有几条路？（要走 ${needR} 步右、${needD} 步下）`,
      `地图有 ${g.rows} 行 ${g.cols} 列，只能向右或向下，从 🏠 到 🏫 有几条路线？`,
    ]),
    speakText: '从起点到终点一共有几条不同的路线？',
    hint: '用手指把每条路线都走一遍，别重复也别漏掉。',
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
      text: pick([
        `超市里苹果 ${a} 元，香蕉 ${b} 元，两样一起买要几元？`,
        `买面包 ${a} 元、牛奶 ${b} 元，一共要付多少元？`,
      ]),
      answer: `${a} + ${b} = ${a + b}`,
      hint: '两样一起买，要把价钱合起来。',
    }
  },
  () => {
    const money = randInt(8, 15), cost = randInt(2, money - 1)
    return {
      text: pick([
        `你有 ${money} 元，买了一支 ${cost} 元的笔，应找回几元？`,
        `付给收银员 ${money} 元，东西 ${cost} 元，找回几元？`,
      ]),
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
  () => {
    const h = randInt(1, 11)
    return {
      text: pick([
        '看钟面：现在是几点？',
        '钟面上指针像图中这样，现在几点整？',
      ]),
      answer: `${h} 点`,
      hint: '分针（长针）指 12 就是整点，看短针指几。',
      options: shuffle([`${h} 点`, `${h + 1} 点`, `${Math.max(1, h - 1)} 点`, `${h} 点半`]).map((v) => ({ value: v, label: v })),
      clock: { hour: h, minute: 0 },
    }
  },
  () => {
    const h = randInt(1, 10)
    return {
      text: '看钟面：现在是这个时刻，再过 1 小时是几点？',
      answer: `${h + 1} 点`,
      hint: '过 1 小时，时针往前走一格。',
      options: shuffle([`${h + 1} 点`, `${h} 点`, `${h + 2} 点`, `${h} 点半`]).map((v) => ({ value: v, label: v })),
      clock: { hour: h, minute: 0 },
    }
  },
  () => {
    const price = randInt(3, 8), pay = randInt(price + 2, 20)
    return {
      text: pick([
        `一支笔 ${price} 元，付 ${pay} 元，找回几元？`,
        `玩具 ${price} 元，妈妈给了 ${pay} 元，应找回几元？`,
      ]),
      answer: `${pay} - ${price} = ${pay - price}`,
      hint: '付的钱减去价钱，就是找回的。',
    }
  },
  () => {
    const front = randInt(2, 5), back = randInt(2, 5)
    return {
      text: `排队时前面有 ${front} 人，后面有 ${back} 人，一共几人（含自己）？`,
      answer: `${front} + ${back} + 1 = ${front + back + 1}`,
      hint: '别忘了把自己也算进去。',
    }
  },
  () => {
    const a = randInt(5, 12), b = randInt(2, a - 1), c = randInt(1, 4)
    return {
      text: `书架上有 ${a} 本故事书，借走 ${b} 本，又放回 ${c} 本，现在几本？`,
      answer: `${a} - ${b} + ${c} = ${a - b + c}`,
      hint: '先减再加，一步一步算。',
    }
  },
]
const lifeMath = () => {
  const s = pick(LIFE_TEMPLATES)()
  if (s.clock || s.isClock) {
    return {
      question: s.text,
      speakText: s.text,
      hint: s.hint,
      options: s.options,
      isCorrect: (opt) => opt.value === s.answer,
      columns: 2,
      clock: s.clock,
    }
  }
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
  generateUnique(() => generators[gameId](difficulty), count)
