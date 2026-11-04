# Lesson 4D — Next.js API + Supabase + Prisma (2026-11-04)

Бичлэгээс (≈35 мин) хуулсан код ба алхмууд. Багшийн төсөл: `cat-lab-starter`.

## 1. Cat Lab хэрхэн ажилладаг вэ (FigJam диаграм)

```
STUDENT → Next.js pages ─┬─→ TensorFlow.js (браузерт сургана) → IndexedDB (сургасан model)
                         └─→ API routes /api/photos ─┬─→ Prisma → Postgres (rows: labels, runs)
                                                     └─→ Storage (photo files)
```

- **Дээд хэсэг:** сургалт, таамаглал БРАУЗЕРТ явагдана. Model тэнд хадгалагдана.
- **Доод хэсэг:** зураг, label нь МАНАЙ СЕРВЕРЭЭР дамжиж Supabase руу очно. Мөрүүд → Postgres, файлууд → Storage.
- `NEXTJS → ORM → SQL`, `ORM ⇒ PRISMA`
- API routes = **NEXTJS ROUTES** = **REST API ROUTES**

## 2. Next.js API routes

Folder нь URL болно: `app/api/photos/route.ts` → `/api/photos`.
Файл дотор HTTP method-ийн нэрээр функц export хийнэ: `GET`, `POST`, `DELETE`, `PATCH`.

| Файл | URL |
|---|---|
| `app/api/photos/route.ts` | `/api/photos` |
| `app/api/training/route.ts` | `/api/training` |
| `app/api/photos/[id]/route.ts` | `/api/photos/1234234` (dynamic segment) |

Postman-аар туршсан: `GET /api/photos`, `POST /api/photos` body `{ "name": "elbeg" }` →
`POST works. You sent the name "elbeg".` Folder байхгүй үед `GET /api/training` → **404**, үүсгэсний дараа **200**.

## 3. Supabase төсөл үүсгэх

1. supabase.com → **New project** → нэр `cat-lab`, хүчтэй database password, Region **Asia-Pacific**.
2. **Storage** → `photos` нэртэй bucket үүсгэнэ.
3. Дээд талын **Connect** → **ORM** → **Prisma** сонгоно. Тэнд гарсан `DATABASE_URL`, `DIRECT_URL`-ийг `.env`-д хуулна (`.env.example`-ийг үз; password-ийг өөрийнхөөрөө солино).

## 4. Prisma суулгах

```bash
npm install prisma --save-dev
npx prisma init
```

`npx prisma init` нь `prisma/schema.prisma` ба `prisma.config.ts` үүсгэнэ (`.env`-ийг `.gitignore`-д нэм!).
Дараа нь `schema.prisma`-д `Label`, `Ground` enum ба `Photo` model бичнэ (энэ хавтсанд байгаа).

## 5. Migration

```bash
npx prisma migrate dev --name init
```

- Эхэндээ `Error: P1001 Can't reach database server at localhost:51214` гарсан — `.env`-д Supabase URL биш, local URL байсан. `.env`-ийг Supabase-ийн URL-аар засаад дахин ажиллуулахад `aws-0-ap-southeast-2.pooler.supabase.com:6543` руу холбогдсон.
- 6543 (pgbouncer) порт дээр migrate гацаж магадгүй; migration-д `DIRECT_URL` (5432) хэрэглэдэг.
- Supabase docs: Database → Prisma → `npx prisma migrate dev --name first_prisma_migration`, `npx prisma generate`.

## Энэ хавтсанд

- `app/api/photos/route.ts` — GET/POST
- `app/api/training/route.ts` — GET/POST/DELETE/PATCH
- `app/api/photos/[id]/route.ts` — training-ээс хуулсан (Postman-д `GET works.Training.` буцаасан)
- `prisma/schema.prisma`, `prisma.config.ts`, `.env.example`
