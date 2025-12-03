import { useState } from 'react';
import { faqs } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Search, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function CollaboratorFAQs() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, typeof faqs>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-6 rounded-xl border border-border/50 bg-gradient-hero">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Perguntas Frequentes</h1>
            <p className="text-muted-foreground">
              Encontre respostas para suas dúvidas
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar perguntas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-secondary/50 border-border/50"
        />
      </div>

      {/* FAQs by Category */}
      {Object.keys(groupedFaqs).length > 0 ? (
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
                      <span className="text-left font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma pergunta encontrada</p>
        </div>
      )}
    </div>
  );
}
