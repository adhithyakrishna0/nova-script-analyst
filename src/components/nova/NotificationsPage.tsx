import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Film, 
  DollarSign, 
  Users, 
  FileText,
  Loader2 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function NotificationsPage() {
  const { 
    notifications, 
    loading, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'script_uploaded':
        return <FileText className="text-primary" size={20} />;
      case 'budget_submitted':
      case 'cost_submitted':
        return <DollarSign className="text-success" size={20} />;
      case 'scene_updated':
        return <Film className="text-accent" size={20} />;
      case 'member_joined':
        return <Users className="text-warning" size={20} />;
      default:
        return <Bell className="text-muted-foreground" size={20} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'script_uploaded':
        return 'border-l-primary';
      case 'budget_submitted':
      case 'cost_submitted':
        return 'border-l-success';
      case 'scene_updated':
        return 'border-l-accent';
      case 'member_joined':
        return 'border-l-warning';
      default:
        return 'border-l-muted-foreground';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-cinzel text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              variant="outline"
              className="border-primary/30"
            >
              <CheckCheck size={18} className="mr-2" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button 
              onClick={clearAll}
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={18} className="mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="nova-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bell className="text-primary" size={32} />
            </div>
            <h3 className="font-cinzel text-xl mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
                getIcon={getNotificationIcon}
                getColor={getNotificationColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  getIcon: (type: string) => React.ReactNode;
  getColor: (type: string) => string;
}

function NotificationItem({ 
  notification, 
  onMarkRead, 
  onDelete,
  getIcon,
  getColor
}: NotificationItemProps) {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border-l-4 transition-all duration-200",
        "bg-background/40 hover:bg-background/60",
        getColor(notification.type),
        !notification.is_read && "ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-card">
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={cn(
                "font-medium",
                !notification.is_read && "text-primary"
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>
            
            {!notification.is_read && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0 mt-2" />
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            
            <div className="flex gap-2">
              {!notification.is_read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkRead(notification.id)}
                  className="h-7 px-2 text-xs"
                >
                  <Check size={14} className="mr-1" />
                  Mark Read
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(notification.id)}
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}