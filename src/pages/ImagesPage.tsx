// صفحة توليد الصور
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Download, Copy, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { submitImageGeneration, queryImageStatus, createGenerationRecord, updateGenerationRecord } from '@/db/api';
import GenerationHistory from '@/components/GenerationHistory';

export default function ImagesPage() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [referenceImage, setReferenceImage] = useState<{ file: File; preview: string } | null>(null);
  const [referenceStrength, setReferenceStrength] = useState(0.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // معالجة رفع الصورة المرجعية
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من حجم الملف (1MB)
      if (file.size > 1024 * 1024) {
        toast({
          title: 'خطأ',
          description: 'حجم الملف يجب أن يكون أقل من 1 ميجابايت',
          variant: 'destructive',
        });
        return;
      }

      // التحقق من نوع الملف
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        toast({
          title: 'خطأ',
          description: 'نوع الملف غير مدعوم. يرجى استخدام PNG أو JPEG أو WEBP',
          variant: 'destructive',
        });
        return;
      }

      const preview = URL.createObjectURL(file);
      setReferenceImage({ file, preview });
    }
  };

  // تحويل الصورة إلى Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // الاستعلام عن حالة المهمة
  const pollTaskStatus = async (taskId: string, recordId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 10 دقائق (كل 10 ثوانٍ)

    const poll = async () => {
      try {
        attempts++;
        setProgress((attempts / maxAttempts) * 100);

        const status = await queryImageStatus(taskId);

        if (status.status === 'SUCCESS') {
          // استخراج رابط الصورة من النتيجة
          const imageText = status.result?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (imageText) {
            // استخراج Base64 من النص
            const match = imageText.match(/data:image\/[^;]+;base64,([^)]+)/);
            if (match) {
              const imageUrl = `data:image/jpeg;base64,${match[1]}`;
              setGeneratedImage(imageUrl);
              await updateGenerationRecord(recordId, {
                status: 'success',
                result_url: imageUrl,
              });
              toast({
                title: 'نجح التوليد! ✨',
                description: 'تم توليد الصورة بنجاح',
              });
              setRefreshHistory(prev => prev + 1);
            }
          }
          setIsGenerating(false);
          setProgress(100);
        } else if (status.status === 'FAILED') {
          await updateGenerationRecord(recordId, {
            status: 'failed',
            error_message: status.error?.message || 'فشل التوليد',
          });
          toast({
            title: 'فشل التوليد',
            description: status.error?.message || 'حدث خطأ أثناء توليد الصورة',
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

  // توليد الصورة
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
    setGeneratedImage(null);
    setProgress(0);

    try {
      // تحويل الصورة المرجعية إلى Base64 إذا كانت موجودة
      let referenceImageData: { mimeType: string; data: string } | undefined = undefined;
      if (referenceImage) {
        const base64 = await convertToBase64(referenceImage.file);
        referenceImageData = {
          mimeType: referenceImage.file.type,
          data: base64,
        };
      }

      // إنشاء سجل في قاعدة البيانات
      const record = await createGenerationRecord({
        type: 'image',
        prompt,
        negative_prompt: negativePrompt || undefined,
        aspect_ratio: aspectRatio,
        reference_strength: referenceImage ? referenceStrength : undefined,
        status: 'pending',
      });

      if (!record) {
        throw new Error('فشل في إنشاء سجل التوليد');
      }

      setCurrentRecordId(record.id);

      // إرسال مهمة التوليد
      const result = await submitImageGeneration({
        prompt,
        negativePrompt: negativePrompt || undefined,
        referenceImage: referenceImageData,
        referenceStrength: referenceImage ? referenceStrength : undefined,
      });

      setCurrentTaskId(result.taskId);

      // تحديث السجل بمعرف المهمة
      await updateGenerationRecord(record.id, {
        task_id: result.taskId,
        status: 'processing',
      });

      // بدء الاستعلام عن الحالة
      pollTaskStatus(result.taskId, record.id);
    } catch (error) {
      console.error('Error generating image:', error);
      setIsGenerating(false);
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في توليد الصورة',
        variant: 'destructive',
      });
    }
  };

  // تحميل الصورة
  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-image-${Date.now()}.jpg`;
    link.click();
  };

  // نسخ الوصف النصي
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ الوصف النصي',
    });
  };

  // إعادة التوليد
  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* العنوان */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold gradient-text">توليد الصور بالذكاء الاصطناعي</h1>
        <p className="text-muted-foreground">حول أفكارك إلى صور مذهلة باستخدام الذكاء الاصطناعي</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* نموذج الإدخال */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
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
                placeholder="مثال: قطة برتقالية لطيفة تجلس في حديقة مشمسة، محاطة بالزهور الملونة، أسلوب كرتوني، دقة عالية"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* الوصف السلبي */}
            <div className="space-y-2">
              <Label htmlFor="negative-prompt">الوصف السلبي (اختياري)</Label>
              <Textarea
                id="negative-prompt"
                placeholder="مثال: ضبابي، جودة منخفضة، مشوه"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                rows={2}
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

            {/* رفع صورة مرجعية */}
            <div className="space-y-2">
              <Label>صورة مرجعية (اختياري)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 ml-2" />
                  {referenceImage ? 'تغيير الصورة' : 'رفع صورة'}
                </Button>
                {referenceImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setReferenceImage(null)}
                  >
                    إزالة
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              {referenceImage && (
                <div className="mt-2">
                  <img
                    src={referenceImage.preview}
                    alt="معاينة"
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                </div>
              )}
            </div>

            {/* قوة المرجع */}
            {referenceImage && (
              <div className="space-y-2">
                <Label>قوة المرجع: {referenceStrength.toFixed(2)}</Label>
                <Slider
                  value={[referenceStrength]}
                  onValueChange={(value) => setReferenceStrength(value[0])}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}

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
                  <ImageIcon className="h-4 w-4 ml-2" />
                  توليد الصورة
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
            <CardDescription>الصورة المولدة ستظهر هنا</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedImage ? (
              <div className="space-y-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border">
                  <img
                    src={generatedImage}
                    alt="صورة مولدة"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 ml-2" />
                    تحميل
                  </Button>
                  <Button onClick={handleCopyPrompt} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 ml-2" />
                    نسخ الوصف
                  </Button>
                  <Button onClick={handleRegenerate} variant="outline">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-square w-full flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/50">
                <div className="text-center space-y-2">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isGenerating ? 'جاري التوليد...' : 'لم يتم توليد صورة بعد'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* سجل التوليد */}
      <GenerationHistory type="image" refreshTrigger={refreshHistory} />
    </div>
  );
}
