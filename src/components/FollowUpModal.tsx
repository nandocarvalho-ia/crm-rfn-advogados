import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Play, Pause, Square, Edit2, Save, X, MessageCircle, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFollowUpManager } from '@/hooks/useFollowUpManager';
import { FollowUpSuggestion } from '@/types/followup';
import { LeadRoger } from '@/hooks/useLeadsRoger';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadRoger | null;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  isOpen,
  onClose,
  lead,
}) => {
  const {
    followUpData,
    isLoading,
    isAnalyzing,
    analyzeConversation,
    updateFollowUp,
    toggleFollowUpStatus,
    updateCustomConfig,
    calculateSendDates,
    isUpdating,
  } = useFollowUpManager(lead?.telefone);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Estados dos follow-ups
  const [followUps, setFollowUps] = useState<FollowUpSuggestion[]>([]);

  useEffect(() => {
    if (followUpData?.sugestoes_ia?.followups) {
      const suggestedFollowUps = followUpData.sugestoes_ia.followups;
      const withDates = calculateSendDates(suggestedFollowUps);
      setFollowUps(withDates);
    }
  }, [followUpData, calculateSendDates]);

  const handleAnalyze = async () => {
    if (!lead?.telefone || !lead?.nome_lead) return;
    
    try {
      await analyzeConversation(lead.telefone, lead.nome_lead);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Erro na análise:', error);
    }
  };

  const handleSaveEdit = (index: number) => {
    if (editText && editDate) {
      const updatedFollowUps = [...followUps];
      updatedFollowUps[index] = {
        ...updatedFollowUps[index],
        texto: editText,
        data_envio: editDate.toISOString(),
      };
      setFollowUps(updatedFollowUps);
      
      // Salvar no banco
      updateCustomConfig({
        followups_personalizados: updatedFollowUps,
      });
    }
    setEditingIndex(null);
    setEditText('');
    setEditDate(undefined);
  };

  const getSituationBadge = (situacao: string) => {
    const badges = {
      'parou_responder': { label: 'Parou de Responder', color: 'bg-yellow-500' },
      'dar_retorno': { label: 'Prometeu Retorno', color: 'bg-blue-500' },
      'documentos_enviados': { label: 'Documentos Enviados', color: 'bg-green-500' },
      'desqualificado': { label: 'Desqualificado', color: 'bg-red-500' },
      'atendimento_humano': { label: 'Atendimento Humano', color: 'bg-purple-500' },
      'ativo': { label: 'Conversa Ativa', color: 'bg-emerald-500' },
    };

    const badge = badges[situacao as keyof typeof badges] || { label: 'Desconhecido', color: 'bg-gray-500' };
    return (
      <Badge className={cn('text-white', badge.color)}>
        {badge.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pendente': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelado': return <X className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Follow-up Inteligente - {lead.nome_lead}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Lead */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-gray-600">Telefone</Label>
              <p className="text-sm">{lead.telefone}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Status</Label>
              <p className="text-sm">{lead.status_qualificacao}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Categoria</Label>
              <p className="text-sm">{lead.categoria_lead}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Situação</Label>
              {followUpData?.tipo_situacao ? getSituationBadge(followUpData.tipo_situacao) : '-'}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              {isAnalyzing ? 'Analisando...' : 'Analisar Conversa'}
            </Button>

            {followUpData && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => toggleFollowUpStatus(
                    followUpData.status === 'ativo' ? 'pausado' : 'ativo'
                  )}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  {followUpData.status === 'ativo' ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {followUpData.status === 'ativo' ? 'Pausar' : 'Ativar'}
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => toggleFollowUpStatus('finalizado')}
                  disabled={isUpdating}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Finalizar
                </Button>
              </div>
            )}
          </div>

          {/* Contexto da Conversa */}
          {followUpData?.contexto_conversa && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <Label className="text-sm font-medium text-blue-800">Contexto da Conversa</Label>
              <p className="text-sm text-blue-700 mt-1">
                {followUpData.sugestoes_ia?.contexto || 'Analisando contexto...'}
              </p>
            </div>
          )}

          {/* Lista de Follow-ups */}
          {followUps.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Follow-ups Programados</h3>
                <Badge variant={followUpData?.status === 'ativo' ? 'default' : 'secondary'}>
                  {followUpData?.status === 'ativo' ? 'Ativo' : followUpData?.status}
                </Badge>
              </div>

              {followUps.map((followUp, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Follow-up {followUp.ordem}</Badge>
                      {getStatusIcon(followUp.status || 'pendente')}
                      <span className="text-sm text-gray-500">
                        {followUp.tempo_espera}
                        {followUp.horario_comercial && ' (horário comercial)'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingIndex(index);
                        setEditText(followUp.texto);
                        setEditDate(followUp.data_envio ? new Date(followUp.data_envio) : new Date());
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {editingIndex === index ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Texto do follow-up..."
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Data de envio:</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-48 justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editDate ? format(editDate, "dd/MM/yyyy HH:mm", { locale: ptBR }) : "Selecionar data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={editDate}
                              onSelect={setEditDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(index)}>
                          <Save className="h-4 w-4 mr-1" />
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm">{followUp.texto}</p>
                      {followUp.data_envio && (
                        <p className="text-xs text-gray-500">
                          Programado para: {format(new Date(followUp.data_envio), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Estado vazio */}
          {!followUpData && !isLoading && (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum follow-up configurado
              </h3>
              <p className="text-gray-500">
                Clique em "Analisar Conversa" para gerar sugestões inteligentes de follow-up
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Carregando dados do follow-up...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};