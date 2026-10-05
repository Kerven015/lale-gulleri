# Lale Gülleri — React

React conversion of the static Lale Gülleri flower shop.

## Stack

- Vite + React 18
- React Router 6
- Firebase Auth via CDN (Google login works without `npm install firebase`)
- Existing CSS (`style.css`, `mobile.css`, `responsive.css`, `animations.css`)
- Contexts for theme, i18n (TM / RU / TR), cart, products, auth

## Run

Firebase is loaded from Google's CDN, so `npm install` is small now
(React + Vite + Router only).

```bash
cd lale-gulleri-react
npm install --no-audit --no-fund --verbose
npm run dev
```

If npmjs.org is slow:

```bash
npm install --registry https://registry.npmmirror.com --no-audit --no-fund
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/catalog` | Catalog + filters |
| `/roses` `/tulips` `/bouquets` `/gifts` | Category |
| `/product/:id` | Product |
| `/cart` `/checkout` `/favorites` | Shop |
| `/about` `/contact` `/delivery` | Info |
| `/login` `/register` `/profile` | Auth |
| `/admin` | Admin panel (password `lale2025`) |

Cart, favorites, orders, language and theme stay in `localStorage` under the same keys as the original site (`lale_cart`, `lale_favorites`, `lale_lang`, `lale_theme`, `lale_admin_products`).
