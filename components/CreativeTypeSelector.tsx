import React from 'react';
import { CreativeType } from '../types';
import { ImageIcon, VideoIcon } from './icons/ActionIcons';

interface CreativeTypeSelectorProps {
  selectedType: CreativeType;
  onSelectType: (type: CreativeType) => void;
}

const types = [
    { id: 'Image', name: 'Imagem', icon: ImageIcon },
    { id: 'Video', name: 'Vídeo', icon: VideoIcon },
] as const;


const CreativeTypeSelector: React.FC<CreativeTypeSelectorProps> = ({ selectedType, onSelectType }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {types.map((type) => {
        const isSelected = selectedType === type.id;
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelectType(type.id)}
            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1 ${
              isSelected
                ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                : 'bg-gray-700/50 border-gray-600 hover:border-purple-400 text-gray-300'
            }`}
          >
            <type.icon className="h-8 w-8 mb-2" />
            <span className="font-semibold text-sm">{type.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CreativeTypeSelector;
