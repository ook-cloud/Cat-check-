"use client";

import { useEffect, useState } from "react";
import { BackButton } from "../_components/BackButton";
import { HelpBox } from "../_components/HelpBox";
import { LockedButton } from "../_components/LockedButton";
import { MainButton } from "../_components/MainButton";
import { StepBar } from "../_components/StepBar";
import { StepCard } from "../_components/StepCard";
import { LabelStep } from "./LabelStep";
import { TestStep } from "./TestStep";
import { TrainStep } from "./TrainStep";
import { UploadStep } from "./UploadStep";
import { deletePhoto, getSavedModel, listPhotos, setLabel, uploadPhoto } from "@/lib/api";
import type { Label, Photo, SavedModel } from "@/lib/types";

const MIN_PHOTOS = 2;

const TITLES = [
  "Step 1: Add your photos",
  "Step 2: Tell the model what each photo is",
  "Step 3: Train the model",
  "Step 4: Test with new photos",
];
const NEXT_LABELS = ["Next: Label photos", "Next: Train the model", "Next: Test the model"];

function plural(count: number, word: string) {
  return `${count} more ${word}${count === 1 ? "" : "s"}`;
}

export const CatLab = () => {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [model, setModel] = useState<SavedModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([listPhotos(), getSavedModel()])
      .then(([savedPhotos, savedModel]) => {
        if (!active) return;
        setPhotos(savedPhotos);
        setModel(savedModel);
      })
      .catch((cause: Error) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  /** Why Next is locked on this step, or null when the step is finished. */
  const lockReason = (): string | null => {
    if (step === 1) {
      if (isLoading) return "Loading…";
      if (uploadProgress) return "Adding photos…";
      const missing = MIN_PHOTOS - photos.length;
      return missing > 0 ? `Add ${plural(missing, "photo")}` : null;
    }
    if (step === 2) {
      const unlabeled = photos.filter((photo) => !photo.label).length;
      if (unlabeled > 0) return `Label ${unlabeled} more to continue`;
      if (!photos.some((photo) => photo.label === "CAT")) return "Label at least 1 cat";
      if (!photos.some((photo) => photo.label === "NOT_CAT")) return "Label at least 1 not cat";
      return null;
    }
    return model && !isTraining ? null : "Finish training to continue";
  };

  const goNext = () => {
    // The button is already locked, but the rule is checked again here on purpose.
    if (lockReason() === null) setStep((current) => Math.min(current + 1, TITLES.length));
  };

  const addPhotos = async (files: File[]) => {
    setError(null);
    const failed: string[] = [];
    for (const [done, file] of files.entries()) {
      setUploadProgress({ done, total: files.length });
      try {
        const photo = await uploadPhoto(file);
        setPhotos((current) => [...current, photo]);
        setModel(null); // the saved model has not seen this photo
      } catch (cause) {
        failed.push(`${file.name}: ${(cause as Error).message}`);
      }
    }
    setUploadProgress(null);
    if (failed.length > 0) setError(failed.join(" "));
  };

  const changeLabel = async (photo: Photo, label: Label) => {
    if (photo.label === label) return;
    const update = (value: Label | null) =>
      setPhotos((current) =>
        current.map((item) => (item.id === photo.id ? { ...item, label: value } : item)),
      );
    setError(null);
    update(label);
    try {
      await setLabel(photo.id, label);
      setModel(null); // the saved model learned the old label
    } catch (cause) {
      update(photo.label);
      setError((cause as Error).message);
    }
  };

  const removePhoto = async (photo: Photo) => {
    setError(null);
    const index = photos.findIndex((item) => item.id === photo.id);
    setPhotos((current) => current.filter((item) => item.id !== photo.id));
    try {
      await deletePhoto(photo.id);
      setModel(null); // the saved model learned from this photo
    } catch (cause) {
      // Put the photo back where it was so the student can try again.
      setPhotos((current) => {
        const next = [...current];
        next.splice(Math.max(index, 0), 0, photo);
        return next;
      });
      setError((cause as Error).message);
    }
  };

  const reason = lockReason();
  const isTesting = step === 4;

  return (
    <main className="mx-auto grid max-w-[860px] gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[28px] leading-tight font-semibold">Cat Classifier Lab</h1>
        <span
          className={`rounded-full px-3.5 py-1.5 text-[15px] font-bold ${
            isTesting ? "bg-cat-soft text-cat" : "bg-blue-soft text-blue"
          }`}
        >
          {isTesting ? "Testing ground" : "Training ground"}
        </span>
      </header>

      <StepBar current={step} />

      <StepCard title={TITLES[step - 1]}>
        {step === 1 && (
          <UploadStep
            photos={photos}
            uploadProgress={uploadProgress}
            onFiles={addPhotos}
            onRemove={removePhoto}
          />
        )}
        {step === 2 && <LabelStep photos={photos} onLabel={changeLabel} onRemove={removePhoto} />}
        {step === 3 && (
          <TrainStep
            model={model}
            isTraining={isTraining}
            onTrainingChange={setIsTraining}
            onPhotosChange={setPhotos}
            onTrained={setModel}
          />
        )}
        {isTesting && model && <TestStep photos={photos} model={model} />}

        {error && <HelpBox title="Something went wrong.">{error}</HelpBox>}

        <div className="flex flex-wrap justify-between gap-3">
          {step > 1 ? (
            <BackButton
              disabled={isTraining}
              onClick={() => {
                setError(null);
                setStep(step - 1);
              }}
            />
          ) : (
            <span />
          )}
          {!isTesting &&
            (reason ? (
              <LockedButton>{reason}</LockedButton>
            ) : (
              <MainButton onClick={goNext}>{NEXT_LABELS[step - 1]}</MainButton>
            ))}
        </div>
      </StepCard>
    </main>
  );
};
