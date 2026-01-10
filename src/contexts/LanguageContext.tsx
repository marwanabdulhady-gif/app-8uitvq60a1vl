// Language Context for i18n support
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ar: {
    // Navigation
    'nav.images': 'توليد الصور',
    'nav.videos': 'توليد الفيديوهات',
    'nav.settings': 'الإعدادات',
    'nav.menu': 'القائمة',
    
    // Common
    'common.generate': 'توليد',
    'common.download': 'تحميل',
    'common.delete': 'حذف',
    'common.view': 'عرض',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.copy': 'نسخ',
    'common.regenerate': 'إعادة التوليد',
    'common.upload': 'رفع',
    'common.remove': 'إزالة',
    'common.change': 'تغيير',
    'common.optional': 'اختياري',
    'common.required': 'إلزامي',
    
    // Image Generation
    'image.title': 'توليد الصور بالذكاء الاصطناعي',
    'image.subtitle': 'حول أفكارك إلى صور مذهلة باستخدام الذكاء الاصطناعي',
    'image.settings': 'إعدادات التوليد',
    'image.settingsDesc': 'أدخل الوصف النصي وخصص الإعدادات',
    'image.prompt': 'الوصف النصي',
    'image.promptPlaceholder': 'مثال: قطة برتقالية لطيفة تجلس في حديقة مشمسة، محاطة بالزهور الملونة، أسلوب كرتوني، دقة عالية',
    'image.negativePrompt': 'الوصف السلبي',
    'image.negativePromptPlaceholder': 'مثال: ضبابي، جودة منخفضة، مشوه',
    'image.aspectRatio': 'نسبة العرض إلى الارتفاع',
    'image.model': 'نموذج الذكاء الاصطناعي',
    'image.referenceImage': 'صورة مرجعية',
    'image.referenceStrength': 'قوة المرجع',
    'image.generateThumbnail': 'توليد صورة مصغرة',
    'image.result': 'النتيجة',
    'image.resultDesc': 'الصورة المولدة ستظهر هنا',
    'image.noResult': 'لم يتم توليد صورة بعد',
    'image.generating': 'جاري التوليد...',
    'image.generatingDesc': 'جاري التوليد... قد يستغرق هذا عدة دقائق',
    'image.thumbnail': 'الصورة المصغرة',
    
    // Video Generation
    'video.title': 'توليد الفيديوهات بالذكاء الاصطناعي',
    'video.subtitle': 'حول النصوص إلى فيديوهات احترافية باستخدام الذكاء الاصطناعي',
    'video.settings': 'إعدادات التوليد',
    'video.settingsDesc': 'أدخل الوصف النصي وخصص الإعدادات',
    'video.prompt': 'الوصف النصي',
    'video.promptPlaceholder': 'مثال: غروب جميل فوق المحيط، أمواج هادئة، سماء برتقالية وردية، طيور تحلق في الأفق',
    'video.aspectRatio': 'نسبة العرض إلى الارتفاع',
    'video.duration': 'مدة الفيديو',
    'video.model': 'نموذج الذكاء الاصطناعي',
    'video.result': 'النتيجة',
    'video.resultDesc': 'الفيديو المولد سيظهر هنا',
    'video.noResult': 'لم يتم توليد فيديو بعد',
    'video.generating': 'جاري التوليد...',
    'video.generatingDesc': 'جاري التوليد... قد يستغرق هذا عدة دقائق',
    
    // History
    'history.title': 'سجل التوليد',
    'history.imageDesc': 'آخر 50 عملية توليد للصور',
    'history.videoDesc': 'آخر 50 عملية توليد للفيديوهات',
    'history.empty': 'لا يوجد سجل بعد',
    'history.deleteConfirm': 'تأكيد الحذف',
    'history.deleteDesc': 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.',
    'history.preview': 'معاينة',
    'history.prompt': 'الوصف النصي:',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.subtitle': 'خصص تجربتك',
    'settings.appearance': 'المظهر',
    'settings.appearanceDesc': 'خصص مظهر التطبيق',
    'settings.theme': 'الوضع',
    'settings.themeLight': 'نهاري',
    'settings.themeDark': 'ليلي',
    'settings.themeSystem': 'النظام',
    'settings.language': 'اللغة',
    'settings.languageDesc': 'اختر لغة التطبيق',
    'settings.preferences': 'التفضيلات',
    'settings.preferencesDesc': 'خصص تفضيلات التوليد',
    'settings.defaultModel': 'النموذج الافتراضي',
    'settings.defaultAspectRatio': 'نسبة العرض الافتراضية',
    'settings.autoSaveHistory': 'حفظ السجل تلقائياً',
    'settings.showThumbnails': 'عرض الصور المصغرة',
    
    // Aspect Ratios
    'aspect.square': 'مربع (1:1)',
    'aspect.landscape': 'أفقي (16:9)',
    'aspect.portrait': 'عمودي (9:16)',
    'aspect.custom': 'مخصص',
    
    // Durations
    'duration.5s': '5 ثوانٍ',
    'duration.10s': '10 ثوانٍ',
    
    // Status
    'status.pending': 'في الانتظار',
    'status.processing': 'قيد التنفيذ',
    'status.success': 'نجح',
    'status.failed': 'فشل',
    
    // Errors
    'error.title': 'خطأ',
    'error.promptRequired': 'يرجى إدخال وصف نصي',
    'error.fileSizeLimit': 'حجم الملف يجب أن يكون أقل من 1 ميجابايت',
    'error.fileTypeUnsupported': 'نوع الملف غير مدعوم. يرجى استخدام PNG أو JPEG أو WEBP',
    'error.generationFailed': 'فشل في التوليد',
    'error.timeout': 'انتهت المهلة',
    'error.timeoutDesc': 'استغرق التوليد وقتاً طويلاً. يرجى المحاولة مرة أخرى',
    'error.loadHistory': 'فشل في تحميل السجل',
    'error.deleteRecord': 'فشل في حذف السجل',
    
    // Success
    'success.generated': 'نجح التوليد!',
    'success.imageGenerated': 'تم توليد الصورة بنجاح',
    'success.videoGenerated': 'تم توليد الفيديو بنجاح',
    'success.copied': 'تم النسخ',
    'success.promptCopied': 'تم نسخ الوصف النصي',
    'success.deleted': 'تم الحذف',
    'success.recordDeleted': 'تم حذف السجل بنجاح',
    'success.settingsSaved': 'تم حفظ الإعدادات',
    
    // Footer
    'footer.copyright': '© 2026 مولد الصور والفيديوهات بالذكاء الاصطناعي',
  },
  en: {
    // Navigation
    'nav.images': 'Image Generation',
    'nav.videos': 'Video Generation',
    'nav.settings': 'Settings',
    'nav.menu': 'Menu',
    
    // Common
    'common.generate': 'Generate',
    'common.download': 'Download',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.copy': 'Copy',
    'common.regenerate': 'Regenerate',
    'common.upload': 'Upload',
    'common.remove': 'Remove',
    'common.change': 'Change',
    'common.optional': 'Optional',
    'common.required': 'Required',
    
    // Image Generation
    'image.title': 'AI Image Generation',
    'image.subtitle': 'Transform your ideas into stunning images using AI',
    'image.settings': 'Generation Settings',
    'image.settingsDesc': 'Enter text description and customize settings',
    'image.prompt': 'Text Prompt',
    'image.promptPlaceholder': 'Example: A cute orange kitten sitting in a sunny garden, surrounded by colorful flowers, cartoon style, high definition',
    'image.negativePrompt': 'Negative Prompt',
    'image.negativePromptPlaceholder': 'Example: blurry, low quality, distorted',
    'image.aspectRatio': 'Aspect Ratio',
    'image.model': 'AI Model',
    'image.referenceImage': 'Reference Image',
    'image.referenceStrength': 'Reference Strength',
    'image.generateThumbnail': 'Generate Thumbnail',
    'image.result': 'Result',
    'image.resultDesc': 'Generated image will appear here',
    'image.noResult': 'No image generated yet',
    'image.generating': 'Generating...',
    'image.generatingDesc': 'Generating... This may take several minutes',
    'image.thumbnail': 'Thumbnail',
    
    // Video Generation
    'video.title': 'AI Video Generation',
    'video.subtitle': 'Transform text into professional videos using AI',
    'video.settings': 'Generation Settings',
    'video.settingsDesc': 'Enter text description and customize settings',
    'video.prompt': 'Text Prompt',
    'video.promptPlaceholder': 'Example: A beautiful sunset over the ocean, calm waves, orange and pink sky, birds flying in the horizon',
    'video.aspectRatio': 'Aspect Ratio',
    'video.duration': 'Video Duration',
    'video.model': 'AI Model',
    'video.result': 'Result',
    'video.resultDesc': 'Generated video will appear here',
    'video.noResult': 'No video generated yet',
    'video.generating': 'Generating...',
    'video.generatingDesc': 'Generating... This may take several minutes',
    
    // History
    'history.title': 'Generation History',
    'history.imageDesc': 'Last 50 image generations',
    'history.videoDesc': 'Last 50 video generations',
    'history.empty': 'No history yet',
    'history.deleteConfirm': 'Confirm Deletion',
    'history.deleteDesc': 'Are you sure you want to delete this record? This action cannot be undone.',
    'history.preview': 'Preview',
    'history.prompt': 'Prompt:',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your experience',
    'settings.appearance': 'Appearance',
    'settings.appearanceDesc': 'Customize app appearance',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeSystem': 'System',
    'settings.language': 'Language',
    'settings.languageDesc': 'Choose app language',
    'settings.preferences': 'Preferences',
    'settings.preferencesDesc': 'Customize generation preferences',
    'settings.defaultModel': 'Default Model',
    'settings.defaultAspectRatio': 'Default Aspect Ratio',
    'settings.autoSaveHistory': 'Auto-save History',
    'settings.showThumbnails': 'Show Thumbnails',
    
    // Aspect Ratios
    'aspect.square': 'Square (1:1)',
    'aspect.landscape': 'Landscape (16:9)',
    'aspect.portrait': 'Portrait (9:16)',
    'aspect.custom': 'Custom',
    
    // Durations
    'duration.5s': '5 seconds',
    'duration.10s': '10 seconds',
    
    // Status
    'status.pending': 'Pending',
    'status.processing': 'Processing',
    'status.success': 'Success',
    'status.failed': 'Failed',
    
    // Errors
    'error.title': 'Error',
    'error.promptRequired': 'Please enter a text prompt',
    'error.fileSizeLimit': 'File size must be less than 1MB',
    'error.fileTypeUnsupported': 'File type not supported. Please use PNG, JPEG, or WEBP',
    'error.generationFailed': 'Generation failed',
    'error.timeout': 'Timeout',
    'error.timeoutDesc': 'Generation took too long. Please try again',
    'error.loadHistory': 'Failed to load history',
    'error.deleteRecord': 'Failed to delete record',
    
    // Success
    'success.generated': 'Generated Successfully!',
    'success.imageGenerated': 'Image generated successfully',
    'success.videoGenerated': 'Video generated successfully',
    'success.copied': 'Copied',
    'success.promptCopied': 'Prompt copied to clipboard',
    'success.deleted': 'Deleted',
    'success.recordDeleted': 'Record deleted successfully',
    'success.settingsSaved': 'Settings saved',
    
    // Footer
    'footer.copyright': '© 2026 AI Image & Video Generator',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
      document.documentElement.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
