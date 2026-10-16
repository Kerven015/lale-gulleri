import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Catalog from './pages/Catalog'
import Category from './pages/Category'
import Categories from './pages/Categories'
import Product from './pages/Product'
import CartPage from './pages/CartPage'
import Checkout from './pages/Checkout'
import Favorites from './pages/Favorites'
import About from './pages/About'
import Contact from './pages/Contact'
import Delivery from './pages/Delivery'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import Track from './pages/Track'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Catalog home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/roses" element={<Category />} />
          <Route path="/tulips" element={<Category />} />
          <Route path="/bouquets" element={<Category />} />
          <Route path="/gifts" element={<Category />} />
          <Route path="/category/:cat" element={<Category />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/track" element={<Track />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin.html" element={<Navigate to="/admin" replace />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
