import { useState } from 'react'
import { speak } from '../utils/speech'
import { playClick } from '../utils/audio'

// A round button that reads the given text aloud (Chinese TTS).
export default function AudioButton({ text, size = 'md' }) {
  const [speaking, setSpeaking] = useState(false)
  const sizes = { sm: 'w-10 h-10 text-lg', md: 'w-12 h-12 text-xl', lg: 'w-14 h-14 text-2xl' }

  const handle = () => {
    playClick()
    setSpeaking(true)
    speak(text)
    setTimeout(() => setSpeaking(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-label="朗读"
      className={`${sizes[size]} btn-chunky bg-sky text-white shrink-0 ${speaking ? 'animate-wiggle' : ''}`}
    >
      {speaking ? '📢' : '🔊'}
    </button>
  )
}
