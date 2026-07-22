// Prompt templates for the AI question generator and daily planner.

/**
 * Build the system prompt shared by all AI calls.
 */
export function systemPrompt() {
  return `你是一名儿童数学思维训练专家，面向6-7岁（一年级升二年级）的孩子。
你的任务是设计有趣、适龄的数学思维训练题目。

核心原则：
- 不训练计算速度，强调观察、推理、尝试
- 文字量少，语言简单，适合7岁儿童阅读
- 答错不惩罚，提示要温和有引导性
- 题目要有趣味性，贴近孩子的生活（糖果、小动物、玩具等）
- 严格按照要求的JSON格式输出，不要输出任何其他文字`
}

/**
 * Build the question-generation user prompt.
 * gameInfo: { name, desc } from config
 */
export function questionPrompt({ abilitySummary, moduleName, gameName, gameDesc, count, difficulty, weakAreas }) {
  return `当前孩子的能力画像：
${abilitySummary}

目标模块：${moduleName}（能力分见上）
${weakAreas.length ? `该模块薄弱点：${weakAreas.join('、')}` : ''}
当前难度参数：数字大小=${difficulty.numberSize}，思考步骤=${difficulty.thinkingSteps}，抽象程度=${difficulty.abstraction}

请为游戏"${gameName}"（${gameDesc}）生成 ${count} 道选择题。

要求：
- 难度递进：从简单到稍难
- 每道题3-4个选项，只有一个正确答案
- 每道题配有引导提示（hint）和鼓励语（encouragement）
- 难度参数越高，数字越大、步骤越多、越抽象
- 题干必须是完整通顺的中文短句，适合一年级朗读
- 禁止病句：不要写「比 68 多 1」这类缺少主语的比较；应写成「小兔比小熊多 1 个」
- 禁止在题干里直接写出正确答案或泄露答案数字
- 若题目需要看图/看钟/看柱状图，必须在 question 里写清「看图」且不要假设孩子看不见的信息
- 计量词要正确：苹果用「个」，不要用「一件苹果」

严格按以下JSON数组格式输出（不要其他文字）：
[
  {
    "question": "题目文字",
    "speakText": "朗读文字（去掉符号，适合语音播报）",
    "options": [{"value": "选项值", "label": "显示文字"}],
    "answer": "正确选项的value",
    "hint": "引导提示",
    "encouragement": "答对后的鼓励语"
  }
]`
}

/**
 * Build the daily-plan generation prompt.
 */
export function dailyPlanPrompt({ abilitySummary, moduleList, weekdayName }) {
  return `当前孩子的能力画像：
${abilitySummary}

可用训练模块（id列表）：${moduleList.map((m) => m.id).join('、')}

今天是${weekdayName}。请生成一份15分钟的每日训练计划。

每周能力轮换安排（供参考，核心模块尽量贴合当天主题）：
- 周一：quantity-relation（数量关系）
- 周二：spatial（空间思维）
- 周三：pattern（规律发现）
- 周四：logic（逻辑推理）
- 周五：calc-strategy（运算策略）
- 周六/周日：自由选择，重点加强最薄弱的模块

要求：
- 选择1个最需要加强的模块作为核心训练（weekday 主题优先，但若某项能力明显薄弱可灵活调整）
- 热身用轻松的数感小游戏
- 挑战环节用操作性强的游戏
- 给出选择理由（给家长看）

严格按以下JSON格式输出（不要其他文字）：
{
  "focusModule": "核心模块id",
  "reason": "选择理由（给家长看，一句话）",
  "focus": "今天的训练重点（一句话，给孩子看）",
  "warmup": {"module": "模块id", "game": "游戏id"},
  "core": {"module": "模块id", "game": "游戏id"},
  "challenge": {"module": "模块id", "game": "游戏id"}
}`
}
