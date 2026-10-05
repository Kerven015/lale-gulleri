import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CATEGORIES, DEFAULT_PRODUCTS } from '../data/catalog'
import { readJSON, writeJSON } from '../utils/storage'
import { productDesc, productImage, productName } from '../utils/productHelpers'
import { useI18n } from './I18nContext'
import { OTHER_TYPE, customTypes, isCustomTypeKey } from '../utils/productTypes'

const ADMIN_KEY = 'lale_admin_products'
const ProductsContext = createContext(null)

function emptyAdmin() {
  return { custom: [], overrides: {}, deleted: [] }
}

function loadAdmin() {
  const d = readJSON(ADMIN_KEY, emptyAdmin())
  return {
    custom: Array.isArray(d.custom) ? d.custom : [],
    overrides: d.overrides && typeof d.overrides === 'object' ? d.overrides : {},
    deleted: Array.isArray(d.deleted) ? d.deleted : [],
  }
}

// JSON copy instead of structuredClone: works on older phones/browsers too.
const clone = (v) => JSON.parse(JSON.stringify(v))

function rebuild(admin) {
  const list = []
  DEFAULT_PRODUCTS.forEach((p) => {
    if (admin.deleted.includes(p.id)) return
    const copy = clone(p)
    const ov = admin.overrides[p.id]
    if (ov) Object.keys(ov).forEach((k) => { copy[k] = ov[k] })
    list.push(copy)
  })
  admin.custom.forEach((p) => list.push(clone(p)))
  return list
}

export function ProductsProvider({ children }) {
  const { lang, t } = useI18n()
  const [admin, setAdmin] = useState(loadAdmin)
  const products = useMemo(() => rebuild(admin), [admin])

  const persist = useCallback((next) => {
    const ok = writeJSON(ADMIN_KEY, next)
    if (ok) setAdmin(next)
    return ok
  }, [])

  const get = useCallback((id) => {
    const n = parseInt(id, 10)
    return products.find((p) => p.id === n) || null
  }, [products])

  // Label for a category / filter key. Custom types ('other:pion') show the
  // text the admin typed.
  const catName = useCallback((key) => {
    const cat = CATEGORIES[key]
    if (cat) return t(cat.key)
    if (key === OTHER_TYPE) return t('cat.other')
    if (isCustomTypeKey(key)) return customTypes(products).find((c) => c.key === key)?.label || t('cat.other')
    return key
  }, [t, products])

  // Flower type shown on cards, product page, cart and admin.
  const typeName = useCallback((p) => {
    if (p?.cat === OTHER_TYPE) return String(p.customType || '').trim() || t('cat.other')
    return catName(p?.cat)
  }, [catName, t])

  const value = useMemo(() => ({
    products,
    admin,
    defaults: DEFAULT_PRODUCTS,
    categories: CATEGORIES,
    persist,
    get,
    catName,
    typeName,
    name: (p) => productName(p, lang),
    desc: (p) => productDesc(p, lang),
    image: productImage,
  }), [products, admin, persist, get, catName, typeName, lang])

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  return useContext(ProductsContext)
}
