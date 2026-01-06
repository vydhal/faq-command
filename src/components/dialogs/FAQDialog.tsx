import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { FAQ } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface FAQDialogProps {
    isOpen: boolean;
    onClose: () => void;
    faqToEdit?: FAQ | null;
    onSuccess: () => void;
}

export function FAQDialog({ isOpen, onClose, faqToEdit, onSuccess }: FAQDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        question: "",
        answer: "",
        category: "Geral",
    });

    useEffect(() => {
        if (faqToEdit) {
            setFormData({
                question: faqToEdit.question,
                answer: faqToEdit.answer,
                category: faqToEdit.category,
            });
        } else {
            setFormData({
                question: "",
                answer: "",
                category: "Geral",
            });
        }
    }, [faqToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (faqToEdit) {
                await api.faqs.update(faqToEdit.id, formData);
                toast({ title: "Sucesso", description: "FAQ atualizada com sucesso!" });
            } else {
                await api.faqs.create(formData);
                toast({ title: "Sucesso", description: "FAQ criada com sucesso!" });
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save FAQ:", error);
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Falha ao salvar FAQ."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{faqToEdit ? "Editar FAQ" : "Nova FAQ"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="question">Pergunta</Label>
                        <Input
                            id="question"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoria</Label>
                        <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Ex: Geral, Financeiro, Suporte"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="answer">Resposta</Label>
                        <Textarea
                            id="answer"
                            value={formData.answer}
                            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                            required
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
