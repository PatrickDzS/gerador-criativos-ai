import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon } from './icons/ActionIcons';
import { Platform } from '../types';
import ImageCropModal from './ImageCropModal';
import { PLATFORMS } from '../constants';

interface ImageUploaderProps {
  onImageUpload: (base64Image: string) => void;
  onImageRemove: () => void;
  initialImage?: string;
  platform: Platform;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onImageRemove, initialImage, platform }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(initialImage || null);
  }, [initialImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setPreview(croppedImage);
    onImageUpload(croppedImage);
    setImageToCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropClose = () => {
    setImageToCrop(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleAreaClick = () => {
      fileInputRef.current?.click();
  }

  const platformConfig = PLATFORMS.find(p => p.id === platform) || PLATFORMS[0];
  const [w, h] = platformConfig.aspectRatio.split(':').map(Number);
  const aspectRatio = w / h;

  return (
    <div className="w-full">
        <label className="block text-sm font-medium text-gray-300 mb-2">
            Imagem de Base (Opcional)
        </label>
        <div 
            onClick={handleAreaClick}
            className={`
                w-full aspect-video border-2 border-dashed rounded-lg flex items-center justify-center text-center
                transition-colors duration-200 cursor-pointer
                ${preview ? 'border-purple-500 bg-gray-800' : 'border-gray-600 bg-gray-700/50 hover:border-purple-400'}
            `}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                className="hidden"
            />
            {preview ? (
                <div className="relative w-full h-full">
                    <img src={preview} alt="Pré-visualização" className="w-full h-full object-contain rounded-lg p-1"/>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors"
                        title="Remover Imagem"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ) : (
                <div className="text-gray-400">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                    <p className="font-semibold">Clique para enviar uma imagem</p>
                    <p className="text-xs">PNG ou JPG</p>
                </div>
            )}
        </div>
        {imageToCrop && (
            <ImageCropModal 
                imageSrc={imageToCrop}
                aspectRatio={aspectRatio}
                onCropComplete={handleCropComplete}
                onClose={handleCropClose}
            />
        )}
    </div>
  );
};

export default ImageUploader;