import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext, PointerSensor, TouchSensor, useSensor, useSensors, closestCenter,
  useDraggable, useDroppable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { playClick, playCelebrate } from '../../utils/audio'
import { pick, shuffle } from '../../utils/helpers'

const PUZZLES_3 = [
  { problem: '5 + 3 = ？', steps: ['想：5 和 3 合起来', '列式：5 + 3', '算出：5 + 3 = 8'] },
  { problem: '有 8 颗糖，吃了 3 颗，还剩几颗？', steps: ['想：吃掉要用减法', '列式：8 - 3', '算出：8 - 3 = 5'] },
  { problem: '小明 6 岁，爸爸比他大 20 岁，爸爸几岁？', steps: ['想：爸爸更大用加法', '列式：6 + 20', '算出：6 + 20 = 26'] },
  { problem: '9 + 4 = ？', steps: ['想：9 再加 1 凑成 10', '把 4 分成 1 和 3', '算出：10 + 3 = 13'] },
]
const PUZZLES_4 = [
  { problem: '小明有 5 颗糖，又买了 3 颗，一共有几颗？', steps: ['看已知：有 5 颗，又买 3 颗', '想一想：合起来用加法', '列算式：5 + 3', '算结果：5 + 3 = 8'] },
  { problem: '盘里有 9 块饼，吃了 4 块，还剩几块？', steps: ['看已知：有 9 块，吃了 4 块', '想一想：吃掉用减法', '列算式：9 - 4', '算结果：9 - 4 = 5'] },
  { problem: '车上 6 人，下去 2 人，又上来 3 人，现在几人？', steps: ['先看：车上有 6 人', '下去 2 人：6 - 2 = 4', '上来 3 人：4 + 3 = 7', '现在有 7 人'] },
  { problem: '小红有 7 朵花，小明比她多 2 朵，小明有几朵？', steps: ['看已知：小红有 7 朵', '小明比她多 2 朵', '用加法：7 + 2', '小明有 9 朵'] },
]

// Build a shuffled puzzle (guaranteed not already in correct order).
function buildPuzzle(puzzle, uid) {
  const items = puzzle.steps.map((text, i) => ({ key: `${uid}-${i}`, text, correctIndex: i }))
  let shuffled = shuffle(items)
  let guard = 0
  while (shuffled.every((it, i) => it.correctIndex === i) && guard < 10) {
    shuffled = shuffle(items)
    guard++
  }
  return { problem: puzzle.problem, items: shuffled }
}

function StepCard({ item, index, solved }) {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: item.key,
    disabled: solved,
  })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: item.key, disabled: solved })
  const setNodeRef = useCallback((node) => { setDragRef(node); setDropRef(node) }, [setDragRef, setDropRef])

  const style = { transform: CSS.Translate.toString(transform) }
  const placed = solved || item.correctIndex === index

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 rounded-2xl border-2 p-3 select-none touch-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-10 shadow-lg' : ''
      } ${solved ? 'border-leaf bg-leaf/15' : isOver ? 'border-sky bg-sky/15' : 'border-ink/10 bg-white'}`}
    >
      <span className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-white shrink-0 ${placed ? 'bg-leaf' : 'bg-grape'}`}>
        {index + 1}
      </span>
      <span className="text-lg text-ink flex-1">{item.text}</span>
      <span className="text-2xl opacity-40">⠿</span>
    </motion.div>
  )
}

export default function StepOrderGame({ difficulty, questionCount, onFinish }) {
  const puzzles = useMemo(() => {
    const pool = difficulty === 1 ? PUZZLES_3 : PUZZLES_4
    return Array.from({ length: questionCount }, (_, i) => buildPuzzle(pick(pool), i))
  }, [difficulty, questionCount])

  const [idx, setIdx] = useState(0)
  const [order, setOrder] = useState(puzzles[0].items)
  const [solved, setSolved] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 80, tolerance: 6 } }),
  )

  const current = puzzles[idx]

  // Auto-check the order whenever it changes.
  useEffect(() => {
    if (solved) return
    if (order.every((it, i) => it.correctIndex === i)) {
      setSolved(true)
      setCorrectCount((c) => c + 1)
      playCelebrate()
      setTimeout(() => {
        if (idx + 1 < puzzles.length) {
          setIdx((n) => n + 1)
          setOrder(puzzles[idx + 1].items)
          setSolved(false)
        } else {
          const total = puzzles.length
          const stars = correctCount + 1 >= total ? 3 : correctCount + 1 >= total / 2 ? 2 : 1
          onFinish && onFinish({ correct: correctCount + 1, answered: total, stars })
        }
      }, 1100)
    }
  }, [order, solved, idx, puzzles, correctCount, onFinish])

  const handleDragEnd = (e) => {
    const { active, over } = e
    if (!over || active.id === over.id || solved) return
    playClick()
    setOrder((prev) => {
      const oldIndex = prev.findIndex((s) => s.key === active.id)
      const newIndex = prev.findIndex((s) => s.key === over.id)
      if (oldIndex < 0 || newIndex < 0) return prev
      const next = [...prev]
      ;[next[oldIndex], next[newIndex]] = [next[newIndex], next[oldIndex]]
      return next
    })
  }

  // Tap-to-swap fallback: pick first, then second to swap.
  const [pickedKey, setPickedKey] = useState(null)
  const handleTap = (key) => {
    if (solved) return
    if (!pickedKey) { setPickedKey(key); return }
    if (pickedKey === key) { setPickedKey(null); return }
    playClick()
    setOrder((prev) => {
      const a = prev.findIndex((s) => s.key === pickedKey)
      const b = prev.findIndex((s) => s.key === key)
      const next = [...prev]
      ;[next[a], next[b]] = [next[b], next[a]]
      return next
    })
    setPickedKey(null)
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-5">
      <div className="card-sticker p-5 w-full text-center">
        <p className="text-ink-soft text-sm">第 {idx + 1} / {puzzles.length} 题</p>
        <p className="font-display text-2xl text-ink mt-1">{current.problem}</p>
        <p className="text-ink-soft text-sm mt-2">把解题步骤拖一拖（或点两个换位置），排成正确顺序！</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="w-full flex flex-col gap-3">
          {order.map((item, i) => (
            <div key={item.key} onClick={() => handleTap(item.key)} className={pickedKey === item.key ? 'ring-4 ring-sky rounded-2xl' : ''}>
              <StepCard item={item} index={i} solved={solved} />
            </div>
          ))}
        </div>
      </DndContext>

      {solved && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="font-display text-3xl text-leaf-deep">
          🎉 顺序排对啦！
        </motion.p>
      )}
    </div>
  )
}
