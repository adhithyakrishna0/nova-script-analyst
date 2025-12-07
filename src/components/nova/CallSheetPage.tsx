import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/nova';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FileText, Download, Loader2, Calendar, MapPin, Clock, Users, Film } from 'lucide-react';
import { format } from 'date-fns';

interface CallSheetPageProps {
  project: Project;
}

interface Scene {
  id: string;
  scene_number: number;
  heading: string;
  location_type: string;
  specific_location: string;
  time_of_day: string;
  characters_present: string;
}

interface ShootDay {
  id: string;
  shoot_date: string;
  status: string;
  notes: string | null;
}

export function CallSheetPage({ project }: CallSheetPageProps) {
  const [shootDays, setShootDays] = useState<ShootDay[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedDay, setSelectedDay] = useState<ShootDay | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [{ data: daysData }, { data: scenesData }] = await Promise.all([
        supabase.from('nova_shoot_days').select('*').eq('project_id', project.id).order('shoot_date'),
        supabase.from('nova_scenes').select('id, scene_number, heading, location_type, specific_location, time_of_day, characters_present').eq('project_id', project.id).order('scene_number')
      ]);
      
      setShootDays(daysData || []);
      setScenes(scenesData || []);
      if (daysData && daysData.length > 0) {
        setSelectedDay(daysData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [project.id]);

  const generateCallSheet = () => {
    if (!selectedDay) return;
    
    // Generate printable call sheet content
    const callSheetContent = `
================================================================================
                              CALL SHEET
================================================================================

PROJECT: ${project.name}
DATE: ${format(new Date(selectedDay.shoot_date), 'EEEE, MMMM d, yyyy')}
STATUS: ${selectedDay.status.toUpperCase()}

--------------------------------------------------------------------------------
                              NOTES
--------------------------------------------------------------------------------
${selectedDay.notes || 'No notes for this day.'}

--------------------------------------------------------------------------------
                              SCENES
--------------------------------------------------------------------------------
${scenes.map(s => `
Scene ${s.scene_number}: ${s.heading || 'Untitled'}
  Location: ${s.location_type} - ${s.specific_location || 'TBD'}
  Time: ${s.time_of_day || 'DAY'}
  Cast: ${s.characters_present || 'TBD'}
`).join('\n')}

--------------------------------------------------------------------------------
                              CREW CALL TIMES
--------------------------------------------------------------------------------
(To be filled in by production)

================================================================================
    `;

    // Create and download file
    const blob = new Blob([callSheetContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CallSheet_${project.name}_${selectedDay.shoot_date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Downloaded", description: "Call sheet saved!" });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold">Call Sheets</h1>
          <p className="text-muted-foreground mt-1">{project.name}</p>
        </div>
        {selectedDay && (
          <Button 
            onClick={generateCallSheet}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
          >
            <Download size={18} className="mr-2" />
            Download Call Sheet
          </Button>
        )}
      </div>

      {loading ? (
        <div className="nova-card flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : shootDays.length === 0 ? (
        <div className="nova-card text-center py-12">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
            <FileText className="text-primary" size={32} />
          </div>
          <h3 className="font-cinzel text-xl mb-2">No Shoot Days</h3>
          <p className="text-muted-foreground">
            Add shoot days in the Schedule page to generate call sheets
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Day Selector */}
          <div className="nova-card">
            <h2 className="font-cinzel text-lg font-semibold mb-4">Select Shoot Day</h2>
            <div className="space-y-2">
              {shootDays.map(day => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-all",
                    selectedDay?.id === day.id 
                      ? "bg-primary/20 ring-1 ring-primary" 
                      : "bg-background/40 hover:bg-background/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-primary" />
                    <span className="font-medium">
                      {format(new Date(day.shoot_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full mt-2 inline-block",
                    day.status === 'completed' && "bg-success/20 text-success",
                    day.status === 'in_progress' && "bg-warning/20 text-warning",
                    day.status === 'planned' && "bg-muted text-muted-foreground"
                  )}>
                    {day.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Call Sheet Preview */}
          <div className="lg:col-span-2 nova-card">
            <h2 className="font-cinzel text-lg font-semibold mb-4">Call Sheet Preview</h2>
            
            {selectedDay && (
              <div className="space-y-6">
                {/* Header */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-cinzel text-xl font-bold">{project.name}</h3>
                      <p className="text-muted-foreground">
                        {format(new Date(selectedDay.shoot_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium",
                      selectedDay.status === 'completed' && "bg-success/20 text-success",
                      selectedDay.status === 'in_progress' && "bg-warning/20 text-warning",
                      selectedDay.status === 'planned' && "bg-muted text-muted-foreground"
                    )}>
                      {selectedDay.status}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedDay.notes && (
                  <div className="p-4 rounded-xl bg-background/40 border border-primary/10">
                    <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Notes</h4>
                    <p className="text-foreground">{selectedDay.notes}</p>
                  </div>
                )}

                {/* Scenes */}
                <div>
                  <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Scenes</h4>
                  <div className="space-y-3">
                    {scenes.map((scene, index) => (
                      <div 
                        key={scene.id}
                        className="p-4 rounded-lg bg-background/40 border border-primary/10"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                              {scene.scene_number}
                            </span>
                            <div>
                              <p className="font-medium">{scene.heading || 'Untitled Scene'}</p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {scene.location_type} - {scene.specific_location || 'TBD'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {scene.time_of_day || 'DAY'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {scene.characters_present && (
                          <div className="mt-3 pt-3 border-t border-primary/10">
                            <div className="flex items-center gap-2 text-sm">
                              <Users size={12} className="text-muted-foreground" />
                              <span className="text-muted-foreground">Cast:</span>
                              <span>{scene.characters_present}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}