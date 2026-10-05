import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import { useCart } from '../contexts/CartContext'
import { useI18n } from '../contexts/I18nContext'
import { useProducts } from '../contexts/ProductsContext'
import { formatPrice, productImage } from '../utils/productHelpers'
import Icon from '../components/Icons'
import RollingNumber from '../motion/RollingNumber'

export default function CartPage() {
  const { t } = useI18n()
  const { cart, setQty, remove, clear, subtotal, delivery, total, notify } = useCart()
  const { get, name, typeName } = useProducts()

  return (
    <>
      <PageHead title={t('cart.title')} sub={t('cart.sub')} crumbs={[{ label: t('cart.title') }]} />
      <section className="section">
        <div className="container">
          <div className="cart-layout">
            <div>
              {!cart.length ? (
                <div className="empty-state">
                  <div className="es-icon"><Icon name="cart" size={32} /></div>
                  <h3>{t('cart.empty')}</h3>
                  <p>{t('cart.emptyText')}</p>
                  <Link className="btn btn-primary" to="/catalog">{t('cart.emptyBtn')}</Link>
                </div>
              ) : cart.map((item) => {
                const p = get(item.id)
                if (!p) return null
                return (
                  <div className="cart-row" key={p.id}>
                    <img src={productImage(p)} alt={name(p)} />
                    <div className="cr-info">
                      <div className="cr-name">{name(p)}</div>
                      <div className="cr-cat">{typeName(p)}</div>
                    </div>
                    <div className="qty">
                      <button type="button" aria-label="−" onClick={() => setQty(p.id, item.qty - 1)}>−</button>
                      <input type="number" inputMode="numeric" value={item.qty} min="1" max="99" aria-label={t('cart.qty')} onChange={(e) => setQty(p.id, Math.max(1, +e.target.value || 1))} />
                      <button type="button" aria-label="+" disabled={item.qty >= 99} onClick={() => setQty(p.id, item.qty + 1)}>+</button>
                    </div>
                    <div className="cr-price">{formatPrice(p.price * item.qty)}</div>
                    <button className="remove" onClick={() => { remove(p.id); notify('notify.removed') }} aria-label={t('cart.remove')}><Icon name="close" size={16} /></button>
                  </div>
                )
              })}
              {!!cart.length && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
                  <button className="btn btn-outline" onClick={() => { clear(); notify('notify.cleared') }}>{t('cart.clear')}</button>
                  <Link className="btn btn-ghost" to="/catalog">{t('cart.continue')}</Link>
                </div>
              )}
            </div>
            <aside className="summary">
              <h3>{t('checkout.summary')}</h3>
              <div className="summary-row"><span>{t('cart.subtotal')}</span><span><RollingNumber value={subtotal} suffix=" TMT" /></span></div>
              <div className="summary-row"><span>{t('cart.delivery')}</span><span>{delivery === 0 ? t('cart.free') : formatPrice(delivery)}</span></div>
              <div className="summary-row total"><span>{t('cart.grand')}</span><span><RollingNumber value={total} suffix=" TMT" /></span></div>
              <Link className="btn btn-primary btn-block btn-lg" to="/checkout" style={{ marginTop: 18 }}>{t('cart.checkout')}</Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
