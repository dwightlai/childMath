import { useState, useMemo, useCallback, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getModule, SESSION_PHASES, MODULES } from '../data/config'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useProgressStore } from '../stores/useProgressStore'
import { useAbilityStore } from '../stores/useAbilityStore'
import GameDispatcher from '../components/GameDispatcher'
import RewardModal from '../components/RewardModal'
import { pick, shuffle } from '../utils/helpers'
import { playClick } from '../utils/audio'
import { loadAiQuestions } from '../services/question-loader'

// Games considered "light" for the warmup phase.
const WARMUP_GAMES = ['make-ten', 'compare', 'quick-count', 'find-friend']
// Games considered "hands-on" for the challenge phase.
const HANDS_ON = {
  'number-sense': ['estimate', 'split-number'],
  'quantity-relation': ['arrange', 'more-less'],
  pattern: ['designer', 'odd-one-out'],
  spatial: ['maze', 'tangram', 'block-count'],
  logic: ['little-detective', 'ordering'],
  'problem-solving': ['fair-share', 'make-change', 'free-build'],
}

const REFLECTIONS = [
  '今天你发现了什么小秘密？',
  '哪一道题最有意思？',
  '你是怎么想出来的？',
  '下次想玩哪个游戏？',
  '有没有用到画图或者摆一摆？',
]

export default function Session() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const module = getModule(moduleId) || MODULES[0]
  const difficulty = useSettingsStore((s) => s.difficulty)
  const recordSession = useProgressStore((s) => s.recordSession)
  const addBadge = useProgressStore((s) => s.addBadge)

  // phase: 0 warmup, 1 core, 2 challenge, 3 summary
  const [phase, setPhase] = useState(0)
  const [phaseStarted, setPhaseStarted] = useState(false)
  const [sessionStars, setSessionStars] = useState(0)
  const [stats, setStats] = useState({ correct: 0, answered: 0 })
  const [showReward, setShowReward] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const reflection = useMemo(() => pick(REFLECTIONS), [])

  // AI-generated questions cached per phase (loaded during the interstitial).
  const [aiQuestions, setAiQuestions] = useState({})
  // Questions locked in for the currently active phase (stable during the game).
  const [activeQuestions, setActiveQuestions] = useState(null)
  // Whether the AI/bank preload is still in progress for the current phase.
  // Initialize to true when AI is enabled so the first render already shows loading.
  const [aiLoading, setAiLoading] = useState(() => useSettingsStore.getState().aiEnabled)

  const recordAnswer = useAbilityStore((s) => s.recordAnswer)
  const aiEnabled = useSettingsStore((s) => s.aiEnabled)

  // Pick games for each phase (stable per mount).
  const plan = useMemo(() => {
    const coreGame = pick(module.games)
    const handsOn = HANDS_ON[module.id] || module.games.map((g) => g.id)
    const challengeCandidates = handsOn.filter((id) => id !== coreGame.id)
    const challengeGame =
      module.games.find((g) => g.id === pick(challengeCandidates.length ? challengeCandidates : [coreGame.id])) || coreGame
    return {
      warmup: { moduleId: 'number-sense', game: getModule('number-sense').games.find((g) => g.id === pick(WARMUP_GAMES)) },
      core: { moduleId: module.id, game: coreGame },
      challenge: { moduleId: module.id, game: challengeGame },
    }
  }, [module])

  const phaseConfig = SESSION_PHASES[phase]

  const currentPlan = phase === 0 ? plan.warmup : phase === 1 ? plan.core : plan.challenge

  // Preload AI questions while the phase interstitial is showing, so they are
  // ready by the time the child presses "开始". Falls back silently to local
  // generators if AI is unavailable or slow.
  useEffect(() => {
    if (phaseStarted || phase >= 3) return undefined
    const cp = phase === 0 ? plan.warmup : phase === 1 ? plan.core : plan.challenge
    let cancelled = false
    // Only show loading spinner when AI is enabled (otherwise local is instant).
    if (aiEnabled) setAiLoading(true)
    loadAiQuestions(cp.moduleId, cp.game.id, SESSION_PHASES[phase].questionCount).then((qs) => {
      if (!cancelled) {
        if (qs) setAiQuestions((prev) => ({ ...prev, [phase]: qs }))
        setAiLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setAiLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [phase, phaseStarted, plan, aiEnabled])

  // Record each solved question into the ability model.
  const handleQuestionResult = useCallback(
    (result) => {
      recordAnswer(currentPlan.moduleId, currentPlan.game.id, result)
    },
    [currentPlan, recordAnswer],
  )

  const handleGameFinish = useCallback(
    (result) => {
      setSessionStars((s) => s + result.stars)
      setStats((st) => ({ correct: st.correct + result.correct, answered: st.answered + result.answered }))
      // move to next phase
      setTimeout(() => {
        setPhase((p) => p + 1)
        setPhaseStarted(false)
        if (useSettingsStore.getState().aiEnabled) setAiLoading(true)
      }, 600)
    },
    [],
  )

  // When reaching summary, record once.
  useEffect(() => {
    if (phase === 3 && !recorded) {
      setRecorded(true)
      recordSession(module.id, sessionStars, stats)
      addBadge({ id: `first-${module.id}`, name: `${module.shortName}初体验`, emoji: module.emoji })
      if (sessionStars >= 8) addBadge({ id: 'star-8', name: '星星大丰收', emoji: '🌟' })
      setShowReward(true)
    }
  }, [phase, recorded, module, sessionStars, stats, recordSession, addBadge])

  const beginPhase = () => {
    playClick()
    // Lock in the AI questions (if any) for this phase so they stay stable
    // throughout the game even if the cache updates later.
    setActiveQuestions(aiQuestions[phase] || null)
    setPhaseStarted(true)
  }

  const restart = () => {
    playClick()
    setPhase(0)
    setPhaseStarted(false)
    setSessionStars(0)
    setStats({ correct: 0, answered: 0 })
    setShowReward(false)
    setRecorded(false)
    setAiQuestions({})
    setActiveQuestions(null)
    setAiLoading(false)
  }

  // ---- Summary phase ----
  if (phase === 3) {
    return (
      <div className="min-h-full flex items-center justify-center px-6 py-12">
        <RewardModal
          open={showReward}
          stars={sessionStars}
          title="今天的训练完成啦！"
          subtitle={`${module.name} · 一共获得 ${sessionStars} 颗星星`}
          buttonText="看看我的收获"
          onClose={() => setShowReward(false)}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-sticker max-w-lg w-full p-6 sm:p-8 text-center"
        >
          <span className="text-6xl inline-block animate-float">{module.emoji}</span>
          <h2 className="font-display text-3xl text-ink mt-2">今日总结</h2>
          <div className="flex justify-center gap-1 my-4">
            {[...Array(Math.min(sessionStars, 10))].map((_, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }} className="text-3xl">⭐</motion.span>
            ))}
          </div>
          <p className="text-ink-soft mb-2">
            答对了 <span className="font-display text-2xl text-leaf-deep">{stats.correct}</span> 题，
            一共试了 <span className="font-display text-2xl text-sky-deep">{stats.answered}</span> 次
          </p>

          <div className="bg-sun/15 border-2 border-dashed border-sun rounded-2xl p-4 my-5">
            <p className="text-ink-soft text-sm font-bold mb-1">和爸爸妈妈说一说</p>
            <p className="font-display text-2xl text-ink">{reflection}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => { playClick(); navigate('/') }}
              className="btn-chunky bg-ink/10 text-ink text-lg px-6 py-3"
            >
              🏠 回首页
            </button>
            <button
              type="button"
              onClick={restart}
              className="btn-chunky bg-sun text-ink text-lg px-6 py-3"
            >
              🔄 再玩一次
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ---- Phase interstitial ----
  if (!phaseStarted) {
    return (
      <div className="min-h-full flex items-center justify-center px-6">
        <motion.div
          key={phase}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-sticker max-w-md w-full p-6 sm:p-10 text-center"
        >
          <span className="text-5xl sm:text-7xl inline-block animate-float">{phaseConfig.emoji}</span>
          <p className="text-ink-soft font-bold mt-4">第 {phase + 1} 关 · 约 {phaseConfig.minutes} 分钟</p>
          <h2 className="font-display text-3xl sm:text-4xl text-ink my-2">{phaseConfig.name}</h2>
          <p className="text-ink-soft mb-2">
            游戏：{currentPlan.game.emoji} {currentPlan.game.name}
          </p>
          <div className="flex justify-center gap-2 my-5">
            {SESSION_PHASES.map((p, i) => (
              <span key={p.id} className={`w-3 h-3 rounded-full ${i <= phase ? 'bg-sun' : 'bg-ink/15'}`} />
            ))}
          </div>
          {aiLoading ? (
            <div className="flex flex-col items-center gap-3 my-4">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-grape animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-3 h-3 rounded-full bg-grape animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-3 h-3 rounded-full bg-grape animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-ink-soft font-bold text-sm">🤖 AI 正在准备题目...</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={beginPhase}
              className="btn-chunky bg-sun text-ink text-xl sm:text-2xl px-8 sm:px-12 py-3 sm:py-4"
            >
              开始 ➜
            </button>
          )}
          <div className="mt-5">
            <Link to="/" onClick={() => playClick()} className="text-ink-soft underline text-sm">
              先不玩了，回首页
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ---- Active game ----
  const isAiSource = (activeQuestions?.length || 0) > 0
  return (
    <div className="min-h-full px-4 sm:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => { playClick(); navigate('/') }}
            className="btn-chunky bg-white text-ink px-4 py-2"
          >
            ← 退出
          </button>
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow">
            <span className="text-2xl">{phaseConfig.emoji}</span>
            <span className="font-display text-lg text-ink">{phaseConfig.name}</span>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-2xl px-4 py-2 shadow">
            <span className="text-2xl">⭐</span>
            <span className="font-display text-xl text-ink">{sessionStars}</span>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border-2 ${
              isAiSource
                ? 'bg-grape/10 text-grape-deep border-grape/30'
                : 'bg-ink/5 text-ink-soft border-ink/10'
            }`}
          >
            {isAiSource ? '🤖 AI 智能出题' : '📦 本地出题'}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GameDispatcher
              moduleId={currentPlan.moduleId}
              gameId={currentPlan.game.id}
              difficulty={difficulty}
              questionCount={phaseConfig.questionCount}
              color={module.color}
              gameName={currentPlan.game.name}
              gameEmoji={currentPlan.game.emoji}
              questions={activeQuestions}
              onQuestionResult={handleQuestionResult}
              onFinish={handleGameFinish}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
