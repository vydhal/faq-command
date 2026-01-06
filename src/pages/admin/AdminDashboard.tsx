import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/cards/StatsCard';
import { UserProgressCard } from '@/components/cards/UserProgressCard';
import { CourseCard } from '@/components/cards/CourseCard';
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Search,
  Download,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { Course } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

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
        const progress = m.totalLessons > 0
          ? (m.totalCompletedLessons / m.totalLessons) * 100
          : 0;
        return acc + progress;
      }, 0) / metrics.length
    )
    : 0;

  const handleDownloadReport = () => {
    const headers = ['Nome', 'Cursos Totais', 'Cursos Completos', 'Aulas Completas', 'Total Aulas', 'Progresso'];
    const csvContent = [
      headers.join(','),
      ...metrics.map(m => {
        const progress = m.totalLessons > 0 ? ((m.totalCompletedLessons / m.totalLessons) * 100).toFixed(2) : '0';
        return [
          `"${m.userName}"`,
          m.totalCourses,
          m.completedCourses,
          m.totalCompletedLessons,
          m.totalLessons,
          `${progress}%`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorio_progresso.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = metrics.map(m => ({
    name: m.userName,
    concluido: m.totalCompletedLessons,
    total: m.totalLessons
  }));

  if (loading) {
    return <div className="p-8 text-center">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da plataforma</p>
        </div>
        <Button onClick={handleDownloadReport} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Baixar Relatório
        </Button>
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

      {/* Analytics Chart */}
      <div className="bg-card border border-border/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">Desempenho da Equipe</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Legend />
              <Bar dataKey="concluido" name="Aulas Concluídas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name="Total de Aulas" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Progress Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Progresso Detalhado</h2>
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
