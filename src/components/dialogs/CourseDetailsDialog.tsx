import { useState, useEffect } from 'react';
import { Course } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, Calendar, CheckCircle2, Video, FileText, File, PlayCircle, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'document';
  content: string;
  order_index: number;
}

interface CourseDetailsDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProgressUpdate?: () => void;
}

export function CourseDetailsDialog({ course, open, onOpenChange, onProgressUpdate }: CourseDetailsDialogProps) {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (course && open) {
      fetchLessons();
      if (user) {
        fetchProgress();
      }
      setCurrentProgress(course.progress || 0);
    } else {
      setActiveLesson(null);
    }
  }, [course, open, user]);

  const fetchLessons = async () => {
    if (!course) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/lessons.php?courseId=${course.id}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setLessons(data);
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    if (!user) return;
    try {
      const completedIds = await api.progress.get(user.id);
      setCompletedLessons(completedIds.map(String));
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const handleToggleComplete = async (lessonId: string) => {
    if (!user) return;
    
    const isCompleted = completedLessons.includes(lessonId);
    const newStatus = !isCompleted;
    
    try {
      await api.progress.toggle(user.id, parseInt(lessonId), newStatus);
      
      let newCompletedLessons;
      if (newStatus) {
        newCompletedLessons = [...completedLessons, lessonId];
      } else {
        newCompletedLessons = completedLessons.filter(id => id !== lessonId);
      }
      setCompletedLessons(newCompletedLessons);
      
      // Update local progress
      if (lessons.length > 0) {
        const newProgress = Math.round((newCompletedLessons.length / lessons.length) * 100);
        setCurrentProgress(newProgress);
      }

      // Notify parent to refresh courses list
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const renderLessonContent = (lesson: Lesson) => {
    if (lesson.type === 'video') {
      // Check if it's a YouTube URL
      const youtubeMatch = lesson.content.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]*).*/);
      
      if (youtubeMatch && youtubeMatch[1]) {
        return (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      } else {
        // Assume direct video file
        return (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            <video controls className="w-full h-full">
              <source src={lesson.content} />
              Seu navegador não suporta a tag de vídeo.
            </video>
          </div>
        );
      }
    } else if (lesson.type === 'article') {
      return (
        <div className="prose prose-invert max-w-none p-6 bg-card rounded-lg border">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
      );
    } else {
      return (
        <div className="p-8 text-center bg-muted rounded-lg border border-dashed">
          <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Material Complementar</h3>
          <Button variant="outline" asChild>
            <a href={lesson.content} target="_blank" rel="noopener noreferrer">
              Abrir Documento
            </a>
          </Button>
        </div>
      );
    }
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-background z-10">
          <div className="flex items-center gap-3">
            {activeLesson && (
              <Button variant="ghost" size="icon" onClick={() => setActiveLesson(null)} className="mr-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <DialogTitle>{activeLesson ? activeLesson.title : course.title}</DialogTitle>
              {activeLesson && (
                <p className="text-xs text-muted-foreground mt-1">{course.title}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Progresso</span>
                <span className="text-sm font-bold">{currentProgress}%</span>
             </div>
             <Progress value={currentProgress} className="w-24 h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Main Content Area */}
          <div className={`flex-1 overflow-y-auto p-6 ${activeLesson ? 'block' : 'hidden md:block'}`}>
            {activeLesson ? (
              <div className="space-y-6 animate-fade-in">
                {renderLessonContent(activeLesson)}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {activeLesson.type === 'video' ? 'Vídeo Aula' : activeLesson.type === 'article' ? 'Artigo' : 'Documento'}
                    </Badge>
                  </div>
                  <Button 
                    variant={completedLessons.includes(activeLesson.id) ? "default" : "outline"}
                    className={completedLessons.includes(activeLesson.id) ? "bg-success hover:bg-success/90" : ""}
                    onClick={() => handleToggleComplete(activeLesson.id)}
                  >
                    {completedLessons.includes(activeLesson.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Concluído
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marcar como Concluído
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
                      <p className="text-white/80 line-clamp-2">{course.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg border flex flex-col items-center justify-center text-center">
                    <Clock className="w-5 h-5 mb-2 text-primary" />
                    <span className="text-sm font-medium">{course.duration}</span>
                    <span className="text-xs text-muted-foreground">Duração</span>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border flex flex-col items-center justify-center text-center">
                    <BookOpen className="w-5 h-5 mb-2 text-primary" />
                    <span className="text-sm font-medium">{lessons.length}</span>
                    <span className="text-xs text-muted-foreground">Aulas</span>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border flex flex-col items-center justify-center text-center">
                    <Calendar className="w-5 h-5 mb-2 text-primary" />
                    <span className="text-sm font-medium">{new Date(course.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span className="text-xs text-muted-foreground">Atualizado</span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <h3>Sobre o curso</h3>
                  <p>{course.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Lesson List */}
          <div className={`w-full md:w-80 border-l bg-muted/10 flex flex-col ${activeLesson ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b font-medium bg-background">
              Conteúdo do Curso
            </div>
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : lessons.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">Nenhuma aula disponível.</div>
                ) : (
                  lessons.map((lesson, i) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full p-4 flex items-start gap-3 text-left transition-colors hover:bg-muted/50 ${
                        activeLesson?.id === lesson.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                      }`}
                    >
                      <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center border ${
                        completedLessons.includes(lesson.id) 
                          ? 'bg-success border-success text-success-foreground' 
                          : 'border-muted-foreground/30 text-transparent'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-none mb-1.5 ${
                          activeLesson?.id === lesson.id ? 'text-primary' : ''
                        }`}>
                          {i + 1}. {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {getIcon(lesson.type)}
                          <span className="capitalize">{lesson.type === 'video' ? 'Vídeo' : lesson.type === 'article' ? 'Artigo' : 'Documento'}</span>
                        </div>
                      </div>
                      {activeLesson?.id === lesson.id && (
                        <PlayCircle className="w-4 h-4 text-primary mt-1" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
