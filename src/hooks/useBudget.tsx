import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BudgetEntry, ROLE_TO_DEPARTMENT } from '@/types/nova';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export function useBudget(projectId: string | null) {
  const { user, profile } = useAuth();
  const [budgets, setBudgets] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const userDepartment = profile?.role ? ROLE_TO_DEPARTMENT[profile.role] : null;

  const fetchBudgets = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nova_budget_tracking')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "Error",
        description: "Failed to load budget data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const saveBudgetEstimate = async (sceneId: string, estimatedCost: number) => {
    if (!projectId || !user || !userDepartment) {
      return { error: new Error('Missing required data') };
    }

    try {
      // Use upsert to prevent duplicates - the unique constraint handles this
      const { data, error } = await supabase
        .from('nova_budget_tracking')
        .upsert({
          project_id: projectId,
          scene_id: sceneId,
          department: userDepartment,
          estimated_cost: estimatedCost,
          actual_cost: 0,
          submitted_by: user.id,
          is_finalized: false
        }, {
          onConflict: 'scene_id,department,submitted_by'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchBudgets();
      return { error: null, data };
    } catch (error: any) {
      console.error('Error saving budget estimate:', error);
      return { error: new Error(error.message) };
    }
  };

  const saveActualCost = async (
    sceneId: string, 
    actualCost: number, 
    proofReason?: string, 
    proofUrl?: string
  ) => {
    if (!projectId || !user || !userDepartment) {
      return { error: new Error('Missing required data') };
    }

    try {
      // Get existing estimate
      const { data: existing } = await supabase
        .from('nova_budget_tracking')
        .select('*')
        .eq('scene_id', sceneId)
        .eq('department', userDepartment)
        .eq('submitted_by', user.id)
        .maybeSingle();

      const estimatedCost = existing?.estimated_cost || 0;

      // Update or insert the budget entry
      const { data, error } = await supabase
        .from('nova_budget_tracking')
        .upsert({
          project_id: projectId,
          scene_id: sceneId,
          department: userDepartment,
          estimated_cost: estimatedCost,
          actual_cost: actualCost,
          proof_reason: proofReason,
          proof_url: proofUrl,
          submitted_by: user.id,
          is_finalized: true
        }, {
          onConflict: 'scene_id,department,submitted_by'
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchBudgets();
      return { error: null, data };
    } catch (error: any) {
      console.error('Error saving actual cost:', error);
      return { error: new Error(error.message) };
    }
  };

  const uploadProof = async (file: File, projectId: string): Promise<string | null> => {
    try {
      const filePath = `receipts/${projectId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('nova-proofs')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('nova-proofs')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading proof:', error);
      return null;
    }
  };

  // Calculate totals
  const totals = {
    estimated: budgets.reduce((sum, b) => sum + Number(b.estimated_cost || 0), 0),
    actual: budgets.reduce((sum, b) => sum + Number(b.actual_cost || 0), 0),
    get variance() { return this.estimated - this.actual; },
    get percentageUsed() { 
      return this.estimated > 0 ? ((this.actual / this.estimated) * 100).toFixed(1) : '0'; 
    }
  };

  return {
    budgets,
    loading,
    userDepartment,
    totals,
    fetchBudgets,
    saveBudgetEstimate,
    saveActualCost,
    uploadProof
  };
}
