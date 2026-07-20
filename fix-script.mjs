import { readFileSync, writeFileSync } from 'fs'

let c = readFileSync('generate-bank.mjs', 'utf-8')

// Fix simple-survey L3: ensure b > d to avoid negative
const oldSS = `const a=randInt(5,15); const b=randInt(5,15); const c=randInt(3,10); const d=randInt(3,10); const diff=Math.abs(b-d); ss3.push(q(\`调查：春\${a} 夏\${b} 秋\${c} 冬\${d}，夏比冬多几人？\`, wrongOpts(b-d>0?b-d:d-b, [b+d,diff+1,diff-1,a-d]), b-d>0?b-d:d-b, \`|\${b}-\${d}|\`))`
const newSS = `const a=randInt(5,15); const d=randInt(3,10); const diff=randInt(1,6); const b=d+diff; const c=randInt(3,10); ss3.push(q(\`调查：春\${a} 夏\${b} 秋\${c} 冬\${d}，夏比冬多几人？\`, wrongOpts(diff, [b+d,diff+1,diff+2,a+d]), diff, \`\${b}-\${d}=\${diff}\`))`

if (c.includes(oldSS)) {
  c = c.replace(oldSS, newSS)
  console.log('✅ simple-survey L3 fixed')
} else {
  console.log('⚠️ simple-survey L3 pattern not found (may already be fixed)')
}

// Fix compare-data L3: Math.abs(a-b)-1 can be -1 when a===b
const oldCD = `const a=randInt(8,25); const b=randInt(8,25); cd3.push(q(\`A=\${a}，B=\${b}，差几？\`, wrongOpts(Math.abs(a-b), [Math.abs(a-b)+1,Math.abs(a-b)-1,a+b,Math.max(a,b)]), Math.abs(a-b), '|A-B|'))`
const newCD = `const a=randInt(8,25); let b=randInt(8,25); if(a===b)b=a+1; const diff3=Math.abs(a-b); cd3.push(q(\`A=\${a}，B=\${b}，差几？\`, wrongOpts(diff3, [diff3+1,diff3+2,a+b,Math.max(a,b)]), diff3, '|A-B|'))`

if (c.includes(oldCD)) {
  c = c.replace(oldCD, newCD)
  console.log('✅ compare-data L3 fixed')
} else {
  console.log('⚠️ compare-data L3 pattern not found')
}

writeFileSync('generate-bank.mjs', c, 'utf-8')
console.log('✅ Done')
