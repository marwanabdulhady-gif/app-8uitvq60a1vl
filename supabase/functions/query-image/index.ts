// Edge Function للاستعلام عن حالة مهمة توليد الصور
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
      'https://api-integrations.appmedo.com/app-8uitvq60a1vl/api-eLMlJRg7r4j9/image-generation/task',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
      }
    );

    const result = await response.json();

    if (result.status !== 0) {
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
    console.error('Error in query-image:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
