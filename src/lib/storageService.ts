import { isMockModeEnabled } from '@/lib/mockMode';
import { supabase } from '@/lib/supabaseClient';

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getFileExt(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop() || 'jpg' : 'jpg';
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  if (isMockModeEnabled()) {
    const dataUrl = await readFileAsDataUrl(file);
    return { path: dataUrl, publicUrl: dataUrl };
  }

  const ext = getFileExt(file.name);
  const path = `${userId}/${Date.now()}-${sanitizeFileName(file.name)}.${ext}`;

  const { error } = await supabase.storage
    .from('profile-photos')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function uploadPaymentScreenshot(
  userId: string,
  file: File
): Promise<{ path: string; name: string }> {
  if (isMockModeEnabled()) {
    const dataUrl = await readFileAsDataUrl(file);
    return { path: dataUrl, name: file.name };
  }

  const ext = getFileExt(file.name);
  const path = `${userId}/${Date.now()}-${sanitizeFileName(file.name)}.${ext}`;

  const { error } = await supabase.storage
    .from('payment-screenshots')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    throw new Error(error.message);
  }

  return { path, name: file.name };
}

export async function getPaymentScreenshotSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith('data:')) return path;

  const { data, error } = await supabase.storage
    .from('payment-screenshots')
    .createSignedUrl(path, 60 * 30);

  if (error) {
    return null;
  }

  return data.signedUrl;
}
