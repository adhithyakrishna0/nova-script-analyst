import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/types/nova';
import { AuthPage } from './AuthPage';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { ScenesPage } from './ScenesPage';
import { BudgetPage } from './BudgetPage';
import { Loader2 } from 'lucide-react';

export function NovaApp() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
          <h1 className="nova-title text-3xl text-primary">NOVA</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage />;
  }

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentPage('scenes');
  };

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') {
      setCurrentProject(null);
    }
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentProject={currentProject}
      />
      
      <main className="ml-64 p-8">
        {currentPage === 'dashboard' && (
          <Dashboard onSelectProject={handleSelectProject} />
        )}
        {currentPage === 'scenes' && currentProject && (
          <ScenesPage project={currentProject} />
        )}
        {currentPage === 'budget' && currentProject && (
          <BudgetPage project={currentProject} />
        )}
        {currentPage === 'schedules' && currentProject && (
          <div className="animate-fade-in">
            <h1 className="font-cinzel text-3xl font-bold mb-4">Schedules</h1>
            <p className="text-muted-foreground">Schedule management coming soon...</p>
          </div>
        )}
        {currentPage === 'crew' && currentProject && (
          <div className="animate-fade-in">
            <h1 className="font-cinzel text-3xl font-bold mb-4">Crew</h1>
            <p className="text-muted-foreground">Crew management coming soon...</p>
          </div>
        )}
        {currentPage === 'callsheet' && currentProject && (
          <div className="animate-fade-in">
            <h1 className="font-cinzel text-3xl font-bold mb-4">Call Sheet</h1>
            <p className="text-muted-foreground">Call sheet generation coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}
