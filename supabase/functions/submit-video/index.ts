// Edge Function لإرسال مهمة توليد الفيديو
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
    const { prompt, aspectRatio, duration } = await req.json();

    if (!prompt) {
      throw new Error('النص الوصفي مطلوب');
    }

    // بناء محتوى الطلب
    const requestBody: {
      prompt: string;
      model_name: string;
      aspect_ratio?: string;
      duration?: string;
    } = {
      prompt,
      model_name: 'kling-v2-master',
    };

    if (aspectRatio) {
      requestBody.aspect_ratio = aspectRatio;
    }

    if (duration) {
      requestBody.duration = duration;
    }

    // إرسال الطلب إلى API
    const response = await fetch(
      'https://api-integrations.appmedo.com/app-8uitvq60a1vl/api-Xa6JZENRrGoa/v1/videos/text2video',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();

    if (result.code !== 0) {
      throw new Error(result.message || 'فشل في إرسال مهمة توليد الفيديو');
    }

    return new Response(
      JSON.stringify(result.data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in submit-video:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
