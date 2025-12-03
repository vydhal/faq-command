import { useState } from 'react';
import { progressMetrics } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, MoreVertical, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = progressMetrics.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os colaboradores</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-secondary/50 border-border/50"
        />
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          const progress = Math.round(
            ((user.completedCourses / user.totalCourses) * 50) +
            ((user.completedArticles / user.totalArticles) * 50)
          );

          return (
            <div
              key={user.userId}
              className="glass-card p-4 sm:p-6 rounded-xl border border-border/50"
            >
              <div className="flex items-start gap-4">
                <img
                  src={user.userAvatar}
                  alt={user.userName}
                  className="w-12 h-12 rounded-full bg-secondary flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{user.userName}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          colaborador@empresa.com
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Último acesso: {format(user.lastActivity, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remover acesso
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Cursos</p>
                      <p className="font-semibold">{user.completedCourses}/{user.totalCourses}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Artigos</p>
                      <p className="font-semibold">{user.completedArticles}/{user.totalArticles}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nota Média</p>
                      <p className="font-semibold text-success">{user.averageScore}%</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso geral</span>
                      <span className="font-medium text-primary">{progress}%</span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2"
                      indicatorClassName="bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
