import { connection } from "next/server";
import { chooseTestIds } from "@/lib/split";
import { badRequest, serverError } from "@/lib/server/errors";
import { toPhoto } from "@/lib/server/photos";
import { getPrisma } from "@/lib/server/prisma";

export async function GET() {
  await connection();
  try {
    const rows = await getPrisma().photo.findMany({
      where: { ground: "training", label: { not: null } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    return Response.json(rows.map(toPhoto));
  } catch (error) {
    return serverError(error);
  }
}

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
      photos.map((photo) =>
        toPhoto({ ...photo, ground: testIds.includes(photo.id) ? "testing" : "training" }),
      ),
    );
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE() {
  try {
    const { count } = await getPrisma().photo.updateMany({
      where: { ground: "testing" },
      data: { ground: "training" },
    });
    return Response.json({ moved: count });
  } catch (error) {
    return serverError(error);
  }
}
