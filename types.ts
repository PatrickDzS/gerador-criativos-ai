import type { FC } from 'react';

export enum Platform {
  Instagram = 'instagram',
  TikTok = 'tiktok',
  WhatsApp = 'whatsapp',
}

export interface PlatformConfig {
  id: Platform;
  name: string;
  aspectRatio: '1:1' | '9:16';
  aspectRatioClass: string;
  icon: FC<{ className?: string }>;
}

export type CreativeType = 'Image' | 'Video';

export interface CreativeBrief {
  product: string;
  description: string;
  audience: string;
  vibe: string;
  baseImage?: string; // base64 encoded image
  imageInstructions?: string; // specific instructions for the image AI
  optimizeForStories?: boolean; // new property
}

export interface GeneratedContent {
  type: CreativeType;
  headline: string;
  body: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface HistoricalCreative {
  id: string;
  timestamp: number;
  brief: CreativeBrief;
  creative: GeneratedContent;
  platform: Platform;
  creativeType: CreativeType;
}
