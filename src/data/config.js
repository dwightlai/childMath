// Central configuration for the six training modules.
// Each module defines its theme color, icon, games and training weight.

export const MODULES = [
  {
    id: 'number-sense',
    name: '数感乐园',
    shortName: '数感',
    emoji: '🔢',
    desc: '拆一拆、凑一凑，和数字交朋友',
    color: 'sun',        // maps to --color-sun
    weight: 25,
    games: [
      { id: 'make-ten', name: '凑十游戏', emoji: '🤝' },
      { id: 'split-number', name: '数字拆分', emoji: '✂️' },
      { id: 'quick-count', name: '快速点数', emoji: '👀' },
      { id: 'find-friend', name: '数字找朋友', emoji: '👫' },
      { id: 'compare', name: '比大小挑战', emoji: '⚖️' },
      { id: 'estimate', name: '估一估', emoji: '🎯' },
    ],
  },
  {
    id: 'quantity-relation',
    name: '关系小镇',
    shortName: '数量关系',
    emoji: '🧮',
    desc: '谁多谁少，一眼看明白',
    color: 'sky',
    weight: 20,
    games: [
      { id: 'story-theater', name: '故事小剧场', emoji: '🎭' },
      { id: 'arrange', name: '摆一摆', emoji: '🧱' },
      { id: 'more-less', name: '谁多谁少', emoji: '📊' },
      { id: 'detective', name: '条件小侦探', emoji: '🔍' },
      { id: 'multi-solve', name: '一题多解', emoji: '💡' },
    ],
  },
  {
    id: 'calc-strategy',
    name: '运算策略',
    shortName: '运算',
    emoji: '🧠',
    desc: '拆一拆、凑一凑，怎么算更聪明',
    color: 'peach',
    weight: 15,
    games: [
      { id: 'split-calc', name: '拆分计算', emoji: '✂️' },
      { id: 'make-round', name: '凑整计算', emoji: '🎯' },
      { id: 'multi-method', name: '一题多解', emoji: '💡' },
      { id: 'tool-box', name: '解题工具箱', emoji: '🧰' },
    ],
  },
  {
    id: 'pattern',
    name: '规律森林',
    shortName: '规律',
    emoji: '🌈',
    desc: '找规律，猜一猜，验证一下',
    color: 'leaf',
    weight: 10,
    games: [
      { id: 'sequence', name: '接龙填空', emoji: '🚂' },
      { id: 'odd-one-out', name: '找不同', emoji: '🕵️' },
      { id: 'designer', name: '规律设计师', emoji: '🎨' },
      { id: 'shape-pattern', name: '图形变换', emoji: '🔷' },
      { id: 'judge', name: '对错判断', emoji: '✅' },
    ],
  },
  {
    id: 'spatial',
    name: '空间城堡',
    shortName: '空间',
    emoji: '🏰',
    desc: '拼一拼、转一转，空间大冒险',
    color: 'coral',
    weight: 10,
    games: [
      { id: 'tangram', name: '七巧板拼图', emoji: '🧩' },
      { id: 'rotate', name: '图形旋转', emoji: '🔄' },
      { id: 'count-shapes', name: '数图形', emoji: '🔺' },
      { id: 'maze', name: '走迷宫', emoji: '🌀' },
      { id: 'symmetry', name: '对称画', emoji: '🪞' },
      { id: 'block-count', name: '积木计数', emoji: '📦' },
    ],
  },
  {
    id: 'logic',
    name: '推理侦探社',
    shortName: '推理',
    emoji: '🕵️',
    desc: '根据线索，一步步找到答案',
    color: 'grape',
    weight: 10,
    games: [
      { id: 'who-is-who', name: '谁是谁', emoji: '🎩' },
      { id: 'ordering', name: '排序挑战', emoji: '🏃' },
      { id: 'true-false', name: '真假话', emoji: '💬' },
      { id: 'little-detective', name: '小侦探', emoji: '🔎' },
    ],
  },
  {
    id: 'problem-solving',
    name: '挑战擂台(建模)',
    shortName: '挑战',
    emoji: '🏆',
    desc: '开动脑筋，把生活变成数学',
    color: 'mint',
    weight: 5,
    games: [
      { id: 'fair-share', name: '公平分配', emoji: '🍬' },
      { id: 'make-change', name: '凑钱游戏', emoji: '🪙' },
      { id: 'route', name: '路线探索', emoji: '🗺️' },
      { id: 'life-math', name: '生活数学', emoji: '🛒' },
      { id: 'free-build', name: '自由拼搭', emoji: '🏗️' },
    ],
  },
  {
    id: 'math-expression',
    name: '数学表达',
    shortName: '表达',
    emoji: '💬',
    desc: '说一说、排一排，讲出你的想法',
    color: 'rose',
    weight: 3,
    games: [
      { id: 'my-method', name: '我用的方法', emoji: '🙋' },
      { id: 'step-order', name: '步骤排排', emoji: '🪜' },
      { id: 'find-mistake', name: '找错误', emoji: '🐛' },
    ],
  },
  {
    id: 'data-thinking',
    name: '数据意识',
    shortName: '数据',
    emoji: '📊',
    desc: '数一数、画一画，看懂小数据',
    color: 'berry',
    weight: 2,
    games: [
      { id: 'count-sort', name: '分类统计', emoji: '🧺' },
      { id: 'read-chart', name: '看图回答', emoji: '📈' },
      { id: 'compare-data', name: '数据比较', emoji: '⚖️' },
      { id: 'simple-survey', name: '小调查员', emoji: '📋' },
    ],
  },
]

export const getModule = (id) => MODULES.find((m) => m.id === id)

// Session phase configuration (total ~15-20 minutes)
export const SESSION_PHASES = [
  { id: 'warmup', name: '热身小游戏', minutes: 3, emoji: '🔥', questionCount: 3 },
  { id: 'core', name: '核心思维任务', minutes: 8, emoji: '🧠', questionCount: 4 },
  { id: 'challenge', name: '动手闯关', minutes: 5, emoji: '🎮', questionCount: 3 },
  { id: 'summary', name: '总结分享', minutes: 2, emoji: '🌟', questionCount: 0 },
]

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  { level: 1, name: '低', emoji: '①' },
  { level: 2, name: '中', emoji: '②' },
  { level: 3, name: '高', emoji: '③' },
]

// Encouragement messages
export const PRAISE = [
  '太棒了！', '你想到了！', '真厉害！', '好样的！', '继续加油！',
  '你的小脑瓜真灵！', '就是这样！', '越来越厉害了！',
]

export const ENCOURAGE = [
  '再试试看～', '换个角度想想', '不着急，慢慢来', '你可以的！',
  '想一想，再试一次', '离答案很近了！',
]
