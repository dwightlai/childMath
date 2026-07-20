// Lightweight sound synthesizer using the Web Audio API.
// Generates cheerful, kid-friendly tones without needing audio files.
import { useSettingsStore } from '../stores/useSettingsStore'

let ctx = null
const getCtx = () => {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

const tone = (freq, start, duration, type = 'sine', volume = 0.25) => {
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = c.currentTime + start
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

export const playClick = () => {
  if (!useSettingsStore.getState().soundEnabled) return
  try { tone(600, 0, 0.08, 'sine', 0.15) } catch (e) {}
}

export const playCorrect = () => {
  if (!useSettingsStore.getState().soundEnabled) return
  try {
    tone(523.25, 0, 0.15, 'triangle', 0.3)     // C5
    tone(659.25, 0.1, 0.15, 'triangle', 0.3)   // E5
    tone(783.99, 0.2, 0.25, 'triangle', 0.3)   // G5
  } catch (e) {}
}

export const playWrong = () => {
  if (!useSettingsStore.getState().soundEnabled) return
  try {
    tone(300, 0, 0.18, 'sine', 0.18)
    tone(250, 0.12, 0.25, 'sine', 0.18)
  } catch (e) {}
}

export const playStar = () => {
  if (!useSettingsStore.getState().soundEnabled) return
  try {
    tone(880, 0, 0.12, 'sine', 0.2)
    tone(1174.66, 0.08, 0.2, 'sine', 0.2)
  } catch (e) {}
}

export const playCelebrate = () => {
  if (!useSettingsStore.getState().soundEnabled) return
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5]
    notes.forEach((n, i) => tone(n, i * 0.12, 0.2, 'triangle', 0.3))
    // sparkle
    tone(1567.98, 0.75, 0.3, 'sine', 0.15)
    tone(2093, 0.85, 0.4, 'sine', 0.12)
  } catch (e) {}
}

export const playPop = () => {
  if (!useSettingsStore.getState().soundEnabled) return
  try { tone(440, 0, 0.06, 'square', 0.08) } catch (e) {}
}
