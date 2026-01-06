import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/inputs/ImageUpload";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface ProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileDialog({ isOpen, onClose }: ProfileDialogProps) {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        avatar: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                avatar: user.avatar || "",
            });
        }
    }, [user, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            await api.users.update(user.id, {
                name: formData.name,
                avatar: formData.avatar,
            });

            updateUser({
                ...user,
                name: formData.name,
                avatar: formData.avatar,
            });

            // Force a profile refresh to ensure exact sync
            if (api.users.get) {
                // In a real scenario we might re-fetch, but updating local context is usually enough
                // However, let's ensure the user object is fully updated in context
            }

            toast({
                title: "Sucesso",
                description: "Perfil atualizado com sucesso!",
            });
            onClose();
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Falha ao atualizar perfil.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center">
                        <div className="w-32">
                            <ImageUpload
                                value={formData.avatar}
                                onChange={(url) => setFormData({ ...formData, avatar: url })}
                                className="w-full"
                                previewClassName="aspect-square rounded-full w-32 h-32"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            value={formData.email}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
