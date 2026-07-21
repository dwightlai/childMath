// 一年级课标对齐题库：低/中/高 = 1/2/3，强调情境与思维
// 运行: node generate-bank.mjs

import { writeFileSync, mkdirSync } from 'fs'

const bank = {}
const N = 36
const add = (mod, game, level, qs) => {
  const key = `${mod}/${game}`
  if (!bank[key]) bank[key] = {}
  const prev = bank[key][level] || []
  bank[key][level] = dedup([...prev, ...qs])
}
const q = (question, options, answer, hint) => ({
  question,
  options: options.map((o) => (typeof o === 'object' ? o : { value: String(o), label: String(o) })),
  answer: String(answer),
  hint: hint || '',
  speakText: question,
})
const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1))
const wrongOpts = (correct, pool, count = 3) => {
  const s = new Set([String(correct)])
  const opts = shuffle(pool.filter((x) => !s.has(String(x)) && x !== '' && x != null))
  return shuffle([String(correct), ...opts.slice(0, count).map(String)])
}
const dedup = (arr) => {
  const seen = new Set()
  return arr.filter((x) => {
    if (!x?.question || seen.has(x.question)) return false
    seen.add(x.question)
    return true
  })
}
const numOpts = (ans, spread = 3) =>
  wrongOpts(ans, [ans - 2, ans - 1, ans + 1, ans + 2, ans + 3, ans + 5, Math.max(0, ans - 3)].filter((v) => v >= 0), 3)

const KIDS = ['小明', '小红', '小鹿', '小兔', '小熊', '丁丁', '豆豆', '乐乐']
const THINGS = ['苹果', '星星贴纸', '气球', '积木', '糖果', '铅笔', '饼干', '小鱼']
const PLACES = ['书包', '抽屉', '篮子', '盒子', '口袋']

const span = (lv) => (lv === 1 ? [1, 10] : lv === 2 ? [5, 20] : [10, 100])

// ========== 数感 ==========
for (const lv of [1, 2, 3]) {
  const [lo, hi] = span(lv)
  const mt = [], sn = [], qc = [], ff = [], cp = [], es = []
  for (let i = 0; i < N; i++) {
    const tgt = lv === 1 ? 10 : lv === 2 ? pick([10, 20]) : pick([20, 50, 100])
    const n = randInt(1, Math.min(9, tgt - 1))
    const ans = tgt - n
    const kid = pick(KIDS)
    const thing = pick(THINGS)
    mt.push(q(pick([
      `${n} 和谁合起来是 ${tgt}？动脑想一想～`,
      `${kid}有 ${n} 个${thing}，还差几个就凑成 ${tgt} 个？`,
      `神奇盒子：□ + ${n} = ${tgt}，方框是几？`,
      `青蛙从 ${n} 跳到 ${tgt}，要跳几格？`,
      `凑一凑：${n} + ？ = ${tgt}`,
    ]), numOpts(ans), ans, `想：${tgt} 比 ${n} 多几？`))

    const total = randInt(Math.max(4, lo), Math.min(hi, lv === 1 ? 10 : hi))
    const part = randInt(1, total - 1)
    const other = total - part
    sn.push(q(pick([
      `把 ${total} 拆成 ${part} 和另一半，另一半是几？`,
      `${total} = ${part} + □，□ 藏着几？`,
      `${kid}有 ${total} 支笔，借给朋友 ${part} 支，自己还剩几支？`,
      `左边摆 ${part} 个，一共 ${total} 个，右边有几个？`,
      `双手分珠子：一共 ${total} 颗，左手 ${part} 颗，右手几颗？`,
    ]), numOpts(other), other, `${total} − ${part}`))

    const c = randInt(lo, Math.min(hi, lv === 1 ? 12 : 40))
    qc.push(q(pick([
      `数一数：图里大约有这么多（答案是 ${c}），选总数`,
      `${kid}收集${thing}，一一点完是 ${c} 个，选对的`,
      `先估再数：这堆一共几个？（${c}）`,
      `盖住一个再数，别漏——一共 ${c} 个`,
    ]), numOpts(c), c, '一个一个指着数'))

    const t = lv === 1 ? 10 : randInt(10, lv === 2 ? 15 : 20)
    const a = randInt(1, t - 1), b = t - a
    ff.push(q(pick([
      `哪两个数是 ${t} 的好朋友？`,
      `${kid}想凑成 ${t}，该选哪一对？`,
      `找搭档：谁和谁加起来等于 ${t}？`,
      `友谊圈：合起来是 ${t} 的是？`,
    ]), [
      { value: `${a}和${b}`, label: `${a} 和 ${b}` },
      { value: `${a + 1}和${b}`, label: `${a + 1} 和 ${b}` },
      { value: `${a}和${b + 1}`, label: `${a} 和 ${b + 1}` },
      { value: `${Math.max(1, a - 1)}和${b}`, label: `${Math.max(1, a - 1)} 和 ${b}` },
    ], `${a}和${b}`, `${a}+${b}=${t}`))

    let x = randInt(lo, hi), y = randInt(lo, hi)
    if (lv === 1 && Math.random() < 0.3) { x = randInt(1, 20); y = randInt(1, 20) }
    const sym = x > y ? '>' : x < y ? '<' : '='
    cp.push(q(pick([
      `${x} ○ ${y}，○ 里填什么？`,
      `${kid}有 ${x} 个，朋友有 ${y} 个：${x} ○ ${y}`,
      `比大小小裁判：${x} 和 ${y} 用 ＞＜＝ 怎么连？`,
      `谁更大？用符号说：${x} ○ ${y}`,
    ]), ['>', '<', '='].map((v) => ({ value: v, label: v === '>' ? '＞' : v === '<' ? '＜' : '＝' })), sym, '先看两边再比'))

    const n2 = randInt(lv === 1 ? 8 : 15, lv === 1 ? 22 : lv === 2 ? 45 : 80)
    const approx = Math.round(n2 / 10) * 10 || 10
    es.push(q(pick([
      `不用逐个点，估一估大约几个？（接近 ${n2}）`,
      `${kid}说“大概几十个”，最接近哪个整十？（约 ${n2}）`,
      `一眼瞄过去，更接近哪个数？（真实大约 ${n2}）`,
    ]), wrongOpts(approx, [approx - 10, approx + 10, n2, approx + 20].filter((v) => v > 0)), approx, '看大概，靠近哪个整十'))
  }
  add('number-sense', 'make-ten', lv, mt)
  add('number-sense', 'split-number', lv, sn)
  add('number-sense', 'quick-count', lv, qc)
  add('number-sense', 'find-friend', lv, ff)
  add('number-sense', 'compare', lv, cp)
  add('number-sense', 'estimate', lv, es)
}

// ========== 数量关系（应用题思维）==========
for (const lv of [1, 2, 3]) {
  const [lo, hi] = span(lv)
  const st = [], ar = [], ml = [], dt = [], ms = []
  for (let i = 0; i < N; i++) {
    const kid = pick(KIDS), thing = pick(THINGS), place = pick(PLACES)
    const a = randInt(lo, hi), b = randInt(2, Math.min(9, hi))
    const mode = i % 5
    if (mode === 0) {
      const s = a + b
      st.push(q(pick([
        `${kid}的${place}里有 ${a} 个${thing}，又放进 ${b} 个，现在几个？`,
        `左边 ${a} 个，右边 ${b} 个，合起来几个${thing}？`,
        `${kid}先得 ${a} 颗星，又得 ${b} 颗，一共几颗？`,
      ]), numOpts(s), s, '合起来用加法'))
    } else if (mode === 1) {
      const big = Math.max(a, b + 2), small = randInt(1, big - 1)
      st.push(q(pick([
        `${kid}有 ${big} 个${thing}，送给朋友 ${small} 个，还剩几个？`,
        `盘子里 ${big} 块饼干，吃掉 ${small} 块，剩几块？`,
      ]), numOpts(big - small), big - small, '拿走了用减法'))
    } else if (mode === 2) {
      const base = randInt(lo, hi), more = randInt(1, 6)
      st.push(q(pick([
        `${kid}有 ${base} 个，${pick(KIDS)}比他多 ${more} 个，${pick(KIDS)}有几个？`,
        `小兔子比 ${base} 多 ${more}，小兔子有几个？`,
      ]), numOpts(base + more), base + more, '“比…多”就是再加'))
    } else if (mode === 3 && lv >= 2) {
      const start = randInt(10, hi), off = randInt(2, 6), on = randInt(1, 5)
      st.push(q(
        `公交车上有 ${start} 人，下去 ${off} 人，又上来 ${on} 人，现在几人？`,
        numOpts(start - off + on), start - off + on, '先减再用加，一步一步',
      ))
    } else {
      const have = randInt(8, hi), need = have + randInt(2, 8)
      st.push(q(
        `${kid}想买要 ${need} 元的${thing}，口袋里有 ${have} 元，还差几元？`,
        numOpts(need - have), need - have, '目标减去已有',
      ))
    }

    const u = randInt(4, hi), d = randInt(1, Math.min(5, u - 1))
    ar.push(q(pick([
      `上排 ${u} 个，下排比上排少 ${d} 个，下排几个？`,
      `第一行 ${u} 朵花，第二行少 ${d} 朵，第二行几朵？`,
      `搭积木：下面比上面少 ${d}，上面 ${u} 块，下面几块？`,
    ]), numOpts(u - d), u - d, `${u}−${d}`))

    // 位置（一年级上）
    if (i % 3 === 0) {
      const total = lv === 1 ? randInt(5, 10) : randInt(8, 16)
      const n = randInt(2, total - 1)
      const ans = total - n + 1
      ar.push(q(pick([
        `一共 ${total} 只小动物排队，从前数第 ${n} 是小鹿，从后数第几？`,
        `${total} 人做操，${kid}从前数第 ${n}，从后数第几？`,
      ]), numOpts(ans), ans, `${total}−${n}+1`))
    }

    let p = randInt(lo, hi), r = randInt(lo, hi)
    if (p === r) r = p + 1
    const diff = Math.abs(p - r)
    ml.push(q(pick([
      `A 排 ${p} 个，B 排 ${r} 个，相差几个？`,
      `多的比少的多几个？（${p} 和 ${r}）`,
      `少的一排再摆几个才能和多的一样多？（${p} vs ${r}）`,
    ]), numOpts(diff), diff, '大减小'))

    dt.push(q(pick([
      `想知道"${kid}一共有多少${thing}"，哪条信息有用？`,
      `算还剩几个，需要哪句话？`,
      `当小小侦探：哪条条件能帮我们算出答案？`,
    ]), [
      { value: `有${a}个又得到${b}个`, label: `他有 ${a} 个，又得到 ${b} 个` },
      { value: '天气', label: '今天天气很好' },
      { value: '喜欢', label: `${kid}喜欢红色` },
      { value: '书包', label: '书包在桌上' },
    ], `有${a}个又得到${b}个`, '有数字、能算的才有用'))

    const s2 = a + b
    ms.push(q(pick([
      `${a}+${b}=${s2}，哪个想法也对？`,
      `算 ${a} 加 ${b}，换个说法也对的是？`,
      `同一道题，另一种正确算法是？`,
    ]), [
      { value: `${b}+${a}=${s2}`, label: `${b}+${a}=${s2}` },
      { value: `${a}+${b}=${s2 + 1}`, label: `${a}+${b}=${s2 + 1}` },
      { value: `${a}-${b}=${s2}`, label: `${a}-${b}=${s2}` },
      { value: `${s2}+${a}=${b}`, label: `${s2}+${a}=${b}` },
    ], `${b}+${a}=${s2}`, '加法交换位置结果不变'))
  }
  add('quantity-relation', 'story-theater', lv, st)
  add('quantity-relation', 'arrange', lv, ar)
  add('quantity-relation', 'more-less', lv, ml)
  add('quantity-relation', 'detective', lv, dt)
  add('quantity-relation', 'multi-solve', lv, ms)
}

// ========== 运算策略（凑十/破十/选方法）==========
for (const lv of [1, 2, 3]) {
  const sc = [], mr = [], mm = [], tb = []
  for (let i = 0; i < N; i++) {
    if (lv === 1) {
      const a = randInt(2, 9), b = randInt(2, 9), s = a + b
      sc.push(q(pick([`${a}+${b}=？可以怎么想？`, `心算：${a} 加 ${b} 等于？`]), numOpts(s), s, '可以凑十再算'))
      mr.push(q(`${a}+${b}：先凑十再算，得？`, numOpts(s), s, '凑成10再加剩下的'))
      mm.push(q(`${a}+${b}=${s}，另一种也对的是？`, [
        { value: `${b}+${a}`, label: `${b}+${a}` },
        { value: `${a}-${b}`, label: `${a}-${b}` },
        { value: `${s}+1`, label: `${s}+1` },
        { value: `${a}+${b}+1`, label: `${a}+${b}+1` },
      ], `${b}+${a}`, '换个顺序试试'))
    } else if (lv === 2) {
      // 20以内进位加 / 退位减
      if (i % 2 === 0) {
        const a = randInt(5, 9), b = randInt(10 - a + 1, 9), s = a + b
        sc.push(q(pick([
          `${a}+${b}，个位满十，结果是？`,
          `凑十小挑战：${a}+${b}=？`,
        ]), numOpts(s), s, `把 ${b} 拆成 ${10 - a} 和 ${b - (10 - a)}`))
        mr.push(q(`${a}+${b} 用凑十法，得？`, numOpts(s), s, `先凑 ${a}+${10 - a}=10`))
      } else {
        const a = randInt(11, 18), b = randInt((a % 10) + 1, 9), d = a - b
        sc.push(q(pick([
          `${a}−${b}，个位不够减，答案是？`,
          `破十法：${a} 减 ${b} 等于？`,
        ]), numOpts(d), d, '向十位借1当10再减'))
        mr.push(q(`${a}−${b} 破十后得？`, numOpts(d), d, '借一当十'))
      }
      const a2 = randInt(11, 20), b2 = randInt(2, 9), s2 = a2 + b2
      mm.push(q(`${a2}+${b2}，哪种想法更聪明？`, [
        { value: '拆分凑十', label: '把一个数拆开凑十' },
        { value: '瞎猜', label: '随便猜一个' },
        { value: '只加个位', label: '只加个位不管十位' },
        { value: '倒着减', label: '用减法硬算' },
      ], '拆分凑十', '满十进位时拆分最清楚'))
    } else {
      const a = randInt(25, 80), b = randInt(3, 19), s = a + b
      sc.push(q(`${a}+${b}=？（注意进位）`, numOpts(s, 5), s, '个位相加，满十进1'))
      const sp = 10 - (a % 10)
      mr.push(q(`${a}+${b}：先加 ${sp} 凑整十，结果？`, numOpts(s, 5), s, '凑整十更好算'))
      mm.push(q(`${a}+${b}=${s}，更简便的想法是？`, [
        { value: '先加整十再加个位', label: '先加整十再加个位' },
        { value: '只看个位', label: '只看个位' },
        { value: '从大减到小', label: '从大减到小' },
        { value: '不用算', label: '不用算' },
      ], '先加整十再加个位', '把大数拆开'))
    }
    const tools = ['画图', '拆分', '列表', '倒推']
    const scenes = [
      ['一排小朋友，前面 3 人后面 2 人，一共几人？', '画图'],
      ['一个数加 6 等于 15，这个数是几？', '倒推'],
      ['想记下每天存了几元', '列表'],
      ['8+5 怎样算更快？', '拆分'],
      ['原来有一些球，拿走 3 个还剩 8 个，原来几个？', '倒推'],
      ['小明排第 5，后面还有 6 人，一共几人？', '画图'],
    ]
    const scn = scenes[i % scenes.length]
    tb.push(q(`${scn[0]} —— 选最合适的策略`, tools.map((x) => ({ value: x, label: x })), scn[1], '想想哪招最清楚'))
  }
  add('calc-strategy', 'split-calc', lv, sc)
  add('calc-strategy', 'make-round', lv, mr)
  add('calc-strategy', 'multi-method', lv, mm)
  add('calc-strategy', 'tool-box', lv, tb)
}

// ========== 规律 ==========
for (const lv of [1, 2, 3]) {
  const sq = [], oo = [], ds = [], sp = [], jd = []
  for (let i = 0; i < N; i++) {
    const start = randInt(1, lv === 1 ? 8 : 20)
    const st = lv === 1 ? pick([1, 2]) : lv === 2 ? pick([2, 3]) : pick([2, 3, 5, -1, -2])
    const seq = Array.from({ length: 4 }, (_, j) => start + st * j)
    const ans = seq[3] + st
    sq.push(q(pick([
      `找规律：${seq.join('、')}、？`,
      `小火车开过来：${seq.join('→')}→？`,
      `每次${st > 0 ? '加' : '减'}${Math.abs(st)}，下一个是？`,
      `密码序列：${seq.join(', ')}, ?`,
    ]), numOpts(ans), ans, `每次${st > 0 ? '+' : ''}${st}`))

    const pools = [
      ['苹果', '香蕉', '橘子', '汽车'],
      ['猫', '狗', '鱼', '桌子'],
      ['红', '蓝', '绿', '跑'],
      ['三角', '正方', '圆', '甜'],
      ['春', '夏', '秋', '热'],
      ['铅笔', '橡皮', '尺子', '蛋糕'],
    ]
    const d = pools[i % pools.length]
    oo.push(q(pick([`哪个和其他不同类？${d.join('、')}`, `找不同：${d.join(' / ')}`]),
      d.map((x) => ({ value: x, label: x })), d[3], '想它们属于哪一类'))

    const ab = pick([['红', '蓝'], ['圆', '方'], ['星', '月'], ['A', 'B']])
    if (lv === 1) {
      ds.push(q(`${ab[0]}${ab[1]}${ab[0]}${ab[1]}${ab[0]} 下一个？`, ab.map((x) => ({ value: x, label: x })), ab[1], 'AB 交替'))
    } else {
      const abc = pick([['红', '黄', '蓝'], ['圆', '方', '三角']])
      ds.push(q(`${abc[0]}${abc[1]}${abc[2]}${abc[0]}${abc[1]} 下一个？`, abc.map((x) => ({ value: x, label: x })), abc[2], 'ABC 循环'))
    }

    const n = randInt(2, 5)
    sp.push(q(pick([
      `${n} 个正方形各有 4 条边，不重复数，共几条边？`,
      `边边角角：${n} 个正方形，边一共几条？`,
    ]), numOpts(n * 4), n * 4, `${n}×4`))

    const x = randInt(2, lv === 1 ? 12 : 40), y = randInt(2, 12)
    const shown = x + y + pick([-1, 0, 1, lv >= 2 ? 10 : 0])
    jd.push(q(pick([
      `${x}+${y}=${shown} 对吗？当小老师判一判`,
      `有人说 ${x}+${y} 等于 ${shown}，你觉得？`,
    ]), [{ value: '对', label: '对' }, { value: '错', label: '错' }], shown === x + y ? '对' : '错', `${x}+${y}=${x + y}`))
  }
  add('pattern', 'sequence', lv, sq)
  add('pattern', 'odd-one-out', lv, oo)
  add('pattern', 'designer', lv, ds)
  add('pattern', 'shape-pattern', lv, sp)
  add('pattern', 'judge', lv, jd)
}

// ========== 空间（平面图形+简单立体辨认，无超纲体积）==========
for (const lv of [1, 2, 3]) {
  const tg = [], rt = [], cs = [], sy = [], bc = []
  const tgBank = [
    ['2 个一样的直角三角形能拼成什么？', '正方形', ['正方形', '圆形', '五边形', '长方形']],
    ['七巧板一共几块？', '7块', ['5块', '6块', '7块', '8块']],
    ['七巧板里三角形有几个？', '5个', ['3个', '4个', '5个', '6个']],
    ['2 个一样的正方形拼在一起像什么？', '长方形', ['正方形', '圆形', '三角形', '长方形']],
    ['缺口是梯形，该补哪一块？', '梯形', ['梯形', '三角形', '正方形', '圆']],
    ['缺了一块直角三角形，选？', '直角三角形', ['直角三角形', '正方形', '圆', '五边形']],
    ['球和圆柱，哪一个能滚动得更稳当地停在桌面？想一想：哪个有平的面？', '圆柱', ['圆柱', '球', '都一样', '圆锥']],
  ]
  const solids = [
    ['皮球最像哪个立体图形？', '球', ['球', '正方体', '长方体', '圆柱']],
    ['魔方最像？', '正方体', ['正方体', '球', '圆柱', '圆锥']],
    ['牙膏盒最像？', '长方体', ['长方体', '球', '正方体', '圆柱']],
    ['易拉罐最像？', '圆柱', ['圆柱', '球', '正方体', '长方体']],
  ]
  for (let i = 0; i < N; i++) {
    if (i % 4 === 0) {
      const s = solids[i % solids.length]
      tg.push(q(s[0], s[2].map((x) => ({ value: x, label: x })), s[1], '摸摸想形状'))
    } else {
      const t = tgBank[i % tgBank.length]
      tg.push(q(t[0], t[2].map((x) => ({ value: x, label: x })), t[1], '拼一拼想一想'))
    }
    const shape = ['圆', '正方形', '小旗', 'L形', '箭头', '楼梯'][i % 6]
    const deg = lv === 1 ? pick([90, 180]) : pick([90, 180, 270])
    const same = shape === '圆' || shape === '正方形'
    rt.push(q(pick([
      `${shape}顺时针转 ${deg}°，还是原来的样子吗？`,
      `转一转：把「${shape}」转 ${deg}°，变了吗？`,
    ]), [{ value: '是', label: '还是' }, { value: '不是', label: '变了' }], same ? '是' : '不是', '圆和正方形转完还像自己'))
    const n = 2 + (i % 4)
    cs.push(q(pick([
      `大三角里有 ${n} 个小三角，一共几个三角形？（含大的）`,
      `数图形高手：${n} 个小 + 1 个大，几个三角形？`,
    ]), numOpts(n + 1), n + 1, '小的加大的'))
    const shapes = [['正方形', '4'], ['圆', '无数'], ['长方形', '2'], ['等边三角形', '3'], ['等腰三角形', '1']]
    const s = shapes[i % shapes.length]
    sy.push(q(pick([`${s[0]}有几条对称轴？`, `折纸：${s[0]}能对折成一样的几次？`]),
      ['1', '2', '3', '4', '无数'].map((x) => ({ value: x, label: x })), s[1], '对折重合的折痕'))
    const l = 2 + (i % 3), w = 2 + ((i + 1) % 3)
    bc.push(q(pick([
      `${l} 行，每行 ${w} 块，一共几块积木？`,
      `一层 ${w} 块，共 ${l} 层，几块？`,
    ]), numOpts(l * w), l * w, '按层加起来'))
  }
  add('spatial', 'tangram', lv, tg)
  add('spatial', 'rotate', lv, rt)
  add('spatial', 'count-shapes', lv, cs)
  add('spatial', 'symmetry', lv, sy)
  add('spatial', 'block-count', lv, bc)
}

// ========== 逻辑 ==========
for (const lv of [1, 2, 3]) {
  const [lo, hi] = span(lv)
  const ww = [], od = [], tf = [], ld = []
  for (let i = 0; i < N; i++) {
    let a = randInt(lo, hi), b = randInt(lo, hi)
    if (a === b) b = a + 1
    ww.push(q(pick([
      `A=${a}，B=${b}，谁更大？`,
      `年龄谜题：哥哥 ${a} 岁，弟弟 ${b} 岁，谁大？`,
    ]), ['A', 'B', '一样大'].map((x) => ({ value: x, label: x })), a > b ? 'A' : 'B', '比一比'))
    const nums = shuffle([randInt(lo, hi), randInt(lo, hi), randInt(lo, hi), randInt(lo, hi)])
    const sorted = [...nums].sort((x, y) => x - y)
    od.push(q(`从小到大排：${nums.join(', ')}，最大是？`, sorted.map((x) => ({ value: String(x), label: String(x) })), String(sorted[3]), '找最大'))
    const stmts = [
      [`${a}+0=${a}`, '对'],
      [`${a}-${a}=1`, '错'],
      ['任何数加 0 还是它自己', '对'],
      ['0 减任何数都等于 0', '错'],
      [`${a} 比 ${a - 1} 大`, '对'],
    ]
    const st = stmts[i % stmts.length]
    tf.push(q(`"${st[0]}"——对还是错？`, [{ value: '对', label: '对' }, { value: '错', label: '错' }], st[1], '举例子想'))
    const ans = randInt(Math.max(lo, 5), Math.min(hi, lv === 1 ? 20 : hi))
    ld.push(q(pick([
      `线索：比 ${ans - 1} 大，比 ${ans + 1} 小。这个数是？`,
      `猜数游戏：它夹在 ${ans - 1} 和 ${ans + 1} 中间`,
    ]), numOpts(ans), ans, '夹在中间的数'))
  }
  add('logic', 'who-is-who', lv, ww)
  add('logic', 'ordering', lv, od)
  add('logic', 'true-false', lv, tf)
  add('logic', 'little-detective', lv, ld)
}

// ========== 问题解决：生活+钟表+人民币 ==========
for (const lv of [1, 2, 3]) {
  const rt = [], lm = []
  for (let i = 0; i < N; i++) {
    const a = randInt(2, 3), b = randInt(2, 3)
    rt.push(q(pick([
      `从家到公园有 ${a} 条小路，公园到学校又有 ${b} 条，一共几种走法？（可数出来）`,
      `岔路口：先 ${a} 选，再 ${b} 选，有几种走法？`,
    ]), numOpts(a * b), a * b, '一条一条数清楚'))

    const kind = i % 4
    if (kind === 0) {
      const h = randInt(1, 11)
      lm.push(q(pick([
        `钟面上短针指 ${h}，长针指 12，是几点？`,
        `小兔子看钟：时针在 ${h}，分针在 12，几点整？`,
      ]), [`${h} 点`, `${h + 1} 点`, `${Math.max(1, h - 1)} 点`, `${h} 点半`].map((x) => ({ value: x, label: x })),
        `${h} 点`, '长针指12是整点'))
    } else if (kind === 1) {
      const h = randInt(1, 10)
      const addH = lv === 1 ? 1 : pick([1, 2])
      lm.push(q(pick([
        `现在 ${h} 点，再过 ${addH} 小时去玩，是几点？`,
        `故事听到 ${h} 点，过 ${addH} 小时呢？`,
      ]), [`${h + addH} 点`, `${h} 点`, `${h + addH + 1} 点`, `${h} 点半`].map((x) => ({ value: x, label: x })),
        `${h + addH} 点`, `过 ${addH} 小时就加 ${addH}`))
    } else if (kind === 2) {
      const yuan = lv === 1 ? randInt(1, 5) : randInt(2, 9)
      const jiao = randInt(0, 9)
      lm.push(q(pick([
        `买文具花了 ${yuan} 元 ${jiao} 角，一共几角？`,
        `存钱罐：${yuan} 元 ${jiao} 角 = ？角`,
      ]), numOpts(yuan * 10 + jiao), yuan * 10 + jiao, '1元=10角'))
    } else {
      const money = randInt(lv === 1 ? 5 : 10, lv === 1 ? 15 : 50)
      const cost = randInt(2, money - 1)
      lm.push(q(pick([
        `有 ${money} 元，买 ${cost} 元的东西，找回几元？`,
        `付给收银员 ${money} 元，东西 ${cost} 元，应找回？`,
      ]), numOpts(money - cost), money - cost, '付钱−价钱'))
    }
  }
  // 公平分/凑钱/拼搭用文字思维版（交互游戏另有；题库作补充）
  const fs = [], mc = [], fb = []
  for (let i = 0; i < N; i++) {
    const total = lv === 1 ? randInt(6, 12) : lv === 2 ? randInt(8, 20) : randInt(12, 40)
    const people = pick([2, 4, 5])
    const each = Math.floor(total / people)
    fs.push(q(pick([
      `${total} 颗糖分给 ${people} 人，尽量公平，每人几颗？（先不分余数）`,
      `分糖游戏：${total} 颗给 ${people} 个小朋友，每人几颗？`,
    ]), numOpts(each), each, '试试看能不能均分'))
    const target = lv === 1 ? randInt(3, 10) : randInt(5, 20)
    mc.push(q(pick([
      `要用 1 元、5 元凑出 ${target} 元，至少几张？（可多用）想一想最少张数接近？选：`,
      `凑钱：目标 ${target} 元，下面哪个最少用币合理？`,
    ]), (() => {
      const min = Math.ceil(target / 5)
      return wrongOpts(min, [min + 1, min + 2, target, Math.max(1, min - 1)])
    })(), Math.ceil(target / 5), '先用大面额'))
    const edges = lv === 1 ? randInt(8, 16) : randInt(12, 24)
    const need = Math.ceil(edges / 4)
    fb.push(q(`用正方形（4 边）拼出至少 ${edges} 条边，最少几个正方形？`, numOpts(need), need, '向上取整'))
  }
  add('problem-solving', 'route', lv, rt)
  add('problem-solving', 'life-math', lv, lm)
  add('problem-solving', 'fair-share', lv, fs)
  add('problem-solving', 'make-change', lv, mc)
  add('problem-solving', 'free-build', lv, fb)
}

// ========== 数学表达 ==========
for (const lv of [1, 2, 3]) {
  const mym = [], fm = []
  for (let i = 0; i < N; i++) {
    const methods = ['画图', '拆分', '凑十', '倒推']
    mym.push(q(pick([
      '8+5 先凑成 10 再算，用了什么方法？',
      '从结果往回推，这是什么方法？',
      '画线段图理解“多几个”，是什么方法？',
      '把大数拆成整十和个位，属于？',
    ]), methods.map((x) => ({ value: x, label: x })), pick(['凑十', '倒推', '画图', '拆分']), '选最贴切的'))
    const a = randInt(5, lv === 1 ? 12 : 40), b = randInt(2, 8)
    const correct = a + b, wrong = correct + pick([-1, 1, lv >= 2 ? 10 : 1])
    fm.push(q(pick([
      `${a}+${b}=${wrong}，正确答案是？`,
      `找茬：有人算成 ${wrong}，其实 ${a}+${b}=？`,
    ]), numOpts(correct), correct, '再验算一遍'))
  }
  add('math-expression', 'my-method', lv, mym)
  add('math-expression', 'find-mistake', lv, fm)
}

// ========== 数据意识（分类整理）==========
for (const lv of [1, 2, 3]) {
  const cks = [], rc = [], cd = [], ss = []
  for (let i = 0; i < N; i++) {
    const x = randInt(3, lv === 1 ? 10 : 30), y = randInt(3, lv === 1 ? 10 : 30), z = randInt(2, lv === 1 ? 8 : 25)
    const items = ['苹果', '香蕉', '橘子']
    const maxI = [x, y, z].indexOf(Math.max(x, y, z))
    cks.push(q(pick([
      `${items[0]}${x}、${items[1]}${y}、${items[2]}${z}，哪种最多？`,
      `水果统计：谁的数量第一？（${items[0]}${x} ${items[1]}${y} ${items[2]}${z}）`,
    ]), items.map((t) => ({ value: t, label: t })), items[maxI], '比一比三个数'))
    const vals = [randInt(3, 12), randInt(3, 12), randInt(3, 12)]
    const names = ['甲', '乙', '丙']
    rc.push(q(`柱状图：${names.map((n, j) => `${n}=${vals[j]}`).join('，')}，谁最高？`,
      names.map((n) => ({ value: n, label: n })), names[vals.indexOf(Math.max(...vals))], '找最大'))
    let p = randInt(5, 25), r = randInt(5, 25)
    if (p === r) r++
    cd.push(q(`A 组 ${p} 人，B 组 ${r} 人，哪组多？`,
      ['A组', 'B组', '一样多'].map((t) => ({ value: t, label: t })), p > r ? 'A组' : 'B组', '比大小'))
    ss.push(q(pick([
      `小调查：喜欢A ${x}人、B ${y}人、C ${z}人，共调查几人？`,
      `投票结束：三类票 ${x}、${y}、${z}，总共几票？`,
    ]), numOpts(x + y + z), x + y + z, '全加起来'))
  }
  add('data-thinking', 'count-sort', lv, cks)
  add('data-thinking', 'read-chart', lv, rc)
  add('data-thinking', 'compare-data', lv, cd)
  add('data-thinking', 'simple-survey', lv, ss)
}

mkdirSync('public', { recursive: true })
const json = JSON.stringify(bank)
writeFileSync('public/question-bank-local.json', json, 'utf-8')
let total = 0
const byL = { 1: 0, 2: 0, 3: 0 }
for (const buckets of Object.values(bank)) {
  for (const [lvl, arr] of Object.entries(buckets)) {
    total += arr.length
    byL[lvl] = (byL[lvl] || 0) + arr.length
  }
}
console.log(`生成完毕：${Object.keys(bank).length} 游戏，${total} 题（低${byL[1]} 中${byL[2]} 高${byL[3]}）`)
console.log('文件: public/question-bank-local.json')
