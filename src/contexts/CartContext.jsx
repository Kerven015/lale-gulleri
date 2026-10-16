import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { readJSON, writeJSON } from '../utils/storage'
import { useProducts } from './ProductsContext'
import { useToast } from './ToastContext'
import { useI18n } from './I18nContext'

const CART_KEY = 'lale_cart'
const FAV_KEY = 'lale_favorites'
const FREE_FROM = 200
const DELIVERY_PRICE = 25

const CartContext = createContext(null)

function loadCart() {
  return readJSON(CART_KEY, []).filter((item) => item && item.id != null && item.qty > 0)
}

function loadFavs() {
  return readJSON(FAV_KEY, []).map((v) => parseInt(v, 10)).filter((v) => !Number.isNaN(v))
}

export function CartProvider({ children }) {
  const { get } = useProducts()
  const { toast } = useToast()
  const { t } = useI18n()
  const [cart, setCart] = useState(loadCart)
  const [favorites, setFavorites] = useState(loadFavs)

  const persistCart = useCallback((next) => {
    writeJSON(CART_KEY, next)
    setCart(next)
  }, [])

  const persistFavs = useCallback((next) => {
    writeJSON(FAV_KEY, next)
    setFavorites(next)
  }, [])

  const add = useCallback((id, qty = 1) => {
    id = parseInt(id, 10)
    qty = parseInt(qty, 10) || 1
    if (!get(id)) return false
    const found = cart.find((item) => item.id === id)
    const next = found
      ? cart.map((item) => (item.id === id ? { ...item, qty: item.qty + qty } : item))
      : [...cart, { id, qty }]
    persistCart(next)
    return true
  }, [cart, get, persistCart])

  const setQty = useCallback((id, qty) => {
    id = parseInt(id, 10)
    qty = parseInt(qty, 10)
    let next = [...cart]
    if (qty <= 0) next = next.filter((item) => item.id !== id)
    else next = next.map((item) => (item.id === id ? { ...item, qty } : item))
    persistCart(next)
  }, [cart, persistCart])

  const remove = useCallback((id) => {
    persistCart(cart.filter((item) => item.id !== parseInt(id, 10)))
  }, [cart, persistCart])

  const clear = useCallback(() => persistCart([]), [persistCart])

  const isFavorite = useCallback((id) => favorites.includes(parseInt(id, 10)), [favorites])

  const toggleFavorite = useCallback((id) => {
    id = parseInt(id, 10)
    const has = favorites.includes(id)
    persistFavs(has ? favorites.filter((v) => v !== id) : [...favorites, id])
    return !has
  }, [favorites, persistFavs])

  // Ignore items whose product was deleted in the admin panel, so the shop
  // never shows a broken cart row, favorite card or wrong badge count.
  const liveCart = useMemo(() => cart.filter((i) => get(i.id)), [cart, get])
  const liveFavs = useMemo(() => favorites.filter((id) => get(id)), [favorites, get])

  const count = liveCart.reduce((s, i) => s + i.qty, 0)
  const subtotal = liveCart.reduce((s, i) => {
    const p = get(i.id)
    return p ? s + p.price * i.qty : s
  }, 0)
  const delivery = subtotal === 0 || subtotal >= FREE_FROM ? 0 : DELIVERY_PRICE
  const total = subtotal + delivery

  const notify = useCallback((key, type) => toast(t(key), type), [toast, t])

  const value = useMemo(() => ({
    cart: liveCart,
    favorites: liveFavs,
    add,
    setQty,
    remove,
    clear,
    isFavorite,
    toggleFavorite,
    count,
    favCount: liveFavs.length,
    subtotal,
    delivery,
    total,
    freeFrom: FREE_FROM,
    notify,
  }), [liveCart, liveFavs, add, setQty, remove, clear, isFavorite, toggleFavorite, count, subtotal, delivery, total, notify])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
