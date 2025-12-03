import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Code, TrendingUp, Palette, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const iconMap: Record<string, React.ElementType> = {
  Code,
  TrendingUp,
  Palette,
  Users,
};

const colorMap: Record<string, string> = {
  primary: 'bg-primary/20 text-primary',
  accent: 'bg-accent/20 text-accent',
  warning: 'bg-warning/20 text-warning',
  success: 'bg-success/20 text-success',
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: 'Code',
    color: 'primary'
  });

  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      const data = await api.categories.list();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await api.categories.update(editingCategory.id, newCategory);
        toast({ title: "Sucesso", description: "Categoria atualizada com sucesso!" });
      } else {
        await api.categories.create(newCategory);
        toast({ title: "Sucesso", description: "Categoria criada com sucesso!" });
      }
      setIsDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar categoria.",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await api.categories.delete(id);
      toast({ title: "Sucesso", description: "Categoria excluída com sucesso!" });
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir categoria.",
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setNewCategory({ name: '', description: '', icon: 'Code', color: 'primary' });
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">Organize seus cursos e artigos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  value={newCategory.name} 
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  placeholder="Ex: Desenvolvimento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input 
                  id="description" 
                  value={newCategory.description} 
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  placeholder="Descrição da categoria"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <Select 
                    value={newCategory.icon} 
                    onValueChange={(value) => setNewCategory({...newCategory, icon: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Code">Code</SelectItem>
                      <SelectItem value="TrendingUp">TrendingUp</SelectItem>
                      <SelectItem value="Palette">Palette</SelectItem>
                      <SelectItem value="Users">Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Select 
                    value={newCategory.color} 
                    onValueChange={(value) => setNewCategory({...newCategory, color: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="accent">Accent</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveCategory} className="w-full">
                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Code;
          
          return (
            <div
              key={category.id}
              className="glass-card p-6 rounded-xl border border-border/50 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn('p-3 rounded-xl', colorMap[category.color])}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {category.coursesCount} cursos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

