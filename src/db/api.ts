// واجهة برمجة التطبيقات للتفاعل مع Supabase
import { supabase } from './supabase';
import type { GenerationHistory, ImageGenerationRequest, VideoGenerationRequest } from '@/types/types';

// الحصول على سجل التوليد
export async function getGenerationHistory(type?: 'image' | 'video', limit = 50) {
  let query = supabase
    .from('generation_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching generation history:', error);
    throw error;
  }

  return Array.isArray(data) ? data : [];
}

// إنشاء سجل توليد جديد
export async function createGenerationRecord(record: Partial<GenerationHistory>) {
  const { data, error } = await supabase
    .from('generation_history')
    .insert([record])
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating generation record:', error);
    throw error;
  }

  return data;
}

// تحديث سجل التوليد
export async function updateGenerationRecord(id: string, updates: Partial<GenerationHistory>) {
  const { data, error } = await supabase
    .from('generation_history')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating generation record:', error);
    throw error;
  }

  return data;
}

// حذف سجل التوليد
export async function deleteGenerationRecord(id: string) {
  const { error } = await supabase
    .from('generation_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting generation record:', error);
    throw error;
  }
}

// إرسال مهمة توليد صورة
export async function submitImageGeneration(request: ImageGenerationRequest) {
  const { data, error } = await supabase.functions.invoke('submit-image', {
    body: request,
  });

  if (error) {
    const errorMsg = await error?.context?.text();
    console.error('Error in submit-image:', errorMsg || error?.message);
    throw new Error(errorMsg || error?.message || 'فشل في إرسال مهمة توليد الصورة');
  }

  return data;
}

// الاستعلام عن حالة مهمة توليد صورة
export async function queryImageStatus(taskId: string) {
  const { data, error } = await supabase.functions.invoke('query-image', {
    body: { taskId },
  });

  if (error) {
    const errorMsg = await error?.context?.text();
    console.error('Error in query-image:', errorMsg || error?.message);
    throw new Error(errorMsg || error?.message || 'فشل في الاستعلام عن حالة المهمة');
  }

  return data;
}

// إرسال مهمة توليد فيديو
export async function submitVideoGeneration(request: VideoGenerationRequest) {
  const { data, error } = await supabase.functions.invoke('submit-video', {
    body: request,
  });

  if (error) {
    const errorMsg = await error?.context?.text();
    console.error('Error in submit-video:', errorMsg || error?.message);
    throw new Error(errorMsg || error?.message || 'فشل في إرسال مهمة توليد الفيديو');
  }

  return data;
}

// الاستعلام عن حالة مهمة توليد فيديو
export async function queryVideoStatus(taskId: string) {
  const { data, error } = await supabase.functions.invoke('query-video', {
    body: { taskId },
  });

  if (error) {
    const errorMsg = await error?.context?.text();
    console.error('Error in query-video:', errorMsg || error?.message);
    throw new Error(errorMsg || error?.message || 'فشل في الاستعلام عن حالة المهمة');
  }

  return data;
}
