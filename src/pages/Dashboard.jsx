import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../contexts/StoreContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { buildSession } from '../engine/planner.js'
import { exerciseById } from '../data/exercises.js'
import { daMuscle } from '../data/da.js'
import { streakInfo, deloadSignal, muscleRecovery } from '../engine/analytics.js'
import { weekIndex, lastSessionMuscles } from '../hooks/useSessionContext.js'
import MuscleIndicator from '../components/MuscleIndicator.jsx'
import BodyMap from '../components/BodyMap.jsx'
import SettingsSheet from '../components/SettingsSheet.jsx'

const LOC = { home: 'Hjemme', summerhouse: 'Sommerhus', bodyweight: 'Kropsvægt' }
const GREET = () => { const h = new Date().getHours(); return h < 10 ? 'Godmorgen' : h < 17 ? 'God dag' : 'God aften' }

export default function Dashboard() {
  const nav = useNavigate()
  const { signOut, user } = useAuth()
  const { profile, sessions, states, saveProfile } = useStore()
  const name = profile.name || user?.displayName || (user?.email ? user.email.split('@')[0] : '')
  const [location, setLocation] = useState(profile.location)
  const [duration, setDuration] = useState(profile.defaultDuration)
  const [showSettings, setShowSettings] = useState(false)
  const [weightBias, setWeightBias] = useState(location === 'bodyweight' ? 0 : 0.6)
  const [shuffle, setShuffle] = useState(0)

  const wk = weekIndex(profile.startDate)
  const deload = useMemo(() => deloadSignal(sessions, states), [sessions, states])
  const { streak } = useMemo(() => streakInfo(sessions), [sessions])
  const recovery = useMemo(() => muscleRecovery(sessions), [sessions])
  const fatigued = Object.entries(recovery).filter(([m, v]) => m !== 'Full body' && v < 95).sort((a, b) => a[1] - b[1]).slice(0, 4)

  const session = useMemo(() => buildSession({
    location, duration, weekIndex: wk, experience: profile.experience,
    states, lastSessionMuscles: lastSessionMuscles(sessions),
    weightBias, shuffle: shuffle > 0,
  }), [location, duration, wk, profile.experience, states, sessions, weightBias, shuffle])

  const targetMuscles = useMemo(() => {
    const m = {}
    session.items.forEach((it) => { const e = exerciseById(it.exerciseId); if (e) m[e.muscles[0]] = (m[e.muscles[0]] || 0) + it.sets })
    return m
  }, [session])

  const start = () => { saveProfile({ location, defaultDuration: duration }); nav('/session/live', { state: { session } }) }
  const today = new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="app fadeIn">
      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          <div className="muted" style={{ textTransform: 'capitalize', fontSize: '.85rem' }}>{today}</div>
          <h1>{GREET()}{name ? `, ${name}` : ''} 👋</h1>
        </div>
        <button className="icon-btn" onClick={() => setShowSettings(true)} title="Indstillinger">⚙️</button>
      </div>

      {/* HERO — today's workout */}
      <div className="card hero">
        <div className="row between" style={{ position: 'relative', zIndex: 1 }}>
          <span className="pill lime">{session.phaseLabel}</span>
          {session.deload && <span className="pill warn">Deload-uge</span>}
        </div>
        <h2 style={{ marginTop: 12, position: 'relative', zIndex: 1 }}>Dagens fuldkropstræning</h2>
        <div className="row" style={{ position: 'relative', zIndex: 1, color: 'var(--muted)', fontWeight: 600, fontSize: '.9rem' }}>
          <span>🏋️ {session.items.length} øvelser</span><span>·</span><span>⏱️ ~{duration} min</span><span>·</span><span>{session.zone}</span>
        </div>
        <div style={{ position: 'relative', zIndex: 1, margin: '8px 0 4px' }}>
          <BodyMap active={targetMuscles} />
        </div>
        <button className="btn-primary btn-xl" style={{ position: 'relative', zIndex: 1 }} onClick={start}>▶  Start træning</button>
      </div>

      {/* quick controls */}
      <div className="card">
        <label>Hvor træner du i dag?</label>
        <div className="seg" style={{ marginBottom: 14 }}>
          {Object.keys(LOC).map((k) => <button key={k} className={location === k ? 'on' : ''} onClick={() => setLocation(k)}>{LOC[k]}</button>)}
        </div>
        <label>Tid til rådighed</label>
        <div className="seg" style={{ marginBottom: 16 }}>
          {[30, 60, 90].map((d) => <button key={d} className={duration === d ? 'on' : ''} onClick={() => setDuration(d)}>{d} min</button>)}
        </div>
        <div className="row between"><label style={{ margin: 0 }}>Andel med vægte</label><span className="pill cyan">{Math.round(weightBias * 100)}% vægt · {100 - Math.round(weightBias * 100)}% kropsvægt</span></div>
        <input type="range" min="0" max="100" step="10" value={Math.round(weightBias * 100)}
          onChange={(e) => setWeightBias(+e.target.value / 100)}
          style={{ width: '100%', minHeight: 0, padding: 0, accentColor: 'var(--teal)', background: 'transparent', border: 'none', marginTop: 6 }} />
      </div>

      {/* Muscle recovery (Fitbod-style freshness) */}
      <div className="card">
        <div className="row between"><h3 style={{ margin: 0 }}>Restitution</h3><span className="muted" style={{ fontSize: '.78rem' }}>friskhed pr. muskel</span></div>
        {fatigued.length === 0 ? (
          <p className="muted" style={{ margin: '10px 0 0' }}>💪 Alle muskelgrupper er friske — klar til en hård dag.</p>
        ) : (
          <div className="stack" style={{ marginTop: 10 }}>
            {fatigued.map(([m, v]) => (
              <div key={m}>
                <div className="row between" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: '.85rem', fontWeight: 600 }}>{daMuscle(m)}</span>
                  <span className="faint" style={{ fontSize: '.78rem' }}>{Math.round(v)}%</span>
                </div>
                <div style={{ height: 7, background: 'rgba(255,255,255,.08)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${v}%`, borderRadius: 99,
                    background: v < 50 ? 'var(--coral)' : v < 80 ? 'var(--gold)' : 'var(--grad)' }} />
                </div>
              </div>
            ))}
            <p className="faint" style={{ fontSize: '.76rem', margin: '2px 0 0' }}>Programmet undgår automatisk de mindst restituerede muskler i dag.</p>
          </div>
        )}
      </div>

      {deload.suggest && (
        <div className="card" style={{ borderColor: 'rgba(255,207,92,.4)' }}>
          <div className="row between"><strong>🛌 Tid til en deload</strong><span className="pill warn">Restitution</span></div>
          <p className="muted" style={{ margin: '8px 0 0' }}>{cap(deload.reasons.join('; '))}. Vælger du en deload nu, skruer programmet automatisk ned i mængde og intensitet.</p>
        </div>
      )}

      {/* program preview */}
      <div className="card">
        <div className="row between"><h3 style={{ margin: 0 }}>Programmet</h3><button className="chip" onClick={() => setShuffle((s) => s + 1)}>🔀 Bland</button></div>
        <div className="muted" style={{ fontSize: '.82rem', marginTop: 4 }}>{session.warmupMin} min opvarmning anbefales</div>
        <div className="divider" />
        <div className="stack">
          {session.items.map((it, i) => {
            const ex = exerciseById(it.exerciseId)
            return (
              <div className="row" key={it.exerciseId} style={{ gap: 12 }}>
                <div style={{ width: 30, textAlign: 'center', fontFamily: 'Sora', fontWeight: 800, color: 'var(--faint)' }}>{i + 1}</div>
                <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '4px 8px', display: 'grid', placeItems: 'center' }}><MuscleIndicator muscle={ex.muscles[0]} size={26} /></div>
                <div className="grow">
                  <div style={{ fontWeight: 650 }}>{ex.name}</div>
                  <div className="muted" style={{ fontSize: '.82rem' }}>{it.sets} × {it.detail} · {daMuscle(ex.muscles[0])}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <div className="card grow center tight"><div className="kpi grad-text">🔥 {streak}</div><div className="muted" style={{ fontSize: '.78rem' }}>dages streak</div></div>
        <div className="card grow center tight"><div className="kpi">{sessions.length}</div><div className="muted" style={{ fontSize: '.78rem' }}>træninger total</div></div>
      </div>

      <button className="btn-ghost btn-block faint" style={{ marginTop: 16 }} onClick={() => signOut()}>Log ud</button>

      {showSettings && <SettingsSheet profile={profile} onSave={(patch) => { saveProfile(patch); setShowSettings(false) }} onClose={() => setShowSettings(false)} />}
    </div>
  )
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
