import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useProgressStore } from '../stores/useProgressStore'
import { useAbilityStore } from '../stores/useAbilityStore'
import { useQuestionBankStore } from '../stores/useQuestionBankStore'
import { DIFFICULTY_LEVELS } from '../data/config'
import { playClick } from '../utils/audio'
import { testConnection } from '../services/ai-service'

// A big friendly toggle switch.
function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => { playClick(); onChange(!on) }}
      className={`w-16 h-9 rounded-full relative transition-colors ${on ? 'bg-leaf' : 'bg-ink/20'}`}
    >
      <motion.span
        className="absolute top-1 w-7 h-7 rounded-full bg-white shadow"
        animate={{ left: on ? 32 : 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      />
    </button>
  )
}

function Row({ emoji, title, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-ink/10 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-3xl shrink-0">{emoji}</span>
        <div className="min-w-0">
          <p className="font-bold text-ink text-lg">{title}</p>
          {desc && <p className="text-ink-soft text-sm truncate">{desc}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// Shows how many AI-generated questions have been saved locally, with a clear button.
function QuestionBankRow() {
  const bank = useQuestionBankStore((st) => st.bank)
  const clearBank = useQuestionBankStore((st) => st.clearBank)
  const [confirming, setConfirming] = useState(false)

  // Compute per-level counts and total from bank (stable reference — only changes when bank changes).
  const { byLevel, total } = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0 }
    let t = 0
    for (const buckets of Object.values(bank || {})) {
      if (!buckets || typeof buckets !== 'object') continue
      for (const [lvl, arr] of Object.entries(buckets)) {
        const len = Array.isArray(arr) ? arr.length : 0
        counts[lvl] = (counts[lvl] || 0) + len
        t += len
      }
    }
    return { byLevel: counts, total: t }
  }, [bank])

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">📚</span>
        <div>
          <p className="font-bold text-ink text-lg">本地题库</p>
          <p className="text-ink-soft text-sm">
            AI 出过的题会自动存进来，断网时也能复用 · 共{' '}
            <span className="font-display text-grape-deep">{total}</span> 题
          </p>
          {total > 0 && (
            <p className="text-ink-soft/70 text-xs mt-0.5">
              🌱简单 {byLevel[1] || 0} · 🌼进阶 {byLevel[2] || 0} · 🌳挑战 {byLevel[3] || 0}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <ImportBankButton />
        {total > 0 &&
          (!confirming ? (
            <button
              type="button"
              onClick={() => { playClick(); setConfirming(true) }}
              className="btn-chunky bg-ink/10 text-ink px-4 py-2 text-sm"
            >
              清空
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { playClick(); clearBank(); setConfirming(false) }}
                className="btn-chunky bg-coral text-white px-3 py-2 text-sm"
              >
                确定
              </button>
              <button
                type="button"
                onClick={() => { playClick(); setConfirming(false) }}
                className="btn-chunky bg-ink/10 text-ink px-3 py-2 text-sm"
              >
                取消
              </button>
            </>
          ))}
      </div>
    </div>
  )
}

// File-import button for batch-generated question bank JSON.
function ImportBankButton() {
  const importBank = useQuestionBankStore((st) => st.importBank)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const doImport = (bankData) => {
    if (!bankData || typeof bankData !== 'object' || Array.isArray(bankData)) {
      setStatus({ ok: false, msg: '文件格式不对' })
      setTimeout(() => setStatus(null), 4000)
      return
    }
    try {
      importBank(bankData)
      setStatus({ ok: true, msg: '导入成功！' })
    } catch (err) {
      console.error('Import error:', err)
      const msg = err?.message?.includes('quota') || err?.message?.includes('Quota')
        ? '存储空间不足，请先清空再导入'
        : '导入失败：' + (err?.message || '未知错误')
      setStatus({ ok: false, msg })
    }
    setTimeout(() => setStatus(null), 5000)
  }

  // One-click load from bundled JSON (no file picker needed)
  const handleQuickLoad = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const resp = await fetch('/question-bank-local.json')
      if (!resp.ok) throw new Error('文件不存在')
      const data = await resp.json()
      const bankData = data.bank || data
      doImport(bankData)
    } catch (err) {
      console.error('Quick load error:', err)
      setStatus({ ok: false, msg: '加载失败：' + (err?.message || '网络错误') })
      setTimeout(() => setStatus(null), 4000)
    }
    setLoading(false)
  }

  // File picker import
  const handleFileImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          doImport(data.bank || data)
        } catch (err) {
          console.error('File import error:', err)
          setStatus({ ok: false, msg: '文件解析失败' })
          setTimeout(() => setStatus(null), 4000)
        }
      }
      reader.onerror = () => {
        setStatus({ ok: false, msg: '文件读取失败' })
        setTimeout(() => setStatus(null), 4000)
      }
      reader.readAsText(file, 'UTF-8')
    }
    input.click()
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => { playClick(); handleQuickLoad() }}
        disabled={loading}
        className="btn-chunky bg-leaf/15 text-leaf-deep border-2 border-leaf/30 px-3 py-2 text-sm disabled:opacity-50"
      >
        {loading ? '⏳ 加载中...' : '⚡ 一键加载'}
      </button>
      <button
        type="button"
        onClick={() => { playClick(); handleFileImport() }}
        className="btn-chunky bg-grape/15 text-grape-deep border-2 border-grape/30 px-3 py-2 text-sm"
      >
        📥 导入文件
      </button>
      {status && (
        <span className={`text-xs font-bold ${status.ok ? 'text-leaf-deep' : 'text-coral-deep'}`}>
          {status.ok ? '✓' : '✗'} {status.msg}
        </span>
      )}
    </div>
  )
}

export default function Settings() {
  const s = useSettingsStore()
  const resetAll = useProgressStore((st) => st.resetAll)
  const resetAbility = useAbilityStore((st) => st.resetAbility)
  const [confirmReset, setConfirmReset] = useState(false)
  const [testState, setTestState] = useState(null) // {status:'loading'|'ok'|'fail', message}

  const handleTest = async () => {
    playClick()
    setTestState({ status: 'loading' })
    const result = await testConnection({
      apiBaseUrl: s.apiBaseUrl,
      apiKey: s.apiKey,
      modelName: s.modelName,
    })
    setTestState(result.ok ? { status: 'ok', message: result.message } : { status: 'fail', message: result.error })
  }

  return (
    <div className="min-h-full pb-16">
      <header className="bg-gradient-to-br from-grape to-grape-deep px-6 pt-8 pb-14 rounded-b-[3rem] relative overflow-hidden">
        <span className="absolute top-6 right-10 text-4xl animate-float">⚙️</span>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.2)]">设置</h1>
            <p className="text-white/90 font-bold mt-1">家长可以在这里调整</p>
          </div>
          <Link to="/" onClick={() => playClick()} className="btn-chunky bg-white/90 text-ink px-5 py-2 text-lg">
            ← 回首页
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 -mt-6">
        <div className="card-sticker p-6">
          <Row emoji="🔊" title="音效" desc="答对答错的提示音">
            <Toggle on={s.soundEnabled} onChange={s.setSound} />
          </Row>

          <Row emoji="🗣️" title="语音朗读" desc="把题目读给小朋友听">
            <Toggle on={s.speechEnabled} onChange={s.setSpeech} />
          </Row>

          <Row emoji="🌱" title="难度级别" desc="也可以由系统自动调节">
            <div className="flex gap-2">
              {DIFFICULTY_LEVELS.map((d) => (
                <button
                  key={d.level}
                  type="button"
                  onClick={() => { playClick(); s.setDifficulty(d.level) }}
                  className={`btn-chunky px-3 py-2 text-base whitespace-nowrap ${
                    s.difficulty === d.level ? 'bg-leaf text-white' : 'bg-white text-ink border-2 border-ink/10'
                  }`}
                >
                  {d.emoji} {d.name}
                </button>
              ))}
            </div>
          </Row>

          <Row emoji="⏰" title="训练时长" desc="每次训练大约多久">
            <div className="flex gap-2">
              {[15, 20].map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => { playClick(); s.setSessionMinutes(min) }}
                  className={`btn-chunky px-4 py-2 text-lg ${
                    s.sessionMinutes === min ? 'bg-sky text-white' : 'bg-white text-ink border-2 border-ink/10'
                  }`}
                >
                  {min} 分钟
                </button>
              ))}
            </div>
          </Row>
        </div>

        {/* AI adaptive question generation */}
        <div className="card-sticker p-6 mt-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">🤖</span>
            <div>
              <p className="font-bold text-ink text-lg">AI 智能出题</p>
              <p className="text-ink-soft text-sm">根据孩子能力自动生成个性化题目</p>
            </div>
            <div className="ml-auto">
              <Toggle on={s.aiEnabled} onChange={s.setAiEnabled} />
            </div>
          </div>

          {s.aiEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-4 mt-4">
                <label className="flex flex-col gap-1">
                  <span className="text-ink-soft text-sm font-bold">API 地址</span>
                  <input
                    type="text"
                    value={s.apiBaseUrl}
                    onChange={(e) => s.setApiBaseUrl(e.target.value)}
                    placeholder="https://api.deepseek.com/v1"
                    className="rounded-xl border-2 border-ink/15 px-4 py-2.5 text-ink bg-white focus:border-sky focus:outline-none"
                  />
                  <span className="text-ink-soft/70 text-xs">末尾的 /v1 不能省略（填了 https://api.deepseek.com 系统会自动补上）</span>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-ink-soft text-sm font-bold">API Key</span>
                  <input
                    type="password"
                    value={s.apiKey}
                    onChange={(e) => s.setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="rounded-xl border-2 border-ink/15 px-4 py-2.5 text-ink bg-white focus:border-sky focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-ink-soft text-sm font-bold">模型名称</span>
                  <input
                    type="text"
                    value={s.modelName}
                    onChange={(e) => s.setModelName(e.target.value)}
                    placeholder="deepseek-v4-flash"
                    className="rounded-xl border-2 border-ink/15 px-4 py-2.5 text-ink bg-white focus:border-sky focus:outline-none"
                  />
                  <span className="text-ink-soft/70 text-xs">DeepSeek 可选：deepseek-v4-flash（快速）、deepseek-v4-pro（更强）。注意大小写！</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={testState?.status === 'loading'}
                    className="btn-chunky bg-grape text-white px-5 py-2 disabled:opacity-60"
                  >
                    {testState?.status === 'loading' ? '测试中...' : '测试连接'}
                  </button>
                  {testState?.status === 'ok' && (
                    <span className="text-leaf-deep font-bold text-sm">✓ {testState.message}</span>
                  )}
                  {testState?.status === 'fail' && (
                    <span className="text-coral-deep font-bold text-sm">✗ {testState.message}</span>
                  )}
                </div>

                <p className="text-ink-soft text-xs leading-relaxed bg-ink/5 rounded-xl px-3 py-2">
                  填入 API Key 后，系统会根据孩子的能力自动生成个性化题目，并智能安排每日训练重点。
                  未填入或网络不可用时，自动使用本地出题，不影响使用。API Key 仅保存在本机浏览器，仅供家庭使用，请勿分享。
                </p>
              </div>
            </motion.div>
          )}

          <div className="mt-4 pt-4 border-t border-ink/10">
            <QuestionBankRow />
          </div>
        </div>

        <div className="card-sticker p-6 mt-6">
          <Row emoji="🗑️" title="清空所有记录" desc="星星、徽章、日历全部重新开始">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => { playClick(); setConfirmReset(true) }}
                className="btn-chunky bg-coral/15 text-coral-deep border-2 border-coral/40 px-4 py-2"
              >
                清空记录
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { playClick(); resetAll(); resetAbility(); setConfirmReset(false) }}
                  className="btn-chunky bg-coral text-white px-4 py-2"
                >
                  确定清空
                </button>
                <button
                  type="button"
                  onClick={() => { playClick(); setConfirmReset(false) }}
                  className="btn-chunky bg-ink/10 text-ink px-4 py-2"
                >
                  取消
                </button>
              </div>
            )}
          </Row>
        </div>

        <p className="text-center text-ink-soft text-sm mt-6">
          数学小天才 · 让数学变成好玩的游戏 🎈
        </p>
      </main>
    </div>
  )
}
