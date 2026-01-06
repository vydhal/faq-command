import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Article, Category } from '@/types';
import { ArticleCard } from '@/components/cards/ArticleCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from '@/components/inputs/ImageUpload';
import { RichTextEditor } from '@/components/inputs/RichTextEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    readTime: '5 min',
    thumbnail: ''
  });

  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [articlesData, categoriesData] = await Promise.all([
        api.articles.list(),
        api.categories.list()
      ]);
      setArticles(articlesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    fetchData();

    // Force loading to false after 5 seconds to prevent infinite loading
    timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleSaveArticle = async () => {
    try {
      if (editingArticle) {
        await api.articles.update(editingArticle.id, newArticle);
        toast({ title: "Sucesso", description: "Artigo atualizado com sucesso!" });
      } else {
        await api.articles.create(newArticle);
        toast({ title: "Sucesso", description: "Artigo criado com sucesso!" });
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save article:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar artigo.",
      });
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
    
    try {
      await api.articles.delete(id);
      toast({ title: "Sucesso", description: "Artigo excluído com sucesso!" });
      fetchData();
    } catch (error) {
      console.error('Failed to delete article:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir artigo.",
      });
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setNewArticle({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      categoryId: article.categoryId,
      readTime: article.readTime,
      thumbnail: article.thumbnail
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingArticle(null);
    setNewArticle({
      title: '',
      content: '',
      excerpt: '',
      categoryId: '',
      readTime: '5 min',
      thumbnail: ''
    });
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.categoryId === selectedCategory;
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
          <h1 className="text-2xl font-bold">Artigos</h1>
          <p className="text-muted-foreground">Gerencie os artigos e conteúdos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Artigo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? 'Editar Artigo' : 'Novo Artigo'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input 
                  id="title" 
                  value={newArticle.title} 
                  onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                  placeholder="Título do artigo"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoria</Label>
                  <Select 
                    value={newArticle.categoryId} 
                    onValueChange={(value) => setNewArticle({...newArticle, categoryId: value})}
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
                <div className="space-y-2">
                  <Label htmlFor="readTime">Tempo de Leitura</Label>
                  <Input 
                    id="readTime" 
                    value={newArticle.readTime} 
                    onChange={(e) => setNewArticle({...newArticle, readTime: e.target.value})}
                    placeholder="Ex: 5 min"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumo</Label>
                <Textarea 
                  id="excerpt" 
                  value={newArticle.excerpt} 
                  onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})}
                  placeholder="Breve resumo do artigo"
                />
              </div>

              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <RichTextEditor
                  value={newArticle.content}
                  onChange={(value) => setNewArticle({...newArticle, content: value})}
                  placeholder="Escreva o conteúdo do artigo..."
                />
              </div>

              <div className="space-y-2">
                <Label>Imagem de Capa</Label>
                <ImageUpload
                  value={newArticle.thumbnail}
                  onChange={(url) => setNewArticle({...newArticle, thumbnail: url})}
                />
              </div>

              <Button onClick={handleSaveArticle} className="w-full">
                {editingArticle ? 'Salvar Alterações' : 'Criar Artigo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

      {/* Articles List */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {filteredArticles.length} artigo(s) encontrado(s)
        </p>
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <div key={article.id} className="relative group">
              <ArticleCard article={article} />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-md">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditArticle(article)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteArticle(article.id)}>
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

