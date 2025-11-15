// src/lib/uploadToSupabase.ts
import { supabase } from "../lib/supabase";

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param file - The file to upload
 * @param paymentId - Used to organize files in a folder
 * @returns Public URL of the uploaded file
 */
export async function uploadProofToSupabase(
  file: File,
  paymentId: string
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "file";
  const filePath = `${paymentId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("ajo-bucket")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from("ajo-bucket")
    .getPublicUrl(filePath);

  return data.publicUrl;
}
