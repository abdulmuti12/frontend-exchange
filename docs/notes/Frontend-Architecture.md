# Frontend Architecture

## API Layer
- `src/lib/api.ts` — 2 axios instance terpisah:
  - Admin: auto-attach `ep_admin_token`, redirect `/admin/login` saat 401
  - User: auto-attach `ep_user_token`, redirect `/login` saat 401
- Base URL dari `.env.local` → `NEXT_PUBLIC_API_BASE_URL`

## Auth Flow
- `src/lib/auth.tsx` — AuthContext dengan provider untuk admin & user
- Session storage: `localStorage` (bukan cookies)
- Kedua role bisa login bersamaan di browser yang sama

## Routing (Next.js App Router)
- `/` — landing page
- `/login`, `/register` — user auth (public)
- `/admin/login` — admin auth (public)
- `/user/*` — user dashboard (guarded)
- `/admin/*` — admin dashboard (guarded, route group)

## Component Structure
- `ui/` — primitives: Button, Field, Modal, Stamp/badge
- `layout/` — Shell (sidebar + topbar), AuthCard
- `admin/` — MasterDataManager (CRUD brand/kategori)
- `ChatPanel.tsx` — chat dengan polling 4 detik, aktif saat status `checking`

## Image Handling
- Field `images` pada furnitur: array URL langsung saat create/update
- Produk admin: gambar dikelola via endpoint khusus (`POST/DELETE /admin/products/{id}/images`)
