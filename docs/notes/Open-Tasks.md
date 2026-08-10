# Open Tasks

## Active
- [ ] Fix gambar tidak tampil di halaman `admin/products`
- [ ] Ubah tampilan product menjadi table + pagination + search
- [ ] Hapus input URL gambar, ganti dengan upload image (single & multiple)
- [ ] Tambah field `image1`-`image6` di database + migration
- [ ] Pastikan gambar tampil di halaman admin DAN user

## Backend (API-EXCHANGE)
- [ ] Migration: tambah kolom `image1`-`image6` di table products
- [ ] Controller: handle upload 6 gambar
- [ ] Resource: return `image1`-`image6` URLs
- [ ] Endpoint: upload gambar (POST `/admin/products/{id}/images`)
- [ ] Endpoint: delete gambar (DELETE `/admin/products/{id}/images/{index}`)
