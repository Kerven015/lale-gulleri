import PageHead from '../components/PageHead'
import { useI18n } from '../contexts/I18nContext'
import { useToast } from '../contexts/ToastContext'
import Icon from '../components/Icons'

export default function Contact() {
  const { t } = useI18n()
  const { toast } = useToast()
  return (
    <>
      <PageHead title={t('contact.title')} sub={t('contact.sub')} crumbs={[{ label: t('contact.title') }]} />
      <section className="section">
        <div className="container">
          <div className="info-grid" style={{ marginBottom: 50 }}>
            <div className="info-card"><span className="ic"><Icon name="phone" size={24} /></span><h3>{t('contact.phone')}</h3><p><a href="tel:+99312000000">+993 12 000 000</a></p></div>
            <div className="info-card"><span className="ic"><Icon name="mail" size={24} /></span><h3>{t('contact.email')}</h3><p><a href="mailto:info@lalegulleri.com">info@lalegulleri.com</a></p></div>
            <div className="info-card"><span className="ic"><Icon name="pin" size={24} /></span><h3>{t('contact.address')}</h3><p>{t('contact.addressValue')}</p></div>
            <div className="info-card"><span className="ic"><Icon name="clock" size={24} /></span><h3>{t('contact.hours')}</h3><p>{t('contact.hoursValue')}</p></div>
          </div>
          <div className="grid-2">
            <div className="summary" style={{ position: 'static' }}>
              <h3>{t('contact.form')}</h3>
              <form onSubmit={(e) => { e.preventDefault(); toast(t('contact.ok')); e.target.reset() }}>
                <div className="form-field" style={{ marginBottom: 14 }}>
                  <label>{t('contact.name')}</label>
                  <input className="field" required />
                </div>
                <div className="form-field" style={{ marginBottom: 14 }}>
                  <label>{t('contact.email')}</label>
                  <input className="field" type="email" required />
                </div>
                <div className="form-field" style={{ marginBottom: 14 }}>
                  <label>{t('contact.phone')}</label>
                  <input className="field" type="tel" />
                </div>
                <div className="form-field" style={{ marginBottom: 20 }}>
                  <label>{t('contact.message')}</label>
                  <textarea className="field" required />
                </div>
                <button className="btn btn-primary btn-block" type="submit">{t('contact.send')}</button>
              </form>
            </div>
            <div className="map-box">
              <div className="map-pin">
                <div className="pin"><span><Icon name="pin" size={24} /></span></div>
                <strong>{t('contact.mapTitle')}</strong>
                <small>{t('contact.mapSub')}</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
