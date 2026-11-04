import { chooseTestIds } from "@/lib/split";
import { badRequest, serverError } from "@/lib/server/errors";
import { getPrisma } from "@/lib/server/prisma";

/** Runs when training starts: holds back test photos so training never sees them. */
export async function POST() {
  try {
    const prisma = getPrisma();
    const photos = await prisma.photo.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    const labeled = photos.flatMap((photo) =>
      photo.label ? [{ id: photo.id, label: photo.label }] : [],
    );
    if (labeled.length !== photos.length) {
      return badRequest("Label every photo before training.");
    }

    const testIds = chooseTestIds(labeled);
    await prisma.$transaction([
      prisma.photo.updateMany({ where: { id: { notIn: testIds } }, data: { ground: "training" } }),
      prisma.photo.updateMany({ where: { id: { in: testIds } }, data: { ground: "testing" } }),
    ]);

    return Response.json(
      photos.map((photo) => {
        const isTest = testIds.includes(photo.id);
        return { ...photo, ground: isTest ? "testing" : "training", isTest };
      }),
    );
  } catch (error) {
    return serverError(error);
  }
}
