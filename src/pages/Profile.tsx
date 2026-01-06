import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';

export default function Profile() {
  const { user, login, refreshUser } = useAuth(); // We might need a way to update user in context
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/upload.php`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setAvatar(data.url);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Update user profile via API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/users.php?id=${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      toast.success('Perfil atualizado com sucesso!');

      // Update context if available
      if (refreshUser) {
        await refreshUser();
      } else {
        // Fallback if refreshUser is not available (shouldn't happen with updated context)
        const updatedUser = { ...user, name, avatar };
        localStorage.setItem('lms_user', JSON.stringify(updatedUser));
        window.location.reload();
      }

    } catch (error) {
      console.error('Update error:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize sua foto e nome de exibição</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-32 h-32 cursor-pointer border-4 border-background shadow-xl">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Alterar Foto
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
