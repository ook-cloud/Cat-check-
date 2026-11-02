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

export const splitPhotos = () => request<Photo[]>("/api/photos/split", { method: "POST" });

export const getSavedModel = () => request<SavedModel | null>("/api/model");
