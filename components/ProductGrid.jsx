import { useState } from 'react'
import { useStaggerReveal } from '../motion/motion'
import { useI18n } from '../contexts/I18nContext'
import ProductCard from './ProductCard'
import Icon from './Icons'

// renderCard (optional) draws each product differently, e.g. the admin's cards.
export default function ProductGrid({ products, id, renderCard }) {
  const { t } = useI18n()
  const [box, setBox] = useState(null)
  useStaggerReveal(box)
  if (!products?.length) {
    return (
      <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
        <div className="es-icon"><Icon name="search" size={32} /></div>
        <h3>{t('catalog.none')}</h3>
      </div>
    )
  }
  return (
    <div className="product-grid" id={id} ref={setBox}>
      {products.map((p) => (renderCard ? renderCard(p) : <ProductCard key={p.id} product={p} />))}
    </div>
  )
}
