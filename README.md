# PPB API - Penjualan Barang

Proyek ini adalah RESTful API untuk Sistem Penjualan Barang, dibangun menggunakan **Node.js**, **Express.js**, dan **Supabase** (PostgreSQL). Proyek ini merupakan bagian dari praktikum Pemrograman Perangkat Bergerak (PPB).

## Persyaratan Sistem
Pastikan perangkat Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
- [pnpm](https://pnpm.io/) (versi 10 atau lebih baru) — manajer paket yang dipakai proyek ini
- Git (opsional, untuk *cloning* repositori)
- [Postman](https://www.postman.com/) (untuk pengujian API)

## Struktur Basis Data (Supabase)
Pastikan Anda sudah menjalankan *query* berikut di SQL Editor Supabase Anda sebelum menjalankan program:

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text
);

create table products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  name text not null,
  description text,
  category_id uuid references categories(id),
  price numeric(12,2) default 0,
  stock integer default 0
);
```

## Cara Instalasi dan Menjalankan Program

1. **Clone Repositori (Jika menggunakan Git)**
   ```bash
   git clone <URL_REPOSITORY_ANDA>
   cd PPB_API
   ```

2. **Instal Dependensi**
   Buka terminal di dalam folder proyek, lalu jalankan:
   ```bash
   pnpm install
   ```

3. **Konfigurasi *Environment Variables***
   - Buat sebuah file baru bernama `.env` di folder utama (sejajar dengan `package.json`).
   - Salin dan tempel format berikut ke dalam file `.env`:
     ```env
     SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
     SUPABASE_KEY=anon-public-key-anda
     PORT=3000
     ```
   - **Catatan:** Ganti `SUPABASE_URL` dan `SUPABASE_KEY` dengan kredensial yang bisa Anda dapatkan di menu **Project Settings -> API** di *dashboard* Supabase Anda.

4. **Jalankan Server API**
   Untuk mode *development* (otomatis me-*restart* server jika ada perubahan kode), jalankan:
   ```bash
   pnpm dev
   ```
   Atau untuk mode *production*:
   ```bash
   pnpm start
   ```

5. **Server Berjalan**
   Jika berhasil, Anda akan melihat pesan berikut di terminal:
   ```text
   Server running on port 3000
   ```
   API Anda sekarang dapat diakses melalui `http://localhost:3000`

## Dokumentasi Endpoint Pelanggan

### `GET /api/customers` — daftar pelanggan (pencarian + pagination)

Query parameter (semua opsional):

| Parameter | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `name` | string | – | Menampilkan pelanggan yang kolom `name`-nya mengandung kata kunci (tidak membedakan huruf besar/kecil) |
| `page` | integer ≥ 1 | `1` | Halaman yang diminta |
| `limit` | integer ≥ 1 | `10` | Jumlah item per halaman |

Contoh: `GET /api/customers?name=budi&page=2&limit=5`

Response `200 OK`:

```json
{
  "page": 2,
  "limit": 5,
  "total": 12,
  "totalPages": 3,
  "data": [ "...daftar pelanggan pada halaman ini..." ]
}
```

`total` adalah jumlah seluruh pelanggan yang cocok dengan filter `name`, `totalPages` adalah `ceil(total / limit)`. Jika `page`/`limit` diisi bukan bilangan bulat positif, server membalas `400` dengan `{ "error": "Invalid page: must be a positive integer" }`.

### `POST /api/customers` dan `PUT /api/customers/:id` — validasi input

| Field | Aturan | Pesan error |
| --- | --- | --- |
| `email` | wajib string dan mengandung karakter `@` | `Email must contain '@'` |
| `phone` | wajib string minimal 10 karakter | `Phone must be at least 10 characters` |

Jika input tidak valid, server membalas `400 Bad Request` dengan `{ "error": "<pesan>" }` dan data tidak disimpan/diubah.

### `GET /api/reports/total` — total pelanggan

Response `200 OK`:

```json
{ "total": 12 }
```

## Deploy ke Netlify

Selain dijalankan lokal, API ini bisa di-*deploy* ke Netlify sebagai *serverless function*. Berkas konfigurasinya:

- `netlify/functions/api.mjs` — membungkus aplikasi Express (`src/index.js`) memakai `serverless-http`.
- `netlify.toml` — *rewrite* `/api/*` ke function tersebut, sehingga URL publiknya tetap `/api/customers`, `/api/reports/total`, dan seterusnya. `publish = "public"` hanya *placeholder* karena tidak ada frontend yang di-*deploy*.

Langkah *deploy*:

1. Set *environment variables* di Netlify (**Site configuration → Environment variables**): `SUPABASE_URL` dan `SUPABASE_KEY`. File `.env` tidak ikut ter-*deploy* karena ada di `.gitignore`.
2. *Deploy* lewat Git (hubungkan repositori ke Netlify) atau lewat CLI:
   ```bash
   pnpm dlx netlify-cli deploy --prod
   ```
3. Endpoint dapat diakses di `https://<nama-site>.netlify.app/api/customers`, `https://<nama-site>.netlify.app/api/reports/total`, dan seterusnya.

Catatan: aplikasi Express berjalan di dalam Netlify Functions, sehingga berlaku batas platform tersebut (ada *cold start*, batas durasi eksekusi 10 detik *default*/maksimum 26 detik, tanpa proses server yang hidup terus). Aplikasi ini *stateless* — semua data ada di Supabase — sehingga `app.listen()` sengaja ditaruh di `src/server.js` yang hanya dipakai oleh `pnpm start`/`pnpm dev` di lokal.

## Pengujian dengan Postman
Untuk cara menguji semua *endpoint* (GET, POST, PUT, DELETE), silakan lihat panduan JSON manual atau *import collection* yang telah disediakan pada saat praktikum.
