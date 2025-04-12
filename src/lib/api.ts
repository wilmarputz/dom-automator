// src/lib/api.ts
import { supabase } from '@/integrations/supabase/client';

// --- Tipos ---
// Interface base para Episódio (como vem da tabela 'episodes')
export interface EpisodeDB {
  id: string;
  title: string;
  base_script: string | null;
  description: string | null;
  cover_image: string | null;
  is_public: boolean | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Interface estendida que inclui a contagem de módulos (retornada pela nova Edge Function)
export interface EpisodeWithCount extends EpisodeDB {
  moduleCount: number;
}

// Interface para Conteúdo Gerado
export interface GeneratedContent {
  id: string;
  episode_id: string;
  module_type: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos de Módulo
export type ModuleType = 'prompt_visual' | 'roteiro_completo' | 'roteiro_cena' | 'roteiro_livro' | 'roteiro_audiobook';

// Helper para obter user ID (Usado internamente)
const getCurrentUserId = async (): Promise<string> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user?.id) {
      console.error("Error getting session or user ID:", error);
      throw new Error('Usuário não autenticado ou sessão inválida.');
  }
  return session.user.id;
}

// --- Funções API ---

/**
 * @deprecated Use fetchEpisodesWithDetails para obter a contagem de módulos.
 * Busca apenas os dados básicos dos episódios do usuário.
 */
export const fetchEpisodes = async (): Promise<EpisodeDB[]> => {
  console.warn("fetchEpisodes is deprecated, use fetchEpisodesWithDetails for module count.");
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar episódios (base):', error);
    throw error; // Lança o erro para a UI tratar
  }
};

/**
 * Busca os episódios do usuário logado incluindo a contagem de módulos gerados.
 * Chama a Edge Function 'get-episodes-with-details'.
 */
export const fetchEpisodesWithDetails = async (): Promise<EpisodeWithCount[]> => {
  console.log("Frontend API: Calling get-episodes-with-details function...");
  try {
    const { data, error: invokeError } = await supabase.functions.invoke('get-episodes-with-details');

    if (invokeError) {
      console.error('Erro ao invocar a Edge Function get-episodes-with-details:', invokeError);
      throw new Error(`Erro de comunicação com o servidor: ${invokeError.message}`);
    }
    // Verifica erros de lógica retornados pela própria função
    if (data.error) {
      console.error('Erro retornado pela Edge Function get-episodes-with-details:', data.error);
      throw new Error(`Erro ao buscar detalhes dos episódios: ${data.error}`);
    }

    // Verifica se data é um array (pode ser null ou outro tipo em caso de erro inesperado)
     if (!Array.isArray(data)) {
       console.error('Resposta inesperada da Edge Function (não é array):', data);
       throw new Error('Resposta inválida do servidor ao buscar episódios.');
     }

    console.log(`Frontend API: Received ${data.length} episodes with details.`);
    // Faz o type cast para garantir que o tipo retornado está correto
    return data as EpisodeWithCount[];

  } catch (error) {
    console.error('Erro geral ao buscar episódios com detalhes:', error);
    // Garante que um Error é lançado
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error('Ocorreu um erro desconhecido ao buscar episódios.');
    }
  }
};


export const fetchEpisodeById = async (id: string): Promise<EpisodeDB | null> => {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Erro ao buscar episódio ${id}:`, error);
    return null; // Retorna null em caso de erro
  }
};

export const fetchEpisodeContent = async (episodeId: string): Promise<GeneratedContent[]> => {
  try {
    const { data, error } = await supabase
      .from('generated_content')
      .select('*')
      .eq('episode_id', episodeId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar conteúdo para o episódio ${episodeId}:`, error);
    return [];
  }
};

export const createEpisode = async (
  title: string,
  base_script: string,
  description?: string
): Promise<EpisodeDB | null> => { // Retorna EpisodeDB pois não tem moduleCount ao criar
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('episodes')
      .insert({
        title,
        base_script,
        description: description || null,
        user_id: userId,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Erro na criação do episódio (DB):', error);
      throw new Error(`Falha ao criar episódio: ${error.message}`);
    }
    return data;
  } catch (error) {
    console.error('Erro geral ao criar episódio:', error);
    throw error;
  }
};

// Função para chamar a GERAÇÃO de conteúdo via Edge Function
export const generateModuleContent = async (
  episodeId: string,
  moduleType: ModuleType
): Promise<GeneratedContent> => { // Retorna o conteúdo salvo como vem do backend
  console.log(`Frontend API: Requesting generation for episode ${episodeId}, module ${moduleType}`);
  try {
    const { data, error: invokeError } = await supabase.functions.invoke('generate-content', {
      body: { episode_id: episodeId, module_type: moduleType },
    });

    if (invokeError) {
      console.error('Erro ao invocar a Edge Function generate-content:', invokeError);
      throw new Error(`Erro de comunicação com o servidor: ${invokeError.message}`);
    }
    if (data.error) {
      console.error('Erro retornado pela Edge Function generate-content:', data.error);
      throw new Error(`Erro na geração (${moduleType}): ${data.error}`);
    }
    if (!data || typeof data.content !== 'string') { // Verifica se 'content' existe e é string
      console.error('Resposta inesperada da Edge Function (generate-content):', data);
      throw new Error('Resposta inválida do servidor de geração.');
    }

    console.log(`Frontend API: Received generated content for module ${moduleType}, id: ${data.id}`);
    return data as GeneratedContent;

  } catch (error) {
    console.error(`Erro geral ao gerar conteúdo para ${moduleType}:`, error);
    if (error instanceof Error) { throw error; }
    else { throw new Error('Ocorreu um erro desconhecido durante a geração.'); }
  }
};

// Função para ATUALIZAR conteúdo editado manualmente
export const updateGeneratedContent = async (
  contentId: string,
  newContent: string
): Promise<GeneratedContent | null> => {
  try {
    const { data, error } = await supabase
      .from('generated_content')
      .update({
          content: newContent,
          updated_at: new Date().toISOString()
        })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar conteúdo gerado:', error);
    throw error; // Lança o erro para a UI tratar
  }
};

// Função para DELETAR episódio
export const deleteEpisode = async (episodeId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', episodeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Erro ao deletar episódio ${episodeId}:`, error);
    return false;
  }
};

// MANTÉM: Outras funções (export, share, templates, checkOpenAIConfig) como estavam
export const exportContent = async ( /* ... */ ): Promise<any> => { /* ... implementação placeholder ... */ };
export const shareEpisode = async ( /* ... */ ): Promise<any> => { /* ... implementação placeholder ... */ };
export const createTemplate = async ( /* ... */ ): Promise<any> => { /* ... implementação placeholder ... */ };
export const fetchTemplates = async ( /* ... */ ): Promise<any[]> => { /* ... implementação placeholder ... */ };
export const checkOpenAIConfig = async (): Promise<{configured: boolean, valid: boolean, error?: string}> => {
  try {
    const { data, error } = await supabase.functions.invoke('check-openai-config');
    if (error) throw error;
    return {
        configured: data.configured ?? false,
        valid: data.valid ?? false,
        error: data.error
    };
  } catch (error) {
    console.error('Erro ao invocar check-openai-config:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return { configured: false, valid: false, error: message };
  }
};