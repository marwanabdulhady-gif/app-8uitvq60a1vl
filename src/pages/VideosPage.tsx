// صفحة توليد الفيديوهات
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Video as VideoIcon, Play } from 'lucide-react';
import { submitVideoGeneration, queryVideoStatus, createGenerationRecord, updateGenerationRecord } from '@/db/api';
import GenerationHistory from '@/components/GenerationHistory';

export default function VideosPage() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const { toast } = useToast();

  // الاستعلام عن حالة المهمة
  const pollTaskStatus = async (taskId: string, recordId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 10 دقائق (كل 10 ثوانٍ)

    const poll = async () => {
      try {
        attempts++;
        setProgress((attempts / maxAttempts) * 100);

        const status = await queryVideoStatus(taskId);

        if (status.task_status === 'succeed') {
          // استخراج رابط الفيديو من النتيجة
          const videoUrl = status.task_result?.videos?.[0]?.url;
          if (videoUrl) {
            setGeneratedVideo(videoUrl);
            await updateGenerationRecord(recordId, {
              status: 'success',
              result_url: videoUrl,
            });
            toast({
              title: 'نجح التوليد! 🎬',
              description: 'تم توليد الفيديو بنجاح',
            });
            setRefreshHistory(prev => prev + 1);
          }
          setIsGenerating(false);
          setProgress(100);
        } else if (status.task_status === 'failed') {
          await updateGenerationRecord(recordId, {
            status: 'failed',
            error_message: status.task_status_msg || 'فشل التوليد',
          });
          toast({
            title: 'فشل التوليد',
            description: status.task_status_msg || 'حدث خطأ أثناء توليد الفيديو',
            variant: 'destructive',
          });
          setIsGenerating(false);
          setRefreshHistory(prev => prev + 1);
        } else if (attempts < maxAttempts) {
          // الاستمرار في الاستعلام
          setTimeout(poll, 10000); // كل 10 ثوانٍ
        } else {
          // انتهت المحاولات
          await updateGenerationRecord(recordId, {
            status: 'failed',
            error_message: 'انتهت مهلة التوليد',
          });
          toast({
            title: 'انتهت المهلة',
            description: 'استغرق التوليد وقتاً طويلاً. يرجى المحاولة مرة أخرى',
            variant: 'destructive',
          });
          setIsGenerating(false);
          setRefreshHistory(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error polling task status:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setIsGenerating(false);
          toast({
            title: 'خطأ',
            description: 'فشل في الاستعلام عن حالة المهمة',
            variant: 'destructive',
          });
        }
      }
    };

    poll();
  };

  // توليد الفيديو
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال وصف نصي',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setProgress(0);

    try {
      // إنشاء سجل في قاعدة البيانات
      const record = await createGenerationRecord({
        type: 'video',
        prompt,
        aspect_ratio: aspectRatio,
        duration,
        status: 'pending',
      });

      if (!record) {
        throw new Error('فشل في إنشاء سجل التوليد');
      }

      setCurrentRecordId(record.id);

      // إرسال مهمة التوليد
      const result = await submitVideoGeneration({
        prompt,
        aspectRatio,
        duration,
      });

      setCurrentTaskId(result.task_id);

      // تحديث السجل بمعرف المهمة
      await updateGenerationRecord(record.id, {
        task_id: result.task_id,
        status: 'processing',
      });

      // بدء الاستعلام عن الحالة
      pollTaskStatus(result.task_id, record.id);
    } catch (error) {
      console.error('Error generating video:', error);
      setIsGenerating(false);
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في توليد الفيديو',
        variant: 'destructive',
      });
    }
  };

  // تحميل الفيديو
  const handleDownload = () => {
    if (!generatedVideo) return;

    const link = document.createElement('a');
    link.href = generatedVideo;
    link.download = `ai-video-${Date.now()}.mp4`;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* العنوان */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold gradient-text">توليد الفيديوهات بالذكاء الاصطناعي</h1>
        <p className="text-muted-foreground">حول النصوص إلى فيديوهات احترافية باستخدام الذكاء الاصطناعي</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* نموذج الإدخال */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <VideoIcon className="h-5 w-5" />
              إعدادات التوليد
            </CardTitle>
            <CardDescription>أدخل الوصف النصي وخصص الإعدادات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* الوصف النصي */}
            <div className="space-y-2">
              <Label htmlFor="prompt">الوصف النصي *</Label>
              <Textarea
                id="prompt"
                placeholder="مثال: غروب جميل فوق المحيط، أمواج هادئة، سماء برتقالية وردية، طيور تحلق في الأفق"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>

            {/* نسبة العرض إلى الارتفاع */}
            <div className="space-y-2">
              <Label htmlFor="aspect-ratio">نسبة العرض إلى الارتفاع</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger id="aspect-ratio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">مربع (1:1)</SelectItem>
                  <SelectItem value="16:9">أفقي (16:9)</SelectItem>
                  <SelectItem value="9:16">عمودي (9:16)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* مدة الفيديو */}
            <div className="space-y-2">
              <Label htmlFor="duration">مدة الفيديو</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 ثوانٍ</SelectItem>
                  <SelectItem value="10">10 ثوانٍ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* زر التوليد */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full gradient-bg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <VideoIcon className="h-4 w-4 ml-2" />
                  توليد الفيديو
                </>
              )}
            </Button>

            {/* شريط التقدم */}
            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  جاري التوليد... قد يستغرق هذا عدة دقائق
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* عرض النتيجة */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>النتيجة</CardTitle>
            <CardDescription>الفيديو المولد سيظهر هنا</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedVideo ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
                  <video
                    src={generatedVideo}
                    controls
                    className="w-full h-full"
                  >
                    متصفحك لا يدعم عرض الفيديو
                  </video>
                </div>
                <Button onClick={handleDownload} className="w-full">
                  <Download className="h-4 w-4 ml-2" />
                  تحميل الفيديو
                </Button>
              </div>
            ) : (
              <div className="aspect-video w-full flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/50">
                <div className="text-center space-y-2">
                  <Play className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isGenerating ? 'جاري التوليد...' : 'لم يتم توليد فيديو بعد'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* سجل التوليد */}
      <GenerationHistory type="video" refreshTrigger={refreshHistory} />
    </div>
  );
}
