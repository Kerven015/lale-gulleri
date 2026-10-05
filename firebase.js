export const firebaseConfig = {
  apiKey: 'AIzaSyAmAp6iRuZkGWrL8cjMxfDhH03-Ipe1Hsk',
  authDomain: 'lale-gulleri.firebaseapp.com',
  projectId: 'lale-gulleri',
  storageBucket: 'lale-gulleri.firebasestorage.app',
  messagingSenderId: '568514266701',
  appId: '1:568514266701:web:130dff79e2c443389ffe04',
  measurementId: 'G-VM7LQMQJBD',
}

let loading = null
let cached = null

export async function loadFirebase() {
  if (cached) return cached
  if (loading) return loading

  loading = (async () => {
    const [appMod, auth] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'),
    ])

    const app = appMod.getApps().length
      ? appMod.getApps()[0]
      : appMod.initializeApp(firebaseConfig)

    const firebaseAuth = auth.getAuth(app)
    firebaseAuth.languageCode = 'ru'

    const googleProvider = new auth.GoogleAuthProvider()
    googleProvider.setCustomParameters({ prompt: 'select_account' })

    cached = {
      app,
      firebaseAuth,
      googleProvider,
      onAuthStateChanged: auth.onAuthStateChanged,
      signInWithPopup: auth.signInWithPopup,
      signInWithRedirect: auth.signInWithRedirect,
      getRedirectResult: auth.getRedirectResult,
      signOut: auth.signOut,
    }
    return cached
  })()

  try {
    return await loading
  } catch (err) {
    loading = null
    throw err
  }
}
