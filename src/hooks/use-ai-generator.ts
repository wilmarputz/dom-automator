import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ModuleType, GeneratedContent } from '@/lib/api'; // Importa GeneratedContent se api.ts o exportar

interface UseAIGeneratorProps {
  // Retorna o objeto GeneratedContent completo que vem do backend
  onSuccess?: (result: GeneratedContent) => void;
  onError?: (error: string) => void;
}

interface GenerateContentParams {
  episodeId: string;
  moduleType: ModuleType;
  // title e baseScript não são mais necessários aqui, pois o backend os busca
}

export const useAIGenerator = (props?: UseAIGeneratorProps) => {
  const { onSuccess, onError } = props || {};
  const [isLoading, setIsLoading] = useState(false);
  // O estado agora pode guardar o objeto GeneratedContent completo
  const [generatedData, setGeneratedData] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async ({ episodeId, moduleType }: GenerateContentParams): Promise<GeneratedContent | null> => { // Ajustado params e tipo de retorno
    setIsLoading(true);
    setError(null);
    setGeneratedData(null); // Limpa dados anteriores

    console.log(`HOOK: Iniciando generateContent para episodeId: ${episodeId}, moduleType: ${moduleType}`);

    try {
      // Prepara o corpo com snake_case e apenas os dados necessários
      const bodyPayload = {
          episode_id: episodeId,
          module_type: moduleType
      };
      console.log('HOOK: Enviando body para Edge Function:', bodyPayload);

      // Chama a Edge Function
      const { data, error: invokeError } = await supabase.functions.invoke('generate-content', {
          body: bodyPayload,
      });

      // Trata erros da invocação
      if (invokeError) {
        console.error('HOOK: Erro ao invocar Edge Function:', invokeError);
        throw new Error(invokeError.message); // Lança erro para o catch
      }
      // Trata erros retornados pela lógica da função
      if (data.error) {
        console.error('HOOK: Erro retornado pela lógica da Edge Function:', data.error);
        throw new Error(data.error); // Lança erro para o catch
      }
      // Verifica se recebeu os dados esperados (incluindo 'content')
       if (!data || typeof data.content !== 'string') {
         console.error('HOOK: Resposta inesperada da Edge Function:', data);
         throw new Error('Resposta inválida do servidor de geração.');
       }

      console.log('HOOK: Geração bem-sucedida. Dados recebidos:', data);
      // Guarda o objeto GeneratedContent completo no estado
      setGeneratedData(data as GeneratedContent);

      // Chama callback de sucesso com o objeto completo
      if (onSuccess) {
        onSuccess(data as GeneratedContent);
      }

      // Retorna o objeto completo
      return data as GeneratedContent;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao gerar conteúdo';
      console.error('HOOK: Catch geral - Erro na geração:', errorMessage);
      setError(errorMessage);

      // Mostra notificação de erro
      toast({
        title: 'Erro na Geração de Conteúdo',
        description: errorMessage,
        variant: 'destructive',
      });

      // Chama callback de erro
      if (onError) {
        onError(errorMessage);
      }

      return null; // Retorna null em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateContent,
    isLoading,
    // Renomeado para clareza, agora contém o objeto todo
    generatedData,
    // Mantém 'content' para retrocompatibilidade ou acesso direto se necessário (opcional)
    content: generatedData?.content || null,
    error,
  };
};