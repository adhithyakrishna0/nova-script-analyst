import { useEffect, useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { useScenes } from '@/hooks/useScenes';
import { Project, BudgetEntry, DEPARTMENTS } from '@/types/nova';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Percent, Eye, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetPageProps {
  project: Project;
}

export function BudgetPage({ project }: BudgetPageProps) {
  const { budgets, loading, totals, fetchBudgets } = useBudget(project.id);
  const { scenes, fetchScenes } = useScenes(project.id);
  const [selectedProof, setSelectedProof] = useState<BudgetEntry | null>(null);

  useEffect(() => {
    fetchBudgets();
    fetchScenes();
  }, [fetchBudgets, fetchScenes]);

  // Group budgets by department
  const departmentBudgets = DEPARTMENTS.reduce((acc, dept) => {
    const deptBudgets = budgets.filter(b => b.department === dept);
    const estimated = deptBudgets.reduce((sum, b) => sum + Number(b.estimated_cost || 0), 0);
    const actual = deptBudgets.reduce((sum, b) => sum + Number(b.actual_cost || 0), 0);
    if (estimated > 0 || actual > 0) {
      acc[dept] = { estimated, actual, entries: deptBudgets };
    }
    return acc;
  }, {} as Record<string, { estimated: number; actual: number; entries: BudgetEntry[] }>);

  // Get entries with proofs
  const entriesWithProofs = budgets.filter(b => b.proof_url || b.proof_reason);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-cinzel text-3xl font-bold">Budget</h1>
        <p className="text-muted-foreground mt-1">Financial Tracking & Analysis</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<DollarSign className="text-primary" />}
              label="Total Estimated"
              value={`₹${totals.estimated.toLocaleString()}`}
            />
            <StatCard
              icon={<DollarSign className="text-foreground" />}
              label="Total Actual"
              value={`₹${totals.actual.toLocaleString()}`}
            />
            <StatCard
              icon={totals.variance >= 0 ? <TrendingDown className="text-success" /> : <TrendingUp className="text-destructive" />}
              label={totals.variance >= 0 ? "Under Budget" : "Over Budget"}
              value={`₹${Math.abs(totals.variance).toLocaleString()}`}
              valueColor={totals.variance >= 0 ? "text-success" : "text-destructive"}
            />
            <StatCard
              icon={<Percent className="text-primary" />}
              label="Budget Used"
              value={`${totals.percentageUsed}%`}
            />
          </div>

          {/* Proofs Section - For Owners to view */}
          {entriesWithProofs.length > 0 && (
            <div className="nova-card mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-cinzel text-xl font-semibold">Budget Justifications & Proofs</h2>
                <span className="text-sm text-muted-foreground">{entriesWithProofs.length} entries</span>
              </div>
              <div className="space-y-3">
                {entriesWithProofs.map((entry) => {
                  const scene = scenes.find(s => s.id === entry.scene_id);
                  return (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between p-4 bg-background/40 rounded-lg border border-primary/10 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-medium">{entry.department}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">Scene {scene?.scene_number || 'Unknown'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Estimated: ₹{Number(entry.estimated_cost).toLocaleString()} → 
                          Actual: ₹{Number(entry.actual_cost).toLocaleString()}
                          <span className={cn(
                            "ml-2",
                            Number(entry.actual_cost) > Number(entry.estimated_cost) ? "text-destructive" : "text-success"
                          )}>
                            ({Number(entry.actual_cost) > Number(entry.estimated_cost) ? '+' : '-'}
                            ₹{Math.abs(Number(entry.actual_cost) - Number(entry.estimated_cost)).toLocaleString()})
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProof(entry)}
                        className="border-primary/30"
                      >
                        <Eye size={16} className="mr-2" />
                        View Details
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scene Budget Breakdown */}
          <div className="nova-card mb-8">
            <h2 className="font-cinzel text-xl font-semibold mb-6">Scene Budget Breakdown</h2>
            
            {scenes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">💰</div>
                <p className="text-muted-foreground">No scenes to track budget</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scenes.map((scene) => {
                  const sceneBudgets = budgets.filter(b => b.scene_id === scene.id);
                  const estimated = sceneBudgets.reduce((sum, b) => sum + Number(b.estimated_cost || 0), 0);
                  const actual = sceneBudgets.reduce((sum, b) => sum + Number(b.actual_cost || 0), 0);
                  const variance = estimated - actual;

                  return (
                    <div key={scene.id} className="p-4 bg-background/40 rounded-lg border border-primary/10">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-primary font-semibold">Scene {scene.scene_number}</span>
                          <span className="text-muted-foreground ml-2">{scene.heading || 'Untitled'}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase mb-1">Estimated</p>
                          <p className="text-lg font-bold text-primary">₹{estimated.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase mb-1">Actual</p>
                          <p className="text-lg font-bold">₹{actual.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase mb-1">Variance</p>
                          <p className={cn(
                            "text-lg font-bold",
                            variance >= 0 ? "text-success" : "text-destructive"
                          )}>
                            {variance >= 0 ? '+' : '-'}₹{Math.abs(variance).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Department Breakdown */}
          <div className="nova-card">
            <h2 className="font-cinzel text-xl font-semibold mb-6">Department Distribution</h2>
            
            {Object.keys(departmentBudgets).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No department budgets recorded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(departmentBudgets).map(([dept, data]) => (
                  <div key={dept} className="p-4 bg-background/40 rounded-lg border border-primary/10">
                    <h3 className="font-semibold text-primary mb-2">{dept}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated:</span>
                      <span>₹{data.estimated.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Actual:</span>
                      <span>₹{data.actual.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all",
                          data.actual <= data.estimated ? "bg-primary" : "bg-destructive"
                        )}
                        style={{ width: `${Math.min((data.actual / data.estimated) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Proof Details Modal */}
      <Dialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
        <DialogContent className="bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-2xl">Budget Justification</DialogTitle>
          </DialogHeader>
          {selectedProof && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Department</p>
                  <p className="font-semibold text-primary">{selectedProof.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Scene</p>
                  <p className="font-semibold">{scenes.find(s => s.id === selectedProof.scene_id)?.scene_number || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Estimated</p>
                  <p className="font-semibold">₹{Number(selectedProof.estimated_cost).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Actual</p>
                  <p className="font-semibold">₹{Number(selectedProof.actual_cost).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedProof.proof_reason && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-2">Reason for Variance</p>
                  <p className="bg-background/40 p-3 rounded-md text-sm">{selectedProof.proof_reason}</p>
                </div>
              )}
              
              {selectedProof.proof_url && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase mb-2">Supporting Document</p>
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedProof.proof_url!, '_blank')}
                    className="border-primary/30"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View Document
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

function StatCard({ icon, label, value, valueColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className={cn("text-2xl font-bold", valueColor || "text-primary")}>{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
