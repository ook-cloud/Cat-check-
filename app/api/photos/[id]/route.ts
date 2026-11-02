import { Prisma } from "@/lib/generated/prisma/client";
import { badRequest, serverError } from "@/lib/server/errors";
import { getPrisma } from "@/lib/server/prisma";

export async function PATCH(request: Request, ctx: RouteContext<"/api/photos/[id]">) {
  const { id } = await ctx.params;
  try {
    const { label } = await request.json();
    if (label !== "CAT" && label !== "NOT_CAT") {
      return badRequest("Label must be CAT or NOT_CAT.");
    }
    const photo = await getPrisma().photo.update({ where: { id }, data: { label } });
    return Response.json(photo);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return badRequest("That photo no longer exists.", 404);
    }
    if (error instanceof SyntaxError) return badRequest("Send the label as JSON.");
    return serverError(error);
  }
}
