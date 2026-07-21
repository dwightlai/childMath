import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistStorage } from '../db/persistStorage'

export const useSettingsStore = create(
  persist(
    (set) => ({
      soundEnabled: true,
      musicEnabled: false,
      speechEnabled: true,
      difficulty: 1,
      sessionMinutes: 15,
      aiEnabled: false,
      apiBaseUrl: 'https://api.deepseek.com/v1',
      apiKey: '',
      modelName: 'deepseek-v4-flash',
      setSound: (v) => set({ soundEnabled: v }),
      setMusic: (v) => set({ musicEnabled: v }),
      setSpeech: (v) => set({ speechEnabled: v }),
      setDifficulty: (v) => set({ difficulty: v }),
      setSessionMinutes: (v) => set({ sessionMinutes: v }),
      setAiEnabled: (v) => set({ aiEnabled: v }),
      setApiBaseUrl: (v) => set({ apiBaseUrl: v }),
      setApiKey: (v) => set({ apiKey: v }),
      setModelName: (v) => set({ modelName: v }),
    }),
    { name: 'childmath-settings', storage: persistStorage },
  ),
)
