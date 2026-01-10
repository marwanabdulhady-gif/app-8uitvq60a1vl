// Edge Function لإرسال مهمة توليد الصور
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // معالجة طلبات OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, negativePrompt, referenceImage, referenceStrength } = await req.json();

    // بناء محتوى الطلب
    const contents = [{
      parts: [] as Array<{ text?: string; inline_data?: { mime_type: string; data: string } }>
    }];

    // إضافة الصورة المرجعية إذا كانت موجودة
    if (referenceImage) {
      contents[0].parts.push({
        inline_data: {
          mime_type: referenceImage.mimeType,
          data: referenceImage.data
        }
      });
    }

    // إضافة النص
    let promptText = prompt;
    if (negativePrompt) {
      promptText += `\nNegative prompt: ${negativePrompt}`;
    }
    contents[0].parts.push({ text: promptText });

    // إرسال الطلب إلى API
    const response = await fetch(
      'https://api-integrations.appmedo.com/app-8uitvq60a1vl/api-BYdwzE2qzDDL/image-generation/submit',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents }),
      }
    );

    const result = await response.json();

    if (result.status !== 0) {
      throw new Error(result.message || 'فشل في إرسال مهمة توليد الصورة');
    }

    return new Response(
      JSON.stringify(result.data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in submit-image:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
