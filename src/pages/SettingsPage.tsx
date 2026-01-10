// Settings Page
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Palette, Globe, Sliders } from 'lucide-react';
import { IMAGE_MODELS, VIDEO_MODELS, ASPECT_RATIOS, DEFAULT_SETTINGS } from '@/lib/constants';
import type { AppSettings } from '@/types/types';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isDark, setIsDark] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
    }

    // Check current theme
    const currentTheme = document.documentElement.classList.contains('dark');
    setIsDark(currentTheme);
  }, []);

  // Save settings
  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast({
      title: t('success.settingsSaved'),
      description: t('success.settingsSaved'),
    });
  };

  // Update theme
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings({ ...settings, theme });
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDark(false);
      }
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    }
  };

  // Update language
  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setSettings({ ...settings, language: lang });
    setLanguage(lang);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      {/* Appearance Settings */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('settings.appearance')}
          </CardTitle>
          <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <Label htmlFor="theme">{t('settings.theme')}</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: 'light' | 'dark' | 'system') => handleThemeChange(value)}
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">{t('settings.language')}</Label>
            <Select
              value={settings.language}
              onValueChange={(value: 'ar' | 'en') => handleLanguageChange(value)}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Generation Preferences */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            {t('settings.preferences')}
          </CardTitle>
          <CardDescription>{t('settings.preferencesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Image Model */}
          <div className="space-y-2">
            <Label htmlFor="defaultImageModel">{t('settings.defaultModel')} ({t('nav.images')})</Label>
            <Select
              value={settings.defaultImageModel}
              onValueChange={(value) => setSettings({ ...settings, defaultImageModel: value })}
            >
              <SelectTrigger id="defaultImageModel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default Video Model */}
          <div className="space-y-2">
            <Label htmlFor="defaultVideoModel">{t('settings.defaultModel')} ({t('nav.videos')})</Label>
            <Select
              value={settings.defaultVideoModel}
              onValueChange={(value) => setSettings({ ...settings, defaultVideoModel: value })}
            >
              <SelectTrigger id="defaultVideoModel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Default Aspect Ratio */}
          <div className="space-y-2">
            <Label htmlFor="defaultAspectRatio">{t('settings.defaultAspectRatio')}</Label>
            <Select
              value={settings.defaultAspectRatio}
              onValueChange={(value) => setSettings({ ...settings, defaultAspectRatio: value })}
            >
              <SelectTrigger id="defaultAspectRatio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {t(ratio.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Auto-save History */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSaveHistory">{t('settings.autoSaveHistory')}</Label>
            </div>
            <Switch
              id="autoSaveHistory"
              checked={settings.autoSaveHistory}
              onCheckedChange={(checked) => setSettings({ ...settings, autoSaveHistory: checked })}
            />
          </div>

          {/* Show Thumbnails */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showThumbnails">{t('settings.showThumbnails')}</Label>
            </div>
            <Switch
              id="showThumbnails"
              checked={settings.showThumbnails}
              onCheckedChange={(checked) => setSettings({ ...settings, showThumbnails: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} size="lg" className="gradient-bg">
          <SettingsIcon className="h-4 w-4 mr-2" />
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}
