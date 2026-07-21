import { useState, useCallback, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getModule } from '../data/config'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useAbilityStore } from '../stores/useAbilityStore'
import GameDispatcher from '../components/GameDispatcher'
import { loadAiQuestions, INTERACTIVE_GAMES } from '../services/question-loader'
import { playClick } from '../utils/audio'

const FREE_PLAY_COUNT = 5

export default function PlayGame() {
  const { moduleId, gameId } = useParams()
  const navigate = useNavigate()
  const module = getModule(moduleId)
  const game = module?.games.find((g) => g.id === gameId)
  const manualDifficulty = useSettingsStore((s) => s.difficulty)
  const difficulty = manualDifficulty
  const aiEnabled = useSettingsStore((s) => s.aiEnabled)
  const recordAnswer = useAbilityStore((s) => s.recordAnswer)

  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(() => aiEnabled && !INTERACTIVE_GAMES.has(gameId))
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)

  // Preload AI/bank questions (same logic as Session but simpler).
  useEffect(() => {
    if (!module || !game) return undefined
    if (INTERACTIVE_GAMES.has(gameId)) { setLoading(false); return undefined }
    let cancelled = false
    loadAiQuestions(moduleId, gameId, FREE_PLAY_COUNT).then((qs) => {
      if (!cancelled) {
        if (qs) setQuestions(qs)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [moduleId, gameId, module, game])

  const handleQuestionResult = useCallback(
    (r) => { if (module) recordAnswer(moduleId, gameId, r) },
    [moduleId, gameId, module, recordAnswer],
  )

  const handleFinish = useCallback((r) => {
    setResult(r)
    setDone(true)
  }, [])

  const playAgain = () => {
    playClick()
    setDone(false)
    setResult(null)
    setQuestions(null)
    if (aiEnabled && !INTERACTIVE_GAMES.has(gameId)) {
      setLoading(true)
      loadAiQuestions(moduleId, gameId, FREE_PLAY_COUNT).then((qs) => {
        if (qs) setQuestions(qs)
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
    }
  }

  // Invalid route guard
  if (!module || !game) {
    return (
      <div className="min-h-full flex items-center justify-center px-6">
        <div className="card-sticker p-8 text-center">
          <span className="text-5xl">🤷</span>
          <p className="font-display text-2xl text-ink mt-3">找不到这个游戏</p>
          <Link to="/gallery" onClick={() => playClick()} className="btn-chunky bg-sky text-white px-6 py-3 mt-4 inline-block">
            ← 回图鉴
          </Link>
        </div>
      </div>
    )
  }

  const isAiSource = (questions?.length || 0) > 0

  // Done screen
  if (done) {
    return (
      <div className="min-h-full flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-sticker max-w-md w-full p-8 text-center"
        >
          <span className="text-6xl inline-block animate-float">{game.emoji}</span>
          <h2 className="font-display text-3xl text-ink mt-3">试玩结束！</h2>
          {result && (
            <p className="text-ink-soft mt-2">
              答对 <span className="font-display text-2xl text-leaf-deep">{result.correct}</span> 题，
              获得 <span className="font-display text-2xl text-sun-deep">{result.stars}</span> ⭐
            </p>
          )}
          <div className="flex gap-3 justify-center mt-6">
            <button type="button" onClick={playAgain} className="btn-chunky bg-sun text-ink text-lg px-6 py-3">
              🔄 再玩一次
            </button>
            <Link to="/gallery" onClick={() => playClick()} className="btn-chunky bg-ink/10 text-ink text-lg px-6 py-3">
              📖 回图鉴
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center px-6">
        <div className="card-sticker max-w-md w-full p-10 text-center">
          <span className="text-6xl inline-block animate-float">{game.emoji}</span>
          <h2 className="font-display text-3xl text-ink mt-3">{game.name}</h2>
          <div className="flex justify-center gap-1.5 mt-5">
            <span className="w-3 h-3 rounded-full bg-grape animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-3 h-3 rounded-full bg-grape animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-3 h-3 rounded-full bg-grape animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-ink-soft font-bold text-sm mt-3">🤖 AI 正在准备题目...</p>
        </div>
      </div>
    )
  }

  // Active game
  return (
    <div className="min-h-full px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => { playClick(); navigate('/gallery') }} className="btn-chunky bg-white text-ink px-4 py-2">
            ← 回图鉴
          </button>
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow">
            <span className="text-2xl">{game.emoji}</span>
            <span className="font-display text-lg text-ink">{game.name}</span>
          </div>
          <div className="w-20" />
        </div>

        <div className="flex justify-center mb-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border-2 ${
            isAiSource ? 'bg-grape/10 text-grape-deep border-grape/30' : 'bg-ink/5 text-ink-soft border-ink/10'
          }`}>
            {isAiSource ? '🤖 AI 智能出题' : '📦 本地出题'}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full border-2 bg-sun/10 text-sun-deep border-sun/30 ml-2">
            🎮 试玩模式
          </span>
        </div>

        <GameDispatcher
          moduleId={moduleId}
          gameId={gameId}
          difficulty={difficulty}
          questionCount={FREE_PLAY_COUNT}
          color={module.color}
          gameName={game.name}
          gameEmoji={game.emoji}
          questions={questions}
          onQuestionResult={handleQuestionResult}
          onFinish={handleFinish}
        />
      </div>
    </div>
  )
}
