// ============================================================================
// SESSION PLANNER — periodization, time budgeting, muscle distribution.
// Builds a balanced full-body session that fits 30 / 60 / 90 minutes, rotates
// emphasis so the same muscle isn't smashed two days running, and tags the
// current periodization phase + deloads.
// ============================================================================
import { REP_ZONES, MESOCYCLE, DELOAD_EVERY_WEEKS, TIMING } from './config.js'
import { exercisesForLocation, usesWeight } from '../data/exercises.js'
import { initExerciseState, progressExercise, prescription } from './progression.js'

// A balanced full-body template. Each "slot" requests a movement pattern; the
// 90-min session fills all slots, 60-min a subset, 30-min the essentials.
const SLOTS = [
  { key: 'squat',  patterns: ['squat'],              group: 'legs'  },
  { key: 'hinge',  patterns: ['hinge'],              group: 'legs'  },
  { key: 'push',   patterns: ['push'],               group: 'upper' },
  { key: 'pull',   patterns: ['pull'],               group: 'upper' },
  { key: 'lunge',  patterns: ['lunge'],              group: 'legs'  },
  { key: 'press2', patterns: ['push'],               group: 'upper' },
  { key: 'pull2',  patterns: ['pull'],               group: 'upper' },
  { key: 'arms',   patterns: ['curl', 'extension'],  group: 'arms'  },
  { key: 'delts',  patterns: ['raise'],              group: 'upper' },
  { key: 'core',   patterns: ['core', 'carry'],      group: 'core'  },
  { key: 'calves', patterns: ['calf'],               group: 'legs'  },
  { key: 'finisher', patterns: ['explosive'],        group: 'full'  },
]

// How many exercises fit each duration (warmup + sets*[work+rest] + transitions).
function timePlan(duration, zone) {
  const warmup = TIMING.warmupMin[duration] ?? 5
  const usable = duration - warmup
  const setsPer = duration === 30 ? 3 : 4
  const restMin = zone.rest / 60
  const workMin = (zone.secPerRep * ((zone.min + zone.max) / 2)) / 60
  const perExercise = setsPer * (workMin + restMin) + TIMING.transitionSec / 60
  const count = Math.max(3, Math.min(SLOTS.length, Math.floor(usable / perExercise)))
  return { count, setsPer, warmup }
}

// Which periodization phase are we in? weekIndex counts training weeks from start.
export function phaseForWeek(weekIndex) {
  if ((weekIndex + 1) % DELOAD_EVERY_WEEKS === 0) {
    return { zone: 'hyper', deload: true, label: 'Deload-uge' }
  }
  const blockWeek = weekIndex % MESOCYCLE.length
  const zoneKey = MESOCYCLE[blockWeek]
  return { zone: zoneKey, deload: false, label: REP_ZONES[zoneKey].label }
}

// Pick the best exercise for a slot, given equipment, history and recency.
// preferWeighted: +1 want a weighted exercise, -1 want bodyweight, 0 no preference.
// variety: randomness amount — bumped when the user "shuffles" the program.
function pickForSlot(slot, pool, used, recentMuscles, states, prefDifficulty, preferWeighted = 0, variety = 0.6) {
  const candidates = pool.filter(
    (e) => slot.patterns.includes(e.pattern) && !used.has(e.id)
  )
  if (!candidates.length) return null
  const score = (e) => {
    let s = 0
    // Prefer muscles NOT hammered in the last session (avoid 2 days in a row).
    if (recentMuscles[e.muscles[0]]) s -= 3
    // Prefer exercises matching the trainee's level.
    s -= Math.abs((e.diff || 2) - prefDifficulty)
    // Prefer exercises we already have progression data for (continuity).
    if (states[e.id]?.history?.length) s += 1
    // Bias toward / away from weighted work to hit the chosen weight ratio.
    if (preferWeighted) s += (usesWeight(e) ? 1 : -1) * preferWeighted * 2.2
    // Random tie-break for variety (larger when shuffling).
    s += Math.random() * variety
    return s
  }
  return candidates.sort((a, b) => score(b) - score(a))[0]
}

// MAIN ENTRY: build today's session.
// args: { location, duration, weekIndex, experience, states, lastSessionMuscles, zoneOverride }
export function buildSession({
  location = 'home',
  duration = 60,
  weekIndex = 0,
  experience = 'intermediate',
  states = {},
  lastSessionMuscles = {},
  zoneOverride = null,
  weightBias = 0.6,   // fraction of exercises that should use weights (0..1)
  shuffle = false,    // bump variety when the user re-rolls the program
}) {
  const phase = zoneOverride ? { zone: zoneOverride, deload: false, label: REP_ZONES[zoneOverride].label } : phaseForWeek(weekIndex)
  const zone = REP_ZONES[phase.zone]
  const plan = timePlan(duration, zone)
  const pool = exercisesForLocation(location)
  const prefDifficulty = experience === 'beginner' ? 1 : experience === 'advanced' ? 3 : 2
  const variety = shuffle ? 1.8 : 0.6
  const desiredWeighted = Math.round(plan.count * Math.max(0, Math.min(1, weightBias)))

  const used = new Set()
  const recent = { ...lastSessionMuscles }
  const items = []
  let weightedSoFar = 0

  // Fill slots in priority order until the time budget is spent.
  for (const slot of SLOTS) {
    if (items.length >= plan.count) break
    const remaining = plan.count - items.length
    const needWeighted = desiredWeighted - weightedSoFar
    const preferWeighted = needWeighted >= remaining ? 1 : needWeighted <= 0 ? -1 : 0
    const ex = pickForSlot(slot, pool, used, recent, states, prefDifficulty, preferWeighted, variety)
    if (!ex) continue
    if (usesWeight(ex)) weightedSoFar++
    used.add(ex.id)
    recent[ex.muscles[0]] = (recent[ex.muscles[0]] || 0) + 1

    const state = states[ex.id] || initExerciseState(ex, phase.zone)
    const rx = prescription(state, zone)
    let sets = plan.setsPer
    if (phase.deload) sets = Math.max(2, sets - 2) // deload: cut volume ~40%
    items.push({
      exerciseId: ex.id,
      slot: slot.key,
      sets,
      targetReps: rx.reps,
      repMax: rx.repMax,
      restSec: phase.deload ? Math.round(rx.rest * 1.3) : rx.rest,
      detail: rx.detail,
      targetRIR: phase.deload ? 3 : zone.rir,
      ladderRung: rx.rungLabel,
      progressionNote: state.lastNote || null,
    })
  }

  return {
    date: new Date().toISOString(),
    location,
    duration,
    phase: phase.zone,
    phaseLabel: phase.label,
    deload: phase.deload,
    zone: zone.label,
    warmupMin: plan.warmup,
    items,
  }
}

// After a session is logged, update every exercise's progression state + notes.
// logged: [{exerciseId, sets:[{reps, weight, rir}]}]
export function applySessionResults(states, logged, sessionZone) {
  const next = { ...states }
  for (const entry of logged) {
    const ex = { id: entry.exerciseId, rep: sessionZone }
    const prev = next[entry.exerciseId] || initExerciseState(ex, sessionZone)
    const { state, note } = progressExercise(prev, entry.sets, ex, sessionZone)
    state.lastNote = note
    next[entry.exerciseId] = state
  }
  return next
}
