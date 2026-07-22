// Question generators for the Pattern module.
import { randInt, pick, shuffle, generateUnique } from '../../utils/helpers'

const SHAPES = ['🔴', '🔵', '🟢', '🟡', '🟣', '🔶']
const SHAPE_NAMES = { '🔴': '红圆', '🔵': '蓝圆', '🟢': '绿圆', '🟡': '黄圆', '🟣': '紫圆', '🔶': '橙方块' }

// 接龙填空: number sequence, find the next.
const sequence = (difficulty) => {
  const kind = difficulty === 1
    ? pick(['+1', '+2', '-1', 'alt'])
    : difficulty === 2
      ? pick(['+2', '+3', '-1', '-2', 'alt', '+1-1'])
      : pick(['+2', '+3', '+5', '-2', '-3', 'alt', '+1-1', 'double-ish'])
  const start = randInt(difficulty === 3 ? 5 : 1, difficulty === 1 ? 10 : 20)

  let seq, answer, hint
  if (kind === 'alt') {
    const a = start
    const b = start + pick([1, 2, 3])
    seq = [a, b, a, b]
    answer = a
    hint = '两个数轮流出现。'
  } else if (kind === '+1-1') {
    seq = [start, start + 1, start, start + 1]
    answer = start
    hint = '先加 1 再减 1，来回跳。'
  } else if (kind === 'double-ish') {
    const step = pick([2, 3])
    seq = Array.from({ length: 4 }, (_, i) => start + step * i)
    answer = start + step * 4
    hint = `每次加 ${step}。`
  } else {
    const step = Number(kind)
    let built = Array.from({ length: 4 }, (_, i) => start + step * i)
    if (built.some((n) => n < 1)) {
      const s = Math.abs(step)
      const base = s * 4 + randInt(2, 8)
      built = Array.from({ length: 4 }, (_, i) => base - s * i)
    }
    seq = built
    const step2 = seq[1] - seq[0]
    answer = seq[3] + step2
    hint = `看看每次${step2 > 0 ? '加' : '减'}${Math.abs(step2)}？`
  }

  const options = shuffle([answer, answer + 1, Math.max(1, answer - 1), answer + 2].filter((v, i, a) => a.indexOf(v) === i && v > 0).slice(0, 4)).map((v) => ({ value: v }))
  return {
    question: pick([
      '找规律，空格里应该填什么数？',
      `小火车开过来了：${seq.join('、')}、？ 下一站是几？`,
      `按规律往下写，${seq[seq.length - 1]} 后面是几？`,
    ]),
    speakText: '找规律，空格里应该填什么数？',
    hint,
    options,
    isCorrect: (opt) => opt.value === answer,
    columns: 4,
    seq: { items: seq, isNumber: true },
  }
}

// 找不同: find the odd one out.
const oddOneOut = (difficulty) => {
  const type = pick(['category', 'shape'])
  if (type === 'category') {
    const sets = [
      { items: ['🍎', '🍌', '🍇', '🚗'], odd: '🚗', why: '汽车不是水果' },
      { items: ['🐶', '🐱', '🐰', '🌸'], odd: '🌸', why: '花不是小动物' },
      { items: ['✏️', '📏', '📚', '🍰'], odd: '🍰', why: '蛋糕不是学习用品' },
      { items: ['👟', '🧦', '🧤', '🍩'], odd: '🍩', why: '甜甜圈不是穿戴的' },
      { items: ['⚽', '🏀', '🎾', '🍕'], odd: '🍕', why: '披萨不是球' },
    ]
    const s = pick(sets)
    return {
      question: '哪一个和别人不一样？',
      speakText: '哪一个和别人不一样？',
      hint: `想一想：${s.why}。`,
      options: shuffle(s.items).map((v) => ({ value: v, emoji: v, label: '' })),
      isCorrect: (opt) => opt.value === s.odd,
      columns: 4,
      big: true,
    }
  }
  // shape odd-one: one shape differs
  const main = pick(SHAPES)
  let odd = pick(SHAPES)
  while (odd === main) odd = pick(SHAPES)
  const items = [main, main, main, odd, main]
  return {
    question: '哪一个图形不一样？',
    speakText: '哪一个图形不一样？',
    hint: '大部分都是一样的，只有一个不同。',
    options: shuffle(items).map((v, i) => ({ value: `${v}-${i}`, emoji: v, label: '', odd: v === odd })),
    isCorrect: (opt) => opt.odd,
    columns: 5,
    big: true,
  }
}

// 规律设计师: child continues a pattern they see (free creation -> simplified to "what comes next in this repeating pattern")
const designer = (difficulty) => {
  const a = pick(SHAPES)
  let b = pick(SHAPES)
  while (b === a) b = pick(SHAPES)
  let c = pick(SHAPES)
  while (c === a || c === b) c = pick(SHAPES)
  const useAbc = difficulty >= 2 && Math.random() < 0.45
  const pattern = useAbc ? [a, b, c, a, b, c] : [a, b, a, b, a, b]
  const answer = a
  const opts = useAbc ? [a, b, c] : [a, b]
  while (opts.length < 2) opts.push(pick(SHAPES))
  return {
    question: pick([
      '这个规律是你设计的：接下来应该放什么？',
      '按规律排下去，下一个图形是？',
      `前面是 ${pattern.slice(0, 4).join('')}…，下一个？`,
    ]),
    speakText: '接下来应该放什么图形？',
    hint: useAbc ? '三个一组循环。' : '看看它是按照什么顺序重复的。',
    options: shuffle(opts).map((v) => ({ value: v, emoji: v, label: '' })),
    isCorrect: (opt) => opt.value === answer,
    columns: opts.length,
    seq: { items: pattern },
    big: true,
  }
}

// 图形变换: predict next shape in a repeating shape pattern.
const shapePattern = (difficulty) => {
  const len = difficulty === 1 ? 2 : 3
  const chosen = shuffle(SHAPES).slice(0, len)
  const seq = Array.from({ length: 6 }, (_, i) => chosen[i % len])
  const answer = chosen[6 % len]
  const options = shuffle(SHAPES).slice(0, 4)
  if (!options.includes(answer)) options[0] = answer
  return {
    question: '图形排队的规律是什么？下一个是谁？',
    speakText: '下一个图形是谁？',
    hint: `它们是 ${chosen.map((s) => SHAPE_NAMES[s]).join('、')} 这样重复的。`,
    options: shuffle(options).map((v) => ({ value: v, emoji: v, label: '' })),
    isCorrect: (opt) => opt.value === answer,
    columns: 4,
    seq: { items: seq },
    big: true,
  }
}

// 对错判断: is the given next item correct?
const judge = (difficulty) => {
  const kind = difficulty === 1
    ? pick(['+2', '+3', '-1', 'alt'])
    : pick(['+2', '+3', '-1', '-2', 'alt'])
  const start = randInt(2, 10)
  let seq, correctNext, hint
  if (kind === 'alt') {
    const b = start + pick([1, 2, 3])
    seq = [start, b, start, b]
    correctNext = start
    hint = '两个数轮流出现，看下一个该是谁。'
  } else {
    const step = Number(kind)
    let built = Array.from({ length: 4 }, (_, i) => start + step * i)
    if (built.some((n) => n < 1)) {
      const s = Math.abs(step)
      const base = s * 4 + randInt(2, 8)
      built = Array.from({ length: 4 }, (_, i) => base - s * i)
    }
    seq = built
    const step2 = seq[1] - seq[0]
    correctNext = seq[3] + step2
    hint = `先看每次${step2 > 0 ? '加' : '减'}几，再判断对不对。`
  }
  const isRight = Math.random() < 0.5
  const deltas = [1, 2, 3, -1].filter((x) => correctNext + x > 0)
  const shown = isRight ? correctNext : correctNext + pick(deltas.length ? deltas : [2])
  return {
    question: `有人接：${seq.join('、')}、${shown}。他接得对吗？`,
    speakText: '他接的对不对？',
    hint,
    options: [
      { value: 'yes', label: '✓ 对', correct: isRight },
      { value: 'no', label: '✗ 不对', correct: !isRight },
    ],
    isCorrect: (opt) => opt.correct,
    columns: 2,
    big: true,
    seq: { items: [...seq, shown], highlightLast: true, isNumber: true },
  }
}

export const generators = {
  sequence,
  'odd-one-out': oddOneOut,
  designer,
  'shape-pattern': shapePattern,
  judge,
}

export const generate = (gameId, difficulty, count) =>
  generateUnique(() => generators[gameId](difficulty), count)
