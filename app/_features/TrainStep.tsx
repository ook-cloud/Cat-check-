"use client";

import { useState } from "react";
import { AccuracyChart } from "../_components/AccuracyChart";
import { HelpBox } from "../_components/HelpBox";
import { LockedButton } from "../_components/LockedButton";
import { MainButton } from "../_components/MainButton";
import { ProgressBar } from "../_components/ProgressBar";
import { RoundCounter } from "../_components/RoundCounter";
import { splitPhotos } from "@/lib/api";
import { disposeModel, ROUNDS, saveModel, trainModel } from "@/lib/ml";
import type { Photo, SavedModel } from "@/lib/types";

interface TrainStepProps {
  model: SavedModel | null;
  isTraining: boolean;
  onTrainingChange: (isTraining: boolean) => void;
  onPhotosChange: (photos: Photo[]) => void;
  onTrained: (model: SavedModel) => void;
}

export const TrainStep = ({ model, isTraining, onTrainingChange, onPhotosChange, onTrained }: TrainStepProps) => {
  const [liveAccuracies, setLiveAccuracies] = useState<number[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  const accuracies = isTraining || !model ? liveAccuracies : model.accuracies;

  const startTraining = async () => {
    onTrainingChange(true);
    setError(null);
    setLiveAccuracies([]);
    setStatus("Getting your photos ready…");

    const finished: number[] = [];
    try {
      const photos = await splitPhotos();
      onPhotosChange(photos);

      const trained = await trainModel(
        photos.filter((photo) => !photo.isTest),
        (accuracy) => {
          finished.push(accuracy);
          setLiveAccuracies([...finished]);
          setStatus("The model is checking its guesses and fixing itself.");
        },
      );

      setStatus("Saving the model…");
      try {
        onTrained(await saveModel(trained, finished));
      } finally {
        disposeModel(trained);
      }
    } catch (cause) {
      console.error(cause);
      setError(
        cause instanceof Error && cause.message
          ? cause.message
          : "Training stopped before it finished.",
      );
    } finally {
      setStatus("");
      onTrainingChange(false);
    }
  };

  return (
    <>
      {isTraining ? (
        <LockedButton big>Training…</LockedButton>
      ) : (
        !model && (
          <MainButton big onClick={startTraining}>
            {error ? "Try training again" : "Start training"}
          </MainButton>
        )
      )}
      <RoundCounter round={accuracies.length} total={ROUNDS} />
      <ProgressBar value={accuracies.length} max={ROUNDS} label="Training progress" />
      {status && (
        <p role="status" className="text-center text-[15px] text-muted">
          {status}
        </p>
      )}
      <AccuracyChart accuracies={accuracies} rounds={ROUNDS} />
      {error && <HelpBox title="Training stopped.">{error}</HelpBox>}
      <HelpBox title="What is happening?">
        After each round the model checks its guesses and fixes itself a little.
      </HelpBox>
    </>
  );
};
