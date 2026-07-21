import { createJSONStorage } from 'zustand/middleware'
import { idbStorage } from '../db/idb'

/** Shared IndexedDB JSON storage for all Zustand persist stores. */
export const persistStorage = createJSONStorage(() => idbStorage)
