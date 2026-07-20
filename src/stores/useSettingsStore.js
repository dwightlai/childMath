import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      soundEnabled: true,
      musicEnabled: false,
      speechEnabled: true,
      difficulty: 1, // 1-3
      sessionMinutes: 15, // 15 or 20
      // AI adaptive question generation
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
    { name: 'childmath-settings' },
  ),
)
