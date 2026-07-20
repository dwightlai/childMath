// General helper utilities.

export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

export const pick = (arr) => arr[randInt(0, arr.length - 1)]

export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build a shuffled multiple-choice option set that always includes the answer.
export const buildOptions = (answer, pool, count = 4) => {
  const others = pool.filter((v) => v !== answer)
  const chosen = shuffle(others).slice(0, count - 1)
  return shuffle([answer, ...chosen])
}

// Generate numeric options around an answer (for generated questions).
export const numericOptions = (answer, count = 4, spread = 3) => {
  const set = new Set([answer])
  let guard = 0
  while (set.size < count && guard < 100) {
    const cand = answer + randInt(-spread, spread)
    if (cand >= 0 && cand !== answer) set.add(cand)
    guard++
  }
  // fill if still short
  let n = answer + spread + 1
  while (set.size < count) { set.add(n); n++ }
  return shuffle([...set])
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
