import { buildSession, applySessionResults, phaseForWeek } from './planner.js'
let states = {}
console.log('Phases wk0-5:', [0,1,2,3,4,5].map(w=>phaseForWeek(w).label).join(', '))
for (const [w,dur] of [[0,30],[0,60],[3,90],[4,60]]) {
  const s = buildSession({location:'home', duration:dur, weekIndex:w, states})
  console.log(`\n== wk${w} ${dur}min — ${s.phaseLabel}${s.deload?' (DELOAD)':''} — ${s.items.length} øvelser ==`)
  s.items.forEach(i=>console.log(` ${i.exerciseId}: ${i.sets}x${i.detail||i.targetReps} rest${i.restSec}s RIR${i.targetRIR}`))
  // simulate maxing out to trigger progression
  const logged = s.items.map(i=>({exerciseId:i.exerciseId, sets:Array.from({length:i.sets},()=>({reps:i.repMax, weight:8, rir:1}))}))
  states = applySessionResults(states, logged, s.phase)
}
// run same exercise twice more to force a ladder advance + show the note
const s2 = buildSession({location:'home', duration:60, weekIndex:0, states})
const first = s2.items[0]
console.log('\nProgression note example:', states[first.exerciseId].lastNote)
console.log('\nSummerhouse 60min:')
buildSession({location:'summerhouse', duration:60, states:{}}).items.forEach(i=>console.log(' ', i.exerciseId))
console.log('\nBodyweight 30min:')
buildSession({location:'bodyweight', duration:30, states:{}}).items.forEach(i=>console.log(' ', i.exerciseId))
