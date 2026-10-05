import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import { CardTilt, ScrollProgress } from '../motion/Ambient'
import { QuickViewProvider } from '../motion/QuickView'

export default function Layout() {
  const { pathname } = useLocation()

  // New page -> start at the top (smooth motion is handled by the fade-in)
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }) }, [pathname])

  // QuickViewProvider sits inside the router, so links in the preview work
  return (
    <QuickViewProvider>
      <ScrollProgress enabled={/^\/(about|delivery|product\/)/.test(pathname)} />
      <CardTilt />
      <Header />
      <main>
        {/* keyed by path: each page change replays the soft fade-up */}
        <div className="page-enter" key={pathname}>
          <Outlet />
        </div>
      </main>
      <Footer />
      <BottomNav />
    </QuickViewProvider>
  )
}
