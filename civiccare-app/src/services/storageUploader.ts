import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

/**
 * Uploads an image captured on mobile to the Supabase Storage 'report-images' bucket.
 * Returns the public CDN URL to be stored in the database.
 */
export async function uploadReportImageToSupabase(
  localUri: string,
  base64Data?: string | null
): Promise<string> {
  try {
    const fileExt = localUri.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(fileExt) ? fileExt : 'jpg';
    const fileName = `report_${Date.now()}_${Math.random().toString(36).substring(7)}.${cleanExt}`;
    const contentType = cleanExt === 'png' ? 'image/png' : 'image/jpeg';

    let uploadPayload: any;

    if (base64Data && base64Data.length > 50) {
      // Decode Base64 string directly into an ArrayBuffer (super fast and reliable)
      const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      uploadPayload = decode(cleanBase64);
    } else {
      // Fallback: fetch blob from local device URI
      const response = await fetch(localUri);
      const blob = await response.blob();
      uploadPayload = await new Response(blob).arrayBuffer();
    }

    const { data, error } = await supabase.storage
      .from('report-images')
      .upload(fileName, uploadPayload, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn('[CivicCare Storage] Upload error:', error.message);
      return localUri;
    }

    const { data: publicUrlData } = supabase.storage
      .from('report-images')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl;
    console.log('[CivicCare Storage] Image successfully uploaded to bucket:', publicUrl);
    return publicUrl || localUri;
  } catch (err) {
    console.warn('[CivicCare Storage] Upload exception:', err);
    return localUri;
  }
}
