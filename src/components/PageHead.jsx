import { Link } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import AnimatedTitle from '../motion/AnimatedTitle'

export default function PageHead({ title, sub, crumbs = [] }) {
  const { t } = useI18n()
  return (
    <section className="page-head">
      <div className="container">
        <nav className="crumbs">
          <Link to="/">{t('nav.home')}</Link>
          {crumbs.map((c, i) => (
            <span key={i}>
              <span>/</span>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </nav>
        <AnimatedTitle text={title} />
        {sub ? <p>{sub}</p> : null}
      </div>
    </section>
  )
}
