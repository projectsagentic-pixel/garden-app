import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export async function uploadDiaryPhoto(file: File, entryId: string): Promise<string> {
  const userId = (await supabase.auth.getUser()).data.user?.id ?? 'anon';
  const path = `${userId}/${entryId}/${file.name}`;
  const { error } = await supabase.storage.from('diary-photos').upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('diary-photos').getPublicUrl(path);
  return data.publicUrl;
}
