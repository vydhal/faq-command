import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Article, Category } from '@/types';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArticleDetailsDialog } from '@/components/dialogs/ArticleDetailsDialog';

export default function CollaboratorArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { user, isLoading: authLoading } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    
    try {
      // Fetch categories first
      try {
        const categoriesData = await api.categories.list();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // Continue even if categories fail
      }

      // Fetch articles
      const articlesData = await api.articles.list({ userId: user.id });
      setArticles(articlesData);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setError('Não foi possível carregar os artigos. Verifique sua conexão ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (user) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }

    // Force loading to false after 5 seconds to prevent infinite loading
    timeoutId = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          setError('O carregamento demorou muito. Verifique se há extensões bloqueando o acesso.');
          return false;
        }
        return currentLoading;
      });
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [user, authLoading]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsDetailsOpen(true);
  };

  const handleProgressUpdate = () => {
    fetchData();
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || String(article.categoryId) === String(selectedCategory);
    
    switch (activeTab) {
      case 'completed':
        return matchesSearch && matchesCategory && article.isCompleted;
      case 'pending':
        return matchesSearch && matchesCategory && !article.isCompleted;
      default:
        return matchesSearch && matchesCategory;
    }
  });

  const completedCount = articles.filter((a) => a.isCompleted).length;
  const pendingCount = articles.filter((a) => !a.isCompleted).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Carregando artigos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h3 className="text-lg font-semibold">Erro ao carregar</h3>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Artigos</h1>
        <p className="text-muted-foreground">Leia e aprenda com nossos conteúdos</p>
      </div>

      {/* Progress indicator */}
      <div className="glass-card p-4 rounded-xl border border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/20">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="font-medium">Artigos lidos</p>
            <p className="text-sm text-muted-foreground">
              {completedCount} de {articles.length} concluídos
            </p>
          </div>
        </div>
        <div className="text-2xl font-bold text-success">
          {articles.length > 0 ? Math.round((completedCount / articles.length) * 100) : 0}%
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/50"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-secondary/50 border-border/50">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-secondary/50">
          <TabsTrigger value="all">Todos ({articles.length})</TabsTrigger>
          <TabsTrigger value="pending">Pendentes ({pendingCount})</TabsTrigger>
          <TabsTrigger value="completed">Concluídos ({completedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredArticles.length > 0 ? (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum artigo encontrado</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ArticleDetailsDialog 
        article={selectedArticle} 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
}

