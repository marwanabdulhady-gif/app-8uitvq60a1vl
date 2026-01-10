// Constants for AI models and configurations
import type { AIModel } from '@/types/types';

export const IMAGE_MODELS: AIModel[] = [
  {
    id: 'nano-banana-pro',
    name: 'Nano Banana Pro',
    description: 'High-quality image generation with advanced features',
    type: 'image',
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    description: 'Fast and reliable image generation',
    type: 'image',
  },
  {
    id: 'dall-e',
    name: 'DALL-E',
    description: 'Creative and artistic image generation',
    type: 'image',
  },
];

export const VIDEO_MODELS: AIModel[] = [
  {
    id: 'kling-v2-master',
    name: 'Kling V2 Master',
    description: 'Latest model with best quality',
    type: 'video',
  },
  {
    id: 'kling-v2-1-master',
    name: 'Kling V2.1 Master',
    description: 'Enhanced version with improved details',
    type: 'video',
  },
  {
    id: 'kling-v2-5-turbo',
    name: 'Kling V2.5 Turbo',
    description: 'Faster generation with good quality',
    type: 'video',
  },
  {
    id: 'kling-v1',
    name: 'Kling V1',
    description: 'Stable and reliable generation',
    type: 'video',
  },
  {
    id: 'kling-v1-6',
    name: 'Kling V1.6',
    description: 'Improved V1 with better results',
    type: 'video',
  },
];

export const ASPECT_RATIOS = [
  { value: '1:1', label: 'aspect.square' },
  { value: '16:9', label: 'aspect.landscape' },
  { value: '9:16', label: 'aspect.portrait' },
];

export const VIDEO_DURATIONS = [
  { value: '5', label: 'duration.5s' },
  { value: '10', label: 'duration.10s' },
];

export const DEFAULT_SETTINGS = {
  theme: 'system' as const,
  language: 'en' as const,
  defaultImageModel: 'nano-banana-pro',
  defaultVideoModel: 'kling-v2-master',
  defaultAspectRatio: '1:1',
  autoSaveHistory: true,
  showThumbnails: true,
};
