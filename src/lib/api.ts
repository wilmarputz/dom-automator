
import { supabase } from './supabase';

// Types
export interface Episode {
  id: string;
  title: string;
  base_script: string;
  created_at: Date;
  user_id: string;
}

export interface GeneratedContent {
  id: string;
  episode_id: string;
  module_type: string;
  content: string;
  created_at: Date;
}

export type ModuleType = 'prompt_visual' | 'roteiro_completo' | 'roteiro_cena' | 'roteiro_livro' | 'roteiro_audiobook';

// API Functions
export const fetchEpisodes = async (): Promise<Episode[]> => {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }
};

export const fetchEpisodeById = async (id: string): Promise<Episode | null> => {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching episode ${id}:`, error);
    return null;
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
    console.error(`Error fetching content for episode ${episodeId}:`, error);
    return [];
  }
};

export const createEpisode = async (title: string, base_script: string): Promise<Episode | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-episode', {
      body: { title, base_script },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating episode:', error);
    return null;
  }
};

export const generateContent = async (episodeId: string, moduleType: ModuleType): Promise<GeneratedContent | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: { episode_id: episodeId, module_type: moduleType },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error generating ${moduleType} content:`, error);
    return null;
  }
};

export const updateGeneratedContent = async (contentId: string, newContent: string): Promise<GeneratedContent | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('update-generated-content', {
      body: { content_id: contentId, content: newContent },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating content:', error);
    return null;
  }
};

export const deleteEpisode = async (episodeId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', episodeId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting episode ${episodeId}:`, error);
    return false;
  }
};
