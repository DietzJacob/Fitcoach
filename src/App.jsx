import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext.jsx'
import { useStore } from './contexts/StoreContext.jsx'
import Login from './pages/Login.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Session from './pages/Session.jsx'
import Summary from './pages/Summary.jsx'
import Progress from './pages/Progress.jsx'
import Library from './pages/Library.jsx'

function Loading() {
  return <div className="app center" style={{ paddingTop: 120 }}><div className="muted">Indlæser…</div></div>
}

export default function App() {
  const { user } = useAuth()
  const { profile, loaded } = useStore()
  const loc = useLocation()

  if (user === undefined) return <Loading />
  if (!user) return <Login />
  if (user && !loaded) return <Loading />
  if (!profile) return <Onboarding />

  const tab = (to, ico, label) => (
    <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : '')} end={to === '/'}>
      <span className="ico">{ico}</span><span>{label}</span>
    </NavLink>
  )
  const hideNav = loc.pathname.startsWith('/session/')

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/session/live" element={<Session />} />
        <Route path="/session/done" element={<Summary />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/library" element={<Library />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!hideNav && (
        <nav className="nav">
          {tab('/', '🏠', 'I dag')}
          {tab('/progress', '📈', 'Fremgang')}
          {tab('/library', '📚', 'Øvelser')}
        </nav>
      )}
    </>
  )
}
