import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreVertical, Mail, Calendar, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserDialog } from '@/components/dialogs/UserDialog';
import { User } from '@/types';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await api.users.list();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (data: any) => {
    try {
      if (selectedUser) {
        await api.users.update(selectedUser.id, data);
        toast.success('Usuário atualizado com sucesso');
      } else {
        await api.users.create(data);
        toast.success('Usuário criado com sucesso');
      }
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Erro ao salvar usuário');
      throw error;
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await api.users.delete(id);
      toast.success('Usuário excluído com sucesso');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleNewClick = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os colaboradores</p>
        </div>
        <Button onClick={handleNewClick} className="bg-gradient-primary hover:opacity-90">
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
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum usuário encontrado.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="glass-card p-4 sm:p-6 rounded-xl border border-border/50"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          {user.role === 'admin' ? 'Administrador' : 'Colaborador'}
                        </span>
                        {user.createdAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(user)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <UserDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}
