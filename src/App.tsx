import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import AppLayout from '@/components/layouts/AppLayout';
import { LanguageProvider } from '@/contexts/LanguageContext';
import routes from './routes';
import { Toaster } from '@/components/ui/toaster';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <IntersectObserver />
        <AppLayout>
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
        <Toaster />
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
