
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

// Mock data for development
const mockEpisodes: Episode[] = [
  {
    id: 'mock-episode-1',
    title: 'Dom e a Aventura na Floresta',
    base_script: 'Dom encontra seus amigos na floresta para uma aventura mágica...',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    user_id: 'mock-user-id'
  },
  {
    id: 'mock-episode-2',
    title: 'Dom e o Mistério do Lago',
    base_script: 'Dom e seus amigos descobrem um lago misterioso brilhante...',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    user_id: 'mock-user-id'
  }
];

const mockContent: { [key: string]: GeneratedContent[] } = {
  'mock-episode-1': [
    {
      id: 'mock-content-1',
      episode_id: 'mock-episode-1',
      module_type: 'prompt_visual',
      content: 'Cena 1: Dom caminhando pela floresta iluminada pelo sol.\nCena 2: Dom encontrando seus amigos numa clareira...',
      created_at: new Date()
    },
    {
      id: 'mock-content-2',
      episode_id: 'mock-episode-1',
      module_type: 'roteiro_completo',
      content: 'CENA 1 - FLORESTA - DIA\n\nDOM caminha pela floresta ensolarada...',
      created_at: new Date()
    }
  ],
  'mock-episode-2': []
};

// Check if we're in development mode without Supabase
const isDevelopment = import.meta.env.DEV;
const useDummyData = isDevelopment && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY);

// API Functions
export const fetchEpisodes = async (): Promise<Episode[]> => {
  // Return mock data if in development mode
  if (useDummyData) {
    return [...mockEpisodes];
  }

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
  // Return mock data if in development mode
  if (useDummyData) {
    const episode = mockEpisodes.find(ep => ep.id === id);
    return episode ? { ...episode } : null;
  }

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
  // Return mock data if in development mode
  if (useDummyData) {
    return mockContent[episodeId] ? [...mockContent[episodeId]] : [];
  }

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
  // Create mock episode if in development mode
  if (useDummyData) {
    const newEpisode: Episode = {
      id: `mock-episode-${mockEpisodes.length + 1}`,
      title,
      base_script,
      created_at: new Date(),
      user_id: 'mock-user-id'
    };
    mockEpisodes.push(newEpisode);
    mockContent[newEpisode.id] = [];
    return { ...newEpisode };
  }

  try {
    // For now, we'll create it directly via the client 
    // instead of calling a Supabase function
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('episodes')
      .insert({
        title,
        base_script,
        user_id: user.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating episode:', error);
    return null;
  }
};

export const generateContent = async (episodeId: string, moduleType: ModuleType): Promise<GeneratedContent | null> => {
  // Create mock content if in development mode
  if (useDummyData) {
    const newContent: GeneratedContent = {
      id: `mock-content-${Date.now()}`,
      episode_id: episodeId,
      module_type: moduleType,
      content: `Conteúdo gerado para o módulo ${moduleType} do episódio ${episodeId}. Este é um conteúdo de demonstração.`,
      created_at: new Date()
    };
    
    if (!mockContent[episodeId]) {
      mockContent[episodeId] = [];
    }
    
    // Replace existing content of the same type or add new
    const existingIndex = mockContent[episodeId].findIndex(c => c.module_type === moduleType);
    if (existingIndex >= 0) {
      mockContent[episodeId][existingIndex] = newContent;
    } else {
      mockContent[episodeId].push(newContent);
    }
    
    return { ...newContent };
  }

  try {
    // For now, we'll create it directly via the client
    // LLM integration will be done later
    const placeholderContent = `Conteúdo placeholder para o módulo ${moduleType}. A integração com LLM será implementada posteriormente.`;
    
    const { data, error } = await supabase
      .from('generated_content')
      .upsert({
        episode_id: episodeId,
        module_type: moduleType,
        content: placeholderContent
      }, { 
        onConflict: 'episode_id,module_type' 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error generating ${moduleType} content:`, error);
    return null;
  }
};

export const updateGeneratedContent = async (contentId: string, newContent: string): Promise<GeneratedContent | null> => {
  // Update mock content if in development mode
  if (useDummyData) {
    // Find and update the content
    for (const episodeId in mockContent) {
      const contentIndex = mockContent[episodeId].findIndex(c => c.id === contentId);
      if (contentIndex >= 0) {
        mockContent[episodeId][contentIndex].content = newContent;
        return { ...mockContent[episodeId][contentIndex] };
      }
    }
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('generated_content')
      .update({ content: newContent })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating content:', error);
    return null;
  }
};

export const deleteEpisode = async (episodeId: string): Promise<boolean> => {
  // Delete mock episode if in development mode
  if (useDummyData) {
    const episodeIndex = mockEpisodes.findIndex(ep => ep.id === episodeId);
    if (episodeIndex >= 0) {
      mockEpisodes.splice(episodeIndex, 1);
      delete mockContent[episodeId];
      return true;
    }
    return false;
  }

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
