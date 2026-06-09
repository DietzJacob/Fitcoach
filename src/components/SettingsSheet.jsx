// Settings: edit profile (name, goal, experience, days, default duration) and
// the weights you own. Saves a single patch object.
import { useState } from 'react'

const COMMON = [4, 6, 8, 10, 12, 16, 20, 24, 32, 40]
const GOALS = [['both', 'Muskler + lean'], ['muscle', 'Muskelmasse'], ['lean', 'Lean']]
const EXP = [['beginner', 'Nybegynder'], ['intermediate', 'Øvet'], ['advanced', 'Erfaren']]

export default function SettingsSheet({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile.name || '')
  const [goal, setGoal] = useState(profile.goal || 'both')
  const [experience, setExperience] = useState(profile.experience || 'intermediate')
  const [daysPerWeek, setDays] = useState(profile.daysPerWeek || 4)
  const [defaultDuration, setDur] = useState(profile.defaultDuration || 60)
  const [weights, setWeights] = useState(profile.weights || [8, 24])
  const [custom, setCustom] = useState('')

  const toggle = (w) => setWeights((s) => s.includes(w) ? s.filter((x) => x !== w) : [...s, w].sort((a, b) => a - b))
  const addCustom = () => { const n = parseFloat(custom.replace(',', '.')); if (n > 0 && !weights.includes(n)) setWeights((s) => [...s, n].sort((a, b) => a - b)); setCustom('') }
  const all = [...new Set([...COMMON, ...weights])].sort((a, b) => a - b)

  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <h2>Indstillinger</h2>

        <label style={{ marginTop: 6 }}>Navn</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dit navn" />

        <label style={{ marginTop: 14 }}>Mål</label>
        <div className="seg">{GOALS.map(([v, l]) => <button key={v} className={goal === v ? 'on' : ''} onClick={() => setGoal(v)}>{l}</button>)}</div>

        <label style={{ marginTop: 14 }}>Erfaring</label>
        <div className="seg">{EXP.map(([v, l]) => <button key={v} className={experience === v ? 'on' : ''} onClick={() => setExperience(v)}>{l}</button>)}</div>

        <div className="row" style={{ marginTop: 14, gap: 14 }}>
          <div className="grow">
            <label>Dage/uge</label>
            <div className="seg">{[3, 4, 5, 6].map((d) => <button key={d} className={daysPerWeek === d ? 'on' : ''} onClick={() => setDays(d)}>{d}</button>)}</div>
          </div>
        </div>
        <label style={{ marginTop: 14 }}>Standard-tid</label>
        <div className="seg">{[30, 60, 90].map((d) => <button key={d} className={defaultDuration === d ? 'on' : ''} onClick={() => setDur(d)}>{d} min</button>)}</div>

        <label style={{ marginTop: 16 }}>Mine vægte (kg)</label>
        <div className="row wrap">
          {all.map((w) => <button key={w} className={`chip ${weights.includes(w) ? 'on' : ''}`} style={{ minWidth: 60, justifyContent: 'center' }} onClick={() => toggle(w)}>{w}</button>)}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <input placeholder="Egen vægt, fx 14" inputMode="decimal" value={custom} onChange={(e) => setCustom(e.target.value)} />
          <button className="btn-soft" onClick={addCustom}>Tilføj</button>
        </div>

        <button className="btn-primary btn-lg" style={{ marginTop: 18 }}
          onClick={() => onSave({ name: name.trim(), goal, experience, daysPerWeek, defaultDuration, weights: weights.length ? weights : [8, 24] })}>
          Gem
        </button>
      </div>
    </>
  )
}
