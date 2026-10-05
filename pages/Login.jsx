import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { useToast } from '../contexts/ToastContext'
import Icon from '../components/Icons'

const LOGO = '/images/lale%20gulleri.jpg'

export default function Login() {
  const { t } = useI18n()
  const { login, loginWithGoogle, user, firebaseError } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate('/profile', { replace: true })
  }, [user, navigate])

  async function onGoogle() {
    setBusy(true)
    setStatus(t('auth.redirecting'))
    try {
      const user = await loginWithGoogle()
      if (!user) {
        setStatus(t('auth.redirecting'))
        return
      }
      toast(t('auth.okLogin'))
      navigate('/profile')
    } catch (err) {
      // technical details stay in the console; the visitor sees a short message
      console.warn('Google sign-in failed', err)
      setStatus(t('auth.googleErr'))
      setBusy(false)
    }
  }

  function onLocal(e) {
    e.preventDefault()
    const result = login(e.target.email.value, e.target.password.value, e.target.remember?.checked)
    if (!result.ok) {
      toast(t(result.error), 'error')
      return
    }
    toast(t('auth.okLogin'))
    navigate('/profile')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <img className="auth-logo" src={LOGO} alt="logo" />
        <h1>{t('auth.loginTitle')}</h1>
        <p className="auth-sub">{t('auth.loginSub')}</p>

        <button className="btn btn-outline btn-block" type="button" onClick={onGoogle} disabled={busy} style={{ marginBottom: 18 }}>
          <Icon name="globe" size={18} /> Google
        </button>

        <form onSubmit={onLocal}>
          <div className="form-field" style={{ textAlign: 'left' }}>
            <label htmlFor="login-email">{t('auth.email')}</label>
            <input id="login-email" className="field" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="form-field" style={{ textAlign: 'left' }}>
            <label htmlFor="login-pass">{t('auth.password')}</label>
            <input id="login-pass" className="field" name="password" type="password" autoComplete="current-password" required />
          </div>
          <label className="check" style={{ margin: '12px 0 18px' }}>
            <input type="checkbox" name="remember" />
            <span>{t('auth.remember')}</span>
          </label>
          <button className="btn btn-primary btn-block" type="submit">{t('auth.loginBtn')}</button>
        </form>

        {(status || firebaseError) && (
          <div style={{ marginTop: 16, color: 'var(--muted)' }}>
            {status || t('auth.googleErr')}
          </div>
        )}
        <p className="auth-foot">
          {t('auth.noAccount')} <Link to="/register">{t('auth.create')}</Link>
        </p>
      </div>
    </div>
  )
}
