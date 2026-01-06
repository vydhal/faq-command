import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { api } from '@/services/api';
import { FAQ } from '@/types';
import { FAQDialog } from '@/components/dialogs/FAQDialog';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const { toast } = useToast();

  const fetchFaqs = async () => {
    try {
      const data = await api.faqs.list();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar FAQs."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleEdit = (faq: FAQ) => {
    setSelectedFaq(faq);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedFaq(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!faqToDelete) return;

    try {
      await api.faqs.delete(faqToDelete.id);
      toast({ title: "Sucesso", description: "FAQ excluída com sucesso!" });
      fetchFaqs();
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir FAQ."
      });
    } finally {
      setFaqToDelete(null);
    }
  };

  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, typeof faqs>);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Perguntas Frequentes</h1>
          <p className="text-muted-foreground">Gerencie as FAQs da plataforma</p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Pergunta
        </Button>
      </div>

      {/* FAQs by Category */}
      <div className="space-y-6">
        {Object.keys(groupedFaqs).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed">
            Nenhuma pergunta frequente cadastrada.
          </div>
        ) : (
          Object.entries(groupedFaqs).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {category}
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {items.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="glass-card border border-border/50 rounded-xl px-4 data-[state=open]:shadow-glow-sm"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between flex-1 pr-4">
                        <span className="text-left font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{faq.answer}</p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(faq)}>
                          <Pencil className="w-3.5 h-3.5 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setFaqToDelete(faq)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        )}
      </div>

      <FAQDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        faqToEdit={selectedFaq}
        onSuccess={fetchFaqs}
      />

      <AlertDialog open={!!faqToDelete} onOpenChange={(open) => !open && setFaqToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Pergunta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
