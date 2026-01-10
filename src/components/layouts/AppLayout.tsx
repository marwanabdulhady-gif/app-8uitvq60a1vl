// تخطيط التطبيق الرئيسي مع التنقل
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import routes from '@/routes';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // تحميل تفضيل الوضع الليلي من localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // تبديل الوضع الليلي/النهاري
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // روابط التنقل
  const navLinks = routes.filter(route => route.visible !== false);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {/* شريط التنقل العلوي */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* الشعار */}
          <div className="flex items-center gap-2">
            <div className="text-2xl">✨</div>
            <h1 className="text-xl font-bold gradient-text hidden sm:block">
              مولد الذكاء الاصطناعي
            </h1>
          </div>

          {/* التنقل - سطح المكتب */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((route) => (
              <Link key={route.path} to={route.path}>
                <Button
                  variant={location.pathname === route.path ? 'default' : 'ghost'}
                  className="gap-2"
                >
                  <span>{route.icon}</span>
                  <span>{route.name}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-2">
            {/* زر تبديل الوضع */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="تبديل الوضع الليلي/النهاري"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* قائمة الهاتف */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <h2 className="text-lg font-bold mb-4">القائمة</h2>
                  {navLinks.map((route) => (
                    <Link
                      key={route.path}
                      to={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={location.pathname === route.path ? 'default' : 'ghost'}
                        className="w-full justify-start gap-2"
                      >
                        <span>{route.icon}</span>
                        <span>{route.name}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 container py-6 px-4">
        {children}
      </main>

      {/* التذييل */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 مولد الصور والفيديوهات بالذكاء الاصطناعي</p>
      </footer>
    </div>
  );
}
