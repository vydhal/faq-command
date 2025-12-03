import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from '@/components/inputs/ImageUpload';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    app_name: '',
    primary_color: '#0f172a',
    logo_url: '',
    favicon_url: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.settings.get();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.settings.update(settings);
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
      // Force reload to apply changes globally
      window.location.reload();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar configurações.",
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Personalização</h1>
        <p className="text-muted-foreground">Personalize a aparência da plataforma</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Identidade Visual</CardTitle>
            <CardDescription>
              Configure o nome, logo e cores da sua plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="app_name">Nome da Plataforma</Label>
              <Input
                id="app_name"
                value={settings.app_name}
                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                placeholder="Ex: Minha Escola"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <ImageUpload
                value={settings.logo_url}
                onChange={(url) => setSettings({ ...settings, logo_url: url })}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: PNG transparente, max 2MB.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Favicon</Label>
              <ImageUpload
                value={settings.favicon_url}
                onChange={(url) => setSettings({ ...settings, favicon_url: url })}
              />
              <p className="text-xs text-muted-foreground">
                Ícone que aparece na aba do navegador. Recomendado: 32x32px.
              </p>
            </div>

            <Button onClick={handleSave} className="w-full sm:w-auto">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
