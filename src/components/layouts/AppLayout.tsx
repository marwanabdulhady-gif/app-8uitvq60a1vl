// Main application layout with navigation
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';
import routes from '@/routes';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  // Navigation links
  const navLinks = routes.filter(route => route.visible !== false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl">✨</div>
            <h1 className="text-xl font-bold gradient-text hidden sm:block">
              AI Generator
            </h1>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((route) => (
              <Link key={route.path} to={route.path}>
                <Button
                  variant={location.pathname === route.path ? 'default' : 'ghost'}
                  className="gap-2"
                >
                  <span>{route.icon}</span>
                  <span>{t(route.name)}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <h2 className="text-lg font-bold mb-4">{t('nav.menu')}</h2>
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
                      <span>{t(route.name)}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-6 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>{t('footer.copyright')}</p>
      </footer>
    </div>
  );
}
