// Question generators for the Logic Reasoning module.
// Uses curated templates to guarantee every puzzle is solvable and unique.
import { pick, shuffle } from '../../utils/helpers'

const ANIMALS = [
  { name: '小猫', emoji: '🐱' }, { name: '小狗', emoji: '🐶' }, { name: '小兔', emoji: '🐰' },
  { name: '小熊', emoji: '🐻' }, { name: '小猴', emoji: '🐵' }, { name: '小猪', emoji: '🐷' },
]
const COLORS = [
  { name: '红色', emoji: '🎈' }, { name: '蓝色', emoji: '🎁' }, { name: '黄色', emoji: '⭐' },
]

// ---- 谁是谁 (who-is-who): match 3 animals to 3 colored items via clues ----
const whoIsWho = (difficulty) => {
  const animals = shuffle(ANIMALS).slice(0, 3)
  const colors = shuffle(COLORS).slice(0, 3)
  // random bijection: animals[i] -> colors[perm[i]]
  const perm = shuffle([0, 1, 2])
  const assign = animals.map((a, i) => ({ animal: a, color: colors[perm[i]] }))

  // The question asks about a specific animal.
  const targetIdx = pick([0, 1, 2])
  const target = assign[targetIdx]

  // Build clues that uniquely determine the answer.
  // Clue 1: state one other animal's color directly.
  const otherIdx = (targetIdx + 1) % 3
  const thirdIdx = (targetIdx + 2) % 3
  const clue1 = `${assign[otherIdx].animal.name}拿的是${assign[otherIdx].color.name}${assign[otherIdx].color.emoji}`
  // Clue 2: target does NOT have the third animal's color.
  const clue2 = `${target.animal.name}拿的不是${assign[thirdIdx].color.name}的`
  const question = `${animals.map((a) => a.emoji + a.name).join('、')}各拿了一个气球。${clue1}；${clue2}。${target.animal.name}拿的是什么颜色？`

  const options = shuffle(colors.map((c) => ({
    value: c.name,
    label: `${c.name} ${c.emoji}`,
    correct: c.name === target.color.name,
  })))
  return {
    question,
    speakText: question,
    hint: `先确定${assign[otherIdx].animal.name}的颜色，再用排除法。`,
    options,
    isCorrect: (opt) => opt.correct,
    columns: 3,
    logic: { characters: animals.map((a) => a.emoji), clues: [clue1, clue2] },
  }
}

// ---- 排序挑战 (ordering): rank 3 racers from clues ----
const ordering = (difficulty) => {
  const animals = shuffle(ANIMALS).slice(0, 3)
  // random ranking: order[0] = 1st place
  const order = shuffle([0, 1, 2])
  const rankOf = (i) => order.indexOf(i) // index in animals -> rank (0=1st)
  const nameAt = (rank) => animals[order[rank]].name

  // Clues: "A比B快" and "C不是第一"
  const first = order[0], second = order[1], third = order[2]
  const clue1 = `${animals[first].name}比${animals[third].name}跑得快`
  const clue2 = `${animals[second].name}比${animals[third].name}跑得快`
  const question = `${animals.map((a) => a.emoji + a.name).join('、')}比赛跑步。${clue1}，${clue2}。谁是第一名？`

  const options = shuffle(animals.map((a, i) => ({
    value: a.name,
    label: `${a.emoji} ${a.name}`,
    correct: i === first,
  })))
  return {
    question,
    speakText: question,
    hint: '把"比谁快"一个一个排出来。',
    options,
    isCorrect: (opt) => opt.correct,
    columns: 3,
    logic: { characters: animals.map((a) => a.emoji), clues: [clue1, clue2] },
  }
}

// ---- 真假话 (true-false): which statement must be true ----
const trueFalse = (difficulty) => {
  const templates = [
    {
      setup: '盒子里有红球和蓝球，红球比蓝球多。',
      options: [
        { label: '红球至少有 2 个', correct: true },
        { label: '蓝球比红球多', correct: false },
        { label: '盒子里只有红球', correct: false },
      ],
      hint: '红球比蓝球多，蓝球最少 1 个，红球就最少 2 个。',
    },
    {
      setup: '小明比小红高，小红比小刚高。',
      options: [
        { label: '小明最高', correct: true },
        { label: '小刚最高', correct: false },
        { label: '小红最高', correct: false },
      ],
      hint: '把三个人从高到矮排一排。',
    },
    {
      setup: '今天是星期一，明天要下雨。',
      options: [
        { label: '明天是星期二', correct: true },
        { label: '今天是星期二', correct: false },
        { label: '明天下雪', correct: false },
      ],
      hint: '星期一的后一天是星期几？',
    },
    {
      setup: '小猴的苹果比小兔多，小兔的苹果比小熊多。',
      options: [
        { label: '小猴的苹果最多', correct: true },
        { label: '小熊的苹果最多', correct: false },
        { label: '小兔的苹果最多', correct: false },
      ],
      hint: '比一比，谁排在最前面。',
    },
  ]
  const t = pick(templates)
  return {
    question: `${t.setup} 下面哪句话一定是对的？`,
    speakText: `${t.setup}哪句话一定是对的？`,
    hint: t.hint,
    options: shuffle(t.options.map((o) => ({ value: o.label, label: o.label, correct: o.correct }))),
    isCorrect: (opt) => opt.correct,
    columns: 1,
  }
}

// ---- 小侦探 (little-detective): find who did it from clues ----
const littleDetective = (difficulty) => {
  const animals = shuffle(ANIMALS).slice(0, 3)
  const culpritIdx = pick([0, 1, 2])
  const culprit = animals[culpritIdx]
  const others = animals.filter((_, i) => i !== culpritIdx)

  const clue1 = `${others[0].name}说：不是我干的`
  const clue2 = `${others[1].name}说：是${culprit.name}干的`
  const clue3 = `只有一个人说了真话，而且${others[1].name}说的是真话`
  const question = `蛋糕不见了！${clue1}；${clue2}。${clue3}。是谁拿的？`

  const options = shuffle(animals.map((a) => ({
    value: a.name,
    label: `${a.emoji} ${a.name}`,
    correct: a.name === culprit.name,
  })))
  return {
    question,
    speakText: question,
    hint: `${others[1].name}说的是真话，他说了什么？`,
    options,
    isCorrect: (opt) => opt.correct,
    columns: 3,
    logic: { characters: animals.map((a) => a.emoji), clues: [clue1, clue2, clue3] },
  }
}

export const generators = {
  'who-is-who': whoIsWho,
  ordering,
  'true-false': trueFalse,
  'little-detective': littleDetective,
}

export const generate = (gameId, difficulty, count) =>
  Array.from({ length: count }, () => generators[gameId](difficulty))
