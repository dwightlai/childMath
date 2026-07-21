// L1 < L2 < L3；多句式；贴合一年级（少乘除/超纲）
// 运行: node generate-bank.mjs

import { writeFileSync, mkdirSync } from 'fs'

const bank = {}
const N = 28
const add = (mod, game, level, qs) => {
  const key = `${mod}/${game}`
  if (!bank[key]) bank[key] = {}
  bank[key][level] = qs
}
const q = (question, options, answer, hint, speakText) => ({
  question,
  options: options.map((o) => (typeof o === 'object' ? o : { value: String(o), label: String(o) })),
  answer: String(answer),
  hint: hint || '',
  speakText: speakText || question,
})
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1))
const wrongOpts = (correct, pool, count = 3) => {
  const s = new Set([String(correct)])
  const opts = shuffle(pool.filter((x) => !s.has(String(x))))
  return shuffle([String(correct), ...opts.slice(0, count).map(String)])
}
const dedup = (arr) => {
  const seen = new Set()
  return arr.filter((x) => { if (seen.has(x.question)) return false; seen.add(x.question); return true })
}
const NAMES = ['小明', '小红', '小兔', '小熊', '妈妈', '老师']
const range = (lv) => (lv === 1 ? [1, 10] : lv === 2 ? [5, 20] : [10, 50])

// ---- number-sense ----
for (const lv of [1, 2, 3]) {
  const [lo, hi] = range(lv)
  const mt = [], sn = [], qc = [], ff = [], cp = [], es = []
  for (let i = 0; i < N; i++) {
    const tgt = lv === 1 ? 10 : lv === 2 ? (i % 2 === 0 ? 10 : 20) : pick([20, 50, 100])
    const n = randInt(1, Math.min(tgt - 1, lv === 1 ? 9 : tgt - 1))
    const ans = tgt - n
    mt.push(q(pick([
      `${n} 和谁合起来是 ${tgt}？`,
      `${pick(NAMES)}有 ${n} 颗糖，还要几颗才够 ${tgt} 颗？`,
      `□ + ${n} = ${tgt}，方框里填几？`,
      `从 ${n} 跳到 ${tgt}，要跳几格？`,
    ]), wrongOpts(ans, [ans - 1, ans + 1, ans + 2, n, 10].filter((v) => v > 0)), ans, `${tgt}-${n}`))

    const total = randInt(Math.max(lo, 4), Math.min(hi, lv === 1 ? 10 : hi))
    const part = randInt(1, total - 1)
    const other = total - part
    sn.push(q(pick([
      `把 ${total} 分成 ${part} 和另一个数，另一个是？`,
      `${total} = ${part} + □，□ 是几？`,
      `左边 ${part} 个，一共 ${total} 个，右边几个？`,
      `${pick(NAMES)}有 ${total} 支笔，借出 ${part} 支，还剩？`,
    ]), wrongOpts(other, [other - 1, other + 1, part, total]), other, `${total}-${part}`))

    const c = randInt(lo, Math.min(hi, 20))
    qc.push(q(pick([`数一数一共几个？选 ${c}`, `${pick(NAMES)}收集了这些，一共几个？（答案 ${c}）`, `盖住再数，一共几个？（${c}）`]), wrongOpts(c, [c - 1, c + 1, c + 2, c - 2]), c, '仔细数'))

    const t = lv === 1 ? 10 : randInt(10, lv === 2 ? 15 : 20)
    const a = randInt(1, t - 1), b = t - a
    ff.push(q(pick([`哪两个数合起来是 ${t}？`, `谁和谁是 ${t} 的好朋友？`, `${pick(NAMES)}想凑成 ${t}，选哪一对？`]),
      [{ value: `${a}和${b}`, label: `${a} 和 ${b}` }, { value: `${a + 1}和${b}`, label: `${a + 1} 和 ${b}` }, { value: `${a}和${b + 1}`, label: `${a} 和 ${b + 1}` }, { value: `${a - 1 > 0 ? a - 1 : a + 2}和${b}`, label: `${a - 1 > 0 ? a - 1 : a + 2} 和 ${b}` }],
      `${a}和${b}`, `${a}+${b}=${t}`))

    const x = randInt(lo, hi), y = randInt(lo, hi)
    const sym = x > y ? '>' : x < y ? '<' : '='
    cp.push(q(pick([`${x} ○ ${y}，填什么？`, `${x} 和 ${y} 用 ＞＜＝ 怎么比？`, `${pick(NAMES)}有 ${x} 个，朋友有 ${y} 个：${x} ○ ${y}`]),
      ['>', '<', '='].map((v) => ({ value: v, label: v })), sym, '先比大小'))

    const n2 = randInt(lv === 1 ? 8 : 15, lv === 1 ? 20 : lv === 2 ? 40 : 60)
    const approx = Math.round(n2 / 10) * 10
    es.push(q(pick([`大约有多少？实际约 ${n2}，选最接近`, `估一估最接近哪个整十数？（约 ${n2}）`]),
      wrongOpts(approx, [approx - 10, approx + 10, n2, approx + 20].filter((v) => v > 0)), approx, '看大概'))
  }
  add('number-sense', 'make-ten', lv, dedup(mt))
  add('number-sense', 'split-number', lv, dedup(sn))
  add('number-sense', 'quick-count', lv, dedup(qc))
  add('number-sense', 'find-friend', lv, dedup(ff))
  add('number-sense', 'compare', lv, dedup(cp))
  add('number-sense', 'estimate', lv, dedup(es))
}

// ---- quantity-relation ----
for (const lv of [1, 2, 3]) {
  const [lo, hi] = range(lv)
  const st = [], ar = [], ml = [], dt = [], ms = []
  for (let i = 0; i < N; i++) {
    const a = randInt(lo, hi), b = randInt(2, Math.min(9, hi))
    const name = pick(NAMES), item = pick(['颗糖', '个苹果', '支笔', '张贴纸'])
    if (i % 2 === 0) {
      const s = a + b
      st.push(q(pick([`${name}有 ${a}${item}，又得到 ${b} 个，现在几个？`, `${item}原来 ${a} 个，又放进 ${b} 个，现在几个？`]),
        wrongOpts(s, [s + 1, s - 1, a - b > 0 ? a - b : b]), s, `${a}+${b}`))
    } else {
      const big = Math.max(a, b + 3), small = randInt(1, big - 1)
      st.push(q(`${name}有 ${big}${item}，用掉 ${small} 个，还剩几个？`, wrongOpts(big - small, [big - small + 1, big + small, small]), big - small, `${big}-${small}`))
    }
    const u = randInt(4, hi), d = randInt(1, Math.min(5, u - 1)), low = u - d
    ar.push(q(pick([`上排 ${u} 个，下排比上排少 ${d} 个，下排几个？`, `第一行 ${u} 个，第二行少 ${d} 个，第二行几个？`]),
      wrongOpts(low, [low + 1, u, d, low - 1 > 0 ? low - 1 : low + 2]), low, `${u}-${d}`))
    let p = randInt(lo, hi), r = randInt(lo, hi)
    if (p === r) r = p + 1
    const diff = Math.abs(p - r)
    ml.push(q(pick([`A 排 ${p} 个，B 排 ${r} 个，相差几个？`, `多的比少的多几个？（${p} 和 ${r}）`]),
      wrongOpts(diff, [diff + 1, diff - 1 > 0 ? diff - 1 : diff + 2, p]), diff, '大减小'))
    dt.push(q(pick([`想知道一共有多少，哪个条件有用？`, `算还剩几个，需要哪条信息？`]),
      [`有 ${a} 个又得到 ${b} 个`, '今天天气很好', `${name}喜欢红色`, '书包在桌上'].map((x) => ({ value: x, label: x })),
      `有 ${a} 个又得到 ${b} 个`, '要有数字'))
    const s2 = a + b
    ms.push(q(pick([`${a}+${b}=${s2}，哪个也对？`, `算 ${a} 加 ${b}，哪个想法也对？`]),
      [{ value: `${b}+${a}=${s2}`, label: `${b}+${a}=${s2}` }, { value: `${a}+${b}=${s2 + 1}`, label: `${a}+${b}=${s2 + 1}` }, { value: `${a}-${b}=${s2}`, label: `${a}-${b}=${s2}` }, { value: `${s2}+${a}=${b}`, label: `${s2}+${a}=${b}` }],
      `${b}+${a}=${s2}`, '交换位置'))
  }
  add('quantity-relation', 'story-theater', lv, dedup(st))
  add('quantity-relation', 'arrange', lv, dedup(ar))
  add('quantity-relation', 'more-less', lv, dedup(ml))
  add('quantity-relation', 'detective', lv, dedup(dt))
  add('quantity-relation', 'multi-solve', lv, dedup(ms))
}

// ---- calc-strategy（凑十/破十，无鸡兔）----
for (const lv of [1, 2, 3]) {
  const sc = [], mr = [], mm = [], tb = []
  for (let i = 0; i < N; i++) {
    if (lv === 1) {
      const a = randInt(2, 9), b = randInt(2, 9), s = a + b
      sc.push(q(`${a}+${b}=？`, wrongOpts(s, [s + 1, s - 1, a, b]), s, '可以凑十'))
      mr.push(q(`${a}+${b}：先凑十再算，得？`, wrongOpts(s, [s + 1, 10, a + 10]), s, '凑十'))
      mm.push(q(`${a}+${b}=${s}，另一种算法？`, [{ value: `${b}+${a}`, label: `${b}+${a}` }, { value: `${a}-${b}`, label: `${a}-${b}` }, { value: `${s}+1`, label: `${s}+1` }, { value: `${a}+${b}+1`, label: `${a}+${b}+1` }], `${b}+${a}`, '交换'))
    } else {
      const a = randInt(lv === 2 ? 11 : 20, lv === 2 ? 30 : 60), b = randInt(3, 9), s = a + b
      sc.push(q(`${a}+${b}=？（注意进位）`, wrongOpts(s, [s + 1, s - 1, s + 10, s - 10]), s, '个位相加'))
      const sp = 10 - (a % 10)
      mr.push(q(`${a}+${b}：先加 ${sp} 凑整十，再算`, wrongOpts(s, [s + 1, s - 1, a + 10]), s, '凑整十'))
      mm.push(q(`${a}+${b}=${s}，另一种算法？`, [{ value: `先加整十再加个位`, label: `先加整十再加个位` }, { value: `${a}-${b}`, label: `${a}-${b}` }, { value: `${s}+1`, label: `${s}+1` }, { value: `只加个位`, label: `只加个位` }], `先加整十再加个位`, '拆开算'))
    }
    const tools = ['画图', '拆分', '列表', '倒推']
    const scenes = [
      ['小红前面 3 人后面 2 人，一共几人？', '画图'],
      ['一个数加 6 等于 15，这个数是几？', '倒推'],
      ['想记下每天存了几元', '列表'],
      ['8+5 怎样算更快？', '拆分'],
    ]
    const scn = scenes[i % scenes.length]
    tb.push(q(`${scn[0]} 选策略`, tools.map((x) => ({ value: x, label: x })), scn[1], '选合适的'))
  }
  add('calc-strategy', 'split-calc', lv, dedup(sc))
  add('calc-strategy', 'make-round', lv, dedup(mr))
  add('calc-strategy', 'multi-method', lv, dedup(mm))
  add('calc-strategy', 'tool-box', lv, dedup(tb))
}

// ---- pattern ----
for (const lv of [1, 2, 3]) {
  const sq = [], oo = [], ds = [], sp = [], jd = []
  const step = lv === 1 ? randInt(1, 2) : lv === 2 ? randInt(2, 3) : randInt(2, 5)
  for (let i = 0; i < N; i++) {
    const start = randInt(1, lv === 1 ? 8 : 20)
    const st = lv === 1 ? pick([1, 2]) : lv === 2 ? pick([2, 3]) : pick([2, 3, 5])
    const seq = Array.from({ length: 4 }, (_, j) => start + st * j)
    const ans = seq[3] + st
    sq.push(q(pick([`${seq.join(', ')}, ?`, `小火车：${seq.join('、')}、？`, `每次+${st}，下一个是？`]), wrongOpts(ans, [ans + 1, ans - 1, ans + st]), ans, `+${st}`))
    const pool = [['苹果', '香蕉', '橘子', '汽车'], ['猫', '狗', '鱼', '桌子'], ['红', '蓝', '绿', '跑'], ['三角', '正方', '圆', '苹果']]
    const d = pool[i % pool.length]
    oo.push(q(`哪个不同类？${d.join('、')}`, d.map((x) => ({ value: x, label: x })), d[3], '找不同类'))
    const ab = pick([['红', '蓝'], ['圆', '方'], ['A', 'B']])
    ds.push(q(`${ab[0]}${ab[1]}${ab[0]}${ab[1]}${ab[0]} 下一个？`, ab.map((x) => ({ value: x, label: x })), ab[1], 'AB 规律'))
    const n = randInt(2, 5)
    sp.push(q(`${n} 个正方形各有 4 条边，共几条边？`, wrongOpts(n * 4, [n * 3, n * 4 + 1, n + 4]), n * 4, `${n}×4`))
    const x = randInt(2, 12), y = randInt(2, 12), shown = x + y + pick([-1, 0, 1])
    jd.push(q(`${x}+${y}=${shown} 对吗？`, [{ value: '对', label: '对' }, { value: '错', label: '错' }], shown === x + y ? '对' : '错', `${x}+${y}=${x + y}`))
  }
  add('pattern', 'sequence', lv, dedup(sq))
  add('pattern', 'odd-one-out', lv, dedup(oo))
  add('pattern', 'designer', lv, dedup(ds))
  add('pattern', 'shape-pattern', lv, dedup(sp))
  add('pattern', 'judge', lv, dedup(jd))
}

// ---- spatial（无体积公式超纲）----
for (const lv of [1, 2, 3]) {
  const tg = [], rt = [], cs = [], sy = [], bc = []
  for (let i = 0; i < N; i++) {
    tg.push(q(pick(['2 个一样的三角形能拼成什么？', '七巧板一共几块？', '七巧板中三角形有几个？'][i % 3]),
      (i % 3 === 0 ? ['正方形', '圆形', '三角形', '长方形'] : i % 3 === 1 ? ['5块', '6块', '7块', '8块'] : ['3个', '4个', '5个', '6个']).map((x) => ({ value: x, label: x })),
      i % 3 === 0 ? '正方形' : i % 3 === 1 ? '7块' : '5个', '拼一拼'))
    const shape = pick(['圆', '正方形'])
    rt.push(q(`${shape}旋转 ${pick([90, 180, 360])}° 后还是它吗？`, [{ value: '是', label: '是' }, { value: '不是', label: '不是' }], '是', '对称'))
    const n = randInt(2, 4)
    cs.push(q(`有 ${n} 个小三角形和 1 个大的，一共几个三角形？`, wrongOpts(n + 1, [n, n + 2, n * 2]), n + 1, '小+大'))
    const shapes = [['正方形', '4'], ['圆', '无数'], ['长方形', '2'], ['等边三角形', '3']]
    const s = pick(shapes)
    sy.push(q(`${s[0]}有几条对称轴？`, ['1', '2', '3', '4', '无数'].map((x) => ({ value: x, label: x })), s[1], '折一折'))
    const l = randInt(2, lv === 1 ? 3 : 4), w = randInt(2, 3)
    bc.push(q(`${l} 行每行 ${w} 块，一共几块积木？`, wrongOpts(l * w, [l + w, l * w + 1, l * w - 1]), l * w, '一层一层加'))
  }
  add('spatial', 'tangram', lv, dedup(tg))
  add('spatial', 'rotate', lv, dedup(rt))
  add('spatial', 'count-shapes', lv, dedup(cs))
  add('spatial', 'symmetry', lv, dedup(sy))
  add('spatial', 'block-count', lv, dedup(bc))
}

// ---- logic ----
for (const lv of [1, 2, 3]) {
  const [lo, hi] = range(lv)
  const ww = [], od = [], tf = [], ld = []
  for (let i = 0; i < N; i++) {
    let a = randInt(lo, hi), b = randInt(lo, hi)
    if (a === b) b = a + 1
    ww.push(q(`A=${a}，B=${b}，谁大？`, ['A', 'B', '一样大'].map((x) => ({ value: x, label: x })), a > b ? 'A' : 'B', '比大小'))
    const nums = shuffle([randInt(lo, hi), randInt(lo, hi), randInt(lo, hi), randInt(lo, hi)])
    const sorted = [...nums].sort((x, y) => x - y)
    od.push(q(`从小到大：${nums.join(', ')}，最大是？`, sorted.map((x) => ({ value: String(x), label: String(x) })), String(sorted[3]), '找最大'))
    const stmts = [[`${a}+0=${a}`, '对'], [`${a}-${a}=1`, '错'], [`任何数加0等于它自己`, '对'], [`0减任何数等于0`, '错']]
    const st = stmts[i % stmts.length]
    tf.push(q(`"${st[0]}"对吗？`, [{ value: '对', label: '对' }, { value: '错', label: '错' }], st[1], '想一想'))
    const ans = randInt(Math.max(lo, 5), hi)
    ld.push(q(`线索：比 ${ans - 1} 大，比 ${ans + 1} 小。这个数是？`, wrongOpts(ans, [ans - 1, ans + 1, ans + 2]), ans, '夹在中间'))
  }
  add('logic', 'who-is-who', lv, dedup(ww))
  add('logic', 'ordering', lv, dedup(od))
  add('logic', 'true-false', lv, dedup(tf))
  add('logic', 'little-detective', lv, dedup(ld))
}

// ---- problem-solving（含钟表；生活加减；路径用加法情境弱化乘）----
for (const lv of [1, 2, 3]) {
  const rt = [], lm = []
  for (let i = 0; i < N; i++) {
    const a = randInt(2, 3), b = randInt(2, 3)
    rt.push(q(pick([
      `从家到公园有 ${a} 条路，公园到学校有 ${b} 条，合起来走法可以想成 ${a} 组每组 ${b} 条，一共几条？（可数一数）`,
      `左边路口 ${a} 条，右边再分 ${b} 条，一共几种走法？用手指数`,
    ]), wrongOpts(a * b, [a + b, a * b + 1, a * b - 1]), a * b, '一条一条数'))
    if (i % 3 === 0) {
      const h = randInt(1, 11)
      if (i % 6 === 0) {
        lm.push(q(`时针指 ${h}、分针指 12，是几点？`,
          [`${h} 点`, `${h + 1} 点`, `${Math.max(1, h - 1)} 点`, `${h} 点半`].map((x) => ({ value: x, label: x })),
          `${h} 点`, '分针指12是整点'))
      } else {
        lm.push(q(`现在是 ${h} 点，再过 1 小时是几点？`,
          [`${h + 1} 点`, `${h} 点`, `${h + 2} 点`, `${h} 点半`].map((x) => ({ value: x, label: x })),
          `${h + 1} 点`, '过1小时加1'))
      }
    } else if (i % 3 === 1) {
      const money = randInt(lv === 1 ? 5 : 10, lv === 1 ? 15 : 40), cost = randInt(2, money - 1)
      lm.push(q(`有 ${money} 元，买 ${cost} 元的东西，找回几元？`, wrongOpts(money - cost, [money - cost + 1, money + cost, cost]), money - cost, '付钱找零'))
    } else {
      const a = randInt(2, 9), b = randInt(2, 9)
      lm.push(q(`苹果 ${a} 元、香蕉 ${b} 元，一起买几元？`, wrongOpts(a + b, [a + b + 1, a, b]), a + b, '合起来'))
    }
  }
  add('problem-solving', 'route', lv, dedup(rt))
  add('problem-solving', 'life-math', lv, dedup(lm))
}

// ---- math-expression / data ----
for (const lv of [1, 2, 3]) {
  const mym = [], fm = [], cks = [], rc = [], cd = [], ss = []
  for (let i = 0; i < N; i++) {
    const methods = ['画图', '拆分', '凑十', '倒推']
    mym.push(q(pick(['8+5 先凑十，用了什么方法？', '从结果往回推，这是什么方法？', '画线段图理解题意，是什么方法？']),
      methods.map((x) => ({ value: x, label: x })), pick(['凑十', '倒推', '画图']), '选方法'))
    const a = randInt(5, lv === 1 ? 12 : 30), b = randInt(2, 8), correct = a + b, wrong = correct + pick([-1, 1])
    fm.push(q(`${a}+${b}=${wrong} 正确答案是？`, wrongOpts(correct, [wrong, correct + 1, correct - 1]), correct, '验算'))
    const x = randInt(3, 10), y = randInt(3, 10), z = randInt(2, 8)
    const items = ['苹果', '香蕉', '橘子']
    const maxI = [x, y, z].indexOf(Math.max(x, y, z))
    cks.push(q(`${items[0]}${x} ${items[1]}${y} ${items[2]}${z}，哪种最多？`, items.map((t) => ({ value: t, label: t })), items[maxI], '比大小'))
    const vals = [randInt(3, 10), randInt(3, 10), randInt(3, 10)]
    const names = ['甲', '乙', '丙']
    rc.push(q(`柱状图：${names.map((n, j) => `${n}=${vals[j]}`).join('，')}，谁最多？`, names.map((n) => ({ value: n, label: n })), names[vals.indexOf(Math.max(...vals))], '最高'))
    let p = randInt(5, 20), r = randInt(5, 20)
    if (p === r) r++
    cd.push(q(`A组${p}人，B组${r}人，哪组多？`, ['A组', 'B组', '一样多'].map((t) => ({ value: t, label: t })), p > r ? 'A组' : 'B组', '比大小'))
    ss.push(q(`喜欢A ${x}人，B ${y}人，C ${z}人，共几人？`, wrongOpts(x + y + z, [x + y, x + y + z + 1, y + z]), x + y + z, '全加'))
  }
  add('math-expression', 'my-method', lv, dedup(mym))
  add('math-expression', 'find-mistake', lv, dedup(fm))
  add('data-thinking', 'count-sort', lv, dedup(cks))
  add('data-thinking', 'read-chart', lv, dedup(rc))
  add('data-thinking', 'compare-data', lv, dedup(cd))
  add('data-thinking', 'simple-survey', lv, dedup(ss))
}

mkdirSync('public', { recursive: true })
const json = JSON.stringify(bank)
writeFileSync('public/question-bank-local.json', json, 'utf-8')
let total = 0
for (const b of Object.values(bank)) for (const a of Object.values(b)) total += a.length
console.log(`生成完毕：${Object.keys(bank).length} 游戏，${total} 题 → public/question-bank-local.json`)
