import { useState } from 'react'
import PageHead from '../components/PageHead'
import { useI18n } from '../contexts/I18nContext'
import { useProducts } from '../contexts/ProductsContext'
import { formatPrice } from '../utils/productHelpers'
import { readJSON } from '../utils/storage'

export default function Track() {
  const { t } = useI18n()
  const { get, name } = useProducts()
  const [code, setCode] = useState('')
  const [result, setResult] = useState(undefined)

  function onSubmit(e) {
    e.preventDefault()
    const wanted = code.trim().toUpperCase()
    const orders = readJSON('lale_orders', [])
    setResult(orders.find((o) => String(o.id).toUpperCase() === wanted) || null)
  }

  return (
    <>
      <PageHead title={t('track.title')} sub={t('track.sub')} crumbs={[{ label: t('track.title') }]} />
      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <form className="summary track-form" style={{ position: 'static' }} onSubmit={onSubmit}>
            <input className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('track.ph')} aria-label={t('track.ph')} required />
            <button className="btn btn-primary" type="submit">{t('track.btn')}</button>
          </form>
          {result === null && <p className="muted" style={{ marginTop: 18 }}>{t('track.none')}</p>}
          {result && (
            <div className="summary" style={{ position: 'static', marginTop: 20 }}>
              <h3>{t('checkout.orderNo')}: {result.id}</h3>
              <div className="summary-row"><span>{t('profile.orderDate')}</span><span>{new Date(result.date).toLocaleDateString()}</span></div>
              <div className="summary-row"><span>{t('track.status')}</span><span>{t('profile.statusNew')}</span></div>
              <div className="summary-row"><span>{t('track.items')}</span><span>{(result.items || []).map((i) => { const p = get(i.id); return p ? `${name(p)} × ${i.qty}` : null }).filter(Boolean).join(', ') || '—'}</span></div>
              <div className="summary-row total"><span>{t('cart.grand')}</span><span>{formatPrice(result.total)}</span></div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
