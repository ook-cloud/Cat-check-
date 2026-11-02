import type * as TF from "@tensorflow/tfjs";
import type { Guess, Photo, SavedModel } from "./types";

export const ROUNDS = 10;

const IMAGE_SIZE = 224;
const BATCH_SIZE = 8;
// Fast enough to learn in only 10 rounds. At 0.001 it scored 72% on held-out photos; here, 86%.
const LEARNING_RATE = 0.005;
// A small network Google already taught to see shapes and textures. Only the new
// layers on top learn from your photos, which is what makes a few dozen photos enough.
const BASE_MODEL_URL =
  "https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json";
const BASE_OUTPUT_LAYER = "conv_pw_13_relu";

// TensorFlow.js is large and browser-only, so it loads when it is first needed.
const loadTf = () => import("@tensorflow/tfjs");

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("A photo could not be loaded."));
    image.src = url;
  });
}

function toInput(tf: typeof TF, image: HTMLImageElement): TF.Tensor4D {
  return tf.tidy(() =>
    tf.image
      .resizeBilinear(tf.browser.fromPixels(image), [IMAGE_SIZE, IMAGE_SIZE])
      .toFloat()
      .div(127.5)
      .sub(1)
      .expandDims(0),
  ) as TF.Tensor4D;
}

/** Trains on the given photos. `onRound` runs after each round with its accuracy, from 0 to 1. */
export async function trainModel(
  photos: Photo[],
  onRound: (accuracy: number) => void,
): Promise<TF.LayersModel> {
  const tf = await loadTf();
  await tf.ready();

  const base = await tf.loadLayersModel(BASE_MODEL_URL);
  const baseOutput = base.getLayer(BASE_OUTPUT_LAYER).output as TF.SymbolicTensor;
  const seeing = tf.model({ inputs: base.inputs, outputs: baseOutput });

  const images = await Promise.all(photos.map((photo) => loadImage(photo.url)));
  const features = tf.tidy(() =>
    tf.concat(
      images.map((image) => seeing.predict(toInput(tf, image)) as TF.Tensor),
      0,
    ),
  );
  const answers = tf.tensor1d(photos.map((photo) => (photo.label === "CAT" ? 1 : 0)));

  const layers = [
    tf.layers.globalAveragePooling2d({}),
    tf.layers.dense({ units: 16, activation: "relu" }),
    tf.layers.dense({ units: 1, activation: "sigmoid" }),
  ];
  const connect = (start: TF.SymbolicTensor) =>
    layers.reduce((tensor, layer) => layer.apply(tensor) as TF.SymbolicTensor, start);

  const learningInput = tf.input({ shape: features.shape.slice(1) });
  const learning = tf.model({ inputs: learningInput, outputs: connect(learningInput) });
  learning.compile({
    optimizer: tf.train.adam(LEARNING_RATE),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  try {
    await learning.fit(features, answers, {
      epochs: ROUNDS,
      batchSize: BATCH_SIZE,
      shuffle: true,
      callbacks: {
        onEpochEnd: async (_round, logs) => {
          onRound(logs?.acc ?? 0);
          await tf.nextFrame();
        },
      },
    });
  } finally {
    features.dispose();
    answers.dispose();
  }

  // Joined into one model, so it can take a photo in and give an answer out.
  return tf.model({ inputs: base.inputs, outputs: connect(baseOutput) });
}

/** Sends model.json and its weights to the server, which stores them in Supabase Storage. */
export async function saveModel(model: TF.LayersModel, accuracies: number[]): Promise<SavedModel> {
  const tf = await loadTf();
  const result = await model.save(tf.io.http(`/api/model?accuracies=${accuracies.join(",")}`));
  return (await result.responses![0].json()) as SavedModel;
}

export async function loadModel(url: string): Promise<TF.LayersModel> {
  const tf = await loadTf();
  await tf.ready();
  return tf.loadLayersModel(url);
}

export async function guessPhoto(model: TF.LayersModel, url: string): Promise<Guess> {
  const tf = await loadTf();
  const image = await loadImage(url);
  const output = tf.tidy(() => model.predict(toInput(tf, image)) as TF.Tensor);
  const [catChance] = await output.data();
  output.dispose();
  return catChance >= 0.5
    ? { label: "CAT", confidence: catChance }
    : { label: "NOT_CAT", confidence: 1 - catChance };
}

export const disposeModel = (model: TF.LayersModel) => model.dispose();
