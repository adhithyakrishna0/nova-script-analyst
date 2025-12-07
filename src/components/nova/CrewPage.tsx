import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/nova';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Users, UserPlus, Copy, Loader2, Crown, Mail } from 'lucide-react';

interface CrewMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  email?: string;
}

interface CrewPageProps {
  project: Project;
}

export function CrewPage({ project }: CrewPageProps) {
  const [members, setMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchMembers = async () => {
    try {
      // Get project members
      const { data: memberData, error: memberError } = await supabase
        .from('nova_project_members')
        .select('*')
        .eq('project_id', project.id);
      
      if (memberError) throw memberError;

      // Get profiles for emails
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email');
      
      if (profileError) throw profileError;

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);
      
      const enrichedMembers = (memberData || []).map(m => ({
        ...m,
        email: profileMap.get(m.user_id) || 'Unknown'
      }));

      setMembers(enrichedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [project.id]);

  const copyPasskey = () => {
    navigator.clipboard.writeText(project.passkey);
    toast({ title: "Copied!", description: "Passkey copied to clipboard" });
  };

  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('producer') || r.includes('director')) return 'from-primary to-accent';
    if (r.includes('camera') || r.includes('cinemato')) return 'from-blue-500 to-cyan-500';
    if (r.includes('sound') || r.includes('audio')) return 'from-purple-500 to-pink-500';
    if (r.includes('art') || r.includes('design')) return 'from-orange-500 to-yellow-500';
    if (r.includes('light') || r.includes('gaffer')) return 'from-amber-500 to-orange-500';
    return 'from-muted-foreground to-muted-foreground';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold">Crew Management</h1>
          <p className="text-muted-foreground mt-1">{project.name}</p>
        </div>
        <Button 
          onClick={() => setShowInviteModal(true)}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          <UserPlus size={18} className="mr-2" />
          Invite Crew
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="nova-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{members.length}</p>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
          </div>
        </div>
        <div className="nova-card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <Crown className="text-success" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Project Owner</p>
            </div>
          </div>
        </div>
        <div className="nova-card cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={copyPasskey}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Copy className="text-accent" size={24} />
            </div>
            <div className="flex-1">
              <p className="font-mono font-bold tracking-wider">{project.passkey}</p>
              <p className="text-sm text-muted-foreground">Click to copy passkey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="nova-card">
        <h2 className="font-cinzel text-xl font-semibold mb-6">Team Members</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <Users className="text-primary" size={32} />
            </div>
            <h3 className="font-cinzel text-xl mb-2">No Crew Members Yet</h3>
            <p className="text-muted-foreground mb-6">
              Share your project passkey to invite crew members
            </p>
            <Button onClick={() => setShowInviteModal(true)} className="bg-primary text-primary-foreground">
              <UserPlus size={18} className="mr-2" />
              Invite First Member
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member, index) => (
              <div 
                key={member.id}
                className="p-4 rounded-xl bg-background/40 border border-primary/10 hover:border-primary/30 transition-all group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold",
                    getRoleColor(member.role)
                  )}>
                    {member.email?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-2xl">Invite Crew Members</DialogTitle>
            <DialogDescription>
              Share these details with crew members to let them join the project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="p-4 rounded-xl bg-background/40 border border-primary/20">
              <Label className="text-xs text-muted-foreground uppercase">Project Name</Label>
              <div className="flex items-center justify-between mt-2">
                <p className="font-semibold text-lg">{project.name}</p>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(project.name);
                    toast({ title: "Copied!" });
                  }}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-background/40 border border-primary/20">
              <Label className="text-xs text-muted-foreground uppercase">Passkey</Label>
              <div className="flex items-center justify-between mt-2">
                <p className="font-mono font-bold text-2xl tracking-widest text-primary">{project.passkey}</p>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={copyPasskey}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">How to join:</strong> New members should sign up on NOVA, 
                then use "Join Project" with the project name and passkey above.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}