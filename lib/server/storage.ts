import { createClient } from "@supabase/supabase-js";
import { requireEnv, SetupError } from "./errors";

function bucket() {
  const client = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false },
  });
  return client.storage.from(requireEnv("SUPABASE_BUCKET"));
}

export async function uploadFile(path: string, file: Blob, contentType: string): Promise<string> {
  const files = bucket();
  const { error } = await files.upload(path, file, { contentType });
  if (error) {
    throw new SetupError(
      `Supabase Storage refused the upload: ${error.message}. Check the bucket and keys in README.md.`,
    );
  }
  return files.getPublicUrl(path).data.publicUrl;
}

export async function removeFiles(paths: string[]): Promise<void> {
  const { error } = await bucket().remove(paths);
  if (error) throw error;
}
