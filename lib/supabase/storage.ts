import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase";

export async function uploadFile(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string,
  file: File | Blob | Buffer,
  options?: { contentType?: string; upsert?: boolean }
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      upsert: options?.upsert ?? false,
    });

  if (error) {
    throw new Error(`Failed to upload file to ${bucket}/${path}: ${error.message}`);
  }

  return data;
}

export async function getSignedUrl(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string,
  expiresIn = 3600
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL for ${bucket}/${path}: ${error.message}`);
  }

  return data.signedUrl;
}

export async function deleteFile(
  supabase: SupabaseClient<Database>,
  bucket: string,
  path: string
) {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Failed to delete file ${bucket}/${path}: ${error.message}`);
  }

  return true;
}
