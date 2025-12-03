import { faqs } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function AdminFAQs() {
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, typeof faqs>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Perguntas Frequentes</h1>
          <p className="text-muted-foreground">Gerencie as FAQs da plataforma</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Pergunta
        </Button>
      </div>

      {/* FAQs by Category */}
      <div className="space-y-6">
        {Object.entries(groupedFaqs).map(([category, items]) => (
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
                    <p className="text-muted-foreground mb-4">{faq.answer}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Pencil className="w-3.5 h-3.5 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
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
        ))}
      </div>
    </div>
  );
}
