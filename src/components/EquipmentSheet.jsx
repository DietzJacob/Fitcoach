// Bottom sheet to configure the weights you own. Used from the dashboard.
import { useState } from 'react'

const COMMON = [4, 6, 8, 10, 12, 16, 20, 24, 32, 40]

export default function EquipmentSheet({ profile, onSave, onClose }) {
  const [weights, setWeights] = useState(profile.weights || [8, 24])
  const [custom, setCustom] = useState('')
  const toggle = (w) => setWeights((s) => s.includes(w) ? s.filter((x) => x !== w) : [...s, w].sort((a, b) => a - b))
  const addCustom = () => {
    const n = parseFloat(custom.replace(',', '.'))
    if (n > 0 && !weights.includes(n)) setWeights((s) => [...s, n].sort((a, b) => a - b))
    setCustom('')
  }
  const all = [...new Set([...COMMON, ...weights])].sort((a, b) => a - b)

  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <h2>Mine vægte</h2>
        <p className="muted">Vælg de vægte du ejer. Appen foreslår kun belastninger du faktisk har.</p>
        <div className="row wrap" style={{ marginTop: 8 }}>
          {all.map((w) => (
            <button key={w} className={`chip ${weights.includes(w) ? 'on' : ''}`} style={{ minWidth: 64, justifyContent: 'center' }} onClick={() => toggle(w)}>{w} kg</button>
          ))}
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <input placeholder="Egen vægt, fx 14" inputMode="decimal" value={custom} onChange={(e) => setCustom(e.target.value)} />
          <button className="btn-soft" onClick={addCustom}>Tilføj</button>
        </div>
        <button className="btn-primary btn-lg" style={{ marginTop: 18 }} onClick={() => onSave(weights)}>Gem</button>
      </div>
    </>
  )
}
