// مكون سجل التوليد
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Trash2, Eye, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getGenerationHistory, deleteGenerationRecord } from '@/db/api';
import type { GenerationHistory as GenerationHistoryType } from '@/types/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GenerationHistoryProps {
  type: 'image' | 'video';
  refreshTrigger?: number;
}

export default function GenerationHistory({ type, refreshTrigger }: GenerationHistoryProps) {
  const [history, setHistory] = useState<GenerationHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GenerationHistoryType | null>(null);
  const { toast } = useToast();

  // تحميل السجل
  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await getGenerationHistory(type, 50);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل السجل',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [type, refreshTrigger]);

  // حذف سجل
  const handleDelete = async (id: string) => {
    try {
      await deleteGenerationRecord(id);
      toast({
        title: 'تم الحذف',
        description: 'تم حذف السجل بنجاح',
      });
      loadHistory();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف السجل',
        variant: 'destructive',
      });
    }
  };

  // تحميل الملف
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
  };

  // أيقونة الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'نجح';
      case 'failed':
        return 'فشل';
      case 'processing':
        return 'قيد التنفيذ';
      default:
        return 'في الانتظار';
    }
  };

  // لون الحالة
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>سجل التوليد</CardTitle>
        <CardDescription>
          آخر 50 عملية توليد {type === 'image' ? 'للصور' : 'للفيديوهات'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-32 w-full bg-muted" />
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>لا يوجد سجل بعد</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* المعاينة */}
                  <div className="relative aspect-video bg-muted flex items-center justify-center">
                    {item.status === 'success' && item.result_url ? (
                      type === 'image' ? (
                        <img
                          src={item.result_url}
                          alt="معاينة"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.result_url}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="text-muted-foreground">
                        {getStatusIcon(item.status)}
                      </div>
                    )}
                    {/* شارة الحالة */}
                    <div className="absolute top-2 left-2">
                      <Badge variant={getStatusVariant(item.status)} className="gap-1">
                        {getStatusIcon(item.status)}
                        {getStatusText(item.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* التفاصيل */}
                  <div className="p-4 space-y-3">
                    <p className="text-sm line-clamp-2" title={item.prompt}>
                      {item.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </p>

                    {/* الإجراءات */}
                    <div className="flex gap-2">
                      {item.status === 'success' && item.result_url && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedItem(item)}
                            className="flex-1"
                          >
                            <Eye className="h-3 w-3 ml-1" />
                            عرض
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDownload(
                                item.result_url!,
                                `${type}-${item.id}.${type === 'image' ? 'jpg' : 'mp4'}`
                              )
                            }
                            className="flex-1"
                          >
                            <Download className="h-3 w-3 ml-1" />
                            تحميل
                          </Button>
                        </>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* مربع حوار العرض */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>معاينة</DialogTitle>
          </DialogHeader>
          {selectedItem && selectedItem.result_url && (
            <div className="space-y-4">
              {type === 'image' ? (
                <img
                  src={selectedItem.result_url}
                  alt="معاينة"
                  className="w-full rounded-lg"
                />
              ) : (
                <video
                  src={selectedItem.result_url}
                  controls
                  className="w-full rounded-lg"
                >
                  متصفحك لا يدعم عرض الفيديو
                </video>
              )}
              <div className="space-y-2">
                <p className="text-sm font-medium">الوصف النصي:</p>
                <p className="text-sm text-muted-foreground">{selectedItem.prompt}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
