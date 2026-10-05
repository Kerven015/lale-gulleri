import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { readJSON, writeJSON } from '../utils/storage'
import { useProducts } from './ProductsContext'
import { useToast } from './ToastContext'
import { useI18n } from './I18nContext'

const CART_KEY = 'lale_cart'
const FAV_KEY = 'lale_favorites'
const FREE_FROM = 200
const DELIVERY_PRICE = 25
const MAX_QTY = 99

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

  // Every change starts from the latest saved list (not the one from the last
  // render), so several changes in a row ("Add all to basket") all count.
  const updateCart = useCallback((fn) => {
    setCart((prev) => {
      const next = fn(prev)
      writeJSON(CART_KEY, next)
      return next
    })
  }, [])

  const add = useCallback((id, qty = 1) => {
    id = parseInt(id, 10)
    qty = Math.max(1, parseInt(qty, 10) || 1)
    if (!get(id)) return false
    updateCart((list) => {
      const found = list.find((item) => item.id === id)
      return found
        ? list.map((item) => (item.id === id ? { ...item, qty: Math.min(MAX_QTY, item.qty + qty) } : item))
        : [...list, { id, qty: Math.min(MAX_QTY, qty) }]
    })
    return true
  }, [get, updateCart])

  // Adds several products in one go (Favorites -> "Add all to basket").
  const addMany = useCallback((ids) => {
    const valid = ids.map((v) => parseInt(v, 10)).filter((id) => get(id))
    if (!valid.length) return false
    updateCart((list) => {
      let next = list
      for (const id of valid) {
        next = next.some((item) => item.id === id)
          ? next.map((item) => (item.id === id ? { ...item, qty: Math.min(MAX_QTY, item.qty + 1) } : item))
          : [...next, { id, qty: 1 }]
      }
      return next
    })
    return true
  }, [get, updateCart])

  const setQty = useCallback((id, qty) => {
    id = parseInt(id, 10)
    qty = parseInt(qty, 10)
    if (Number.isNaN(qty)) return
    updateCart((list) => (qty <= 0
      ? list.filter((item) => item.id !== id)
      : list.map((item) => (item.id === id ? { ...item, qty: Math.min(MAX_QTY, qty) } : item))))
  }, [updateCart])

  const remove = useCallback((id) => {
    updateCart((list) => list.filter((item) => item.id !== parseInt(id, 10)))
  }, [updateCart])

  const clear = useCallback(() => updateCart(() => []), [updateCart])

  const isFavorite = useCallback((id) => favorites.includes(parseInt(id, 10)), [favorites])

  const toggleFavorite = useCallback((id) => {
    id = parseInt(id, 10)
    const has = favorites.includes(id)
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
      writeJSON(FAV_KEY, next)
      return next
    })
    return !has
  }, [favorites])

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
    addMany,
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
    deliveryPrice: DELIVERY_PRICE,
    notify,
  }), [liveCart, liveFavs, add, addMany, setQty, remove, clear, isFavorite, toggleFavorite, count, subtotal, delivery, total, notify])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
