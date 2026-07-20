// Text-to-speech using the Web Speech API (Chinese voice when available).
import { useSettingsStore } from '../stores/useSettingsStore'

export const speak = (text) => {
  if (!useSettingsStore.getState().speechEnabled) return
  if (!('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'zh-CN'
    utter.rate = 0.9
    utter.pitch = 1.1
    const voices = window.speechSynthesis.getVoices()
    const zh = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('zh'))
    if (zh) utter.voice = zh
    window.speechSynthesis.speak(utter)
  } catch (e) {}
}

export const stopSpeak = () => {
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel() } catch (e) {}
  }
}
