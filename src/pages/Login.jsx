import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { signIn, signUp, demo } = useAuth()
  const [mode, setMode] = useState('in')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { mode === 'in' ? await signIn(email, pw) : await signUp(email, pw) }
    catch (ex) { setErr(ex.message.replace('Firebase:', '').trim()) }
    finally { setBusy(false) }
  }

  return (
    <div className="app" style={{ maxWidth: 440, paddingTop: 64 }}>
      <div className="center" style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 46 }}>🏋️</div>
        <h1 className="grad-text" style={{ display: 'inline-block' }}>FitCoach</h1>
        <p className="muted">Din intelligente personlige træner.</p>
      </div>
      <div className="card hero">
        <div className="seg" style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <button className={mode === 'in' ? 'on' : ''} onClick={() => setMode('in')}>Log ind</button>
          <button className={mode === 'up' ? 'on' : ''} onClick={() => setMode('up')}>Opret</button>
        </div>
        <form onSubmit={submit} className="stack" style={{ position: 'relative', zIndex: 1 }}>
          <div><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label>Adgangskode</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
          {err && <div className="note" style={{ borderColor: 'var(--coral)', color: 'var(--coral)' }}>{err}</div>}
          <button className="btn-primary btn-lg" disabled={busy}>{busy ? '…' : mode === 'in' ? 'Log ind' : 'Opret konto'}</button>
        </form>
      </div>
      {demo && <p className="muted center" style={{ marginTop: 16, fontSize: '.85rem' }}>
        Demo-tilstand: Firebase er ikke konfigureret endnu, så data gemmes lokalt på denne enhed.
      </p>}
    </div>
  )
}
