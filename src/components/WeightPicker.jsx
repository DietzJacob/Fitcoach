// Weight picker: quick-select the weights you own, fine-tune ±, and see the
// load as a % of your estimated max for this exercise (intensity readout).
import { estimatePR } from '../engine/analytics.js'

// Intensity % = current set's estimated 1RM vs. your best estimated 1RM.
function intensityPct(weight, reps, estMax) {
  if (!estMax || !weight) return null
  const e1rm = estimatePR(weight, reps)
  return Math.round((e1rm / estMax) * 100)
}

export default function WeightPicker({ weight, reps, onChange, owned = [8, 24], estMax }) {
  const pct = intensityPct(weight, reps, estMax)
  const zone = pct == null ? null : pct >= 90 ? ['Tungt', 'coral'] : pct >= 75 ? ['Moderat-tungt', 'warn'] : ['Moderat', 'cyan']
  const chips = [0, ...owned.filter((w) => w > 0)]

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row between">
        <label style={{ margin: 0 }}>Vægt</label>
        {pct != null && (
          <span className={`pill ${zone[1]}`}>{pct}% · {zone[0]}</span>
        )}
      </div>
      <div className="row wrap" style={{ gap: 8 }}>
        {chips.map((w) => (
          <button key={w} className={`chip ${weight === w ? 'on' : ''}`} style={{ minWidth: 64, justifyContent: 'center' }}
            onClick={() => onChange(w)}>{w === 0 ? 'Kropsvægt' : `${w} kg`}</button>
        ))}
      </div>
      <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
        <button onClick={() => onChange(Math.max(0, weight - 1))} aria-label="mindre">−1</button>
        <div className="display" style={{ minWidth: 120, textAlign: 'center' }}>{weight || 0}<span style={{ fontSize: '1rem', color: 'var(--muted)' }}> kg</span></div>
        <button onClick={() => onChange(weight + 1)} aria-label="mere">+1</button>
      </div>
    </div>
  )
}
