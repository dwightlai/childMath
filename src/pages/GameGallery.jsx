import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MODULES } from '../data/config'
import { playClick } from '../utils/audio'
import { INTERACTIVE_GAMES } from '../services/question-loader'

const COLOR_BG = {
  sun: 'bg-sun', sky: 'bg-sky', leaf: 'bg-leaf',
  coral: 'bg-coral', grape: 'bg-grape', mint: 'bg-mint',
  peach: 'bg-peach', berry: 'bg-berry', rose: 'bg-rose',
}
const COLOR_DEEP = {
  sun: 'text-sun-deep', sky: 'text-sky-deep', leaf: 'text-leaf-deep',
  coral: 'text-coral-deep', grape: 'text-grape-deep', mint: 'text-mint-deep',
  peach: 'text-peach-deep', berry: 'text-berry-deep', rose: 'text-rose-deep',
}

export default function GameGallery() {
  return (
    <div className="min-h-full pb-16">
      <header className="bg-gradient-to-br from-sky to-sky-deep px-6 pt-8 pb-14 rounded-b-[3rem] relative overflow-hidden">
        <span className="absolute top-6 right-10 text-4xl animate-float">📖</span>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.2)]">游戏图鉴</h1>
            <p className="text-white/90 font-bold mt-1">所有游戏一览，点一下就能试玩！</p>
          </div>
          <Link to="/" onClick={() => playClick()} className="btn-chunky bg-white/90 text-ink px-5 py-2 text-lg">
            ← 回首页
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-6">
        {MODULES.map((m, mi) => (
          <motion.section
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mi * 0.06 }}
            className="card-sticker p-5 mb-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{m.emoji}</span>
              <div>
                <h2 className={`font-display text-2xl ${COLOR_DEEP[m.color]}`}>{m.name}</h2>
                <p className="text-ink-soft text-sm">{m.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {m.games.map((g) => {
                const isInteractive = INTERACTIVE_GAMES.has(g.id)
                return (
                  <Link
                    key={g.id}
                    to={`/play/${m.id}/${g.id}`}
                    onClick={() => playClick()}
                    className={`relative rounded-2xl border-2 p-3 flex flex-col items-center gap-1 text-center transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer ${
                      isInteractive
                        ? 'border-dashed border-ink/20 bg-white'
                        : 'border-ink/10 bg-white'
                    }`}
                  >
                    <span className="text-3xl">{g.emoji}</span>
                    <span className="font-bold text-ink text-sm leading-tight">{g.name}</span>
                    {isInteractive && (
                      <span className="text-[10px] font-bold text-white bg-coral/80 rounded-full px-1.5 py-0.5 leading-none">
                        动手玩
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </motion.section>
        ))}

        <p className="text-center text-ink-soft text-sm mt-4 mb-8">
          共 {MODULES.reduce((s, m) => s + m.games.length, 0)} 个游戏 · 点任意一个直接试玩 🎮
        </p>
      </main>
    </div>
  )
}
