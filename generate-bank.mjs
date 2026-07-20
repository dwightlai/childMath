// generate-bank.mjs — 纯本地生成中高级题库（每游戏每难度50题），不调API
// 运行: node generate-bank.mjs
// 输出: question-bank-local.json → 在设置页导入

import { writeFileSync } from 'fs'

const bank = {}
function add(mod, game, level, qs) {
  const key = `${mod}/${game}`
  if (!bank[key]) bank[key] = {}
  bank[key][level] = qs
}
function q(question, options, answer, hint) {
  return { question, options: options.map(o => typeof o === 'object' ? o : { value: String(o), label: String(o) }), answer: String(answer), hint: hint || '' }
}
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)) }
function wrongOpts(correct, pool, count = 3) {
  const s = new Set([String(correct)])
  const opts = shuffle(pool.filter(x => !s.has(String(x))))
  return shuffle([String(correct), ...opts.slice(0, count).map(String)])
}
function wrongOptsObj(correct, pool, count = 3) {
  const s = new Set([String(correct)])
  const opts = shuffle(pool.filter(x => !s.has(String(x.value || x))))
  return shuffle([{ value: String(correct), label: String(correct) }, ...opts.slice(0, count).map(x => typeof x === 'object' ? x : { value: String(x), label: String(x) })])
}

const N = 25 // 每游戏每难度题数（25×2难度=50题/游戏）

// ========== number-sense ==========
// make-ten
let mt2 = [], mt3 = []
for (let i = 0; i < N; i++) { const a = randInt(1, 9); const ans = 10 - a; mt2.push(q(`${a} 和谁合起来是 10？`, wrongOpts(ans, [0,1,2,3,4,5,6,7,8,9]), ans, `10 - ${a} = ?`)) }
for (let i = 0; i < N; i++) { const t = pick([15,20,25,30,40,50]); const a = randInt(Math.max(1,t-15), t-1); const ans = t - a; mt3.push(q(`${a} 和谁合起来是 ${t}？`, wrongOpts(ans, Array.from({length:10},(_,j)=>Math.max(1,ans-5+j))), ans, `${t} - ${a} = ?`)) }
add('number-sense', 'make-ten', 2, mt2); add('number-sense', 'make-ten', 3, mt3)

// split-number
let sn2 = [], sn3 = []
for (let i = 0; i < N; i++) { const t = randInt(5, 15); const a = randInt(1, t-1); const ans = t-a; sn2.push(q(`${t} 可以分成 ${a} 和几？`, wrongOpts(ans, Array.from({length:10},(_,j)=>Math.max(0,ans-4+j))), ans, `${t}-${a}=?`)) }
for (let i = 0; i < N; i++) { const t = randInt(15, 50); const a = randInt(3, t-3); const ans = t-a; sn3.push(q(`${t} 可以分成 ${a} 和几？`, wrongOpts(ans, Array.from({length:10},(_,j)=>Math.max(1,ans-5+j))), ans, `${t}-${a}=?`)) }
add('number-sense', 'split-number', 2, sn2); add('number-sense', 'split-number', 3, sn3)

// quick-count
let qc2 = [], qc3 = []
for (let i = 0; i < N; i++) { const n = randInt(6, 20); qc2.push(q(`数一数，一共 ${n} 个物品，选总数`, wrongOpts(n, [n-3,n-2,n-1,n+1,n+2,n+3]), n, '仔细数')) }
for (let i = 0; i < N; i++) { const rows = randInt(2,5); const cols = randInt(3,6); const extra = randInt(0,4); const n = rows*cols+extra; qc3.push(q(`${rows}行每行${cols}个，还多${extra}个，一共几个？`, wrongOpts(n, [n-2,n-1,n+1,n+2,rows*cols]), n, `${rows}×${cols}+${extra}`)) }
add('number-sense', 'quick-count', 2, qc2); add('number-sense', 'quick-count', 3, qc3)

// find-friend
let ff2 = [], ff3 = []
for (let i = 0; i < N; i++) { const t = randInt(6, 18); const a = randInt(1, t-1); const b = t-a; const w1 = randInt(1,t-1); const w2 = randInt(1,t-1); ff2.push(q(`哪两个数合起来是 ${t}？`, [{value:`${a}和${b}`,label:`${a} 和 ${b}`},{value:`${w1}和${t-w1+1}`,label:`${w1} 和 ${t-w1+1}`},{value:`${w2}和${t-w2-1>0?t-w2-1:1}`,label:`${w2} 和 ${t-w2-1>0?t-w2-1:1}`},{value:`${a+1}和${b>1?b-1:b+1}`,label:`${a+1} 和 ${b>1?b-1:b+1}`}], `${a}和${b}`, `${a}+${b}=${t}`)) }
for (let i = 0; i < N; i++) { const t = randInt(12, 30); const a = randInt(2, t-2); const b = t-a; ff3.push(q(`哪两个数合起来是 ${t}？`, [{value:`${a}和${b}`,label:`${a} 和 ${b}`},{value:`${a+2}和${b-1}`,label:`${a+2} 和 ${b-1}`},{value:`${a-1>0?a-1:1}和${b+2}`,label:`${a-1>0?a-1:1} 和 ${b+2}`},{value:`${a+3}和${b-2>0?b-2:1}`,label:`${a+3} 和 ${b-2>0?b-2:1}`}], `${a}和${b}`, `${a}+${b}=${t}`)) }
add('number-sense', 'find-friend', 2, ff2); add('number-sense', 'find-friend', 3, ff3)

// compare
let cp2 = [], cp3 = []
for (let i = 0; i < N; i++) { const a = randInt(1, 20); const b = randInt(1, 20); const ans = a>b?'>':a<b?'<':'='; cp2.push(q(`${a} ○ ${b}，填什么？`, ['>','<','='], ans, '比大小')) }
for (let i = 0; i < N; i++) { const a=randInt(2,12); const b=randInt(2,12); const c=randInt(2,12); const d=randInt(2,12); const l=a+b; const r=c+d; const ans=l>r?'>':l<r?'<':'='; cp3.push(q(`${a}+${b} ○ ${c}+${d}，填什么？`, ['>','<','='], ans, `${l} vs ${r}`)) }
add('number-sense', 'compare', 2, cp2); add('number-sense', 'compare', 3, cp3)

// estimate
let es2 = [], es3 = []
for (let i = 0; i < N; i++) { const n = randInt(7, 25); const approx = Math.round(n/5)*5; es2.push(q(`大约有多少个？实际${n}个，选最接近的`, wrongOpts(approx||5, [Math.max(5,approx-5),approx||5,(approx||5)+5,(approx||5)+10,n]), approx||5, '看大概')) }
for (let i = 0; i < N; i++) { const n = randInt(15, 60); const approx = Math.round(n/10)*10; es3.push(q(`实际${n}，选最接近的整十数`, wrongOpts(approx, [Math.max(10,approx-10),approx,approx+10,approx+20,n]), approx, '四舍五入')) }
add('number-sense', 'estimate', 2, es2); add('number-sense', 'estimate', 3, es3)

// ========== quantity-relation ==========
// story-theater
let st2 = [], st3 = []
for (let i = 0; i < N; i++) { const a=randInt(3,12); const b=randInt(2,8); const s=a+b; const names=pick(['小明','小红','小华','小刚','小丽']); const items=pick(['颗糖','本书','支笔','个苹果','块饼干']); st2.push(q(`${names}有${a}${items}，又得到${b}${items}，现在几${items.slice(1)}？`, [{value:`${a}+${b}=${s}`,label:`${a}+${b}=${s}`},{value:`${a}-${b}=${a-b}`,label:`${a}-${b}=${a-b}`},{value:`${a}×${b}=${a*b}`,label:`${a}×${b}=${a*b}`},{value:`${s}+${b}=${s+b}`,label:`${s}+${b}=${s+b}`}], `${a}+${b}=${s}`, '合起来用加法')) }
for (let i = 0; i < N; i++) { const b=randInt(3,8); const c=randInt(2,6); const r=randInt(1,10); const a=b+c+r; const names=pick(['商店','学校','公园','班级']); st3.push(q(`${names}有${a}个，先卖出${b}个，又卖出${c}个，剩几个？`, [{value:`${a}-${b}-${c}=${r}`,label:`${a}-${b}-${c}=${r}`},{value:`${a}+${b}+${c}=${a+b+c}`,label:`${a}+${b}+${c}=${a+b+c}`},{value:`${a}-${b}+${c}=${a-b+c}`,label:`${a}-${b}+${c}=${a-b+c}`},{value:`${b}+${c}=${b+c}`,label:`${b}+${c}=${b+c}`}], `${a}-${b}-${c}=${r}`, '连续减')) }
add('quantity-relation', 'story-theater', 2, st2); add('quantity-relation', 'story-theater', 3, st3)

// arrange
let ar2 = [], ar3 = []
for (let i = 0; i < N; i++) { const a=randInt(4,12); const d=randInt(1,a-2); const b=a-d; ar2.push(q(`上排${a}个，下排比上排少${d}个，下排几个？`, wrongOpts(b, [b-1,b+1,b+2,a,b-2>0?b-2:b+3]), b, `${a}-${d}`)) }
for (let i = 0; i < N; i++) { const a=randInt(5,15); const d=randInt(2,6); const b=a+d; ar3.push(q(`上排${a}个，下排比上排多${d}个，一共几个？`, wrongOpts(a+b, [a+b-2,a+b+1,a*2,b*2,a+b-1]), a+b, `下排${b}，共${a}+${b}`)) }
add('quantity-relation', 'arrange', 2, ar2); add('quantity-relation', 'arrange', 3, ar3)

// more-less
let ml2 = [], ml3 = []
for (let i = 0; i < N; i++) { const a=randInt(3,12); const b=randInt(3,12); const diff=Math.abs(a-b); const ans=a>b?`多${diff}个`:a<b?`少${diff}个`:'一样多'; ml2.push(q(`A排${a}个，B排${b}个，A比B？`, [`多${diff}个`,`少${diff}个`,'一样多',`多${diff+1}个`].map(x=>({value:x,label:x})), ans, '比一比')) }
for (let i = 0; i < N; i++) { const a=randInt(8,25); const b=randInt(8,25); const diff=Math.abs(a-b); const ans=a>b?`A多${diff}`:a<b?`B多${diff}`:'一样多'; ml3.push(q(`A组${a}人，B组${b}人，差几人？`, [`A多${diff}`,`B多${diff}`,'一样多',`差${diff+1}`].map(x=>({value:x,label:x})), ans, '大减小')) }
add('quantity-relation', 'more-less', 2, ml2); add('quantity-relation', 'more-less', 3, ml3)

// detective
let dt2 = [], dt3 = []
for (let i = 0; i < N; i++) { const a=randInt(3,10); const b=randInt(2,8); const s=a+b; dt2.push(q(`有${a}个红球和${b}个蓝球，问一共几个？有用条件是？`, [`${a}和${b}`,`红球`,`蓝球`,`一共`].map(x=>({value:x,label:x})), `${a}和${b}`, '两个数都要')) }
for (let i = 0; i < N; i++) { const a=randInt(10,30); const b=randInt(3,9); const c=randInt(2,7); dt3.push(q(`有${a}元，买书${b}元买笔${c}元，剩几元？需要哪些条件？`, [`${a}、${b}、${c}`,`${a}和${b}`,`${b}和${c}`,`${a}`].map(x=>({value:x,label:x})), `${a}、${b}、${c}`, '三个数都需要')) }
add('quantity-relation', 'detective', 2, dt2); add('quantity-relation', 'detective', 3, dt3)

// multi-solve
let ms2 = [], ms3 = []
for (let i = 0; i < N; i++) { const a=randInt(2,9); const b=randInt(2,9); const s=a+b; ms2.push(q(`${a}+${b}=${s}，哪些也对？`, [{value:`${b}+${a}=${s}`,label:`${b}+${a}=${s}`},{value:`${s}-${a}=${b}`,label:`${s}-${a}=${b}`},{value:`${a}×${b}=${a*b}`,label:`${a}×${b}=${a*b}`},{value:`${s}+1=${s+1}`,label:`${s}+1=${s+1}`}], `${b}+${a}=${s}`, '交换律')) }
for (let i = 0; i < N; i++) { const a=randInt(8,20); const b=randInt(2,a-1); const d=a-b; ms3.push(q(`${a}-${b}=${d}，哪些也对？`, [{value:`${d}+${b}=${a}`,label:`${d}+${b}=${a}`},{value:`${a}-${d}=${b}`,label:`${a}-${d}=${b}`},{value:`${a}+${b}=${a+b}`,label:`${a}+${b}=${a+b}`},{value:`${d}-${b}=${d-b}`,label:`${d}-${b}=${d-b}`}], `${d}+${b}=${a}`, '逆运算')) }
add('quantity-relation', 'multi-solve', 2, ms2); add('quantity-relation', 'multi-solve', 3, ms3)

// ========== calc-strategy ==========
let sc2 = [], sc3 = []
for (let i = 0; i < N; i++) { const a=randInt(5,9); const sp=10-a; const b=randInt(sp+1, 9); sc2.push(q(`${a}+${b} 凑十：${b}分成${sp}和几？`, wrongOpts(b-sp, [b-sp+1,b-sp+2,b,sp]), b-sp, `${a}+${sp}=10再加${b-sp}`)) }
for (let i = 0; i < N; i++) { const a=randInt(15,40); const b=randInt(5,15); const rnd=Math.ceil(b/10)*10; const diff=rnd-b; sc3.push(q(`${a}+${b} 凑整：把${b}看成${rnd}再减${diff}，结果是？`, wrongOpts(a+rnd-diff, [a+rnd,a+b+1,a+rnd+diff,a+b-1]), a+rnd-diff, `${a}+${rnd}-${diff}`)) }
add('calc-strategy', 'split-calc', 2, sc2); add('calc-strategy', 'split-calc', 3, sc3)

let mr2 = [], mr3 = []
for (let i = 0; i < N; i++) { const a=randInt(6,9); const sp=10-a; const b=randInt(sp+1, 9); mr2.push(q(`${a}+${b}：把${b}分成${sp}和${b-sp}，先算${a}+${sp}=10，再加${b-sp}得？`, wrongOpts(10+b-sp, [10+b-sp+1,10+b-sp-1,a+b+1,10]), 10+b-sp, `10+${b-sp}`)) }
for (let i = 0; i < N; i++) { const a=randInt(18,35); const rnd=Math.ceil(a/10)*10; const d=rnd-a; const b=randInt(d+1, 12); mr3.push(q(`${a}+${b}：先加${d}凑${rnd}，${b}-${d}=${b-d}，${rnd}+${b-d}=？`, wrongOpts(rnd+b-d, [rnd+b-d+1,rnd+b-d-1,a+b+1,rnd+b]), rnd+b-d, `${rnd}+${b-d}`)) }
add('calc-strategy', 'make-round', 2, mr2); add('calc-strategy', 'make-round', 3, mr3)

let mm2 = [], mm3 = []
for (let i = 0; i < N; i++) { const a=randInt(3,9); const b=randInt(3,9); const s=a+b; mm2.push(q(`${a}+${b}=${s}，另一种算法？`, [{value:`${a+1}+${b-1}`,label:`${a+1}+${b-1}`},{value:`${a}×${b}`,label:`${a}×${b}`},{value:`${s+1}`,label:`${s+1}`},{value:`${a-1>0?a-1:1}-${b}`,label:`${a-1>0?a-1:1}-${b}`}], `${a+1}+${b-1}`, '和不变')) }
for (let i = 0; i < N; i++) { const a=randInt(12,30); const b=randInt(2,Math.max(2,a-3)); const d=a-b; mm3.push(q(`${a}-${b}=${d}，另一种算法？`, [{value:`${a}-${b+2}+2`,label:`${a}-${b+2}+2`},{value:`${a}+${b}`,label:`${a}+${b}`},{value:`${d+1}+${b-1}`,label:`${d+1}+${b-1}`},{value:`${a+2}-${b+2}`,label:`${a+2}-${b+2}`}], `${a}-${b+2}+2`, '多减要加回')) }
add('calc-strategy', 'multi-method', 2, mm2); add('calc-strategy', 'multi-method', 3, mm3)

let tb2 = [], tb3 = []
const tools = ['画图','拆分','列表','倒推']
for (let i = 0; i < N; i++) { const a=randInt(3,8); const b=randInt(3,8); const sc=pick(['画图','拆分']); tb2.push(q(`${a}+${b}怎么算最方便？选策略`, tools.map(x=>({value:x,label:x})), sc, '选合适的')) }
for (let i = 0; i < N; i++) { const scenarios = [`一个数加${randInt(3,8)}等于${randInt(10,20)}，求这个数`,`鸡兔共${randInt(6,12)}只脚${randInt(16,30)}只`,`从${randInt(20,50)}连续减${randInt(3,6)}减到0要几次`]; const ans = pick(['倒推','列表','拆分']); tb3.push(q(`${scenarios[i%scenarios.length]}，选策略`, tools.map(x=>({value:x,label:x})), ans, '想想')) }
add('calc-strategy', 'tool-box', 2, tb2); add('calc-strategy', 'tool-box', 3, tb3)

// ========== pattern ==========
let sq2 = [], sq3 = []
for (let i = 0; i < N; i++) { const start=randInt(1,6); const step=randInt(2,5); const seq=Array.from({length:4},(_,j)=>start+step*j); const ans=seq[3]+step; sq2.push(q(`${seq.join(', ')}, ?`, wrongOpts(ans, [ans-1,ans+1,ans+step,ans-step>0?ans-step:ans+2]), ans, `+${step}`)) }
for (let i = 0; i < N; i++) { const start=randInt(2,10); const step=pick([3,4,5,6]); const seq=Array.from({length:4},(_,j)=>start+step*j); const ans=seq[3]+step; sq3.push(q(`${seq.join(', ')}, ?`, wrongOpts(ans, [ans-1,ans+1,ans+step,ans-step>0?ans-step:ans+2]), ans, `每次+${step}`)) }
add('pattern', 'sequence', 2, sq2); add('pattern', 'sequence', 3, sq3)

let oo2 = [], oo3 = []
const ooPool2 = [['苹果','香蕉','橘子','汽车','水果'],['猫','狗','鱼','桌子','动物'],['红','蓝','绿','跑','颜色'],['1','3','5','8','奇数'],['三角','正方','圆','苹果','图形'],['春','夏','秋','热','季节'],['加','减','乘','跑','运算'],['2','4','6','9','偶数']]
const ooPool3 = [['2','4','6','9','10','偶数'],['厘米','米','千克','千米','长度'],['12','24','36','45','48','12倍数'],['质数:2,3,5,9','9不是质数'],['3,6,9,12,14','14不是3倍数'],['Mon,Tue,Wed,Sun,Fri','Sun不是工作日']]
for (let i = 0; i < N; i++) { const d=ooPool2[i%ooPool2.length]; const items=d.slice(0,4); const ans=d[3]==='汽车'||d[3]==='桌子'||d[3]==='跑'||d[3]==='8'||d[3]==='苹果'||d[3]==='热'?d[3]:items[3]; oo2.push(q(`哪个不同类？${items.join('、')}`, items.map(x=>({value:x,label:x})), ans, d[4])) }
for (let i = 0; i < N; i++) { const d=ooPool3[i%ooPool3.length]; const items=d.slice(0,4); oo3.push(q(`哪个不同类？${items.join('、')}`, items.map(x=>({value:x,label:x})), items[3], d[5]||d[4])) }
add('pattern', 'odd-one-out', 2, oo2); add('pattern', 'odd-one-out', 3, oo3)

let ds2 = [], ds3 = []
for (let i = 0; i < N; i++) { const shapes=pick([['🔴','🔵'],['⭐','🌙'],['🟢',''],['▲','■']]); const pat=[shapes[0],shapes[1],shapes[0],shapes[1],shapes[0]]; ds2.push(q(`${pat.join('')} 下一个？`, shapes.map(x=>({value:x,label:x})), shapes[1], 'AB规律')) }
for (let i = 0; i < N; i++) { const shapes=pick([['⭐','🌙','️'],['🔴','🟢',''],['A','B','C']]); const pat=[shapes[0],shapes[1],shapes[2],shapes[0],shapes[1]]; ds3.push(q(`${pat.join('')} 下一个？`, shapes.map(x=>({value:x,label:x})), shapes[2], 'ABC循环')) }
add('pattern', 'designer', 2, ds2); add('pattern', 'designer', 3, ds3)

let sp2 = [], sp3 = []
for (let i = 0; i < N; i++) { const n=randInt(2,6); sp2.push(q(`${n}个正方形各有4条边，共几条边？`, wrongOpts(n*4, [n*4-1,n*4+1,n*3,n+4]), n*4, `${n}×4`)) }
for (let i = 0; i < N; i++) { const n=randInt(2,5); const ans=n*2+1; sp3.push(q(`${n}个三角形排一排共用边，外围几条边？`, wrongOpts(ans, [n*3,ans-1,ans+1,n*2]), ans, '首尾+中间×2')) }
add('pattern', 'shape-pattern', 2, sp2); add('pattern', 'shape-pattern', 3, sp3)

let jd2 = [], jd3 = []
for (let i = 0; i < N; i++) { const a=randInt(2,12); const b=randInt(2,12); const c=a+b; const shown=c+pick([-1,0,1]); const ans=shown===c?'对':'错'; jd2.push(q(`${a}+${b}=${shown} 对吗？`, [{value:'对',label:'✅ 对'},{value:'错',label:'❌ 错'}], ans, `${a}+${b}=${c}`)) }
for (let i = 0; i < N; i++) { const a=randInt(10,30); const b=randInt(3,a-1); const c=a-b; const shown=c+pick([-2,-1,0,1,2]); const ans=shown===c?'对':'错'; jd3.push(q(`${a}-${b}=${shown} 对吗？`, [{value:'对',label:'✅ 对'},{value:'错',label:'❌ 错'}], ans, `${a}-${b}=${c}`)) }
add('pattern', 'judge', 2, jd2); add('pattern', 'judge', 3, jd3)

// ========== spatial ==========
let tg2 = [], tg3 = []
for (let i = 0; i < N; i++) { const n=randInt(2,5); tg2.push(q(`${n}个三角形能拼几个正方形？（2个三角形=1正方形）`, wrongOpts(Math.floor(n/2), [Math.floor(n/2)+1,n,n-1,Math.floor(n/2)-1>=0?Math.floor(n/2)-1:1]), Math.floor(n/2), `${n}÷2`)) }
for (let i = 0; i < N; i++) { tg3.push(q(`七巧板有几块？其中三角形几块？`, ['7块,5个三角形','7块,4个三角形','6块,4个三角形','8块,5个三角形'].map(x=>({value:x,label:x})), '7块,5个三角形', '5三角+1正方+1平行四边形')) }
add('spatial', 'tangram', 2, tg2); add('spatial', 'tangram', 3, tg3)

let rt2 = [], rt3 = []
for (let i = 0; i < N; i++) { const shape=pick(['正方形','圆','等边三角形']); const deg=pick([90,180,270,360]); const ans=shape==='正方形'?'正方形':shape==='圆'?'圆':deg===360?'等边三角形':'变了'; rt2.push(q(`${shape}旋转${deg}°后还是${shape}吗？`, [{value:'是',label:'是'},{value:'不是',label:'不是'}], shape==='圆'||shape==='正方形'||deg===360?'是':'不是', '想想对称性')) }
for (let i = 0; i < N; i++) { const dirs=['上','右','下','左']; const start=randInt(0,3); const turns=randInt(1,3); const ans=dirs[(start+turns)%4]; rt3.push(q(`箭头朝${dirs[start]}，顺时针转${turns*90}°后朝哪？`, dirs.map(x=>({value:x,label:x})), ans, `转${turns}格`)) }
add('spatial', 'rotate', 2, rt2); add('spatial', 'rotate', 3, rt3)

let cs2 = [], cs3 = []
for (let i = 0; i < N; i++) { const n=randInt(2,5); cs2.push(q(`大三角形分成${n}个小三角形，一共几个三角形？`, wrongOpts(n+1, [n,n+2,n*2,n-1>0?n-1:1]), n+1, '小+大')) }
for (let i = 0; i < N; i++) { const n=randInt(2,4); const total=n*n+(n>=2?(n-1)*(n-1):0); cs3.push(q(`${n}×${n}方格中有几个正方形（含大的）？`, wrongOpts(total, [n*n,total+1,total-1,(n+1)*(n+1)]), total, '1×1+2×2+...')) }
add('spatial', 'count-shapes', 2, cs2); add('spatial', 'count-shapes', 3, cs3)

let sy2 = [], sy3 = []
for (let i = 0; i < N; i++) { const shapes=[['正方形',4],['长方形',2],['等边三角形',3],['圆','无数'],['等腰三角形',1]]; const s=pick(shapes); sy2.push(q(`${s[0]}有几条对称轴？`, ['1','2','3','4','无数'].map(x=>({value:x,label:x})), String(s[1]), '折一折')) }
for (let i = 0; i < N; i++) { const shapes=[['正五边形',5],['正六边形',6],['正八边形',8],['等腰梯形',1]]; const s=pick(shapes); sy3.push(q(`${s[0]}有几条对称轴？`, ['1','2','4','5','6','8'].map(x=>({value:x,label:x})), String(s[1]), '正n边形有n条')) }
add('spatial', 'symmetry', 2, sy2); add('spatial', 'symmetry', 3, sy3)

let bc2 = [], bc3 = []
for (let i = 0; i < N; i++) { const l=randInt(2,4); const w=randInt(2,4); const h=randInt(2,3); bc2.push(q(`${l}×${w}×${h}的长方体几个小方块？`, wrongOpts(l*w*h, [l*w*h-1,l*w*h+1,l*w+l*h+w*h,l+w+h]), l*w*h, `${l}×${w}×${h}`)) }
for (let i = 0; i < N; i++) { const vis=randInt(5,15); const hid=randInt(2,6); bc3.push(q(`看得见${vis}个方块，被挡住${hid}个，一共几个？`, wrongOpts(vis+hid, [vis+hid-1,vis+hid+1,vis*2,vis-hid]), vis+hid, '看得见的+挡住的')) }
add('spatial', 'block-count', 2, bc2); add('spatial', 'block-count', 3, bc3)

// ========== logic ==========
let ww2 = [], ww3 = []
for (let i = 0; i < N; i++) { const a=randInt(3,8); const b=randInt(3,8); const bigger=a>b?'A':'B'; ww2.push(q(`A=${a}岁，B=${b}岁，谁大？`, ['A','B','一样大'].map(x=>({value:x,label:x})), a===b?'一样大':bigger, '比大小')) }
for (let i = 0; i < N; i++) { const vals=shuffle([randInt(1,5),randInt(6,10),randInt(11,15),randInt(16,20)]); const names=['甲','乙','丙','丁']; const sorted=[...vals].sort((a,b)=>b-a); const second=names[vals.indexOf(sorted[1])]; ww3.push(q(`${names.map((n,j)=>`${n}=${vals[j]}分`).join('，')}，谁第二高？`, names.map(x=>({value:x,label:x})), second, '排第二的')) }
add('logic', 'who-is-who', 2, ww2); add('logic', 'who-is-who', 3, ww3)

let od2 = [], od3 = []
for (let i = 0; i < N; i++) { const nums=shuffle(Array.from({length:4},()=>randInt(1,20))); const sorted=[...nums].sort((a,b)=>a-b); od2.push(q(`从小到大排：${nums.join(', ')}，排第三的是？`, sorted.map(x=>({value:String(x),label:String(x)})), sorted[2], '找第三小')) }
for (let i = 0; i < N; i++) { const nums=shuffle(Array.from({length:5},()=>randInt(5,50))); const sorted=[...nums].sort((a,b)=>b-a); od3.push(q(`从大到小排：${nums.join(', ')}，排第二的是？`, sorted.slice(0,4).map(x=>({value:String(x),label:String(x)})), sorted[1], '第二大')) }
add('logic', 'ordering', 2, od2); add('logic', 'ordering', 3, od3)

let tf2 = [], tf3 = []
for (let i = 0; i < N; i++) { const a=randInt(2,10); const stmts=[[`任何数加0等于它自己`,'对'],[`任何数减0等于0`,'错'],[`1乘任何数等于那个数`,'对'],[`0除以任何数等于0`,'对']]; const s=stmts[i%stmts.length]; tf2.push(q(`"${s[0]}"对吗？`, [{value:'对',label:'✅ 对'},{value:'错',label:'❌ 错'}], s[1], '想想')) }
for (let i = 0; i < N; i++) { const stmts=[[`两个奇数相加是偶数`,'对'],[`两个偶数相乘是奇数`,'错'],[`奇数乘偶数是偶数`,'对'],[`质数都是奇数`,'错']]; const s=stmts[i%stmts.length]; tf3.push(q(`"${s[0]}"对吗？`, [{value:'对',label:'✅ 对'},{value:'错',label:'❌ 错'}], s[1], '举例子验证')) }
add('logic', 'true-false', 2, tf2); add('logic', 'true-false', 3, tf3)

let ld2 = [], ld3 = []
for (let i = 0; i < N; i++) { const ans=randInt(3,9); const clues=[`比${ans-1}大`,`比${ans+1}小`,`是${ans%2===0?'偶':'奇'}数`]; ld2.push(q(`线索：${clues.join('，')}。这个数是？`, wrongOpts(ans, [ans-1,ans+1,ans+2,ans-2>0?ans-2:ans+3]), ans, '逐条筛')) }
for (let i = 0; i < N; i++) { const ans=randInt(10,30); const clues=[`十位是${Math.floor(ans/10)}`,`个位是${ans%10}`,`比${ans-3}大比${ans+3}小`]; ld3.push(q(`线索：${clues.join('，')}。这个数是？`, wrongOpts(ans, [ans-1,ans+1,ans+10,ans-10>0?ans-10:ans+5]), ans, '综合线索')) }
add('logic', 'little-detective', 2, ld2); add('logic', 'little-detective', 3, ld3)

// ========== problem-solving ==========
let rt2c = [], rt3c = []
for (let i = 0; i < N; i++) { const a=randInt(2,4); const b=randInt(2,4); rt2c.push(q(`A到B有${a}条路，B到C有${b}条路，共几种走法？`, wrongOpts(a*b, [a+b,a*b+1,a*b-1,a*2]), a*b, `${a}×${b}`)) }
for (let i = 0; i < N; i++) { const a=randInt(2,4); const b=randInt(2,3); const c=randInt(2,3); rt3c.push(q(`A→B${a}条，B→C${b}条，C→D${c}条，共几种？`, wrongOpts(a*b*c, [a+b+c,a*b+c,a*b*c+1,a*b*c-1]), a*b*c, `${a}×${b}×${c}`)) }
add('problem-solving', 'route', 2, rt2c); add('problem-solving', 'route', 3, rt3c)

let lm2 = [], lm3 = []
for (let i = 0; i < N; i++) { const price=randInt(2,8); const qty=randInt(2,6); const total=price*qty; lm2.push(q(`每支笔${price}元，买${qty}支，一共几元？`, wrongOpts(total, [price+qty,total+1,total-1,price*qty+price]), total, `${price}×${qty}`)) }
for (let i = 0; i < N; i++) { const b=randInt(2,5); const c=randInt(2,4); const r_extra=randInt(1,10); const a=b*c+r_extra; lm3.push(q(`有${a}元，买${c}本每本${b}元的书，剩几元？`, wrongOpts(r_extra, [r_extra+1,r_extra+2,a-b,b*c]), r_extra, `${a}-${b}×${c}=${r_extra}`)) }
add('problem-solving', 'life-math', 2, lm2); add('problem-solving', 'life-math', 3, lm3)

// ========== math-expression ==========
let mym2 = [], mym3 = []
const methods5 = ['画图','数一数','拆分','凑十','倒推']
for (let i = 0; i < N; i++) { const a=randInt(5,9); const b=randInt(3,8); const m=pick(['拆分','凑十']); mym2.push(q(`${a}+${b}=${a+b}，把${b}分成${10-a}和${b-(10-a)}先凑10，用了什么方法？`, methods5.map(x=>({value:x,label:x})), m, '选方法')) }
for (let i = 0; i < N; i++) { const scenarios=[`画线段图来理解题意`,`从结果往回推验证`,`把大数拆成整十加个位`,`列表格比较数据`,`先猜再验证`]; const ans=['画图','倒推','拆分','列表','猜一猜'][i%5]; mym3.push(q(scenarios[i%scenarios.length]+`，这是什么方法？`, [...methods5,'列表','猜一猜'].slice(0,5).map(x=>({value:x,label:x})), ans, '选最贴切的')) }
add('math-expression', 'my-method', 2, mym2); add('math-expression', 'my-method', 3, mym3)

let fm2 = [], fm3 = []
for (let i = 0; i < N; i++) { const a=randInt(5,9); const b=randInt(3,8); const correct=a+b; const wrong=correct+pick([-1,1]); fm2.push(q(`${a}+${b}=${wrong} 对吗？如果错，正确答案是？`, wrongOpts(correct, [wrong,correct+1,correct-1,a*b>20?a:b]), correct, `验算：${a}+${b}=${correct}`)) }
for (let i = 0; i < N; i++) { const a=randInt(15,40); const b=randInt(5,12); const correct=a-b; const wrong=correct+pick([-2,-1,1,2]); fm3.push(q(`${a}-${b}=${wrong} 对吗？正确答案是？`, wrongOpts(correct, [wrong,correct+1,correct-1,wrong+1]), correct, `验算：${a}-${b}=${correct}`)) }
add('math-expression', 'find-mistake', 2, fm2); add('math-expression', 'find-mistake', 3, fm3)

// ========== data-thinking ==========
let cks2 = [], cks3 = []
for (let i = 0; i < N; i++) { const a=randInt(3,8); const b=randInt(3,8); const c=randInt(2,7); const items=['🍎','🍌','🍊']; const maxI=[a,b,c].indexOf(Math.max(a,b,c)); cks2.push(q(`${items[0]}${a}个 ${items[1]}${b}个 ${items[2]}${c}个，哪种最多？`, items.map(x=>({value:x,label:x})), items[maxI], '比大小')) }
for (let i = 0; i < N; i++) { const c=randInt(3,8); const d=randInt(2,6); const diff=randInt(1,5); const ab=c+d+diff; const a=randInt(Math.max(2,Math.floor(ab/2)-2), Math.min(10,ab-2)); const b=ab-a; cks3.push(q(`A${a} B${b} C${c} D${d}，AB合计比CD合计多几？`, wrongOpts(diff, [diff+1,diff+2,ab,c+d]), diff, `(${a}+${b})-(${c}+${d})`)) }
add('data-thinking', 'count-sort', 2, cks2); add('data-thinking', 'count-sort', 3, cks3)

let rc2 = [], rc3 = []
for (let i = 0; i < N; i++) { const vals=[randInt(3,10),randInt(3,10),randInt(3,10)]; const names=['甲','乙','丙']; const maxI=vals.indexOf(Math.max(...vals)); rc2.push(q(`柱状图：${names.map((n,j)=>`${n}=${vals[j]}`).join('，')}，谁最多？`, names.map(x=>({value:x,label:x})), names[maxI], '最高柱')) }
for (let i = 0; i < N; i++) { const vals=[randInt(4,12),randInt(4,12),randInt(4,12),randInt(4,12)]; const sum=vals.reduce((a,b)=>a+b,0); rc3.push(q(`柱状图4组：${vals.join(',')}，总和是？`, wrongOpts(sum, [sum-2,sum+1,sum-vals[0],sum+vals[0]]), sum, '全加')) }
add('data-thinking', 'read-chart', 2, rc2); add('data-thinking', 'read-chart', 3, rc3)

let cd2 = [], cd3 = []
for (let i = 0; i < N; i++) { const a=randInt(3,12); const b=randInt(3,12); cd2.push(q(`A组${a}人，B组${b}人，哪组多？`, ['A组','B组','一样多'].map(x=>({value:x,label:x})), a>b?'A组':a<b?'B组':'一样多', '比大小')) }
for (let i = 0; i < N; i++) { const a=randInt(8,25); const b=randInt(8,25); cd3.push(q(`A=${a}，B=${b}，差几？`, wrongOpts(Math.abs(a-b), [Math.abs(a-b)+1,Math.abs(a-b)-1,a+b,Math.max(a,b)]), Math.abs(a-b), '|A-B|')) }
add('data-thinking', 'compare-data', 2, cd2); add('data-thinking', 'compare-data', 3, cd3)

let ss2 = [], ss3 = []
for (let i = 0; i < N; i++) { const a=randInt(3,8); const b=randInt(3,8); const c=randInt(2,6); ss2.push(q(`调查：喜欢A的${a}人，B的${b}人，C的${c}人，共调查几人？`, wrongOpts(a+b+c, [a+b,a+b+c+1,a*b,b+c]), a+b+c, '全加')) }
for (let i = 0; i < N; i++) { const a=randInt(5,15); const d=randInt(3,10); const diff=randInt(1,6); const b=d+diff; const c=randInt(3,10); ss3.push(q(`调查：春${a} 夏${b} 秋${c} 冬${d}，夏比冬多几人？`, wrongOpts(diff, [b+d,diff+1,diff+2,a+d]), diff, `${b}-${d}=${diff}`)) }
add('data-thinking', 'simple-survey', 2, ss2); add('data-thinking', 'simple-survey', 3, ss3)

// ========== problem-solving (补充: fair-share, make-change, free-build) ==========
let fs2 = [], fs3 = []
for (let i = 0; i < N; i++) { const total = randInt(6, 20); const people = randInt(2, 4); const each = Math.floor(total / people); const left = total - each * people; fs2.push(q(`${total}颗糖分给${people}个小朋友，每人几颗？`, wrongOpts(each, [each+1, each-1>0?each-1:1, total-people, people]), each, `${total}÷${people}`)) }
for (let i = 0; i < N; i++) { const total = randInt(12, 40); const people = randInt(3, 6); const each = Math.floor(total / people); const left = total - each * people; fs3.push(q(`${total}块饼干分给${people}人，每人${each}块，还剩几块？`, wrongOpts(left, [left+1, left+people, each, left>0?left-1:1]), left, `${total}-${each}×${people}=${left}`)) }
add('problem-solving', 'fair-share', 2, fs2); add('problem-solving', 'fair-share', 3, fs3)

let mc2 = [], mc3 = []
const coins = [1, 2, 5, 10]
for (let i = 0; i < N; i++) { const target = randInt(3, 15); const combos = []; for (const a of [0,1,2,3,4,5]) for (const b of [0,1,2,3]) for (const c of [0,1,2]) { if (a*1+b*2+c*5 === target && a+b+c > 0) combos.push(a+b+c) } const minCoins = combos.length ? Math.min(...combos) : target; mc2.push(q(`凑出${target}元，最少用几枚硬币(1/2/5元)？`, wrongOpts(minCoins, [minCoins+1, minCoins+2, target, minCoins>1?minCoins-1:1]), minCoins, '先用大面额')) }
for (let i = 0; i < N; i++) { const target = randInt(8, 30); const combos = []; for (const a of [0,1,2,3,4,5,6]) for (const b of [0,1,2,3,4]) for (const c of [0,1,2,3]) for (const d of [0,1,2]) { if (a*1+b*2+c*5+d*10 === target && a+b+c+d > 0) combos.push(a+b+c+d) } const minCoins = combos.length ? Math.min(...combos) : Math.ceil(target/10); mc3.push(q(`凑出${target}元，最少用几枚(1/2/5/10元)？`, wrongOpts(minCoins, [minCoins+1, minCoins+2, Math.ceil(target/5), minCoins>1?minCoins-1:1]), minCoins, '贪心：先用大面额')) }
add('problem-solving', 'make-change', 2, mc2); add('problem-solving', 'make-change', 3, mc3)

let fb2 = [], fb3 = []
for (let i = 0; i < N; i++) { const target = randInt(4, 12); const shapes = pick([['三角形(3边)', 3], ['正方形(4边)', 4], ['五边形(5边)', 5]]); const need = Math.ceil(target / shapes[1]); fb2.push(q(`用${shapes[0]}拼出至少${target}条边，最少几个？`, wrongOpts(need, [need+1, need-1>0?need-1:1, target, shapes[1]]), need, `${target}÷${shapes[1]}向上取整`)) }
for (let i = 0; i < N; i++) { const area = randInt(6, 20); const unit = pick([['1×1方块', 1], ['1×2长条', 2], ['L形(3格)', 3]]); const need = Math.ceil(area / unit[1]); fb3.push(q(`铺满${area}格，用${unit[0]}，最少几块？`, wrongOpts(need, [need+1, need+2, area, need>1?need-1:1]), need, `${area}÷${unit[1]}向上取整`)) }
add('problem-solving', 'free-build', 2, fb2); add('problem-solving', 'free-build', 3, fb3)

// ========== Level 1 (小苗苗) — 对标一年级下：100以内加减法 ==========
const N1 = 25

// number-sense L1 — 100以内数的认识、组成、凑整十
let mt1 = []
for (let i = 0; i < N1; i++) { const a = randInt(21, 89); const tens = Math.floor(a/10)*10; const ans = tens + 10 - a; mt1.push(q(`${a} 再加几就变成 ${tens+10}？`, wrongOpts(ans, [ans+1>10?ans+1:ans+2, ans-1>0?ans-1:ans+3, 10-ans%10+10, ans+2]), ans, `${tens+10}-${a}=${ans}`)) }
add('number-sense', 'make-ten', 1, mt1)

let sn1 = []
for (let i = 0; i < N1; i++) { const tens = randInt(2,8)*10; const ones = randInt(1,9); const n = tens+ones; sn1.push(q(`${n} 由几个十和几个一组成？`, [{value:`${tens/10}个十${ones}个一`,label:`${tens/10}个十和${ones}个一`},{value:`${ones}个十${tens/10}个一`,label:`${ones}个十和${tens/10}个一`},{value:`${tens/10+1}个十${ones}个一`,label:`${tens/10+1}个十和${ones}个一`},{value:`${tens/10}个十${ones+1}个一`,label:`${tens/10}个十和${ones+1}个一`}], `${tens/10}个十${ones}个一`, `十位${tens/10}，个位${ones}`)) }
add('number-sense', 'split-number', 1, sn1)

let qc1 = []
for (let i = 0; i < N1; i++) { const tens = randInt(1,9)*10; const ones = randInt(0,9); const n = tens+ones; const next = n+1; qc1.push(q(`${n} 后面的数是？`, wrongOpts(next, [n-1>0?n-1:n+2, n+2, n+10, tens]), next, '加1')) }
add('number-sense', 'quick-count', 1, qc1)

let ff1 = []
for (let i = 0; i < N1; i++) { const tens = randInt(2,8)*10; const a = randInt(tens-9, tens-1); const b = tens - a; ff1.push(q(`哪两个数合起来是 ${tens}？`, [{value:`${a}和${b}`,label:`${a} 和 ${b}`},{value:`${a+1}和${b}`,label:`${a+1} 和 ${b}`},{value:`${a}和${b+1}`,label:`${a} 和 ${b+1}`},{value:`${a-1}和${b}`,label:`${a-1} 和 ${b}`}], `${a}和${b}`, `${a}+${b}=${tens}`)) }
add('number-sense', 'find-friend', 1, ff1)

let cp1 = []
for (let i = 0; i < N1; i++) { const a = randInt(11, 99); let b = randInt(11, 99); if(a===b) b=a+randInt(1,10)>99?a-randInt(1,10):a+randInt(1,10); const ans = a>b?'>':a<b?'<':'='; cp1.push(q(`${a} ○ ${b}，填什么？`, ['>','<','='].map(x=>({value:x,label:x})), ans, '先比十位再比个位')) }
add('number-sense', 'compare', 1, cp1)

let es1 = []
for (let i = 0; i < N1; i++) { const n = randInt(11, 89); const nearest = Math.round(n/10)*10; es1.push(q(`${n} 最接近哪个整十数？`, wrongOpts(nearest, [nearest===10?20:nearest-10, nearest+10>100?nearest-20:nearest+10, n]), nearest, '看个位，≥5进，<5舍')) }
add('number-sense', 'estimate', 1, es1)

// quantity-relation L1 — 100以内加减法应用
let st1 = []
for (let i = 0; i < N1; i++) { const a=randInt(20,60); const b=randInt(10,35); const s=a+b; const names=pick(['小明','小红','小华','小刚']); const items=pick(['颗糖','本书','个苹果','张贴纸']); st1.push(q(`${names}有${a}${items}，又得到${b}个，现在几个？`, wrongOpts(s, [s+1,s-1,a-b>0?a-b:b]), s, `${a}+${b}=${s}`)) }
add('quantity-relation', 'story-theater', 1, st1)

let ar1 = []
for (let i = 0; i < N1; i++) { const a=randInt(30,80); const d=randInt(10,25); const b=a-d; ar1.push(q(`上排${a}个，下排比上排少${d}个，下排几个？`, wrongOpts(b, [b+1,b-1>0?b-1:b+2,a,b+10]), b, `${a}-${d}=${b}`)) }
add('quantity-relation', 'arrange', 1, ar1)

let ml1 = []
for (let i = 0; i < N1; i++) { const a=randInt(20,80); let b=randInt(20,80); if(a===b) b=a+randInt(1,10); const diff=Math.abs(a-b); const ans=a>b?`多${diff}个`:`少${diff}个`; ml1.push(q(`A排${a}个，B排${b}个，A比B？`, [`多${diff}个`,`少${diff}个`,'一样多'].map(x=>({value:x,label:x})), ans, '大减小')) }
add('quantity-relation', 'more-less', 1, ml1)

let dt1 = []
for (let i = 0; i < N1; i++) { const a=randInt(20,50); const b=randInt(10,40); dt1.push(q(`有${a}个红球和${b}个蓝球，一共几个？需要哪些条件？`, [`${a}和${b}`,`红球数量`,`蓝球数量`].map(x=>({value:x,label:x})), `${a}和${b}`, '两个条件都要')) }
add('quantity-relation', 'detective', 1, dt1)

let ms1 = []
for (let i = 0; i < N1; i++) { const a=randInt(15,50); const b=randInt(10,40); const s=a+b; ms1.push(q(`${a}+${b}=${s}，哪个也对？`, [{value:`${b}+${a}=${s}`,label:`${b}+${a}=${s}`},{value:`${a}+${b}=${s+1}`,label:`${a}+${b}=${s+1}`},{value:`${s}-${a}=${b+1}`,label:`${s}-${a}=${b+1}`},{value:`${a}-${b}=${a-b}`,label:`${a}-${b}=${a-b}`}], `${b}+${a}=${s}`, '交换律')) }
add('quantity-relation', 'multi-solve', 1, ms1)

// calc-strategy L1 — 两位数加减一位数/整十数（含进退位）
let sc1 = []
for (let i = 0; i < N1; i++) { const a=randInt(20,70); const b=randInt(3,9); const s=a+b; sc1.push(q(`${a}+${b}=？`, wrongOpts(s, [s+1,s-1,s+10,s-10>0?s-10:s+2]), s, `个位${a%10}+${b}${a%10+b>=10?'，进位':''}`)) }
add('calc-strategy', 'split-calc', 1, sc1)

let mr1 = []
for (let i = 0; i < N1; i++) { const tens=randInt(2,8)*10; const a=randInt(tens+1,tens+8); const sp=tens+10-a; const b=randInt(sp+1,sp+5); const ans=a+b; mr1.push(q(`${a}+${b}：先凑到${tens+10}，${a}+${sp}=${tens+10}，再加${b-sp}，得？`, wrongOpts(ans, [ans+1,ans-1,tens+10,ans+2]), ans, `${tens+10}+${b-sp}=${ans}`)) }
add('calc-strategy', 'make-round', 1, mr1)

let mm1 = []
for (let i = 0; i < N1; i++) { const a=randInt(20,60); const b=randInt(10,30); const s=a+b; mm1.push(q(`${a}+${b}=${s}，另一种算法？`, [{value:`先加整十${Math.floor(b/10)*10}再加${b%10}`,label:`先加${Math.floor(b/10)*10}再加${b%10}`},{value:`${a}+${b+1}=${s+1}`,label:`${a}+${b+1}=${s+1}`},{value:`${a}-${b}=${a-b}`,label:`${a}-${b}=${a-b}`},{value:`${b}+${a}=${s}`,label:`${b}+${a}=${s}`}], `先加整十${Math.floor(b/10)*10}再加${b%10}`, '拆整十')) }
add('calc-strategy', 'multi-method', 1, mm1)

let tb1 = []
for (let i = 0; i < N1; i++) { const a=randInt(30,70); const b=randInt(5,20); const s=a+b; const methods=['拆分(先加整十再加个位)','凑十法','画图','数手指']; tb1.push(q(`${a}+${b}怎么算最快？`, methods.map(x=>({value:x,label:x})), '拆分(先加整十再加个位)', '整十数好算')) }
add('calc-strategy', 'tool-box', 1, tb1)

// pattern L1 — 找规律（步长3-8，起始值5-30）
let sq1 = []
for (let i = 0; i < N1; i++) { const start=randInt(5,30); const step=randInt(3,8); const seq=Array.from({length:4},(_,j)=>start+step*j); const ans=seq[3]+step; sq1.push(q(`${seq.join(', ')}, ?`, wrongOpts(ans, [ans+1,ans-1,ans+step,ans-step>0?ans-step:ans+2]), ans, `每次+${step}`)) }
add('pattern', 'sequence', 1, sq1)

let oo1 = []
const ooPool1 = [['苹果','香蕉','橘子','汽车','水果'],['猫','狗','鱼','桌子','动物'],['红','蓝','绿','跑','颜色'],['2','4','6','9','偶数'],['三角','正方','圆','甜','图形'],['春','夏','秋','热','季节']]
for (let i = 0; i < N1; i++) { const d=ooPool1[i%ooPool1.length]; const items=d.slice(0,4); oo1.push(q(`哪个不同类？${items.join('、')}`, items.map(x=>({value:x,label:x})), items[3], d[4])) }
add('pattern', 'odd-one-out', 1, oo1)

let ds1 = []
for (let i = 0; i < N1; i++) { const shapes=pick([['🔴','🔵'],['⭐','🌙'],['🟢','🟡'],['▲','■']]); const pat=[shapes[0],shapes[1],shapes[0],shapes[1],shapes[0]]; ds1.push(q(`${pat.join('')} 下一个？`, shapes.map(x=>({value:x,label:x})), shapes[1], 'AB规律')) }
add('pattern', 'designer', 1, ds1)

let sp1 = []
for (let i = 0; i < N1; i++) { const n=randInt(2,5); sp1.push(q(`${n}个正方形各有4条边，共几条边？`, wrongOpts(n*4, [n*4+1,n*3,n+4,n*2]), n*4, `${n}×4=${n*4}`)) }
add('pattern', 'shape-pattern', 1, sp1)

let jd1 = []
for (let i = 0; i < N1; i++) { const a=randInt(20,60); const b=randInt(5,30); const c=a+b; const shown=c+pick([-1,0,1,10,-10]); const ans=shown===c?'对':'错'; jd1.push(q(`${a}+${b}=${shown} 对吗？`, [{value:'对',label:'✅ 对'},{value:'错',label:'❌ 错'}], ans, `${a}+${b}=${c}`)) }
add('pattern', 'judge', 1, jd1)

// spatial L1 — 认识平面图形、七巧板（一年级下）
let tg1 = []
const tgQ1 = [['2个一样的三角形能拼成什么？','正方形','拼一拼'],['七巧板一共有几块？','7块','5三角+1正方+1平行四边形'],['七巧板中有几个三角形？','5个','数一数'],['2个一样的正方形能拼成什么？','长方形','拼一拼']]
for (let i = 0; i < N1; i++) { const t=tgQ1[i%tgQ1.length]; const opts=t[0].includes('拼成')?['正方形','圆形','三角形','长方形']:['5块','6块','7块','8块']; tg1.push(q(t[0], opts.map(x=>({value:x,label:x})), t[1], t[2])) }
add('spatial', 'tangram', 1, tg1)

let rt1 = []
for (let i = 0; i < N1; i++) { const shape=pick(['圆','正方形']); const deg=pick([90,180,360]); rt1.push(q(`${shape}旋转${deg}°后还是${shape}吗？`, [{value:'是',label:'是'},{value:'不是',label:'不是'}], '是', '对称图形转了还一样')) }
add('spatial', 'rotate', 1, rt1)

let cs1 = []
for (let i = 0; i < N1; i++) { const n=randInt(2,4); cs1.push(q(`这里有${n}个小三角形和1个大三角形，一共几个三角形？`, wrongOpts(n+1, [n,n+2,n*2,n-1>0?n-1:1]), n+1, '小的+大的')) }
add('spatial', 'count-shapes', 1, cs1)

let sy1 = []
for (let i = 0; i < N1; i++) { const shapes=[['正方形',4],['圆','无数'],['等边三角形',3],['长方形',2]]; const s=pick(shapes); sy1.push(q(`${s[0]}有几条对称轴？`, ['1','2','3','4','无数'].map(x=>({value:x,label:x})), String(s[1]), '折一折')) }
add('spatial', 'symmetry', 1, sy1)

let bc1 = []
for (let i = 0; i < N1; i++) { const l=randInt(2,4); const w=randInt(2,4); bc1.push(q(`${l}×${w}的长方形由几个小方块组成？`, wrongOpts(l*w, [l*w+1,l+w,l*w-1,l*2]), l*w, `${l}×${w}=${l*w}`)) }
add('spatial', 'block-count', 1, bc1)

// logic L1 — 两位数推理、100以内排序
let ww1 = []
for (let i = 0; i < N1; i++) { const a=randInt(15,60); let b=randInt(15,60); if(a===b) b=a+randInt(1,10); ww1.push(q(`A=${a}岁，B=${b}岁，谁大？`, ['A','B','一样大'].map(x=>({value:x,label:x})), a>b?'A':'B', '比大小')) }
add('logic', 'who-is-who', 1, ww1)

let od1 = []
for (let i = 0; i < N1; i++) { const nums=shuffle(Array.from({length:4},()=>randInt(10,80))); const sorted=[...nums].sort((a,b)=>a-b); od1.push(q(`从小到大排：${nums.join(', ')}，最大是？`, sorted.map(x=>({value:String(x),label:String(x)})), sorted[3], '找最大')) }
add('logic', 'ordering', 1, od1)

let tf1 = []
for (let i = 0; i < N1; i++) { const a=randInt(20,60); const b=randInt(5,30); const stmts=[[`${a}+0=${a}`,'对'],[`${a}-${a}=1`,'错'],[`${a}+${b}=${a+b}`,'对'],[`${a}-${b}=${a-b+1}`,'错'],[`任何数加0等于它自己`,'对'],[`0减任何数等于0`,'错']]; const s=stmts[i%stmts.length]; tf1.push(q(`"${s[0]}"对吗？`, [{value:'对',label:'✅ 对'},{value:'错',label:'❌ 错'}], s[1], '算一算')) }
add('logic', 'true-false', 1, tf1)

let ld1 = []
for (let i = 0; i < N1; i++) { const ans=randInt(11,60); const clues=[`十位是${Math.floor(ans/10)}`,`个位是${ans%10}`,`比${ans-5}大比${ans+5}小`]; ld1.push(q(`线索：${clues.join('，')}。这个数是？`, wrongOpts(ans, [ans-1,ans+1,ans+10,ans-10>0?ans-10:ans+5]), ans, '综合线索')) }
add('logic', 'little-detective', 1, ld1)

// problem-solving L1 — 100以内应用题、人民币（元角分）
let fs1 = []
for (let i = 0; i < N1; i++) { const total = randInt(20, 80); const people = pick([2,4,5]); const each = Math.floor(total / people); const remainder = total % people; fs1.push(q(`${total}颗糖分给${people}个小朋友，每人几颗？`, wrongOpts(each, [each+1,total,each+2,each-1>0?each-1:1]), each, `${total}÷${people}=${each}${remainder>0?'余'+remainder:''}`)) }
add('problem-solving', 'fair-share', 1, fs1)

let mc1 = []
for (let i = 0; i < N1; i++) { const yuan = randInt(1, 9); const jiao = randInt(0, 9); const totalJiao = yuan*10+jiao; mc1.push(q(`${yuan}元${jiao}角 = 几角？`, wrongOpts(totalJiao, [yuan+jiao, yuan*10, totalJiao+1, totalJiao-1>0?totalJiao-1:1]), totalJiao, `${yuan}元=${yuan*10}角，再加${jiao}角`)) }
add('problem-solving', 'make-change', 1, mc1)

let rt1c = []
for (let i = 0; i < N1; i++) { const a=randInt(2,4); const b=randInt(2,4); rt1c.push(q(`A到B有${a}条路，B到C有${b}条路，共几种走法？`, wrongOpts(a*b, [a+b,a*b+1,a+b+1,a*b-1]), a*b, `${a}×${b}=${a*b}`)) }
add('problem-solving', 'route', 1, rt1c)

let lm1 = []
for (let i = 0; i < N1; i++) { const price=randInt(3,9); const qty=randInt(2,8); const total=price*qty; lm1.push(q(`每支笔${price}元，买${qty}支，一共几元？`, wrongOpts(total, [price+qty,total+1,total+price,total-1]), total, `${price}×${qty}=${total}`)) }
add('problem-solving', 'life-math', 1, lm1)

let fb1 = []
for (let i = 0; i < N1; i++) { const target = randInt(8, 20); const need = Math.ceil(target/4); fb1.push(q(`用正方形(4边)拼出至少${target}条边，最少几个正方形？`, wrongOpts(need, [need+1,target,need+2,need-1>0?need-1:1]), need, `${target}÷4向上取整=${need}`)) }
add('problem-solving', 'free-build', 1, fb1)

// math-expression L1 — 两位数运算方法选择
let mym1 = []
for (let i = 0; i < N1; i++) { const a=randInt(20,60); const b=randInt(5,20); const methods=['拆分(先加整十再加个位)','凑十法','画图','数手指']; mym1.push(q(`${a}+${b}=${a+b}，用了什么方法最快？`, methods.map(x=>({value:x,label:x})), '拆分(先加整十再加个位)', '整十好算')) }
add('math-expression', 'my-method', 1, mym1)

let fm1 = []
for (let i = 0; i < N1; i++) { const a=randInt(20,60); const b=randInt(5,30); const correct=a+b; const wrong=correct+pick([-1,1,10,-10]); fm1.push(q(`${a}+${b}=${wrong} 对吗？正确答案是？`, wrongOpts(correct, [wrong,correct+1,correct+2]), correct, `${a}+${b}=${correct}`)) }
add('math-expression', 'find-mistake', 1, fm1)

// data-thinking L1 — 100以内数据比较
let cks1 = []
for (let i = 0; i < N1; i++) { const a=randInt(10,50); const b=randInt(10,50); const c=randInt(10,50); const items=['🍎','🍌','🍊']; const maxI=[a,b,c].indexOf(Math.max(a,b,c)); cks1.push(q(`${items[0]}${a}个 ${items[1]}${b}个 ${items[2]}${c}个，哪种最多？`, items.map(x=>({value:x,label:x})), items[maxI], '比大小')) }
add('data-thinking', 'count-sort', 1, cks1)

let rc1 = []
for (let i = 0; i < N1; i++) { const vals=[randInt(10,50),randInt(10,50),randInt(10,50)]; const names=['甲','乙','丙']; const maxI=vals.indexOf(Math.max(...vals)); rc1.push(q(`${names.map((n,j)=>`${n}=${vals[j]}分`).join('，')}，谁最高？`, names.map(x=>({value:x,label:x})), names[maxI], '找最大')) }
add('data-thinking', 'read-chart', 1, rc1)

let cd1 = []
for (let i = 0; i < N1; i++) { const a=randInt(15,60); let b=randInt(15,60); if(a===b) b=a+randInt(1,10); cd1.push(q(`A组${a}人，B组${b}人，哪组多？`, ['A组','B组','一样多'].map(x=>({value:x,label:x})), a>b?'A组':'B组', '比大小')) }
add('data-thinking', 'compare-data', 1, cd1)

let ss1 = []
for (let i = 0; i < N1; i++) { const a=randInt(10,30); const b=randInt(10,30); const c=randInt(5,20); ss1.push(q(`喜欢A的${a}人，B的${b}人，C的${c}人，共几人？`, wrongOpts(a+b+c, [a+b,a+b+c+1,b+c,a+c]), a+b+c, '全加起来')) }
add('data-thinking', 'simple-survey', 1, ss1)

// ========== 去重 ==========
function dedup(arr) {
  const seen = new Set()
  return arr.filter(q => { if (seen.has(q.question)) return false; seen.add(q.question); return true })
}
// 对每个桶去重（不再生成变体，避免答案不匹配）
for (const [key, buckets] of Object.entries(bank)) {
  for (const [lvl, arr] of Object.entries(buckets)) {
    bank[key][lvl] = dedup(arr)
  }
}

// ========== 输出 ==========
const json = JSON.stringify(bank, null, 0)
writeFileSync('public/question-bank-local.json', json, 'utf-8')

let total = 0
for (const buckets of Object.values(bank)) { for (const arr of Object.values(buckets)) total += arr.length }
console.log(`✅ 生成完毕！共 ${Object.keys(bank).length} 个游戏，${total} 道题目`)
console.log(`📁 文件: public/question-bank-local.json (${(json.length / 1024).toFixed(1)} KB)`)
console.log(`📥 请在设置页点「📥 导入」选择此文件`)
