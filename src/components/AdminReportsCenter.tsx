import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  Users, 
  Briefcase, 
  Layers, 
  ArrowUpRight, 
  FileSpreadsheet, 
  RefreshCw,
  Eye,
  FileCheck,
  TrendingUp,
  Building2,
  Phone,
  MapPin,
  X,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Check,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  ServiceRequest, 
  ProfessionalProfile, 
  CommissionCharge, 
  UserAccount, 
  ServiceDefinition 
} from '../types';
import { SMExpressLogo } from './SMExpressLogo';

export type ReportType = 
  | 'clientes_solicitacoes'
  | 'orcamentos' 
  | 'aceites' 
  | 'comissoes' 
  | 'prestadores' 
  | 'consolidado';

interface AdminReportsCenterProps {
  requests?: ServiceRequest[];
  professionals?: ProfessionalProfile[];
  charges?: CommissionCharge[];
  users?: UserAccount[];
  services?: ServiceDefinition[];
  initialReportType?: ReportType;
  onPurgeAllData?: () => void;
  onDeleteRequest?: (requestId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onDeleteProfessional?: (profId: string) => void;
  onDeleteCharge?: (chargeId: string) => void;
  onBatchDeleteRequests?: (requestIds: string[]) => void;
  onBatchDeleteUsers?: (userIds: string[]) => void;
  onBatchDeleteCharges?: (chargeIds: string[]) => void;
  onBatchDeleteProfessionals?: (profIds: string[]) => void;
}

export const AdminReportsCenter: React.FC<AdminReportsCenterProps> = ({
  requests = [],
  professionals = [],
  charges = [],
  users = [],
  services = [],
  initialReportType,
  onPurgeAllData,
  onDeleteRequest,
  onDeleteUser,
  onDeleteProfessional,
  onDeleteCharge,
  onBatchDeleteRequests,
  onBatchDeleteUsers,
  onBatchDeleteCharges,
  onBatchDeleteProfessionals,
}) => {
  // Report Selection State
  const [selectedReportType, setSelectedReportType] = useState<ReportType>(initialReportType || 'clientes_solicitacoes');

  useEffect(() => {
    if (initialReportType) {
      setSelectedReportType(initialReportType);
    }
  }, [initialReportType]);

  // Client View Mode: 'agrupado' (by client with expandable history) or 'solicitacoes_lista' (flat realized services table)
  const [clientViewMode, setClientViewMode] = useState<'agrupado' | 'solicitacoes_lista'>('agrupado');
  const [expandedClientIds, setExpandedClientIds] = useState<Set<string>>(new Set());

  const toggleClientExpanded = (clientId: string) => {
    setExpandedClientIds(prev => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangePreset, setDateRangePreset] = useState<'all' | 'today' | '7days' | '30days' | 'this_month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoryFilter, setCategoryFilter] = useState('todos');
  const [professionalFilter, setProfessionalFilter] = useState('todos');

  // Print / Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Multi-item selection & zeroing state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isZeroSelectedModalOpen, setIsZeroSelectedModalOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Clear selections when switching tab or view mode
  useEffect(() => {
    setSelectedIds(new Set());
  }, [selectedReportType, clientViewMode]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = (ids: string[]) => {
    setSelectedIds(prev => {
      const allSelected = ids.length > 0 && ids.every(id => prev.has(id));
      if (allSelected) {
        return new Set();
      } else {
        return new Set(ids);
      }
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleConfirmPurgeAll = () => {
    if (onPurgeAllData) {
      onPurgeAllData();
    }
    setSelectedIds(new Set());
    setIsPurgeModalOpen(false);
    setFeedbackNotice('Todo o sistema foi zerado com sucesso! Todos os 4 cartões e métricas retornaram a zero.');
    setTimeout(() => setFeedbackNotice(null), 5000);
  };

  const handleConfirmZeroSelected = () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    if (selectedReportType === 'clientes_solicitacoes') {
      if (clientViewMode === 'agrupado') {
        if (onBatchDeleteUsers) {
          onBatchDeleteUsers(ids);
        } else if (onDeleteUser) {
          ids.forEach(id => onDeleteUser(id));
        }
      } else {
        if (onBatchDeleteRequests) {
          onBatchDeleteRequests(ids);
        } else if (onDeleteRequest) {
          ids.forEach(id => onDeleteRequest(id));
        }
      }
    } else if (selectedReportType === 'orcamentos' || selectedReportType === 'aceites' || selectedReportType === 'consolidado') {
      if (onBatchDeleteRequests) {
        onBatchDeleteRequests(ids);
      } else if (onDeleteRequest) {
        ids.forEach(id => onDeleteRequest(id));
      }
    } else if (selectedReportType === 'comissoes') {
      if (onBatchDeleteCharges) {
        onBatchDeleteCharges(ids);
      } else if (onDeleteCharge) {
        ids.forEach(id => onDeleteCharge(id));
      }
    } else if (selectedReportType === 'prestadores') {
      if (onBatchDeleteProfessionals) {
        onBatchDeleteProfessionals(ids);
      } else if (onDeleteProfessional) {
        ids.forEach(id => onDeleteProfessional(id));
      }
    }

    setSelectedIds(new Set());
    setIsZeroSelectedModalOpen(false);
    setFeedbackNotice(`${ids.length} item(ns) selecionado(s) foram zerados e excluídos com sucesso.`);
    setTimeout(() => setFeedbackNotice(null), 5000);
  };

  const handleSingleZeroClient = (clientId: string, clientName: string) => {
    if (window.confirm(`Deseja zerar e excluir o cliente "${clientName}" e todas as suas solicitações?`)) {
      if (onBatchDeleteUsers) {
        onBatchDeleteUsers([clientId]);
      } else if (onDeleteUser) {
        onDeleteUser(clientId);
      }
      setFeedbackNotice(`Cliente "${clientName}" zerado com sucesso.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const handleSingleZeroRequest = (requestId: string) => {
    if (window.confirm(`Deseja zerar a solicitação #${requestId}?`)) {
      if (onBatchDeleteRequests) {
        onBatchDeleteRequests([requestId]);
      } else if (onDeleteRequest) {
        onDeleteRequest(requestId);
      }
      setFeedbackNotice(`Solicitação #${requestId} zerada.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const handleSingleZeroCharge = (chargeId: string) => {
    if (window.confirm(`Deseja zerar a cobrança de comissão #${chargeId}?`)) {
      if (onBatchDeleteCharges) {
        onBatchDeleteCharges([chargeId]);
      } else if (onDeleteCharge) {
        onDeleteCharge(chargeId);
      }
      setFeedbackNotice(`Cobrança #${chargeId} zerada.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const handleSingleZeroProfessional = (profId: string, profName: string) => {
    if (window.confirm(`Deseja zerar o cadastro do prestador "${profName}"?`)) {
      if (onBatchDeleteProfessionals) {
        onBatchDeleteProfessionals([profId]);
      } else if (onDeleteProfessional) {
        onDeleteProfessional(profId);
      }
      setFeedbackNotice(`Prestador "${profName}" zerado.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  // Helper date parsing
  const isDateInRange = (dateStr?: string) => {
    if (!dateStr) return true;
    if (dateRangePreset === 'all') return true;

    const itemDate = new Date(dateStr);
    if (isNaN(itemDate.getTime())) return true;

    const now = new Date();

    if (dateRangePreset === 'today') {
      return itemDate.toDateString() === now.toDateString();
    }
    if (dateRangePreset === '7days') {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      return itemDate >= past7;
    }
    if (dateRangePreset === '30days') {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      return itemDate >= past30;
    }
    if (dateRangePreset === 'this_month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    if (dateRangePreset === 'custom') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) return false;
      }
      return true;
    }
    return true;
  };

  // Helper format currency
  const formatMoney = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Helper format date
  const formatDate = (val?: string) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return val;
    }
  };

  // =========================================================================
  // 0. DATASET: Clientes & Solicitações de Serviços Realizadas
  // =========================================================================
  const clientsData = useMemo(() => {
    // 1. Gather all client accounts from users
    const clientUserMap = new Map<string, UserAccount>();

    users.forEach(u => {
      if (u.role === 'cliente' || (!u.role && u.email !== 'suportesmservicos@gmail.com' && u.email !== 'rmonteir75@gmail.com')) {
        const key = u.email ? u.email.toLowerCase().trim() : u.id;
        clientUserMap.set(key, u);
      }
    });

    // 2. Also detect clients who made requests but might not be in users table yet
    requests.forEach(r => {
      const key = r.clientEmail ? r.clientEmail.toLowerCase().trim() : `name_${r.clientName.toLowerCase().trim()}`;
      if (!clientUserMap.has(key)) {
        clientUserMap.set(key, {
          id: `CLI-${Math.abs(r.clientName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0))}`,
          name: r.clientName,
          email: r.clientEmail || 'cliente@contato.com',
          phone: r.clientPhone || '',
          role: 'cliente',
          status: 'ativo',
          createdAt: r.createdAt,
          street: r.street || '',
          number: r.number || '',
          neighborhood: r.neighborhood || '',
          city: r.city || 'Taubaté',
          state: r.state || 'SP',
          cep: r.cep || ''
        });
      }
    });

    // 3. For each client, associate all their service requests
    const list = Array.from(clientUserMap.values()).map(client => {
      const clientRequests = requests.filter(r => {
        const matchEmail = client.email && r.clientEmail && client.email.toLowerCase().trim() === r.clientEmail.toLowerCase().trim();
        const matchPhone = client.phone && r.clientPhone && client.phone.replace(/\D/g, '') === r.clientPhone.replace(/\D/g, '');
        const matchName = r.clientName && client.name && r.clientName.trim().toLowerCase() === client.name.trim().toLowerCase();
        return matchEmail || matchPhone || matchName;
      });

      // Sort by date newest first
      clientRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Realized requests: concluded or in progress or approved/accepted
      const realizedRequests = clientRequests.filter(r => 
        ['concluido', 'em_execucao', 'aprovado', 'orcamento_aceito', 'avaliado'].includes(r.status)
      );

      const completedRequests = clientRequests.filter(r => 
        ['concluido', 'avaliado'].includes(r.status)
      );

      const totalSpent = realizedRequests.reduce((acc, r) => acc + (r.quotedPrice || 0), 0);

      return {
        client,
        requests: clientRequests,
        realizedRequests,
        completedRequests,
        totalRequestsCount: clientRequests.length,
        realizedRequestsCount: realizedRequests.length,
        completedRequestsCount: completedRequests.length,
        totalSpent
      };
    });

    // Sort: clients with more realized requests or newest
    list.sort((a, b) => {
      if (b.realizedRequestsCount !== a.realizedRequestsCount) {
        return b.realizedRequestsCount - a.realizedRequestsCount;
      }
      return new Date(b.client.createdAt || 0).getTime() - new Date(a.client.createdAt || 0).getTime();
    });

    // Filter by searchTerm, statusFilter, dateRange
    return list.filter(item => {
      const c = item.client;
      const matchesSearch = 
        !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.cpfCnpj && c.cpfCnpj.includes(searchTerm)) ||
        (c.neighborhood && c.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.requests.some(r => r.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'todos' ||
        (statusFilter === 'com_realizados' && item.realizedRequestsCount > 0) ||
        (statusFilter === 'com_pedidos' && item.totalRequestsCount > 0) ||
        (statusFilter === 'ativo' && c.status === 'ativo') ||
        (statusFilter === 'bloqueado' && c.status === 'bloqueado');

      const matchesDate = isDateInRange(c.createdAt || item.requests[0]?.createdAt);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [users, requests, searchTerm, statusFilter, dateRangePreset, startDate, endDate]);

  // Flat List of ALL Realized Requests
  const allRealizedRequests = useMemo(() => {
    return requests.filter(r => {
      const isRealized = ['concluido', 'em_execucao', 'aprovado', 'orcamento_aceito', 'avaliado'].includes(r.status);
      if (!isRealized) return false;

      const matchesSearch = 
        !searchTerm ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.assignedProfessional && r.assignedProfessional.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.clientPhone && r.clientPhone.includes(searchTerm));

      const matchesDate = isDateInRange(r.createdAt);

      return matchesSearch && matchesDate;
    });
  }, [requests, searchTerm, dateRangePreset, startDate, endDate]);

  // =========================================================================
  // 1. DATASET: Relatório de Orçamentos
  // =========================================================================
  const filteredQuotes = useMemo(() => {
    return requests.filter(req => {
      // Must be relevant to quotes (has a quote price or is awaiting/processing)
      const matchesSearch = 
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.assignedProfessional && req.assignedProfessional.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (req.clientPhone && req.clientPhone.includes(searchTerm));

      const matchesStatus = 
        statusFilter === 'todos' || 
        req.status === statusFilter;

      const matchesCategory = 
        categoryFilter === 'todos' || 
        req.serviceId === categoryFilter;

      const matchesProf = 
        professionalFilter === 'todos' || 
        req.assignedProfessional === professionalFilter;

      const matchesDate = isDateInRange(req.createdAt);

      return matchesSearch && matchesStatus && matchesCategory && matchesProf && matchesDate;
    });
  }, [requests, searchTerm, statusFilter, categoryFilter, professionalFilter, dateRangePreset, startDate, endDate]);

  // =========================================================================
  // 2. DATASET: Relatório de Aceites de Serviço
  // =========================================================================
  const filteredAcceptances = useMemo(() => {
    // Services that reached acceptance: 'aprovado', 'em_execucao', 'concluido'
    const acceptedRequests = requests.filter(r => 
      ['aprovado', 'em_execucao', 'concluido'].includes(r.status)
    );

    return acceptedRequests.filter(req => {
      const matchesSearch = 
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.assignedProfessional && req.assignedProfessional.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (req.clientPhone && req.clientPhone.includes(searchTerm));

      const matchesStatus = 
        statusFilter === 'todos' || 
        req.status === statusFilter;

      const matchesCategory = 
        categoryFilter === 'todos' || 
        req.serviceId === categoryFilter;

      const matchesProf = 
        professionalFilter === 'todos' || 
        req.assignedProfessional === professionalFilter;

      const matchesDate = isDateInRange(req.createdAt);

      return matchesSearch && matchesStatus && matchesCategory && matchesProf && matchesDate;
    });
  }, [requests, searchTerm, statusFilter, categoryFilter, professionalFilter, dateRangePreset, startDate, endDate]);

  // =========================================================================
  // 3. DATASET: Relatório Financeiro & Comissões (30%)
  // =========================================================================
  const filteredCommissions = useMemo(() => {
    return charges.filter(charge => {
      const matchesSearch = 
        charge.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charge.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (charge.professionalPhone && charge.professionalPhone.includes(searchTerm));

      const matchesStatus = 
        statusFilter === 'todos' || 
        charge.status === statusFilter;

      const matchesProf = 
        professionalFilter === 'todos' || 
        charge.professionalName === professionalFilter;

      const matchesDate = isDateInRange(charge.createdAt);

      return matchesSearch && matchesStatus && matchesProf && matchesDate;
    });
  }, [charges, searchTerm, statusFilter, professionalFilter, dateRangePreset, startDate, endDate]);

  // =========================================================================
  // 4. DATASET: Relatório de Prestadores & Conformidade
  // =========================================================================
  const filteredProfessionals = useMemo(() => {
    return professionals.filter(prof => {
      const matchesSearch = 
        prof.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.phone.includes(searchTerm) ||
        prof.cpfCnpj.includes(searchTerm) ||
        prof.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'todos' || 
        prof.status === statusFilter;

      const matchesCategory = 
        categoryFilter === 'todos' || 
        prof.categories.includes(categoryFilter as any);

      const matchesDate = isDateInRange(prof.createdAt);

      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [professionals, searchTerm, statusFilter, categoryFilter, dateRangePreset, startDate, endDate]);

  // =========================================================================
  // Estatísticas e Métricas Dinâmicas por Relatório
  // =========================================================================
  const metrics = useMemo(() => {
    if (selectedReportType === 'clientes_solicitacoes') {
      const totalClientsCount = clientsData.length;
      const totalRealizedCount = allRealizedRequests.length;
      const totalRealizedValue = allRealizedRequests.reduce((acc, r) => acc + (r.quotedPrice || 0), 0);
      const avgTicket = totalRealizedCount > 0 ? (totalRealizedValue / totalRealizedCount) : 0;

      return {
        card1: { label: 'Clientes Registrados', val: totalClientsCount, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        card2: { label: 'Serviços Realizados', val: totalRealizedCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        card3: { label: 'Volume Total Realizado', val: formatMoney(totalRealizedValue), icon: DollarSign, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        card4: { label: 'Ticket Médio / Serviço', val: formatMoney(avgTicket), icon: TrendingUp, color: 'text-purple-600 bg-purple-50 border-purple-200' },
      };
    }

    if (selectedReportType === 'orcamentos') {
      const totalCount = filteredQuotes.length;
      const totalQuotedValue = filteredQuotes.reduce((acc, q) => acc + (q.quotedPrice || 0), 0);
      const approvedCount = filteredQuotes.filter(q => ['aprovado', 'em_execucao', 'concluido'].includes(q.status)).length;
      const pendingCount = filteredQuotes.filter(q => ['novo', 'em_analise', 'orcamento_recebido', 'aguardando_aprovacao'].includes(q.status)).length;
      const conversionRate = totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(1) : '0';

      return {
        card1: { label: 'Total de Orçamentos', val: totalCount, icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        card2: { label: 'Valor Total Orçado', val: formatMoney(totalQuotedValue), icon: DollarSign, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        card3: { label: 'Orçamentos Aprovados', val: approvedCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        card4: { label: 'Taxa de Conversão', val: `${conversionRate}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50 border-purple-200' },
      };
    }

    if (selectedReportType === 'aceites') {
      const totalAccepted = filteredAcceptances.length;
      const totalServiceVolume = filteredAcceptances.reduce((acc, a) => acc + (a.quotedPrice || 0), 0);
      const totalCommissionsEarnable = totalServiceVolume * 0.30;
      const completedCount = filteredAcceptances.filter(a => a.status === 'concluido').length;

      return {
        card1: { label: 'Serviços Aceitos / Fechados', val: totalAccepted, icon: FileCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        card2: { label: 'Volume Total Negociado', val: formatMoney(totalServiceVolume), icon: DollarSign, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        card3: { label: 'Comissões Estimadas (30%)', val: formatMoney(totalCommissionsEarnable), icon: TrendingUp, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        card4: { label: 'Serviços Concluídos', val: completedCount, icon: CheckCircle2, color: 'text-purple-600 bg-purple-50 border-purple-200' },
      };
    }

    if (selectedReportType === 'comissoes') {
      const totalCharges = filteredCommissions.length;
      const totalServiceVal = filteredCommissions.reduce((acc, c) => acc + c.serviceValue, 0);
      const totalCommissionVal = filteredCommissions.reduce((acc, c) => acc + c.commissionValue, 0);
      const paidCommissions = filteredCommissions.filter(c => c.status === 'pago').reduce((acc, c) => acc + c.commissionValue, 0);
      const pendingCommissions = filteredCommissions.filter(c => c.status === 'pendente').reduce((acc, c) => acc + c.commissionValue, 0);
      const overdueCount = filteredCommissions.filter(c => c.status === 'atrasado' || c.status === 'bloqueado').length;

      return {
        card1: { label: 'Total Comissões SM Express', val: formatMoney(totalCommissionVal), icon: DollarSign, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        card2: { label: 'Comissões Liquidadas (Pagas)', val: formatMoney(paidCommissions), icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        card3: { label: 'Comissões a Receber (Pendentes)', val: formatMoney(pendingCommissions), icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        card4: { label: 'Inadimplências / Atrasadas', val: overdueCount, icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
      };
    }

    if (selectedReportType === 'prestadores') {
      const totalProfs = filteredProfessionals.length;
      const approvedProfs = filteredProfessionals.filter(p => p.status === 'aprovado').length;
      const pendingProfs = filteredProfessionals.filter(p => p.status === 'pendente_aprovacao' || p.status === 'em_analise').length;
      const signedTerms = filteredProfessionals.filter(p => p.contractSigned).length;

      return {
        card1: { label: 'Total Prestadores', val: totalProfs, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
        card2: { label: 'Prestadores Homologados', val: approvedProfs, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
        card3: { label: 'Cadastros em Análise', val: pendingProfs, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
        card4: { label: 'Contratos / Termos Assinados', val: signedTerms, icon: FileCheck, color: 'text-purple-600 bg-purple-50 border-purple-200' },
      };
    }

    // Consolidado
    return {
      card1: { label: 'Total de Pedidos', val: requests.length, icon: Layers, color: 'text-blue-600 bg-blue-50 border-blue-200' },
      card2: { label: 'Volume Orçado Total', val: formatMoney(requests.reduce((a, b) => a + (b.quotedPrice || 0), 0)), icon: DollarSign, color: 'text-amber-600 bg-amber-50 border-amber-200' },
      card3: { label: 'Total Prestadores Ativos', val: professionals.filter(p => p.status === 'aprovado').length, icon: Users, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
      card4: { label: 'Comissões Faturadas', val: formatMoney(charges.filter(c => c.status === 'pago').reduce((a, b) => a + b.commissionValue, 0)), icon: TrendingUp, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    };
  }, [selectedReportType, clientsData, allRealizedRequests, filteredQuotes, filteredAcceptances, filteredCommissions, filteredProfessionals, requests, charges, professionals]);

  // =========================================================================
  // EXPORTADORES (CSV / EXCEL & PRINT)
  // =========================================================================
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let fileName = `sm_express_relatorio_${selectedReportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (selectedReportType === 'clientes_solicitacoes') {
      fileName = `sm_express_clientes_solicitacoes_realizadas_${new Date().toISOString().slice(0, 10)}.csv`;
      headers = [
        'ID Cliente',
        'Nome Completo',
        'CPF/CNPJ',
        'E-mail',
        'WhatsApp / Celular',
        'Endereço Completo',
        'Bairro',
        'Cidade/UF',
        'CEP',
        'Data Cadastro Cliente',
        'Status da Conta',
        'Total Solicitações',
        'Solicitações Realizadas',
        'Total Gasto Cliente (R$)',
        'ID Solicitação',
        'Data Solicitação',
        'Serviço Realizado',
        'Categoria',
        'Prestador Designado',
        'Valor do Serviço (R$)',
        'Comissão SM Express 30% (R$)',
        'Status da Execução',
        'Endereço do Atendimento'
      ];

      rows = [];
      clientsData.forEach(item => {
        const c = item.client;
        const fullAddr = [c.street, c.number, c.complement, c.neighborhood, `${c.city || 'Taubaté'}/${c.state || 'SP'}`]
          .filter(Boolean)
          .join(', ');

        if (item.requests.length === 0) {
          rows.push([
            c.id,
            `"${c.name}"`,
            `"${c.cpfCnpj || ''}"`,
            `"${c.email || ''}"`,
            `"${c.phone || ''}"`,
            `"${fullAddr}"`,
            `"${c.neighborhood || ''}"`,
            `"${c.city || 'Taubaté'}/${c.state || 'SP'}"`,
            `"${c.cep || ''}"`,
            formatDate(c.createdAt),
            `"${c.status || 'ativo'}"`,
            0,
            0,
            '0,00',
            '—',
            '—',
            'Nenhuma solicitação cadastrada',
            '—',
            '—',
            '0,00',
            '0,00',
            'Sem pedidos',
            '—'
          ]);
        } else {
          item.requests.forEach(r => {
            const reqAddr = [r.street, r.number, r.neighborhood, `${r.city || 'Taubaté'}/${r.state || 'SP'}`]
              .filter(Boolean)
              .join(', ');
            const val = r.quotedPrice || 0;
            const com = val * 0.30;
            rows.push([
              c.id,
              `"${c.name}"`,
              `"${c.cpfCnpj || ''}"`,
              `"${c.email || ''}"`,
              `"${c.phone || ''}"`,
              `"${fullAddr}"`,
              `"${c.neighborhood || ''}"`,
              `"${c.city || 'Taubaté'}/${c.state || 'SP'}"`,
              `"${c.cep || ''}"`,
              formatDate(c.createdAt),
              `"${c.status || 'ativo'}"`,
              item.totalRequestsCount,
              item.realizedRequestsCount,
              item.totalSpent.toFixed(2).replace('.', ','),
              r.id,
              formatDate(r.createdAt),
              `"${r.serviceTitle}"`,
              `"${r.serviceId}"`,
              `"${r.assignedProfessional || 'Pendente'}"`,
              val.toFixed(2).replace('.', ','),
              com.toFixed(2).replace('.', ','),
              `"${r.status}"`,
              `"${reqAddr}"`
            ]);
          });
        }
      });
    } else if (selectedReportType === 'orcamentos') {
      headers = [
        'ID Pedido', 
        'Data Solicitação', 
        'Cliente', 
        'Telefone WhatsApp', 
        'Endereço Completo', 
        'Cidade/UF',
        'Categoria', 
        'Serviço', 
        'Descrição do Problema',
        'Data Desejada', 
        'Profissional Designado', 
        'Valor Orçado (R$)', 
        'Status do Orçamento'
      ];
      rows = filteredQuotes.map(q => {
        const descriptionText = Object.entries(q.details || {}).map(([k, v]) => `${k}: ${v}`).join('; ') || q.serviceTitle;
        return [
          q.id,
          formatDate(q.createdAt),
          `"${q.clientName}"`,
          `"${q.clientPhone || ''}"`,
          `"${[q.street, q.number, q.neighborhood].filter(Boolean).join(', ')}"`,
          `"${q.city || 'Taubaté'}/${q.state || 'SP'}"`,
          `"${q.serviceId}"`,
          `"${q.serviceTitle}"`,
          `"${descriptionText.replace(/"/g, '""')}"`,
          `"${q.desiredDate || ''}"`,
          `"${q.assignedProfessional || 'Não atribuído'}"`,
          (q.quotedPrice || 0).toFixed(2).replace('.', ','),
          `"${q.status}"`
        ];
      });
    } else if (selectedReportType === 'aceites') {
      headers = [
        'ID Pedido', 
        'Data Aceite', 
        'Cliente', 
        'Telefone WhatsApp', 
        'Prestador Designado', 
        'Endereço de Atendimento',
        'Categoria', 
        'Serviço Aceito', 
        'Valor do Serviço (R$)', 
        'Taxa Comissão (%)',
        'Valor Comissão SM Express (R$)',
        'Data Agendada',
        'Status de Execução'
      ];
      rows = filteredAcceptances.map(a => [
        a.id,
        formatDate(a.createdAt),
        `"${a.clientName}"`,
        `"${a.clientPhone || ''}"`,
        `"${a.assignedProfessional || 'Nenhum'}"`,
        `"${[a.street, a.number, a.neighborhood, a.city, a.state].filter(Boolean).join(', ')}"`,
        `"${a.serviceId}"`,
        `"${a.serviceTitle}"`,
        (a.quotedPrice || 0).toFixed(2).replace('.', ','),
        '30%',
        ((a.quotedPrice || 0) * 0.30).toFixed(2).replace('.', ','),
        `"${a.scheduledDate || a.desiredDate || ''}"`,
        `"${a.status}"`
      ]);
    } else if (selectedReportType === 'comissoes') {
      headers = [
        'ID Cobrança', 
        'ID Pedido', 
        'Data Geração', 
        'Prestador / Fornecedor', 
        'CPF/CNPJ Prestador',
        'Telefone Prestador', 
        'Cliente Final',
        'Serviço Prestado', 
        'Valor do Serviço (R$)', 
        'Comissão (%)', 
        'Valor da Comissão (R$)', 
        'Data de Vencimento', 
        'Status Pagamento',
        'Código Pix',
        'NF-e / Boleto'
      ];
      rows = filteredCommissions.map(c => [
        c.id,
        c.requestId,
        formatDate(c.createdAt),
        `"${c.professionalName}"`,
        `"${c.professionalCpfCnpj || ''}"`,
        `"${c.professionalPhone || ''}"`,
        `"${c.clientName}"`,
        `"${c.serviceTitle}"`,
        c.serviceValue.toFixed(2).replace('.', ','),
        `${c.commissionPercent}%`,
        c.commissionValue.toFixed(2).replace('.', ','),
        formatDate(c.dueDate),
        `"${c.status}"`,
        `"${c.pixCopiaCola || ''}"`,
        (c.boletoLinhaDigitavel || c.boletoUrl || c.nfseNumero) ? 'Emitido' : 'Pendente'
      ]);
    } else if (selectedReportType === 'prestadores') {
      headers = [
        'ID Prestador', 
        'Data Cadastro', 
        'Nome Completo', 
        'CPF/CNPJ', 
        'E-mail', 
        'Telefone', 
        'Endereço / Cidade', 
        'Categorias Habilitadas', 
        'Termo de Parceria Assinado', 
        'Documentação Anexada',
        'Status Homologação'
      ];
      rows = filteredProfessionals.map(p => [
        p.id,
        formatDate(p.createdAt),
        `"${p.fullName}"`,
        `"${p.cpfCnpj}"`,
        `"${p.email}"`,
        `"${p.phone}"`,
        `"${p.city}/${p.state}"`,
        `"${p.categories.join(', ')}"`,
        p.contractSigned ? 'Sim (30% Aceito)' : 'Pendente',
        p.documents?.length || 0,
        `"${p.status}"`
      ]);
    } else {
      // Consolidado
      headers = [
        'ID Pedido',
        'Data',
        'Cliente',
        'Telefone',
        'Categoria',
        'Serviço',
        'Prestador',
        'Valor Orçado (R$)',
        'Status Pedido',
        'Comissão 30% (R$)',
        'Status Comissão'
      ];
      rows = requests.map(r => {
        const matchingCharge = charges.find(c => c.requestId === r.id);
        return [
          r.id,
          formatDate(r.createdAt),
          `"${r.clientName}"`,
          `"${r.clientPhone || ''}"`,
          `"${r.serviceId}"`,
          `"${r.serviceTitle}"`,
          `"${r.assignedProfessional || 'Pendente'}"`,
          (r.quotedPrice || 0).toFixed(2).replace('.', ','),
          `"${r.status}"`,
          matchingCharge ? matchingCharge.commissionValue.toFixed(2).replace('.', ',') : ((r.quotedPrice || 0) * 0.30).toFixed(2).replace('.', ','),
          matchingCharge ? `"${matchingCharge.status}"` : 'Não Gerada'
        ];
      });
    }

    // CSV generator with UTF-8 BOM for Microsoft Excel compatibility
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dedicated Export: Only Realized/Performed Service Requests
  const handleExportRealizedRequestsOnlyCSV = () => {
    const headers = [
      'ID Solicitação',
      'Data da Solicitação',
      'Data Agendada/Desejada',
      'Nome do Cliente',
      'Telefone WhatsApp',
      'E-mail do Cliente',
      'Endereço do Local de Atendimento',
      'Bairro',
      'Cidade/UF',
      'Título do Serviço',
      'Categoria',
      'Prestador Responsável',
      'Valor do Serviço (R$)',
      'Taxa Comissão SM Express (%)',
      'Comissão SM Express 30% (R$)',
      'Status da Execução',
      'Observações / Detalhes'
    ];

    const rows = allRealizedRequests.map(r => {
      const val = r.quotedPrice || 0;
      const com = val * 0.30;
      const addr = [r.street, r.number, r.neighborhood, `${r.city || 'Taubaté'}/${r.state || 'SP'}`].filter(Boolean).join(', ');
      const desc = Object.entries(r.details || {}).map(([k, v]) => `${k}: ${v}`).join('; ') || r.serviceTitle;
      return [
        r.id,
        formatDate(r.createdAt),
        r.scheduledDate || r.desiredDate || '—',
        `"${r.clientName}"`,
        `"${r.clientPhone || ''}"`,
        `"${r.clientEmail || ''}"`,
        `"${addr}"`,
        `"${r.neighborhood || ''}"`,
        `"${r.city || 'Taubaté'}/${r.state || 'SP'}"`,
        `"${r.serviceTitle}"`,
        `"${r.serviceId}"`,
        `"${r.assignedProfessional || 'Pendente'}"`,
        val.toFixed(2).replace('.', ','),
        '30%',
        com.toFixed(2).replace('.', ','),
        `"${r.status}"`,
        `"${desc.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sm_express_solicitacoes_servicos_realizadas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dedicated Export: Only Clients Registry
  const handleExportClientsOnlyCSV = () => {
    const headers = [
      'ID Cliente',
      'Nome Completo',
      'CPF/CNPJ',
      'E-mail',
      'WhatsApp / Telefone',
      'Endereço Completo',
      'Bairro',
      'Cidade',
      'Estado',
      'CEP',
      'Data de Cadastro',
      'Status da Conta',
      'Total Solicitações Feitas',
      'Total Solicitações Realizadas',
      'Total Gasto pelo Cliente (R$)'
    ];

    const rows = clientsData.map(item => {
      const c = item.client;
      const fullAddr = [c.street, c.number, c.complement, c.neighborhood].filter(Boolean).join(', ');
      return [
        c.id,
        `"${c.name}"`,
        `"${c.cpfCnpj || ''}"`,
        `"${c.email || ''}"`,
        `"${c.phone || ''}"`,
        `"${fullAddr}"`,
        `"${c.neighborhood || ''}"`,
        `"${c.city || 'Taubaté'}"`,
        `"${c.state || 'SP'}"`,
        `"${c.cep || ''}"`,
        formatDate(c.createdAt),
        `"${c.status || 'ativo'}"`,
        item.totalRequestsCount,
        item.realizedRequestsCount,
        item.totalSpent.toFixed(2).replace('.', ',')
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sm_express_dados_clientes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner: Central de Relatórios */}
      <div className="bg-[#001838] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                Central de Relatórios & Exportações
              </h2>
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                EXPORT CENTER
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Extração e geração de relatórios de orçamentos, aceites de serviços, comissões de 30%, prestadores e auditoria completa.
            </p>
          </div>
        </div>

        {/* Quick Export & System Reset Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setIsZeroSelectedModalOpen(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 animate-pulse"
              title="Zerar e excluir permanentemente os itens selecionados"
            >
              <Trash2 className="w-4 h-4" />
              <span>Zerar Selecionados ({selectedIds.size})</span>
            </button>
          )}

          <button
            onClick={() => setIsPurgeModalOpen(true)}
            className="px-3.5 py-2 bg-red-950/80 hover:bg-red-700 text-red-200 hover:text-white text-xs font-bold rounded-xl border border-red-500/40 transition-colors flex items-center gap-1.5 shadow-sm"
            title="Limpar todos os dados operacionais, pedidos e clientes para reiniciar em zero absoluto"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Zerar Todo o Sistema</span>
          </button>

          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl border border-amber-400/40 transition-colors flex items-center gap-1.5 shadow-sm"
            title="Visualizar documento formatado para impressão ou PDF"
          >
            <Eye className="w-4 h-4" />
            <span>Visualizar / Imprimir PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            title="Baixar planilha compatível com Excel e Google Sheets"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* Floating Feedback Alert */}
      {feedbackNotice && (
        <div className="bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl shadow-lg font-black text-xs flex items-center justify-between gap-3 animate-fade-in border border-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-950 flex-shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="p-1 hover:bg-emerald-600/30 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Tabs for Report Types */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto gap-1.5">
        <button
          onClick={() => { setSelectedReportType('clientes_solicitacoes'); setStatusFilter('todos'); }}
          className={`flex-1 min-w-[190px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            selectedReportType === 'clientes_solicitacoes'
              ? 'bg-[#001838] text-amber-400 shadow-md ring-2 ring-amber-400/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Clientes & Serviços ({clientsData.length})</span>
        </button>

        <button
          onClick={() => { setSelectedReportType('orcamentos'); setStatusFilter('todos'); }}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            selectedReportType === 'orcamentos'
              ? 'bg-[#001838] text-amber-400 shadow-md ring-2 ring-amber-400/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Orçamentos ({requests.length})</span>
        </button>

        <button
          onClick={() => { setSelectedReportType('aceites'); setStatusFilter('todos'); }}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            selectedReportType === 'aceites'
              ? 'bg-[#001838] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>2. Aceites de Serviço ({requests.filter(r => ['aprovado', 'em_execucao', 'concluido'].includes(r.status)).length})</span>
        </button>

        <button
          onClick={() => { setSelectedReportType('comissoes'); setStatusFilter('todos'); }}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            selectedReportType === 'comissoes'
              ? 'bg-[#001838] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>3. Comissões (30%) ({charges.length})</span>
        </button>

        <button
          onClick={() => { setSelectedReportType('prestadores'); setStatusFilter('todos'); }}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            selectedReportType === 'prestadores'
              ? 'bg-[#001838] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>4. Prestadores ({professionals.length})</span>
        </button>

        <button
          onClick={() => { setSelectedReportType('consolidado'); setStatusFilter('todos'); }}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            selectedReportType === 'consolidado'
              ? 'bg-[#001838] text-amber-400 shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>5. Geral / Auditoria</span>
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[metrics.card1, metrics.card2, metrics.card3, metrics.card4].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {c.label}
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {c.val}
                </div>
              </div>
              <div className={`p-3 rounded-2xl border ${c.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* System Zero / Operational Status Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          {(clientsData.length === 0 && requests.length === 0 && charges.length === 0) ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
              <Check className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="font-extrabold text-slate-900 flex items-center gap-2">
              <span>Status dos Dados & Indicadores:</span>
              {(clientsData.length === 0 && requests.length === 0 && charges.length === 0) ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wider font-black">
                  100% ZERADO E PRONTO
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wider font-black">
                  DADOS EM OPERAÇÃO
                </span>
              )}
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {(clientsData.length === 0 && requests.length === 0 && charges.length === 0)
                ? 'Todos os 4 cartões de indicadores estão em zero (0 clientes, 0 serviços realizados, R$ 0,00 de volume, R$ 0,00 de ticket médio). Base limpa para uso imediato.'
                : `Existem ${clientsData.length} clientes, ${requests.length} solicitações e ${charges.length} cobranças registradas no sistema.`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setIsZeroSelectedModalOpen(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Zerar Selecionados ({selectedIds.size})</span>
            </button>
          )}

          <button
            onClick={() => setIsPurgeModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-red-700 text-amber-400 hover:text-white font-black text-xs rounded-xl transition-all border border-amber-500/30 flex items-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Zerar Todo o Sistema</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Quick Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, Nome do Cliente, Prestador, Serviço ou Telefone..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          {/* Date Range Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-bold">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Período:</span>
              <select
                value={dateRangePreset}
                onChange={(e) => setDateRangePreset(e.target.value as any)}
                className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="all">Todo o Histórico</option>
                <option value="today">Hoje</option>
                <option value="7days">Últimos 7 Dias</option>
                <option value="30days">Últimos 30 Dias</option>
                <option value="this_month">Este Mês</option>
                <option value="custom">Data Personalizada</option>
              </select>
            </div>

            {/* Custom Date Inputs if 'custom' selected */}
            {dateRangePreset === 'custom' && (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                />
                <span className="text-xs text-slate-400">até</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtros Específicos:
          </span>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="todos">Todos os Status</option>
            {selectedReportType === 'clientes_solicitacoes' && (
              <>
                <option value="com_realizados">Com Serviços Realizados</option>
                <option value="com_pedidos">Com Qualquer Solicitação</option>
                <option value="ativo">Clientes Ativos</option>
                <option value="bloqueado">Clientes Bloqueados</option>
              </>
            )}
            {selectedReportType === 'orcamentos' && (
              <>
                <option value="novo">Novo Pedido (Sem Orçamento)</option>
                <option value="em_analise">Em Análise Técnica</option>
                <option value="orcamento_recebido">Orçamento Enviado</option>
                <option value="aguardando_aprovacao">Aguardando Aprovação do Cliente</option>
                <option value="aprovado">Orçamento Aprovado</option>
                <option value="em_execucao">Em Execução</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </>
            )}
            {selectedReportType === 'aceites' && (
              <>
                <option value="aprovado">Aceite Confirmado / Aguardando Início</option>
                <option value="em_execucao">Em Execução no Local</option>
                <option value="concluido">Serviço Concluído com Sucesso</option>
              </>
            )}
            {selectedReportType === 'comissoes' && (
              <>
                <option value="pendente">Pendente de Pagamento (Prazo 3 dias)</option>
                <option value="pago">Pago / Liquidado</option>
                <option value="atrasado">Atrasado (Notificado)</option>
                <option value="inadimplente">Inadimplente (Bloqueio + NF emitidos)</option>
              </>
            )}
            {selectedReportType === 'prestadores' && (
              <>
                <option value="aprovado">Homologado & Aprovado</option>
                <option value="pendente_aprovacao">Pendente de Análise</option>
                <option value="em_analise">Em Análise de Documentos</option>
                <option value="rejeitado">Rejeitado</option>
              </>
            )}
          </select>

          {/* Category Filter */}
          {(selectedReportType === 'orcamentos' || selectedReportType === 'aceites' || selectedReportType === 'prestadores') && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="todos">Todas as Especialidades</option>
              <option value="Eletricista">Eletricista</option>
              <option value="Encanador">Encanador</option>
              <option value="Pintor">Pintor</option>
              <option value="Pedreiro">Pedreiro</option>
              <option value="Montador de Móveis">Montador de Móveis</option>
              <option value="Limpeza">Limpeza Residencial</option>
              <option value="Jardinagem">Jardinagem</option>
              <option value="Ar Condicionado">Ar Condicionado</option>
              <option value="Marceneiro">Marceneiro</option>
            </select>
          )}

          {/* Reset Filters */}
          {(searchTerm || statusFilter !== 'todos' || categoryFilter !== 'todos' || dateRangePreset !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
                setCategoryFilter('todos');
                setProfessionalFilter('todos');
                setDateRangePreset('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-amber-600 hover:text-amber-700 font-bold text-xs underline ml-auto"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Data View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-[#001838] text-sm">
              {selectedReportType === 'clientes_solicitacoes' && `Relatório de Clientes & Serviços Realizados (${clientsData.length} clientes, ${allRealizedRequests.length} serviços realizados)`}
              {selectedReportType === 'orcamentos' && `Relatório Detalhado de Orçamentos (${filteredQuotes.length} registros)`}
              {selectedReportType === 'aceites' && `Relatório de Aceites de Serviços & Contratos (${filteredAcceptances.length} registros)`}
              {selectedReportType === 'comissoes' && `Relatório de Comissões e Faturamento 30% (${filteredCommissions.length} registros)`}
              {selectedReportType === 'prestadores' && `Relatório de Prestadores & Conformidade (${filteredProfessionals.length} registros)`}
              {selectedReportType === 'consolidado' && `Relatório Geral Consolidado de Auditoria (${requests.length} registros)`}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Dados consolidados de clientes cadastrados e solicitações de serviços executadas na plataforma SM Express.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedReportType === 'clientes_solicitacoes' && (
              <>
                <button
                  onClick={handleExportRealizedRequestsOnlyCSV}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  title="Exporta somente as solicitações de serviços já realizadas ou em execução"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Serviços Realizados</span>
                </button>

                <button
                  onClick={handleExportClientsOnlyCSV}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 shadow-sm"
                  title="Exporta o cadastro geral de clientes com contatos e endereços"
                >
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Baixar Dados de Clientes</span>
                </button>
              </>
            )}

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Baixar CSV deste relatório"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV Completo</span>
            </button>

            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="px-3 py-1.5 bg-[#001838] hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl border border-amber-400/30 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Batch Action Bar when items are selected */}
        {selectedIds.size > 0 && (
          <div className="bg-amber-500/15 border-b border-amber-300 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                {selectedIds.size}
              </span>
              <span className="font-extrabold text-slate-900">
                {selectedIds.size} item(ns) selecionado(s) na tabela
              </span>
              <span className="text-slate-500 hidden sm:inline">
                • Escolha se deseja desmarcar ou zerar permanentemente os itens
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors shadow-xs"
              >
                Desmarcar Todos
              </button>
              <button
                onClick={() => setIsZeroSelectedModalOpen(true)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Zerar e Excluir Selecionados ({selectedIds.size})</span>
              </button>
            </div>
          </div>
        )}

        {/* 0. TABLE: Clientes & Solicitações de Serviços Realizadas */}
        {selectedReportType === 'clientes_solicitacoes' && (
          <div className="space-y-0">
            {/* View Mode Toggle Sub-bar */}
            <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setClientViewMode('agrupado')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    clientViewMode === 'agrupado'
                      ? 'bg-[#001838] text-amber-400 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Visão por Cliente (com histórico)</span>
                </button>
                <button
                  onClick={() => setClientViewMode('solicitacoes_lista')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    clientViewMode === 'solicitacoes_lista'
                      ? 'bg-[#001838] text-amber-400 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Todas as Solicitações Realizadas ({allRealizedRequests.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span>Clique em um cliente para abrir ou recolher o histórico de pedidos</span>
              </div>
            </div>

            {/* Mode 1: Visão Agrupada por Cliente */}
            {clientViewMode === 'agrupado' && (
              <div className="overflow-x-auto">
                {clientsData.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-3">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
                      <Users className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 text-sm">Base Limpa & Apta para Uso Operacional</p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Nenhum cliente cadastrado no momento. Assim que clientes solicitarem orçamentos ou realizarem cadastro, os históricos e relatórios consolidados aparecerão aqui.
                      </p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100/80 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={clientsData.length > 0 && clientsData.every(item => selectedIds.has(item.client.id))}
                            onChange={() => toggleSelectAll(clientsData.map(item => item.client.id))}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                            title="Selecionar todos os clientes visíveis"
                          />
                        </th>
                        <th className="py-3 px-3 w-8 text-center">#</th>
                        <th className="py-3 px-4">Cliente / Documento</th>
                        <th className="py-3 px-4">Contatos</th>
                        <th className="py-3 px-4">Endereço Cadastrado</th>
                        <th className="py-3 px-4 text-center">Solicitações</th>
                        <th className="py-3 px-4 text-right">Total Investido</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clientsData.map((item) => {
                        const c = item.client;
                        const isExpanded = expandedClientIds.has(c.id);
                        const cleanPhone = (c.phone || '').replace(/\D/g, '');
                        const fullAddress = [c.street, c.number, c.complement, c.neighborhood]
                          .filter(Boolean)
                          .join(', ');

                        return (
                          <React.Fragment key={c.id}>
                            <tr 
                              className={`hover:bg-amber-50/40 transition-colors cursor-pointer ${isExpanded ? 'bg-amber-50/60 font-semibold' : ''} ${selectedIds.has(c.id) ? 'bg-amber-100/40' : ''}`}
                              onClick={() => toggleClientExpanded(c.id)}
                            >
                              <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.has(c.id)}
                                  onChange={() => toggleSelect(c.id)}
                                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                                />
                              </td>

                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleClientExpanded(c.id);
                                  }}
                                  className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 flex items-center justify-center transition-colors"
                                  title={isExpanded ? 'Recolher detalhes' : 'Expandir solicitações'}
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-[#001838] text-amber-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                                    {c.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                      <span>{c.name}</span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-500">
                                      {c.cpfCnpj ? `CPF/CNPJ: ${c.cpfCnpj}` : `ID: ${c.id}`}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  {c.phone && (
                                    <a
                                      href={`https://wa.me/55${cleanPhone}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
                                      title="Conversar no WhatsApp"
                                    >
                                      <Phone className="w-3 h-3 text-emerald-600" />
                                      <span>{c.phone}</span>
                                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </a>
                                  )}
                                  {c.email && (
                                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                      <Mail className="w-3 h-3 text-slate-400" />
                                      <span className="truncate max-w-[180px]">{c.email}</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="max-w-[220px]">
                                  <div className="font-medium text-slate-900 truncate">
                                    {fullAddress || 'Endereço não informado'}
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    <span>{c.city || 'Taubaté'} - {c.state || 'SP'} {c.cep ? `• CEP ${c.cep}` : ''}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-[11px]">
                                    {item.realizedRequestsCount} realizadas
                                  </span>
                                  <span className="text-[10px] text-slate-400 mt-0.5">
                                    {item.totalRequestsCount} total de pedidos
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="font-black text-slate-900 text-xs">
                                  {formatMoney(item.totalSpent)}
                                </div>
                                <span className="text-[10px] text-slate-400">em serviços</span>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  c.status === 'bloqueado'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {c.status || 'Ativo'}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => toggleClientExpanded(c.id)}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-amber-400 hover:text-slate-950 text-slate-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <span>{isExpanded ? 'Ocultar' : 'Ver Solicitações'}</span>
                                    <span className="px-1 bg-slate-200 rounded text-[9px]">{item.requests.length}</span>
                                  </button>
                                  <button
                                    onClick={() => handleSingleZeroClient(c.id, c.name)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Zerar e excluir este cliente e seus pedidos"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Sub-row: Expandable details of client's requests */}
                            {isExpanded && (
                              <tr className="bg-amber-50/20 border-y border-amber-200/60">
                                <td colSpan={9} className="p-4 sm:p-5">
                                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                      <div>
                                        <h4 className="font-black text-[#001838] text-xs flex items-center gap-1.5">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                          <span>Histórico Completo de Solicitações do Cliente: {c.name}</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-500">
                                          Total de {item.requests.length} pedidos registrados ({item.realizedRequestsCount} realizados/concluídos).
                                        </p>
                                      </div>

                                      <div className="text-right">
                                        <span className="text-[11px] text-slate-500 font-semibold mr-2">
                                          Total Investido:
                                        </span>
                                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                          {formatMoney(item.totalSpent)}
                                        </span>
                                      </div>
                                    </div>

                                    {item.requests.length === 0 ? (
                                      <div className="p-6 text-center text-slate-400 text-xs">
                                        Este cliente ainda não efetuou nenhuma solicitação no sistema.
                                      </div>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left text-[11px] text-slate-700">
                                          <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[9px] border-b border-slate-200">
                                            <tr>
                                              <th className="py-2 px-3">ID Pedido</th>
                                              <th className="py-2 px-3">Data Solicitação</th>
                                              <th className="py-2 px-3">Serviço Realizado</th>
                                              <th className="py-2 px-3">Prestador Designado</th>
                                              <th className="py-2 px-3 text-right">Valor Orçado</th>
                                              <th className="py-2 px-3 text-right">Comissão 30%</th>
                                              <th className="py-2 px-3 text-center">Status</th>
                                              <th className="py-2 px-3">Local de Atendimento</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {item.requests.map((r) => {
                                              const reqAddr = [r.street, r.number, r.neighborhood, `${r.city || 'Taubaté'}/${r.state || 'SP'}`]
                                                .filter(Boolean)
                                                .join(', ');
                                              const val = r.quotedPrice || 0;
                                              const com = val * 0.30;
                                              const isRealized = ['concluido', 'em_execucao', 'aprovado', 'orcamento_aceito', 'avaliado'].includes(r.status);

                                              return (
                                                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                                  <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                                    {r.id}
                                                  </td>
                                                  <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                                                    {formatDate(r.createdAt)}
                                                  </td>
                                                  <td className="py-2 px-3">
                                                    <div className="font-bold text-slate-900">{r.serviceTitle}</div>
                                                    <div className="text-[10px] text-slate-400">{r.serviceId}</div>
                                                  </td>
                                                  <td className="py-2 px-3 font-medium text-slate-800">
                                                    {r.assignedProfessional || (
                                                      <span className="text-slate-400 italic">Pendente</span>
                                                    )}
                                                  </td>
                                                  <td className="py-2 px-3 text-right font-black text-slate-900">
                                                    {val > 0 ? formatMoney(val) : 'A orçar'}
                                                  </td>
                                                  <td className="py-2 px-3 text-right font-black text-amber-700">
                                                    {val > 0 ? formatMoney(com) : '—'}
                                                  </td>
                                                  <td className="py-2 px-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                      r.status === 'concluido' || r.status === 'avaliado'
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                        : isRealized
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                                                    }`}>
                                                      {r.status.replace('_', ' ')}
                                                    </span>
                                                  </td>
                                                  <td className="py-2 px-3 text-slate-600 max-w-[200px] truncate" title={reqAddr}>
                                                    {reqAddr || 'Mesmo do cadastro'}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Mode 2: Listagem Direta de Solicitações Realizadas */}
            {clientViewMode === 'solicitacoes_lista' && (
              <div className="overflow-x-auto">
                {allRealizedRequests.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 space-y-2">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600">Nenhuma solicitação realizada encontrada</p>
                    <p className="text-xs">Não há serviços concluídos ou em execução com os filtros atuais.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100/80 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={allRealizedRequests.length > 0 && allRealizedRequests.every(r => selectedIds.has(r.id))}
                            onChange={() => toggleSelectAll(allRealizedRequests.map(r => r.id))}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                            title="Selecionar todos os serviços realizados visíveis"
                          />
                        </th>
                        <th className="py-3 px-4">ID Pedido</th>
                        <th className="py-3 px-4">Data / Hora</th>
                        <th className="py-3 px-4">Cliente / Contato</th>
                        <th className="py-3 px-4">Endereço de Atendimento</th>
                        <th className="py-3 px-4">Serviço / Especialidade</th>
                        <th className="py-3 px-4">Prestador Responsável</th>
                        <th className="py-3 px-4 text-right">Valor do Serviço</th>
                        <th className="py-3 px-4 text-right">Comissão 30%</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allRealizedRequests.map((r) => {
                        const val = r.quotedPrice || 0;
                        const com = val * 0.30;
                        const addr = [r.street, r.number, r.neighborhood, `${r.city || 'Taubaté'}/${r.state || 'SP'}`]
                          .filter(Boolean)
                          .join(', ');
                        const cleanPhone = (r.clientPhone || '').replace(/\D/g, '');

                        return (
                          <tr key={r.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.has(r.id) ? 'bg-amber-100/40' : ''}`}>
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(r.id)}
                                onChange={() => toggleSelect(r.id)}
                                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              {r.id}
                            </td>
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                              {formatDate(r.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-extrabold text-slate-900">{r.clientName}</div>
                              {r.clientPhone && (
                                <a
                                  href={`https://wa.me/55${cleanPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{r.clientPhone}</span>
                                </a>
                              )}
                            </td>
                            <td className="py-3 px-4 max-w-[200px]">
                              <div className="truncate text-slate-800 font-medium" title={addr}>
                                {addr || 'Endereço não informado'}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {r.neighborhood ? `Bairro: ${r.neighborhood}` : ''}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{r.serviceTitle}</div>
                              <div className="text-[10px] text-amber-700 font-semibold">{r.serviceId}</div>
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {r.assignedProfessional || (
                                <span className="text-slate-400 italic">Pendente</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-slate-900">
                              {formatMoney(val)}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-amber-700">
                              {formatMoney(com)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                r.status === 'concluido' || r.status === 'avaliado'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}>
                                {r.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleSingleZeroRequest(r.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Zerar e excluir esta solicitação"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* 1. TABLE: Orçamentos */}
        {selectedReportType === 'orcamentos' && (
          <div className="overflow-x-auto">
            {filteredQuotes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">Nenhum orçamento encontrado</p>
                <p className="text-xs">Tente ajustar os filtros de busca ou período de data.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/80 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredQuotes.length > 0 && filteredQuotes.every(q => selectedIds.has(q.id))}
                        onChange={() => toggleSelectAll(filteredQuotes.map(q => q.id))}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                        title="Selecionar todos os orçamentos visíveis"
                      />
                    </th>
                    <th className="py-3 px-4">ID Pedido</th>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Cliente / Contato</th>
                    <th className="py-3 px-4">Serviço / Categoria</th>
                    <th className="py-3 px-4">Prestador</th>
                    <th className="py-3 px-4 text-right">Valor Orçado</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuotes.map((q) => (
                    <tr key={q.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.has(q.id) ? 'bg-amber-100/40' : ''}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(q.id)}
                          onChange={() => toggleSelect(q.id)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {q.id}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(q.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{q.clientName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {q.clientPhone || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#001838]">{q.serviceTitle}</div>
                        <div className="text-[11px] text-amber-700 font-semibold">{q.serviceId}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">
                          {q.assignedProfessional || <span className="text-slate-400 italic">Pendente</span>}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                        {q.quotedPrice ? formatMoney(q.quotedPrice) : <span className="text-slate-400 font-normal italic">Aguardando</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ['aprovado', 'em_execucao', 'concluido'].includes(q.status)
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : q.status === 'orcamento_recebido'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : q.status === 'cancelado'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {q.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleSingleZeroRequest(q.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Zerar e excluir este orçamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 2. TABLE: Aceites de Serviço */}
        {selectedReportType === 'aceites' && (
          <div className="overflow-x-auto">
            {filteredAcceptances.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <FileCheck className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">Nenhum aceite de serviço registrado</p>
                <p className="text-xs">Aceites são gerados automaticamente quando o cliente aprova o orçamento do prestador.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/80 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredAcceptances.length > 0 && filteredAcceptances.every(a => selectedIds.has(a.id))}
                        onChange={() => toggleSelectAll(filteredAcceptances.map(a => a.id))}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                        title="Selecionar todos os aceites visíveis"
                      />
                    </th>
                    <th className="py-3 px-4">ID Pedido</th>
                    <th className="py-3 px-4">Data Aceite</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Prestador Parceiro</th>
                    <th className="py-3 px-4">Serviço Contratado</th>
                    <th className="py-3 px-4 text-right">Valor Total (R$)</th>
                    <th className="py-3 px-4 text-right">Comissão SM (30%)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAcceptances.map((a) => {
                    const commission = (a.quotedPrice || 0) * 0.30;
                    return (
                      <tr key={a.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.has(a.id) ? 'bg-amber-100/40' : ''}`}>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(a.id)}
                            onChange={() => toggleSelect(a.id)}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {a.id}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {formatDate(a.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{a.clientName}</div>
                          <div className="text-[11px] text-slate-500">{a.clientPhone || '—'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-emerald-800">{a.assignedProfessional || 'Designado'}</div>
                          <div className="text-[10px] text-slate-400">Termo de Parceria Ativo</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#001838]">{a.serviceTitle}</div>
                          <div className="text-[11px] text-slate-500">{a.serviceId}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                          {formatMoney(a.quotedPrice)}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-amber-600 text-sm whitespace-nowrap">
                          {formatMoney(commission)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            a.status === 'concluido'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : a.status === 'em_execucao'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {a.status === 'aprovado' ? 'Aceite Registrado' : a.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleSingleZeroRequest(a.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Zerar e excluir este aceite de serviço"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 3. TABLE: Comissões e Cobranças */}
        {selectedReportType === 'comissoes' && (
          <div className="overflow-x-auto">
            {filteredCommissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <DollarSign className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">Nenhuma comissão encontrada</p>
                <p className="text-xs">As comissões de 30% são geradas automaticamente mediante aceite de propostas de serviço.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/80 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredCommissions.length > 0 && filteredCommissions.every(c => selectedIds.has(c.id))}
                        onChange={() => toggleSelectAll(filteredCommissions.map(c => c.id))}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                        title="Selecionar todas as comissões visíveis"
                      />
                    </th>
                    <th className="py-3 px-4">ID Cobrança</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Prestador / Fornecedor</th>
                    <th className="py-3 px-4">Serviço / Pedido</th>
                    <th className="py-3 px-4 text-right">Valor Serviço</th>
                    <th className="py-3 px-4 text-right">Comissão 30%</th>
                    <th className="py-3 px-4 text-center">Status Pagamento</th>
                    <th className="py-3 px-4 text-center">NF-e / Cobrança</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCommissions.map((c) => (
                    <tr key={c.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.has(c.id) ? 'bg-amber-100/40' : ''}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {c.id}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(c.dueDate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.professionalName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{c.professionalCpfCnpj || c.professionalPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#001838]">{c.serviceTitle}</div>
                        <div className="text-[10px] font-mono text-slate-500">Ref: {c.requestId}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                        {formatMoney(c.serviceValue)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-amber-600 text-sm whitespace-nowrap">
                        {formatMoney(c.commissionValue)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          c.status === 'pago'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : c.status === 'atrasado'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : c.status === 'bloqueado'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {(c.boletoLinhaDigitavel || c.boletoUrl || c.nfseNumero) ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            NF & Boleto Emitidos
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Fluxo Padrão Pix
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleSingleZeroCharge(c.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Zerar e excluir esta cobrança"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 4. TABLE: Prestadores & Conformidade */}
        {selectedReportType === 'prestadores' && (
          <div className="overflow-x-auto">
            {filteredProfessionals.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">Nenhum prestador encontrado</p>
                <p className="text-xs">Cadastros de prestadores homologados e documentação aparecerão aqui.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/80 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredProfessionals.length > 0 && filteredProfessionals.every(p => selectedIds.has(p.id))}
                        onChange={() => toggleSelectAll(filteredProfessionals.map(p => p.id))}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                        title="Selecionar todos os prestadores visíveis"
                      />
                    </th>
                    <th className="py-3 px-4">Prestador</th>
                    <th className="py-3 px-4">CPF / CNPJ</th>
                    <th className="py-3 px-4">Contato / Localidade</th>
                    <th className="py-3 px-4">Especialidades</th>
                    <th className="py-3 px-4 text-center">Termo de Parceria (30%)</th>
                    <th className="py-3 px-4 text-center">Documentos</th>
                    <th className="py-3 px-4 text-center">Homologação</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProfessionals.map((p) => (
                    <tr key={p.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.has(p.id) ? 'bg-amber-100/40' : ''}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.fullName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {p.cpfCnpj}
                      </td>
                      <td className="py-3 px-4">
                        <div>{p.phone}</div>
                        <div className="text-[11px] text-slate-400">{p.city}/{p.state}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.categories.map((c, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200 text-[10px] font-semibold">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.contractSigned ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                            ✓ Assinado Digitalmente
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-slate-600 font-bold">
                          {p.documents?.length || 0} arquivos
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'aprovado'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleSingleZeroProfessional(p.id, p.fullName)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Zerar e excluir este prestador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 5. TABLE: Consolidado Geral */}
        {selectedReportType === 'consolidado' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100/80 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={requests.length > 0 && requests.every(r => selectedIds.has(r.id))}
                      onChange={() => toggleSelectAll(requests.map(r => r.id))}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                      title="Selecionar todos os registros visíveis"
                    />
                  </th>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Serviço</th>
                  <th className="py-3 px-4">Prestador Designado</th>
                  <th className="py-3 px-4 text-right">Valor Total (R$)</th>
                  <th className="py-3 px-4 text-right">Comissão SM (30%)</th>
                  <th className="py-3 px-4 text-center">Status Operacional</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => {
                  const matchingCharge = charges.find(c => c.requestId === r.id);
                  const commissionVal = matchingCharge ? matchingCharge.commissionValue : ((r.quotedPrice || 0) * 0.30);
                  return (
                    <tr key={r.id} className={`hover:bg-slate-50/80 transition-colors ${selectedIds.has(r.id) ? 'bg-amber-100/40' : ''}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleSelect(r.id)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.id}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(r.createdAt)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.clientName}</td>
                      <td className="py-3 px-4">{r.serviceTitle}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{r.assignedProfessional || '—'}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatMoney(r.quotedPrice)}</td>
                      <td className="py-3 px-4 text-right font-black text-amber-600">{formatMoney(commissionVal)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full text-[10px] font-bold uppercase">
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleSingleZeroRequest(r.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Zerar e excluir esta solicitação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE IMPRESSÃO E PRÉ-VISUALIZAÇÃO DE RELATÓRIO OFICIAL (PDF A4) */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in border border-slate-300">
            
            {/* Modal Header (No Print Controls) */}
            <div className="p-4 bg-[#001838] text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-white">
                  Pré-visualização do Relatório Oficial SM Express
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Salvar em PDF</span>
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 print:p-0 print:space-y-4 text-slate-900 bg-white">
              
              {/* Document Official Header */}
              <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SMExpressLogo variant="badge" size="custom" customSize={60} />
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-slate-950 text-xl tracking-tight">SM</span>
                      <span className="font-extrabold text-amber-500 text-xl italic tracking-tight">EXPRESS</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-600">
                      Plataforma de Intermediação e Serviços Gerais
                    </div>
                    <div className="text-[10px] text-slate-500">
                      CNPJ: 54.892.311/0001-90 | Taubaté - SP | Atendimento: (12) 99255-5104
                    </div>
                  </div>
                </div>

                <div className="text-right sm:text-right space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                    RELATÓRIO OFICIAL ADM
                  </span>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Filtro: {dateRangePreset === 'all' ? 'Histórico Completo' : dateRangePreset} | Tipo: {selectedReportType.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Title and Summary Header */}
              <div className="space-y-1">
                <h1 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                  {selectedReportType === 'clientes_solicitacoes' && 'Relatório de Clientes & Solicitações de Serviços Realizadas'}
                  {selectedReportType === 'orcamentos' && 'Relatório de Orçamentos e Propostas Emitidas'}
                  {selectedReportType === 'aceites' && 'Relatório de Aceites de Serviços e Contratos de Prestação'}
                  {selectedReportType === 'comissoes' && 'Relatório Financeiro de Comissões (30%) e Faturamento'}
                  {selectedReportType === 'prestadores' && 'Relatório de Prestadores Homologados & Compliance'}
                  {selectedReportType === 'consolidado' && 'Relatório Geral Consolidado de Atividades Operacionais'}
                </h1>
                <p className="text-xs text-slate-600">
                  Documento analítico gerado para fins de prestação de contas, auditoria interna e conciliação financeira da SM Express.
                </p>
              </div>

              {/* Summary KPIs Row */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{metrics.card1.label}</span>
                  <div className="text-base font-black text-slate-900">{metrics.card1.val}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{metrics.card2.label}</span>
                  <div className="text-base font-black text-slate-900">{metrics.card2.val}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{metrics.card3.label}</span>
                  <div className="text-base font-black text-slate-900">{metrics.card3.val}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{metrics.card4.label}</span>
                  <div className="text-base font-black text-slate-900">{metrics.card4.val}</div>
                </div>
              </div>

              {/* Printable Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px] text-slate-800">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Data</th>
                      <th className="p-2.5">Cliente / Prestador</th>
                      <th className="p-2.5">Serviço / Categoria</th>
                      <th className="p-2.5 text-right">Valor Serviço</th>
                      <th className="p-2.5 text-right">Comissão 30%</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedReportType === 'clientes_solicitacoes' && allRealizedRequests.map(r => (
                      <tr key={r.id}>
                        <td className="p-2 font-mono">{r.id}</td>
                        <td className="p-2 text-slate-500">{formatDate(r.createdAt)}</td>
                        <td className="p-2 font-bold">
                          <div>{r.clientName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{r.clientPhone || '—'}</div>
                        </td>
                        <td className="p-2">
                          <div>{r.serviceTitle}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{r.assignedProfessional || 'Pendente'}</div>
                        </td>
                        <td className="p-2 text-right font-bold">{formatMoney(r.quotedPrice)}</td>
                        <td className="p-2 text-right font-black text-amber-700">{formatMoney((r.quotedPrice || 0) * 0.30)}</td>
                        <td className="p-2 text-center uppercase text-[10px] font-bold">{r.status}</td>
                      </tr>
                    ))}

                    {selectedReportType === 'orcamentos' && filteredQuotes.map(q => (
                      <tr key={q.id}>
                        <td className="p-2 font-mono">{q.id}</td>
                        <td className="p-2 text-slate-500">{formatDate(q.createdAt)}</td>
                        <td className="p-2 font-bold">{q.clientName}</td>
                        <td className="p-2">{q.serviceTitle} ({q.serviceId})</td>
                        <td className="p-2 text-right font-bold">{formatMoney(q.quotedPrice)}</td>
                        <td className="p-2 text-right font-black text-amber-700">{formatMoney((q.quotedPrice || 0) * 0.30)}</td>
                        <td className="p-2 text-center uppercase text-[10px] font-bold">{q.status}</td>
                      </tr>
                    ))}

                    {selectedReportType === 'aceites' && filteredAcceptances.map(a => (
                      <tr key={a.id}>
                        <td className="p-2 font-mono">{a.id}</td>
                        <td className="p-2 text-slate-500">{formatDate(a.createdAt)}</td>
                        <td className="p-2 font-bold">{a.clientName} / {a.assignedProfessional}</td>
                        <td className="p-2">{a.serviceTitle}</td>
                        <td className="p-2 text-right font-bold">{formatMoney(a.quotedPrice)}</td>
                        <td className="p-2 text-right font-black text-amber-700">{formatMoney((a.quotedPrice || 0) * 0.30)}</td>
                        <td className="p-2 text-center uppercase text-[10px] font-bold">{a.status}</td>
                      </tr>
                    ))}

                    {selectedReportType === 'comissoes' && filteredCommissions.map(c => (
                      <tr key={c.id}>
                        <td className="p-2 font-mono">{c.id}</td>
                        <td className="p-2 text-slate-500">{formatDate(c.createdAt)}</td>
                        <td className="p-2 font-bold">{c.professionalName}</td>
                        <td className="p-2">{c.serviceTitle}</td>
                        <td className="p-2 text-right font-bold">{formatMoney(c.serviceValue)}</td>
                        <td className="p-2 text-right font-black text-amber-700">{formatMoney(c.commissionValue)}</td>
                        <td className="p-2 text-center uppercase text-[10px] font-bold">{c.status}</td>
                      </tr>
                    ))}

                    {selectedReportType === 'prestadores' && filteredProfessionals.map(p => (
                      <tr key={p.id}>
                        <td className="p-2 font-mono">{p.id}</td>
                        <td className="p-2 text-slate-500">{formatDate(p.createdAt)}</td>
                        <td className="p-2 font-bold">{p.fullName} ({p.cpfCnpj})</td>
                        <td className="p-2">{p.categories.join(', ')}</td>
                        <td className="p-2 text-right">—</td>
                        <td className="p-2 text-right">{p.contractSigned ? 'Termo 30% OK' : 'Pendente'}</td>
                        <td className="p-2 text-center uppercase text-[10px] font-bold">{p.status}</td>
                      </tr>
                    ))}

                    {selectedReportType === 'consolidado' && requests.map(r => (
                      <tr key={r.id}>
                        <td className="p-2 font-mono">{r.id}</td>
                        <td className="p-2 text-slate-500">{formatDate(r.createdAt)}</td>
                        <td className="p-2 font-bold">{r.clientName} / {r.assignedProfessional || 'Pendente'}</td>
                        <td className="p-2">{r.serviceTitle}</td>
                        <td className="p-2 text-right font-bold">{formatMoney(r.quotedPrice)}</td>
                        <td className="p-2 text-right font-black text-amber-700">{formatMoney((r.quotedPrice || 0) * 0.30)}</td>
                        <td className="p-2 text-center uppercase text-[10px] font-bold">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Document Signatures / Validation */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
                <div>
                  <div>SM Express Serviços Gerais - Sistema Integrado</div>
                  <div className="font-mono text-[10px]">Autenticação Digital: MD5-{Date.now().toString(36).toUpperCase()}</div>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-slate-400 mb-1"></div>
                  <div className="font-bold text-slate-700">Administração SM Express</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO: ZERAR TODO O SISTEMA */}
      {/* ========================================================================= */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-red-200 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Zerar Todo o Sistema
                </h3>
                <span className="text-xs text-red-600 font-bold uppercase tracking-wider">
                  Ação Irreversível • Zero Absoluto
                </span>
              </div>
            </div>

            <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 text-xs text-red-900 space-y-2">
              <p className="font-bold">
                Atenção: Esta ação reinicializa completamente os dados da plataforma SM Express.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li>Todas as solicitações de serviço, orçamentos e agendamentos serão excluídos.</li>
                <li>Todos os cadastros de clientes serão limpos da base.</li>
                <li>Todas as cobranças de comissão de 30% serão zeradas.</li>
                <li><strong>Os 4 cartões de indicadores retornarão imediatamente a ZERO</strong> (0 clientes, 0 serviços, R$ 0,00 de volume, R$ 0,00 de ticket médio).</li>
                <li>A conta oficial do administrador (suportesmservicos@gmail.com) e o catálogo de serviços serão preservados.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmPurgeAll}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Zerar Todo o Sistema</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO: ZERAR ITENS SELECIONADOS */}
      {/* ========================================================================= */}
      {isZeroSelectedModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Zerar {selectedIds.size} Itens Selecionados
                </h3>
                <span className="text-[11px] text-slate-500">
                  Confirmação de exclusão em lote
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deseja realmente zerar e excluir permanentemente os <strong>{selectedIds.size} registros selecionados</strong>? Esta ação atualizará os relatórios e os indicadores imediatamente.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsZeroSelectedModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmZeroSelected}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar e Zerar ({selectedIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
