import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, Star, DollarSign, MessageCircle, X, Search, Loader2 } from 'lucide-react';
import { useLeadsRoger, LeadRoger } from '@/hooks/useLeadsRoger';
import { Skeleton } from '@/components/ui/skeleton';
const getCategoryStyle = (category: string | null) => {
  switch (category) {
    case 'PREMIUM_ATRASO':
      return 'bg-crm-purple text-white';
    case 'A_EXCELENTE':
      return 'bg-crm-green text-white';
    case 'B_MUITO_BOM':
      return 'bg-crm-blue text-white';
    case 'C_BOM':
      return 'bg-crm-yellow text-black';
    case 'D_REGULAR':
      return 'bg-crm-orange text-white';
    case 'E_BAIXO':
      return 'bg-crm-red text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};
const getPotentialStyle = (potential: string | null) => {
  switch (potential?.toLowerCase()) {
    case 'alto':
      return 'bg-status-high text-white';
    case 'medio':
      return 'bg-status-medium text-black';
    case 'baixo':
      return 'bg-status-low text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};
const getStatusStyle = (status: string | null) => {
  switch (status?.toUpperCase()) {
    case 'NOVO':
      return 'bg-status-novo-bg text-status-novo';
    case 'CONVERSANDO':
      return 'bg-status-conversando-bg text-status-conversando';
    case 'CONVERTIDO':
      return 'bg-status-convertido-bg text-status-convertido';
    default:
      return 'bg-muted text-muted-foreground';
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
  const [selectedLead, setSelectedLead] = useState<LeadRoger | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [potentialFilter, setPotentialFilter] = useState('Todos');

  // Filtered leads
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return leads.filter(lead => {
      const matchesSearch = (lead.nome_lead || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || lead.status_lead === statusFilter.toUpperCase();
      const matchesCategory = categoryFilter === 'Todas' || lead.categoria_lead === categoryFilter.replace(' ', '_').toUpperCase();
      const matchesPotential = potentialFilter === 'Todos' || lead.potencial_recuperacao?.toLowerCase() === potentialFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesCategory && matchesPotential;
    });
  }, [leads, searchTerm, statusFilter, categoryFilter, potentialFilter]);
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos');
    setCategoryFilter('Todas');
    setPotentialFilter('Todos');
  };
  const openLeadModal = (lead: LeadRoger) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };
  if (error) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-destructive">Erro ao carregar dados: {error.message}</p>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-background font-inter">
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
            <Badge className="bg-status-active-bg text-status-active px-4 py-2 text-sm font-semibold">
              Sistema Ativo
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-blue-soft border-crm-blue/20 hover:shadow-lg transition-all duration-300 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-100">Total de Leads</CardTitle>
              <Users className="h-6 w-6 text-crm-blue" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16 bg-transparent" /> : <div className="text-3xl font-bold">{metrics.totalLeads}</div>}
            </CardContent>
          </Card>

          <Card className="bg-gradient-green-soft border-crm-green/20 hover:shadow-lg transition-all duration-300 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-100">Leads Qualificados</CardTitle>
              <TrendingUp className="h-6 w-6 text-crm-green bg-transparent" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <>
                  <div className="text-3xl font-bold">{metrics.qualifiedLeads}</div>
                  <p className="text-sm font-medium text-slate-100">
                    {metrics.conversionRate.toFixed(1)}% de conversão
                  </p>
                </>}
            </CardContent>
          </Card>

          <Card className="bg-gradient-purple-soft border-crm-purple/20 hover:shadow-lg transition-all duration-300 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-100">Leads Premium</CardTitle>
              <Star className="h-6 w-6 text-crm-purple" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{metrics.premiumLeads}</div>}
            </CardContent>
          </Card>

          <Card className="bg-gradient-yellow-soft border-crm-yellow/20 hover:shadow-lg transition-all duration-300 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-100">Potencial Total</CardTitle>
              <DollarSign className="h-6 w-6 text-crm-yellow" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-3xl font-bold">{formatCurrency(metrics.totalPotential)}</div>}
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
                  <Input placeholder="Buscar lead por nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
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
                      <SelectItem value="Novo">Novo</SelectItem>
                      <SelectItem value="Conversando">Conversando</SelectItem>
                      <SelectItem value="Convertido">Convertido</SelectItem>
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
                      <SelectItem value="A Excelente">A Excelente</SelectItem>
                      <SelectItem value="B Muito Bom">B Muito Bom</SelectItem>
                      <SelectItem value="C Bom">C Bom</SelectItem>
                      <SelectItem value="D Regular">D Regular</SelectItem>
                      <SelectItem value="E Baixo">E Baixo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={potentialFilter} onValueChange={setPotentialFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-card/60 border-crm-purple/20 hover:border-crm-purple/40 transition-colors">
                      <SelectValue placeholder="Potencial">
                        {potentialFilter ? `Potencial: ${potentialFilter}` : "Potencial"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Medio">Médio</SelectItem>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" onClick={clearFilters} className="text-muted-foreground hover:text-foreground bg-card/60 border-border/60 hover:bg-muted/80 transition-colors">
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
            {isLoading ? <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>)}
              </div> : <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Lead</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Categoria</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Score</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Data de Entrada</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Valor Estimado</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => <tr key={lead.id} className="border-b border-border hover:bg-muted/50 cursor-pointer" onClick={() => openLeadModal(lead)}>
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
                            {lead.estado || '-'}
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
                            {formatCurrency(lead.valor_estimado_recuperacao)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={e => {
                        e.stopPropagation();
                        openLeadModal(lead);
                      }}>
                              Ver Detalhes
                            </Button>
                            <Button size="sm" variant="outline" onClick={e => {
                        e.stopPropagation();
                        // Chat functionality can be implemented later
                      }}>
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Lead Details Modal */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Nome:</h4>
                  <p>{selectedLead.nome_lead || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Telefone:</h4>
                  <p>{selectedLead.telefone}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Email:</h4>
                  <p>{selectedLead.email || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Estado:</h4>
                  <p>{selectedLead.estado || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Categoria:</h4>
                  <Badge className={getCategoryStyle(selectedLead.categoria_lead)}>
                    {selectedLead.categoria_lead || 'Não classificado'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Status:</h4>
                  <Badge className={getStatusStyle(selectedLead.status_lead)}>
                    {selectedLead.status_lead || 'Sem status'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Score Total:</h4>
                  <p>{selectedLead.score_total || 0}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Prioridade:</h4>
                  <p>{selectedLead.prioridade_atendimento || 0}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Potencial:</h4>
                  <Badge className={getPotentialStyle(selectedLead.potencial_recuperacao)}>
                    {selectedLead.potencial_recuperacao || 'Não avaliado'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold">Valor Estimado:</h4>
                  <p>{formatCurrency(selectedLead.valor_estimado_recuperacao)}</p>
                </div>
              </div>
              {selectedLead.observacoes && <div>
                  <h4 className="font-semibold">Observações:</h4>
                  <p className="mt-2 p-3 bg-muted rounded-md">{selectedLead.observacoes}</p>
                </div>}
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
};
export default CRMDashboardReal;