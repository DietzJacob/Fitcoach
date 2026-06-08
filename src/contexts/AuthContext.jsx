import { createContext, useContext, useEffect, useState } from 'react'
import { auth, isFirebaseConfigured } from '../firebase.js'
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

// When Firebase isn't configured yet, we run in a local "demo" account so the
// app is fully usable offline. Data lives in localStorage (see StoreContext).
const DEMO_USER = { uid: 'demo', email: 'demo@local', displayName: 'Demo', demo: true }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    if (!isFirebaseConfigured) { setUser(DEMO_USER); return }
    return onAuthStateChanged(auth, (u) => setUser(u || null))
  }, [])

  const api = {
    user,
    demo: !isFirebaseConfigured,
    signIn: (email, pw) => signInWithEmailAndPassword(auth, email, pw),
    signUp: (email, pw) => createUserWithEmailAndPassword(auth, email, pw),
    signOut: () => (isFirebaseConfigured ? fbSignOut(auth) : null),
  }
  return <AuthCtx.Provider value={api}>{children}</AuthCtx.Provider>
}
