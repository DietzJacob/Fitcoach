// Data layer: profile + completed sessions + per-exercise progression states.
// Syncs to Firestore when configured; otherwise persists to localStorage so the
// app works end-to-end before you wire up Firebase.
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { db, isFirebaseConfigured } from '../firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useAuth } from './AuthContext.jsx'
import { applySessionResults } from '../engine/planner.js'

const StoreCtx = createContext(null)
export const useStore = () => useContext(StoreCtx)

const DEFAULT = {
  profile: null,                  // {goal, experience, daysPerWeek, defaultDuration, location, startDate}
  sessions: [],                   // completed sessions (with logged sets)
  states: {},                     // exerciseId -> progression state
}
const LS_KEY = (uid) => `fitcoach:${uid}`

export function StoreProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState(DEFAULT)
  const [loaded, setLoaded] = useState(false)

  // Load on sign-in.
  useEffect(() => {
    if (user === undefined) return
    if (!user) { setData(DEFAULT); setLoaded(false); return }
    ;(async () => {
      let loadedData = DEFAULT
      try {
        if (isFirebaseConfigured) {
          const snap = await getDoc(doc(db, 'users', user.uid))
          if (snap.exists()) loadedData = { ...DEFAULT, ...snap.data() }
        } else {
          loadedData = { ...DEFAULT, ...JSON.parse(localStorage.getItem(LS_KEY(user.uid)) || '{}') }
        }
      } catch (e) {
        // Never freeze the UI on a failed/denied/slow cloud read — fall back to
        // defaults and keep a local copy. (Usually means Firestore rules aren't
        // deployed yet, or the database hasn't been created.)
        console.warn('Kunne ikke hente data fra Firestore — bruger lokale data indtil videre.', e)
        try { loadedData = { ...DEFAULT, ...JSON.parse(localStorage.getItem(LS_KEY(user.uid)) || '{}') } } catch {}
      }
      setData(loadedData)
      setLoaded(true) // always resolve, even on error
    })()
  }, [user])

  const persist = useCallback(async (next) => {
    setData(next)
    if (!user) return
    // Always keep a local copy so nothing is lost if the cloud write is denied.
    try { localStorage.setItem(LS_KEY(user.uid), JSON.stringify(next)) } catch {}
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'users', user.uid), next, { merge: true })
      } catch (e) {
        console.warn('Kunne ikke gemme til Firestore (tjek sikkerhedsregler) — gemt lokalt.', e)
      }
    }
  }, [user])

  const api = {
    ...data, loaded,
    saveProfile: (profile) => persist({ ...data, profile: { ...data.profile, ...profile } }),
    // Persist a finished session, then run the progression engine on the results.
    completeSession: (session, logged) => {
      const sessionZone = session.phase
      const states = applySessionResults(data.states, logged, sessionZone)
      const stored = { ...session, items: session.items.map((it) => {
        const l = logged.find((x) => x.exerciseId === it.exerciseId)
        return { ...it, logged: l ? l.sets : [] }
      }) }
      return persist({ ...data, states, sessions: [...data.sessions, stored] })
    },
    reset: () => persist(DEFAULT),
  }
  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>
}
