// Application data types

export interface GenerationHistory {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  negative_prompt?: string;
  aspect_ratio?: string;
  duration?: string;
  reference_strength?: number;
  model?: string;
  thumbnail_generated?: boolean;
  status: 'pending' | 'processing' | 'success' | 'failed';
  task_id?: string;
  result_url?: string;
  thumbnail_url?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  referenceImage?: {
    mimeType: string;
    data: string;
  };
  referenceStrength?: number;
  model?: string;
  generateThumbnail?: boolean;
}

export interface VideoGenerationRequest {
  prompt: string;
  aspectRatio?: string;
  duration?: string;
  model?: string;
}

export interface TaskStatus {
  taskId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'submitted' | 'processing' | 'succeed' | 'failed';
  result?: {
    candidates?: Array<{
      content: {
        parts: Array<{
          text: string;
        }>;
      };
    }>;
  };
  task_result?: {
    videos?: Array<{
      url: string;
      duration: string;
    }>;
  };
  error?: {
    code: string;
    message: string;
  };
}

// Profile type for AuthContext compatibility
export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Settings type
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  defaultImageModel: string;
  defaultVideoModel: string;
  defaultAspectRatio: string;
  autoSaveHistory: boolean;
  showThumbnails: boolean;
}

// AI Models
export interface AIModel {
  id: string;
  name: string;
  description: string;
  type: 'image' | 'video';
}


