import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/nova';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Calendar, Plus, Trash2, Loader2, Clock, Film } from 'lucide-react';
import { format } from 'date-fns';

interface ShootDay {
  id: string;
  project_id: string;
  shoot_date: string;
  status: string;
  notes: string | null;
  created_at: string;
}

interface SchedulesPageProps {
  project: Project;
}

export function SchedulesPage({ project }: SchedulesPageProps) {
  const [shootDays, setShootDays] = useState<ShootDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchShootDays = async () => {
    try {
      const { data, error } = await supabase
        .from('nova_shoot_days')
        .select('*')
        .eq('project_id', project.id)
        .order('shoot_date');
      
      if (error) throw error;
      setShootDays(data || []);
    } catch (error) {
      console.error('Error fetching shoot days:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShootDays();
  }, [project.id]);

  const handleAddShootDay = async () => {
    if (!newDate) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('nova_shoot_days')
        .insert({
          project_id: project.id,
          shoot_date: newDate,
          notes: newNotes || null,
          status: 'planned'
        });

      if (error) throw error;
      
      toast({ title: "Success", description: "Shoot day added!" });
      setShowAddModal(false);
      setNewDate('');
      setNewNotes('');
      fetchShootDays();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShootDay = async (id: string) => {
    if (!confirm('Delete this shoot day?')) return;
    
    try {
      const { error } = await supabase
        .from('nova_shoot_days')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setShootDays(prev => prev.filter(d => d.id !== id));
      toast({ title: "Deleted", description: "Shoot day removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('nova_shoot_days')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      setShootDays(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold">Shooting Schedule</h1>
          <p className="text-muted-foreground mt-1">{project.name}</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          <Plus size={18} className="mr-2" />
          Add Shoot Day
        </Button>
      </div>

      <div className="nova-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : shootDays.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <Calendar className="text-primary" size={32} />
            </div>
            <h3 className="font-cinzel text-xl mb-2">No Shoot Days Scheduled</h3>
            <p className="text-muted-foreground mb-6">
              Start planning your production schedule by adding shoot days
            </p>
            <Button onClick={() => setShowAddModal(true)} className="bg-primary text-primary-foreground">
              <Plus size={18} className="mr-2" />
              Schedule First Day
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {shootDays.map((day, index) => (
              <div 
                key={day.id}
                className="p-4 rounded-lg bg-background/40 border border-primary/10 hover:border-primary/30 transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center justify-center">
                      <span className="text-xs text-muted-foreground uppercase">
                        {format(new Date(day.shoot_date), 'MMM')}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {format(new Date(day.shoot_date), 'd')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {format(new Date(day.shoot_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      {day.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{day.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <select
                      value={day.status}
                      onChange={(e) => updateStatus(day.id, e.target.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border-0 cursor-pointer",
                        day.status === 'completed' && "bg-success/20 text-success",
                        day.status === 'in_progress' && "bg-warning/20 text-warning",
                        day.status === 'planned' && "bg-muted text-muted-foreground"
                      )}
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteShootDay(day.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-2xl">Add Shoot Day</DialogTitle>
            <DialogDescription>
              Schedule a new shooting day for your production
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="mt-2 bg-background/40 border-primary/30"
              />
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Location details, special requirements..."
                className="mt-2 bg-background/40 border-primary/30"
                rows={3}
              />
            </div>
            <Button 
              onClick={handleAddShootDay}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground"
            >
              {submitting && <Loader2 className="animate-spin mr-2" size={18} />}
              Add Shoot Day
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}