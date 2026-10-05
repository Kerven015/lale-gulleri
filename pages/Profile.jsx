import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import { useToast } from '../contexts/ToastContext'
import { readJSON } from '../utils/storage'
import Icon from '../components/Icons'
import { formatPrice } from '../utils/productHelpers'

export default function Profile() {
  const { t } = useI18n()
  const { user, logout, updateProfile } = useAuth()
  const { toast } = useToast()

  if (!user) {
    return (
      <>
        <PageHead title={t('profile.title')} sub={t('profile.sub')} crumbs={[{ label: t('profile.title') }]} />
        <section className="section">
          <div className="container">
            <div className="empty-state">
              <div className="es-icon"><Icon name="user" size={32} /></div>
              <h3>{t('profile.guest')}</h3>
              <p>{t('profile.guestText')}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link className="btn btn-primary" to="/login">{t('profile.goLogin')}</Link>
                <Link className="btn btn-outline" to="/register">{t('profile.goRegister')}</Link>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  const orders = readJSON('lale_orders', []).filter((o) => o.userId === user.id || o.customer?.email === user.email)

  function save(e) {
    e.preventDefault()
    const result = updateProfile({
      first: e.target.first.value,
      last: e.target.last.value,
      phone: e.target.phone.value,
    })
    toast(result.ok ? t('profile.saved') : t(result.error), result.ok ? 'ok' : 'error')
  }

  return (
    <>
      <PageHead title={t('profile.title')} sub={t('profile.sub')} crumbs={[{ label: t('profile.title') }]} />
      <section className="section">
        <div className="container">
          <div className="grid-2">
            <div className="summary" style={{ position: 'static' }}>
              <div className="profile-head" style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
                  : <div className="avatar">{(user.first?.[0] || 'U') + (user.last?.[0] || '')}</div>}
                <div>
                  <strong>{user.first} {user.last}</strong>
                  <div className="muted">{user.email}</div>
                </div>
              </div>
              <form key={user.id} onSubmit={save}>
                <div className="form-field" style={{ marginBottom: 12 }}><label>{t('auth.first')}</label><input className="field" name="first" defaultValue={user.first} /></div>
                <div className="form-field" style={{ marginBottom: 12 }}><label>{t('auth.last')}</label><input className="field" name="last" defaultValue={user.last} /></div>
                <div className="form-field" style={{ marginBottom: 12 }}><label>{t('auth.email')}</label><input className="field" value={user.email} disabled /></div>
                <div className="form-field" style={{ marginBottom: 16 }}><label>{t('auth.phone')}</label><input className="field" name="phone" defaultValue={user.phone} /></div>
                <button className="btn btn-primary btn-block" type="submit">{t('profile.save')}</button>
              </form>
              <button
                className="btn btn-outline btn-block"
                style={{ marginTop: 24, color: 'var(--red)', borderColor: 'var(--red)' }}
                onClick={async () => { await logout(); toast(t('auth.logoutOk')) }}
              >
                {t('auth.logout')}
              </button>
            </div>
            <div>
              <div className="summary" style={{ position: 'static', marginBottom: 20 }}>
                <h3>{t('profile.orders')}</h3>
                {!orders.length && <p className="muted">{t('profile.noOrders')}</p>}
                {orders.map((o) => (
                  <div className="cart-row" key={o.id} style={{ gridTemplateColumns: '1fr auto auto' }}>
                    <div>
                      <div className="cr-name">{t('profile.orderNo')} {o.id}</div>
                      <div className="cr-cat">{new Date(o.date).toLocaleDateString()}</div>
                    </div>
                    <div className="cr-price">{formatPrice(o.total)}</div>
                    <span className="tag tag-new" style={{ position: 'static' }}>{o.status === 'new' || o.status === 'Новый' ? t('profile.statusNew') : o.status}</span>
                  </div>
                ))}
              </div>
              <div className="summary" style={{ position: 'static' }}>
                <h3>{t('profile.favs')}</h3>
                <Link className="btn btn-outline btn-block" to="/favorites" style={{ marginBottom: 10 }}><Icon name="heart" size={18} />{t('fav.title')}</Link>
                <Link className="btn btn-outline btn-block" to="/cart" style={{ marginBottom: 10 }}><Icon name="cart" size={18} />{t('cart.title')}</Link>
                <Link className="btn btn-outline btn-block" to="/catalog"><Icon name="flower" size={18} />{t('nav.catalog')}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
