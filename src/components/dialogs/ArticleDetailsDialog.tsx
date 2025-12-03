import { useState, useEffect } from 'react';
import { Article } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

interface ArticleDetailsDialogProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProgressUpdate?: () => void;
}

export function ArticleDetailsDialog({ article, open, onOpenChange, onProgressUpdate }: ArticleDetailsDialogProps) {
  const { user } = useAuth();
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (article && open && user) {
      checkCompletion();
    }
  }, [article, open, user]);

  const checkCompletion = async () => {
    if (!user || !article) return;
    try {
      const response = await fetch(`http://localhost:8000/api/progress.php?userId=${user.id}&articleId=${article.id}`);
      const data = await response.json();
      setIsCompleted(data.completed);
    } catch (error) {
      console.error('Failed to check completion:', error);
    }
  };

  const handleToggleComplete = async () => {
    if (!user || !article) return;
    setLoading(true);
    try {
      const newStatus = !isCompleted;
      await fetch(`http://localhost:8000/api/progress.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          articleId: article.id,
          completed: newStatus
        }),
      });
      setIsCompleted(newStatus);
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{article.title}</DialogTitle>
            <Button
              variant={isCompleted ? "default" : "outline"}
              className={isCompleted ? "bg-success hover:bg-success/90" : ""}
              onClick={handleToggleComplete}
              disabled={loading}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Lido
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar como Lido
                </>
              )}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <img 
              src={article.thumbnail} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Meta Data */}
          <div className="flex flex-wrap gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} de leitura
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Publicado em {new Date(article.createdAt).toLocaleDateString('pt-BR')}
            </Badge>
          </div>

          {/* Excerpt */}
          <div className="text-lg text-muted-foreground font-medium border-l-4 border-primary pl-4">
            {article.excerpt}
          </div>

          {/* Content */}
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
