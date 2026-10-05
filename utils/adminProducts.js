// Pure helpers for the admin panel. They work on the same data the shop
// already reads: DEFAULT_PRODUCTS (src/data/catalog.js) plus the admin layer
// { custom: [], overrides: {}, deleted: [] } stored by ProductsContext.

export const ADMIN_USER = 'Admin'
export const ADMIN_PASS = 'gul2026'
export const ADMIN_SESSION_KEY = 'lale_admin_session'
import { OTHER_TYPE, TAG_KEYS } from './productTypes'
import { htmlToText, sanitizeHtml } from './richText'

const LANGS = ['tm', 'ru', 'tr']

// Description fields per language, cleaned for saving.
function cleanDetails(details) {
  return Object.fromEntries(LANGS.map((l) => {
    const d = details?.[l] || {}
    const html = sanitizeHtml(d.desc || '')
    const t = (v, max) => String(v || '').trim().slice(0, max)
    return [l, { descHtml: html, desc: htmlToText(html), composition: t(d.composition, 300), size: t(d.size, 120), care: t(d.care, 800) }]
  }))
}

export const MAX_PHOTOS = 8
export const ADMIN_TYPES = ['roses', 'tulips', 'bouquets', 'gifts', 'plants', OTHER_TYPE]

export function checkCredentials(username, password) {
  return username === ADMIN_USER && password === ADMIN_PASS
}

// Card gradient used behind the photo while it loads (same field the
// existing products use).
const TYPE_TONES = {
  roses: ['#e01b24', '#7a0d13'],
  tulips: ['#ffcc4d', '#e0761b'],
  bouquets: ['#d4141c', '#3a0509'],
  gifts: ['#ff7a45', '#d61f5c'],
  plants: ['#9b5de5', '#3d1f6b'],
}

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'flower'
}

export function nextId(defaults, admin) {
  let id = 1000
  for (const p of [...defaults, ...admin.custom]) if (p.id >= id) id = p.id + 1
  for (const d of admin.deleted) if (d >= id) id = d + 1
  return id
}

// Returns { ok: true, data } or { ok: false, errors: { field: messageKey } }
// form.images = photo URLs in order (first = main photo), up to MAX_PHOTOS.
// opts.editing: a product may be saved without photos (it keeps the drawn
// placeholder, like the shop's own products without a photo).
export function validateForm(form, opts = {}) {
  const errors = {}
  const name = String(form.name || '').trim()
  if (!name) errors.name = 'name'
  if (!ADMIN_TYPES.includes(form.type)) errors.type = 'type'
  const customType = String(form.customType || '').trim().replace(/\s+/g, ' ').slice(0, 40)
  if (form.type === OTHER_TYPE && !customType) errors.customType = 'customType'
  const occasions = TAG_KEYS.filter((k) => (form.occasions || []).includes(k))
  if (!occasions.length) errors.occasions = 'occasions'
  const price = Number(form.price)
  if (form.price === '' || !Number.isFinite(price) || price <= 0) errors.price = 'price'
  let old = null
  if (String(form.old ?? '').trim() !== '') {
    old = Number(form.old)
    if (!Number.isFinite(old) || old <= price) errors.old = 'old'
  }
  const images = (form.images || []).filter((s) => typeof s === 'string' && s).slice(0, MAX_PHOTOS)
  if (!images.length && !opts.editing) errors.image = 'image'
  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    data: {
      name,
      type: form.type,
      customType: form.type === OTHER_TYPE ? customType : '',
      occasions,
      price: Math.round(price),
      old: old === null ? null : Math.round(old),
      images,
      details: cleanDetails(form.details),
    },
  }
}

// Builds a product with exactly the same fields as the existing catalog items.
export function buildProduct(data, id) {
  return {
    id,
    slug: `${slugify(data.name)}-${id}`,
    cat: data.type,
    ...(data.type === OTHER_TYPE ? { customType: data.customType } : {}),
    occasions: data.occasions,
    price: data.price,
    old: data.old,
    rating: 0,
    reviews: 0,
    colors: [],
    isNew: true,
    inStock: true,
    tones: TYPE_TONES[data.type] || ['#e01b24', '#7a0d13'],
    image: data.images[0],
    images: data.images,
    i18n: Object.fromEntries(LANGS.map((l) => [l, { name: data.name, ...(data.details?.[l] || { desc: '' }) }])),
  }
}

export function addProduct(admin, product) {
  return { ...admin, custom: [...admin.custom, product] }
}

// Saves changes to an existing product. Shop products are changed through
// admin.overrides (the original data stays untouched), admin-added ones are
// replaced in admin.custom. lang = language the admin is working in.
export function updateProduct(admin, original, data, defaults, lang) {
  const names = ['tm', 'ru', 'tr'].map((l) => original.i18n?.[l]?.name || '')
  const sameEverywhere = names.every((n) => n === names[0])
  const i18n = JSON.parse(JSON.stringify(original.i18n || {}))
  for (const l of ['tm', 'ru', 'tr']) i18n[l] = i18n[l] || { name: '', desc: '' }
  if ((i18n[lang]?.name || '') !== data.name) {
    // One name for every language (like a new product) unless the product
    // already has separate translations; then only this language changes.
    for (const l of sameEverywhere ? ['tm', 'ru', 'tr'] : [lang]) i18n[l] = { ...i18n[l], name: data.name }
  }
  // description, composition, size, care (empty fields clear them)
  if (data.details) for (const l of LANGS) i18n[l] = { ...i18n[l], ...data.details[l] }
  const fields = {
    cat: data.type,
    customType: data.type === OTHER_TYPE ? data.customType : null,
    occasions: data.occasions,
    price: data.price,
    old: data.old,
    i18n,
  }
  // Photos in order; `image` (the first one) is what cards and the cart show.
  fields.images = data.images
  fields.image = data.images[0] || null
  if (!data.images.length) fields.tones = original.tones || TYPE_TONES[data.type] || ['#e01b24', '#7a0d13']

  if (defaults.some((p) => p.id === original.id)) {
    return { ...admin, overrides: { ...admin.overrides, [original.id]: { ...(admin.overrides[original.id] || {}), ...fields } } }
  }
  return { ...admin, custom: admin.custom.map((p) => (p.id === original.id ? { ...p, ...fields } : p)) }
}

export function removeProduct(admin, id, defaults) {
  const next = {
    custom: admin.custom.filter((p) => p.id !== id),
    overrides: { ...admin.overrides },
    deleted: [...admin.deleted],
  }
  delete next.overrides[id]
  if (defaults.some((p) => p.id === id) && !next.deleted.includes(id)) next.deleted.push(id)
  return next
}

// Deletes several products at once. Their photos go with them: photos of
// admin-added products and photos added to shop products are stored inside
// the product data, so removing the product frees that space.
export function removeProducts(admin, ids, defaults) {
  return ids.reduce((acc, id) => removeProduct(acc, id, defaults), admin)
}

// Same category order as the catalog filter; inside a type the catalog's
// default order is kept. Empty types are left out.
export function groupByType(products) {
  return ADMIN_TYPES
    .map((type) => ({ type, items: products.filter((p) => p.cat === type) }))
    .filter((g) => g.items.length)
}
