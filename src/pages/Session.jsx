import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../contexts/StoreContext.jsx'
import { buildSession } from '../engine/planner.js'
import { exerciseById, EQUIP_LABEL, suggestLoad, usesWeight, alternativesFor } from '../data/exercises.js'
import { daMuscle } from '../data/da.js'
import { personalRecords, estimatePR } from '../engine/analytics.js'
import { weekIndex, lastSessionMuscles } from '../hooks/useSessionContext.js'
import MuscleIndicator from '../components/MuscleIndicator.jsx'
import RestTimer from '../components/RestTimer.jsx'
import WeightPicker from '../components/WeightPicker.jsx'

const RPE = [
  { rir: 4, label: 'Let' }, { rir: 3, label: 'Fint' }, { rir: 2, label: 'Udfordrende' },
  { rir: 1, label: 'Hårdt' }, { rir: 0, label: 'Max' },
]

export default function Session() {
  const nav = useNavigate()
  const { state } = useLocation()
  const { profile, sessions, states, completeSession } = useStore()
  const owned = profile.weights && profile.weights.length ? profile.weights : [8, 24]

  const initial = useMemo(() => state?.session || buildSession({
    location: profile.location, duration: profile.defaultDuration,
    weekIndex: weekIndex(profile.startDate), experience: profile.experience,
    states, lastSessionMuscles: lastSessionMuscles(sessions),
  }), [])
  const [session, setSession] = useState(initial)
  const prs = useMemo(() => personalRecords(sessions), [sessions])

  const [exIdx, setExIdx] = useState(0)
  const [setIdx, setSetIdx] = useState(0)
  const [resting, setResting] = useState(false)
  const [showSwap, setShowSwap] = useState(false)
  const [log, setLog] = useState(() => session.items.map((it) => ({ exerciseId: it.exerciseId, sets: [] })))

  const item = session.items[exIdx]
  const ex = exerciseById(item.exerciseId)
  const [reps, setReps] = useState(item.targetReps)
  const [weight, setWeight] = useState(suggestLoad(ex, owned))
  const [rir, setRir] = useState(2)

  const estMax = prs[ex.id]?.score || (usesWeight(ex) ? estimatePR(weight, item.repMax) : null)
  const totalSets = item.sets
  const isLastSet = setIdx + 1 >= totalSets
  const isLastEx = exIdx + 1 >= session.items.length

  const goTo = (ni, item2) => {
    const nx = exerciseById(item2.exerciseId)
    setExIdx(ni); setSetIdx(0)
    setReps(item2.targetReps); setWeight(suggestLoad(nx, owned)); setRir(2)
  }

  const logSet = () => {
    setLog((prev) => { const n = prev.map((p) => ({ ...p, sets: [...p.sets] })); n[exIdx].sets.push({ reps, weight, rir }); return n })
    setResting(true)
  }
  const afterRest = () => {
    setResting(false)
    if (!isLastSet) { setSetIdx((s) => s + 1); return }
    if (!isLastEx) goTo(exIdx + 1, session.items[exIdx + 1])
    else finish()
  }
  const finish = async () => { await completeSession(session, log.filter((l) => l.sets.length)); nav('/progress', { state: { justFinished: true } }) }

  const swapTo = (newId) => {
    const items = session.items.map((it, i) => i === exIdx ? { ...it, exerciseId: newId } : it)
    setSession({ ...session, items })
    setLog((prev) => prev.map((p, i) => i === exIdx ? { exerciseId: newId, sets: [] } : p))
    setShowSwap(false)
    goTo(exIdx, { ...item, exerciseId: newId })
  }

  const progress = ((exIdx + setIdx / totalSets) / session.items.length)

  if (resting) {
    const nextLabel = isLastSet ? (isLastEx ? 'Færdig 🎉' : exerciseById(session.items[exIdx + 1].exerciseId).name) : `Sæt ${setIdx + 2} af ${totalSets}`
    return (
      <div className="app fadeIn" style={{ paddingTop: 36 }}>
        <h2 className="center">Pause</h2>
        <p className="center muted">Næste: {nextLabel}</p>
        <RestTimer seconds={item.restSec} onDone={afterRest} />
      </div>
    )
  }

  return (
    <div className="app fadeIn" style={{ paddingTop: 16 }}>
      <div className="row between">
        <button className="icon-btn" onClick={() => nav('/')}>✕</button>
        <span className="muted" style={{ fontSize: '.85rem' }}>Øvelse {exIdx + 1}/{session.items.length} · Sæt {setIdx + 1}/{totalSets}</span>
        <span className="pill lime">{session.phaseLabel}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 99, margin: '12px 0 18px' }}>
        <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--grad)', borderRadius: 99, transition: '.3s' }} />
      </div>

      <div className="card hero center">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', placeItems: 'center', marginBottom: 4 }}><MuscleIndicator muscle={ex.muscles[0]} size={72} /></div>
          <h1 style={{ marginTop: 6 }}>{ex.name}</h1>
          <div className="row wrap" style={{ justifyContent: 'center', marginBottom: 10 }}>
            {ex.equip.map((q) => <span className="tag" key={q}>{EQUIP_LABEL[q]}</span>)}
            <span className="tag">{ex.muscles.map(daMuscle).join(' · ')}</span>
          </div>
          <p className="muted" style={{ fontSize: '.92rem' }}>{ex.cues}</p>
          <div className="note lime center">🎯 {item.detail} · hold ~{item.targetRIR} reps i tanken</div>
          {item.progressionNote && <div className="note center" style={{ marginTop: 8 }}>🧠 {item.progressionNote}</div>}
          <button className="btn-soft btn-block" style={{ marginTop: 12 }} onClick={() => setShowSwap(true)}>🔁 Byt øvelse</button>
        </div>
      </div>

      <div className="card">
        <div className="center" style={{ marginBottom: 6 }}>
          <label>Reps</label>
          <div className="stepper" style={{ justifyContent: 'center' }}>
            <button onClick={() => setReps((r) => Math.max(0, r - 1))}>−</button>
            <div className="val">{reps}</div>
            <button onClick={() => setReps((r) => r + 1)}>+</button>
          </div>
        </div>
        {usesWeight(ex) && (
          <>
            <div className="divider" />
            <WeightPicker weight={weight} reps={reps} owned={owned} estMax={estMax} onChange={setWeight} />
          </>
        )}
        <div className="divider" />
        <label>Hvor hårdt var sættet?</label>
        <div className="rpe-grid">
          {RPE.map((o) => (
            <button key={o.rir} className={rir === o.rir ? 'on' : ''} onClick={() => setRir(o.rir)}>
              <span style={{ fontWeight: 800, fontSize: '.85rem' }}>{o.label}</span>
              <span style={{ fontSize: '.62rem', opacity: .7 }}>RIR {o.rir}</span>
            </button>
          ))}
        </div>
        <button className="btn-primary btn-xl" style={{ marginTop: 16 }} onClick={logSet}>
          {isLastSet && isLastEx ? 'Log & afslut træning' : 'Log sæt · start pause'}
        </button>
        <button className="btn-ghost btn-block faint" style={{ marginTop: 8 }} onClick={afterRest}>Spring sæt over</button>
      </div>

      {showSwap && (
        <>
          <div className="sheet-bg" onClick={() => setShowSwap(false)} />
          <div className="sheet">
            <div className="grab" />
            <h2>Byt øvelse</h2>
            <p className="muted">Alternativer for {daMuscle(ex.muscles[0])} med dit udstyr:</p>
            <div className="stack" style={{ marginTop: 8 }}>
              {alternativesFor(ex, session.location, session.items.map((i) => i.exerciseId)).slice(0, 10).map((alt) => (
                <button key={alt.id} className="row btn-soft" style={{ justifyContent: 'flex-start', gap: 12, minHeight: 64, textAlign: 'left' }} onClick={() => swapTo(alt.id)}>
                  <MuscleIndicator muscle={alt.muscles[0]} size={24} />
                  <div className="grow">
                    <div style={{ fontWeight: 650 }}>{alt.name}</div>
                    <div className="muted" style={{ fontSize: '.78rem' }}>{alt.equip.map((q) => EQUIP_LABEL[q]).join(', ')}</div>
                  </div>
                  <span className="pill cyan">Vælg</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
