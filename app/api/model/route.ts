import { connection } from "next/server";
import { badRequest, serverError } from "@/lib/server/errors";
import { getPrisma } from "@/lib/server/prisma";
import { removeFiles, uploadFile } from "@/lib/server/storage";

const MODEL_FILE = "model.json";
const WEIGHTS_FILE = "model.weights.bin";
const MAX_BYTES = 50 * 1024 * 1024;

function modelPaths(folder: string) {
  return [`${folder}/${MODEL_FILE}`, `${folder}/${WEIGHTS_FILE}`];
}

/** Returns the saved model, unless photos or labels changed after it was trained. */
export async function GET() {
  await connection();
  try {
    const prisma = getPrisma();
    const model = await prisma.trainedModel.findFirst({ orderBy: { createdAt: "desc" } });
    if (!model) return Response.json(null);

    const changedPhotos = await prisma.photo.count({
      where: { updatedAt: { gt: model.createdAt } },
    });
    return Response.json(changedPhotos > 0 ? null : model);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const accuracies = (new URL(request.url).searchParams.get("accuracies") ?? "")
      .split(",")
      .map(Number);
    if (accuracies.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
      return badRequest("Accuracies must be numbers from 0 to 1.");
    }

    const form = await request.formData();
    const modelJson = form.get(MODEL_FILE);
    const weights = form.get(WEIGHTS_FILE);
    if (!(modelJson instanceof File) || !(weights instanceof File)) {
      return badRequest(`Send both ${MODEL_FILE} and ${WEIGHTS_FILE}.`);
    }
    if (modelJson.size + weights.size > MAX_BYTES) return badRequest("The model is too large.");

    // A new folder each time, so the Storage CDN can never serve an older model.
    const folder = `models/${crypto.randomUUID()}`;
    const [modelPath, weightsPath] = modelPaths(folder);
    const url = await uploadFile(modelPath, modelJson, "application/json");
    await uploadFile(weightsPath, weights, "application/octet-stream");

    const prisma = getPrisma();
    const older = await prisma.trainedModel.findMany();
    const model = await prisma.trainedModel.create({
      data: { folder, url, accuracies, createdAt: new Date() },
    });

    if (older.length > 0) {
      await prisma.trainedModel.deleteMany({ where: { id: { not: model.id } } });
      await removeFiles(older.flatMap((old) => modelPaths(old.folder))).catch(console.error);
    }

    return Response.json(model, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
