import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Scene } from '@/types/nova';
import { toast } from '@/hooks/use-toast';

export function useScenes(projectId: string | null) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchScenes = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nova_scenes')
        .select('*')
        .eq('project_id', projectId)
        .order('scene_number');
      
      if (error) throw error;
      setScenes(data || []);
    } catch (error) {
      console.error('Error fetching scenes:', error);
      toast({
        title: "Error",
        description: "Failed to load scenes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const analyzeScript = async (scriptText: string, pdfBase64?: string) => {
    if (!projectId) return { error: new Error('No project selected') };
    
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-script', {
        body: pdfBase64 ? { pdfBase64 } : { scriptText }
      });

      if (error) throw error;
      if (!data?.scenes) throw new Error('No scenes returned from analysis');

      // Delete existing scenes
      await supabase
        .from('nova_scenes')
        .delete()
        .eq('project_id', projectId);

      // Insert new scenes
      for (const scene of data.scenes) {
        await supabase
          .from('nova_scenes')
          .insert([{
            project_id: projectId,
            scene_number: scene.scene_number,
            heading: scene.heading || `Scene ${scene.scene_number}`,
            location_type: scene.location_type || 'INT',
            specific_location: scene.specific_location || '',
            time_of_day: scene.time_of_day || 'DAY',
            characters_present: scene.characters_present || '',
            speaking_roles: scene.speaking_roles || '',
            extras: scene.extras || '',
            functional_props: scene.functional_props || '',
            decorative_props: scene.decorative_props || '',
            camera_movement: scene.camera_movement || '',
            framing: scene.framing || '',
            lighting: scene.lighting || '',
            lighting_mood: scene.lighting_mood || '',
            diegetic_sounds: scene.diegetic_sounds || '',
            scene_mood: scene.scene_mood || '',
            emotional_arc: scene.emotional_arc || '',
            primary_action: scene.primary_action || '',
            pacing: scene.pacing || '',
            shoot_type: scene.shoot_type || '',
            content: scene.content || ''
          }]);
      }

      await fetchScenes();
      return { error: null, count: data.scenes.length };
    } catch (error: any) {
      console.error('Script analysis error:', error);
      return { error: new Error(error.message || 'Failed to analyze script') };
    } finally {
      setAnalyzing(false);
    }
  };

  const updateScene = async (sceneId: string, updates: Partial<Scene>) => {
    try {
      const { error } = await supabase
        .from('nova_scenes')
        .update(updates)
        .eq('id', sceneId);
      
      if (error) throw error;
      
      // Update local state
      setScenes(prev => prev.map(s => 
        s.id === sceneId ? { ...s, ...updates } : s
      ));
      
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  const deleteScene = async (sceneId: string) => {
    try {
      // Delete related budget entries first
      await supabase
        .from('nova_budget_tracking')
        .delete()
        .eq('scene_id', sceneId);

      // Delete related schedule entries
      await supabase
        .from('nova_day_scenes')
        .delete()
        .eq('scene_id', sceneId);

      // Delete the scene
      const { error } = await supabase
        .from('nova_scenes')
        .delete()
        .eq('id', sceneId);
      
      if (error) throw error;
      
      setScenes(prev => prev.filter(s => s.id !== sceneId));
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  return {
    scenes,
    loading,
    analyzing,
    fetchScenes,
    analyzeScript,
    updateScene,
    deleteScene
  };
}
