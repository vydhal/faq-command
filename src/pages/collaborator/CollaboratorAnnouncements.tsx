import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'high' | 'urgent';
  created_at: string;
  is_read: boolean;
}

export default function CollaboratorAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  const fetchAnnouncements = async () => {
    if (!user) return;
    try {
      const data = await api.announcements.list(user.id);
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const handleRead = async (announcement: Announcement) => {
    if (!user || announcement.is_read) return;
    try {
      await api.announcements.markRead(user.id, announcement.id);
      setAnnouncements(prev => 
        prev.map(a => a.id === announcement.id ? { ...a, is_read: true } : a)
      );
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'read' ? a.is_read :
      !a.is_read;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Comunicados</h1>
        <p className="text-muted-foreground">Fique por dentro das novidades e avisos importantes</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comunicados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/50"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-secondary/50 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unread">Não lidos</SelectItem>
            <SelectItem value="read">Lidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            onClick={() => setSelectedAnnouncement(announcement)}
            className={`glass-card p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
              !announcement.is_read ? 'border-primary/50 bg-primary/5' : 'border-border/50 opacity-75'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg border ${getPriorityColor(announcement.priority)}`}>
                {getPriorityIcon(announcement.priority)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${!announcement.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {announcement.title}
                  </h3>
                  {!announcement.is_read && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      Novo
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {announcement.content}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {announcement.is_read && (
              <CheckCircle2 className="w-5 h-5 text-success opacity-50" />
            )}
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum comunicado encontrado
          </div>
        )}
      </div>

      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAnnouncement?.title}
              {selectedAnnouncement?.priority === 'urgent' && (
                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-full border border-red-500/20">
                  Urgente
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-muted-foreground whitespace-pre-wrap">
            {selectedAnnouncement?.content}
          </div>

          <DialogFooter>
            <Button 
              className="w-full sm:w-auto" 
              onClick={() => selectedAnnouncement && handleRead(selectedAnnouncement)}
              disabled={selectedAnnouncement?.is_read}
            >
              {selectedAnnouncement?.is_read ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Lido
                </>
              ) : (
                'Confirmar Leitura'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
