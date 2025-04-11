
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Types
export interface Episode {
  id: string;
  title: string;
  base_script: string | null;
  description: string | null;
  cover_image: string | null;
  is_public: boolean | null;
  status: string | null;
  created_at: string; // Changed from Date to string to match Supabase's return type
  updated_at: string; // Changed from Date to string to match Supabase's return type
  user_id: string;
}

export interface GeneratedContent {
  id: string;
  episode_id: string;
  module_type: string;
  content: string | null;
  created_at: string; // Changed from Date to string to match Supabase's return type
  updated_at: string; // Changed from Date to string to match Supabase's return type
}

export type ModuleType = 'prompt_visual' | 'roteiro_completo' | 'roteiro_cena' | 'roteiro_livro' | 'roteiro_audiobook';

// Helper function to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id || null;
}

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

export const createEpisode = async (
  title: string, 
  base_script: string,
  description?: string
): Promise<Episode | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('episodes')
      .insert({
        title,
        base_script,
        description,
        user_id: userId
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

export const generateContent = async (
  episodeId: string, 
  moduleType: ModuleType, 
  content?: string
): Promise<GeneratedContent | null> => {
  try {
    // For initial implementation, we'll just store the content directly
    // Later, we could connect to an AI service for generation
    const { data, error } = await supabase
      .from('generated_content')
      .upsert({
        episode_id: episodeId,
        module_type: moduleType,
        content: content || `Conteúdo placeholder para o módulo ${moduleType}.`
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

export const updateGeneratedContent = async (
  contentId: string, 
  newContent: string
): Promise<GeneratedContent | null> => {
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

export const exportContent = async (
  episodeId: string, 
  format: 'pdf' | 'docx' | 'txt' | 'html'
): Promise<{ url: string | null } | null> => {
  try {
    // For now, this is just a placeholder. In a production app, you would:
    // 1. Call an edge function to generate the export
    // 2. Store the file in Supabase Storage
    // 3. Return the URL to the file
    
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('exports')
      .insert({
        episode_id: episodeId,
        format,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // In a real implementation, this would be the URL to the exported file
    return { url: data?.url || null };
  } catch (error) {
    console.error(`Error exporting content in ${format} format:`, error);
    return null;
  }
};

export const shareEpisode = async (
  episodeId: string, 
  userEmail: string, 
  permissionLevel: 'viewer' | 'editor' | 'admin'
): Promise<boolean> => {
  try {
    // In a real implementation:
    // 1. Look up the user by email
    // 2. Create a collaborator record
    // 3. Optionally send an email notification
    
    // For now, we'll just return a placeholder response
    console.log(`Sharing episode ${episodeId} with ${userEmail} as ${permissionLevel}`);
    return true;
  } catch (error) {
    console.error(`Error sharing episode ${episodeId}:`, error);
    return false;
  }
};

export const createTemplate = async (
  name: string, 
  base_script: string,
  description?: string
): Promise<any | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('templates')
      .insert({
        name,
        base_script,
        description,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating template:', error);
    return null;
  }
};

export const fetchTemplates = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};
