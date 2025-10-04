import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Users, TrendingUp, Star, DollarSign, MessageCircle, X, Search, Loader2, CalendarIcon, AlertCircle, UserPlus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format, subDays, subHours, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLeadsRoger, LeadRoger } from '@/hooks/useLeadsRoger';
import { useIABlockControl } from '@/hooks/useIABlockControl';
import { FollowUpModal } from '@/components/FollowUpModal';
import { useBulkFollowUpManager } from '@/hooks/useBulkFollowUpManager';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause, Pencil, Save, X as XIcon } from 'lucide-react';
import { getEstadoFromTelefone } from '@/lib/utils';
import { ObservacoesHistory } from '@/components/ObservacoesHistory';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
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

const getCategoryStyle = (category: string | null) => {
  switch (category) {
    case 'EXCELENTE':
      return 'bg-emerald-600 text-white font-bold';
    case 'POTENCIAL EXCELENTE':
      return 'bg-emerald-500 text-white';
    case 'BOM':
      return 'bg-blue-600 text-white font-semibold';
    case 'POTENCIAL BOM':
      return 'bg-blue-500 text-white';
    case 'DESQUALIFICADO':
      return 'bg-red-600 text-white';
    case 'NÃO CLASSIFICADO':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

const getPotentialStyle = (potential: string | null) => {
  switch (potential?.toLowerCase()) {
    case 'alto':
      return 'bg-crm-primary text-white';
    case 'medio':
      return 'bg-crm-primary/70 text-white';
    case 'baixo':
      return 'bg-crm-secondary text-crm-primary';
    default:
      return 'bg-crm-secondary/80 text-crm-primary';
  }
};

const getStatusStyle = (status: string | null) => {
  switch (status?.toUpperCase()) {
    case 'NOVO':
      return 'bg-crm-primary text-white';
    case 'CONVERSANDO':
      return 'bg-crm-primary/80 text-white';
    case 'CONVERTIDO':
      return 'bg-crm-primary/60 text-white';
    default:
      return 'bg-crm-secondary/80 text-crm-primary';
  }
};

const formatCurrency = (value: number | null) => {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Schema de validação para edição do lead
const leadEditSchema = z.object({
  nome_lead: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().email('Email inválido').nullable().or(z.literal('')),
  estado: z.string().nullable(),
  categoria_lead: z.string().nullable(),
  status_lead: z.string().nullable(),
  tipo_caso: z.string().nullable(),
  tipo_financiamento: z.string().nullable(),
  status_imovel: z.string().nullable(),
  valor_pago: z.coerce.number().min(0).nullable(),
  valor_estimado_recuperacao: z.coerce.number().min(0).nullable(),
  observacoes: z.string().nullable(),
});

type LeadEditFormData = z.infer<typeof leadEditSchema>;

// Schema de validação para criação de lead
const leadCreateSchema = z.object({
  telefone: z.string()
    .min(11, 'Telefone deve ter 11 dígitos')
    .max(11, 'Telefone deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'Formato inválido. Use apenas números (DDD + número)'),
  nome_lead: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  estado: z.string().optional(),
  categoria_lead: z.string().default('NÃO CLASSIFICADO'),
  status_lead: z.string().default('novo'),
  tipo_caso: z.string().optional(),
  tipo_financiamento: z.string().optional(),
  status_imovel: z.string().optional(),
  valor_pago: z.coerce.number().min(0, 'Valor não pode ser negativo').optional(),
  valor_estimado_recuperacao: z.coerce.number().min(0, 'Valor não pode ser negativo').optional(),
  observacoes: z.string().optional(),
});

type LeadCreateFormData = z.infer<typeof leadCreateSchema>;

const CRMDashboardReal: React.FC = () => {
  const {
    leads,
    isLoading,
    error,
    metrics
  } = useLeadsRoger();
  const { toggleIA, isLoading: isTogglingIA } = useIABlockControl();
  const { populateExistingLeads, updateAllLeads } = useBulkFollowUpManager();
  const [selectedLead, setSelectedLead] = useState<LeadRoger | null>(null);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [selectedFollowUpLead, setSelectedFollowUpLead] = useState<LeadRoger | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<LeadEditFormData>({
    resolver: zodResolver(leadEditSchema),
  });
  
  const createForm = useForm<LeadCreateFormData>({
    resolver: zodResolver(leadCreateSchema),
    defaultValues: {
      categoria_lead: 'NÃO CLASSIFICADO',
      status_lead: 'novo',
      telefone: '',
      nome_lead: '',
      email: '',
    }
  });
  
  // Mutation para salvar as alterações
  const updateLeadMutation = useMutation({
    mutationFn: async (data: LeadEditFormData) => {
      if (!selectedLead) return;
      
      // Extrair observações dos dados
      const { observacoes, ...leadData } = data;
      
      // Auto-update status_qualificacao baseado em categoria_lead
      let autoStatusQualificacao = selectedLead.status_qualificacao;
      
      if (data.categoria_lead === 'POTENCIAL EXCELENTE' || data.categoria_lead === 'EXCELENTE') {
        autoStatusQualificacao = 'transferido';
      } else if (data.categoria_lead === 'DESQUALIFICADO') {
        autoStatusQualificacao = 'desqualificado';
      }
      
      // Atualizar lead SEM observacoes
      const { error } = await supabase
        .from('leads_roger')
        .update({
          ...leadData,
          status_qualificacao: autoStatusQualificacao,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedLead.id);
        
      if (error) throw error;
      
      // Se tiver observações novas, adicionar à tabela interacoes
      if (observacoes && observacoes.trim()) {
        await supabase
          .from('interacoes')
          .insert({
            lead_id: selectedLead.id,
            tipo: 'nota',
            conteudo: observacoes,
            enviada_por: 'CRM Dashboard',
            direção: 'interna',
            status: 'registrada',
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
      queryClient.invalidateQueries({ queryKey: ['lead-observacoes'] });
      toast({
        title: 'Lead atualizado',
        description: 'As informações foram salvas com sucesso.',
      });
      setIsEditing(false);
      form.setValue('observacoes', ''); // Limpar campo de observações
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar o lead. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Erro ao atualizar lead:', error);
    },
  });
  
  // Mutation para criar novo lead
  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase
        .from('leads_roger')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', leadId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
      toast({
        title: "Lead excluído",
        description: "O lead foi excluído com sucesso.",
      });
      setShowLeadModal(false);
      setShowDeleteConfirm(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: LeadCreateFormData) => {
      // Verificar se telefone já existe
      const { data: existingLead } = await supabase
        .from('leads_roger')
        .select('id, nome_lead')
        .eq('telefone', Number(data.telefone))
        .single();
        
      if (existingLead) {
        throw new Error(`Lead "${existingLead.nome_lead}" já existe com este telefone`);
      }
      
      // Extrair observações dos dados
      const { observacoes, ...leadData } = data;
      
      // Auto-detectar estado pelo DDD
      const autoEstado = leadData.estado || getEstadoFromTelefone(leadData.telefone);
      
      // Auto-update status_qualificacao baseado em categoria_lead
      let autoStatusQualificacao = 'qualificando';
      if (leadData.categoria_lead === 'POTENCIAL EXCELENTE' || leadData.categoria_lead === 'EXCELENTE') {
        autoStatusQualificacao = 'transferido';
      } else if (leadData.categoria_lead === 'DESQUALIFICADO') {
        autoStatusQualificacao = 'desqualificado';
      }
      
      // Inserir lead SEM observacoes
      const { data: newLead, error: leadError } = await supabase
        .from('leads_roger')
        .insert({
          telefone: Number(leadData.telefone),
          nome_lead: leadData.nome_lead,
          email: leadData.email || null,
          estado: autoEstado,
          categoria_lead: leadData.categoria_lead,
          status_lead: leadData.status_lead,
          tipo_caso: leadData.tipo_caso || null,
          tipo_financiamento: leadData.tipo_financiamento || null,
          status_imovel: leadData.status_imovel || null,
          valor_pago: leadData.valor_pago || null,
          valor_estimado_recuperacao: leadData.valor_estimado_recuperacao || null,
          instancia: 'roger',
          status_qualificacao: autoStatusQualificacao,
        })
        .select()
        .single();
        
      if (leadError) throw leadError;
      
      // Se tiver observações, salvar na tabela interacoes
      if (observacoes && observacoes.trim() && newLead) {
        await supabase
          .from('interacoes')
          .insert({
            lead_id: newLead.id,
            tipo: 'nota',
            conteudo: observacoes,
            enviada_por: 'CRM Dashboard',
            direção: 'interna',
            status: 'registrada',
          });
      }
      
      return newLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-roger'] });
      toast({
        title: 'Lead criado',
        description: 'Novo lead foi adicionado com sucesso.',
      });
      setShowCreateModal(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar lead',
        description: error.message || 'Não foi possível criar o lead. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Erro ao criar lead:', error);
    },
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState<{
    from?: Date;
    to?: Date;
    startTime: string;
    endTime: string;
  }>({
    startTime: '00:00',
    endTime: '23:59'
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Date filter logic
  const getDateFilterRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case '24h':
        return { from: subHours(now, 24), to: now };
      case '7d':
        return { from: subDays(now, 7), to: now };
      case '30d':
        return { from: subDays(now, 30), to: now };
      case 'custom':
        if (customDateRange.from && customDateRange.to) {
          const fromDateTime = new Date(customDateRange.from);
          const toDateTime = new Date(customDateRange.to);
          
          // Set custom times
          const [fromHour, fromMinute] = customDateRange.startTime.split(':');
          const [toHour, toMinute] = customDateRange.endTime.split(':');
          
          fromDateTime.setHours(parseInt(fromHour), parseInt(fromMinute), 0, 0);
          toDateTime.setHours(parseInt(toHour), parseInt(toMinute), 59, 999);
          
          return { from: fromDateTime, to: toDateTime };
        }
        return null;
      default:
        return null;
    }
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter(lead => {
      const matchesSearch = (lead.nome_lead || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter - use exact lowercase values from database
      const matchesStatus = statusFilter === 'Todos' || lead.status_lead === statusFilter.toLowerCase();
      
      // Category filter - use exact database values
      let matchesCategory = true;
      if (categoryFilter !== 'Todas') {
        const categoryMap: Record<string, string> = {
          'Não Classificado': 'NÃO CLASSIFICADO',
          'Potencial Bom': 'POTENCIAL BOM',
          'Bom': 'BOM',
          'Potencial Excelente': 'POTENCIAL EXCELENTE',
          'Excelente': 'EXCELENTE',
          'Desqualificado': 'DESQUALIFICADO'
        };
        const dbCategoryValue = categoryMap[categoryFilter];
        matchesCategory = lead.categoria_lead === dbCategoryValue;
      }
      
      // Date filter logic - use isWithinInterval for inclusive dates
      const dateRange = getDateFilterRange();
      let matchesDate = true;
      if (dateRange) {
        const leadDate = new Date(lead.created_at);
        matchesDate = isWithinInterval(leadDate, { start: dateRange.from, end: dateRange.to });
      }
      
      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [leads, searchTerm, statusFilter, categoryFilter, dateFilter, customDateRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos');
    setCategoryFilter('Todas');
    setDateFilter('all');
    setCustomDateRange({
      startTime: '00:00',
      endTime: '23:59'
    });
  };

  const openLeadModal = (lead: LeadRoger) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const openFollowUpModal = (lead: LeadRoger) => {
    setSelectedFollowUpLead(lead);
    setFollowUpModalOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-destructive">Erro ao carregar dados: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div>
                
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">CRM RFN Advogados</h2>
                <p className="text-muted-foreground text-lg">Dashboard de Leads e Qualificação</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Novo Lead
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={updateAllLeads}
              >
                Atualizar Todos
              </Button>
            </div>
            <Badge className="bg-status-active-bg text-status-active px-4 py-2 text-sm font-semibold">
              Sistema Ativo
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-700">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total de Leads</CardTitle>
              <Users className="h-6 w-6 text-slate-300" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-slate-700" />
              ) : (
                <div className="text-3xl font-bold text-slate-300">{metrics.totalLeads}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Leads Qualificados</CardTitle>
              <TrendingUp className="h-6 w-6 text-slate-300" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-slate-700" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-slate-300">{metrics.qualifiedLeads}</div>
                  <p className="text-sm font-medium text-slate-300">
                    {metrics.qualificationRate.toFixed(1)}% de qualificação
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Leads Premium</CardTitle>
              <Star className="h-6 w-6 text-slate-300" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16 bg-slate-700" />
              ) : (
                <div className="text-3xl font-bold text-slate-300">{metrics.premiumLeads}</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Potencial Total</CardTitle>
              <DollarSign className="h-6 w-6 text-slate-300" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24 bg-slate-700" />
              ) : (
                <div className="text-3xl font-bold text-slate-300">{formatCurrency(metrics.totalPotential)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 bg-filter-bg/50 border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Buscar lead por nome..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-card/60 border-crm-blue/20 hover:border-crm-blue/40 transition-colors">
                      <SelectValue placeholder="Status">
                        {statusFilter ? `Status: ${statusFilter}` : "Status"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="conversando">Conversando</SelectItem>
                      <SelectItem value="convertido">Convertido</SelectItem>
                      <SelectItem value="qualificando">Qualificando</SelectItem>
                      <SelectItem value="qualificado">Qualificado</SelectItem>
                      <SelectItem value="desqualificado">Desqualificado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-card/60 border-crm-green/20 hover:border-crm-green/40 transition-colors">
                      <SelectValue placeholder="Categoria">
                        {categoryFilter ? `Categoria: ${categoryFilter}` : "Categoria"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todas">Todas</SelectItem>
                      <SelectItem value="Não Classificado">Não Classificado</SelectItem>
                      <SelectItem value="Potencial Bom">Potencial Bom</SelectItem>
                      <SelectItem value="Bom">Bom</SelectItem>
                      <SelectItem value="Potencial Excelente">Potencial Excelente</SelectItem>
                      <SelectItem value="Excelente">Excelente</SelectItem>
                      <SelectItem value="Desqualificado">Desqualificado</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date Filter */}
                  <div className="w-full sm:w-52">
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="bg-card/60 border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Data de Entrada">
                          {dateFilter === 'all' && 'Todas as datas'}
                          {dateFilter === '24h' && 'Últimas 24h'}
                          {dateFilter === '7d' && 'Últimos 7 dias'}
                          {dateFilter === '30d' && 'Últimos 30 dias'}
                          {dateFilter === 'custom' && (customDateRange.from && customDateRange.to 
                            ? `${format(customDateRange.from, 'dd/MM/yy', { locale: ptBR })} - ${format(customDateRange.to, 'dd/MM/yy', { locale: ptBR })}`
                            : 'Personalizado')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as datas</SelectItem>
                        <SelectItem value="24h">Últimas 24 horas</SelectItem>
                        <SelectItem value="7d">Últimos 7 dias</SelectItem>
                        <SelectItem value="30d">Últimos 30 dias</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Custom Date Range Popover */}
                    {dateFilter === 'custom' && (
                      <Popover open={showCustomDatePicker} onOpenChange={setShowCustomDatePicker}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full mt-2 text-left font-normal"
                            onClick={() => setShowCustomDatePicker(true)}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {customDateRange.from && customDateRange.to ? (
                              `${format(customDateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(customDateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`
                            ) : (
                              'Selecionar período'
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Período</Label>
                              <Calendar
                                mode="range"
                                selected={{
                                  from: customDateRange.from,
                                  to: customDateRange.to
                                }}
                                onSelect={(range) => {
                                  setCustomDateRange(prev => ({
                                    ...prev,
                                    from: range?.from,
                                    to: range?.to
                                  }));
                                }}
                                className="pointer-events-auto"
                                initialFocus
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-sm font-medium">Hora inicial</Label>
                                <Input
                                  type="time"
                                  value={customDateRange.startTime}
                                  onChange={(e) => setCustomDateRange(prev => ({
                                    ...prev,
                                    startTime: e.target.value
                                  }))}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Hora final</Label>
                                <Input
                                  type="time"
                                  value={customDateRange.endTime}
                                  onChange={(e) => setCustomDateRange(prev => ({
                                    ...prev,
                                    endTime: e.target.value
                                  }))}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCustomDatePicker(false)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setShowCustomDatePicker(false)}
                                disabled={!customDateRange.from || !customDateRange.to}
                              >
                                Aplicar
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="text-muted-foreground hover:text-foreground bg-card/60 border-border/60 hover:bg-muted/80 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Lead</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Categoria</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Score</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Data de Entrada</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Valor Pago</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr 
                        key={lead.id} 
                        className="border-b border-border hover:bg-muted/50 cursor-pointer" 
                        onClick={() => openLeadModal(lead)}
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-foreground">
                              {lead.nome_lead || 'Nome não informado'}
                            </div>
                            <div className="text-sm text-muted-foreground">{lead.telefone}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-foreground">
                            {getEstadoFromTelefone(lead.telefone) || lead.estado || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getCategoryStyle(lead.categoria_lead)}>
                            {lead.categoria_lead || 'Não classificado'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusStyle(lead.status_lead)}>
                            {lead.status_lead || 'Sem status'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-foreground">
                            {lead.score_total || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(lead.created_at)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(lead.valor_pago)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={e => {
                                e.stopPropagation();
                                toggleIA(lead.telefone, lead.nome_lead, lead.atendente === 'HUMANO');
                              }}
                              disabled={isTogglingIA(lead.telefone)}
                              className="w-10 h-10 p-0"
                              title={lead.atendente === 'HUMANO' ? "IA Pausada - Clique para Ativar" : "IA Ativa - Clique para Pausar"}
                            >
                              {isTogglingIA(lead.telefone) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : lead.atendente === 'HUMANO' ? (
                                <Play className="h-4 w-4" />
                              ) : (
                                <Pause className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={e => {
                                e.stopPropagation();
                                openFollowUpModal(lead);
                              }}
                              title="Configurar Follow-up"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lead Details Modal */}
      <Dialog open={showLeadModal} onOpenChange={(open) => {
        setShowLeadModal(open);
        if (!open) {
          setIsEditing(false);
          form.reset();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-100 flex-1">
              Detalhes do Lead
            </DialogTitle>
            <div className="flex gap-2 items-center">
              {!isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              )}
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(true);
                    if (selectedLead) {
                      form.reset({
                        nome_lead: selectedLead.nome_lead || '',
                        email: selectedLead.email || '',
                        estado: selectedLead.estado,
                        categoria_lead: selectedLead.categoria_lead,
                        status_lead: selectedLead.status_lead,
                        tipo_caso: selectedLead.tipo_caso,
                        tipo_financiamento: selectedLead.tipo_financiamento,
                        status_imovel: selectedLead.status_imovel,
                        valor_pago: selectedLead.valor_pago ? Number(selectedLead.valor_pago) : null,
                        valor_estimado_recuperacao: selectedLead.valor_estimado_recuperacao ? Number(selectedLead.valor_estimado_recuperacao) : null,
                        observacoes: selectedLead.observacoes,
                      });
                    }
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    form.reset();
                  }}
                  disabled={updateLeadMutation.isPending}
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={form.handleSubmit((data) => updateLeadMutation.mutate(data))}
                  disabled={updateLeadMutation.isPending}
                >
                  {updateLeadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </div>
              )}
            </div>
          </DialogHeader>
          {selectedLead && (
            <Form {...form}>
              <div className="space-y-6 py-4">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-600 pb-2">
                    Informações Básicas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome_lead"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Nome</FormLabel>
                          {isEditing ? (
                            <FormControl>
                              <Input {...field} className="bg-slate-800 border-slate-600 text-slate-100" />
                            </FormControl>
                          ) : (
                            <p className="text-slate-100 font-medium">{selectedLead.nome_lead || 'Não informado'}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <Label className="text-sm font-medium text-slate-300">Telefone</Label>
                      <p className="text-slate-100 font-medium">{selectedLead.telefone}</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Email</FormLabel>
                          {isEditing ? (
                            <FormControl>
                              <Input {...field} value={field.value || ''} type="email" className="bg-slate-800 border-slate-600 text-slate-100" />
                            </FormControl>
                          ) : (
                            <p className="text-slate-100 font-medium">{selectedLead.email || 'Não informado'}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Estado</FormLabel>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map((uf) => (
                                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-slate-100 font-medium">{getEstadoFromTelefone(selectedLead.telefone) || selectedLead.estado || 'Não informado'}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {selectedLead.data_compra && (
                      <div>
                        <Label className="text-sm font-medium text-slate-300">Data da Compra</Label>
                        <p className="text-slate-100 font-medium">{formatDate(selectedLead.data_compra)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Classificação e Status */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-600 pb-2">
                    Classificação e Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoria_lead"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Categoria</FormLabel>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="NÃO CLASSIFICADO">NÃO CLASSIFICADO</SelectItem>
                                <SelectItem value="POTENCIAL BOM">POTENCIAL BOM</SelectItem>
                                <SelectItem value="BOM">BOM</SelectItem>
                                <SelectItem value="POTENCIAL EXCELENTE">POTENCIAL EXCELENTE</SelectItem>
                                <SelectItem value="EXCELENTE">EXCELENTE</SelectItem>
                                <SelectItem value="DESQUALIFICADO">DESQUALIFICADO</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="mt-1">
                              <Badge className={getCategoryStyle(selectedLead.categoria_lead)}>
                                {selectedLead.categoria_lead || 'Não categorizado'}
                              </Badge>
                            </div>
                          )}
                          <FormMessage />
                          
                          {/* Alertas de transferência/desqualificação automática */}
                          {isEditing && (form.watch('categoria_lead') === 'POTENCIAL EXCELENTE' || form.watch('categoria_lead') === 'EXCELENTE') && (
                            <Alert className="mt-2 bg-amber-900/20 border-amber-600">
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                              <AlertTitle className="text-amber-400">Transferência Automática</AlertTitle>
                              <AlertDescription className="text-amber-300">
                                Este lead será automaticamente marcado como "transferido" para atendimento humano.
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {isEditing && form.watch('categoria_lead') === 'DESQUALIFICADO' && (
                            <Alert className="mt-2 bg-red-900/20 border-red-600">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <AlertTitle className="text-red-400">Lead Desqualificado</AlertTitle>
                              <AlertDescription className="text-red-300">
                                Este lead não atende os critérios mínimos e será marcado como desqualificado.
                              </AlertDescription>
                            </Alert>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status_lead"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Status</FormLabel>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="novo">Novo</SelectItem>
                                <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                                <SelectItem value="qualificado">Qualificado</SelectItem>
                                <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
                                <SelectItem value="negociacao">Negociação</SelectItem>
                                <SelectItem value="convertido">Convertido</SelectItem>
                                <SelectItem value="perdido">Perdido</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="mt-1">
                              <Badge className={getStatusStyle(selectedLead.status_lead)}>
                                {selectedLead.status_lead || 'Novo'}
                              </Badge>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <div>
                    <Label className="text-sm font-medium text-slate-300">Score Total</Label>
                    <p className="text-slate-100 font-medium text-lg">{selectedLead.score_total || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-300">Prioridade</Label>
                    <p className="text-slate-100 font-medium">{selectedLead.prioridade_atendimento || 0}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-300">Potencial</Label>
                    <div className="mt-1">
                      <Badge className={getPotentialStyle(selectedLead.potencial_recuperacao)}>
                        {selectedLead.potencial_recuperacao || 'Não avaliado'}
                      </Badge>
                    </div>
                  </div>
                  {selectedLead.status_qualificacao && (
                    <div>
                      <Label className="text-sm font-medium text-slate-300">Status Qualificação</Label>
                      <p className="text-slate-100 font-medium">{selectedLead.status_qualificacao}</p>
                    </div>
                  )}
                </div>
              </div>

                {/* Informações do Caso */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-600 pb-2">
                    Informações do Caso
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipo_caso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Tipo do Caso</FormLabel>
                          {isEditing ? (
                            <FormControl>
                              <Input {...field} value={field.value || ''} className="bg-slate-800 border-slate-600 text-slate-100" />
                            </FormControl>
                          ) : (
                            <p className="text-slate-100 font-medium">{selectedLead.tipo_caso || 'Não informado'}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tipo_financiamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Tipo de Financiamento</FormLabel>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Minha Casa Minha Vida">Minha Casa Minha Vida</SelectItem>
                                <SelectItem value="SFH">SFH</SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-slate-100 font-medium">{selectedLead.tipo_financiamento || 'Não informado'}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status_imovel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Status do Imóvel</FormLabel>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Entregue">Entregue</SelectItem>
                                <SelectItem value="Em construção">Em construção</SelectItem>
                                <SelectItem value="Não entregue">Não entregue</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-slate-100 font-medium">{selectedLead.status_imovel || 'Não informado'}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {selectedLead.proposta_recomendada && (
                      <div>
                        <Label className="text-sm font-medium text-slate-300">Proposta Recomendada</Label>
                        <p className="text-slate-100 font-medium">{selectedLead.proposta_recomendada}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Valores */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-600 pb-2">
                    Valores
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="valor_pago"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Valor Pago</FormLabel>
                          {isEditing ? (
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.01"
                                value={field.value || ''} 
                                className="bg-slate-800 border-slate-600 text-slate-100" 
                                placeholder="0.00"
                              />
                            </FormControl>
                          ) : (
                            <p className="text-slate-100 font-medium text-lg">{formatCurrency(selectedLead.valor_pago)}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="valor_estimado_recuperacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Valor Estimado de Recuperação</FormLabel>
                          {isEditing ? (
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.01"
                                value={field.value || ''} 
                                className="bg-slate-800 border-slate-600 text-slate-100" 
                                placeholder="0.00"
                              />
                            </FormControl>
                          ) : (
                            <p className="text-slate-100 font-medium text-lg text-green-400">
                              {formatCurrency(selectedLead.valor_estimado_recuperacao)}
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

              {/* Resumo da IA */}
              {selectedLead.resumo_ia && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-600 pb-2">
                    Análise da IA
                  </h3>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-100 leading-relaxed">{selectedLead.resumo_ia}</p>
                  </div>
                </div>
              )}

                {/* Observações e Motivos */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-600 pb-2">
                    Observações
                  </h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-300">Nova Observação</FormLabel>
                          {isEditing && (
                            <FormControl>
                              <Textarea 
                                {...field} 
                                value={field.value || ''} 
                                className="bg-slate-800 border-slate-600 text-slate-100 min-h-[100px]" 
                                placeholder="Adicione notas internas sobre este lead..."
                              />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Histórico de Observações */}
                    <ObservacoesHistory leadId={selectedLead.id} />
                    {selectedLead.motivo_desqualificacao && (
                      <div>
                        <Label className="text-sm font-medium text-slate-300">Motivo da Desqualificação</Label>
                        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mt-2">
                          <p className="text-red-300 leading-relaxed">{selectedLead.motivo_desqualificacao}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Follow-up Modal */}
      <FollowUpModal
        isOpen={followUpModalOpen}
        onClose={() => {
          setFollowUpModalOpen(false);
          setSelectedFollowUpLead(null);
        }}
        lead={selectedFollowUpLead}
      />
      
      {/* Create Lead Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-100">Criar Novo Lead</DialogTitle>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((data) => createLeadMutation.mutate(data))} className="space-y-6">
              {/* Alert informativo */}
              <Alert className="bg-blue-900/20 border-blue-600">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertTitle className="text-blue-300">Informações Automáticas</AlertTitle>
                <AlertDescription className="text-blue-200 text-sm">
                  • O estado será detectado automaticamente pelo DDD do telefone<br />
                  • Categoria padrão: NÃO CLASSIFICADO (será atualizada pela IA)<br />
                  • Status padrão: novo
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Coluna 1 - Dados Básicos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2">
                    Dados Básicos
                  </h3>
                  
                  <FormField
                    control={createForm.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Telefone* (DDD + Número)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="11999887766"
                            className="bg-slate-800 border-slate-600 text-slate-100"
                            maxLength={11}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                              // Auto-detectar estado
                              if (value.length >= 2) {
                                const estado = getEstadoFromTelefone(value);
                                if (estado) {
                                  createForm.setValue('estado', estado);
                                }
                              }
                            }}
                          />
                        </FormControl>
                        {createForm.watch('telefone')?.length >= 2 && createForm.watch('estado') && (
                          <p className="text-xs text-green-400 mt-1">
                            Estado detectado: {createForm.watch('estado')}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="nome_lead"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Nome do Lead*</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Digite o nome completo"
                            className="bg-slate-800 border-slate-600 text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="email@exemplo.com"
                            className="bg-slate-800 border-slate-600 text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Estado</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ''}
                            placeholder="Auto-detectado"
                            className="bg-slate-800 border-slate-600 text-slate-100"
                            maxLength={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="categoria_lead"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NÃO CLASSIFICADO">NÃO CLASSIFICADO</SelectItem>
                            <SelectItem value="POTENCIAL BOM">POTENCIAL BOM</SelectItem>
                            <SelectItem value="BOM">BOM</SelectItem>
                            <SelectItem value="POTENCIAL EXCELENTE">POTENCIAL EXCELENTE</SelectItem>
                            <SelectItem value="EXCELENTE">EXCELENTE</SelectItem>
                            <SelectItem value="DESQUALIFICADO">DESQUALIFICADO</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {(createForm.watch('categoria_lead') === 'POTENCIAL EXCELENTE' || 
                    createForm.watch('categoria_lead') === 'EXCELENTE') && (
                    <Alert className="bg-amber-900/20 border-amber-600">
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                      <AlertDescription className="text-amber-300 text-sm">
                        Este lead será automaticamente marcado como "transferido"
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {createForm.watch('categoria_lead') === 'DESQUALIFICADO' && (
                    <Alert className="bg-red-900/20 border-red-600">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-300 text-sm">
                        Este lead será marcado como desqualificado. Preencha o motivo nas observações.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={createForm.control}
                    name="status_lead"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="novo">Novo</SelectItem>
                            <SelectItem value="conversando">Conversando</SelectItem>
                            <SelectItem value="convertido">Convertido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Coluna 2 - Detalhes do Caso */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2">
                    Detalhes do Caso
                  </h3>
                  
                  <FormField
                    control={createForm.control}
                    name="tipo_caso"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Tipo de Caso</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ''}
                            placeholder="Ex: Imobiliário, Financeiro..."
                            className="bg-slate-800 border-slate-600 text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="tipo_financiamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Tipo de Financiamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="caixa">Caixa</SelectItem>
                            <SelectItem value="consorcio">Consórcio</SelectItem>
                            <SelectItem value="banco">Banco</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="status_imovel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Status do Imóvel</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="entregue">Entregue</SelectItem>
                            <SelectItem value="nao_entregue">Não Entregue</SelectItem>
                            <SelectItem value="em_construcao">Em Construção</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="valor_pago"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Valor Pago (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="bg-slate-800 border-slate-600 text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="valor_estimado_recuperacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Valor Estimado Recuperação (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="bg-slate-800 border-slate-600 text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createForm.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-300">Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            value={field.value || ''}
                            className="bg-slate-800 border-slate-600 text-slate-100 min-h-[120px]"
                            placeholder="Digite observações relevantes sobre o lead..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Footer com Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false);
                    createForm.reset();
                  }}
                  disabled={createLeadMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createLeadMutation.isPending}
                  className="gap-2"
                >
                  {createLeadMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Criar Lead
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">
              Tem certeza que deseja excluir este lead?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. O lead{' '}
              <strong className="text-slate-300">{selectedLead?.nome_lead || 'Sem nome'}</strong>
              {' '}(telefone: {selectedLead?.telefone}) será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-100 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedLead && deleteLeadMutation.mutate(selectedLead.id)}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteLeadMutation.isPending}
            >
              {deleteLeadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CRMDashboardReal;