import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { useToast } from '../contexts/ToastContext'

const LOGO = '/images/lale%20gulleri.jpg'

export default function Register() {
  const { t } = useI18n()
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  function onSubmit(e) {
    e.preventDefault()
    const f = e.target
    const result = register({
      first: f.first.value,
      last: f.last.value,
      email: f.email.value,
      phone: f.phone.value,
      password: f.password.value,
      confirm: f.confirm.value,
    })
    if (!result.ok) {
      toast(t(result.error), 'error')
      return
    }
    toast(t('auth.okRegister'))
    navigate('/profile')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ width: 'min(100%, 560px)' }}>
        <img className="auth-logo" src={LOGO} alt="logo" />
        <h1>{t('auth.registerTitle')}</h1>
        <p className="auth-sub">{t('auth.registerSub')}</p>
        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="reg-first">{t('auth.first')}</label><input id="reg-first" className="field" name="first" required /></div>
            <div className="form-field"><label htmlFor="reg-last">{t('auth.last')}</label><input id="reg-last" className="field" name="last" required /></div>
            <div className="form-field"><label htmlFor="reg-email">{t('auth.email')}</label><input id="reg-email" className="field" name="email" type="email" required /></div>
            <div className="form-field"><label htmlFor="reg-phone">{t('auth.phone')}</label><input id="reg-phone" className="field" name="phone" type="tel" required /></div>
            <div className="form-field"><label htmlFor="reg-password">{t('auth.password')}</label><input id="reg-password" className="field" name="password" type="password" minLength={6} required /></div>
            <div className="form-field"><label htmlFor="reg-confirm">{t('auth.confirm')}</label><input id="reg-confirm" className="field" name="confirm" type="password" minLength={6} required /></div>
          </div>
          <label className="check" style={{ margin: '18px 0' }}>
            <input type="checkbox" required />
            <span>{t('auth.agree')}</span>
          </label>
          <button className="btn btn-primary btn-block btn-lg" type="submit">{t('auth.registerBtn')}</button>
        </form>
        <p className="auth-foot">
          {t('auth.haveAccount')} <Link to="/login">{t('auth.loginLink')}</Link>
        </p>
      </div>
    </div>
  )
}
