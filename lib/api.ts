import type { Label, Photo, SavedModel } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error ?? "The server could not do that. Please try again.");
  }
  return body as T;
}

export const listPhotos = () => request<Photo[]>("/api/photos");

export function uploadPhoto(file: File) {
  const form = new FormData();
  form.append("photo", file);
  return request<Photo>("/api/photos", { method: "POST", body: form });
}

export const setLabel = (id: string, label: Label) =>
  request<Photo>(`/api/photos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  });

export const splitPhotos = () => request<Photo[]>("/api/training", { method: "POST" });

export const getSavedModel = () => request<SavedModel | null>("/api/model");

// The server answers 204 with no body, which request() reads as null.
export const deletePhoto = (id: string) =>
  request<null>(`/api/photos/${id}`, { method: "DELETE" });
