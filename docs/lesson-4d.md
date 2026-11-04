# Lesson 4D — Next.js API + Supabase + Prisma (2026-11-04)

Хичээлийн бичлэг: `~/Desktop/Lesson 4D/`. Энэ тэмдэглэл нь хичээл дээр заасан зүйлс энэ төслийн аль хэсэгт байгааг харуулна.

## 1. Cat Lab хэрхэн ажилладаг вэ

```
STUDENT → Next.js pages ─┬─→ TensorFlow.js (браузерт сургана) → IndexedDB / Storage (сургасан model)
                         └─→ API routes /api/... ─┬─→ Prisma → Postgres (photos, TrainedModel)
                                                  └─→ Supabase Storage (зургийн файл)
```

- Сургалт, таамаглал **браузерт** явагдана.
- Зураг, label нь **манай серверээр** (API routes) дамжиж Supabase руу очно: мөрүүд → Postgres, файлууд → Storage.
- `Next.js → ORM → SQL`, энд ORM нь **Prisma**.
- API routes = Next.js routes = REST API routes.

## 2. Next.js API routes

Folder нь URL болно, файл дотор HTTP method-ийн нэрээр функц export хийнэ.

| Файл | Method | Юу хийдэг |
|---|---|---|
| `app/api/photos/route.ts` | `GET` | Бүх зургийн жагсаалт |
| | `POST` | Зураг upload (form-data, `photo` талбар) → Storage + `photos` мөр |
| `app/api/photos/[id]/route.ts` | `GET` | Нэг зураг (`/api/photos/<id>`) |
| | `PATCH` | Label өгөх: `{ "label": "CAT" }` эсвэл `"NOT_CAT"` |
| | `DELETE` | Мөр болон Storage дахь файлыг устгана |
| `app/api/training/route.ts` | `GET` | Training ground дээрх label-тэй зургууд |
| | `POST` | Сургалт эхлэхэд: ~20%-ийг `testing` ground руу хуваана |
| | `DELETE` | Хуваалтыг буцаана: бүх зураг `training` руу |
| `app/api/model/route.ts` | `GET`, `POST` | Сургасан model-ийг хадгалах, авах |

`[id]` бол dynamic segment: `/api/photos/1234234` → `id = "1234234"` (`await ctx.params`).

Postman-аар туршина: `http://localhost:3000/api/photos`, `.../api/training` гэх мэт. Folder байхгүй route руу хандвал **404**.

Хичээл дээрх туршилтын хувилбар (`return new Response("GET works...")`) нь эхлэл байсан. Энд тэдгээр нь жинхэнэ ажилладаг болсон. `[id]`-ийн `POST`, `training`-ийн `PATCH` нь утгагүй тул ороогүй.

## 3. Supabase төсөл

1. supabase.com → **New project** → нэр `cat-lab`, хүчтэй database password, Region **Asia-Pacific**.
2. **Storage** → bucket үүсгэнэ (энэ төсөлд `cat-lab`, **Public bucket**).
3. **Connect** → **ORM** → **Prisma** → connection string-ийг `.env`-ийн `DATABASE_URL`-д хуулна (5432 порттой session pooler).

## 4. Prisma

```bash
npm install prisma --save-dev
npx prisma init          # prisma/schema.prisma, prisma.config.ts үүсгэнэ
```

- `prisma/schema.prisma` — хичээлийн `Label`, `Ground` enum ба `Photo` model (`storagePath`, `label`, `ground`, `@@map("photos")`). Энэ төсөлд model route-д хэрэгтэй `updatedAt` болон `TrainedModel` нэмэгдсэн.
- `prisma.config.ts` — schema, migrations-ийн зам, `DATABASE_URL`.
- `.env`-ийг `.gitignore`-д заавал нэмнэ.

## 5. Migration

```bash
npm run db:migrate       # = npx prisma migrate dev
```

- `Error: P1001 Can't reach database server at localhost:...` → `.env`-д Supabase биш, local URL байна гэсэн үг. Supabase-ийн URL-аар солино.
- 6543 порттой (pgbouncer) URL дээр migrate гацаж болно. Migration-д 5432 порттой session pooler ашиглана.

---

# Үргэлжлэл — "Continue" бичлэг (11:06–11:13)

Хичээлийн бичлэг: `~/Desktop/Lesson 4D/Continue-20261104_110604-Meeting Recording.mp4`.

## 6. Нэг shared Prisma client

Багш `app/_lib/prisma.ts` үүсгэсэн. Энэ төсөлд ижил үүрэгтэй файл нь `lib/server/prisma.ts`.

- `PrismaClient`-д `@prisma/adapter-pg`-ийн `PrismaPg` adapter-ийг `DATABASE_URL`-тай өгнө.
- Next.js dev горимд файлуудыг байнга дахин ачаалдаг. Client-ийг `globalThis` дээр хадгалснаар reload бүрт шинэ DB холболт нээгдэхгүй.
- Энэ төсөлд `getPrisma()` нь client-ийг анх хэрэгтэй үед үүсгэдэг. Тэгснээр `.env` дутуу бол ойлгомжтой алдаа харуулна.

## 7. Route дотроос Prisma ашиглах

```ts
// GET — бүх зураг, хуучнаас нь шинэ рүү
const photos = await prisma.photo.findMany({ orderBy: { createdAt: "asc" } });

// POST — шинэ мөр үүсгээд 201 буцаана
const photo = await prisma.photo.create({ data: { storagePath, label } });
return Response.json(photo, { status: 201 });
```

Багш `NextResponse.json(...)` хэрэглэсэн. Энд `Response.json(...)` хэрэглэсэн, хоёулаа адилхан ажилладаг. Бодит код нь `app/api/photos/route.ts` дотор байгаа: файлыг Storage руу, мөрийг Postgres руу хадгална.

## 8. Migration-ийг алхам алхмаар

Schema өөрчлөгдөх бүрт шинэ migration үүсгэнэ:

```bash
npx prisma migrate dev --name init                 # анхны хүснэгтүүд
npx prisma migrate dev --name added_new_field      # жишээ нь status талбар нэмэв
npx prisma migrate dev --name remove_status_field  # status-ийг буцааж хасав
npx prisma generate                                # client-ийг шинэчилнэ
```

- Утгатай багана устгах үед Prisma *"You are about to drop the column ... which still contains N non-null values"* гэж асууна. `yes` гэвэл тэр өгөгдөл устна.
- Migration бүр `prisma/migrations/<огноо>_<нэр>/migration.sql` болж хадгалагдана. Үүнийг git-д оруулна.
- Үр дүнг Supabase → **Table Editor** → `photos` хүснэгтээс харна.

## 9. `DIRECT_URL` — migration-д зориулсан холболт

Багш `prisma.config.ts`-д `url: process.env["DIRECT_URL"]` гэж сольсон. Шалтгаан нь: 6543 порттой transaction pooler (pgbouncer) дээр migration ажиллахгүй, 5432 порттой session pooler хэрэгтэй.

Энэ төсөлд `DIRECT_URL` байвал түүнийг, байхгүй бол `DATABASE_URL`-ийг ашиглана (`.env.example`-ийг үз).

## 10. Model бүрт unique талбар хэрэгтэй

Хоосон `model student { }` бичихэд *"Each model must have at least one unique criteria"* алдаа гарсан. Model бүрт `@id` талбар заавал байх ёстой.

## Энэ төсөлд оруулаагүй зүйлс

- **`Label` enum-ийн жижиг үсэг (`cat`, `not_cat`)**: багш үүнийг жижиг үсгээр бичсэн. Энэ төсөл `CAT` / `NOT_CAT`-ийг frontend, model сургалт бүх газар хэрэглэдэг тул хэвээр үлдээсэн.
- **`app/upload/page.tsx` доторх `fetch('/api/')`**: багш бичиж эхлээд дуусгаагүй. Энэ төсөлд frontend-ийн бүх API дуудлага `lib/api.ts` дотор аль хэдийн хийгдсэн.
