import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { FollowUpLead } from './mockFollowUps';

interface EditarTextosModalProps {
  lead: FollowUpLead | null;
  onClose: () => void;
  onSave: (id: string, fu1: string, fu2: string) => void;
}

export function EditarTextosModal({ lead, onClose, onSave }: EditarTextosModalProps) {
  const [fu1, setFu1] = useState('');
  const [fu2, setFu2] = useState('');

  useEffect(() => {
    if (lead) {
      setFu1(lead.followup_1);
      setFu2(lead.followup_2);
    }
  }, [lead]);

  const handleSave = () => {
    if (!lead) return;
    onSave(lead.id, fu1, fu2);
    toast.success('Textos atualizados', {
      description: 'Em breve esta edição persistirá no banco (Fase B).',
    });
    onClose();
  };

  return (
    <Dialog open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar textos de follow-up</DialogTitle>
          {lead && (
            <DialogDescription>
              {lead.nome} · {lead.telefone}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="fu1" className="text-ink">
              Follow-up 1
            </Label>
            <Textarea
              id="fu1"
              value={fu1}
              onChange={(e) => setFu1(e.target.value)}
              rows={4}
              className="mt-1.5 resize-none"
            />
          </div>

          <div>
            <Label htmlFor="fu2" className="text-ink">
              Follow-up 2
            </Label>
            <Textarea
              id="fu2"
              value={fu2}
              onChange={(e) => setFu2(e.target.value)}
              rows={4}
              className="mt-1.5 resize-none"
            />
          </div>

          <p className="text-xs text-ink-muted">
            Estes textos foram gerados automaticamente pelo agente observador com base no
            contexto da conversa. Você pode editá-los antes do disparo.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} className="bg-brand hover:bg-brand-hover">
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
