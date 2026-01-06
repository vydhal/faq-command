import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/inputs/RichTextEditor';
import { Plus, Trash2, Edit2, Video, FileText, File } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  type: 'video' | 'article' | 'document';
  content: string;
  order_index: number;
}

interface LessonsManagerProps {
  courseId: string;
}

export function LessonsManager({ courseId }: LessonsManagerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState<{
    title: string;
    type: 'video' | 'article' | 'document';
    content: string;
    order_index: number;
  }>({
    title: '',
    type: 'video',
    content: '',
    order_index: 0
  });

  const { toast } = useToast();

  const fetchLessons = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/lessons.php?courseId=${courseId}`);
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

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const handleSaveLesson = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const url = `${API_URL}/lessons.php` + (editingLesson ? `?id=${editingLesson.id}` : '');
      const method = editingLesson ? 'PUT' : 'POST';
      const body = editingLesson
        ? { ...newLesson, id: editingLesson.id, course_id: courseId }
        : { ...newLesson, course_id: courseId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to save lesson');

      toast({
        title: "Sucesso",
        description: `Aula ${editingLesson ? 'atualizada' : 'criada'} com sucesso!`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar aula.",
      });
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/lessons.php?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete lesson');

      toast({
        title: "Sucesso",
        description: "Aula excluída com sucesso!",
      });
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir aula.",
      });
    }
  };

  const resetForm = () => {
    setNewLesson({
      title: '',
      type: 'video',
      content: '',
      order_index: lessons.length
    });
    setEditingLesson(null);
  };

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      type: lesson.type,
      content: lesson.content,
      order_index: lesson.order_index
    });
    setIsDialogOpen(true);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Conteúdo do Curso</h3>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLesson ? 'Editar Aula' : 'Nova Aula'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  placeholder="Título da aula"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newLesson.type}
                  onValueChange={(value: any) => setNewLesson({ ...newLesson, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Vídeo (YouTube/Vimeo)</SelectItem>
                    <SelectItem value="article">Artigo/Texto</SelectItem>
                    <SelectItem value="document">Documento (Link)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Conteúdo</Label>
                {newLesson.type === 'article' ? (
                  <RichTextEditor
                    value={newLesson.content}
                    onChange={(value) => setNewLesson({ ...newLesson, content: value })}
                    placeholder="Conteúdo da aula..."
                  />
                ) : (
                  <Input
                    value={newLesson.content}
                    onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                    placeholder={newLesson.type === 'video' ? 'URL do vídeo (YouTube, Vimeo)' : 'URL do documento'}
                  />
                )}
              </div>

              <Button onClick={handleSaveLesson} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Salvar Aula
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {lessons.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma aula cadastrada.
          </p>
        ) : (
          <div className="border rounded-lg divide-y">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-md">
                    {getIcon(lesson.type)}
                  </div>
                  <span className="font-medium">{lesson.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(lesson)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lesson.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
