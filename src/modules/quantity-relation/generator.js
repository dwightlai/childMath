// Question generators for the Quantity Relation module.
import { randInt, pick, shuffle } from '../../utils/helpers'

const NAMES = ['小明', '小红', '小刚', '小丽', '小兔', '小熊']
const THINGS = [
  { name: '糖', emoji: '🍬' }, { name: '苹果', emoji: '🍎' }, { name: '铅笔', emoji: '✏️' },
  { name: '贴纸', emoji: '🌟' }, { name: '饼干', emoji: '🍪' }, { name: '气球', emoji: '🎈' },
]

// 故事小剧场: word problem -> choose the correct expression.
const storyTheater = (difficulty) => {
  const type = pick(['total', 'remain', 'more'])
  const t = pick(THINGS)
  const n1 = randInt(3, difficulty === 1 ? 9 : 15)
  const n2 = randInt(2, difficulty === 1 ? 9 : 15)
  let question, answer, speakText, hint
  if (type === 'total') {
    const a = randInt(2, 9), b = randInt(2, 9)
    question = `${pick(NAMES)}有 ${a} 个${t.name}，又买了 ${b} 个，一共有多少个？`
    speakText = question
    answer = `${a} + ${b} = ${a + b}`
    hint = '"又买了"表示变多了，要用加法。'
  } else if (type === 'remain') {
    const a = randInt(5, 15), b = randInt(1, a - 1)
    question = `${pick(NAMES)}有 ${a} 个${t.name}，吃掉了 ${b} 个，还剩多少个？`
    speakText = question
    answer = `${a} - ${b} = ${a - b}`
    hint = '"吃掉了"表示变少了，要用减法。'
  } else {
    const a = randInt(3, 12), b = randInt(1, 6)
    question = `${pick(NAMES)}有 ${a} 个${t.name}，${pick(NAMES)}比他多 ${b} 个，${pick(NAMES)}有几个？`
    speakText = question
    answer = `${a} + ${b} = ${a + b}`
    hint = '"比他多"就是在他上面再加。'
  }
  // build distractor expressions
  const nums = question.match(/\d+/g).map(Number)
  const [x, y] = [nums[0], nums[1] || 1]
  const pool = [
    `${x} + ${y} = ${x + y}`,
    `${x} - ${y} = ${x - y}`,
    `${x} + ${y} = ${x + y + 1}`,
    `${y} + ${x} = ${x + y - 1}`,
  ]
  const options = shuffle([...new Set(pool.includes(answer) ? pool : [answer, ...pool])]).slice(0, 4)
  if (!options.includes(answer)) options[0] = answer
  return {
    question, speakText, hint,
    options: shuffle(options).map((v) => ({ value: v })),
    isCorrect: (opt) => opt.value === answer,
    columns: 2,
    story: { emoji: t.emoji },
  }
}

// 摆一摆: which picture matches the sentence (more/less representation).
const arrange = (difficulty) => {
  const t = pick(THINGS)
  const a = randInt(3, 8)
  const b = randInt(3, 8)
  const rel = a > b ? 'more' : a < b ? 'less' : 'equal'
  const question = `第一行摆 ${a} 个${t.name}，第二行摆 ${b} 个。哪句话是对的？`
  const options = shuffle([
    { value: 'first-more', label: `第一行比第二行多`, correct: rel === 'more' },
    { value: 'second-more', label: `第二行比第一行多`, correct: rel === 'less' },
    { value: 'equal', label: '两行同样多', correct: rel === 'equal' },
  ])
  return {
    question,
    speakText: question,
    hint: '把两行一个一个对着比，多出来的那行就多。',
    options,
    isCorrect: (opt) => opt.correct,
    columns: 3,
    rows: { a, b, emoji: t.emoji },
  }
}

// 谁多谁少: compare two rows, choose the difference.
const moreLess = (difficulty) => {
  const t = pick(THINGS)
  const a = randInt(4, difficulty === 1 ? 9 : 15)
  let b = randInt(4, difficulty === 1 ? 9 : 15)
  if (b === a) b = a + randInt(1, 3)
  const diff = Math.abs(a - b)
  const question = `上面一排有 ${a} 个，下面一排有 ${b} 个，多的比少的多几个？`
  const options = shuffle([diff, diff + 1, Math.max(1, diff - 1), diff + 2].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4)).map((v) => ({ value: v, label: `${v} 个` }))
  return {
    question,
    speakText: `多的比少的多几个？`,
    hint: '把上下两排一个一个对着看，多出来几个？',
    options,
    isCorrect: (opt) => opt.value === diff,
    columns: 4,
    rows: { a, b, emoji: t.emoji },
  }
}

// 条件小侦探: pick the useful condition.
const detective = (difficulty) => {
  const t = pick(THINGS)
  const a = randInt(3, 10)
  const b = randInt(2, 8)
  const irrelevant = pick([
    '今天天气很好', `${pick(NAMES)}穿了红色的衣服`, '他们住在三楼', '现在是星期六',
  ])
  const question = `想知道"${pick(NAMES)}一共有多少${t.name}"，哪个条件有用？`
  const options = shuffle([
    { value: 'useful', label: `他有 ${a} 个，又得到 ${b} 个`, correct: true },
    { value: 'useless1', label: irrelevant, correct: false },
    { value: 'useless2', label: `${pick(NAMES)}喜欢${t.name}`, correct: false },
  ])
  return {
    question,
    speakText: question,
    hint: '有用的条件里要有数字，能帮我们算出答案。',
    options,
    isCorrect: (opt) => opt.correct,
    columns: 1,
  }
}

// 一题多解: which expressions ALL solve the problem (pick the correct one, multiple valid).
const multiSolve = (difficulty) => {
  const a = randInt(3, 8)
  const b = randInt(2, 7)
  const total = a + b
  const question = `${a} + ${b} 可以怎么算？下面哪个算式是对的？`
  const correctAlt = `${b} + ${a} = ${total}`
  const options = shuffle([
    { value: correctAlt, label: correctAlt, correct: true },
    { value: 'w1', label: `${a} + ${b} = ${total + 1}`, correct: false },
    { value: 'w2', label: `${a} - ${b} = ${total}`, correct: false },
    { value: 'w3', label: `${a} + ${b} = ${total - 1}`, correct: false },
  ])
  return {
    question,
    speakText: `加法的两个数交换位置，结果会一样吗？`,
    hint: '加法交换一下两个数的位置，结果不变哦。',
    options,
    isCorrect: (opt) => opt.correct,
    columns: 2,
  }
}

export const generators = {
  'story-theater': storyTheater,
  arrange,
  'more-less': moreLess,
  detective,
  'multi-solve': multiSolve,
}

export const generate = (gameId, difficulty, count) =>
  Array.from({ length: count }, () => generators[gameId](difficulty))
