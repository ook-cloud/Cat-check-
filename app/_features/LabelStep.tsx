"use client";

import { CountPills } from "../_components/CountPills";
import { HelpBox } from "../_components/HelpBox";
import { LabelButtons } from "../_components/LabelButtons";
import { PhotoGrid, PhotoTile } from "../_components/PhotoTile";
import type { Label, Photo } from "@/lib/types";

interface LabelStepProps {
  photos: Photo[];
  onLabel: (photo: Photo, label: Label) => void;
}

const BORDER_FOR = { CAT: "cat", NOT_CAT: "notCat" } as const;

export const LabelStep = ({ photos, onLabel }: LabelStepProps) => (
  <>
    <CountPills
      cats={photos.filter((photo) => photo.label === "CAT").length}
      notCats={photos.filter((photo) => photo.label === "NOT_CAT").length}
      unlabeled={photos.filter((photo) => photo.label === null).length}
    />
    <PhotoGrid>
      {photos.map((photo) => (
        <PhotoTile
          key={photo.id}
          src={photo.url}
          alt={photo.name}
          border={photo.label ? BORDER_FOR[photo.label] : "none"}
        >
          <LabelButtons value={photo.label} onChange={(label) => onLabel(photo, label)} />
        </PhotoTile>
      ))}
    </PhotoGrid>
    <HelpBox title="Why label?">Your labels are the answers the model learns from.</HelpBox>
  </>
);
