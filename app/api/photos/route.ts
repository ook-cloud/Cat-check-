import { connection } from "next/server";
import { badRequest, serverError } from "@/lib/server/errors";
import { getPrisma } from "@/lib/server/prisma";
import { removeFiles, uploadFile } from "@/lib/server/storage";

const MAX_BYTES = 10 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function GET() {
  await connection();
  try {
    const photos = await getPrisma().photo.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    return Response.json(photos);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const file = (await request.formData()).get("photo");
    if (!(file instanceof File)) return badRequest("No photo was sent.");

    const extension = EXTENSIONS[file.type];
    if (!extension) return badRequest("Use a JPG, PNG or WebP photo.");
    if (file.size > MAX_BYTES) return badRequest("Use a photo under 10 MB.");

    const id = crypto.randomUUID();
    const path = `photos/${id}.${extension}`;
    const url = await uploadFile(path, file, file.type);

    try {
      const photo = await getPrisma().photo.create({ data: { id, name: file.name, path, url } });
      return Response.json(photo, { status: 201 });
    } catch (error) {
      await removeFiles([path]).catch(console.error);
      throw error;
    }
  } catch (error) {
    return serverError(error);
  }
}
