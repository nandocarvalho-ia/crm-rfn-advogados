import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Bot,
  Loader2,
  MessageSquare,
  Save,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { CategoryBadge, classifyCategoria, PlatformBadge, parseCampanha } from '@/components/common';
import { supabase } from '@/integrations/supabase/client';
import { useIABlockControl } from '@/hooks/useIABlockControl';
import { formatPhoneBR } from '@/components/chat/utils';
import type { LeadRoger } from '@/hooks/useLeadsRoger';
import { cn } from '@/lib/utils';
import { ObservacoesList } from './ObservacoesList';

const CATEGORIAS = [
  'NÃO CLASSIFICADO',
  'POTENCIAL BOM',
  'BOM',
  'POTENCIAL EXCELENTE',
  'EXCELENTE',
  'DESQUALIFICADO',
] as const;

const STATUS = [
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

interface EditableFields {
  nome_lead: string;
  email: string;
  estado: string;
  categoria_lead: string;
  status_lead: string;
  tipo_caso: string;
  tipo_financiamento: string;
  status_imovel: string;
  valor_pago: string;
  valor_estimado_recuperacao: string;
}

const fromLead = (l: LeadRoger): EditableFields => ({
  nome_lead: l.nome_lead ?? '',
  email: l.email ?? '',
  estado: l.estado ?? '',
  categoria_lead: l.categoria_lead ?? '',
  status_lead: l.status_lead ?? '',
  tipo_caso: l.tipo_caso ?? '',
  tipo_financiamento: l.tipo_financiamento ?? '',
  status_imovel: l.status_imovel ?? '',
  valor_pago: l.valor_pago != null ? String(l.valor_pago) : '',
  valor_estimado_recuperacao:
    l.valor_estimado_recuperacao != null ? String(l.valor_estimado_recuperacao) : '',
});

const parseNumber = (s: string): number | null => {
  if (!s || !s.trim()) return null;
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const fmtMoneyView = (v: number | string | null | undefined) => {
  const n = typeof v === 'number' ? v : parseNumber(String(v ?? ''));
  if (!n) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
};

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

interface LeadDetailsModalProps {
  lead: LeadRoger | null;
  onClose: () => void;
}

export function LeadDetailsModal({ lead, onClose }: LeadDetailsModalProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toggleIA, isLoading: isIALoading } = useIABlockControl();

  const [form, setForm] = useState<EditableFields | null>(null);
  const [newObs, setNewObs] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (lead) {
      setForm(fromLead(lead));
      setNewObs('');
      setConfirmDelete(false);
    }
  }, [lead?.id]);

  const hasChanges = useMemo(() => {
    if (!lead || !form) return false;
    const initial = fromLead(lead);
    return (Object.keys(initial) as (keyof EditableFields)[]).some(
      (k) => (form[k] ?? '') !== (initial[k] ?? ''),
    );
  }, [lead, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditableFields) => {
      if (!lead) return;
      // Auto-ajusta status_qualificacao conforme CRMDashboardReal
      let autoStatusQualif = lead.status_qualificacao;
      if (data.categoria_lead === 'POTENCIAL EXCELENTE' || data.categoria_lead === 'EXCELENTE') {
        autoStatusQualif = 'transferido';
      } else if (data.categoria_lead === 'DESQUALIFICADO') {
        autoStatusQualif = 'desqualificado';
      }
      const { error } = await supabase
        .from('leads_roger')
        .update({
          nome_lead: data.nome_lead || null,
          email: data.email || null,
          estado: data.estado || null,
          categoria_lead: data.categoria_lead || null,
          status_lead: data.status_lead || null,
          tipo_caso: data.tipo_caso || null,
          tipo_financiamento: data.tipo_financiamento || null,
          status_imovel: data.status_imovel || null,
          valor_pago: parseNumber(data.valor_pago),
          valor_estimado_recuperacao: parseNumber(data.valor_estimado_recuperacao),
          status_qualificacao: autoStatusQualif,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lead.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
      toast.success('Lead atualizado');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao salvar', { description: msg });
    },
  });

  const addObsMutation = useMutation({
    mutationFn: async (conteudo: string) => {
      if (!lead) return;
      const { error } = await supabase.from('interacoes').insert({
        lead_id: lead.id,
        tipo: 'nota',
        conteudo,
        enviada_por: 'CRM',
        direção: 'interna',
        status: 'registrada',
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-observacoes', lead?.id] });
      setNewObs('');
      toast.success('Observação adicionada');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao adicionar observação', { description: msg });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!lead) return;
      const { error } = await supabase
        .from('leads_roger')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', lead.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
      toast.success('Lead excluído');
      setConfirmDelete(false);
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao excluir', { description: msg });
    },
  });

  if (!lead || !form) {
    return (
      <Dialog open={!!lead} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const isIAPaused = lead.atendente === 'HUMANO';
  const { platform } = parseCampanha(lead.campanha);
  const group = classifyCategoria(lead.categoria_lead);
  const loading = isIALoading(String(lead.telefone));

  const setField = <K extends keyof EditableFields>(key: K, v: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: v } : prev));

  const handleOpenChat = () => {
    navigate(`/chat-ao-vivo?session=${lead.telefone}`);
    onClose();
  };

  const handleToggleIA = () => {
    toggleIA(String(lead.telefone), lead.nome_lead, isIAPaused);
  };

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const handleAddObs = () => {
    const t = newObs.trim();
    if (!t) return;
    addObsMutation.mutate(t);
  };

  return (
    <>
      <Dialog open={!!lead} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0">
          {/* Header */}
          <DialogHeader className="sticky top-0 z-10 bg-app-card border-b border-line px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl font-semibold text-ink truncate">
                  {lead.nome_lead || 'Sem nome'}
                </DialogTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-secondary">
                  <span>{formatPhoneBR(String(lead.telefone))}</span>
                  {lead.estado && <span>· {lead.estado}</span>}
                  <PlatformBadge platform={platform} />
                  <CategoryBadge group={group} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant={isIAPaused ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleIA}
                  disabled={loading}
                  className={cn('gap-1.5', isIAPaused && 'bg-brand hover:bg-brand-hover')}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isIAPaused ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  {isIAPaused ? 'Retomar IA' : 'Pausar IA'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleOpenChat} className="gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  Abrir chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="gap-1.5 text-tag-danger hover:text-tag-danger hover:bg-tag-danger-bg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="px-6 py-5 space-y-6">
            {/* Bloco 1: identificação */}
            <Section title="Identificação">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nome">
                  <Input value={form.nome_lead} onChange={(e) => setField('nome_lead', e.target.value)} />
                </Field>
                <Field label="Telefone (não editável)">
                  <Input value={formatPhoneBR(String(lead.telefone))} disabled />
                </Field>
                <Field label="Email">
                  <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                </Field>
                <Field label="Estado">
                  <Select value={form.estado} onValueChange={(v) => setField('estado', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {UFS.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Section>

            {/* Bloco 2: classificação */}
            <Section title="Classificação">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Categoria">
                  <Select value={form.categoria_lead} onValueChange={(v) => setField('categoria_lead', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={form.status_lead} onValueChange={(v) => setField('status_lead', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {STATUS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Tipo de caso">
                  <Select value={form.tipo_caso} onValueChange={(v) => setField('tipo_caso', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {TIPO_CASO.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Tipo de financiamento">
                  <Input value={form.tipo_financiamento} onChange={(e) => setField('tipo_financiamento', e.target.value)} />
                </Field>
                <Field label="Status do imóvel">
                  <Input value={form.status_imovel} onChange={(e) => setField('status_imovel', e.target.value)} />
                </Field>
              </div>
            </Section>

            {/* Bloco 3: valores */}
            <Section title="Valores">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Valor pago">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valor_pago}
                    onChange={(e) => setField('valor_pago', e.target.value)}
                    placeholder="0,00"
                  />
                </Field>
                <Field label="Valor estimado de recuperação">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valor_estimado_recuperacao}
                    onChange={(e) => setField('valor_estimado_recuperacao', e.target.value)}
                    placeholder="0,00"
                  />
                </Field>
              </div>
            </Section>

            {/* Análise da IA */}
            {lead.resumo_ia && (
              <Section title="Análise da IA" icon={<Sparkles className="h-4 w-4 text-brand" />}>
                <div className="rounded-lg bg-brand-light/60 border border-brand/20 p-4 text-sm text-ink leading-relaxed whitespace-pre-wrap">
                  {lead.resumo_ia}
                </div>
              </Section>
            )}

            {/* Observações */}
            <Section title="Observações">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nova-obs" className="text-sm">Nova observação</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="nova-obs"
                      value={newObs}
                      onChange={(e) => setNewObs(e.target.value)}
                      rows={2}
                      placeholder="Anote um retorno, resumo de call, pendência..."
                      className="resize-none"
                    />
                    <Button
                      type="button"
                      onClick={handleAddObs}
                      disabled={!newObs.trim() || addObsMutation.isPending}
                      className="self-start bg-brand hover:bg-brand-hover"
                    >
                      {addObsMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Adicionar'
                      )}
                    </Button>
                  </div>
                </div>
                <ObservacoesList leadId={lead.id} />
              </div>
            </Section>

            {/* Motivo desqualificação */}
            {lead.motivo_desqualificacao && (
              <Section title="Motivo da desqualificação">
                <div className="rounded-lg bg-tag-danger-bg/60 border border-tag-danger/20 p-4 text-sm text-tag-danger leading-relaxed whitespace-pre-wrap">
                  {lead.motivo_desqualificacao}
                </div>
              </Section>
            )}

            {/* Meta info */}
            <Section title="Informações">
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <MetaItem label="Valor pago atual" value={fmtMoneyView(lead.valor_pago)} />
                <MetaItem label="Potencial estimado" value={fmtMoneyView(lead.valor_estimado_recuperacao)} />
                <MetaItem label="Data da compra" value={lead.data_compra ? fmtDate(lead.data_compra) : '—'} />
                <MetaItem label="Criado em" value={fmtDate(lead.created_at)} />
                <MetaItem label="Convertido em" value={lead.data_conversao ? fmtDate(lead.data_conversao) : '—'} />
                <MetaItem label="Campanha" value={lead.campanha ?? '—'} />
              </dl>
            </Section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-app-card border-t border-line px-6 py-3 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">
              {hasChanges
                ? 'Você tem alterações não salvas'
                : 'Nenhuma alteração pendente'}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updateMutation.isPending}
                className="bg-brand hover:bg-brand-hover gap-1.5"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
            <AlertDialogDescription>
              O lead <span className="font-medium">{lead.nome_lead || 'Sem nome'}</span> será
              marcado como excluído (soft delete) e não aparecerá mais nas listagens. Essa
              ação pode ser revertida apenas via banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-tag-danger hover:bg-tag-danger/90"
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink border-b border-line pb-2">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-ink-secondary">{label}</Label>
      {children}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-ink font-medium">{value}</dd>
    </div>
  );
}
