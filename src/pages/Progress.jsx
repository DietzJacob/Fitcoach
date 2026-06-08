import { useMemo } from 'react'
import { useStore } from '../contexts/StoreContext.jsx'
import { exerciseById } from '../data/exercises.js'
import { daMuscle } from '../data/da.js'
import { weeklyVolume, VOLUME_TARGET, personalRecords, streakInfo } from '../engine/analytics.js'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from 'recharts'

export default function Progress() {
  const { sessions } = useStore()
  const vol = useMemo(() => weeklyVolume(sessions), [sessions])
  const prs = useMemo(() => personalRecords(sessions), [sessions])
  const { streak, days } = useMemo(() => streakInfo(sessions), [sessions])

  const volData = Object.entries(vol).map(([m, sets]) => ({ muscle: daMuscle(m), sets }))
  const volByWeek = useMemo(() => {
    const map = {}
    sessions.forEach((s) => {
      const wk = isoWeek(new Date(s.date))
      const sets = (s.items || []).reduce((a, it) => a + (it.logged?.length || 0), 0)
      map[wk] = (map[wk] || 0) + sets
    })
    return Object.entries(map).map(([w, sets]) => ({ w, sets })).slice(-8)
  }, [sessions])
  const totalSets = sessions.reduce((a, s) => a + (s.items || []).reduce((x, it) => x + (it.logged?.length || 0), 0), 0)

  const cal = useMemo(() => {
    const arr = []
    for (let i = 27; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); arr.push({ d: d.getDate(), on: days.has(d.toDateString()) }) }
    return arr
  }, [days])

  if (!sessions.length) {
    return <div className="app center" style={{ paddingTop: 90 }}>
      <div style={{ fontSize: 46 }}>📈</div>
      <h1>Din fremgang</h1>
      <p className="muted">Gennemfør din første træning, så bygger vi grafer, rekorder og volumen-overblik her.</p>
    </div>
  }

  const axis = { stroke: '#5f6b83', fontSize: 11 }
  const tip = { background: '#0b0e17', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, color: '#f4f7fc' }

  return (
    <div className="app fadeIn">
      <h1>Din fremgang</h1>
      <div className="row">
        <div className="card grow center tight"><div className="kpi grad-text">🔥 {streak}</div><div className="muted" style={{ fontSize: '.74rem' }}>streak</div></div>
        <div className="card grow center tight"><div className="kpi">{sessions.length}</div><div className="muted" style={{ fontSize: '.74rem' }}>træninger</div></div>
        <div className="card grow center tight"><div className="kpi">{totalSets}</div><div className="muted" style={{ fontSize: '.74rem' }}>sæt</div></div>
        <div className="card grow center tight"><div className="kpi">{Object.keys(prs).length}</div><div className="muted" style={{ fontSize: '.74rem' }}>PR'er</div></div>
      </div>

      <div className="card">
        <h3>Ugentligt volumen pr. muskel</h3>
        <p className="muted" style={{ fontSize: '.8rem', marginTop: 0 }}>Mål: {VOLUME_TARGET.min}–{VOLUME_TARGET.max} arbejdssæt pr. uge.</p>
        <ResponsiveContainer width="100%" height={Math.max(170, volData.length * 30)}>
          <BarChart data={volData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" {...axis} />
            <YAxis type="category" dataKey="muscle" width={86} {...axis} />
            <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(255,255,255,.04)' }} />
            <Bar dataKey="sets" fill="#19e3b1" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Total volumen over tid</h3>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={volByWeek}>
            <CartesianGrid stroke="rgba(255,255,255,.07)" strokeDasharray="3 3" />
            <XAxis dataKey="w" {...axis} /><YAxis {...axis} />
            <Tooltip contentStyle={tip} />
            <Line type="monotone" dataKey="sets" stroke="#36c6ff" strokeWidth={3} dot={{ r: 3, fill: '#36c6ff' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Kalender · seneste 28 dage</h3>
        <div className="cal">{cal.map((c, i) => <div key={i} className={`d ${c.on ? 'on' : ''}`}>{c.d}</div>)}</div>
      </div>

      <div className="card">
        <h3>🏅 Personlige rekorder</h3>
        <div className="stack">
          {Object.entries(prs).sort((a, b) => b[1].score - a[1].score).slice(0, 14).map(([id, pr]) => {
            const ex = exerciseById(id); if (!ex) return null
            return (
              <div className="row between" key={id}>
                <span>{ex.name}</span>
                <span className="pill lime">{pr.weight ? `${pr.weight} kg × ${pr.reps}` : `${pr.reps} reps`}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function isoWeek(d) {
  const date = new Date(d); date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 'u' + (1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7))
}
