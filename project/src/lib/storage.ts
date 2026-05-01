import { supabase } from './supabase';

const BUCKET = 'task-audits';

export type PhotoPhase = 'before' | 'after';

/**
 * Uploads a task audit photo to Supabase Storage.
 * Returns the public URL of the uploaded file, or null on error.
 */
export async function uploadTaskPhoto(
  taskId: string,
  phase: PhotoPhase,
  file: File
): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${taskId}/${phase}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    console.error('[storage] Upload error:', error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl ?? null;
}

/**
 * Marks a work_order as completed and stores photo URLs.
 */
export async function completeTaskWithPhotos(
  taskId: string,
  photoBeforeUrl: string | null,
  photoAfterUrl: string | null
): Promise<boolean> {
  const { error } = await supabase
    .from('work_order')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      photo_before_url: photoBeforeUrl,
      photo_after_url: photoAfterUrl,
    })
    .eq('id', taskId);

  if (error) {
    console.error('[storage] Complete task error:', error.message);
    return false;
  }
  return true;
}
