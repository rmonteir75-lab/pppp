import React, { useState, useMemo } from 'react';
import { ServiceRequest, ProfessionalProfile } from '../types';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Calendar, 
  Send, 
  User, 
  Filter, 
  Search, 
  MessageCircle, 
  ArrowRight, 
  Check, 
  X, 
  Briefcase,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw
} from 'lucide-react';

interface SalesFunnelCRMProps {
  requests: ServiceRequest[];
  professionals: ProfessionalProfile[];
  onUpdateStatus: (requestId: string, status: ServiceRequest['status']) => void;
  onOpenQuoteForm: (req: ServiceRequest) => void;
  onDeleteRequest?: (requestId: string) => void;
}

export type FunnelStageId = 
  | 'novo_lead' 
  | 'triagem_orcamento' 
  | 'orcamento_enviado' 
  | 'aprovado' 
  | 'em_execucao' 
  | 'concluido' 
  | 'cancelado';

interface StageDefinition {
  id: FunnelStageId;
  title: string;
  subtitle: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  iconColor: string;
  matchesStatus: (status: ServiceRequest['status']) => boolean;
  targetStatus: ServiceRequest['status'];
}

export const SalesFunnelCRM: React.FC<SalesFunnelCRMProps> = ({
  requests,
  professionals,
  onUpdateStatus,
  onOpenQuoteForm,
  onDeleteRequest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedProf, setSelectedProf] = useState<string>('todos');
  const [selectedCardForNotes, setSelectedCardForNotes] = useState<ServiceRequest | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<'kanban' | 'list'>('kanban');

  // Stages Definition
  const stages: StageDefinition[] = useMemo(() => [
    {
      id: 'novo_lead',
      title: '1. Novos Leads',
      subtitle: 'Entrada pelo site/app',
      color: 'from-blue-600 to-cyan-600',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      borderColor: 'border-blue-300',
      iconColor: 'text-blue-600',
      matchesStatus: (s) => s === 'pendente_orcamento',
      targetStatus: 'pendente_orcamento'
    },
    {
      id: 'orcamento_enviado',
      title: '2. Proposta Enviada',
      subtitle: 'Em negociação / aguardando aceite',
      color: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
      borderColor: 'border-amber-300',
      iconColor: 'text-amber-600',
      matchesStatus: (s) => s === 'orcamento_recebido',
      targetStatus: 'orcamento_recebido'
    },
    {
      id: 'aprovado',
      title: '3. Aprovado / Fechado',
      subtitle: 'Cliente aceitou proposta',
      color: 'from-indigo-600 to-purple-600',
      badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
      borderColor: 'border-indigo-300',
      iconColor: 'text-indigo-600',
      matchesStatus: (s) => s === 'aprovado',
      targetStatus: 'aprovado'
    },
    {
      id: 'em_execucao',
      title: '4. Em Operação',
      subtitle: 'Profissional em atendimento',
      color: 'from-sky-600 to-blue-700',
      badgeBg: 'bg-sky-100 text-sky-900 border-sky-200',
      borderColor: 'border-sky-300',
      iconColor: 'text-sky-600',
      matchesStatus: (s) => s === 'em_execucao',
      targetStatus: 'em_execucao'
    },
    {
      id: 'concluido',
      title: '5. Concluído & Faturado',
      subtitle: 'Serviço finalizado com sucesso',
      color: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      borderColor: 'border-emerald-300',
      iconColor: 'text-emerald-600',
      matchesStatus: (s) => s === 'concluido' || s === 'avaliado',
      targetStatus: 'concluido'
    },
    {
      id: 'cancelado',
      title: 'Perdidos / Cancelados',
      subtitle: 'Recusados ou cancelados',
      color: 'from-slate-500 to-slate-700',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      borderColor: 'border-slate-300',
      iconColor: 'text-slate-500',
      matchesStatus: (s) => s === 'cancelado',
      targetStatus: 'cancelado'
    }
  ], []);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchSearch = 
        req.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.clientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.serviceTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = selectedCategory === 'todos' || req.serviceId === selectedCategory;
      const matchProf = selectedProf === 'todos' || req.assignedProfessional === selectedProf;

      return matchSearch && matchCategory && matchProf;
    });
  }, [requests, searchTerm, selectedCategory, selectedProf]);

  // Funnel Analytics & KPIs
  const metrics = useMemo(() => {
    const total = requests.length;
    const novosLeads = requests.filter(r => r.status === 'pendente_orcamento').length;
    const propostasEnviadas = requests.filter(r => r.status === 'orcamento_recebido').length;
    const aprovados = requests.filter(r => r.status === 'aprovado' || r.status === 'em_execucao').length;
    const concluidos = requests.filter(r => r.status === 'concluido' || r.status === 'avaliado').length;
    const cancelados = requests.filter(r => r.status === 'cancelado').length;

    // Pipeline Value (em negociação ou aprovado)
    const pipelineValue = requests
      .filter(r => ['orcamento_recebido', 'aprovado', 'em_execucao'].includes(r.status))
      .reduce((acc, curr) => acc + (curr.quotedPrice || 0), 0);

    // Total Faturado Concluído
    const totalFaturado = requests
      .filter(r => ['concluido', 'avaliado'].includes(r.status))
      .reduce((acc, curr) => acc + (curr.quotedPrice || 0), 0);

    // Ticket Médio
    const pricedRequests = requests.filter(r => (r.quotedPrice || 0) > 0);
    const avgTicket = pricedRequests.length > 0 
      ? pricedRequests.reduce((acc, curr) => acc + (curr.quotedPrice || 0), 0) / pricedRequests.length 
      : 0;

    // Taxa de Conversão Geral (Aprovados + Concluídos / Total de Leads Não Cancelados)
    const totalValidos = total - cancelados;
    const conversionRate = totalValidos > 0 
      ? Math.round(((aprovados + concluidos) / totalValidos) * 100) 
      : 0;

    return {
      total,
      novosLeads,
      propostasEnviadas,
      aprovados,
      concluidos,
      cancelados,
      pipelineValue,
      totalFaturado,
      avgTicket,
      conversionRate
    };
  }, [requests]);

  // Unique categories in requests
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    requests.forEach(r => {
      if (r.serviceId) cats.add(r.serviceId);
    });
    return Array.from(cats);
  }, [requests]);

  // Quick WhatsApp Dispatch
  const handleOpenWhatsApp = (req: ServiceRequest) => {
    const rawPhone = req.clientPhone?.replace(/\D/g, '') || '';
    const phoneWithCountry = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
    
    let message = `Olá, ${req.clientName}! Aqui é da SM Express referente ao seu pedido de ${req.serviceTitle}.`;
    if (req.quotedPrice) {
      message += ` Seu orçamento foi calculado em R$ ${req.quotedPrice.toFixed(2)} (${req.estimatedHours || 'prazo a combinar'}). Como podemos agendar?`;
    } else {
      message += ` Estamos prontos para analisar sua solicitação e enviar a melhor proposta.`;
    }

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & KPI Summary */}
      <div className="bg-gradient-to-r from-[#001838] via-[#022452] to-[#001838] p-6 rounded-3xl text-white shadow-xl border border-blue-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-blue-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                CRM Comercial
              </span>
              <span className="text-xs text-blue-200 font-semibold">Gestão de Oportunidades</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Funil de Vendas & Conversão</h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
              Acompanhe a jornada de cada solicitação desde a entrada inicial do lead até o fechamento, execução e faturamento.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeViewMode === 'kanban' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Visão Kanban
              </button>
              <button
                onClick={() => setActiveViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeViewMode === 'list' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Visão Lista
              </button>
            </div>
          </div>
        </div>

        {/* Funnel Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
          {/* KPI 1: Taxa de Conversão */}
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Taxa de Conversão</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2">
              {metrics.conversionRate}%
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {metrics.aprovados + metrics.concluidos} fechados de {metrics.total} recebidos
            </span>
          </div>

          {/* KPI 2: Valor no Pipeline */}
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Valor em Negociação</span>
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">
              R$ {metrics.pipelineValue.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Propostas ativas aguardando ou em curso
            </span>
          </div>

          {/* KPI 3: Ticket Médio */}
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Ticket Médio</span>
              <div className="w-8 h-8 rounded-xl bg-blue-400/20 text-blue-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mt-2">
              R$ {metrics.avgTicket.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Valor médio por ordem orçada
            </span>
          </div>

          {/* KPI 4: Total Faturado */}
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Total Faturado</span>
              <div className="w-8 h-8 rounded-xl bg-purple-400/20 text-purple-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-300 mt-2">
              R$ {metrics.totalFaturado.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {metrics.concluidos} serviços concluídos
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, serviço, cidade ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          {/* Filter Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          >
            <option value="todos">Todos os Serviços</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat.replace(/_/g, ' ').toUpperCase()}</option>
            ))}
          </select>

          {/* Filter Professional */}
          {professionals.length > 0 && (
            <select
              value={selectedProf}
              onChange={(e) => setSelectedProf(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              <option value="todos">Todos os Prestadores</option>
              {professionals.map(p => (
                <option key={p.id} value={p.fullName}>{p.fullName}</option>
              ))}
            </select>
          )}
        </div>

        <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 self-end md:self-auto">
          <span>{filteredRequests.length} oportunidades filtradas</span>
        </div>
      </div>

      {/* Visual Pipeline Funnel View (Kanban Columns) */}
      {activeViewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageRequests = filteredRequests.filter(req => stage.matchesStatus(req.status));
            const stageTotalValue = stageRequests.reduce((sum, r) => sum + (r.quotedPrice || 0), 0);

            return (
              <div 
                key={stage.id}
                className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-3 flex flex-col min-h-[480px] shadow-sm"
              >
                {/* Column Header */}
                <div className="pb-2.5 border-b border-slate-200 mb-3">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-slate-800 truncate">{stage.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${stage.badgeBg}`}>
                      {stageRequests.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span className="truncate">{stage.subtitle}</span>
                    {stageTotalValue > 0 && (
                      <span className="font-bold text-slate-700 whitespace-nowrap">
                        R$ {stageTotalValue.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-0.5">
                  {stageRequests.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-white/50">
                      Nenhum lead nesta etapa.
                    </div>
                  ) : (
                    stageRequests.map((req) => (
                      <div 
                        key={req.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400/80 transition-all space-y-2.5 group relative"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              {req.id}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug line-clamp-2">
                              {req.serviceTitle}
                            </h4>
                          </div>
                          {req.quotedPrice ? (
                            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60 whitespace-nowrap">
                              R$ {req.quotedPrice.toFixed(0)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              A orçar
                            </span>
                          )}
                        </div>

                        {/* Client & Address Info */}
                        <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50/80 p-2 rounded-lg">
                          <div className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                            <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{req.clientName}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{req.city} - {req.neighborhood || req.street}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {req.desiredDate || 'Data a combinar'}
                            </span>
                            {req.assignedProfessional && (
                              <span className="font-semibold text-indigo-700 truncate max-w-[100px]" title={req.assignedProfessional}>
                                {req.assignedProfessional}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stage Progression Actions */}
                        <div className="pt-1.5 border-t border-slate-100 flex flex-col gap-1.5">
                          {/* Quick Action 1: Enviar/Editar Orçamento */}
                          {req.status === 'pendente_orcamento' && (
                            <button
                              onClick={() => onOpenQuoteForm(req)}
                              className="w-full py-1.5 bg-[#001838] hover:bg-[#022452] text-amber-400 font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                            >
                              <Send className="w-3 h-3" />
                              <span>Emitir Orçamento</span>
                            </button>
                          )}

                          {/* Quick Action 2: Avançar para Aprovado */}
                          {req.status === 'orcamento_recebido' && (
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                onClick={() => onUpdateStatus(req.id, 'aprovado')}
                                className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Aprovar</span>
                              </button>
                              <button
                                onClick={() => onOpenQuoteForm(req)}
                                className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center"
                              >
                                Reorçar
                              </button>
                            </div>
                          )}

                          {/* Quick Action 3: Iniciar Operação */}
                          {req.status === 'aprovado' && (
                            <button
                              onClick={() => onUpdateStatus(req.id, 'em_execucao')}
                              className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Briefcase className="w-3 h-3" />
                              <span>Iniciar Atendimento</span>
                            </button>
                          )}

                          {/* Quick Action 4: Concluir */}
                          {req.status === 'em_execucao' && (
                            <button
                              onClick={() => onUpdateStatus(req.id, 'concluido')}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Concluir Serviço</span>
                            </button>
                          )}

                          {/* Action Bottom Row: WhatsApp & Status Switcher */}
                          <div className="flex items-center justify-between gap-1 pt-1">
                            <button
                              onClick={() => handleOpenWhatsApp(req)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-md transition-colors flex items-center gap-1"
                              title="Conversar com o cliente no WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>

                            {/* Dropdown status selector */}
                            <select
                              value={req.status}
                              onChange={(e) => onUpdateStatus(req.id, e.target.value as ServiceRequest['status'])}
                              className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded px-1.5 py-0.5 border border-slate-200 focus:outline-none cursor-pointer"
                              title="Alterar fase manualmente"
                            >
                              <option value="pendente_orcamento">Novo Lead</option>
                              <option value="orcamento_recebido">Orçamento Enviado</option>
                              <option value="aprovado">Aprovado</option>
                              <option value="em_execucao">Em Execução</option>
                              <option value="concluido">Concluído</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View of the Funnel */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b">
                <tr>
                  <th className="p-3.5">ID / Data</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Serviço Solicitado</th>
                  <th className="p-3.5">Localização</th>
                  <th className="p-3.5">Fase no Funil</th>
                  <th className="p-3.5">Valor Proposto</th>
                  <th className="p-3.5">Prestador</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Nenhuma oportunidade encontrada com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded block w-max text-[10px]">
                          {req.id}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{req.clientName}</span>
                        <span className="text-[10px] text-slate-500">{req.clientPhone}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800">{req.serviceTitle}</span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {req.city} ({req.neighborhood || req.street})
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          req.status === 'pendente_orcamento' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'orcamento_recebido' ? 'bg-amber-100 text-amber-900' :
                          req.status === 'aprovado' ? 'bg-indigo-100 text-indigo-900' :
                          req.status === 'em_execucao' ? 'bg-sky-100 text-sky-900' :
                          req.status === 'concluido' ? 'bg-emerald-100 text-emerald-900' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {req.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {req.quotedPrice ? `R$ ${req.quotedPrice.toFixed(2)}` : <span className="text-slate-400 italic">Pendente</span>}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {req.assignedProfessional || <span className="text-slate-400 italic">Não atribuído</span>}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenWhatsApp(req)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenQuoteForm(req)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg text-[10px] transition-colors"
                          >
                            Orçamento
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
