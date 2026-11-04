export type Label = "CAT" | "NOT_CAT";

/** Training photos teach the model; testing photos are held back to check it. */
export type Ground = "training" | "testing";

export type Photo = {
  id: string;
  name: string;
  url: string;
  label: Label | null;
  ground: Ground;
};

export type SavedModel = {
  id: string;
  url: string;
  accuracies: number[];
};

export type Guess = {
  label: Label;
  /** How sure the model is of this answer, from 0.5 to 1. */
  confidence: number;
};
