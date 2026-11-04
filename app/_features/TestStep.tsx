"use client";

import { useEffect, useRef, useState } from "react";
import type { LayersModel } from "@tensorflow/tfjs";
import { GuessResult } from "../_components/GuessResult";
import { HelpBox } from "../_components/HelpBox";
import { PhotoGrid } from "../_components/PhotoTile";
import { ResultTile } from "../_components/ResultTile";
import { Score } from "../_components/Score";
import { UploadBox } from "../_components/UploadBox";
import { disposeModel, guessPhoto, loadModel } from "@/lib/ml";
import type { Guess, Photo, SavedModel } from "@/lib/types";

interface TestStepProps {
  photos: Photo[];
  model: SavedModel;
}

type TestResult = { photo: Photo; guess: Guess };

const GUESS_WORDS = { CAT: "Cat", NOT_CAT: "Not cat" };

export const TestStep = ({ photos, model }: TestStepProps) => {
  const loadedModel = useRef<LayersModel | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [newPhoto, setNewPhoto] = useState<{ url: string; guess: Guess } | null>(null);
  const [isGuessing, setIsGuessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loaded: LayersModel | null = null;

    const run = async () => {
      try {
        const fromStorage = await loadModel(model.url);
        if (cancelled) {
          disposeModel(fromStorage);
          return;
        }
        loaded = fromStorage;
        loadedModel.current = fromStorage;
        setIsReady(true);

        const finished: TestResult[] = [];
        for (const photo of photos.filter((candidate) => candidate.ground === "testing")) {
          const guess = await guessPhoto(fromStorage, photo.url);
          if (cancelled) return;
          finished.push({ photo, guess });
        }
        setResults(finished);
      } catch (cause) {
        if (cancelled) return;
        console.error(cause);
        setError("The saved model could not be loaded or run. Try training it again.");
      }
    };
    run();

    return () => {
      cancelled = true;
      loadedModel.current = null;
      if (loaded) disposeModel(loaded);
    };
  }, [model.url, photos]);

  const previewUrl = newPhoto?.url;
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const guessNewPhoto = async ([file]: File[]) => {
    if (!loadedModel.current) return;
    const url = URL.createObjectURL(file);
    setIsGuessing(true);
    setError(null);
    try {
      setNewPhoto({ url, guess: await guessPhoto(loadedModel.current, url) });
    } catch (cause) {
      console.error(cause);
      URL.revokeObjectURL(url);
      setError("That photo could not be read. Try a different one.");
    } finally {
      setIsGuessing(false);
    }
  };

  return (
    <>
      {!results && !error && <p className="text-center text-muted">Loading your saved model…</p>}

      {results && results.length > 0 && (
        <>
          <Score
            right={results.filter(({ photo, guess }) => guess.label === photo.label).length}
            total={results.length}
          />
          <PhotoGrid>
            {results.map(({ photo, guess }) => (
              <ResultTile
                key={photo.id}
                src={photo.url}
                alt={photo.name}
                isRight={guess.label === photo.label}
                guessedLabel={GUESS_WORDS[guess.label]}
              />
            ))}
          </PhotoGrid>
        </>
      )}

      {results?.length === 0 && (
        <HelpBox title="No score yet.">
          You need at least 3 photos of a label before one can be held back for testing. You can
          still try a new photo below.
        </HelpBox>
      )}

      <UploadBox
        title={isGuessing ? "The model is looking…" : "Click to choose a new photo"}
        hint="Use a photo the model has never seen"
        disabled={!isReady || isGuessing}
        onFiles={guessNewPhoto}
      />
      {newPhoto && <GuessResult src={newPhoto.url} guess={newPhoto.guess} />}
      {error && <HelpBox title="Something went wrong.">{error}</HelpBox>}

      <HelpBox title="Why new photos?">
        The real check is photos the model never saw in training. That shows whether it learned what
        a cat looks like, or only memorized your photos.
      </HelpBox>
    </>
  );
};
