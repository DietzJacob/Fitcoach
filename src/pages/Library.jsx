import { useMemo, useState } from 'react'
import { EXERCISES, exercisesForLocation, MUSCLES, EQUIP_LABEL } from '../data/exercises.js'
import { daMuscle } from '../data/da.js'
import MuscleIndicator from '../components/MuscleIndicator.jsx'

const LOC = { all: 'Alle', home: 'Hjemme', summerhouse: 'Sommerhus', bodyweight: 'Kropsvægt' }
const DIFF = { 1: ['Nybegynder', 'lime'], 2: ['Øvet', 'cyan'], 3: ['Erfaren', 'coral'] }

export default function Library() {
  const [loc, setLoc] = useState('all')
  const [muscle, setMuscle] = useState('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  const list = useMemo(() => {
    let l = loc === 'all' ? EXERCISES : exercisesForLocation(loc)
    if (muscle !== 'all') l = l.filter((e) => e.muscles.includes(muscle))
    if (q.trim()) l = l.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()))
    return l
  }, [loc, muscle, q])

  return (
    <div className="app fadeIn">
      <h1>Øvelser <span className="muted" style={{ fontSize: '1rem', fontWeight: 600 }}>· {EXERCISES.length}</span></h1>
      <input placeholder="Søg efter øvelse…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />
      <div className="row wrap" style={{ marginBottom: 8 }}>
        {Object.entries(LOC).map(([k, v]) => <span key={k} className={`chip ${loc === k ? 'on' : ''}`} onClick={() => setLoc(k)}>{v}</span>)}
      </div>
      <div className="row wrap" style={{ marginBottom: 16 }}>
        <span className={`chip ${muscle === 'all' ? 'on' : ''}`} onClick={() => setMuscle('all')}>Alle muskler</span>
        {MUSCLES.map((m) => <span key={m} className={`chip ${muscle === m ? 'on' : ''}`} onClick={() => setMuscle(m)}>{daMuscle(m)}</span>)}
      </div>

      <div className="stack">
        {list.map((ex) => {
          const [dl, dc] = DIFF[ex.diff]
          return (
            <div className="card tight" key={ex.id} onClick={() => setOpen(open === ex.id ? null : ex.id)} style={{ cursor: 'pointer' }}>
              <div className="row" style={{ gap: 12 }}>
                <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '4px 10px', display: 'grid', placeItems: 'center' }}><MuscleIndicator muscle={ex.muscles[0]} size={30} /></div>
                <div className="grow">
                  <div className="row between"><strong>{ex.name}</strong><span className={`pill ${dc}`}>{dl}</span></div>
                  <div className="muted" style={{ fontSize: '.82rem' }}>{ex.muscles.map(daMuscle).join(' · ')}</div>
                  <div className="row wrap" style={{ marginTop: 6 }}>
                    {ex.equip.map((q) => <span key={q} className="tag">{EQUIP_LABEL[q]}</span>)}
                  </div>
                </div>
              </div>
              {open === ex.id && <p className="muted fadeIn" style={{ marginTop: 10, marginBottom: 0, paddingTop: 10 }}>{ex.cues}</p>}
            </div>
          )
        })}
        {!list.length && <p className="muted center">Ingen øvelser matcher filteret.</p>}
      </div>
    </div>
  )
}
