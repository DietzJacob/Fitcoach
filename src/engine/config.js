// Training configuration shared across the engine.

// Rep zones with sensible rest + target RIR (reps-in-reserve).
export const REP_ZONES = {
  strength: { key: 'strength', label: 'Styrke',     min: 4,  max: 6,  rest: 150, rir: 2, secPerRep: 4 },
  hyper:    { key: 'hyper',    label: 'Hypertrofi', min: 8,  max: 12, rest: 90,  rir: 1, secPerRep: 3 },
  endur:    { key: 'endur',    label: 'Udholdenhed',min: 15, max: 22, rest: 45,  rir: 1, secPerRep: 2.5 },
}

// 4-week undulating mesocycle, then a deload. Each session in a week can rotate
// emphasis, but the dominant zone follows this map.
export const MESOCYCLE = ['hyper', 'strength', 'hyper', 'endur'] // week 1..4 within block
export const DELOAD_EVERY_WEEKS = 5 // every 5th week is a planned deload

// How long different things take, used to fit a session to 30/60/90 minutes.
export const TIMING = {
  warmupMin: { 30: 4, 60: 6, 90: 8 },
  transitionSec: 20,    // moving between exercises / setup per set
}

// The progression ladder. When weight cannot increase (we only own 8 kg & 24 kg),
// we climb these rungs instead. Order = increasing difficulty of the same load.
export const LADDER = [
  'reps',        // 1. add reps toward the top of the range (double progression)
  'tempo',       // 2. slow the eccentric (e.g. 4s down) — more time under tension
  'pause',       // 3. add a pause in the hardest position
  'rom',         // 4. increase range of motion (deficit / deeper)
  'density',     // 5. shorten rest between sets
  'unilateral',  // 6. shift toward single-limb work
  'variation',   // 7. progress to a harder exercise variant
]

export const LADDER_LABEL = {
  reps: 'flere reps', tempo: 'langsommere tempo (3-4s negativ)', pause: 'pause-reps',
  rom: 'større range of motion', density: 'kortere pauser (density)',
  unilateral: 'unilateralt (ét lem ad gangen)', variation: 'sværere variant',
}
