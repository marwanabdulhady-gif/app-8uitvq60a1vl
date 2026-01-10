// Edge Function للاستعلام عن حالة مهمة توليد الفيديو
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
    const { taskId } = await req.json();

    if (!taskId) {
      throw new Error('معرف المهمة مطلوب');
    }

    // إرسال الطلب إلى API
    const response = await fetch(
      `https://api-integrations.appmedo.com/app-8uitvq60a1vl/api-qYGWo4BbNeMY/v1/videos/text2video/${taskId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();

    if (result.code !== 0) {
      throw new Error(result.message || 'فشل في الاستعلام عن حالة المهمة');
    }

    return new Response(
      JSON.stringify(result.data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in query-video:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
