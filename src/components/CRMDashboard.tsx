import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, Star, DollarSign, MessageCircle, Play, Pause, X, Search } from 'lucide-react';
interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  state: string;
  category: string;
  status: string;
  score: number;
  entryDate: string;
  potential: string;
  value: string;
  isActive: boolean;
}
const mockLeads: Lead[] = [{
  id: 1,
  name: "Carlos Silva",
  phone: "(16) 99999-1234",
  email: "carlos@email.com",
  state: "SP",
  category: "PREMIUM_ATRASO",
  status: "CONVERSANDO",
  score: 95,
  entryDate: "15/01/2024",
  potential: "ALTO",
  value: "R$ 63.400",
  isActive: true
}, {
  id: 2,
  name: "Maria Santos",
  phone: "(16) 99999-5678",
  email: "maria@email.com",
  state: "MG",
  category: "A_EXCELENTE",
  status: "NOVO",
  score: 88,
  entryDate: "18/01/2024",
  potential: "ALTO",
  value: "R$ 45.200",
  isActive: false
}, {
  id: 3,
  name: "João Costa",
  phone: "(16) 99999-9012",
  email: "joao@email.com",
  state: "SP",
  category: "B_MUITO_BOM",
  status: "CONVERTIDO",
  score: 75,
  entryDate: "20/01/2024",
  potential: "ALTO",
  value: "R$ 38.900",
  isActive: true
}, {
  id: 4,
  name: "Ana Oliveira",
  phone: "(16) 99999-3456",
  email: "ana@email.com",
  state: "RJ",
  category: "PREMIUM_ATRASO",
  status: "CONVERSANDO",
  score: 92,
  entryDate: "22/01/2024",
  potential: "ALTO",
  value: "R$ 58.100",
  isActive: true
}, {
  id: 5,
  name: "Pedro Lima",
  phone: "(16) 99999-7890",
  email: "pedro@email.com",
  state: "SP",
  category: "C_BOM",
  status: "NOVO",
  score: 65,
  entryDate: "25/01/2024",
  potential: "MÉDIO",
  value: "R$ 28.750",
  isActive: false
}, {
  id: 6,
  name: "Julia Rocha",
  phone: "(16) 99999-2468",
  email: "julia@email.com",
  state: "MG",
  category: "B_MUITO_BOM",
  status: "CONVERSANDO",
  score: 78,
  entryDate: "28/01/2024",
  potential: "ALTO",
  value: "R$ 41.300",
  isActive: true
}, {
  id: 7,
  name: "Lucas Ferreira",
  phone: "(16) 99999-1357",
  email: "lucas@email.com",
  state: "SP",
  category: "D_REGULAR",
  status: "NOVO",
  score: 52,
  entryDate: "30/01/2024",
  potential: "MÉDIO",
  value: "R$ 22.400",
  isActive: false
}, {
  id: 8,
  name: "Carla Mendes",
  phone: "(16) 99999-8642",
  email: "carla@email.com",
  state: "RJ",
  category: "A_EXCELENTE",
  status: "CONVERTIDO",
  score: 85,
  entryDate: "02/02/2024",
  potential: "ALTO",
  value: "R$ 49.800",
  isActive: true
}, {
  id: 9,
  name: "Roberto Dias",
  phone: "(16) 99999-9753",
  email: "roberto@email.com",
  state: "SP",
  category: "C_BOM",
  status: "CONVERSANDO",
  score: 60,
  entryDate: "05/02/2024",
  potential: "MÉDIO",
  value: "R$ 31.200",
  isActive: false
}, {
  id: 10,
  name: "Fernanda Cruz",
  phone: "(16) 99999-8520",
  email: "fernanda@email.com",
  state: "MG",
  category: "E_BAIXO",
  status: "NOVO",
  score: 35,
  entryDate: "08/02/2024",
  potential: "BAIXO",
  value: "R$ 18.900",
  isActive: true
}];
interface ChatMessage {
  sender: 'lead' | 'rafael';
  message: string;
  timestamp: string;
}
const mockChatMessages: ChatMessage[] = [{
  sender: 'lead',
  message: 'Oi, tenho interesse em cancelar meu terreno',
  timestamp: '14:30'
}, {
  sender: 'rafael',
  message: 'Olá! Sou Rafael da RFN Advogados. O seu caso é lote ou cota?',
  timestamp: '14:32'
}, {
  sender: 'lead',
  message: 'É lote',
  timestamp: '14:33'
}, {
  sender: 'rafael',
  message: 'Perfeito! Financiou direto com a empresa ou banco?',
  timestamp: '14:35'
}, {
  sender: 'lead',
  message: 'Direto com a empresa',
  timestamp: '14:36'
}, {
  sender: 'rafael',
  message: 'Ótimo! Há quanto tempo está pagando e qual valor do lote?',
  timestamp: '14:38'
}, {
  sender: 'lead',
  message: 'Pago há 2 anos, lote de R$ 35.000',
  timestamp: '14:40'
}, {
  sender: 'rafael',
  message: 'Entendi. Vou analisar seu caso e enviar uma proposta detalhada.',
  timestamp: '14:42'
}];
const getCategoryStyle = (category: string) => {
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
      return 'bg-gray-500 text-white';
  }
};
const getPotentialStyle = (potential: string) => {
  switch (potential) {
    case 'ALTO':
      return 'bg-status-high text-white';
    case 'MÉDIO':
      return 'bg-status-medium text-black';
    case 'BAIXO':
      return 'bg-status-low text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'NOVO':
      return 'bg-status-novo-bg text-status-novo';
    case 'CONVERSANDO':
      return 'bg-status-conversando-bg text-status-conversando';
    case 'CONVERTIDO':
      return 'bg-status-convertido-bg text-status-convertido';
    default:
      return 'bg-gray-500 text-white';
  }
};
const CRMDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [potentialFilter, setPotentialFilter] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('Todos');

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || lead.status === statusFilter.toUpperCase();
      const matchesCategory = categoryFilter === 'Todas' || lead.category === categoryFilter.replace(' ', '_').toUpperCase();
      const matchesPotential = potentialFilter === 'Todos' || lead.potential === potentialFilter.toUpperCase();
      return matchesSearch && matchesStatus && matchesCategory && matchesPotential;
    });
  }, [leads, searchTerm, statusFilter, categoryFilter, potentialFilter]);
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Todos');
    setCategoryFilter('Todas');
    setPotentialFilter('Todos');
    setDateFilter('Todos');
  };
  const toggleLeadStatus = (leadId: number) => {
    setLeads(prevLeads => prevLeads.map(lead => lead.id === leadId ? {
      ...lead,
      isActive: !lead.isActive
    } : lead));
  };
  const openLeadModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };
  const openChatModal = () => {
    setShowChatModal(true);
    setShowLeadModal(false);
  };
  return <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">VIAM</h1>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">CRM Advogados</h2>
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
          <Card className="bg-gradient-blue-soft border-crm-blue/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-6 w-6 text-crm-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">47</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-green-soft border-crm-green/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Qualificados</CardTitle>
              <TrendingUp className="h-6 w-6 text-crm-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">32</div>
              <p className="text-sm text-crm-green font-medium">68.1% de conversão</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-purple-soft border-crm-purple/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Premium</CardTitle>
              <Star className="h-6 w-6 text-crm-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-yellow-soft border-crm-yellow/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potencial Total</CardTitle>
              <DollarSign className="h-6 w-6 text-crm-yellow" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ 847.250</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 bg-filter-bg/50 border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search and filters row */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Search Input */}
                <div className="relative lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Buscar lead por nome..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                
                {/* Filters */}
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
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full sm:w-40 bg-card/60 border-crm-yellow/20 hover:border-crm-yellow/40 transition-colors">
                      <SelectValue placeholder="Período">
                        {dateFilter ? `Período: ${dateFilter}` : "Período"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todos">Todos</SelectItem>
                      <SelectItem value="Últimas 24h">Últimas 24h</SelectItem>
                      <SelectItem value="Última semana">Última semana</SelectItem>
                      <SelectItem value="Últimos 30 dias">Últimos 30 dias</SelectItem>
                      <SelectItem value="Personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear filters button */}
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
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Valor Estimado</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => <tr key={lead.id} className="border-b border-border hover:bg-muted/50 cursor-pointer" onClick={() => openLeadModal(lead)}>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-foreground">{lead.name}</div>
                          <div className="text-sm text-muted-foreground">{lead.phone}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-foreground">{lead.state}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getCategoryStyle(lead.category)} text-xs`}>
                          {lead.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusStyle(lead.status)} text-xs`}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{lead.score}</span>
                          <Progress value={lead.score} className="w-16 h-2" />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-foreground">{lead.entryDate}</span>
                      </td>
                      <td className="py-4 px-4 font-medium text-foreground">{lead.value}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-crm-blue hover:text-crm-blue hover:bg-crm-blue-light" onClick={e => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                        openChatModal();
                      }}>
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className={`${lead.isActive ? 'text-crm-green hover:text-crm-green hover:bg-crm-green-light' : 'text-crm-red hover:text-crm-red hover:bg-crm-red-light'}`} onClick={e => {
                        e.stopPropagation();
                        toggleLeadStatus(lead.id);
                      }}>
                            {lead.isActive ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Details Modal */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && <ScrollArea className="max-h-[70vh] mt-2">
              <div className="space-y-6 pr-4">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome</label>
                      <p className="text-lg font-medium text-foreground">{selectedLead.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <p className="text-foreground">{selectedLead.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground">{selectedLead.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estado</label>
                      <p className="text-foreground">{selectedLead.state}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de Entrada</label>
                      <p className="text-foreground">{selectedLead.entryDate}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                      <div className="mt-1">
                        <Badge className={getCategoryStyle(selectedLead.category)}>
                          {selectedLead.category}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        <Badge className={getStatusStyle(selectedLead.status)}>
                          {selectedLead.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Score</label>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-2xl font-bold text-foreground">{selectedLead.score}</span>
                        <Progress value={selectedLead.score} className="flex-1 h-3" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Potencial</label>
                      <div className="mt-1">
                        <Badge className={getPotentialStyle(selectedLead.potential)}>
                          {selectedLead.potential}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Case Details */}
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Detalhes do Caso</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tipo de Caso</label>
                      <p className="font-medium text-foreground">LOTE</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Valor Pago</label>
                      <p className="font-medium text-foreground">R$ 35.000</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Valor Estimado</label>
                      <p className="font-medium text-foreground">{selectedLead.value}</p>
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-crm-blue-light p-6 rounded-lg border-l-4 border-crm-blue">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Resumo da IA</h3>
                  <p className="text-foreground leading-relaxed">
                    Lead qualificado com terreno em atraso de 8 meses. Construção no lote aumenta potencial de recuperação. 
                    Caso premium com múltiplas indenizações possíveis.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button className="bg-crm-blue hover:bg-crm-blue/90 text-white" onClick={openChatModal}>
                    Ver Conversas
                  </Button>
                  <Button variant="destructive" className="bg-crm-red hover:bg-crm-red/90">
                    Pausar Rafael
                  </Button>
                </div>
              </div>
            </ScrollArea>}
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Histórico de Conversas</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-96 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {mockChatMessages.map((msg, index) => <div key={index} className={`flex ${msg.sender === 'lead' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === 'lead' ? 'bg-crm-blue text-white' : 'bg-muted text-foreground'}`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'lead' ? 'text-blue-100' : 'text-muted-foreground'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default CRMDashboard;