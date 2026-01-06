import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from '@/components/inputs/ImageUpload';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    app_name: 'Command Portal',
    primary_color: '#c9a147',
    logo_url: '',
    favicon_url: '',
    quick_links: '[]' // Stored as JSON string
  });

  const [links, setLinks] = useState<{ label: string, url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.settings.get();
      // Set defaults if missing
      const mergedSettings = {
        app_name: data.app_name || 'Command Portal',
        primary_color: data.primary_color || '#c9a147',
        logo_url: data.logo_url || '',
        favicon_url: data.favicon_url || '',
        quick_links: data.quick_links || '[]'
      };

      setSettings(mergedSettings);

      try {
        const parsedLinks = JSON.parse(mergedSettings.quick_links);
        if (Array.isArray(parsedLinks)) {
          setLinks(parsedLinks);
        }
      } catch (e) {
        console.error("Failed to parse quick links", e);
        setLinks([]);
      }

    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    setLinks([...links, { label: '', url: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const handleSave = async () => {
    try {
      const settingsToSave = {
        ...settings,
        quick_links: JSON.stringify(links)
      };

      await api.settings.update(settingsToSave);

      // Update local state to match saved
      setSettings(settingsToSave);

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });

      // Force reload to apply changes globally (especially colors)
      setTimeout(() => {
        window.location.reload();
      }, 1000);

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
                  placeholder="#c9a147"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Recomendado: #c9a147 (Dourado)
              </p>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links Rápidos (Dashboard)</CardTitle>
            <CardDescription>
              Gerencie os atalhos que aparecem no painel dos colaboradores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {links.map((link, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="grid gap-2 flex-1 sm:flex-row sm:grid-cols-2">
                  <Input
                    placeholder="Nome do Link (ex: Certificados)"
                    value={link.label}
                    onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                  />
                  <Input
                    placeholder="URL (ex: https://...)"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveLink(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button variant="outline" onClick={handleAddLink} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Link
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="w-full sm:w-auto bg-gradient-primary hover:opacity-90">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
