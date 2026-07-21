// Question generators for the Number Sense module — multiple stems per game.
import { randInt, pick, shuffle, numericOptions } from '../../utils/helpers'

const ITEMS = ['🍎', '🍓', '🍊', '🍇', '🍬', '⭐', '🐟', '🌸', '🐤', '🍩']
const NAMES = ['小明', '小红', '小兔', '小熊', '老师', '妈妈']

const makeTen = (difficulty) => {
  const target = difficulty === 1 ? 10 : difficulty === 2 ? pick([10, 10, 20]) : pick([10, 20, 100])
  const n = difficulty === 1 ? randInt(1, 9) : difficulty === 2 ? randInt(2, target - 1) : randInt(Math.max(1, target - 30), target - 1)
  const answer = target - n
  const stems = [
    { question: `${n} 和谁合起来是 ${target}？`, speak: `${n}和谁合起来是${target}？`, hint: `${target} 减 ${n} 等于几？` },
    { question: `${pick(NAMES)}有 ${n} 颗糖，还要几颗才够 ${target} 颗？`, speak: `有${n}颗，还要几颗才够${target}颗？`, hint: `从 ${n} 数到 ${target}。` },
    { question: `□ + ${n} = ${target}，方框里填几？`, speak: `几加${n}等于${target}？`, hint: `${target} 减 ${n}。` },
    { question: `数轴上从 ${n} 跳到 ${target}，要跳几格？`, speak: `从${n}跳到${target}要跳几格？`, hint: '数一数中间隔了几格。' },
  ]
  const s = pick(stems)
  return {
    question: s.question,
    speakText: s.speak,
    hint: s.hint,
    options: numericOptions(answer, 4, 3).map((v) => ({ value: v })),
    isCorrect: (opt) => opt.value === answer,
    columns: 4,
  }
}

const splitNumber = (difficulty) => {
  const total = difficulty === 1 ? randInt(5, 10) : difficulty === 2 ? randInt(8, 15) : randInt(10, 20)
  const part = randInt(1, total - 1)
  const answer = total - part
  const stems = [
    { q: `把 ${total} 分成 ${part} 和另一个数，另一个数是多少？`, h: `${part} 再加几就是 ${total}？` },
    { q: `${total} = ${part} + □，□ 是几？`, h: `${total} 减 ${part}。` },
    { q: `${pick(NAMES)}有 ${total} 支笔，借出 ${part} 支，还剩几支？`, h: '借出去了，要用减法。' },
    { q: `左边 ${part} 个，一共 ${total} 个，右边有几个？`, h: '右边 = 一共 − 左边。' },
  ]
  const s = pick(stems)
  return {
    question: s.q,
    speakText: s.q,
    hint: s.h,
    options: numericOptions(answer, 4, 3).map((v) => ({ value: v })),
    isCorrect: (opt) => opt.value === answer,
    columns: 4,
    visual: { total, part },
  }
}

const quickCount = (difficulty) => {
  const count = difficulty === 1 ? randInt(3, 9) : difficulty === 2 ? randInt(6, 15) : randInt(10, 20)
  const item = pick(ITEMS)
  const rows = difficulty >= 2 && count >= 6 ? randInt(2, 3) : 1
  const stems = rows > 1
    ? [
        { q: `一共摆了 ${rows} 行，请数出总数。`, h: '可以一行一行加起来。' },
        { q: '图里一共有多少个？先估再数。', h: '先看大概，再仔细数。' },
      ]
    : [
        { q: '数一数，下面一共有多少个？', h: '一个一个慢慢数。' },
        { q: `${pick(NAMES)}收集了这些，一共几个？`, h: '指着数，数完再说。' },
        { q: '盖住一个再数，一共几个？', h: '别漏掉，也别多数。' },
      ]
  const s = pick(stems)
  return {
    question: s.q,
    speakText: s.q,
    hint: s.h,
    options: numericOptions(count, 4, 2).map((v) => ({ value: v })),
    isCorrect: (opt) => opt.value === count,
    columns: 4,
    countItems: { count, item },
  }
}

const findFriend = (difficulty) => {
  const target = difficulty === 1 ? 10 : difficulty === 2 ? randInt(10, 15) : randInt(12, 20)
  const a = randInt(1, target - 1)
  const b = target - a
  const pairs = [[a, b]]
  let guard = 0
  while (pairs.length < 4 && guard < 50) {
    const x = randInt(1, target - 1)
    const y = randInt(1, target + 3)
    if (x + y !== target && !pairs.some(([p, q]) => p === x && q === y)) pairs.push([x, y])
    guard++
  }
  const stems = [
    `哪两个数字合起来是 ${target}？`,
    `谁和谁是 ${target} 的好朋友？`,
    `下面哪一组加起来等于 ${target}？`,
    `${pick(NAMES)}想凑成 ${target}，该选哪一对？`,
  ]
  return {
    question: pick(stems),
    speakText: `哪两个数合起来是${target}？`,
    hint: `试试把两个数加一加，看谁等于 ${target}。`,
    options: shuffle(pairs).map(([x, y]) => ({ value: `${x}+${y}`, label: `${x} 和 ${y}` })),
    isCorrect: (opt) => opt.value === `${a}+${b}`,
    columns: 2,
  }
}

const compare = (difficulty) => {
  const mode = difficulty === 1 ? pick(['num', 'num', 'story']) : difficulty === 2 ? pick(['num', 'expr', 'story']) : pick(['expr', 'expr', 'story'])
  let left, right, leftVal, rightVal, question, speak
  if (mode === 'expr') {
    const a = randInt(2, 10), b = randInt(1, 9)
    leftVal = a + b
    left = `${a} + ${b}`
    const c = randInt(2, 10), d = randInt(1, 9)
    rightVal = c + d
    right = `${c} + ${d}`
    question = `比一比：${left}  ○  ${right}`
    speak = `${left}和${right}比大小`
  } else if (mode === 'story') {
    leftVal = randInt(1, difficulty === 1 ? 20 : 50)
    rightVal = randInt(1, difficulty === 1 ? 20 : 50)
    left = `${leftVal}`
    right = `${rightVal}`
    const t = pick(['苹果', '贴纸', '气球'])
    question = `${pick(NAMES)}有 ${leftVal} 个${t}，${pick(NAMES)}有 ${rightVal} 个，谁的多？选符号比较：${leftVal} ○ ${rightVal}`
    speak = `${leftVal}和${rightVal}比谁大`
  } else {
    leftVal = randInt(1, difficulty === 1 ? 20 : difficulty === 2 ? 50 : 99)
    rightVal = randInt(1, difficulty === 1 ? 20 : difficulty === 2 ? 50 : 99)
    left = `${leftVal}`
    right = `${rightVal}`
    question = pick([
      `比一比：${left}  ○  ${right}，○ 里填什么？`,
      `${left} 和 ${right}，用 ＞ ＜ ＝ 怎么连？`,
      `数线上 ${left} 在 ${right} 的哪边？选对的符号：${left} ○ ${right}`,
    ])
    speak = `${left}和${right}比，哪个大？`
  }
  const answer = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '='
  return {
    question,
    speakText: speak,
    hint: '先看两边各是多少，再比较。',
    options: [{ value: '>', label: '＞ 大于' }, { value: '<', label: '＜ 小于' }, { value: '=', label: '＝ 等于' }],
    isCorrect: (opt) => opt.value === answer,
    columns: 3,
    compare: { left, right },
  }
}

const estimate = (difficulty) => {
  const count = difficulty === 1 ? randInt(10, 20) : difficulty === 2 ? randInt(20, 40) : randInt(30, 60)
  const item = pick(ITEMS)
  const bucket = Math.round(count / 10) * 10
  const opts = new Set([bucket])
  ;[bucket - 10, bucket + 10, bucket - 20, bucket + 20].forEach((v) => v > 0 && opts.add(v))
  const options = shuffle([...opts]).slice(0, 4)
  if (!options.includes(bucket)) options[0] = bucket
  const stems = [
    '不用一个一个数，估一估大约有多少个？',
    '先看一小堆，再估计整堆大约几个？',
    `${pick(NAMES)}说“大概几十个”，你觉得最接近哪个？`,
  ]
  return {
    question: pick(stems),
    speakText: '估一估，大约有多少个？',
    hint: '先数一小堆有几个，再估计一共有几堆。',
    options: shuffle(options).map((v) => ({ value: v, label: `大约 ${v} 个` })),
    isCorrect: (opt) => opt.value === bucket,
    columns: 2,
    countItems: { count, item, scattered: true },
  }
}

export const generators = {
  'make-ten': makeTen,
  'split-number': splitNumber,
  'quick-count': quickCount,
  'find-friend': findFriend,
  compare,
  estimate,
}

export const generate = (gameId, difficulty, count) =>
  Array.from({ length: count }, () => generators[gameId](difficulty))
