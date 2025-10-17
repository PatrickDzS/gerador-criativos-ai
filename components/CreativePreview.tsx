
import React from 'react';
import { GeneratedContent, Platform } from '../types';
import { PLATFORMS } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { DownloadIcon } from './icons/ActionIcons';

interface CreativePreviewProps {
  creative: GeneratedContent | null;
  variations: GeneratedContent[] | null;
  onSelectVariation: (creative: GeneratedContent) => void;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  platform: Platform;
}

const CreativePreview: React.FC<CreativePreviewProps> = ({
  creative,
  variations,
  onSelectVariation,
  isLoading,
  loadingMessage,
  error,
  platform,
}) => {
  const platformConfig = PLATFORMS.find(p => p.id === platform);

  const handleDownload = () => {
    if (!creative) return;
    const url = creative.imageUrl || creative.videoUrl;
    if (!url) return;

    // For blob URLs (from video generation), we can just open them.
    // For base64 data URLs, we need to create a link and click it.
    if (url.startsWith('blob:')) {
      window.open(url, '_blank');
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    const fileExtension = creative.type === 'Video' ? 'mp4' : 'jpeg';
    link.download = `${creative.headline.replace(/\s+/g, '_').toLowerCase()}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={`flex flex-col items-center justify-center text-center bg-gray-900/50 p-8 rounded-lg ${platformConfig?.aspectRatioClass || 'aspect-square'} w-full`}>
            <LoadingSpinner message={loadingMessage} />
        </div>
      );
    }
    if (error) {
      return (
        <div className={`flex flex-col items-center justify-center text-center bg-red-900/50 p-6 rounded-lg ${platformConfig?.aspectRatioClass || 'aspect-square'} w-full`}>
          <h3 className="font-bold text-lg mb-2 text-red-300">Erro na Geração</h3>
          <p className="text-red-400">{error}</p>
        </div>
      );
    }
    if (!creative) {
      return (
        <div className={`flex flex-col items-center justify-center text-center bg-gray-900/50 p-8 rounded-lg ${platformConfig?.aspectRatioClass || 'aspect-square'} w-full`}>
          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24">
                <defs>
                    <linearGradient id="logo-gradient-preview" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#A855F7" />
                        <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                </defs>
                <path stroke="url(#logo-gradient-preview)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.685-2.685L11.25 18l1.938-.648a3.375 3.375 0 002.685-2.685L16.25 13.5l.648 1.938a3.375 3.375 0 002.685 2.685L21.25 18l-1.938.648a3.375 3.375 0 00-2.685 2.685z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Sua prévia aparecerá aqui</h3>
          <p className="text-gray-400 mt-2">Preencha o brief e clique em "Gerar" para ver a mágica acontecer.</p>
        </div>
      );
    }

    return (
      <div className={`${platformConfig?.aspectRatioClass || 'aspect-square'} w-full bg-black rounded-lg overflow-hidden relative shadow-lg`}>
        {creative.type === 'Image' && creative.imageUrl && (
          <img src={creative.imageUrl} alt={creative.headline} className="w-full h-full object-cover" />
        )}
        {creative.type === 'Video' && creative.videoUrl && (
          <video src={creative.videoUrl} controls autoPlay loop muted className="w-full h-full object-cover" playsInline>
            Seu navegador não suporta a tag de vídeo.
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6 flex flex-col justify-end">
          <h3 className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg leading-tight">{creative.headline}</h3>
          <p className="text-gray-200 text-sm md:text-base mt-2 drop-shadow-md">{creative.body}</p>
        </div>
        <button
            onClick={handleDownload}
            className="absolute top-3 right-3 bg-black/50 hover:bg-purple-600 text-white rounded-full p-2.5 transition-colors duration-200 backdrop-blur-sm"
            title="Baixar Criativo"
        >
            <DownloadIcon className="h-5 w-5" />
        </button>
      </div>
    );
  };

  const renderVariations = () => {
    if (isLoading || !variations || variations.length <= 1) return null;

    return (
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Variações</h4>
        <div className="grid grid-cols-3 gap-3">
          {variations.map((variation, index) => {
            const isSelected = variation.imageUrl === creative?.imageUrl && variation.videoUrl === creative?.videoUrl;
            return (
              <button
                key={index}
                onClick={() => onSelectVariation(variation)}
                className={`relative aspect-square rounded-md overflow-hidden transition-all duration-200 transform hover:scale-105 focus:outline-none group ${isSelected ? 'ring-4 ring-purple-500' : 'ring-2 ring-transparent hover:ring-purple-400'}`}
              >
                <img src={variation.imageUrl} alt={`Variação ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>
                {variation.type === 'Video' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-2">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
                    </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-center items-center">
        {renderContent()}
      </div>
      {renderVariations()}
    </div>
  );
};

export default CreativePreview;
