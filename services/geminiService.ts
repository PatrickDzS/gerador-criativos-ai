import { GoogleGenAI, Type, Modality } from '@google/genai';
import { CreativeBrief, CreativeType, GeneratedContent, Platform } from '../types';
import { PLATFORMS } from '../constants';

// According to guidelines, initialize AI with API Key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VARIATION_COUNT = 3;

const generateCreativeText = async (brief: CreativeBrief): Promise<{ headline: string, body: string }> => {
  const prompt = `Gere um texto criativo para um anúncio com base nas seguintes informações:
- Produto/Serviço: ${brief.product}
- Descrição: ${brief.description}
- Público-alvo: ${brief.audience}
- Vibe/Tom: ${brief.vibe}

O resultado deve ser um JSON com duas chaves: "headline" (um título curto e impactante, máximo de 5 palavras) e "body" (um texto de apoio curto, máximo de 15 palavras).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: {
              type: Type.STRING,
              description: 'Título curto e impactante para o anúncio (máximo 5 palavras).',
            },
            body: {
              type: Type.STRING,
              description: 'Texto de apoio para o anúncio (máximo 15 palavras).',
            },
          },
          required: ['headline', 'body'],
        },
      },
    });

    const text = response.text.trim();
    const parsed = JSON.parse(text);
    if (parsed.headline && parsed.body) {
      return parsed;
    }
    throw new Error('Resposta da IA em formato inválido.');
  } catch (error) {
    console.error('Erro ao gerar texto criativo:', error);
    throw new Error('Não foi possível gerar o texto para o criativo.');
  }
};

const generateCreativeImages = async (text: { headline: string, body: string }, platform: Platform, brief: CreativeBrief, count: number): Promise<string[]> => {
    const platformConfig = PLATFORMS.find(p => p.id === platform);
    const aspectRatio = platformConfig?.aspectRatio || '1:1';

    const storiesOptimizationPrompt = brief.optimizeForStories
        ? "\n\nOtimização para Stories/Reels: A composição deve ser otimizada para uma tela de celular vertical. Deixe um espaço seguro (safe zone) de aproximadamente 15% na parte superior e 20% na parte inferior da imagem, evitando colocar elementos importantes nessas áreas para não serem cobertos pela interface do aplicativo. O foco principal deve estar no centro."
        : "";
    
    try {
        if (brief.baseImage) {
            // Image-to-image transformation with multiple calls
            const imagePrompt = `Transforme a imagem fornecida em um anúncio de alta conversão para "${brief.product}".
- Tema do anúncio: "${text.headline}: ${text.body}".
- Mantenha o produto da imagem original como o foco principal.
- Aplique um estilo visualmente impactante, fotorealista e cinematográfico, adequado para mídias sociais.
- Ajuste a composição, iluminação e o fundo para criar uma cena profissional e atraente.
- A proporção da imagem final deve ser ${aspectRatio}.
- Siga estas instruções adicionais para a transformação: ${brief.imageInstructions || 'Seja criativo para obter o melhor resultado.'}` + storiesOptimizationPrompt;
            
            const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [{
                inlineData: {
                    mimeType: brief.baseImage.match(/:(.*?);/)?.[1] || 'image/jpeg',
                    data: brief.baseImage.split(',')[1],
                },
            }, { text: imagePrompt }];

            const promises = Array.from({ length: count }).map(() => ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: { responseModalities: [Modality.IMAGE] },
            }));

            const responses = await Promise.all(promises);
            const imageUrls = responses.map(response => {
                for (const part of response.candidates?.[0]?.content?.parts || []) {
                    if (part.inlineData) {
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
                return null;
            }).filter((url): url is string => url !== null);
            if(imageUrls.length === 0) throw new Error('Nenhuma imagem foi gerada.');
            return imageUrls;

        } else {
            // Text-to-image generation using Imagen for better quality
            let imagePrompt = `Crie uma imagem de alta qualidade, vibrante e atraente para um anúncio com o tema "${text.headline}: ${text.body}". A imagem deve ser visualmente impactante e adequada para mídias sociais. Estilo: fotorealista, cinematográfico. A proporção da imagem deve ser ${aspectRatio}.`;
            if (brief.imageInstructions) {
                imagePrompt += `\n\nInstruções Adicionais: Siga estas instruções estritamente: ${brief.imageInstructions}`;
            }
            imagePrompt += storiesOptimizationPrompt;

            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: imagePrompt,
                config: {
                  numberOfImages: count,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: aspectRatio,
                },
            });
            return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        }

    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        throw new Error('Não foi possível gerar a imagem para o criativo.');
    }
};

const generateCreativeVideos = async (text: { headline: string, body: string }, brief: CreativeBrief, platform: Platform, count: number): Promise<string[]> => {
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        await window.aistudio.openSelectKey();
    }
    const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const platformConfig = PLATFORMS.find(p => p.id === platform);
    const videoPrompt = `Crie um vídeo curto e dinâmico para um anúncio sobre "${brief.product}". Título: "${text.headline}". Mensagem: "${text.body}". A vibe deve ser ${brief.vibe}. O vídeo deve ser visualmente cativante e otimizado para mídias sociais.`;
    
    try {
        const imagePayload = brief.baseImage ? {
            imageBytes: brief.baseImage.split(',')[1],
            mimeType: brief.baseImage.match(/:(.*?);/)?.[1] || 'image/jpeg',
        } : undefined;

        let operation = await videoAI.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: videoPrompt,
            image: imagePayload,
            config: {
                numberOfVideos: count,
                resolution: '720p',
                aspectRatio: platformConfig?.aspectRatio || '9:16',
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await videoAI.operations.getVideosOperation({ operation: operation });
        }

        const generatedVideos = operation.response?.generatedVideos;
        if (!generatedVideos || generatedVideos.length === 0) {
            throw new Error('Nenhum vídeo foi gerado.');
        }

        const videoUrlPromises = generatedVideos.map(async (videoData) => {
            const downloadLink = videoData.video?.uri;
            if (!downloadLink) return null;

            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) {
                 if(videoResponse.status === 404) throw new Error('Requested entity was not found.');
                 console.error(`Falha ao baixar o vídeo: ${videoResponse.statusText}`);
                 return null;
            }
            const videoBlob = await videoResponse.blob();
            return URL.createObjectURL(videoBlob);
        });

        const videoUrls = (await Promise.all(videoUrlPromises)).filter((url): url is string => url !== null);
        if (videoUrls.length === 0) throw new Error('Falha ao processar os vídeos gerados.');
        return videoUrls;

    } catch (error) {
        console.error('Erro ao gerar vídeo:', error);
        if (error instanceof Error && error.message.includes('Requested entity was not found.')) {
            throw new Error('Chave de API inválida ou não encontrada. Por favor, selecione uma chave de API válida para continuar.');
        }
        throw new Error('Não foi possível gerar o vídeo para o criativo.');
    }
};


export const generateCreative = async (
  brief: CreativeBrief,
  platform: Platform,
  type: CreativeType,
  setLoadingMessage: (message: string) => void
): Promise<GeneratedContent[]> => {
  try {
    setLoadingMessage('Gerando textos criativos...');
    const textContent = await generateCreativeText(brief);

    if (type === 'Image') {
      setLoadingMessage(`Criando ${VARIATION_COUNT} variações de imagem...`);
      const imageUrls = await generateCreativeImages(textContent, platform, brief, VARIATION_COUNT);
      return imageUrls.map(url => ({
        type: 'Image',
        headline: textContent.headline,
        body: textContent.body,
        imageUrl: url,
      }));
    } else if (type === 'Video') {
      setLoadingMessage(`Criando ${VARIATION_COUNT} variações de vídeo... Isso pode levar alguns minutos.`);
      const videoUrls = await generateCreativeVideos(textContent, brief, platform, VARIATION_COUNT);

      setLoadingMessage('Gerando miniatura para os vídeos...');
      const thumbnailUrls = brief.baseImage 
        ? [brief.baseImage] 
        : await generateCreativeImages(textContent, platform, brief, 1);
      
      const thumbnailUrl = thumbnailUrls[0];

      return videoUrls.map(url => ({
        type: 'Video',
        headline: textContent.headline,
        body: textContent.body,
        videoUrl: url,
        imageUrl: thumbnailUrl,
      }));
    } else {
        throw new Error('Tipo de criativo não suportado');
    }
  } catch (error) {
    console.error("Falha na geração do criativo:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error('Ocorreu um erro desconhecido ao gerar o criativo.');
  }
};