import React, { useState } from 'react';
import PlatformSelector from './PlatformSelector';
import { CreativeBrief, CreativeType, Platform } from '../types';
import CreativeTypeSelector from './CreativeTypeSelector';
import ImageUploader from './ImageUploader';
import { PLATFORMS } from '../constants';

interface CreativeFormProps {
  onSubmit: (brief: CreativeBrief, platform: Platform, type: CreativeType) => void;
  isLoading: boolean;
  initialBrief?: CreativeBrief;
  initialPlatform?: Platform;
  initialType?: CreativeType;
}

const CreativeForm: React.FC<CreativeFormProps> = ({ onSubmit, isLoading, initialBrief, initialPlatform, initialType }) => {
  const [brief, setBrief] = useState<CreativeBrief>(initialBrief || {
    product: '',
    description: '',
    audience: '',
    vibe: '',
    baseImage: undefined,
    imageInstructions: '',
    optimizeForStories: false,
  });
  const [platform, setPlatform] = useState<Platform>(initialPlatform || Platform.Instagram);
  const [type, setType] = useState<CreativeType>(initialType || 'Image');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBrief(prev => ({ ...prev, [name]: value }));
  };
  
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setBrief(prev => ({ ...prev, [name]: checked }));
  }

  const handleImageUpload = (base64Image: string) => {
    setBrief(prev => ({ ...prev, baseImage: base64Image }));
  };
  
  const handleImageRemove = () => {
    setBrief(prev => ({ ...prev, baseImage: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(brief, platform, type);
  };

  const isFormInvalid = !brief.product || !brief.description || !brief.audience || !brief.vibe;
  const platformConfig = PLATFORMS.find(p => p.id === platform);
  const showStoriesOptimization = platformConfig?.aspectRatio === '9:16' && type === 'Image';


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Criativo</label>
        <CreativeTypeSelector selectedType={type} onSelectType={setType} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Plataforma</label>
        <PlatformSelector selectedPlatform={platform} onSelectPlatform={setPlatform} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-300 mb-2">Produto/Serviço</label>
          <input
            type="text"
            id="product"
            name="product"
            value={brief.product}
            onChange={handleChange}
            placeholder="Ex: Tênis de corrida ecológico"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>
        <div>
          <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-2">Público-alvo</label>
          <input
            type="text"
            id="audience"
            name="audience"
            value={brief.audience}
            onChange={handleChange}
            placeholder="Ex: Jovens adultos preocupados com sustentabilidade"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Descrição Breve</label>
        <textarea
          id="description"
          name="description"
          value={brief.description}
          onChange={handleChange}
          rows={3}
          placeholder="Descreva os principais benefícios e diferenciais do seu produto."
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
          required
        />
      </div>
      <div>
        <label htmlFor="vibe" className="block text-sm font-medium text-gray-300 mb-2">Vibe / Tom de Voz</label>
        <input
            type="text"
            id="vibe"
            name="vibe"
            value={brief.vibe}
            onChange={handleChange}
            placeholder="Ex: Energético, inspirador, moderno, divertido"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
            required
          />
      </div>

      {type === 'Image' && (
        <div>
          <label htmlFor="imageInstructions" className="block text-sm font-medium text-gray-300 mb-2">Instruções para a Imagem (Opcional)</label>
          <textarea
            id="imageInstructions"
            name="imageInstructions"
            value={brief.imageInstructions}
            onChange={handleChange}
            rows={2}
            placeholder="Ex: Fundo de madeira, iluminação de pôr do sol, adicionar um cachorro"
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      )}

      {showStoriesOptimization && (
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 flex items-center justify-between">
              <div>
                  <h4 className="font-semibold text-white">Otimizar para Stories/Reels</h4>
                  <p className="text-xs text-gray-400">Deixa espaço para legendas e botões da interface.</p>
              </div>
              <label htmlFor="optimizeForStories" className="relative inline-flex items-center cursor-pointer">
                  <input
                      type="checkbox"
                      id="optimizeForStories"
                      name="optimizeForStories"
                      checked={brief.optimizeForStories}
                      onChange={handleToggleChange}
                      className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
          </div>
      )}
      
      {(type === 'Image' || type === 'Video') && (
        <ImageUploader 
            onImageUpload={handleImageUpload} 
            onImageRemove={handleImageRemove}
            initialImage={brief.baseImage}
            platform={platform}
        />
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading || isFormInvalid}
          className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? 'Gerando...' : 'Gerar Criativo com IA'}
        </button>
      </div>
    </form>
  );
};

export default CreativeForm;
