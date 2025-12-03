import { Category } from '@/types';
import { cn } from '@/lib/utils';
import { Code, TrendingUp, Palette, Users } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
  isSelected?: boolean;
}

const iconMap: Record<string, React.ElementType> = {
  Code,
  TrendingUp,
  Palette,
  Users,
};

const colorMap: Record<string, string> = {
  primary: 'from-primary/30 to-primary/10 border-primary/30 text-primary',
  accent: 'from-accent/30 to-accent/10 border-accent/30 text-accent',
  warning: 'from-warning/30 to-warning/10 border-warning/30 text-warning',
  success: 'from-success/30 to-success/10 border-success/30 text-success',
};

export function CategoryCard({ category, onClick, isSelected }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Code;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-xl border cursor-pointer transition-all duration-300',
        'bg-gradient-to-br hover:scale-[1.02]',
        colorMap[category.color],
        isSelected && 'ring-2 ring-primary shadow-glow-sm'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-background/50">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{category.name}</h3>
          <p className="text-xs text-muted-foreground">{category.coursesCount} cursos</p>
        </div>
      </div>
    </div>
  );
}
