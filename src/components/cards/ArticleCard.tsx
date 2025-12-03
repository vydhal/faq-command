import { Article } from '@/types';
import { Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  onClick?: () => void;
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card overflow-hidden rounded-xl border border-border/50',
        'transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-sm cursor-pointer',
        'flex flex-col sm:flex-row group'
      )}
    >
      {/* Thumbnail */}
      <div className="relative sm:w-48 aspect-video sm:aspect-square flex-shrink-0 overflow-hidden">
        <img
          src={article.thumbnail}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {article.isCompleted && (
          <div className="absolute top-2 right-2 p-1.5 rounded-full bg-success/90">
            <CheckCircle2 className="w-4 h-4 text-success-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {article.excerpt}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{article.readTime} de leitura</span>
        </div>
      </div>
    </div>
  );
}
