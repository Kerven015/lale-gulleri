import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import { useI18n } from '../contexts/I18nContext'
import Icon from '../components/Icons'

export default function Categories() {
  const { t } = useI18n()
  const items = [
    ['/roses', 'flower', 'cat.roses', 4],
    ['/tulips', 'blossom', 'cat.tulips', 3],
    ['/bouquets', 'sparkles', 'cat.bouquets', 6],
    ['/gifts', 'gift', 'cat.gifts', 2],
    ['/catalog?cat=plants', 'sprout', 'cat.plants', 1],
    ['/catalog?cat=bouquets', 'heart', 'cat.romantic', 6],
  ]
  return (
    <>
      <PageHead title={t('cat.title')} sub={t('cat.sub')} crumbs={[{ label: t('cat.eyebrow') }]} />
      <section className="section">
        <div className="container">
          <div className="cat-grid">
            {items.map(([href, icon, key, n]) => (
              <Link className="cat-card" key={key} to={href}>
                <span className="ci"><Icon name={icon} size={24} /></span>
                <h3>{t(key)}</h3>
                <span>{n} {t('cat.items')}</span>
                <span className="arrow">{t('cat.view')} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
