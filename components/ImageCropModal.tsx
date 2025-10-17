import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';

interface ImageCropModalProps {
  imageSrc: string;
  aspectRatio: number;
  onCropComplete: (croppedImageUrl: string) => void;
  onClose: () => void;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ imageSrc, aspectRatio, onCropComplete, onClose }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);


  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop); // Set initial completed crop as well
  }


  const handleConfirmCrop = () => {
    const image = imgRef.current;
    const canvas = previewCanvasRef.current;

    if (!completedCrop || !canvas || !image) {
      console.error('Crop, canvas or image not available');
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    
    ctx.drawImage(
      image,
      cropX,
      cropY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    
    const base64Image = canvas.toDataURL('image/jpeg');
    onCropComplete(base64Image);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-3xl w-full border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-white">Ajustar Imagem</h3>
        <div className="flex justify-center bg-gray-900/50 p-4 rounded-lg">
           <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="max-h-[60vh]"
           >
             <img 
                ref={imgRef} 
                src={imageSrc} 
                onLoad={onImageLoad} 
                alt="Para cortar" 
                style={{ maxHeight: '60vh' }}
            />
           </ReactCrop>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button 
            onClick={onClose} 
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
            Cancelar
          </button>
          <button 
            onClick={handleConfirmCrop} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
            Confirmar Corte
          </button>
        </div>
        <canvas ref={previewCanvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default ImageCropModal;