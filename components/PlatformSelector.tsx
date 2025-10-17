
import React from 'react';
import { Platform } from '../types';
import { PLATFORMS } from '../constants';

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onSelectPlatform: (platform: Platform) => void;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ selectedPlatform, onSelectPlatform }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {PLATFORMS.map((platform) => {
        const isSelected = selectedPlatform === platform.id;
        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => onSelectPlatform(platform.id)}
            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1 ${
              isSelected
                ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                : 'bg-gray-700/50 border-gray-600 hover:border-purple-400 text-gray-300'
            }`}
          >
            <platform.icon className="h-8 w-8 mb-2" />
            <span className="font-semibold text-sm">{platform.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PlatformSelector;
