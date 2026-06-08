// Derives the inputs the engine needs from stored data.
import { exerciseById } from '../data/exercises.js'

export function weekIndex(startDate) {
  if (!startDate) return 0
  const ms = Date.now() - new Date(startDate).getTime()
  return Math.max(0, Math.floor(ms / (7 * 24 * 3600 * 1000)))
}

export function lastSessionMuscles(sessions) {
  const last = sessions[sessions.length - 1]
  if (!last) return {}
  const m = {}
  for (const it of last.items || []) {
    const ex = exerciseById(it.exerciseId)
    if (ex) m[ex.muscles[0]] = (m[ex.muscles[0]] || 0) + 1
  }
  return m
}
