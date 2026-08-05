# Tukar — Frontend (Next.js)

Frontend untuk **Exchange Product API**, dengan dua area terpisah:

- **`/` `/login` `/register`** — landing & autentikasi pengguna
- **`/user/*`** — dashboard pengguna (katalog, furnitur saya, transaksi, notifikasi, profil)
- **`/admin/login`** — autentikasi admin
- **`/admin/*`** — dashboard admin (statistik, produk, brand, kategori, transaksi, kelola admin)

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- axios (2 instance terpisah untuk token admin & user, auto-attach header + auto-redirect saat 401)
- sonner (toast), lucide-react (ikon)
- Font: Fraunces (display), Inter (body), IBM Plex Mono (data/ID) via `@fontsource` (bundled, tidak butuh koneksi ke Google Fonts saat build)

## Menjalankan secara lokal

Pastikan backend **Exchange Product API** sudah berjalan (default: `http://127.0.0.1:8088/api`, sesuai dokumentasi API).

```bash
pnpm install
cp .env.local.example .env.local   # sesuaikan NEXT_PUBLIC_API_BASE_URL bila perlu
pnpm dev
```

Buka `http://localhost:3000`.

- Login admin bawaan (dari seeder): `admin@example.com` / `password123`
- Login user bawaan (dari seeder): `user@example.com` / `password123`

## Build produksi

```bash
pnpm build
pnpm start
```

## Struktur penting

```
src/
  lib/
    api.ts        # axios instance per-role (admin/user), interceptor token & 401
    auth.tsx       # AuthContext + provider untuk admin & user
    types.ts       # tipe data mengikuti dokumentasi API
    utils.ts       # helper (format tanggal, resolve URL gambar, status label/warna)
  components/
    ui/            # primitives (Button, Field, Modal, Stamp/status badge, dll)
    layout/        # Shell (sidebar+topbar), AuthCard
    admin/         # MasterDataManager (CRUD brand/kategori)
    ChatPanel.tsx  # chat polling, dipakai user & admin
  app/
    login, register, admin/login      # halaman publik
    user/**                           # area pengguna (guarded)
    admin/(protected)/**              # area admin (guarded; route group agar /admin/login tidak ikut ter-guard)
```

## Catatan implementasi

- Sesi admin dan pengguna disimpan terpisah di `localStorage` (`ep_admin_token` / `ep_user_token`), sehingga kedua role bisa login bersamaan di browser yang sama (dua tab).
- Field `images` pada **furnitur** dikirim langsung sebagai array URL saat create/update (sesuai spesifikasi). Untuk **produk** di sisi admin, gambar pada produk yang sudah ada dikelola lewat endpoint gambar khusus (`POST/DELETE /admin/products/{id}/images`) karena `PUT /admin/products/{id}` tidak memperbarui gambar (sesuai dokumentasi).
- Chat hanya aktif saat status transaksi `checking`, dengan polling setiap 4 detik selama panel terbuka.
- Notifikasi & badge status menggunakan komponen "stamp" bertema tiket pertukaran sebagai elemen visual khas aplikasi.


untuk frontendnya  di folder Downloads/exchange-app
untuk backendnya di htdocs/exchange-products

pebaiki agar gmabar yang di upload tampil di halaman admin/products
dan bentuk tampilannya dalam bentuk table pagination dan ada fitur pencariannya



di product hapus jangan ada input url gambar 
hanya upload gambar saja

di admin/products bagian create sama editnya juga sama perbaiki hanya upload gambar saja dengan input multiple gambar

jika sudah di upload gambar harus bisa ditampilkan di adminataupun di user


untuk database product

tambahkan dimigration dan dicontrollernya dan lainya
field
image1,image2,image3,image4,image5,image6


di fe untuk upload gambar dan napilkan gambarnya dari data gambar yang ini saja
dan backednnya juga sama modifiksi