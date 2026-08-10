# API Reference

Base: `NEXT_PUBLIC_API_BASE_URL` (default: `http://127.0.0.1:8088/api`)

## Admin Endpoints
- `GET/POST /admin/products` — list & create product
- `PUT /admin/products/{id}` — update product (TIDAK update gambar)
- `POST /admin/products/{id}/images` — upload gambar
- `DELETE /admin/products/{id}/images` — delete gambar
- `GET/POST /admin/brands` — master brand
- `GET/POST /admin/categories` — master kategori
- `GET/POST /admin/orders` — manage orders
- `GET/POST /admin/users` — manage users

## User Endpoints
- `POST /login`, `POST /register` — auth
- `GET /user/products` — catalog
- `GET /user/my-furniture` — furniture saya
- `GET /user/transactions` — transaksi
- `POST /user/transactions/{id}/chat` — chat (polling)

## Auth Headers
- Admin: `Authorization: Bearer {ep_admin_token}`
- User: `Authorization: Bearer {ep_user_token}`
