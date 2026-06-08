import { useState } from 'react'
import { useStore } from '../contexts/StoreContext.jsx'

const COMMON_WEIGHTS = [4, 6, 8, 10, 12, 16, 20, 24, 32]

export default function Onboarding() {
  const { saveProfile } = useStore()
  const [step, setStep] = useState(0)
  const [p, setP] = useState({
    goal: 'both', experience: 'intermediate', daysPerWeek: 4,
    defaultDuration: 60, location: 'home', weights: [8, 24],
    startDate: new Date().toISOString(),
  })
  const set = (k, v) => setP((s) => ({ ...s, [k]: v }))
  const toggleWeight = (w) => setP((s) => ({
    ...s, weights: s.weights.includes(w) ? s.weights.filter((x) => x !== w) : [...s.weights, w].sort((a, b) => a - b),
  }))

  const steps = [
    { emoji: '🎯', title: 'Hvad er dit mål?', body: (
      <Choices value={p.goal} onChange={(v) => set('goal', v)} options={[
        ['both', 'Muskler + lean', 'Byg muskel og bliv defineret — anbefalet'],
        ['muscle', 'Ren muskelmasse', 'Maksimal hypertrofi og styrke'],
        ['lean', 'Bliv lean', 'Definition og kondition i fokus'],
      ]} />
    )},
    { emoji: '📈', title: 'Hvor erfaren er du?', body: (
      <Choices value={p.experience} onChange={(v) => set('experience', v)} options={[
        ['beginner', 'Nybegynder', 'Ny eller under 1 års træning'],
        ['intermediate', 'Øvet', 'Træner stabilt, kender teknikken'],
        ['advanced', 'Erfaren', 'Flere års seriøs træning'],
      ]} />
    )},
    { emoji: '🗓️', title: 'Hvor mange dage om ugen?', body: (
      <div className="stack" style={{ alignItems: 'center' }}>
        <div className="stepper">
          <button onClick={() => set('daysPerWeek', Math.max(2, p.daysPerWeek - 1))}>−</button>
          <div className="val grad-text">{p.daysPerWeek}</div>
          <button onClick={() => set('daysPerWeek', Math.min(6, p.daysPerWeek + 1))}>+</button>
        </div>
        <div className="muted">dage / uge</div>
      </div>
    )},
    { emoji: '⏱️', title: 'Hvor lang er en typisk træning?', body: (
      <Choices value={p.defaultDuration} onChange={(v) => set('defaultDuration', v)} options={[
        [30, '30 minutter', 'Kort og effektivt'],
        [60, '60 minutter', 'Den klassiske session'],
        [90, '90 minutter', 'Fuld volumen og ekstra øvelser'],
      ]} />
    )},
    { emoji: '📍', title: 'Hvor træner du oftest?', body: (
      <Choices value={p.location} onChange={(v) => set('location', v)} options={[
        ['home', 'Hjemme', 'Håndvægte, 24 kg vægt og pull-up bar'],
        ['summerhouse', 'Sommerhus', 'Gymnastikringe + kropsvægt'],
        ['bodyweight', 'Kun kropsvægt', 'Intet udstyr nødvendigt'],
      ]} />
    )},
    { emoji: '🏋️', title: 'Hvilke vægte ejer du?', body: (
      <div>
        <p className="muted">Vælg dine vægte (kg). Appen foreslår kun belastninger du faktisk har — og du kan altid ændre det senere.</p>
        <div className="row wrap" style={{ marginTop: 6 }}>
          {COMMON_WEIGHTS.map((w) => (
            <button key={w} className={`chip ${p.weights.includes(w) ? 'on' : ''}`} style={{ minWidth: 64, justifyContent: 'center' }}
              onClick={() => toggleWeight(w)}>{w} kg</button>
          ))}
        </div>
      </div>
    )},
  ]
  const last = step === steps.length - 1

  return (
    <div className="app" style={{ maxWidth: 500, paddingTop: 32 }}>
      <div className="row between" style={{ marginBottom: 16 }}>
        <div className="grad-text" style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: '1.2rem' }}>FitCoach</div>
        <div className="muted">{step + 1} / {steps.length}</div>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 99, marginBottom: 24 }}>
        <div style={{ height: '100%', width: `${((step + 1) / steps.length) * 100}%`, background: 'var(--grad)', borderRadius: 99, transition: '.4s' }} />
      </div>
      <div className="card hero slideUp" key={step}>
        <div style={{ fontSize: 40 }}>{steps[step].emoji}</div>
        <h1 style={{ marginTop: 8 }}>{steps[step].title}</h1>
        <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>{steps[step].body}</div>
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        {step > 0 && <button className="btn-ghost grow" onClick={() => setStep(step - 1)}>Tilbage</button>}
        <button className="btn-primary grow btn-lg" onClick={() => (last ? saveProfile(p) : setStep(step + 1))}>
          {last ? 'Start min rejse →' : 'Næste'}
        </button>
      </div>
    </div>
  )
}

function Choices({ value, onChange, options }) {
  return (
    <div className="stack">
      {options.map(([v, label, desc]) => {
        const on = value === v
        return (
          <button key={v} onClick={() => onChange(v)}
            style={{ textAlign: 'left', display: 'block', padding: '14px 16px', minHeight: 0,
              background: on ? 'rgba(201,251,80,.12)' : 'var(--surface-2)',
              border: `1px solid ${on ? 'rgba(201,251,80,.5)' : 'var(--glass-brd)'}`, borderRadius: 16 }}>
            <div className="row between">
              <span style={{ fontWeight: 700, color: on ? 'var(--lime)' : 'var(--text)' }}>{label}</span>
              {on && <span style={{ color: 'var(--lime)' }}>✓</span>}
            </div>
            {desc && <div className="muted" style={{ fontSize: '.84rem', fontWeight: 500, marginTop: 2 }}>{desc}</div>}
          </button>
        )
      })}
    </div>
  )
}
