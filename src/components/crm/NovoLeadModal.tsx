import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { getEstadoFromTelefone } from '@/lib/utils';

const CATEGORIAS = [
  'NÃO CLASSIFICADO',
  'POTENCIAL BOM',
  'BOM',
  'POTENCIAL EXCELENTE',
  'EXCELENTE',
  'DESQUALIFICADO',
] as const;

const STATUS_OPCOES = [
  { value: 'novo', label: 'Novo' },
  { value: 'conversando', label: 'Conversando' },
  { value: 'proposta_enviada', label: 'Proposta Enviada' },
  { value: 'convertido', label: 'Convertido' },
] as const;
const TIPO_CASO = ['lote', 'cota'] as const;

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

interface FormState {
  telefone: string;
  nome_lead: string;
  email: string;
  estado: string;
  categoria_lead: string;
  status_lead: string;
  tipo_caso: string;
  valor_pago: string;
  valor_estimado_recuperacao: string;
  observacoes: string;
}

const INITIAL: FormState = {
  telefone: '',
  nome_lead: '',
  email: '',
  estado: '',
  categoria_lead: 'NÃO CLASSIFICADO',
  status_lead: 'novo',
  tipo_caso: '',
  valor_pago: '',
  valor_estimado_recuperacao: '',
  observacoes: '',
};

const parseNumber = (s: string): number | null => {
  if (!s || !s.trim()) return null;
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/**
 * Normaliza telefone:
 *  - remove não-dígitos
 *  - se tiver 10 ou 11 dígitos (DDD+número), prepend '55'
 *  - aceita 12 ou 13 dígitos (já com 55)
 */
function normalizeTelefone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return '55' + digits;
  if (digits.length === 12 || digits.length === 13) return digits;
  return null;
}

interface NovoLeadModalProps {
  open: boolean;
  onClose: () => void;
}

export function NovoLeadModal({ open, onClose }: NovoLeadModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [estadoTouched, setEstadoTouched] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(INITIAL);
      setErrors({});
      setEstadoTouched(false);
    }
  }, [open]);

  // Auto-detecta estado a partir do telefone (se não foi editado manualmente)
  useEffect(() => {
    if (estadoTouched) return;
    const tel = normalizeTelefone(form.telefone);
    if (tel) {
      const uf = getEstadoFromTelefone(tel);
      if (uf && uf !== form.estado) {
        setForm((p) => ({ ...p, estado: uf }));
      }
    }
  }, [form.telefone, estadoTouched]);

  const setField = <K extends keyof FormState>(k: K, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormState) => {
      const tel = normalizeTelefone(data.telefone);
      if (!tel) throw new Error('Telefone inválido. Informe DDD + número.');

      // Duplicidade
      const { data: existing } = await supabase
        .from('leads_roger')
        .select('id, nome_lead')
        .eq('telefone', Number(tel))
        .is('deleted_at', null)
        .maybeSingle();
      if (existing) {
        throw new Error(
          `Já existe um lead com este telefone${existing.nome_lead ? ` (${existing.nome_lead})` : ''}.`,
        );
      }

      // Auto status_qualificacao
      let autoStatusQualif = 'qualificando';
      if (
        data.categoria_lead === 'POTENCIAL EXCELENTE' ||
        data.categoria_lead === 'EXCELENTE'
      ) {
        autoStatusQualif = 'transferido';
      } else if (data.categoria_lead === 'DESQUALIFICADO') {
        autoStatusQualif = 'desqualificado';
      }

      const { data: inserted, error } = await supabase
        .from('leads_roger')
        .insert({
          telefone: Number(tel),
          nome_lead: data.nome_lead || null,
          email: data.email || null,
          estado: data.estado || getEstadoFromTelefone(tel) || null,
          categoria_lead: data.categoria_lead || null,
          status_lead: data.status_lead || null,
          tipo_caso: data.tipo_caso || null,
          valor_pago: parseNumber(data.valor_pago),
          valor_estimado_recuperacao: parseNumber(data.valor_estimado_recuperacao),
          status_qualificacao: autoStatusQualif,
          instancia: 'roger',
        } as any)
        .select('id')
        .single();
      if (error) throw error;

      // Observação inicial (opcional)
      if (data.observacoes.trim() && inserted?.id) {
        await supabase.from('interacoes').insert({
          lead_id: inserted.id,
          tipo: 'nota',
          conteudo: data.observacoes.trim(),
          enviada_por: 'CRM',
          direção: 'interna',
          status: 'registrada',
        } as any);
      }

      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
      toast.success('Lead criado com sucesso');
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao criar lead', { description: msg });
    },
  });

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.nome_lead.trim()) errs.nome_lead = 'Obrigatório';
    if (!normalizeTelefone(form.telefone)) {
      errs.telefone = 'Informe DDD + número (10 ou 11 dígitos)';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Email inválido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createMutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand" />
            Novo lead
          </DialogTitle>
          <DialogDescription>
            Insira os dados do lead manualmente. Telefone é obrigatório e será usado para
            impedir duplicidades.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
          <Field label="Telefone *" error={errors.telefone} description="DDD + número (ex: 11987231144)">
            <Input
              value={form.telefone}
              onChange={(e) => setField('telefone', e.target.value)}
              placeholder="11987231144"
              inputMode="numeric"
            />
          </Field>
          <Field label="Nome *" error={errors.nome_lead}>
            <Input
              value={form.nome_lead}
              onChange={(e) => setField('nome_lead', e.target.value)}
              placeholder="Nome completo"
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="cliente@email.com"
            />
          </Field>
          <Field label="Estado (auto-detectado pelo DDD)">
            <Select
              value={form.estado}
              onValueChange={(v) => {
                setField('estado', v);
                setEstadoTouched(true);
              }}
            >
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {UFS.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Categoria">
            <Select
              value={form.categoria_lead}
              onValueChange={(v) => setField('categoria_lead', v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status_lead} onValueChange={(v) => setField('status_lead', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPCOES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Tipo de caso">
            <Select value={form.tipo_caso} onValueChange={(v) => setField('tipo_caso', v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {TIPO_CASO.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Valor pago">
            <Input
              type="number"
              step="0.01"
              value={form.valor_pago}
              onChange={(e) => setField('valor_pago', e.target.value)}
              placeholder="0,00"
            />
          </Field>

          <Field label="Valor estimado de recuperação" className="md:col-span-2">
            <Input
              type="number"
              step="0.01"
              value={form.valor_estimado_recuperacao}
              onChange={(e) => setField('valor_estimado_recuperacao', e.target.value)}
              placeholder="0,00"
            />
          </Field>

          <Field label="Observação inicial (opcional)" className="md:col-span-2">
            <Textarea
              rows={3}
              value={form.observacoes}
              onChange={(e) => setField('observacoes', e.target.value)}
              placeholder="Anote qualquer contexto inicial — será salvo como nota."
              className="resize-none"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-brand hover:bg-brand-hover gap-1.5"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  description,
  className,
  children,
}: {
  label: string;
  error?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-ink-secondary">{label}</Label>
      <div className="mt-1">{children}</div>
      {description && !error && (
        <p className="mt-1 text-[11px] text-ink-muted">{description}</p>
      )}
      {error && <p className="mt-1 text-[11px] text-tag-danger">{error}</p>}
    </div>
  );
}
