import ImagesPage from './pages/ImagesPage';
import VideosPage from './pages/VideosPage';
import SettingsPage from './pages/SettingsPage';
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
    name: 'nav.images',
    path: '/',
    element: <ImagesPage />,
    visible: true,
    icon: '🖼️'
  },
  {
    name: 'nav.videos',
    path: '/videos',
    element: <VideosPage />,
    visible: true,
    icon: '🎬'
  },
  {
    name: 'nav.settings',
    path: '/settings',
    element: <SettingsPage />,
    visible: true,
    icon: '⚙️'
  }
];

export default routes;
