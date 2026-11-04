import { Prisma } from "@/app/generated/prisma/client";
import { badRequest, serverError } from "@/lib/server/errors";
import { toPhoto } from "@/lib/server/photos";
import { getPrisma } from "@/lib/server/prisma";
import { removeFiles } from "@/lib/server/storage";

type Context = RouteContext<"/api/photos/[id]">;

function isMissing(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

/** GET /api/photos/:id — one photo. */
export async function GET(_request: Request, ctx: Context) {
  const { id } = await ctx.params;
  try {
    const row = await getPrisma().photo.findUnique({ where: { id } });
    if (!row) return badRequest("That photo does not exist.", 404);
    return Response.json(toPhoto(row));
  } catch (error) {
    return serverError(error);
  }
}

/** PATCH /api/photos/:id — the student labels the photo CAT or NOT_CAT. */
export async function PATCH(request: Request, ctx: Context) {
  const { id } = await ctx.params;
  try {
    const { label } = await request.json();
    if (label !== "CAT" && label !== "NOT_CAT") {
      return badRequest("Label must be CAT or NOT_CAT.");
    }
    const row = await getPrisma().photo.update({ where: { id }, data: { label } });
    return Response.json(toPhoto(row));
  } catch (error) {
    if (isMissing(error)) return badRequest("That photo no longer exists.", 404);
    if (error instanceof SyntaxError) return badRequest("Send the label as JSON.");
    return serverError(error);
  }
}

/** DELETE /api/photos/:id — removes the row and its file in Storage. */
export async function DELETE(_request: Request, ctx: Context) {
  const { id } = await ctx.params;
  try {
    const row = await getPrisma().photo.delete({ where: { id } });
    await removeFiles([row.storagePath]).catch(console.error);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (isMissing(error)) return badRequest("That photo no longer exists.", 404);
    return serverError(error);
  }
}
