import { ProgressMetric } from '@/types';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProgressCardProps {
  metric: ProgressMetric;
  onClick?: () => void;
}

export function UserProgressCard({ metric, onClick }: UserProgressCardProps) {
  const overallProgress = Math.round(
    ((metric.completedCourses / metric.totalCourses) * 50) +
    ((metric.completedArticles / metric.totalArticles) * 50)
  );

  return (
    <div
      onClick={onClick}
      className="glass-card p-4 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-glow-sm cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <img
          src={metric.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${metric.userName}`}
          alt={metric.userName}
          className="w-12 h-12 rounded-full bg-secondary flex-shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{metric.userName}</h3>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span>Nota média: {metric.averageScore}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(metric.lastActivity, "dd MMM", { locale: ptBR })}</span>
            </div>
          </div>

          {/* Progress stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Cursos</span>
                <span className="font-medium">{metric.completedCourses}/{metric.totalCourses}</span>
              </div>
              <Progress
                value={(metric.completedCourses / metric.totalCourses) * 100}
                className="h-1.5"
                indicatorClassName="bg-primary"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Artigos</span>
                <span className="font-medium">{metric.completedArticles}/{metric.totalArticles}</span>
              </div>
              <Progress
                value={(metric.completedArticles / metric.totalArticles) * 100}
                className="h-1.5"
                indicatorClassName="bg-accent"
              />
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso geral</span>
              <span className="font-semibold text-primary">{overallProgress}%</span>
            </div>
            <Progress
              value={overallProgress}
              className="h-2"
              indicatorClassName="bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
