import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  Users,
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Home' },
  { to: '/admin/courses', icon: BookOpen, label: 'Cursos' },
  { to: '/admin/articles', icon: FileText, label: 'Artigos' },
  { to: '/admin/users', icon: Users, label: 'Usuários' },
];

const collaboratorLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/courses', icon: BookOpen, label: 'Cursos' },
  { to: '/articles', icon: FileText, label: 'Artigos' },
  { to: '/faqs', icon: HelpCircle, label: 'FAQ' },
];

export function BottomNav() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  
  const links = isAdmin ? adminLinks : collaboratorLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass border-t border-border/50 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-xl transition-all duration-200',
                    isActive && 'bg-primary/20'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
