import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types/nova';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardProps {
  onSelectProject: (project: Project) => void;
}

export function Dashboard({ onSelectProject }: DashboardProps) {
  const { isManager } = useAuth();
  const { projects, loading, fetchProjects, createProject, joinProject } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [passkey, setPasskey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async () => {
    if (!projectName || projectName.length < 3) {
      toast({ title: "Error", description: "Project name must be at least 3 characters", variant: "destructive" });
      return;
    }
    if (!passkey || passkey.length < 4) {
      toast({ title: "Error", description: "Passkey must be at least 4 characters", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await createProject(projectName, passkey);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Project created successfully!" });
      setShowCreateModal(false);
      setProjectName('');
      setPasskey('');
    }
    setSubmitting(false);
  };

  const handleJoinProject = async () => {
    if (!projectName || !passkey) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error, project } = await joinProject(projectName, passkey);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Joined project: ${project?.name}` });
      setShowJoinModal(false);
      setProjectName('');
      setPasskey('');
    }
    setSubmitting(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Production Overview & Projects</p>
        </div>
      </div>

      <div className="nova-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-cinzel text-xl font-semibold">My Projects</h2>
          <Button 
            onClick={() => isManager ? setShowCreateModal(true) : setShowJoinModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={18} className="mr-2" />
            {isManager ? 'New Project' : 'Join Project'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="font-cinzel text-xl mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6">
              {isManager 
                ? 'Create your first project to get started with film production management'
                : 'Join a project to begin collaborating with your team'
              }
            </p>
            <Button 
              onClick={() => isManager ? setShowCreateModal(true) : setShowJoinModal(true)}
              className="bg-primary text-primary-foreground"
            >
              <Plus size={18} className="mr-2" />
              {isManager ? 'Create Project' : 'Join Project'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="scene-card group"
              >
                <h3 className="font-cinzel text-lg font-semibold text-primary mb-2 group-hover:text-gold-light transition-colors">
                  {project.name}
                </h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Created {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                  <span className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                    Open <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-2xl">Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wide">Project Name</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Summer Blockbuster 2025"
                className="mt-2 bg-background/40 border-primary/30"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wide">Project Passkey</Label>
              <Input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Minimum 4 characters"
                className="mt-2 bg-background/40 border-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Share this passkey with your team to allow them to join the project
              </p>
            </div>
            <Button 
              onClick={handleCreateProject}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground"
            >
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Project Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-2xl">Join Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wide">Project Name</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter exact project name"
                className="mt-2 bg-background/40 border-primary/30"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wide">Project Passkey</Label>
              <Input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter project passkey"
                className="mt-2 bg-background/40 border-primary/30"
              />
            </div>
            <Button 
              onClick={handleJoinProject}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground"
            >
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              {submitting ? 'Joining...' : 'Join Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
