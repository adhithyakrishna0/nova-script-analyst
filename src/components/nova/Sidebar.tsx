import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/types/nova';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Film, 
  DollarSign, 
  Calendar, 
  Users, 
  FileText, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentProject: Project | null;
}

export function Sidebar({ currentPage, onNavigate, currentProject }: SidebarProps) {
  const { user, profile, signOut, isManager } = useAuth();

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut();
    }
  };

  return (
    <nav className="fixed left-0 top-0 w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-y-auto z-50">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="nova-title text-2xl text-primary tracking-widest">NOVA</h1>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">{profile?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3">
        <div className="space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={currentPage === 'dashboard'}
            onClick={() => onNavigate('dashboard')}
          />
        </div>

        {currentProject && (
          <>
            <div className="mt-6 mb-2 px-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Production
              </span>
            </div>
            <div className="space-y-1">
              <NavItem 
                icon={<Film size={20} />}
                label="Scenes"
                active={currentPage === 'scenes'}
                onClick={() => onNavigate('scenes')}
              />
              
              {isManager && (
                <>
                  <NavItem 
                    icon={<DollarSign size={20} />}
                    label="Budget"
                    active={currentPage === 'budget'}
                    onClick={() => onNavigate('budget')}
                  />
                  <NavItem 
                    icon={<Calendar size={20} />}
                    label="Schedules"
                    active={currentPage === 'schedules'}
                    onClick={() => onNavigate('schedules')}
                  />
                  <NavItem 
                    icon={<Users size={20} />}
                    label="Crew"
                    active={currentPage === 'crew'}
                    onClick={() => onNavigate('crew')}
                  />
                  <NavItem 
                    icon={<FileText size={20} />}
                    label="Call Sheet"
                    active={currentPage === 'callsheet'}
                    onClick={() => onNavigate('callsheet')}
                  />
                </>
              )}
            </div>
          </>
        )}

        <div className="mt-6 mb-2 px-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Account
          </span>
        </div>
        <div className="space-y-1">
          <NavItem 
            icon={<LogOut size={20} />}
            label="Logout"
            onClick={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "nav-item w-full",
        active && "active"
      )}
    >
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
