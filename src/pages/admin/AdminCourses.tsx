import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Course, Category } from '@/types';
import { CourseCard } from '@/components/cards/CourseCard';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter, Edit2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from '@/components/inputs/ImageUpload';
import { LessonsManager } from '@/components/admin/LessonsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    categoryId: '',
    duration: '',
    lessonsCount: 0,
    thumbnail: ''
  });

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [coursesData, categoriesData] = await Promise.all([
        api.courses.list(),
        api.categories.list()
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCourse = async () => {
    try {
      if (editingCourse) {
        await api.courses.update(editingCourse.id, newCourse);
        toast({ title: "Sucesso", description: "Curso atualizado com sucesso!" });
      } else {
        await api.courses.create(newCourse);
        toast({ title: "Sucesso", description: "Curso criado com sucesso!" });
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save course:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar curso.",
      });
    }
  };

  const handleDeleteCourse = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;

    try {
      await api.courses.delete(id);
      toast({ title: "Sucesso", description: "Curso excluído com sucesso!" });
      fetchData();
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir curso.",
      });
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourse({
      title: course.title,
      description: course.description,
      categoryId: course.categoryId,
      duration: course.duration,
      lessonsCount: course.lessonsCount,
      thumbnail: course.thumbnail
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCourse(null);
    setNewCourse({
      title: '',
      description: '',
      categoryId: '',
      duration: '',
      lessonsCount: 0,
      thumbnail: ''
    });
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">Gerencie os cursos da plataforma</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="content" disabled={!editingCourse}>Conteúdo</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      placeholder="Ex: React Completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Categoria</Label>
                    <Select
                      value={newCourse.categoryId}
                      onValueChange={(value) => setNewCourse({ ...newCourse, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    placeholder="Descrição do curso"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração</Label>
                    <Input
                      id="duration"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      placeholder="Ex: 40h"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lessonsCount">Nº de Aulas</Label>
                    <Input
                      id="lessonsCount"
                      type="number"
                      value={newCourse.lessonsCount}
                      onChange={(e) => setNewCourse({ ...newCourse, lessonsCount: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Imagem de Capa</Label>
                  <ImageUpload
                    value={newCourse.thumbnail}
                    onChange={(url) => setNewCourse({ ...newCourse, thumbnail: url })}
                  />
                </div>

                <Button onClick={handleSaveCourse} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {editingCourse ? 'Salvar Alterações' : 'Criar Curso'}
                </Button>
              </TabsContent>

              <TabsContent value="content" className="py-4">
                {editingCourse && <LessonsManager courseId={editingCourse.id} />}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/50"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Categorias</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            {filteredCourses.length} curso(s) encontrado(s)
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div key={course.id} className="relative group">
              <CourseCard
                course={course}
                showProgress={false}
                onClick={() => handleEditCourse(course)}
              />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-md z-10">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEditCourse(course); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => handleDeleteCourse(course.id, e)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

