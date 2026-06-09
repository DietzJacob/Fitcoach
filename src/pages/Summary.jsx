import { useEffect } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import BodyMap from '../components/BodyMap.jsx'
import { daMuscle } from '../data/da.js'

export default function Summary() {
  const nav = useNavigate()
  const { state } = useLocation()
  const s = state?.summary
  useEffect(() => { try { navigator.vibrate && navigator.vibrate([40, 50, 40, 50, 120]) } catch {} }, [])
  if (!s) return <Navigate to="/progress" replace />

  const vol = Math.round(s.totalVolume).toLocaleString('da-DK')
  return (
    <div className="app fadeIn" style={{ paddingTop: 32 }}>
      {/* confetti */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {Array.from({ length: 28 }).map((_, i) => (
          <span key={i} style={{
            position: 'absolute', top: '-10px', left: `${(i * 37) % 100}%`,
            width: 8, height: 12, borderRadius: 2,
            background: ['#c9fb50', '#19e3b1', '#36c6ff', '#8b6cff', '#ffcf5c'][i % 5],
            animation: `confetti ${2.4 + (i % 5) * 0.4}s ${(i % 7) * 0.12}s ease-in forwards`,
          }} />
        ))}
      </div>

      <div className="center" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 54 }}>🎉</div>
        <h1 className="grad-text" style={{ display: 'inline-block' }}>Træning fuldført!</h1>
        <p className="muted">Stærkt arbejde. Programmet er allerede justeret til næste gang.</p>
      </div>

      <div className="row" style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
        <div className="card grow center tight"><div className="kpi">{s.durationMin}</div><div className="muted" style={{ fontSize: '.74rem' }}>minutter</div></div>
        <div className="card grow center tight"><div className="kpi">{s.totalSets}</div><div className="muted" style={{ fontSize: '.74rem' }}>sæt</div></div>
        <div className="card grow center tight"><div className="kpi">{vol}</div><div className="muted" style={{ fontSize: '.74rem' }}>kg løftet</div></div>
      </div>

      {s.prs && s.prs.length > 0 && (
        <div className="card hero" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row between"><h3 style={{ margin: 0 }}>🏅 Nye personlige rekorder!</h3><span className="pill lime">{s.prs.length}</span></div>
          <div className="stack" style={{ marginTop: 10, position: 'relative', zIndex: 1 }}>
            {s.prs.map((p) => (
              <div className="row between" key={p.id}>
                <span style={{ fontWeight: 650 }}>{p.name}</span>
                <span className="pill lime">{p.weight ? `${p.weight} kg × ${p.reps}` : `${p.reps} reps`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ position: 'relative', zIndex: 1 }}>
        <h3>Muskler ramt i dag</h3>
        <BodyMap active={s.muscles} />
        <div className="row wrap" style={{ marginTop: 8 }}>
          {Object.entries(s.muscles || {}).sort((a, b) => b[1] - a[1]).map(([m, n]) => (
            <span key={m} className="tag">{daMuscle(m)} · {n} sæt</span>
          ))}
        </div>
      </div>

      <button className="btn-primary btn-xl" style={{ marginTop: 16, position: 'relative', zIndex: 1 }} onClick={() => nav('/')}>Tilbage til forsiden</button>
      <button className="btn-ghost btn-block faint" style={{ marginTop: 8, position: 'relative', zIndex: 1 }} onClick={() => nav('/progress')}>Se fremgang</button>
    </div>
  )
}
