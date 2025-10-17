
import { Platform, type PlatformConfig } from './types';
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from './components/icons/PlatformIcons';

export const PLATFORMS: PlatformConfig[] = [
  {
    id: Platform.Instagram,
    name: 'Instagram Post',
    aspectRatio: '1:1',
    aspectRatioClass: 'aspect-square',
    icon: InstagramIcon,
  },
  {
    id: Platform.TikTok,
    name: 'TikTok / Reels',
    aspectRatio: '9:16',
    aspectRatioClass: 'aspect-[9/16]',
    icon: TikTokIcon,
  },
  {
    id: Platform.WhatsApp,
    name: 'WhatsApp Status',
    aspectRatio: '9:16',
    aspectRatioClass: 'aspect-[9/16]',
    icon: WhatsAppIcon,
  },
];
