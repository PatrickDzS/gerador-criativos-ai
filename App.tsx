
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CreativeForm from './components/CreativeForm';
import CreativePreview from './components/CreativePreview';
import { generateCreative } from './services/geminiService';
import { CreativeBrief, CreativeType, GeneratedContent, HistoricalCreative, Platform } from './types';
import History from './components/History';
import { SaveIcon } from './components/icons/ActionIcons';

const App: React.FC = () => {
  const [brief, setBrief] = useState<CreativeBrief | undefined>(undefined);
  const [platform, setPlatform] = useState<Platform>(Platform.Instagram);
  const [creativeType, setCreativeType] = useState<CreativeType>('Image');
  
  const [generatedVariations, setGeneratedVariations] = useState<GeneratedContent[] | null>(null);
  const [selectedCreative, setSelectedCreative] = useState<GeneratedContent | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoricalCreative[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(true);


  useEffect(() => {
    const savedHistory = localStorage.getItem('creativeHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveHistory = (newHistory: HistoricalCreative[]) => {
    setHistory(newHistory);
    localStorage.setItem('creativeHistory', JSON.stringify(newHistory));
  };


  const handleGenerate = async (submittedBrief: CreativeBrief, submittedPlatform: Platform, submittedType: CreativeType) => {
    setIsLoading(true);
    setError(null);
    setGeneratedVariations(null);
    setSelectedCreative(null);
    setBrief(submittedBrief);
    setPlatform(submittedPlatform);
    setCreativeType(submittedType);
    setShowHistory(false);
    
    try {
      const results = await generateCreative(submittedBrief, submittedPlatform, submittedType, setLoadingMessage);
      setGeneratedVariations(results);
      if (results && results.length > 0) {
        setSelectedCreative(results[0]);
      }
    } catch (e: any) {
      setError(e.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
  const handleSaveToHistory = () => {
    if (!selectedCreative || !brief) return;

    const newHistoryItem: HistoricalCreative = {
      id: `creative-${Date.now()}`,
      timestamp: Date.now(),
      brief,
      creative: selectedCreative,
      platform,
      creativeType
    };

    saveHistory([newHistoryItem, ...history]);
    alert('Criativo salvo no histórico!');
  };

  const handleDeleteFromHistory = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item do histórico?')) {
        saveHistory(history.filter(item => item.id !== id));
    }
  };

  const handleLoadFromHistory = (item: HistoricalCreative) => {
    setBrief(item.brief);
    setPlatform(item.platform);
    setCreativeType(item.creativeType);
    setGeneratedVariations([item.creative]);
    setSelectedCreative(item.creative);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleViewFromHistory = (item: HistoricalCreative) => {
    setGeneratedVariations([item.creative]);
    setSelectedCreative(item.creative);
    setPlatform(item.platform);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectVariation = (creative: GeneratedContent) => {
    setSelectedCreative(creative);
  };


  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 lg:p-8 shadow-2xl">
            <CreativeForm 
              onSubmit={handleGenerate} 
              isLoading={isLoading} 
              initialBrief={brief}
              initialPlatform={platform}
              initialType={creativeType}
            />
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 lg:p-8 shadow-2xl sticky top-24">
             <CreativePreview
              creative={selectedCreative}
              variations={generatedVariations}
              onSelectVariation={handleSelectVariation}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              error={error}
              platform={platform}
            />
             {selectedCreative && !isLoading && !error && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleSaveToHistory}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        <SaveIcon className="h-5 w-5 mr-2" />
                        Salvar no Histórico
                    </button>
                </div>
            )}
          </div>
        </div>
        
        <div className="mt-16">
            {!showHistory && (
                <button 
                    onClick={() => setShowHistory(true)}
                    className="mb-6 text-purple-400 hover:text-purple-300 font-semibold"
                >
                    &larr; Voltar para o Histórico
                </button>
            )}
            {showHistory ? (
                <History
                    history={history}
                    onView={handleViewFromHistory}
                    onLoad={handleLoadFromHistory}
                    onDelete={handleDeleteFromHistory}
                />
            ) : null}
        </div>
      </main>
    </div>
  );
};

export default App;
