import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { useUpdateFollowUpTexts, type FollowUpLead } from '@/hooks/useFollowUpsAgendados';
import { formatPhoneBR } from '@/components/chat/utils';

interface EditarTextosModalProps {
  lead: FollowUpLead | null;
  onClose: () => void;
}

export function EditarTextosModal({ lead, onClose }: EditarTextosModalProps) {
  const [fu1, setFu1] = useState('');
  const [fu2, setFu2] = useState('');
  const updateTexts = useUpdateFollowUpTexts();

  useEffect(() => {
    if (lead) {
      setFu1(lead.followup_1 ?? '');
      setFu2(lead.followup_2 ?? '');
    }
  }, [lead]);

  const handleSave = () => {
    if (!lead) return;
    updateTexts.mutate(
      { id: lead.id, followup_1: fu1, followup_2: fu2 },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar textos de follow-up</DialogTitle>
          {lead && (
            <DialogDescription>
              {lead.nome_lead || 'Sem nome'} · {formatPhoneBR(String(lead.telefone))}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="fu1" className="text-ink">Follow-up 1</Label>
            <Textarea
              id="fu1"
              value={fu1}
              onChange={(e) => setFu1(e.target.value)}
              rows={4}
              className="mt-1.5 resize-none"
            />
          </div>

          <div>
            <Label htmlFor="fu2" className="text-ink">Follow-up 2</Label>
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
          <Button type="button" variant="outline" onClick={onClose} disabled={updateTexts.isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateTexts.isPending}
            className="bg-brand hover:bg-brand-hover"
          >
            {updateTexts.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
