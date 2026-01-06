import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { ProfileDialog } from '@/components/dialogs/ProfileDialog';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.notifications.list(user.id);
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id: string) => {
    if (!user) return;
    try {
      await api.notifications.markRead(user.id, id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await api.notifications.markAllRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      handleMarkRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {title && (
              <h1 className="text-lg font-semibold hidden sm:block">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Search - Desktop */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="w-64 pl-9 bg-secondary/50 border-border/50"
              />
            </div>

            {/* Search - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notificações</span>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary"
                      onClick={handleMarkAllRead}
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.is_read ? 'bg-primary/5' : ''
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start justify-between w-full gap-2">
                          <span className={`font-medium text-sm ${!notification.is_read ? 'text-primary' : ''}`}>
                            {notification.title}
                          </span>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhuma notificação
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Avatar - Desktop */}
            <div className="hidden md:flex items-center gap-3 ml-2">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
              >
                <img
                  src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt={user?.name}
                  className="w-9 h-9 rounded-full bg-secondary object-cover"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
