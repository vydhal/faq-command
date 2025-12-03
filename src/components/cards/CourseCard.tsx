import { Course } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  showProgress?: boolean;
}

export function CourseCard({ course, onClick, showProgress = true }: CourseCardProps) {
  const progressValue = course.progress || 0;
  const isCompleted = progressValue === 100;

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card overflow-hidden rounded-xl border border-border/50',
        'transition-all duration-300 hover:scale-[1.02] hover:shadow-glow cursor-pointer',
        'group'
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
            <Play className="w-6 h-6 text-primary-foreground ml-1" />
          </div>
        </div>

        {/* Status badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-success/90 text-success-foreground text-xs font-medium">
            Concluído
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {course.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessonsCount} aulas</span>
          </div>
        </div>

        {/* Progress */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium text-primary">{progressValue}%</span>
            </div>
            <Progress
              value={progressValue}
              className="h-2"
              indicatorClassName={cn(
                isCompleted ? 'bg-success' : 'bg-gradient-to-r from-primary to-accent'
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
