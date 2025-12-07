import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/types/nova';
import { AuthPage } from './AuthPage';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { ScenesPage } from './ScenesPage';
import { BudgetPage } from './BudgetPage';
import { NotificationsPage } from './NotificationsPage';
import { SchedulesPage } from './SchedulesPage';
import { CrewPage } from './CrewPage';
import { CallSheetPage } from './CallSheetPage';
import { Loader2 } from 'lucide-react';

export function NovaApp() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center animate-pulse">
              <Loader2 className="animate-spin text-primary-foreground" size={32} />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
          </div>
          <h1 className="nova-title text-3xl text-primary mt-6">NOVA</h1>
          <p className="text-muted-foreground mt-2">Initializing production suite...</p>
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
      
      {/* Dynamic margin based on sidebar state */}
      <main className="ml-16 hover:ml-16 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {currentPage === 'dashboard' && (
            <Dashboard onSelectProject={handleSelectProject} />
          )}
          {currentPage === 'notifications' && (
            <NotificationsPage />
          )}
          {currentPage === 'scenes' && currentProject && (
            <ScenesPage project={currentProject} />
          )}
          {currentPage === 'budget' && currentProject && (
            <BudgetPage project={currentProject} />
          )}
          {currentPage === 'schedules' && currentProject && (
            <SchedulesPage project={currentProject} />
          )}
          {currentPage === 'crew' && currentProject && (
            <CrewPage project={currentProject} />
          )}
          {currentPage === 'callsheet' && currentProject && (
            <CallSheetPage project={currentProject} />
          )}
        </div>
      </main>
    </div>
  );
}