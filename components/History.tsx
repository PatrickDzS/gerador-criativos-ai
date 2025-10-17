import React, { useState } from 'react';
import { type HistoricalCreative } from '../types';
import { TrashIcon, LoadIcon, ViewIcon, VideoIcon } from './icons/ActionIcons';
import { PLATFORMS } from '../constants';

const ITEMS_PER_PAGE = 10; // Itens para mostrar inicialmente e para carregar a cada vez

interface HistoryItemProps {
  item: HistoricalCreative;
  onView: (item: HistoricalCreative) => void;
  onLoad: (item: HistoricalCreative) => void;
  onDelete: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onView, onLoad, onDelete }) => {
  const platformConfig = PLATFORMS.find(p => p.id === item.platform);
  const isVideo = item.creativeType === 'Video';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex flex-col group transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:shadow-purple-900/20">
      <div className="relative aspect-square">
        <img src={item.creative.imageUrl} alt={item.creative.headline} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
          <h4 className="text-white font-bold text-lg drop-shadow-md">{item.creative.headline}</h4>
        </div>
        {platformConfig && (
            <div className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
                <platformConfig.icon className="w-5 h-5 text-white" />
            </div>
        )}
        {isVideo && (
             <div className="absolute top-3 left-3 bg-black/50 rounded-full p-2 backdrop-blur-sm">
                <VideoIcon className="w-5 h-5 text-white" />
            </div>
        )}
      </div>
      <div className="p-4 bg-gray-800/50 flex-grow flex flex-col">
        <p className="text-gray-400 text-sm mb-4 flex-grow line-clamp-2">{item.creative.body}</p>
        <div className="flex justify-between items-center space-x-2 mt-auto pt-2">
           <button onClick={() => onView(item)} title="Visualizar" className="flex items-center justify-center p-2 rounded-md bg-gray-700 hover:bg-purple-600 text-gray-300 hover:text-white transition-colors duration-200">
             <ViewIcon className="w-5 h-5"/>
           </button>
           <button onClick={() => onLoad(item)} title="Carregar no Editor" className="flex items-center justify-center p-2 rounded-md bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white transition-colors duration-200">
            <LoadIcon className="w-5 h-5" />
           </button>
           <button onClick={() => onDelete(item.id)} title="Excluir" className="flex items-center justify-center p-2 rounded-md bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white transition-colors duration-200">
             <TrashIcon className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
};


interface HistoryProps {
  history: HistoricalCreative[];
  onView: (item: HistoricalCreative) => void;
  onLoad: (item: HistoricalCreative) => void;
  onDelete: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ history, onView, onLoad, onDelete }) => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };
  
  const visibleHistory = history.slice(0, visibleCount);

  if (history.length === 0) {
    return (
      <div className="text-center bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg p-12">
        <h3 className="text-xl font-bold text-white">Histórico de Criativos</h3>
        <p className="text-gray-400 mt-2">Seus criativos gerados e salvos aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Histórico de Criativos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {visibleHistory.map(item => (
          <HistoryItem
            key={item.id}
            item={item}
            onView={onView}
            onLoad={onLoad}
            onDelete={onDelete}
          />
        ))}
      </div>
      {visibleCount < history.length && (
        <div className="text-center mt-12">
            <button
                onClick={handleLoadMore}
                className="bg-gray-700 hover:bg-gray-600 text-purple-300 font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
            >
                Carregar Mais
            </button>
        </div>
      )}
    </div>
  );
};

export default History;