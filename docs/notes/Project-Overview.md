# Project Overview — Tukar Frontend

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- axios (2 instance: admin & user)
- sonner (toast), lucide-react (icons)
- Font: Fraunces (display), Inter (body), IBM Plex Mono (data/ID)

## Architecture

```
src/
  lib/
    api.ts        # axios per-role, interceptor token & 401
    auth.tsx      # AuthContext + provider (admin & user)
    types.ts      # API types
    utils.ts      # helpers (date, image URL, status)
  components/
    ui/           # primitives (Button, Field, Modal, Stamp)
    layout/       # Shell (sidebar+topbar), AuthCard
    admin/        # MasterDataManager
    ChatPanel.tsx # chat polling
  app/
    login, register, admin/login  # public
    user/**                           # user dashboard
    admin/(protected)/**              # admin dashboard
```

## Key Design Decisions
- Sesi admin & user terpisah di `localStorage` (`ep_admin_token` / `ep_user_token`) — bisa login bersamaan
- Chat aktif saat status transaksi `checking`, polling 4 detik
- Notifikasi & badge pakai komponen "stamp" bertema tiket pertukaran

## Related Projects
- Backend: `htdocs/API-EXCHANGE` (PHP/Laravel)
- Admin Frontend: `htdocs/FrontEnd-Admin-luxury-NextJS-`
