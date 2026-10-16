import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { I18nProvider } from './contexts/I18nContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProductsProvider } from './contexts/ProductsContext'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import { DeliveryProvider } from './contexts/DeliveryContext'
import './styles/style.css'
import './styles/animations.css'
import './styles/responsive.css'
import './styles/mobile.css'
import './styles/extra.css'
import './styles/storefront.css'
import './styles/gallery.css'
import './styles/admin.css'
import './styles/card.css'
import './styles/description.css'
import './styles/nav-icons.css'
import './styles/motion.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <ProductsProvider>
            <CartProvider>
              <AuthProvider>
                <DeliveryProvider>
                  <App />
                </DeliveryProvider>
              </AuthProvider>
            </CartProvider>
          </ProductsProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
