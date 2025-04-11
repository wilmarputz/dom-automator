
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ModuleType, Episode, GeneratedContent } from '@/lib/api';

interface UseAIGeneratorProps {
  onSuccess?: (content: string) => void;
  onError?: (error: string) => void;
}

interface GenerateContentParams {
  episodeId: string;
  moduleType: ModuleType;
  title: string;
  baseScript: string;
}

export const useAIGenerator = (props?: UseAIGeneratorProps) => {
  const { onSuccess, onError } = props || {};
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async ({
    episodeId,
    moduleType,
    title,
    baseScript,
  }: GenerateContentParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { episodeId, moduleType, title, baseScript },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Store the generated content in state
      setContent(data.content);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data.content);
      }

      // Return the content so caller can use it directly
      return data.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar conteúdo';
      setError(errorMessage);
      
      // Show error toast
      toast({
        title: 'Erro na geração de conteúdo',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Call error callback if provided
      if (onError) {
        onError(errorMessage);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateContent,
    isLoading,
    content,
    error,
  };
};
