import { connection } from "next/server";
import { badRequest, serverError } from "@/lib/server/errors";
import { toPhoto } from "@/lib/server/photos";
import { getPrisma } from "@/lib/server/prisma";
import { removeFiles, uploadFile } from "@/lib/server/storage";

const MAX_BYTES = 10 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** GET /api/photos — sends the list of photos. */
export async function GET() {
  await connection();
  try {
    const rows = await getPrisma().photo.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    return Response.json(rows.map(toPhoto));
  } catch (error) {
    return serverError(error);
  }
}

/** POST /api/photos — the file goes to Storage, the row goes to Postgres. */
export async function POST(request: Request) {
  try {
    const file = (await request.formData()).get("photo");
    if (!(file instanceof File)) return badRequest("No photo was sent.");

    const extension = EXTENSIONS[file.type];
    if (!extension) return badRequest("Use a JPG, PNG or WebP photo.");
    if (file.size > MAX_BYTES) return badRequest("Use a photo under 10 MB.");

    const id = crypto.randomUUID();
    const storagePath = `photos/${id}.${extension}`;
    await uploadFile(storagePath, file, file.type);

    try {
      const row = await getPrisma().photo.create({ data: { id, storagePath } });
      return Response.json(toPhoto(row), { status: 201 });
    } catch (error) {
      await removeFiles([storagePath]).catch(console.error);
      throw error;
    }
  } catch (error) {
    return serverError(error);
  }
}
