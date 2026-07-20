import { motion } from 'framer-motion'

export default function ProgressBar({ value, max, color = 'sun' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const colorMap = {
    sun: '#FFB703', sky: '#4CC9F0', leaf: '#80B918',
    coral: '#FF6B6B', grape: '#B388EB', mint: '#2EC4B6',
    peach: '#FF9F1C', berry: '#F15BB5', rose: '#EF476F',
  }
  return (
    <div className="w-full h-4 rounded-full bg-white/70 border-2 border-ink/10 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: colorMap[color] || colorMap.sun }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  )
}
