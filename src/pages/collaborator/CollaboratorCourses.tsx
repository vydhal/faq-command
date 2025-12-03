import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/types';
import { CourseCard } from '@/components/cards/CourseCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CourseDetailsDialog } from '@/components/dialogs/CourseDetailsDialog';

export default function CollaboratorCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { user, isLoading: authLoading } = useAuth();

  const fetchCourses = async () => {
    if (!user) return;
    try {
      const data = await api.courses.list(undefined, user.id);
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDetailsOpen(true);
  };

  const handleProgressUpdate = () => {
    fetchCourses();
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'in-progress':
        return matchesSearch && (course.progress || 0) > 0 && (course.progress || 0) < 100;
      case 'completed':
        return matchesSearch && course.progress === 100;
      case 'not-started':
        return matchesSearch && (course.progress || 0) === 0;
      default:
        return matchesSearch;
    }
  });

  const inProgressCount = courses.filter((c) => (c.progress || 0) > 0 && (c.progress || 0) < 100).length;
  const completedCount = courses.filter((c) => c.progress === 100).length;
  const notStartedCount = courses.filter((c) => (c.progress || 0) === 0).length;

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Meus Cursos</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso de aprendizado</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cursos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-secondary/50 border-border/50"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-secondary/50">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Todos ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="text-xs sm:text-sm">
            Em andamento ({inProgressCount})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Concluídos ({completedCount})
          </TabsTrigger>
          <TabsTrigger value="not-started" className="text-xs sm:text-sm">
            Não iniciados ({notStartedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onClick={() => handleCourseClick(course)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum curso encontrado</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CourseDetailsDialog 
        course={selectedCourse} 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
}


