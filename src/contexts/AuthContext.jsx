import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loadFirebase } from '../firebase'
import { readJSON, writeJSON } from '../utils/storage'

const USERS_KEY = 'lale_users'
const SESSION_KEY = 'lale_session'
const SALT = 'lale_gulleri_2025_#secure#'
const LONG = 30 * 24 * 60 * 60 * 1000
const SHORT = 2 * 60 * 60 * 1000

const AuthContext = createContext(null)

function hashPassword(password) {
  const str = SALT + password + SALT
  let h1 = 0x811c9dc5
  let h2 = 0x1000193
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    h1 = ((h1 ^ c) * 16777619) >>> 0
    h2 = ((h2 + c) * 31 + (h2 << 3)) >>> 0
  }
  for (let r = 0; r < 8; r++) {
    h1 = ((h1 ^ (h2 >>> 13)) * 2654435761) >>> 0
    h2 = ((h2 ^ (h1 >>> 11)) * 40503) >>> 0
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')
}

function publicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    first: user.first,
    last: user.last,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    provider: 'local',
  }
}

function getSession() {
  const s = readJSON(SESSION_KEY, null)
  if (!s?.userId || !s.expiresAt) return null
  if (Date.now() > s.expiresAt) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  return s
}

export function AuthProvider({ children }) {
  const [localUser, setLocalUser] = useState(() => {
    const session = getSession()
    if (!session) return null
    const users = readJSON(USERS_KEY, [])
    const found = users.find((u) => u.id === session.userId)
    return publicUser(found)
  })
  const [googleUser, setGoogleUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [firebaseError, setFirebaseError] = useState('')

  useEffect(() => {
    let unsub = () => {}
    let cancelled = false

    loadFirebase()
      .then((fb) => {
        if (cancelled) return
        fb.getRedirectResult(fb.firebaseAuth).catch((err) => {
          console.warn('Google redirect result', err)
        })
        unsub = fb.onAuthStateChanged(fb.firebaseAuth, (user) => {
          setGoogleUser(user)
          setReady(true)
        })
      })
      .catch((err) => {
        console.warn('Firebase failed to load', err)
        setFirebaseError(err?.message || 'Firebase failed to load')
        setReady(true)
      })

    return () => {
      cancelled = true
      try { unsub() } catch {}
    }
  }, [])

  const user = googleUser
    ? {
        id: googleUser.uid,
        first: (googleUser.displayName || googleUser.email || 'User').split(' ')[0],
        last: (googleUser.displayName || '').split(' ').slice(1).join(' '),
        email: googleUser.email,
        phone: '',
        photoURL: googleUser.photoURL,
        provider: 'google',
        emailVerified: googleUser.emailVerified,
      }
    : localUser

  function register(data) {
    const first = String(data.first || '').trim()
    const last = String(data.last || '').trim()
    const email = String(data.email || '').trim().toLowerCase()
    const phone = String(data.phone || '').trim()
    const pass = String(data.password || '')
    const pass2 = String(data.confirm || '')
    if (!first || !last || !email || !phone || !pass || !pass2) return { ok: false, error: 'Заполните все поля' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Введите корректный e-mail' }
    if (pass.length < 6) return { ok: false, error: 'Пароль минимум 6 символов' }
    if (pass !== pass2) return { ok: false, error: 'Пароли не совпадают' }
    const users = readJSON(USERS_KEY, [])
    if (users.some((u) => u.email === email)) return { ok: false, error: 'Этот email уже зарегистрирован' }
    const newUser = {
      id: `u_${Date.now()}`,
      first, last, email, phone,
      passHash: hashPassword(pass),
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    writeJSON(USERS_KEY, users)
    writeJSON(SESSION_KEY, { userId: newUser.id, email, issuedAt: Date.now(), expiresAt: Date.now() + SHORT })
    setLocalUser(publicUser(newUser))
    return { ok: true, user: publicUser(newUser) }
  }

  function login(email, password, remember) {
    email = String(email || '').trim().toLowerCase()
    const users = readJSON(USERS_KEY, [])
    const found = users.find((u) => u.email === email)
    if (!found) return { ok: false, error: 'Пользователь не найден' }
    if (found.passHash !== hashPassword(password)) return { ok: false, error: 'Неверный пароль' }
    writeJSON(SESSION_KEY, {
      userId: found.id,
      email,
      issuedAt: Date.now(),
      expiresAt: Date.now() + (remember ? LONG : SHORT),
    })
    setLocalUser(publicUser(found))
    return { ok: true, user: publicUser(found) }
  }

  async function loginWithGoogle() {
    const fb = await loadFirebase()
    // Same as the original site: redirect in this tab.
    // Popups are blocked in many browsers and never appear.
    await fb.signInWithRedirect(fb.firebaseAuth, fb.googleProvider)
    return null
  }

  async function logout() {
    localStorage.removeItem(SESSION_KEY)
    setLocalUser(null)
    try {
      const fb = await loadFirebase()
      await fb.signOut(fb.firebaseAuth)
    } catch {}
  }

  function updateProfile(data) {
    if (!localUser) return { ok: false, error: 'Не авторизован' }
    const users = readJSON(USERS_KEY, [])
    const idx = users.findIndex((u) => u.id === localUser.id)
    if (idx < 0) return { ok: false, error: 'Пользователь не найден' }
    users[idx] = { ...users[idx], ...data }
    writeJSON(USERS_KEY, users)
    setLocalUser(publicUser(users[idx]))
    return { ok: true, user: publicUser(users[idx]) }
  }

  const value = useMemo(() => ({
    user,
    ready,
    firebaseError,
    register,
    login,
    loginWithGoogle,
    logout,
    updateProfile,
  }), [user, ready, firebaseError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
