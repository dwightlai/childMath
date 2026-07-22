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
      `${n} 再加几，就能变成 ${tgt}？`,
      `${kid}有 ${n} 个${thing}，还要几个才够 ${tgt} 个？`,
      `方框里填几：□ + ${n} = ${tgt}`,
      `青蛙从 ${n} 跳到 ${tgt}，一共要跳几格？`,
      `${n} + □ = ${tgt}，□ 是几？`,
    ]), numOpts(ans), ans, `${tgt} 减 ${n}`))

    const total = randInt(Math.max(4, lo), Math.min(hi, lv === 1 ? 10 : hi))
    const part = randInt(1, total - 1)
    const other = total - part
    sn.push(q(pick([
      `把 ${total} 分成 ${part} 和另一个数，另一个数是几？`,
      `${total} = ${part} + □，□ 里填几？`,
      `${kid}有 ${total} 支笔，借出 ${part} 支，还剩几支？`,
      `左边有 ${part} 个，一共有 ${total} 个，右边有几个？`,
      `一共 ${total} 颗珠子，左手拿了 ${part} 颗，右手拿几颗？`,
    ]), numOpts(other), other, `${total} − ${part}`))

    const c = randInt(lo, Math.min(hi, lv === 1 ? 12 : 40))
    qc.push(q(pick([
      `请仔细数一数，一共有几个？`,
      `${kid}把${thing}摆成一堆，请你数一数有几个。`,
      `一个一个数，不要漏掉，一共几个？`,
      `指着数一数，图里一共有几个？`,
    ]), numOpts(c), c, '一个一个指着数'))

    const t = lv === 1 ? 10 : randInt(10, lv === 2 ? 15 : 20)
    const a = randInt(1, t - 1), b = t - a
    ff.push(q(pick([
      `哪两个数加起来正好是 ${t}？`,
      `${kid}想凑成 ${t}，应该选哪一对？`,
      `谁和谁是好朋友？它们加起来等于 ${t}。`,
      `下面哪一组合起来是 ${t}？`,
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
      `${x} ○ ${y}，○ 里应该填 ＞、＜ 还是 ＝？`,
      `${kid}有 ${x} 个${thing}，朋友有 ${y} 个，比一比：${x} ○ ${y}`,
      `${x} 和 ${y}，谁大？用 ＞ ＜ ＝ 连起来。`,
      `看这两个数：${x} 和 ${y}，中间填什么符号？`,
    ]), ['>', '<', '='].map((v) => ({ value: v, label: v === '>' ? '＞' : v === '<' ? '＜' : '＝' })), sym, '先看两边再比'))

    const n2 = randInt(lv === 1 ? 8 : 15, lv === 1 ? 22 : lv === 2 ? 45 : 80)
    const approx = Math.round(n2 / 10) * 10 || 10
    es.push(q(pick([
      `不用一个一个数，估一估大约有多少个？`,
      `${kid}说“大概几十个”，你觉得最接近哪个数？`,
      `看一看这一堆，大约有多少个？`,
    ]), wrongOpts(approx, [approx - 10, approx + 10, n2, approx + 20].filter((v) => v > 0)), approx, '先估再选接近的整十'))
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
      const kid2 = pick(KIDS.filter((k) => k !== kid).concat([kid === '小明' ? '小红' : '小明']))
      st.push(q(pick([
        `${kid}有 ${base} 个${thing}，${kid2}比${kid}多 ${more} 个，${kid2}有几个？`,
        `篮子里原来有 ${base} 个${thing}，又多放了 ${more} 个，现在几个？`,
        `${kid}收集了 ${base} 张贴纸，又得到 ${more} 张，一共几张？`,
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
        `${kid}想买一个 ${need} 元的${thing}，口袋里有 ${have} 元，还差几元？`,
        numOpts(need - have), need - have, '要买的价钱减去已有的钱',
      ))
    }

    const u = randInt(4, hi), d = randInt(1, Math.min(5, u - 1))
    ar.push(q(pick([
      `上面一排放了 ${u} 个，下面一排比上面少 ${d} 个，下面有几个？`,
      `第一行有 ${u} 朵花，第二行少 ${d} 朵，第二行有几朵？`,
      `上面搭了 ${u} 块积木，下面比上面少 ${d} 块，下面有几块？`,
    ]), numOpts(u - d), u - d, `${u}−${d}`))

    // 位置（一年级上）
    if (i % 3 === 0) {
      const total = lv === 1 ? randInt(5, 10) : randInt(8, 16)
      const n = randInt(2, total - 1)
      const ans = total - n + 1
      ar.push(q(pick([
        `一共有 ${total} 只小动物排队，小鹿从前数是第 ${n} 个，从后面数是第几个？`,
        `做操的小朋友一共 ${total} 人，${kid}从前数是第 ${n} 个，从后面数是第几个？`,
      ]), numOpts(ans), ans, `${total}−${n}+1`))
    }

    let p = randInt(lo, hi), r = randInt(lo, hi)
    if (p === r) r = p + 1
    const diff = Math.abs(p - r)
    ml.push(q(pick([
      `第一排有 ${p} 个，第二排有 ${r} 个，相差几个？`,
      `一排有 ${p} 个，另一排有 ${r} 个，多的比少的多几个？`,
      `少的一排还要再摆几个，才能和多的一排一样多？（${p} 和 ${r}）`,
    ]), numOpts(diff), diff, '大的减小的'))

    const detMode = pick(['total', 'remain', 'any'])
    let detAsk, detUseful, detAns
    if (detMode === 'total') {
      detAsk = `想知道"${kid}一共有多少${thing}"，哪条信息有用？`
      detUseful = `他有 ${a} 个，又得到 ${b} 个`
      detAns = `有${a}个又得到${b}个`
    } else if (detMode === 'remain') {
      detAsk = `算还剩几个${thing}，需要哪句话？`
      detUseful = `原来 ${a} 个，拿走 ${b} 个`
      detAns = `原来${a}个拿走${b}个`
    } else {
      detAsk = `想知道左边和右边一共有多少个${thing}，哪条信息有用？`
      detUseful = `左边 ${a} 个，右边 ${b} 个`
      detAns = `左${a}右${b}`
    }
    dt.push(q(detAsk, [
      { value: detAns, label: detUseful },
      { value: '天气', label: '今天天气很好' },
      { value: '喜欢', label: `${kid}喜欢红色` },
      { value: '书包', label: '书包在桌上' },
    ], detAns, '有数字、且能对上问题的才有用'))

    const s2 = a + b
    ms.push(q(pick([
      `${a}+${b}=${s2}，哪个想法也对？`,
      `算 ${a} 加 ${b}，换个说法也对的是？`,
      `${a}+${b}=${s2}，另一种正确算法是？`,
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
          `用凑十法算：${a}+${b}=？`,
        ]), numOpts(s), s, `把 ${b} 拆成 ${10 - a} 和 ${b - (10 - a)}`))
        mr.push(q(`${a}+${b} 用凑十法，得？`, numOpts(s), s, `先凑 ${a}+${10 - a}=10`))
      } else {
        const a = randInt(11, 18), b = randInt((a % 10) + 1, 9), d = a - b
        sc.push(q(pick([
          `${a}−${b}，个位不够减，得多少？`,
          `用破十法算：${a} 减 ${b} 等于？`,
        ]), numOpts(d), d, '向十位借 1 当 10 再减'))
        mr.push(q(`${a}−${b} 破十后得？`, numOpts(d), d, '借一当十'))
      }
      const a2 = randInt(11, 20), b2 = randInt(2, 9), s2 = a2 + b2
      mm.push(q(`${a2}+${b2}，哪种想法更合适？`, [
        { value: '拆分凑十', label: '把一个数拆开凑十' },
        { value: '瞎猜', label: '随便选一个答案' },
        { value: '只加个位', label: '只加个位，不管十位' },
        { value: '倒着减', label: '改成减法来算' },
      ], '拆分凑十', '满十进位时拆分最清楚'))
    } else {
      const a = randInt(25, 80), b = randInt(3, 19), s = a + b
      sc.push(q(`${a}+${b}=？（注意进位）`, numOpts(s, 5), s, '个位相加，满十进 1'))
      const rem = a % 10
      if (rem === 0) {
        mr.push(q(`${a}+${b}：已经是整十，直接加，结果？`, numOpts(s, 5), s, '整十加起来更方便'))
      } else {
        const sp = 10 - rem
        mr.push(q(`${a}+${b}：先加 ${sp} 凑成整十，结果？`, numOpts(s, 5), s, '凑整十更好算'))
      }
      mm.push(q(`${a}+${b}=${s}，更简便的想法是？`, [
        { value: '先加整十再加个位', label: '先加整十再加个位' },
        { value: '只看个位', label: '只看个位' },
        { value: '从大减到小', label: '从大减到小' },
        { value: '不用算', label: '不用计算直接猜' },
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
    tb.push(q(`遇到这道题：${scn[0]} 用哪种办法最好？`, tools.map((x) => ({ value: x, label: x })), scn[1], '想想哪招最清楚'))
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
      `找规律，问号里应该填几：${seq.join('、')}、？`,
      `小火车开来了：${seq.join(' → ')} → ？下一站是几？`,
      `每次${st > 0 ? '加' : '减'} ${Math.abs(st)}，下一个数是几？`,
      `接着往下写：${seq.join('、')}、？`,
    ]), numOpts(ans), ans, `每次${st > 0 ? '+' : ''}${st}`))

    const pools = [
      ['苹果', '香蕉', '橘子', '汽车'],
      ['猫', '狗', '鱼', '桌子'],
      ['红色', '蓝色', '绿色', '跑步'],
      ['三角形', '正方形', '圆形', '蛋糕'],
      ['春天', '夏天', '秋天', '热水'],
      ['铅笔', '橡皮', '尺子', '蛋糕'],
    ]
    const d = pools[i % pools.length]
    oo.push(q(pick([
      `哪一个和其他不一样？${d.join('、')}`,
      `找出不同类的那一个：${d.join('、')}`,
    ]), d.map((x) => ({ value: x, label: x })), d[3], '想它们属于哪一类'))

    const ab = pick([['红', '蓝'], ['圆', '方'], ['星', '月'], ['A', 'B']])
    if (lv === 1) {
      ds.push(q(`按规律排队：${ab[0]}、${ab[1]}、${ab[0]}、${ab[1]}、${ab[0]}、？ 下一个是什么？`, ab.map((x) => ({ value: x, label: x })), ab[1], '两个两个重复'))
    } else {
      const abc = pick([['红', '黄', '蓝'], ['圆', '方', '三角']])
      ds.push(q(`按规律排队：${abc[0]}、${abc[1]}、${abc[2]}、${abc[0]}、${abc[1]}、？ 下一个是什么？`, abc.map((x) => ({ value: x, label: x })), abc[2], '三个三个重复'))
    }

    const shapes = pick(['▲', '■', '●'])
    const len = lv === 1 ? 2 : 3
    const shownPat = len === 2
      ? `${shapes}、○、${shapes}、○、${shapes}、？`
      : `${shapes}、○、△、${shapes}、○、？`
    const ansSp = len === 2 ? '○' : '△'
    const spOpts = [...new Set([ansSp, shapes, len === 2 ? '△' : '○', '★', '■'])].slice(0, 4)
    sp.push(q(pick([
      `图形在排队：${shownPat} 问号处是什么？`,
      `看规律，下一个图形填什么？${shownPat}`,
    ]), shuffle(spOpts).map((x) => ({ value: x, label: x })), ansSp, '看看它怎么重复'))

    const x = randInt(2, lv === 1 ? 12 : 40), y = randInt(2, 12)
    const shown = x + y + pick([-1, 0, 1, lv >= 2 ? 10 : 0])
    jd.push(q(pick([
      `有人说 ${x} + ${y} = ${shown}，他说得对吗？`,
      `${x} + ${y} 等于 ${shown} 吗？请你当小老师判一判。`,
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
      ['两个一样的直角三角形能拼成什么图形？', '正方形', ['正方形', '圆形', '五边形', '长方形']],
      ['一副七巧板一共有几块？', '7块', ['5块', '6块', '7块', '8块']],
      ['七巧板里一共有几个三角形？', '5个', ['3个', '4个', '5个', '6个']],
      ['两个一样的正方形拼在一起，看起来像什么？', '长方形', ['正方形', '圆形', '三角形', '长方形']],
      ['缺口是梯形，应该补哪一块？', '梯形', ['梯形', '三角形', '正方形', '圆']],
      ['缺了一块直角三角形，应该选哪一块？', '直角三角形', ['直角三角形', '正方形', '圆', '五边形']],
      ['球和圆柱哪个更容易稳稳地立在桌面上？', '圆柱', ['圆柱', '球', '都一样', '圆锥']],
    ]
    const solids = [
      ['皮球最像下面哪一种立体图形？', '球', ['球', '正方体', '长方体', '圆柱']],
      ['魔方最像下面哪一种立体图形？', '正方体', ['正方体', '球', '圆柱', '圆锥']],
      ['牙膏盒最像下面哪一种立体图形？', '长方体', ['长方体', '球', '正方体', '圆柱']],
      ['易拉罐最像下面哪一种立体图形？', '圆柱', ['圆柱', '球', '正方体', '长方体']],
    ]
    for (let i = 0; i < N; i++) {
    if (i % 4 === 0) {
      const s = solids[i % solids.length]
      tg.push(q(s[0], s[2].map((x) => ({ value: x, label: x })), s[1], '摸摸想形状'))
    } else {
      const t = tgBank[i % tgBank.length]
      tg.push(q(t[0], t[2].map((x) => ({ value: x, label: x })), t[1], '拼一拼想一想'))
    }
    const ROTATE_SHAPE_MAP = {
      圆: { id: 'circle', name: '圆' },
      正方形: { id: 'square', name: '正方形' },
      小旗: { id: 'flag', name: '小旗', d: 'M10 10 L50 10 L50 30 L30 30 L30 50 L10 50 Z' },
      L形: { id: 'L', name: 'L形', d: 'M10 10 L30 10 L30 40 L50 40 L50 55 L10 55 Z' },
      箭头: { id: 'arrow', name: '箭头', d: 'M30 10 L50 30 L40 30 L40 55 L20 55 L20 30 L10 30 Z' },
      楼梯: { id: 'step', name: '楼梯', d: 'M10 30 L30 30 L30 10 L50 10 L50 55 L10 55 Z' },
    }
    const shapeName = ['圆', '正方形', '小旗', 'L形', '箭头', '楼梯'][i % 6]
    const deg = lv === 1 ? pick([90, 180]) : pick([90, 180, 270])
    const same = shapeName === '圆' || shapeName === '正方形'
    rt.push({
      ...q(pick([
        `把「${shapeName}」顺时针转 ${deg}°，看起来还是原来的样子吗？`,
        `转一转：把「${shapeName}」转 ${deg}°，形状变了吗？`,
      ]), [{ value: '是', label: '还是原来的样子' }, { value: '不是', label: '变了' }], same ? '是' : '不是', '圆和正方形转完还像自己'),
      rotate: { shape: ROTATE_SHAPE_MAP[shapeName], angle: deg, mode: 'same' },
    })
    const n = 2 + (i % 4)
    cs.push(q(pick([
      `大三角形里有 ${n} 个小三角形，一共有几个三角形？（要把大的也算上）`,
      `图里有 ${n} 个小三角形和 1 个大三角形，一共几个三角形？`,
    ]), numOpts(n + 1), n + 1, '小的加上大的'))
    const shapes = [['正方形', '4'], ['圆', '无数'], ['长方形', '2'], ['等边三角形', '3'], ['等腰三角形', '1']]
    const s = shapes[i % shapes.length]
    sy.push(q(pick([
      `${s[0]}有几条对称轴？`,
      `把${s[0]}对折，能对折成完全一样的折痕有几条？`,
    ]), ['1', '2', '3', '4', '无数'].map((x) => ({ value: x, label: x })), s[1], '对折后两边完全重合'))
    const l = 2 + (i % 3), w = 2 + ((i + 1) % 3)
    bc.push(q(pick([
      `积木摆成 ${l} 行，每行 ${w} 块，一共有几块？`,
      `每层有 ${w} 块积木，一共 ${l} 层，一共有几块？`,
    ]), numOpts(l * w), l * w, '一行一行加起来'))
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
    if (i % 2 === 0) {
      const nameA = pick(KIDS)
      const nameB = pick(KIDS.filter((k) => k !== nameA).concat(['小华']))
      ww.push(q(
        `${nameA}有 ${a} 个贴纸，${nameB}有 ${b} 个贴纸，谁更多？`,
        [nameA, nameB, '一样多'].map((x) => ({ value: x, label: x })),
        a > b ? nameA : nameB,
        '比一比',
      ))
    } else {
      ww.push(q(
        `哥哥今年 ${a} 岁，弟弟今年 ${b} 岁，谁更大？`,
        ['哥哥', '弟弟', '一样大'].map((x) => ({ value: x, label: x })),
        a > b ? '哥哥' : '弟弟',
        '比一比',
      ))
    }
    const nums = shuffle([randInt(lo, hi), randInt(lo, hi), randInt(lo, hi), randInt(lo, hi)])
    const sorted = [...nums].sort((x, y) => x - y)
    od.push(q(`把这些数从小到大排一排：${nums.join('、')}。其中最大的是几？`, sorted.map((x) => ({ value: String(x), label: String(x) })), String(sorted[3]), '找最大的'))
    const stmts = [
      [`${a} + 0 = ${a}`, '对'],
      [`${a} − ${a} = 1`, '错'],
      ['任何数加 0，还是它自己', '对'],
      ['0 减任何数都等于 0', '错'],
      [`${a} 比 ${a - 1} 大`, '对'],
    ]
    const st = stmts[i % stmts.length]
    tf.push(q(`这句话对不对：“${st[0]}”？`, [{ value: '对', label: '对' }, { value: '错', label: '错' }], st[1], '举个例子想一想'))
    const ans = randInt(Math.max(lo, 5), Math.min(hi, lv === 1 ? 20 : hi))
    ld.push(q(pick([
      `有一个数比 ${ans - 1} 大，又比 ${ans + 1} 小，这个数是几？`,
      `猜一猜：它夹在 ${ans - 1} 和 ${ans + 1} 中间，是几？`,
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
      `从家到公园有 ${a} 条路，从公园到学校又有 ${b} 条路，一共有几种走法？`,
      `先有 ${a} 种选法，再有 ${b} 种选法，一共有几种走法？`,
    ]), numOpts(a * b), a * b, '一条一条数清楚'))

    const kind = i % 4
    if (kind === 0) {
      const h = randInt(1, 11)
      lm.push({
        ...q('看钟面：现在是几点？',
          [`${h} 点`, `${h + 1} 点`, `${Math.max(1, h - 1)} 点`, `${h} 点半`].map((x) => ({ value: x, label: x })),
          `${h} 点`, '长针指着 12，看短针'),
        clock: { hour: h, minute: 0 },
      })
    } else if (kind === 1) {
      const h = randInt(1, 10)
      const addH = lv === 1 ? 1 : pick([1, 2])
      lm.push({
        ...q(`看钟面：再过 ${addH} 小时是几点？`,
          [`${h + addH} 点`, `${h} 点`, `${h + addH + 1} 点`, `${h} 点半`].map((x) => ({ value: x, label: x })),
          `${h + addH} 点`, `过 ${addH} 小时就加 ${addH}`),
        clock: { hour: h, minute: 0 },
      })
    } else if (kind === 2) {
      const yuan = lv === 1 ? randInt(1, 5) : randInt(2, 9)
      const jiao = randInt(0, 9)
      lm.push(q(pick([
        `买文具花了 ${yuan} 元 ${jiao} 角，一共是几角？`,
        `${yuan} 元 ${jiao} 角等于多少角？`,
      ]), numOpts(yuan * 10 + jiao), yuan * 10 + jiao, '1 元 = 10 角'))
    } else {
      const money = randInt(lv === 1 ? 5 : 10, lv === 1 ? 15 : 50)
      const cost = randInt(2, money - 1)
      lm.push(q(pick([
        `小明有 ${money} 元，买了 ${cost} 元的东西，还剩几元？`,
        `付给收银员 ${money} 元，东西要 ${cost} 元，应找回几元？`,
      ]), numOpts(money - cost), money - cost, '付钱减去价钱'))
    }
  }
  // 公平分/凑钱/拼搭用文字思维版（交互游戏另有；题库作补充）
  const fs = [], mc = [], fb = []
  for (let i = 0; i < N; i++) {
    const total = lv === 1 ? randInt(6, 12) : lv === 2 ? randInt(8, 20) : randInt(12, 40)
    const people = pick([2, 4, 5])
    const each = Math.floor(total / people)
    fs.push(q(pick([
      `有 ${total} 颗糖，分给 ${people} 个小朋友，每人分到一样多（剩下的先不分），每人几颗？`,
      `${total} 颗糖要分给 ${people} 人，尽量分得一样多，每人几颗？`,
    ]), numOpts(each), each, '试试看能不能均分'))
    const target = lv === 1 ? randInt(3, 10) : randInt(5, 20)
    const min = Math.ceil(target / 5)
    mc.push(q(
      `只用 1 元和 5 元的纸币凑出 ${target} 元，最少需要几张？`,
      wrongOpts(min, [min + 1, min + 2, target, Math.max(1, min - 1)]),
      min,
      '尽量先用 5 元',
    ))
    const edges = lv === 1 ? randInt(8, 16) : randInt(12, 24)
    const need = Math.ceil(edges / 4)
    fb.push(q(`每个正方形有 4 条边。要用正方形拼出至少 ${edges} 条边，最少需要几个正方形？`, numOpts(need), need, '用总数除以 4，再往上取整'))
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
    const methodPairs = [
      ['8+5 先凑成 10 再算，用了什么方法？', '凑十'],
      ['从结果往回推，这是什么方法？', '倒推'],
      ['画线段图理解“多几个”，是什么方法？', '画图'],
      ['把大数拆成整十和个位，属于？', '拆分'],
    ]
    const mp = methodPairs[i % methodPairs.length]
    mym.push(q(mp[0], methods.map((x) => ({ value: x, label: x })), mp[1], '选最贴切的'))
    const a = randInt(5, lv === 1 ? 12 : 40), b = randInt(2, 8)
    const correct = a + b, wrong = correct + pick([-1, 1, lv >= 2 ? 10 : 1])
    fm.push(q(pick([
      `有人算 ${a}+${b}=${wrong}，错了。正确答案是几？`,
      `${a}+${b} 不等于 ${wrong}。正确结果是？`,
    ]), numOpts(correct), correct, '再验算一遍'))
  }
  add('math-expression', 'my-method', lv, mym)
  add('math-expression', 'find-mistake', lv, fm)
}

// ========== 数据意识（分类整理）==========
for (const lv of [1, 2, 3]) {
  const cks = [], rc = [], cd = [], ss = []
  for (let i = 0; i < N; i++) {
    const items = ['苹果', '香蕉', '橘子']
    const fruitCounts = [randInt(3, lv === 1 ? 10 : 30), randInt(3, lv === 1 ? 10 : 30), randInt(2, lv === 1 ? 8 : 25)]
    let fruitMax = 0
    fruitCounts.forEach((v, j) => { if (v > fruitCounts[fruitMax]) fruitMax = j })
    fruitCounts.forEach((v, j) => { if (j !== fruitMax && v === fruitCounts[fruitMax]) fruitCounts[fruitMax] += 1 })
    fruitMax = fruitCounts.indexOf(Math.max(...fruitCounts))
    cks.push({
      ...q(pick([
        `篮子里有这些水果，哪种最多？`,
        `数一数：哪种水果最多？`,
      ]), items.map((t) => ({ value: t, label: t })), items[fruitMax], '先分类再比'),
      items: [
        ...Array(fruitCounts[0]).fill('🍎'),
        ...Array(fruitCounts[1]).fill('🍌'),
        ...Array(fruitCounts[2]).fill('🍊'),
      ].sort(() => Math.random() - 0.5),
    })

    const vals = [randInt(3, 12), randInt(3, 12), randInt(3, 12)]
    let maxI = 0
    vals.forEach((v, j) => { if (v > vals[maxI]) maxI = j })
    vals.forEach((v, j) => { if (j !== maxI && v === vals[maxI]) vals[maxI] += 1 })
    maxI = vals.indexOf(Math.max(...vals))
    const names = ['甲', '乙', '丙']
    const emojis = ['🍎', '🍌', '🍊']
    rc.push({
      ...q('看柱状图：谁的数量最多？', names.map((n) => ({ value: n, label: n })), names[maxI], '柱子最高的人最多'),
      chart: { names, values: vals, emoji: emojis[i % 3] },
    })

    let p = randInt(5, 25), r = randInt(5, 25)
    if (p === r) r++
    cd.push({
      ...q('哪一组更多？', ['第一组', '第二组'].map((t) => ({ value: t, label: t })), p > r ? '第一组' : '第二组', '对着比'),
      rows: { a: p, b: r, emoji: '⭐' },
    })

    ss.push({
      ...q(pick([
        '小调查：三种水果各有多少人喜欢，如图。一共有几人？',
        '三类票数如图，加起来一共几票？',
      ]), numOpts(fruitCounts[0] + fruitCounts[1] + fruitCounts[2]), fruitCounts[0] + fruitCounts[1] + fruitCounts[2], '全加起来'),
      survey: {
        cats: [
          { name: '苹果', emoji: '🍎' },
          { name: '香蕉', emoji: '🍌' },
          { name: '橘子', emoji: '🍊' },
        ],
        counts: fruitCounts,
      },
    })
  }
  add('data-thinking', 'count-sort', lv, cks)
  add('data-thinking', 'read-chart', lv, rc)
  add('data-thinking', 'compare-data', lv, cd)
  add('data-thinking', 'simple-survey', lv, ss)
}

mkdirSync('public', { recursive: true })
const BANK_VERSION = 6
const payload = { version: BANK_VERSION, bank }
writeFileSync('public/question-bank-local.json', JSON.stringify(payload), 'utf-8')
let total = 0
const byL = { 1: 0, 2: 0, 3: 0 }
for (const buckets of Object.values(bank)) {
  for (const [lvl, arr] of Object.entries(buckets)) {
    total += arr.length
    byL[lvl] = (byL[lvl] || 0) + arr.length
  }
}
console.log(`生成完毕：${Object.keys(bank).length} 游戏，${total} 题（低${byL[1]} 中${byL[2]} 高${byL[3]}） version=${BANK_VERSION}`)
console.log('文件: public/question-bank-local.json')
