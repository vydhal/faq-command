import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/cards/StatsCard';
import { UserProgressCard } from '@/components/cards/UserProgressCard';
import { CourseCard } from '@/components/cards/CourseCard';
import { courses as mockCourses } from '@/data/mockData'; // Keep mock courses for "Recent Courses" if API doesn't return them, or fetch real courses
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { Course } from '@/types';

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [metrics, setMetrics] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalArticles: 0
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, coursesData] = await Promise.all([
          api.stats.get(),
          api.courses.list()
        ]);
        
        setMetrics(statsData.metrics);
        setStats({
          totalUsers: statsData.totalUsers,
          totalCourses: statsData.totalCourses,
          totalArticles: statsData.totalArticles
        });
        setRecentCourses(coursesData.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMetrics = metrics.filter((m) =>
    m.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgProgress = metrics.length > 0 
    ? Math.round(
        metrics.reduce((acc, m) => {
          // Calculate progress based on completed lessons vs total lessons
          const progress = m.totalLessons > 0 
            ? (m.totalCompletedLessons / m.totalLessons) * 100 
            : 0;
          return acc + progress;
        }, 0) / metrics.length
      )
    : 0;

  if (loading) {
    return <div className="p-8 text-center">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatsCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon={Users}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Cursos Ativos"
          value={stats.totalCourses}
          icon={BookOpen}
          variant="accent"
        />
        <StatsCard
          title="Artigos"
          value={stats.totalArticles}
          icon={FileText}
          variant="warning"
        />
        <StatsCard
          title="Média de Progresso"
          value={`${avgProgress}%`}
          icon={TrendingUp}
          variant="success"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* User Progress Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Progresso dos Colaboradores</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary/50 border-border/50"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredMetrics.map((metric) => (
            <UserProgressCard key={metric.userId} metric={metric} />
          ))}
        </div>
      </div>

      {/* Recent Courses */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Cursos Recentes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentCourses.map((course) => (
            <CourseCard key={course.id} course={course} showProgress={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
