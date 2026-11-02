export type Label = "CAT" | "NOT_CAT";

export type Photo = {
  id: string;
  name: string;
  url: string;
  label: Label | null;
  isTest: boolean;
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
