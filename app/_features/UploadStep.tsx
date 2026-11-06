"use client";

import { HelpBox } from "../_components/HelpBox";
import { PhotoGrid, PhotoTile } from "../_components/PhotoTile";
import { UploadBox } from "../_components/UploadBox";
import type { Photo } from "@/lib/types";

interface UploadStepProps {
  photos: Photo[];
  uploadProgress: { done: number; total: number } | null;
  onFiles: (files: File[]) => void;
  onRemove: (photo: Photo) => void;
}

export const UploadStep = ({ photos, uploadProgress, onFiles, onRemove }: UploadStepProps) => (
  <>
    <UploadBox
      title={
        uploadProgress
          ? `Adding photo ${uploadProgress.done + 1} of ${uploadProgress.total}…`
          : "Click to choose photos"
      }
      hint="You can pick many photos at once"
      multiple
      disabled={uploadProgress !== null}
      onFiles={onFiles}
    />
    <HelpBox title="Why so many photos?">
      The model learns only from what you show it. More photos of cats and of other things help it
      guess better.
    </HelpBox>
    {photos.length > 0 && (
      <PhotoGrid>
        {photos.map((photo) => (
          <PhotoTile
            key={photo.id}
            src={photo.url}
            alt={photo.name}
            onRemove={() => onRemove(photo)}
          />
        ))}
      </PhotoGrid>
    )}
  </>
);
