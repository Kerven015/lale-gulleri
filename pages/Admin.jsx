import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PageHead from '../components/PageHead'
import { useI18n } from '../contexts/I18nContext'
import { useProducts } from '../contexts/ProductsContext'
import { useToast } from '../contexts/ToastContext'
import { productPhotos } from '../utils/productHelpers'
import PhotoUploader, { photoFromUrl } from '../components/PhotoUploader'
import AdminCatalog from '../components/AdminCatalog'
import ConfirmDelete from '../components/ConfirmDelete'
import DescriptionEditor, { detailsFromProduct, emptyDetails } from '../components/DescriptionEditor'
import {
  ADMIN_SESSION_KEY,
  ADMIN_TYPES,
  MAX_PHOTOS,
  addProduct,
  buildProduct,
  checkCredentials,
  nextId,
  removeProduct,
  removeProducts,
  updateProduct,
  validateForm,
} from '../utils/adminProducts'
import { OTHER_TYPE, TAG_OPTIONS, editableTags } from '../utils/productTypes'
import Icon from '../components/Icons'

const TEXT = {
  tm: {
    title: 'Admin panel', sub: 'Gülleri goşmak, üýtgetmek we pozmak',
    login: 'Admin girişi', user: 'Ulanyjy ady', pass: 'Parol', enter: 'Girmek',
    badLogin: 'Ulanyjy ady ýa-da parol nädogry.', logout: 'Çykmak',
    list: 'Saýtdaky ähli güller', add: 'Täze gül goşmak',
    photo: 'Surat', name: 'Ady', type: 'Görnüşi', price: 'Bahasy (TMT)', old: 'Köne bahasy (arzanladyş, hökman däl)',
    save: 'Goşmak', del: 'Pozmak', confirm: 'Bu güli pozmalymy?', view: 'Gör',
    added: 'Gül goşuldy', deleted: 'Gül pozuldy', full: 'Ýatda saklap bolmady: brauzerde ýer ýetenok. Käbir suratlary aýyryň.',
    eName: 'Ady giriziň.', eType: 'Görnüşi saýlaň.', ePrice: 'Dogry baha giriziň.', eOld: 'Köne baha täze bahadan uly bolmaly.', eImage: 'Iň bolmanda bir surat goşuň.', eFile: 'Bu faýl surat däl.',
    total: 'Jemi', empty: 'Gül ýok.',
    edit: 'Güli üýtgetmek', editBtn: 'Üýtgetmek', saveEdit: 'Üýtgetmeleri ýatda saklamak', cancel: 'Ýatyr', updated: 'Üýtgetmeler ýatda saklandy',
    occasions: 'Haýsy pursat üçin (menýu bölümleri)', occHint: 'Bir ýa-da birnäçe bölüm saýlaň. Gül şol bölümleriň sahypalarynda görüner.', eOcc: 'Iň bolmanda bir bölüm saýlaň.',
    customType: 'Gülüň görnüşi', customPh: 'meselem, Pion', eCustom: 'Gülüň görnüşini ýazyň.',
    photos: 'Suratlar', choose: 'Surat saýla', main: 'Esasy',
    photosHint: 'Suratlary şu ýere süýräň, faýl saýlaň ýa-da goýuň (Ctrl+V). 8 surata çenli.',
    reorderHint: 'Tertibini üýtgetmek üçin suratlary süýräň. Birinji surat — esasy surat.',
    removePhoto: 'Suraty aýyr', photoN: 'Surat {n}', moveHint: 'Çep/sag ok düwmeleri bilen ýerini üýtgediň',
    maxPhotos: 'Iň köp 8 surat goşup bolýar.', failed: 'Ýüklenmedi', wait: 'Suratlar ýüklenýänçä garaşyň.',
    storage: 'Brauzer ýady: {u} MB / ~5 MB',
    search: 'Ady boýunça gözle...', select: 'Saýlamak', selectedN: '{n} saýlandy',
    selectAll: 'Hemmesini saýla', unselectAll: 'Saýlawy aýyr', deleteN: 'Pozmak ({n})',
    confirmTitle1: 'Harydy pozmak', confirmTitleN: '{n} harydy pozmak',
    confirmText1: 'Bu harydy pozmak isleýändigiňize ynanýarsyňyzmy? Muny yzyna gaýtaryp bolmaýar.',
    confirmTextN: 'Saýlanan {n} harydy pozmak isleýändigiňize ynanýarsyňyzmy? Muny yzyna gaýtaryp bolmaýar.',
    deletedN: '{n} haryt pozuldy',
    descTitle: 'Beýany', descHint: 'Hökman däl. Her dil üçin aýratyn ýazyň; terjimesi ýok dil üçin beýleki dildäki tekst görkeziler.',
    descText: 'Beýany', descPh: 'Gül hakda gysgaça ýazyň...', descClear: 'Bu dili arassala', descFilled: 'doldurylan',
    bold: 'Galyň', italic: 'Ýapgyt', listBtn: 'Sanaw',
    composition: 'Düzümi', compositionPh: 'meselem, 51 gülgüne gül, gaplama, lenta',
    size: 'Ölçegi', sizePh: 'meselem, beýikligi 60 sm / ini 40 sm',
    care: 'Ideg maslahatlary', carePh: 'meselem, suwy her gün çalşyň, baldaklaryny gyşyk kesiň',
    preview: 'Saýtda şeýle görüner', previewEmpty: 'Beýan ýok — bu bölüm haryt sahypasynda görkezilmez.',
  },
  ru: {
    title: 'Админ-панель', sub: 'Добавление, изменение и удаление цветов',
    login: 'Вход для администратора', user: 'Имя пользователя', pass: 'Пароль', enter: 'Войти',
    badLogin: 'Неверное имя пользователя или пароль.', logout: 'Выйти',
    list: 'Все цветы на сайте', add: 'Добавить цветок',
    photo: 'Фото', name: 'Название', type: 'Тип', price: 'Цена (TMT)', old: 'Старая цена (скидка, необязательно)',
    save: 'Добавить', del: 'Удалить', confirm: 'Удалить этот цветок?', view: 'Смотреть',
    added: 'Цветок добавлен', deleted: 'Цветок удалён', full: 'Не удалось сохранить: в браузере не хватает места. Удалите часть фото.',
    eName: 'Введите название.', eType: 'Выберите тип.', ePrice: 'Введите корректную цену.', eOld: 'Старая цена должна быть больше цены.', eImage: 'Добавьте хотя бы одно фото.', eFile: 'Этот файл не является изображением.',
    total: 'Всего', empty: 'Цветов нет.',
    edit: 'Редактировать цветок', editBtn: 'Изменить', saveEdit: 'Сохранить изменения', cancel: 'Отмена', updated: 'Изменения сохранены',
    occasions: 'Повод (разделы меню)', occHint: 'Выберите один или несколько разделов. Цветок появится на их страницах.', eOcc: 'Выберите хотя бы один раздел.',
    customType: 'Свой тип цветка', customPh: 'например, Пионы', eCustom: 'Укажите тип цветка.',
    photos: 'Фото', choose: 'Выбрать фото', main: 'Главное',
    photosHint: 'Перетащите фото сюда, выберите файлы или вставьте (Ctrl+V). До 8 фото.',
    reorderHint: 'Перетаскивайте фото, чтобы изменить порядок. Первое фото — главное.',
    removePhoto: 'Удалить фото', photoN: 'Фото {n}', moveHint: 'Стрелки влево/вправо меняют порядок',
    maxPhotos: 'Можно добавить не больше 8 фото.', failed: 'Ошибка', wait: 'Дождитесь загрузки фото.',
    storage: 'Память браузера: {u} МБ из ~5 МБ',
    search: 'Поиск по названию...', select: 'Выбрать', selectedN: 'Выбрано: {n}',
    selectAll: 'Выбрать все', unselectAll: 'Снять выбор', deleteN: 'Удалить ({n})',
    confirmTitle1: 'Удалить товар', confirmTitleN: 'Удалить товары: {n}',
    confirmText1: 'Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить.',
    confirmTextN: 'Вы уверены, что хотите удалить выбранные товары ({n})? Это действие нельзя отменить.',
    deletedN: 'Удалено товаров: {n}',
    descTitle: 'Описание', descHint: 'Необязательно. Заполните для каждого языка; если перевода нет, покажем текст на другом языке.',
    descText: 'Описание', descPh: 'Коротко расскажите о букете...', descClear: 'Очистить этот язык', descFilled: 'заполнено',
    bold: 'Жирный', italic: 'Курсив', listBtn: 'Список',
    composition: 'Состав', compositionPh: 'например, 51 розовая роза, упаковка, лента',
    size: 'Размер', sizePh: 'например, высота 60 см / ширина 40 см',
    care: 'Советы по уходу', carePh: 'например, меняйте воду каждый день, подрезайте стебли наискосок',
    preview: 'Так будет на сайте', previewEmpty: 'Описания нет — на странице товара этот раздел не показывается.',
  },
  tr: {
    title: 'Yönetim paneli', sub: 'Çiçek ekleme, düzenleme ve silme',
    login: 'Yönetici girişi', user: 'Kullanıcı adı', pass: 'Şifre', enter: 'Giriş yap',
    badLogin: 'Kullanıcı adı veya şifre hatalı.', logout: 'Çıkış yap',
    list: 'Sitedeki tüm çiçekler', add: 'Yeni çiçek ekle',
    photo: 'Fotoğraf', name: 'Adı', type: 'Türü', price: 'Fiyat (TMT)', old: 'Eski fiyat (indirim, isteğe bağlı)',
    save: 'Ekle', del: 'Sil', confirm: 'Bu çiçek silinsin mi?', view: 'Görüntüle',
    added: 'Çiçek eklendi', deleted: 'Çiçek silindi', full: 'Kaydedilemedi: tarayıcıda yer yok. Bazı fotoğrafları kaldırın.',
    eName: 'Ad girin.', eType: 'Tür seçin.', ePrice: 'Geçerli bir fiyat girin.', eOld: 'Eski fiyat, fiyattan büyük olmalı.', eImage: 'En az bir fotoğraf ekleyin.', eFile: 'Bu dosya bir görsel değil.',
    total: 'Toplam', empty: 'Çiçek yok.',
    edit: 'Çiçeği düzenle', editBtn: 'Düzenle', saveEdit: 'Değişiklikleri kaydet', cancel: 'İptal', updated: 'Değişiklikler kaydedildi',
    occasions: 'Özel gün (menü kategorileri)', occHint: 'Bir veya birkaç kategori seçin. Çiçek bu kategorilerin sayfalarında görünür.', eOcc: 'En az bir kategori seçin.',
    customType: 'Çiçek türü', customPh: 'örneğin, Şakayık', eCustom: 'Çiçek türünü yazın.',
    photos: 'Fotoğraflar', choose: 'Fotoğraf seç', main: 'Ana',
    photosHint: 'Fotoğrafları buraya sürükleyin, dosya seçin veya yapıştırın (Ctrl+V). En fazla 8 fotoğraf.',
    reorderHint: 'Sırayı değiştirmek için fotoğrafları sürükleyin. İlk fotoğraf ana fotoğraftır.',
    removePhoto: 'Fotoğrafı kaldır', photoN: 'Fotoğraf {n}', moveHint: 'Sol/sağ ok tuşlarıyla sırayı değiştirin',
    maxPhotos: 'En fazla 8 fotoğraf eklenebilir.', failed: 'Yüklenemedi', wait: 'Fotoğrafların yüklenmesini bekleyin.',
    storage: 'Tarayıcı belleği: {u} MB / ~5 MB',
    search: 'İsme göre ara...', select: 'Seç', selectedN: '{n} seçildi',
    selectAll: 'Tümünü seç', unselectAll: 'Seçimi kaldır', deleteN: 'Sil ({n})',
    confirmTitle1: 'Ürünü sil', confirmTitleN: '{n} ürünü sil',
    confirmText1: 'Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    confirmTextN: 'Seçilen {n} ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    deletedN: '{n} ürün silindi',
    descTitle: 'Açıklama', descHint: 'İsteğe bağlı. Her dil için ayrı yazın; çevirisi olmayan dilde başka dildeki metin gösterilir.',
    descText: 'Açıklama', descPh: 'Buket hakkında kısaca yazın...', descClear: 'Bu dili temizle', descFilled: 'dolu',
    bold: 'Kalın', italic: 'İtalik', listBtn: 'Liste',
    composition: 'İçerik', compositionPh: 'örneğin, 51 pembe gül, ambalaj, kurdele',
    size: 'Boyut', sizePh: 'örneğin, yükseklik 60 cm / genişlik 40 cm',
    care: 'Bakım önerileri', carePh: 'örneğin, suyu her gün değiştirin, sapları çapraz kesin',
    preview: 'Sitede böyle görünecek', previewEmpty: 'Açıklama yok — bu bölüm ürün sayfasında gösterilmez.',
  },
}
const ERR_KEY = { name: 'eName', type: 'eType', customType: 'eCustom', occasions: 'eOcc', price: 'ePrice', old: 'eOld', image: 'eImage' }

const emptyForm = () => ({ name: '', type: 'roses', customType: '', occasions: [], price: '', old: '', photos: [], details: emptyDetails() })

export default function Admin() {
  const { lang, t } = useI18n()
  const L = TEXT[lang] || TEXT.ru
  const { products, admin, persist, defaults, name, catName } = useProducts()
  const { toast } = useToast()

  // Login lives only in this page's memory: every visit to /admin
  // (new tab, reload, coming back from the shop) asks for credentials again.
  const [authed, setAuthed] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [fileKey, setFileKey] = useState(0)
  const [editing, setEditing] = useState(null) // product being edited, null = adding
  const formRef = useRef(null)

  // Clear the "stay logged in" flag left by the previous version of this page.
  useEffect(() => {
    try { localStorage.removeItem(ADMIN_SESSION_KEY) } catch {}
  }, [])

  // Delete flow: confirmation dialog -> fade-out -> save -> message.
  const [confirm, setConfirm] = useState(null) // { items, resolve }
  const [removing, setRemoving] = useState(() => new Set())

  function onLogin(e) {
    e.preventDefault()
    const u = e.target.username.value
    const p = e.target.password.value
    if (!checkCredentials(u, p)) {
      setLoginError(L.badLogin)
      e.target.password.value = ''
      return
    }
    setLoginError('')
    setAuthed(true)
  }

  function resetForm() {
    setEditing(null)
    setForm(emptyForm())
    setErrors({})
    setFileKey((k) => k + 1)
  }

  function onLogout() {
    setAuthed(false)
    resetForm()
  }

  function startEdit(p) {
    setEditing(p)
    setForm({
      name: name(p),
      type: ADMIN_TYPES.includes(p.cat) ? p.cat : OTHER_TYPE,
      customType: p.cat === OTHER_TYPE ? p.customType || '' : '',
      occasions: editableTags(p),
      price: String(p.price ?? ''),
      old: p.old ? String(p.old) : '',
      photos: productPhotos(p).map(photoFromUrl),
      details: detailsFromProduct(p),
    })
    setErrors({})
    setFileKey((k) => k + 1)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function toggleOccasion(key) {
    setForm((f) => ({
      ...f,
      occasions: f.occasions.includes(key) ? f.occasions.filter((k) => k !== key) : [...f.occasions, key],
    }))
    setErrors((er) => ({ ...er, occasions: undefined }))
  }

  // PhotoUploader passes updater functions (photos load in the background).
  const setPhotos = useCallback((fn) => {
    setForm((f) => ({ ...f, photos: fn(f.photos) }))
    setErrors((er) => (er.image ? { ...er, image: undefined } : er))
  }, [])
  const setDetails = useCallback((fn) => setForm((f) => ({ ...f, details: fn(f.details) })), [])
  const onPhotoLimit = useCallback(() => toast(L.maxPhotos, 'error'), [toast, L])
  const storageMb = useMemo(() => {
    try { return (JSON.stringify(admin).length / (1024 * 1024)).toFixed(1) } catch { return '?' }
  }, [admin])

  function onSubmit(e) {
    e.preventDefault()
    if (form.photos.some((p) => p.status === 'loading')) { toast(L.wait, 'error'); return }
    const images = form.photos.filter((p) => p.status === 'done' && p.src).map((p) => p.src)
    const v = validateForm({ ...form, images }, { editing: !!editing })
    if (!v.ok) { setErrors(v.errors); return }
    if (editing) {
      if (!persist(updateProduct(admin, editing, v.data, defaults, lang))) { toast(L.full, 'error'); return }
      toast(L.updated)
    } else {
      const product = buildProduct(v.data, nextId(defaults, admin))
      if (!persist(addProduct(admin, product))) { toast(L.full, 'error'); return }
      toast(L.added)
    }
    resetForm()
  }

  // Resolves true once the products are deleted, false if cancelled.
  function requestDelete(items) {
    return new Promise((resolve) => setConfirm({ items, resolve }))
  }

  function confirmDelete() {
    const { items, resolve } = confirm
    setConfirm(null)
    const ids = items.map((p) => p.id)
    setRemoving(new Set(ids))
    // let the cards fade out, then remove them
    setTimeout(() => {
      const ok = persist(removeProducts(admin, ids, defaults))
      setRemoving(new Set())
      if (ok) {
        if (editing && ids.includes(editing.id)) resetForm()
        toast(ids.length > 1 ? L.deletedN.replace('{n}', ids.length) : L.deleted)
      }
      resolve(ok)
    }, 320)
  }

  function cancelDelete() {
    confirm?.resolve(false)
    setConfirm(null)
  }

  const err = (field) => {
    const code = errors[field]
    if (!code) return null
    const msg = code === 'file' ? L.eFile : L[ERR_KEY[field]]
    return <small role="alert" style={{ color: 'var(--red)', fontWeight: 600 }}>{msg}</small>
  }

  if (!authed) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <h1 className="with-ico"><Icon name="lock" size={24} />{L.login}</h1>
          <form onSubmit={onLogin} noValidate>
            <div className="form-field">
              <label htmlFor="adm-user">{L.user}</label>
              <input id="adm-user" className="field" name="username" autoComplete="username" required autoFocus />
            </div>
            <div className="form-field">
              <label htmlFor="adm-pass">{L.pass}</label>
              <input id="adm-pass" className="field" name="password" type="password" autoComplete="current-password" required />
            </div>
            {loginError && (
              <p role="alert" style={{ color: 'var(--red)', fontWeight: 700, margin: '4px 0 14px' }}>{loginError}</p>
            )}
            <button className="btn btn-primary btn-block" type="submit">{L.enter}</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHead title={L.title} sub={L.sub} crumbs={[{ label: L.title }]} />
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <button className="btn btn-outline btn-sm" type="button" onClick={onLogout}><Icon name="logout" size={16} />{L.logout}</button>
          </div>

          <div className="adm-form-wrap">
            <form ref={formRef} className="summary" style={{ position: 'static', scrollMarginTop: 140 }} onSubmit={onSubmit} noValidate>
              <h3 className="with-ico">
                <Icon name={editing ? 'edit' : 'plus'} size={20} />{editing ? L.edit : L.add}
              </h3>
              {editing && (
                <p className="muted" style={{ margin: '-4px 0 14px', fontWeight: 600 }}>{name(editing)}</p>
              )}
              <div className="form-field" style={{ marginBottom: 14 }}>
                <label id="adm-photos-label">{L.photos}{editing ? '' : ' *'}</label>
                <PhotoUploader
                  photos={form.photos}
                  onChange={setPhotos}
                  max={MAX_PHOTOS}
                  L={L}
                  inputKey={fileKey}
                  onLimit={onPhotoLimit}
                  error={err('image')}
                />
              </div>
              <div className="form-field" style={{ marginBottom: 14 }}>
                <label htmlFor="adm-name">{L.name} *</label>
                <input id="adm-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {err('name')}
              </div>
              <div className="form-field" style={{ marginBottom: 14 }}>
                <label htmlFor="adm-type">{L.type} *</label>
                <select
                  id="adm-type"
                  className="field"
                  value={form.type}
                  onChange={(e) => { setForm({ ...form, type: e.target.value }); setErrors((er) => ({ ...er, type: undefined, customType: undefined })) }}
                >
                  {ADMIN_TYPES.map((c) => <option key={c} value={c}>{catName(c)}</option>)}
                </select>
                {err('type')}
              </div>
              {form.type === OTHER_TYPE && (
                <div className="form-field" style={{ marginBottom: 14 }}>
                  <label htmlFor="adm-custom-type">{L.customType} *</label>
                  <input
                    id="adm-custom-type"
                    className="field"
                    maxLength={40}
                    placeholder={L.customPh}
                    value={form.customType}
                    autoFocus={!editing}
                    onChange={(e) => { setForm({ ...form, customType: e.target.value }); setErrors((er) => ({ ...er, customType: undefined })) }}
                  />
                  {err('customType')}
                </div>
              )}
              <div className="form-field" style={{ marginBottom: 14 }}>
                <label id="adm-occ-label">{L.occasions} *</label>
                <small className="muted" style={{ display: 'block', marginBottom: 8 }}>{L.occHint}</small>
                <div className="chips" role="group" aria-labelledby="adm-occ-label" style={{ marginBottom: 4 }}>
                  {TAG_OPTIONS.map((o) => {
                    const on = form.occasions.includes(o.key)
                    return (
                      <button
                        key={o.key}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        className={`chip${on ? ' active' : ''}`}
                        onClick={() => toggleOccasion(o.key)}
                      >
                        {on && <Icon name="check" size={14} />}{t(o.label)}
                      </button>
                    )
                  })}
                </div>
                {err('occasions')}
              </div>
              <div className="form-grid" style={{ marginBottom: 18 }}>
                <div className="form-field">
                  <label htmlFor="adm-price">{L.price} *</label>
                  <input id="adm-price" className="field" type="number" min="1" inputMode="numeric" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  {err('price')}
                </div>
                <div className="form-field">
                  <label htmlFor="adm-old">{L.old}</label>
                  <input id="adm-old" className="field" type="number" min="1" inputMode="numeric" value={form.old} onChange={(e) => setForm({ ...form, old: e.target.value })} />
                  {err('old')}
                </div>
              </div>
              <fieldset className="de-section">
                <legend className="with-ico"><Icon name="blossom" size={18} />{L.descTitle}</legend>
                <small className="muted de-hint">{L.descHint}</small>
                <DescriptionEditor value={form.details} onChange={setDetails} L={L} resetKey={fileKey} />
              </fieldset>
              <button className="btn btn-primary btn-block" type="submit">{editing ? L.saveEdit : L.save}</button>
              {editing && (
                <button className="btn btn-outline btn-block" type="button" style={{ marginTop: 10 }} onClick={resetForm}>{L.cancel}</button>
              )}
              <small className="muted" style={{ display: 'block', marginTop: 12, textAlign: 'center' }}>{L.storage.replace('{u}', storageMb)}</small>
            </form>

          </div>

          <div className="adm-catalog">
            <div className="listing-title adm-catalog-head">
              <h2 className="with-ico"><Icon name="box" size={24} />{L.list}</h2>
            </div>
            <AdminCatalog
              products={products}
              L={L}
              removing={removing}
              onEdit={startEdit}
              requestDelete={requestDelete}
            />
          </div>
        </div>
      </section>
      {confirm && <ConfirmDelete items={confirm.items} L={L} onCancel={cancelDelete} onConfirm={confirmDelete} />}
    </>
  )
}
