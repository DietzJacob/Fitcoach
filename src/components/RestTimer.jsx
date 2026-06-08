// Rest timer with a circular countdown and an audible beep at zero (Web Audio,
// no asset needed). Large + readable for mid-set glances.
import { useEffect, useRef, useState } from 'react'

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'; o.frequency.value = 880
    g.gain.setValueAtTime(0.001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    o.start(); o.stop(ctx.currentTime + 0.5)
  } catch {}
}

export default function RestTimer({ seconds = 90, onDone }) {
  const [left, setLeft] = useState(seconds)
  const [running, setRunning] = useState(true)
  const ref = useRef()
  useEffect(() => { setLeft(seconds); setRunning(true) }, [seconds])
  useEffect(() => {
    if (!running) return
    ref.current = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) { clearInterval(ref.current); beep(); onDone && onDone(); return 0 }
        return l - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [running])

  const R = 52, C = 2 * Math.PI * R
  const pct = seconds ? left / seconds : 0
  const mm = String(Math.floor(left / 60)).padStart(1, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className="stack" style={{ alignItems: 'center' }}>
      <div className="timer-wrap" style={{ position: 'relative' }}>
        <svg width="160" height="160" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} stroke="var(--line)" strokeWidth="10" fill="none" />
          <circle cx="60" cy="60" r={R} stroke="var(--accent)" strokeWidth="10" fill="none"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
            transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <div className="timer-num">{mm}:{ss}</div>
        </div>
      </div>
      <div className="row">
        <button onClick={() => setLeft((l) => l + 15)}>+15s</button>
        <button className="btn-ghost" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Start'}</button>
        <button className="btn-primary" onClick={() => { clearInterval(ref.current); onDone && onDone() }}>Spring over</button>
      </div>
    </div>
  )
}
