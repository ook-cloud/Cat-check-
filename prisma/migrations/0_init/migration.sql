-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Label" AS ENUM ('CAT', 'NOT_CAT');

-- CreateEnum
CREATE TYPE "Ground" AS ENUM ('training', 'testing');

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "label" "Label",
    "ground" "Ground" NOT NULL DEFAULT 'training',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainedModel" (
    "id" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "accuracies" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainedModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photos_storagePath_key" ON "photos"("storagePath");

