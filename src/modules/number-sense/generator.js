// Question generators for the Number Sense module.
import { randInt, pick, shuffle, numericOptions } from '../../utils/helpers'

const ITEMS = ['🍎', '🍓', '🍊', '🍇', '🍬', '⭐', '🐟', '🌸', '🐤', '🍩']

// 凑十游戏: given n, pick the number that makes 10.
const makeTen = (difficulty) => {
  const n = difficulty === 1 ? randInt(1, 9) : difficulty === 2 ? randInt(2, 9) : randInt(3, 9)
  const answer = 10 - n
  return {
    question: `${n} 和谁是好朋友，合起来是 10？`,
    speakText: `${n}和谁合起来是10？`,
    hint: `从 ${n} 开始往后数，数到 10 要数几个？`,
    options: numericOptions(answer, 4, 3).map((v) => ({ value: v })),
    isCorrect: (opt) => opt.value === answer,
    columns: 4,
  }
}

// 数字拆分: given total and one part, find the other part.
const splitNumber = (difficulty) => {
  const total = difficulty === 1 ? randInt(5, 10) : difficulty === 2 ? randInt(8, 15) : randInt(10, 20)
  const part = randInt(1, total - 1)
  const answer = total - part
  return {
    question: `把 ${total} 分成 ${part} 和另一个数，另一个数是多少？`,
    speakText: `把${total}分成${part}和另一个数，另一个数是多少？`,
    hint: `想一想：${part} 再加几就是 ${total}？`,
    options: numericOptions(answer, 4, 3).map((v) => ({ value: v })),
    isCorrect: (opt) => opt.value === answer,
    columns: 4,
    visual: { total, part },
  }
}

// 快速点数: count the items shown.
const quickCount = (difficulty) => {
  const count = difficulty === 1 ? randInt(3, 9) : difficulty === 2 ? randInt(6, 15) : randInt(10, 20)
  const item = pick(ITEMS)
  return {
    question: '数一数，下面一共有多少个？',
    speakText: '数一数，下面一共有多少个？',
    hint: '一个一个慢慢数，别漏掉哦。',
    options: numericOptions(count, 4, 2).map((v) => ({ value: v })),
    isCorrect: (opt) => opt.value === count,
    columns: 4,
    countItems: { count, item },
  }
}

// 数字找朋友: which two numbers make the target?
const findFriend = (difficulty) => {
  const target = difficulty === 1 ? 10 : difficulty === 2 ? randInt(10, 15) : randInt(12, 20)
  const a = randInt(1, target - 1)
  const b = target - a
  // options are pairs; only one pair sums to target
  const pairs = [[a, b]]
  let guard = 0
  while (pairs.length < 4 && guard < 50) {
    const x = randInt(1, target - 1)
    const y = randInt(1, target + 3)
    if (x + y !== target && !pairs.some(([p, q]) => p === x && q === y)) pairs.push([x, y])
    guard++
  }
  return {
    question: `哪两个数字合起来是 ${target}？`,
    speakText: `哪两个数字合起来是${target}？`,
    hint: `试试把两个数加一加，看谁等于 ${target}。`,
    options: shuffle(pairs).map(([x, y]) => ({ value: `${x}+${y}`, label: `${x} 和 ${y}` })),
    isCorrect: (opt) => opt.value === `${a}+${b}`,
    columns: 2,
  }
}

// 比大小: compare two numbers or simple expressions.
const compare = (difficulty) => {
  const useExpr = difficulty >= 2
  let left, right, leftVal, rightVal
  if (useExpr) {
    const a = randInt(2, 10), b = randInt(1, 9)
    leftVal = a + b
    left = `${a} + ${b}`
    const c = randInt(2, 10), d = randInt(1, 9)
    rightVal = c + d
    right = `${c} + ${d}`
  } else {
    leftVal = randInt(1, difficulty === 1 ? 20 : 50)
    rightVal = randInt(1, difficulty === 1 ? 20 : 50)
    left = `${leftVal}`
    right = `${rightVal}`
  }
  const answer = leftVal > rightVal ? '>' : leftVal < rightVal ? '<' : '='
  return {
    question: `比一比：${left}  ○  ${right}，○ 里填什么？`,
    speakText: `${left}和${right}比，哪个大？`,
    hint: '先算一算两边各是多少，再比较。',
    options: [{ value: '>', label: '＞ 大于' }, { value: '<', label: '＜ 小于' }, { value: '=', label: '＝ 等于' }],
    isCorrect: (opt) => opt.value === answer,
    columns: 3,
    compare: { left, right },
  }
}

// 估一估: estimate the number of items.
const estimate = (difficulty) => {
  const count = difficulty === 1 ? randInt(10, 20) : difficulty === 2 ? randInt(20, 40) : randInt(30, 60)
  const item = pick(ITEMS)
  // options: correct rounded bucket + distractors
  const bucket = Math.round(count / 10) * 10
  const opts = new Set([bucket])
  ;[bucket - 10, bucket + 10, bucket - 20, bucket + 20].forEach((v) => v > 0 && opts.add(v))
  const options = shuffle([...opts]).slice(0, 4)
  if (!options.includes(bucket)) options[0] = bucket
  return {
    question: '不用一个一个数，估一估大约有多少个？',
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
