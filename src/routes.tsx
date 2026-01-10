import ImagesPage from './pages/ImagesPage';
import VideosPage from './pages/VideosPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  icon?: string;
}

const routes: RouteConfig[] = [
  {
    name: 'توليد الصور',
    path: '/',
    element: <ImagesPage />,
    visible: true,
    icon: '🖼️'
  },
  {
    name: 'توليد الفيديوهات',
    path: '/videos',
    element: <VideosPage />,
    visible: true,
    icon: '🎬'
  }
];

export default routes;
