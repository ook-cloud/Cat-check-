import type { Photo as PhotoRow } from "@/app/generated/prisma/client";
import type { Photo } from "@/lib/types";
import { publicUrl } from "./storage";

/** Turns a database row into the shape the pages use, with a URL they can show. */
export function toPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    name: row.storagePath.split("/").pop() ?? row.id,
    url: publicUrl(row.storagePath),
    label: row.label,
    ground: row.ground,
  };
}
