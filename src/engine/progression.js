// ============================================================================
// PER-EXERCISE PROGRESSION STATE MACHINE
// Implements progressive overload with autoregulation, designed around the fact
// that we only own two fixed loads (8 kg, 24 kg). When weight cannot go up, we
// climb a ladder of harder stimuli instead, and explain every change in plain Danish.
// ============================================================================
import { REP_ZONES, LADDER, LADDER_LABEL } from './config.js'

// A fresh state for an exercise the trainee has never done.
export function initExerciseState(exercise, zoneKey = exercise.rep || 'hyper') {
  const zone = REP_ZONES[zoneKey] || REP_ZONES.hyper
  return {
    id: exercise.id,
    zone: zoneKey,
    targetReps: zone.min,   // start at the bottom of the range
    rung: 0,                // index into LADDER of mechanical difficulty
    tempo: 2,               // seconds of controlled eccentric
    pauseSec: 0,
    deficit: false,
    rest: zone.rest,
    consecutiveHits: 0,     // sessions in a row at top-of-range with low RIR
    history: [],            // [{date, sets:[{reps, rir}], topSet}]
  }
}

// Average RIR across the working sets the user actually logged.
const avgRIR = (sets) => {
  const r = sets.filter((s) => s.rir != null).map((s) => s.rir)
  return r.length ? r.reduce((a, b) => a + b, 0) / r.length : null
}
const maxReps = (sets) => Math.max(0, ...sets.map((s) => s.reps || 0))

// Decide the prescription for the NEXT time this exercise comes up, given how the
// last session went. Returns { state, note } — note explains the "why".
export function progressExercise(state, lastSets, exercise, zoneKey) {
  const zone = REP_ZONES[zoneKey || state.zone] || REP_ZONES.hyper
  const next = { ...state, zone: zoneKey || state.zone }
  next.history = [...(state.history || [])].slice(-19)

  const top = maxReps(lastSets)
  const rir = avgRIR(lastSets)
  next.history.push({ date: Date.now(), top, rir, zone: next.zone })

  // --- AUTOREGULATION ---------------------------------------------------------
  // Too hard (grinding, RIR 0 and missing the bottom of the range): back off.
  if (rir != null && rir < 0.5 && top < zone.min) {
    next.targetReps = Math.max(zone.min, top)
    next.consecutiveHits = 0
    return { state: next, note: `Det så hårdt ud sidst (RIR ~0). Vi holder belastningen og sigter efter ${next.targetReps} solide reps i dag.` }
  }

  // Hit the top of the range with low reserve? Count it as a qualifying session.
  const hitTop = top >= zone.max && rir != null && rir <= zone.rir
  if (hitTop) {
    next.consecutiveHits = (state.consecutiveHits || 0) + 1
  } else if (top >= zone.min) {
    // Solid work but not yet at the ceiling — push reps toward the top.
    next.consecutiveHits = 0
    next.targetReps = Math.min(zone.max, Math.max(next.targetReps, top + 1))
    return { state: next, note: `Godt arbejde. Sigt efter ${next.targetReps} reps i dag — vi bygger reps op mod toppen af intervallet (${zone.min}-${zone.max}).` }
  }

  // --- PROGRESSIVE OVERLOAD: need 2 qualifying sessions in a row to advance ----
  if (next.consecutiveHits >= 2) {
    next.consecutiveHits = 0
    return advanceLadder(next, zone, exercise)
  }

  if (hitTop) {
    return { state: next, note: `Stærkt sæt — ${top} reps med RIR ${rir?.toFixed(0)}. Rammer du toppen igen næste gang, gør vi øvelsen sværere.` }
  }
  // Default: keep target where it is.
  next.targetReps = next.targetReps || zone.min
  return { state: next, note: `Sigt efter ${next.targetReps}-${zone.max} reps og hold 1-2 reps i tanken.` }
}

// Climb one rung of the difficulty ladder. Because we can't add kilos, this is how
// we keep making the exercise harder over time.
function advanceLadder(state, zone, exercise) {
  // Rung 0 = still building reps: once at the top, jump to the first real rung.
  const rung = LADDER[Math.min(state.rung + 1, LADDER.length - 1)]
  const next = { ...state, rung: Math.min(state.rung + 1, LADDER.length - 1) }
  // Apply the new rung's effect and reset reps to the bottom so there is room to grow.
  next.targetReps = zone.min
  let why
  switch (rung) {
    case 'tempo':
      next.tempo = Math.min(5, (state.tempo || 2) + 2)
      why = `Du toppede ${zone.max} reps to gange med lav RIR. Vægten kan ikke øges, så vi sænker tempoet til ${next.tempo}s negativ — mere tid under spænding gør hver rep hårdere.`
      break
    case 'pause':
      next.pauseSec = (state.pauseSec || 0) + 2
      why = `Næste skridt i overload: ${next.pauseSec}s pause i den hårdeste position. Det fjerner momentum og øger kravet uden mere vægt.`
      break
    case 'rom':
      next.deficit = true
      why = `Vi øger range of motion (deficit/dybere). Større bevægebane = mere muskelarbejde ved samme vægt.`
      break
    case 'density':
      next.rest = Math.max(30, (state.rest || zone.rest) - 20)
      why = `Vi strammer pauserne til ${next.rest}s (density). Samme arbejde på kortere tid = højere intensitet.`
      break
    case 'unilateral':
      why = `Tid til unilateralt arbejde — ét lem ad gangen fordobler reelt belastningen pr. side.`
      break
    case 'variation':
      why = `Du har mestret denne version. Skift til en sværere variant for ny stimulus (se forslag).`
      break
    default:
      next.targetReps = Math.min(zone.max, zone.min + 2)
      why = `Vi bygger reps op mod ${zone.max}.`
  }
  return { state: next, note: why }
}

// Build the concrete prescription string shown in the session UI.
export function prescription(state, zone) {
  const z = zone || REP_ZONES[state.zone] || REP_ZONES.hyper
  // Clamp the carried-over target into the CURRENT zone (phase changes can shift
  // the range, e.g. moving from hypertrophy 8-12 into endurance 15-22).
  const reps = Math.min(z.max, Math.max(z.min, state.targetReps || z.min))
  const parts = []
  parts.push(`${reps}-${z.max} reps`)
  if (state.tempo > 2) parts.push(`${state.tempo}s negativ`)
  if (state.pauseSec) parts.push(`${state.pauseSec}s pause`)
  if (state.deficit) parts.push('fuld ROM/deficit')
  return { reps, repMax: z.max, rest: state.rest || z.rest, detail: parts.join(' · '), rung: LADDER[state.rung], rungLabel: LADDER_LABEL[LADDER[state.rung]] }
}
