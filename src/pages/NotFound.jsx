import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="empty-state">
          <div className="es-icon">404</div>
          <h3>Page Not Found</h3>
          <p>The specified file was not found on this website.</p>
          <Link className="btn btn-primary" to="/">Home</Link>
        </div>
      </div>
    </section>
  )
}
