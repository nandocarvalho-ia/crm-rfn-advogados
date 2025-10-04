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
import { Users, TrendingUp, Star, DollarSign, MessageCircle, X, Search, Loader2, CalendarIcon } from 'lucide-react';
import { format, subDays, subHours, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLeadsRoger, LeadRoger } from '@/hooks/useLeadsRoger';
import { useIABlockControl } from '@/hooks/useIABlockControl';
import { FollowUpModal } from '@/components/FollowUpModal';
import { useBulkFollowUpManager } from '@/hooks/useBulkFollowUpManager';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause } from 'lucide-react';
import { getEstadoFromTelefone } from '@/lib/utils';

const getCategoryStyle = (category: string | null) => {
  switch (category) {
    case 'PREMIUM_ATRASO':
      return 'bg-crm-primary text-white';
    case 'A_EXCELENTE':
      return 'bg-crm-primary/90 text-white';
    case 'B_MUITO_BOM':
      return 'bg-crm-primary/80 text-white';
    case 'C_BOM':
      return 'bg-crm-primary/60 text-white';
    case 'D_REGULAR':
      return 'bg-crm-primary/40 text-crm-primary';
    case 'E_BAIXO':
      return 'bg-crm-secondary text-crm-primary';
    case 'DESQUALIFICADO':
      return 'bg-crm-secondary/60 text-crm-primary';
    default:
      return 'bg-crm-secondary/80 text-crm-primary';
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
          'Premium Atraso': 'PREMIUM_ATRASO',
          'Premium Tempo': 'PREMIUM_TEMPO', 
          'A Excelente': 'A_EXCELENTE',
          'B Muito Bom': 'B_MUITO_BOM',
          'C Bom': 'C_BOM',
          'D Regular': 'D_REGULAR',
          'E Baixo': 'E_BAIXO',
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
                      <SelectItem value="Premium Atraso">Premium Atraso</SelectItem>
                      <SelectItem value="Premium Tempo">Premium Tempo</SelectItem>
                      <SelectItem value="A Excelente">A Excelente</SelectItem>
                      <SelectItem value="B Muito Bom">B Muito Bom</SelectItem>
                      <SelectItem value="C Bom">C Bom</SelectItem>
                      <SelectItem value="D Regular">D Regular</SelectItem>
                      <SelectItem value="E Baixo">E Baixo</SelectItem>
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
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-100">
              Detalhes do Lead
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6 py-4">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-600 pb-2">
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-300">Nome</Label>
                    <p className="text-slate-100 font-medium">{selectedLead.nome_lead || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-300">Telefone</Label>
                    <p className="text-slate-100 font-medium">{selectedLead.telefone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-300">Email</Label>
                    <p className="text-slate-100 font-medium">{selectedLead.email || 'Não informado'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-300">Estado</Label>
                    <p className="text-slate-100 font-medium">{getEstadoFromTelefone(selectedLead.telefone) || selectedLead.estado || 'Não informado'}</p>
                  </div>
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
                  <div>
                    <Label className="text-sm font-medium text-slate-300">Categoria</Label>
                    <div className="mt-1">
                      <Badge className={getCategoryStyle(selectedLead.categoria_lead)}>
                        {selectedLead.categoria_lead || 'Não categorizado'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-300">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusStyle(selectedLead.status_lead)}>
                        {selectedLead.status_lead || 'Novo'}
                      </Badge>
                    </div>
                  </div>
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
              {(selectedLead.tipo_caso || selectedLead.tipo_financiamento || selectedLead.status_imovel) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-600 pb-2">
                    Informações do Caso
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLead.tipo_caso && (
                      <div>
                        <Label className="text-sm font-medium text-slate-300">Tipo do Caso</Label>
                        <p className="text-slate-100 font-medium">{selectedLead.tipo_caso}</p>
                      </div>
                    )}
                    {selectedLead.tipo_financiamento && (
                      <div>
                        <Label className="text-sm font-medium text-slate-300">Tipo de Financiamento</Label>
                        <p className="text-slate-100 font-medium">{selectedLead.tipo_financiamento}</p>
                      </div>
                    )}
                    {selectedLead.status_imovel && (
                      <div>
                        <Label className="text-sm font-medium text-slate-300">Status do Imóvel</Label>
                        <p className="text-slate-100 font-medium">{selectedLead.status_imovel}</p>
                      </div>
                    )}
                    {selectedLead.proposta_recomendada && (
                      <div>
                        <Label className="text-sm font-medium text-slate-300">Proposta Recomendada</Label>
                        <p className="text-slate-100 font-medium">{selectedLead.proposta_recomendada}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Valores */}
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-600 pb-2">
                  Valores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-300">Valor Pago</Label>
                    <p className="text-slate-100 font-medium text-lg">{formatCurrency(selectedLead.valor_pago)}</p>
                  </div>
                  {selectedLead.valor_estimado_recuperacao && (
                    <div>
                      <Label className="text-sm font-medium text-slate-300">Valor Estimado de Recuperação</Label>
                      <p className="text-slate-100 font-medium text-lg text-green-400">
                        {formatCurrency(selectedLead.valor_estimado_recuperacao)}
                      </p>
                    </div>
                  )}
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
              {(selectedLead.observacoes || selectedLead.motivo_desqualificacao) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-3 border-b border-slate-600 pb-2">
                    Observações
                  </h3>
                  <div className="space-y-4">
                    {selectedLead.observacoes && (
                      <div>
                        <Label className="text-sm font-medium text-slate-300">Observações Gerais</Label>
                        <div className="bg-slate-800 rounded-lg p-4 mt-2">
                          <p className="text-slate-100 leading-relaxed">{selectedLead.observacoes}</p>
                        </div>
                      </div>
                    )}
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
              )}
            </div>
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
    </div>
  );
};

export default CRMDashboardReal;