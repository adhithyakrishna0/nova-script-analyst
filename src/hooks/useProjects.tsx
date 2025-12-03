import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectMember } from '@/types/nova';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export function useProjects() {
  const { user, profile, isManager } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (isManager) {
        // Managers see projects they created
        const { data, error } = await supabase
          .from('nova_projects')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setProjects(data || []);
      } else {
        // Workers see projects they're members of
        const { data, error } = await supabase
          .from('nova_project_members')
          .select('*, nova_projects(*)')
          .eq('user_id', user.id);
        
        if (error) throw error;
        const memberProjects = (data || [])
          .map(d => d.nova_projects)
          .filter((p): p is Project => p !== null);
        setProjects(memberProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, isManager]);

  const createProject = async (name: string, passkey: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('nova_projects')
        .insert([{
          name,
          passkey,
          creator_id: user.id
        }])
        .select()
        .single();
      
      if (projectError) throw projectError;

      // Add creator as project member
      await supabase
        .from('nova_project_members')
        .insert([{
          project_id: project.id,
          user_id: user.id,
          role: profile?.role || 'Owner'
        }]);

      await fetchProjects();
      return { error: null, project };
    } catch (error: any) {
      const message = error.message?.includes('unique') || error.message?.includes('duplicate')
        ? 'A project with this name already exists'
        : error.message;
      return { error: new Error(message) };
    }
  };

  const joinProject = async (name: string, passkey: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    try {
      const { data, error } = await supabase.rpc('join_project_with_passkey', {
        p_project_name: name,
        p_passkey: passkey,
        p_user_id: user.id
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; project?: { id: string; name: string } };
      
      if (!result.success) {
        return { error: new Error(result.error || 'Failed to join project') };
      }

      await fetchProjects();
      return { error: null, project: result.project };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('nova_projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      await fetchProjects();
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    joinProject,
    deleteProject
  };
}
