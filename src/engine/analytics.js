// ============================================================================
// VOLUME, PRs, STREAKS, DELOAD SIGNALS — the "coach memory" analytics layer.
// ============================================================================
import { exerciseById } from '../data/exercises.js'

// Weekly working-set volume per primary muscle (sets are the currency for hypertrophy).
export function weeklyVolume(sessions, since = weekAgo(1)) {
  const vol = {}
  for (const s of sessions) {
    if (new Date(s.date) < since) continue
    for (const it of s.items || []) {
      const ex = exerciseById(it.exerciseId)
      if (!ex) continue
      const sets = (it.logged || it.sets || []).length || it.sets || 0
      const m = ex.muscles[0]
      vol[m] = (vol[m] || 0) + (typeof sets === 'number' ? sets : 0)
    }
  }
  return vol
}

// Evidence-based weekly set landmarks per muscle (MEV..MAV-ish).
export const VOLUME_TARGET = { min: 8, max: 18 }

// Estimated 1-rep-equivalent / best set for PR tracking (Epley, capped).
export function estimatePR(weightKg, reps) {
  if (!weightKg) return reps          // bodyweight: PR = most reps
  return Math.round(weightKg * (1 + Math.min(reps, 20) / 30))
}

export function personalRecords(sessions) {
  const pr = {}
  for (const s of sessions) {
    for (const it of s.items || []) {
      for (const set of it.logged || []) {
        const score = estimatePR(set.weight || 0, set.reps || 0)
        const cur = pr[it.exerciseId]
        if (!cur || score > cur.score) {
          pr[it.exerciseId] = { score, weight: set.weight || 0, reps: set.reps || 0, date: s.date }
        }
      }
    }
  }
  return pr
}

// Training streak (consecutive days with at least one session) + calendar set.
export function streakInfo(sessions) {
  const days = new Set(sessions.map((s) => new Date(s.date).toDateString()))
  let streak = 0
  const d = new Date()
  // allow today or yesterday to keep the streak alive
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1)
  while (days.has(d.toDateString())) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return { streak, days }
}

// Deload suggestion: high accumulated volume, OR stagnation (no progression
// across recent sessions), OR rising RIR-effort with falling reps.
export function deloadSignal(sessions, states) {
  const last2w = sessions.filter((s) => new Date(s.date) >= weekAgo(2))
  const vol = weeklyVolume(sessions, weekAgo(1))
  const overreached = Object.values(vol).filter((v) => v > VOLUME_TARGET.max).length >= 3
  // Stagnation: many exercises stuck (consecutiveHits never advancing, flat reps).
  const stuck = Object.values(states || {}).filter((st) => {
    const h = (st.history || []).slice(-3)
    return h.length === 3 && new Set(h.map((x) => x.top)).size === 1
  }).length
  const reasons = []
  if (overreached) reasons.push('flere muskelgrupper er over det ugentlige sæt-loft')
  if (stuck >= 3) reasons.push('flere øvelser er stagneret (samme reps 3 gange)')
  if (last2w.length >= 10) reasons.push('høj akkumuleret træningsmængde de sidste 2 uger')
  return { suggest: reasons.length > 0, reasons }
}

function weekAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - 7 * n)
  return d
}
