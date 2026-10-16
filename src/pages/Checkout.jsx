import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useI18n } from '../contexts/I18nContext'
import { useProducts } from '../contexts/ProductsContext'
import { useToast } from '../contexts/ToastContext'
import { readJSON, writeJSON } from '../utils/storage'
import { formatPrice } from '../utils/productHelpers'
import Icon from '../components/Icons'
import { useMagnetic } from '../motion/motion'
import RollingNumber from '../motion/RollingNumber'

export default function Checkout() {
  const { t } = useI18n()
  const { cart, subtotal, delivery, total, clear } = useCart()
  const { get, name } = useProducts()
  const { user } = useAuth()
  const { toast } = useToast()
  const [deliveryType, setDeliveryType] = useState('delivery')
  const [payment, setPayment] = useState('card')
  const [orderId, setOrderId] = useState('')
  const placeRef = useRef(null)
  useMagnetic(placeRef, undefined, [orderId, cart.length])

  function onSubmit(e) {
    e.preventDefault()
    if (!cart.length) {
      toast(t('checkout.emptyCart'), 'error')
      return
    }
    const form = e.target
    const required = form.querySelectorAll('[required]')
    let valid = true
    required.forEach((f) => {
      if (!f.value.trim()) { valid = false; f.style.borderColor = 'var(--red)' }
      else f.style.borderColor = ''
    })
    if (!valid) {
      toast(t('auth.errRequired'), 'error')
      return
    }
    const order = {
      id: 'LG-' + Date.now().toString().slice(-6),
      date: new Date().toISOString(),
      total,
      items: cart,
      userId: user?.id || null,
      customer: {
        first: form.coFirst.value.trim(),
        last: form.coLast.value.trim(),
        phone: form.coPhone.value.trim(),
        email: form.coEmail.value.trim(),
        city: form.coCity.value.trim(),
        address: form.coAddress.value.trim(),
        notes: form.coNotes.value.trim(),
      },
      delivery: deliveryType,
      payment,
      status: 'Новый',
    }
    const orders = readJSON('lale_orders', [])
    orders.unshift(order)
    writeJSON('lale_orders', orders)
    clear()
    setOrderId(order.id)
    toast(t('checkout.success'))
  }

  return (
    <>
      <PageHead
        title={t('checkout.title')}
        sub={t('checkout.sub')}
        crumbs={[{ label: t('cart.title'), to: '/cart' }, { label: t('checkout.title') }]}
      />
      <section className="section">
        <div className="container">
          <div className="cart-layout">
            <form id="checkoutForm" className="summary" style={{ position: 'static' }} onSubmit={onSubmit}>
              <h3>{t('checkout.contact')}</h3>
              <div className="form-grid">
                <div className="form-field"><label>{t('checkout.first')}</label><input className="field" name="coFirst" required defaultValue={user?.first || ''} /></div>
                <div className="form-field"><label>{t('checkout.last')}</label><input className="field" name="coLast" required defaultValue={user?.last || ''} /></div>
                <div className="form-field"><label>{t('checkout.phone')}</label><input className="field" name="coPhone" type="tel" required defaultValue={user?.phone || ''} /></div>
                <div className="form-field"><label>{t('checkout.email')}</label><input className="field" name="coEmail" type="email" required defaultValue={user?.email || ''} /></div>
                <div className="form-field"><label>{t('checkout.city')}</label><input className="field" name="coCity" required /></div>
                <div className="form-field"><label>{t('checkout.address')}</label><input className="field" name="coAddress" required /></div>
                <div className="form-field full"><label>{t('checkout.notes')}</label><textarea className="field" name="coNotes" /></div>
              </div>

              <h3 style={{ marginTop: 30 }}>{t('checkout.delivery')}</h3>
              <div className="form-grid">
                <label className={`radio-card${deliveryType === 'delivery' ? ' active' : ''}`}>
                  <input type="radio" name="delivery" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} />
                  <div><div className="rc-title with-ico"><Icon name="truck" size={18} />{t('checkout.deliveryHome')}</div><div className="rc-sub">{t('checkout.deliveryHomeSub')}</div></div>
                </label>
                <label className={`radio-card${deliveryType === 'pickup' ? ' active' : ''}`}>
                  <input type="radio" name="delivery" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} />
                  <div><div className="rc-title with-ico"><Icon name="store" size={18} />{t('checkout.pickup')}</div><div className="rc-sub">{t('checkout.pickupSub')}</div></div>
                </label>
              </div>

              <h3 style={{ marginTop: 30 }}>{t('checkout.payment')}</h3>
              <div className="form-grid">
                <label className={`radio-card${payment === 'card' ? ' active' : ''}`}>
                  <input type="radio" name="payment" checked={payment === 'card'} onChange={() => setPayment('card')} />
                  <div><div className="rc-title with-ico"><Icon name="card" size={18} />{t('checkout.card')}</div><div className="rc-sub">{t('checkout.cardSub')}</div></div>
                </label>
                <label className={`radio-card${payment === 'cash' ? ' active' : ''}`}>
                  <input type="radio" name="payment" checked={payment === 'cash'} onChange={() => setPayment('cash')} />
                  <div><div className="rc-title with-ico"><Icon name="cash" size={18} />{t('checkout.cash')}</div><div className="rc-sub">{t('checkout.cashSub')}</div></div>
                </label>
              </div>
              <button ref={placeRef} className="btn btn-primary btn-block btn-lg" type="submit" style={{ marginTop: 28 }}>{t('checkout.place')}</button>
            </form>

            <aside className="summary">
              <h3>{t('checkout.summary')}</h3>
              {!cart.length ? <p className="muted">{t('checkout.emptyCart')}</p> : (
                <>
                  {cart.map((item) => {
                    const p = get(item.id)
                    if (!p) return null
                    return (
                      <div className="summary-row" key={p.id}>
                        <span>{name(p)} × {item.qty}</span>
                        <span>{formatPrice(p.price * item.qty)}</span>
                      </div>
                    )
                  })}
                  <div className="summary-row total"><span>{t('cart.subtotal')}</span><span><RollingNumber value={subtotal} suffix=" TMT" /></span></div>
                  <div className="summary-row"><span>{t('cart.delivery')}</span><span>{delivery === 0 ? t('cart.free') : formatPrice(delivery)}</span></div>
                  <div className="summary-row total"><span>{t('cart.grand')}</span><span><RollingNumber value={total} suffix=" TMT" /></span></div>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>

      <div className={`modal${orderId ? ' show' : ''}`} onClick={() => setOrderId('')}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="m-icon"><Icon name="check" size={34} /></div>
          <h3>{t('checkout.success')}</h3>
          <p className="muted">{t('checkout.successText')}</p>
          <p><strong>{t('checkout.orderNo')}</strong>: {orderId}</p>
          <Link className="btn btn-primary btn-block" to="/">{t('checkout.back')}</Link>
        </div>
      </div>
    </>
  )
}
