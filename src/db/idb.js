import { get, set, del, keys as idbKeys } from 'idb-keyval'

/** Zustand persist storage backed by IndexedDB (async, large capacity). */
export const idbStorage = {
  getItem: async (name) => {
    const value = await get(name)
    return value == null ? null : String(value)
  },
  setItem: async (name, value) => {
    await set(name, value)
  },
  removeItem: async (name) => {
    await del(name)
  },
}

const LEGACY_KEYS = [
  'childmath-question-bank',
  'childmath-progress',
  'childmath-ability',
  'childmath-settings',
  'childmath-mistakes',
]

/** One-time: copy Zustand localStorage snapshots into IndexedDB, then remove LS. */
export async function migrateLegacyLocalStorage() {
  for (const key of LEGACY_KEYS) {
    try {
      const existing = await get(key)
      if (existing != null) {
        localStorage.removeItem(key)
        continue
      }
      const raw = localStorage.getItem(key)
      if (!raw) continue
      await set(key, raw)
      localStorage.removeItem(key)
    } catch {
      /* ignore single-key failure */
    }
  }

  // Daily plan caches
  try {
    const toMove = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('childmath-daily-plan-')) toMove.push(k)
    }
    for (const k of toMove) {
      const raw = localStorage.getItem(k)
      if (raw == null) continue
      const existing = await get(k)
      if (existing == null) await set(k, raw)
      localStorage.removeItem(k)
    }
  } catch {
    /* ignore */
  }
}

export async function idbGetJson(key) {
  const raw = await get(key)
  if (raw == null) return null
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return null
  }
}

export async function idbSetJson(key, value) {
  await set(key, JSON.stringify(value))
}

export async function idbRemove(key) {
  await del(key)
}

export async function idbListKeys(prefix) {
  const all = await idbKeys()
  return all.map(String).filter((k) => k.startsWith(prefix))
}
