import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/cards/StatsCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Course, Category } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  FileText,
  Trophy,
  Target,
  Flame,
} from 'lucide-react';
import { CourseDetailsDialog } from '@/components/dialogs/CourseDetailsDialog';

export default function CollaboratorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [coursesData, categoriesData, announcementsData] = await Promise.all([
        api.courses.list(undefined, user.id),
        api.categories.list(),
        api.announcements.list(user.id)
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const filteredCourses = selectedCategory
    ? courses.filter((c) => c.categoryId === selectedCategory)
    : courses;

  const completedCourses = courses.filter((c) => c.progress === 100).length;
  const inProgressCourses = courses.filter((c) => (c.progress || 0) > 0 && (c.progress || 0) < 100).length;
  const overallProgress = courses.length > 0 
    ? Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / courses.length)
    : 0;

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="glass-card p-6 rounded-xl border border-border/50 bg-gradient-hero">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-16 h-16 rounded-full border-2 border-primary/50"
          />
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">
              Olá, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground">Continue sua jornada de aprendizado</p>
          </div>
          <div className="hidden sm:block text-right">
            <div className="flex items-center gap-2 text-warning">
              <Flame className="w-5 h-5" />
              <span className="font-bold">7 dias</span>
            </div>
            <p className="text-xs text-muted-foreground">de sequência</p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso Geral</span>
            <span className="text-lg font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress
            value={overallProgress}
            className="h-3"
            indicatorClassName="bg-gradient-to-r from-primary to-accent"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard
          title="Cursos Concluídos"
          value={completedCourses}
          icon={Trophy}
          variant="success"
        />
        <StatsCard
          title="Em Andamento"
          value={inProgressCourses}
          icon={Target}
          variant="warning"
        />
        <StatsCard
          title="Total de Cursos"
          value={courses.length}
          icon={BookOpen}
          variant="primary"
        />
        <StatsCard
          title="Artigos Lidos"
          value="8"
          icon={FileText}
          variant="accent"
        />
      </div>

      {/* Announcements Widget */}
      <div className="glass-card p-6 rounded-2xl border border-border/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Comunicados Recentes</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/collaborator/announcements')}>
            Ver todos
          </Button>
        </div>
        
        <div className="space-y-4">
          {announcements.slice(0, 3).map((announcement) => (
            <div 
              key={announcement.id}
              className={`p-4 rounded-xl border transition-colors ${
                !announcement.is_read 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'bg-secondary/30 border-border/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!announcement.is_read && (
                  <span className="flex h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
            </div>
          ))}
          
          {announcements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum comunicado recente
            </div>
          )}
        </div>
      </div>

      {/* Categories Filter */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Filtrar por Categoria</h2>
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

      {/* Continue Learning */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Continue Aprendendo</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses
            .filter((c) => (c.progress || 0) > 0 && (c.progress || 0) < 100)
            .map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onClick={() => setSelectedCourse(course)}
              />
            ))}
        </div>
      </div>

      {/* All Courses */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Todos os Cursos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onClick={() => setSelectedCourse(course)}
            />
          ))}
        </div>
      </div>
      {/* Course Details Dialog */}
      <CourseDetailsDialog
        course={selectedCourse}
        open={!!selectedCourse}
        onOpenChange={(open) => !open && setSelectedCourse(null)}
        onProgressUpdate={fetchData}
      />
    </div>
  );
}

