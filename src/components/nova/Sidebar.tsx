import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Project } from '@/types/nova';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Film, 
  DollarSign, 
  Calendar, 
  Users, 
  FileText, 
  LogOut,
  Bell,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentProject: Project | null;
}

export function Sidebar({ currentPage, onNavigate, currentProject }: SidebarProps) {
  const { user, profile, signOut, isManager } = useAuth();
  const { unreadCount } = useNotifications();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut();
    }
  };

  return (
    <nav 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden z-50",
        "transition-all duration-300 ease-out",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-sidebar-border",
        isExpanded ? "px-6" : "px-3"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Sparkles className="text-primary-foreground" size={20} />
          </div>
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
          )}>
            <h1 className="nova-title text-xl text-primary tracking-widest whitespace-nowrap">NOVA</h1>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 flex items-center gap-3 animate-fade-in">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{profile?.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={currentPage === 'dashboard'}
            onClick={() => onNavigate('dashboard')}
            expanded={isExpanded}
          />
          <NavItem 
            icon={<Bell size={20} />}
            label="Notifications"
            active={currentPage === 'notifications'}
            onClick={() => onNavigate('notifications')}
            expanded={isExpanded}
            badge={unreadCount > 0 ? unreadCount : undefined}
          />
        </div>

        {currentProject && (
          <>
            {isExpanded && (
              <div className="mt-6 mb-2 px-3 animate-fade-in">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Production
                </span>
              </div>
            )}
            {!isExpanded && (
              <div className="mt-6 mb-2 flex justify-center">
                <div className="w-8 h-[1px] bg-sidebar-border" />
              </div>
            )}
            <div className="space-y-1">
              <NavItem 
                icon={<Film size={20} />}
                label="Scenes"
                active={currentPage === 'scenes'}
                onClick={() => onNavigate('scenes')}
                expanded={isExpanded}
              />
              
              {isManager && (
                <>
                  <NavItem 
                    icon={<DollarSign size={20} />}
                    label="Budget"
                    active={currentPage === 'budget'}
                    onClick={() => onNavigate('budget')}
                    expanded={isExpanded}
                  />
                  <NavItem 
                    icon={<Calendar size={20} />}
                    label="Schedules"
                    active={currentPage === 'schedules'}
                    onClick={() => onNavigate('schedules')}
                    expanded={isExpanded}
                  />
                  <NavItem 
                    icon={<Users size={20} />}
                    label="Crew"
                    active={currentPage === 'crew'}
                    onClick={() => onNavigate('crew')}
                    expanded={isExpanded}
                  />
                  <NavItem 
                    icon={<FileText size={20} />}
                    label="Call Sheet"
                    active={currentPage === 'callsheet'}
                    onClick={() => onNavigate('callsheet')}
                    expanded={isExpanded}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        <NavItem 
          icon={<LogOut size={20} />}
          label="Logout"
          onClick={handleLogout}
          expanded={isExpanded}
        />
      </div>

      {/* Expand indicator */}
      {!isExpanded && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-12 flex items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
          <ChevronRight size={12} className="text-muted-foreground" />
        </div>
      )}
    </nav>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  expanded: boolean;
  badge?: number;
}

function NavItem({ icon, label, active, onClick, expanded, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        "hover:bg-primary/10 group relative",
        active && "bg-primary/20 text-primary",
        !active && "text-muted-foreground hover:text-foreground",
        !expanded && "justify-center"
      )}
    >
      <span className={cn(
        "flex-shrink-0 transition-transform duration-200",
        active && "scale-110"
      )}>
        {icon}
      </span>
      
      {expanded && (
        <span className="whitespace-nowrap overflow-hidden animate-fade-in">
          {label}
        </span>
      )}
      
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground rounded-full",
          expanded ? "ml-auto min-w-[20px] h-5 px-1.5" : "absolute -top-1 -right-1 w-4 h-4 text-[10px]"
        )}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      
      {!expanded && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {label}
          {badge !== undefined && badge > 0 && (
            <span className="ml-2 text-primary font-bold">({badge})</span>
          )}
        </div>
      )}
    </button>
  );
}