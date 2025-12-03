import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useScenes } from '@/hooks/useScenes';
import { useBudget } from '@/hooks/useBudget';
import { Project, Scene } from '@/types/nova';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Upload, FileText, Save, Trash2, ChevronDown, DollarSign, Loader2 } from 'lucide-react';

interface ScenesPageProps {
  project: Project;
}

export function ScenesPage({ project }: ScenesPageProps) {
  const { isManager, profile } = useAuth();
  const { scenes, loading, analyzing, fetchScenes, analyzeScript, updateScene, deleteScene } = useScenes(project.id);
  const { userDepartment, saveBudgetEstimate, saveActualCost, uploadProof } = useBudget(project.id);
  
  const [expandedScene, setExpandedScene] = useState<string | null>(null);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showActualCostModal, setShowActualCostModal] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [proofReason, setProofReason] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.txt')) {
      toast({ title: "Error", description: "Only .txt files are supported", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setShowUploadModal(false);
      
      const { error, count } = await analyzeScript(text);
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: `Successfully imported ${count} scenes!` });
      }
    };
    reader.readAsText(file);
  };

  const handleSaveScene = async () => {
    if (!editingScene) return;
    
    setSubmitting(true);
    const { error } = await updateScene(editingScene.id, editingScene);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Scene saved successfully!" });
    }
    setSubmitting(false);
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!confirm('Are you sure you want to delete this scene? This cannot be undone.')) return;
    
    const { error } = await deleteScene(sceneId);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Scene deleted successfully!" });
      setExpandedScene(null);
    }
  };

  const handleSaveBudget = async () => {
    if (!selectedSceneId || !budgetAmount) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await saveBudgetEstimate(selectedSceneId, parseFloat(budgetAmount));
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Budget estimate saved: ₹${parseFloat(budgetAmount).toLocaleString()}` });
      setShowBudgetModal(false);
      setBudgetAmount('');
    }
    setSubmitting(false);
  };

  const handleSaveActualCost = async () => {
    if (!selectedSceneId || !actualAmount) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    
    let proofUrl: string | undefined;
    if (proofFile) {
      proofUrl = await uploadProof(proofFile, project.id) || undefined;
    }

    const { error } = await saveActualCost(
      selectedSceneId, 
      parseFloat(actualAmount),
      proofReason || undefined,
      proofUrl
    );
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Actual cost submitted: ₹${parseFloat(actualAmount).toLocaleString()}` });
      setShowActualCostModal(false);
      setActualAmount('');
      setProofReason('');
      setProofFile(null);
    }
    setSubmitting(false);
  };

  const toggleSceneExpand = (sceneId: string) => {
    if (expandedScene === sceneId) {
      setExpandedScene(null);
      setEditingScene(null);
    } else {
      setExpandedScene(sceneId);
      const scene = scenes.find(s => s.id === sceneId);
      if (scene) setEditingScene({ ...scene });
    }
  };

  const openBudgetModal = (sceneId: string) => {
    setSelectedSceneId(sceneId);
    setBudgetAmount('');
    setShowBudgetModal(true);
  };

  const openActualCostModal = (sceneId: string) => {
    setSelectedSceneId(sceneId);
    setActualAmount('');
    setProofReason('');
    setProofFile(null);
    setShowActualCostModal(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-1">Scene Management & Script Breakdown</p>
        </div>
        {isManager && (
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload size={18} className="mr-2" />
            Upload Script
          </Button>
        )}
      </div>

      <div className="nova-card">
        <h2 className="font-cinzel text-xl font-semibold mb-6">Scene List</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : scenes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-cinzel text-xl mb-2">No Scenes Yet</h3>
            <p className="text-muted-foreground mb-6">
              {isManager 
                ? 'Upload a script to automatically generate scenes with AI analysis'
                : 'Scenes will appear here when the production team adds them'
              }
            </p>
            {isManager && (
              <Button 
                onClick={() => setShowUploadModal(true)}
                className="bg-primary text-primary-foreground"
              >
                <FileText size={18} className="mr-2" />
                Upload Script
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className={cn(
                  "scene-card transition-all duration-300",
                  expandedScene === scene.id && "expanded"
                )}
              >
                <div 
                  onClick={() => toggleSceneExpand(scene.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-semibold">Scene {scene.scene_number}</span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full uppercase font-medium",
                        scene.status === 'completed' && "bg-success/20 text-success",
                        scene.status === 'in_progress' && "bg-warning/20 text-warning",
                        (!scene.status || scene.status === 'pending') && "bg-muted text-muted-foreground"
                      )}>
                        {scene.status || 'pending'}
                      </span>
                    </div>
                    <p className="text-foreground mt-1">{scene.heading || 'Untitled Scene'}</p>
                    <p className="text-sm text-muted-foreground">
                      {scene.location_type || 'INT'} - {scene.specific_location || 'Unknown'} - {scene.time_of_day || 'DAY'}
                    </p>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={cn(
                      "text-muted-foreground transition-transform",
                      expandedScene === scene.id && "rotate-180"
                    )} 
                  />
                </div>

                {expandedScene === scene.id && editingScene && (
                  <div className="mt-6 pt-6 border-t border-primary/20 animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {[
                        { label: 'Location Type', key: 'location_type' },
                        { label: 'Specific Location', key: 'specific_location' },
                        { label: 'Time of Day', key: 'time_of_day' },
                        { label: 'Characters Present', key: 'characters_present' },
                        { label: 'Speaking Roles', key: 'speaking_roles' },
                        { label: 'Extras', key: 'extras' },
                        { label: 'Functional Props', key: 'functional_props' },
                        { label: 'Camera Movement', key: 'camera_movement' },
                        { label: 'Lighting', key: 'lighting' },
                        { label: 'Scene Mood', key: 'scene_mood' },
                        { label: 'Pacing', key: 'pacing' },
                        { label: 'Shoot Type', key: 'shoot_type' },
                      ].map(({ label, key }) => (
                        <div key={key}>
                          <Label className="text-xs text-muted-foreground uppercase">{label}</Label>
                          {isManager ? (
                            <Input
                              value={(editingScene as any)[key] || ''}
                              onChange={(e) => setEditingScene({ ...editingScene, [key]: e.target.value })}
                              className="mt-1 bg-background/40 border-primary/30 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <p className="text-sm mt-1">{(scene as any)[key] || 'N/A'}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <Label className="text-xs text-muted-foreground uppercase">Scene Content</Label>
                      {isManager ? (
                        <Textarea
                          value={editingScene.content || ''}
                          onChange={(e) => setEditingScene({ ...editingScene, content: e.target.value })}
                          rows={6}
                          className="mt-1 bg-background/40 border-primary/30"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-sm mt-1 whitespace-pre-wrap bg-background/20 p-3 rounded-md max-h-48 overflow-y-auto">
                          {scene.content || 'No content available'}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {isManager ? (
                        <>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleSaveScene(); }}
                            disabled={submitting}
                            className="bg-primary text-primary-foreground"
                          >
                            {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
                            Save Changes
                          </Button>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteScene(scene.id); }}
                            variant="destructive"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete Scene
                          </Button>
                        </>
                      ) : userDepartment && (
                        <>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); openBudgetModal(scene.id); }}
                            className="bg-primary text-primary-foreground"
                          >
                            <DollarSign size={16} className="mr-2" />
                            Enter Budget
                          </Button>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); openActualCostModal(scene.id); }}
                            variant="outline"
                            className="border-primary/30"
                          >
                            Enter Actual Cost
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Script Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-2xl">Upload & Analyze Script</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wide">Script File (.txt format)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="mt-2 w-full p-3 bg-background/40 border border-primary/30 rounded-md text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Upload a properly formatted screenplay in .txt format. The AI will analyze and break it down into scenes.
              </p>
            </div>
            {analyzing && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="animate-spin text-primary mr-3" size={24} />
                <span className="text-muted-foreground">Analyzing script with Gemini AI... This may take up to 30 seconds.</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Budget Input Modal */}
      <Dialog open={showBudgetModal} onOpenChange={setShowBudgetModal}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-2xl">{userDepartment} Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-muted-foreground text-sm">Enter your estimated cost for this scene</p>
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wide">Estimated Cost (₹)</Label>
              <Input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="₹ 0.00"
                className="mt-2 bg-background/40 border-primary/30"
              />
            </div>
            <Button 
              onClick={handleSaveBudget}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground"
            >
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Save Budget Estimate
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Actual Cost Modal */}
      <Dialog open={showActualCostModal} onOpenChange={setShowActualCostModal}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-2xl">Submit Actual Costs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wide">Actual Cost (₹)</Label>
              <Input
                type="number"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                placeholder="₹ 0.00"
                className="mt-2 bg-background/40 border-primary/30"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wide">Reason (if over budget)</Label>
              <Textarea
                value={proofReason}
                onChange={(e) => setProofReason(e.target.value)}
                placeholder="Explain any budget variance..."
                rows={3}
                className="mt-2 bg-background/40 border-primary/30"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wide">Upload Proof (Optional)</Label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="mt-2 w-full p-3 bg-background/40 border border-primary/30 rounded-md text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">Accepted: PDF, JPG, PNG</p>
            </div>
            <Button 
              onClick={handleSaveActualCost}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground"
            >
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Submit Actual Costs
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
