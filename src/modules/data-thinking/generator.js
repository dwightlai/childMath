// 数据意识 (data-thinking) question generators.
// Focus: classifying, counting, reading simple charts, comparing data — early data literacy.

import { randInt, pick, shuffle, numericOptions } from '../../utils/helpers'

const FRUITS = [
  { name: '苹果', emoji: '🍎' },
  { name: '香蕉', emoji: '🍌' },
  { name: '橙子', emoji: '🍊' },
  { name: '葡萄', emoji: '🍇' },
]
const NAMES = ['小明', '小红', '小刚', '小丽']

// 分类统计: a mixed pile of items, count how many of one category.
const countSort = (difficulty) => {
  const catCount = difficulty === 1 ? 3 : 4
  const cats = shuffle(FRUITS).slice(0, catCount)
  const counts = cats.map(() => randInt(2, difficulty === 1 ? 5 : 7))
  const items = []
  cats.forEach((c, i) => {
    for (let k = 0; k < counts[i]; k++) items.push(c.emoji)
  })
  const askIdx = randInt(0, catCount - 1)
  const answer = counts[askIdx]
  const question = `数一数，${cats[askIdx].name}${cats[askIdx].emoji}有几个？`
  const options = numericOptions(answer, 4, 2).map((v) => ({ value: v, label: `${v} 个` }))
  return {
    question,
    speakText: question,
    hint: `把${cats[askIdx].emoji}一个一个挑出来，数清楚。`,
    options,
    isCorrect: (opt) => opt.value === answer,
    columns: 4,
    items: shuffle(items),
  }
}

// 看图回答: read a simple bar chart, answer "who most" or "how many more".
const readChart = (difficulty) => {
  const n = difficulty === 1 ? 3 : 4
  const t = pick(FRUITS)
  const names = shuffle(NAMES).slice(0, n)
  let values = names.map(() => randInt(2, difficulty === 1 ? 6 : 9))
  const type = pick(['most', 'diff'])

  if (type === 'most') {
    // ensure a unique maximum
    let maxIdx = 0
    values.forEach((v, i) => { if (v > values[maxIdx]) maxIdx = i })
    const dup = values.some((v, i) => i !== maxIdx && v === values[maxIdx])
    if (dup) values[maxIdx] = values[maxIdx] + 1
    const winner = names[maxIdx]
    const options = shuffle(names.map((nm) => ({ value: nm, label: nm, correct: nm === winner })))
    return {
      question: `大家喜欢的${t.name}数量如图，谁最喜欢（数量最多）？`,
      speakText: '看图，谁的数量最多？',
      hint: '柱子最高的那个人最多。',
      options,
      isCorrect: (opt) => opt.correct,
      columns: 2,
      chart: { names, values, emoji: t.emoji },
    }
  }

  // diff between first two bars
  const [i0, i1] = [0, 1]
  const diff = Math.abs(values[i0] - values[i1])
  const answer = diff
  const options = numericOptions(answer, 4, 2).map((v) => ({ value: v, label: `${v} 个` }))
  return {
    question: `${names[i0]}比${names[i1]}多喜欢几个${t.name}？`,
    speakText: '看图算一算，相差几个？',
    hint: '用多的减去少的。',
    options,
    isCorrect: (opt) => opt.value === answer,
    columns: 4,
    chart: { names, values, emoji: t.emoji },
  }
}

// 数据比较: two rows of items, compare which more / how many more.
const compareData = (difficulty) => {
  const t = pick(FRUITS)
  const a = randInt(3, difficulty === 1 ? 8 : 14)
  let b = randInt(3, difficulty === 1 ? 8 : 14)
  if (b === a) b = a + randInt(1, 3)
  const type = pick(['which', 'diff'])

  if (type === 'which') {
    const moreRow = a > b ? 'first' : 'second'
    const options = shuffle([
      { value: 'first', label: '第一组多', correct: moreRow === 'first' },
      { value: 'second', label: '第二组多', correct: moreRow === 'second' },
    ])
    return {
      question: '比一比，哪一组的数量多？',
      speakText: '哪一组多？',
      hint: '两组一个一个对着比。',
      options,
      isCorrect: (opt) => opt.correct,
      columns: 2,
      rows: { a, b, emoji: t.emoji },
    }
  }

  const diff = Math.abs(a - b)
  const options = numericOptions(diff, 4, 2).map((v) => ({ value: v, label: `${v} 个` }))
  return {
    question: `第一组有 ${a} 个，第二组有 ${b} 个，多的比少的多几个？`,
    speakText: '多的比少的多几个？',
    hint: '用多的减去少的。',
    options,
    isCorrect: (opt) => opt.value === diff,
    columns: 4,
    rows: { a, b, emoji: t.emoji },
  }
}

// 小调查员: a mini survey, compute total / most / combine categories.
const simpleSurvey = (difficulty) => {
  const catCount = 3
  const cats = shuffle(FRUITS).slice(0, catCount)
  const counts = cats.map(() => randInt(2, difficulty === 1 ? 5 : 8))
  const type = pick(['total', 'most', 'combine'])

  if (type === 'total') {
    const total = counts.reduce((s, v) => s + v, 0)
    const options = numericOptions(total, 4, 3).map((v) => ({ value: v, label: `${v} 人` }))
    return {
      question: `调查最喜欢的水果：${cats.map((c, i) => `${c.emoji}${counts[i]}人`).join('、')}。一共调查了几人？`,
      speakText: '把人数加起来，一共几人？',
      hint: '把每一类的人数相加。',
      options,
      isCorrect: (opt) => opt.value === total,
      columns: 4,
      survey: { cats, counts },
    }
  }

  if (type === 'most') {
    let maxIdx = 0
    counts.forEach((v, i) => { if (v > counts[maxIdx]) maxIdx = i })
    const dup = counts.some((v, i) => i !== maxIdx && v === counts[maxIdx])
    if (dup) counts[maxIdx] = counts[maxIdx] + 1
    const winner = cats[maxIdx]
    const options = shuffle(cats.map((c) => ({ value: c.name, label: `${c.emoji} ${c.name}`, correct: c.name === winner.name })))
    return {
      question: '哪种水果最受欢迎（喜欢的人最多）？',
      speakText: '哪种水果喜欢的人最多？',
      hint: '人数最多的那种就是最受欢迎。',
      options,
      isCorrect: (opt) => opt.correct,
      columns: 3,
      survey: { cats, counts },
    }
  }

  // combine two categories
  const [i0, i1] = shuffle([0, 1, 2]).slice(0, 2)
  const sum = counts[i0] + counts[i1]
  const options = numericOptions(sum, 4, 3).map((v) => ({ value: v, label: `${v} 人` }))
  return {
    question: `喜欢${cats[i0].name}和喜欢${cats[i1].name}的一共有几人？`,
    speakText: '把两种的人数加起来。',
    hint: `把${counts[i0]}和${counts[i1]}相加。`,
    options,
    isCorrect: (opt) => opt.value === sum,
    columns: 4,
    survey: { cats, counts },
  }
}

export const generators = {
  'count-sort': countSort,
  'read-chart': readChart,
  'compare-data': compareData,
  'simple-survey': simpleSurvey,
}

export const generate = (gameId, difficulty, count) =>
  Array.from({ length: count }, () => generators[gameId](difficulty))
