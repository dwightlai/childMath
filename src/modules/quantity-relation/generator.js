import { randInt, pick, shuffle, generateUnique } from '../../utils/helpers'

const NAMES = ['小明', '小红', '小刚', '小丽', '小兔', '小熊', '姐姐', '弟弟']
const THINGS = [
  { name: '糖', emoji: '🍬' }, { name: '苹果', emoji: '🍎' }, { name: '铅笔', emoji: '✏️' },
  { name: '贴纸', emoji: '🌟' }, { name: '饼干', emoji: '🍪' }, { name: '气球', emoji: '🎈' },
]
const PLACES = ['书包里', '桌子上', '抽屉里', '盒子里']

const storyTheater = (difficulty) => {
  const t = pick(THINGS)
  const max = difficulty === 1 ? 9 : difficulty === 2 ? 15 : 40
  const type = pick(['total', 'remain', 'more', 'give', 'two-step'])
  let question, answer, hint
  if (type === 'total' || (type === 'two-step' && difficulty === 1)) {
    const a = randInt(2, max), b = randInt(2, Math.min(9, max))
    question = pick([
      `${pick(NAMES)}有 ${a} 个${t.name}，又买了 ${b} 个，一共有多少个？`,
      `${pick(PLACES)}原来有 ${a} 个${t.name}，又放进 ${b} 个，现在几个？`,
      `左边 ${a} 个，右边 ${b} 个，合起来几个${t.name}？`,
    ])
    answer = `${a} + ${b} = ${a + b}`
    hint = '合在一起，用加法。'
  } else if (type === 'remain' || type === 'give') {
    const a = randInt(5, max), b = randInt(1, a - 1)
    question = pick([
      `${pick(NAMES)}有 ${a} 个${t.name}，吃掉了 ${b} 个，还剩多少个？`,
      `${pick(NAMES)}把 ${b} 个${t.name}送给朋友，自己原来有 ${a} 个，还剩几个？`,
      `盘子里有 ${a} 块${t.name}，拿走 ${b} 块，还剩几块？`,
    ])
    answer = `${a} - ${b} = ${a - b}`
    hint = '拿走了，要用减法。'
  } else if (type === 'two-step' && difficulty >= 2) {
    const a = randInt(8, max), b = randInt(2, 6), c = randInt(1, 5)
    question = `${pick(NAMES)}有 ${a} 个${t.name}，先用掉 ${b} 个，又得到 ${c} 个，现在几个？`
    answer = `${a} - ${b} + ${c} = ${a - b + c}`
    hint = '先减再用加，一步一步来。'
  } else {
    const a = randInt(3, max), b = randInt(1, 6)
    const name1 = pick(NAMES)
    let name2 = pick(NAMES)
    while (name2 === name1) name2 = pick(NAMES)
    question = pick([
      `${name1}有 ${a} 个${t.name}，${name2}比${name1}多 ${b} 个，${name2}有几个？`,
      `${name1}有 ${a} 个${t.name}，又买了 ${b} 个，现在一共几个？`,
      `盒子里有 ${a} 个${t.name}，又放进 ${b} 个，现在几个？`,
    ])
    answer = `${a} + ${b} = ${a + b}`
    hint = '"比他多"或"又买了"，都是再加。'
  }
  const nums = (question.match(/\d+/g) || ['1', '1']).map(Number)
  const [x, y] = [nums[0], nums[1] || 1]
  const pool = [
    answer,
    `${x} + ${y} = ${x + y}`,
    `${x} - ${y} = ${Math.max(0, x - y)}`,
    `${x} + ${y} = ${x + y + 1}`,
  ]
  const options = shuffle([...new Set(pool)]).slice(0, 4)
  if (!options.includes(answer)) options[0] = answer
  return {
    question,
    speakText: question,
    hint,
    options: shuffle(options).map((v) => ({ value: v })),
    isCorrect: (opt) => opt.value === answer,
    columns: 2,
    story: { emoji: t.emoji },
  }
}

const arrange = (difficulty) => {
  const t = pick(THINGS)
  const a = randInt(3, difficulty === 1 ? 8 : 12)
  const b = randInt(3, difficulty === 1 ? 8 : 12)
  const rel = a > b ? 'more' : a < b ? 'less' : 'equal'
  const mode = pick(['which-sentence', 'how-many-more', 'position'])
  if (mode === 'how-many-more' && a !== b) {
    const diff = Math.abs(a - b)
    return {
      question: pick([
        `上排 ${a} 个，下排 ${b} 个，相差几个？`,
        `第一行 ${a} 个${t.name}，第二行 ${b} 个，多的比少的多几个？`,
      ]),
      speakText: '两排相差几个？',
      hint: '大的减小的。',
      options: shuffle([diff, diff + 1, Math.max(1, diff - 1), a]).slice(0, 4).map((v) => ({ value: v, label: `${v} 个` })),
      isCorrect: (opt) => opt.value === diff,
      columns: 4,
      rows: { a, b, emoji: t.emoji },
    }
  }
  if (mode === 'position') {
    const front = pick(['前面', '左边', '上面'])
    const back = front === '前面' ? '后面' : front === '左边' ? '右边' : '下面'
    const n = randInt(2, 6)
    const total = n + randInt(2, 5)
    const ans = total - n + 1
    return {
      question: `一共 ${total} 人排队，${pick(NAMES)}从${front}数是第 ${n} 个，从${back}数是第几个？`,
      speakText: `从${front}数第${n}，从${back}数是第几？`,
      hint: `一共 ${total} 人，用 ${total} − ${n} + 1。`,
      options: shuffle([ans, n, total - n, ans + 1].filter((v, i, arr) => v > 0 && arr.indexOf(v) === i)).slice(0, 4).map((v) => ({ value: v })),
      isCorrect: (opt) => opt.value === ans,
      columns: 4,
      rows: { a, b, emoji: t.emoji },
    }
  }
  const question = pick([
    `第一行摆 ${a} 个${t.name}，第二行摆 ${b} 个。哪句话是对的？`,
    `上面有 ${a} 个，下面有 ${b} 个，选正确的说法。`,
  ])
  return {
    question,
    speakText: question,
    hint: '把两行一个一个对着比。',
    options: shuffle([
      { value: 'first-more', label: '第一行比第二行多', correct: rel === 'more' },
      { value: 'second-more', label: '第二行比第一行多', correct: rel === 'less' },
      { value: 'equal', label: '两行同样多', correct: rel === 'equal' },
    ]),
    isCorrect: (opt) => opt.correct,
    columns: 3,
    rows: { a, b, emoji: t.emoji },
  }
}

const moreLess = (difficulty) => {
  const t = pick(THINGS)
  const a = randInt(4, difficulty === 1 ? 9 : difficulty === 2 ? 15 : 40)
  let b = randInt(4, difficulty === 1 ? 9 : difficulty === 2 ? 15 : 40)
  if (b === a) b = a + randInt(1, 3)
  const diff = Math.abs(a - b)
  const mode = pick(['diff', 'who', 'need'])
  if (mode === 'who') {
    return {
      question: `第一排有 ${a} 个${t.name}，第二排有 ${b} 个，哪一排更多？`,
      speakText: '哪一排更多？',
      hint: '比一比两个数。',
      options: shuffle([
        { value: 'A', label: '第一排多', correct: a > b },
        { value: 'B', label: '第二排多', correct: b > a },
        { value: 'eq', label: '一样多', correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 3,
      rows: { a, b, emoji: t.emoji },
    }
  }
  if (mode === 'need') {
    const low = Math.min(a, b), high = Math.max(a, b)
    return {
      question: `上面一排有 ${a} 个，下面一排有 ${b} 个。少的一排还要再摆几个，才能和多的一样多？`,
      speakText: '还要摆几个才一样多？',
      hint: `${high} 减 ${low}。`,
      options: shuffle([diff, diff + 1, Math.max(1, diff - 1), low]).slice(0, 4).map((v) => ({ value: v, label: `${v} 个` })),
      isCorrect: (opt) => opt.value === diff,
      columns: 4,
      rows: { a, b, emoji: t.emoji },
    }
  }
  return {
    question: pick([
      `上面一排有 ${a} 个，下面一排有 ${b} 个，多的比少的多几个？`,
      `${a} 和 ${b} 相差多少？`,
    ]),
    speakText: '多的比少的多几个？',
    hint: '把上下两排对着看，多出来几个？',
    options: shuffle([diff, diff + 1, Math.max(1, diff - 1), diff + 2].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4)).map((v) => ({ value: v, label: `${v} 个` })),
    isCorrect: (opt) => opt.value === diff,
    columns: 4,
    rows: { a, b, emoji: t.emoji },
  }
}

const detective = (difficulty) => {
  const t = pick(THINGS)
  const a = randInt(3, difficulty === 1 ? 10 : 20)
  const b = randInt(2, Math.min(8, a - 1))
  const mode = pick(['total', 'remain', 'any'])
  const irrelevant = pick([
    '今天天气很好', `${pick(NAMES)}穿了红色的衣服`, '他们住在三楼', '现在是星期六', '喜欢唱歌',
  ])
  let ask, useful
  if (mode === 'total') {
    ask = `想知道"${pick(NAMES)}一共有多少${t.name}"，哪个条件有用？`
    useful = pick([
      `他有 ${a} 个，又得到 ${b} 个`,
      `左边 ${a} 个，右边 ${b} 个`,
      `原来 ${a} 个，又买了 ${b} 个`,
    ])
  } else if (mode === 'remain') {
    ask = `算还剩几个${t.name}，需要哪句话？`
    useful = pick([
      `原来 ${a} 个，用掉 ${b} 个`,
      `一共 ${a} 个，拿走 ${b} 个`,
      `他有 ${a} 个，送给朋友 ${b} 个`,
    ])
  } else {
    ask = pick([
      `下面哪句话能帮我们算出答案？`,
      `侦探时间：哪一句里有能用来计算的数字？`,
    ])
    useful = pick([
      `他有 ${a} 个，又得到 ${b} 个`,
      `原来 ${a} 个，用掉 ${b} 个`,
      `左边 ${a} 个，右边 ${b} 个`,
      `一共 ${a} 个，拿走 ${b} 个`,
    ])
  }
  return {
    question: ask,
    speakText: ask,
    hint: '有用的条件里要有数字，还要能对上问题。',
    options: shuffle([
      { value: 'useful', label: useful, correct: true },
      { value: 'useless1', label: irrelevant, correct: false },
      { value: 'useless2', label: `${pick(NAMES)}喜欢${t.name}`, correct: false },
      { value: 'useless3', label: difficulty >= 2 ? `书包是蓝色的` : `今天星期一`, correct: false },
    ]).slice(0, 4),
    isCorrect: (opt) => opt.correct,
    columns: 1,
  }
}

const multiSolve = (difficulty) => {
  const hi = difficulty === 1 ? 10 : difficulty === 2 ? 20 : 50
  const modes = difficulty === 1
    ? ['commute', 'split', 'same-sum', 'inverse']
    : ['commute', 'split', 'same-sum', 'inverse', 'make-ten', 'near-double']
  const mode = pick(modes)

  if (mode === 'split') {
    const a = randInt(3, Math.min(12, hi))
    const b = randInt(3, Math.min(9, hi))
    const total = a + b
    const b1 = randInt(1, b - 1)
    const b2 = b - b1
    const correct = `${a} + ${b1} + ${b2} = ${total}`
    return {
      question: pick([
        `${a} + ${b} = ${total}，把 ${b} 拆开再加，哪个也对？`,
        `算 ${a}+${b}，用拆分的方法，正确的是？`,
      ]),
      speakText: '把一个数拆开再加，哪个也对？',
      hint: `把 ${b} 拆成 ${b1} 和 ${b2}，合起来还是 ${b}。`,
      options: shuffle([
        { value: 'c', label: correct, correct: true },
        { value: 'w1', label: `${a} + ${b1} + ${b2} = ${total + 1}`, correct: false },
        { value: 'w2', label: `${a} + ${b1 + 1} + ${b2} = ${total}`, correct: false },
        { value: 'w3', label: `${a} - ${b1} - ${b2} = ${total}`, correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  if (mode === 'same-sum') {
    const total = randInt(difficulty === 1 ? 6 : 10, hi)
    const a = randInt(2, total - 2)
    const b = total - a
    let c = randInt(1, total - 1)
    if (c === a) c = (c % (total - 1)) + 1
    const d = total - c
    return {
      question: pick([
        `${a} + ${b} = ${total}，下面哪个算式结果也是 ${total}？`,
        `和 ${a}+${b} 得数相同的是？`,
      ]),
      speakText: `哪个算式也等于${total}？`,
      hint: '得数一样就行，加数可以不一样。',
      options: shuffle([
        { value: 'c', label: `${c} + ${d} = ${total}`, correct: true },
        { value: 'w1', label: `${a} + ${b} = ${total + 1}`, correct: false },
        { value: 'w2', label: `${c} + ${d} = ${total + 1}`, correct: false },
        { value: 'w3', label: `${a} - ${b} = ${total}`, correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  if (mode === 'inverse') {
    const total = randInt(difficulty === 1 ? 6 : 10, hi)
    const a = randInt(2, total - 1)
    const b = total - a
    return {
      question: pick([
        `${total} − ${a} = ${b}，哪个加法也对？`,
        `已知 ${total}−${a}=${b}，对应的加法是？`,
      ]),
      speakText: '减法和加法可以互相反过来想',
      hint: '减下来的和剩下的，加起来就是原来的数。',
      options: shuffle([
        { value: 'c', label: `${a} + ${b} = ${total}`, correct: true },
        { value: 'w1', label: `${a} + ${b} = ${total + 1}`, correct: false },
        { value: 'w2', label: `${total} + ${a} = ${b}`, correct: false },
        { value: 'w3', label: `${a} - ${b} = ${total}`, correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  if (mode === 'make-ten') {
    const a = randInt(6, 9)
    const b = randInt(10 - a + 1, 9)
    const total = a + b
    const need = 10 - a
    const rest = b - need
    const correct = `${a} + ${need} + ${rest} = ${total}`
    return {
      question: `${a}+${b} 想凑十，哪种拆法也对？`,
      speakText: '凑十再算，哪个也对？',
      hint: `先把 ${b} 拆出 ${need}，凑成 10，再加 ${rest}。`,
      options: shuffle([
        { value: 'c', label: correct, correct: true },
        { value: 'w1', label: `${a} + ${need + 1} + ${Math.max(0, rest - 1)} = ${total}`, correct: false },
        { value: 'w2', label: `${a} + ${b} = ${total - 1}`, correct: false },
        { value: 'w3', label: `${a} - ${need} + ${rest} = ${total}`, correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  if (mode === 'near-double') {
    const a = randInt(4, difficulty === 1 ? 8 : 12)
    const total = a + (a + 1)
    const correct = `${a} + ${a} + 1 = ${total}`
    return {
      question: pick([
        `${a}+${a + 1}=${total}，用“加倍再加 1”想，哪个也对？`,
        `算 ${a} 加 ${a + 1}，靠近加倍的想法是？`,
      ]),
      speakText: '用加倍的方法想，哪个也对？',
      hint: `${a}+${a} 再加 1，就是 ${a}+${a + 1}。`,
      options: shuffle([
        { value: 'c', label: correct, correct: true },
        { value: 'w1', label: `${a} + ${a} - 1 = ${total}`, correct: false },
        { value: 'w2', label: `${a} + ${a} = ${total}`, correct: false },
        { value: 'w3', label: `${a + 1} + ${a + 1} = ${total}`, correct: false },
      ]),
      isCorrect: (opt) => opt.correct,
      columns: 2,
    }
  }

  const a = randInt(3, hi)
  let b = randInt(2, Math.min(9, hi))
  if (b === a) b = a + 1
  const total = a + b
  return {
    question: pick([
      `${a} + ${b} = ${total}，交换加数位置，哪个也对？`,
      `算 ${a} 加 ${b}，换个顺序也对的是？`,
    ]),
    speakText: '加法交换位置结果一样吗？',
    hint: '两个加数换位置，得数不变。',
    options: shuffle([
      { value: 'c', label: `${b} + ${a} = ${total}`, correct: true },
      { value: 'w1', label: `${a} + ${b} = ${total + 1}`, correct: false },
      { value: 'w2', label: `${a} - ${b} = ${total}`, correct: false },
      { value: 'w3', label: `${total} + ${a} = ${b}`, correct: false },
    ]),
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
  generateUnique(() => generators[gameId](difficulty), count)
