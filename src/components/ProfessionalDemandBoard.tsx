import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Bell, 
  Zap, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  Calendar, 
  DollarSign, 
  Filter, 
  Search, 
  AlertCircle, 
  Sparkles, 
  Share2, 
  Check, 
  X, 
  Camera, 
  User, 
  Users, 
  ArrowRight, 
  Tag,
  Radio,
  FileText,
  Scale,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { ServiceRequest, ProfessionalProfile, ServiceDefinition, ServiceCategory, UserAccount } from '../types';
import { DigitalContractModal } from './DigitalContractModal';
import { SMExpressLogo } from './SMExpressLogo';

interface ProfessionalDemandBoardProps {
  requests: ServiceRequest[];
  professionals: ProfessionalProfile[];
  services: ServiceDefinition[];
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onSwitchToRegister?: () => void;
  onSendQuote: (
    requestId: string, 
    price: number, 
    hours: string, 
    professionalName: string, 
    notes: string,
    scheduledDate?: string
  ) => void;
}

export const ProfessionalDemandBoard: React.FC<ProfessionalDemandBoardProps> = ({
  requests,
  professionals,
  services,
  currentUser,
  onOpenAuth,
  onSwitchToRegister,
  onSendQuote
}) => {
  // Guard: If not logged in or role is cliente, show access barrier
  if (!currentUser || (currentUser.role !== 'profissional' && currentUser.role !== 'admin')) {
    return (
      <div className="space-y-6 animate-fade-in py-4">
        <div className="bg-[#001838] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-500/30 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-amber-400/20 text-amber-400 border border-amber-400/40 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Briefcase className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Área Exclusiva de Fornecedores
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              Mural de Oportunidades & Orçamentos
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Para garantir a privacidade dos clientes e segurança operacional, o acesso às solicitações em aberto e envio de orçamentos é exclusivo para prestadores parceiros cadastrados.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onSwitchToRegister}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 uppercase tracking-wider transition-all transform hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar como Fornecedor</span>
            </button>

            <button
              onClick={() => onOpenAuth?.('login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Fazer Login Profissional</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Acesso individual protegido e auditado</span>
          </div>
        </div>
      </div>
    );
  }
  // Selected active professional profile
  const [selectedProfId, setSelectedProfId] = useState<string>(
    professionals.length > 0 ? professionals[0].id : 'all'
  );

  // Active filter
  const [filterType, setFilterType] = useState<'perfil' | 'outros' | 'pendentes' | 'todas' | 'minhas_propostas'>('perfil');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Direct Quote Modal / Form State
  const [activeQuotingReq, setActiveQuotingReq] = useState<ServiceRequest | null>(null);
  const [quotePrice, setQuotePrice] = useState<string>('');
  const [quoteHours, setQuoteHours] = useState<string>('2 horas');
  const [quoteDate, setQuoteDate] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);

  // Automated WhatsApp Message Preview Modal
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    req: ServiceRequest;
    profName: string;
    profPhone: string;
    messageText: string;
    whatsappUrl: string;
  } | null>(null);

  // Photo Zoom Modal
  const [zoomPhotoUrl, setZoomPhotoUrl] = useState<string | null>(null);

  // Digital Contract Modal
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isCopiedText, setIsCopiedText] = useState(false);

  // Current active professional object
  const currentProf = useMemo(() => {
    return professionals.find(p => p.id === selectedProfId) || professionals[0] || null;
  }, [selectedProfId, professionals]);

  // Helper to get service definition
  const getServiceDef = (id: ServiceCategory) => {
    return services.find(s => s.id === id);
  };

  // Automated Matching Calculation:
  // 1. If serviceId === 'outros_servicos' -> 100% matched for ALL professionals (Rule: "caso o serviço solicitado seja outros ofereça para todos profissionais")
  // 2. If professional's categories contain request's serviceId -> 100% profile match
  const isMatchForCurrentProf = (req: ServiceRequest) => {
    if (!currentProf) return true;
    if (req.serviceId === 'outros_servicos') return true; // Rule: offer to all
    return currentProf.categories.includes(req.serviceId);
  };

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Text search
      const matchesSearch = 
        req.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Category specific filter
      if (selectedCategoryFilter !== 'all' && req.serviceId !== selectedCategoryFilter) {
        return false;
      }

      // Tab/Type filter
      if (filterType === 'perfil') {
        return isMatchForCurrentProf(req);
      }
      if (filterType === 'outros') {
        return req.serviceId === 'outros_servicos';
      }
      if (filterType === 'pendentes') {
        return req.status === 'pendente_orcamento';
      }
      if (filterType === 'minhas_propostas') {
        return currentProf ? req.assignedProfessional === currentProf.fullName : false;
      }

      return true;
    });
  }, [requests, currentProf, filterType, searchTerm, selectedCategoryFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = requests.length;
    const pendentes = requests.filter(r => r.status === 'pendente_orcamento').length;
    const outros = requests.filter(r => r.serviceId === 'outros_servicos').length;
    const compativeis = currentProf 
      ? requests.filter(r => isMatchForCurrentProf(r)).length 
      : total;
    const minhasPropostas = currentProf 
      ? requests.filter(r => r.assignedProfessional === currentProf.fullName).length 
      : 0;

    return { total, pendentes, outros, compativeis, minhasPropostas };
  }, [requests, currentProf]);

  // Open Direct Quote Form
  const handleOpenQuoteModal = (req: ServiceRequest) => {
    setActiveQuotingReq(req);
    // Suggest average price if available in professional's registered rate
    const matchedRate = currentProf?.serviceRates?.find(r => r.categoryId === req.serviceId);
    setQuotePrice(matchedRate ? String(matchedRate.averagePrice) : (req.quotedPrice ? String(req.quotedPrice) : ''));
    setQuoteHours(req.estimatedHours || '2 horas');
    setQuoteDate(req.desiredDate || new Date().toISOString().split('T')[0]);
    setQuoteNotes(req.adminNotes || `Olá ${req.clientName}, sou ${currentProf?.fullName || 'o profissional credenciado'} da SM Express. Tenho total disponibilidade para atender sua solicitação com garantia e qualidade.`);
  };

  // Submit Quote directly
  const handleDirectSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuotingReq) return;

    const numPrice = parseFloat(quotePrice) || 0;
    const profName = currentProf ? currentProf.fullName : 'Prestador Parceiro SM Express';

    onSendQuote(
      activeQuotingReq.id,
      numPrice,
      quoteHours,
      profName,
      quoteNotes,
      quoteDate
    );

    setQuoteSuccessMsg(`Orçamento de R$ ${numPrice.toFixed(2)} enviado diretamente para o cliente ${activeQuotingReq.clientName}! O status foi atualizado para "Orçamento Recebido" e o cliente já pode aprovar no app.`);
    setActiveQuotingReq(null);

    setTimeout(() => {
      setQuoteSuccessMsg(null);
    }, 6000);
  };

  // Generate automated WhatsApp notification simulation
  const handleOpenWhatsAppSimulator = (req: ServiceRequest) => {
    const profName = currentProf ? currentProf.fullName : 'Profissional SM Express';
    const profPhone = currentProf ? currentProf.phone : '(12) 99255-5104';
    const clientPhoneClean = req.clientPhone.replace(/\D/g, '');

    const isOutros = req.serviceId === 'outros_servicos';
    const matchText = isOutros 
      ? `📢 DEMANDA ABERTA (OUTROS SERVIÇOS - OFERTADA A TODOS OS PROFISSIONAIS)`
      : `🎯 DEMANDA COMPATÍVEL COM SEU PERFIL (${req.serviceTitle.toUpperCase()})`;

    const msg = `⚡ *ALERTA AUTOMÁTICO SM EXPRESS*\n\n${matchText}\n\n*Solicitação:* #${req.id} - ${req.serviceTitle}\n*Cliente:* ${req.clientName}\n*Local:* ${req.neighborhood}, ${req.city} - ${req.state}\n*Data Desejada:* ${new Date(req.desiredDate).toLocaleDateString('pt-BR')}\n*Detalhes:* ${Object.entries(req.details).map(([k, v]) => `\n• ${k}: ${v}`).join('')}\n\n👉 *Acesse o App SM Express para enviar seu orçamento direto sem intermediários.*`;

    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/55${clientPhoneClean}?text=${encodedMsg}`;

    setWhatsAppModalData({
      req,
      profName,
      profPhone,
      messageText: msg,
      whatsappUrl
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* Top Banner: Automation & Matching Engine */}
      <div className="bg-gradient-to-r from-slate-900 via-[#001838] to-slate-900 border border-amber-400/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 sm:w-80 h-60 sm:h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">
              Mural de Demandas & Oportunidades em Tempo Real
            </h2>
          </div>

          {/* Active Professional Specialties summary */}
          {currentProf && currentProf.categories.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
              <span className="text-slate-400 text-[10px] sm:text-[11px] font-medium flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                Especialidades:
              </span>
              {currentProf.categories.map((catId) => {
                const sDef = getServiceDef(catId);
                return (
                  <span key={catId} className="bg-slate-800 text-amber-300 border border-slate-700 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold">
                    {sDef ? sDef.title : catId}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      {quoteSuccessMsg && (
        <div className="bg-emerald-600 text-white p-3.5 sm:p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-slideDown">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>{quoteSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setQuoteSuccessMsg(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          onClick={() => setFilterType('perfil')}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all touch-target flex flex-col justify-between ${
            filterType === 'perfil'
              ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
          }`}
        >
          <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold opacity-80 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Meu Perfil</span>
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1">{stats.compativeis}</div>
          <div className="text-[9px] sm:text-[10px] opacity-75 mt-0.5 truncate">Demandas compatíveis</div>
        </button>

        <button
          onClick={() => setFilterType('outros')}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all touch-target flex flex-col justify-between ${
            filterType === 'outros'
              ? 'bg-purple-600 text-white border-purple-700 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold opacity-80 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Outros Serviços</span>
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1">{stats.outros}</div>
          <div className="text-[9px] sm:text-[10px] opacity-75 mt-0.5 truncate">Ofertado a todos</div>
        </button>

        <button
          onClick={() => setFilterType('pendentes')}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all touch-target flex flex-col justify-between ${
            filterType === 'pendentes'
              ? 'bg-[#001838] text-amber-400 border-slate-900 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold opacity-80 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Sem Orçamento</span>
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1">{stats.pendentes}</div>
          <div className="text-[9px] sm:text-[10px] opacity-75 mt-0.5 truncate">Prontas para orçar</div>
        </button>

        <button
          onClick={() => setFilterType('minhas_propostas')}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all touch-target flex flex-col justify-between ${
            filterType === 'minhas_propostas'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold opacity-80 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Minhas Propostas</span>
          </div>
          <div className="text-xl sm:text-2xl font-black mt-1">{stats.minhasPropostas}</div>
          <div className="text-[9px] sm:text-[10px] opacity-75 mt-0.5 truncate">Enviadas por você</div>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por bairro, cidade, cliente ou serviço..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">Todas as Categorias</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilterType('todas')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              filterType === 'todas'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ver Todas ({requests.length})
          </button>
        </div>
      </div>

      {/* Requests Feed */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Nenhuma solicitação encontrada neste filtro</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Assim que clientes solicitarem serviços ou novas demandas forem abertas, elas aparecerão automaticamente aqui.
          </p>
          <button
            onClick={() => {
              setFilterType('todas');
              setSearchTerm('');
              setSelectedCategoryFilter('all');
            }}
            className="px-5 py-2.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-300 transition-colors"
          >
            Limpar Filtros e Ver Todas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRequests.map((req) => {
            const isMatch = isMatchForCurrentProf(req);
            const isOutros = req.serviceId === 'outros_servicos';
            const isMyQuote = currentProf && req.assignedProfessional === currentProf.fullName;
            const hasQuote = Boolean(req.quotedPrice);

            return (
              <div
                key={req.id}
                className={`bg-white rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-lg overflow-hidden flex flex-col justify-between ${
                  isMyQuote 
                    ? 'border-emerald-400 ring-2 ring-emerald-400/20' 
                    : isOutros
                    ? 'border-purple-300 ring-1 ring-purple-300/30'
                    : isMatch
                    ? 'border-amber-400 ring-1 ring-amber-400/30'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Card Header & Matching Badges */}
                  <div className="p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-black text-slate-400 font-mono">
                            #{req.id}
                          </span>
                          
                          {/* Matching Badge */}
                          {isOutros ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                              <Users className="w-3 h-3 text-purple-600" />
                              OFERTADA A TODOS OS PRESTADORES
                            </span>
                          ) : isMatch ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                              COMPATÍVEL COM SEU PERFIL
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                              Outra Especialidade
                            </span>
                          )}

                          {isMyQuote && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Check className="w-3 h-3" />
                              SUA PROPOSTA
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                          {req.serviceTitle}
                        </h3>
                      </div>

                      {/* Status Tag */}
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black whitespace-nowrap ${
                        req.status === 'pendente_orcamento'
                          ? 'bg-amber-400 text-slate-950 animate-pulse'
                          : req.status === 'orcamento_recebido'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : req.status === 'aprovado'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status === 'pendente_orcamento' ? '⚡ Aguardando Orçamento' : 
                         req.status === 'orcamento_recebido' ? 'Orçamento Enviado' :
                         req.status === 'aprovado' ? 'Aprovado pelo Cliente' : req.status}
                      </span>
                    </div>

                    {/* Client & Location Meta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-800">{req.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{req.neighborhood}, {req.city} - {req.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>Data Desejada: <strong>{new Date(req.desiredDate).toLocaleDateString('pt-BR')}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>Criado em: {new Date(req.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Specific Details */}
                  <div className="p-5 space-y-3">
                    {/* Answers Breakdown */}
                    {Object.keys(req.details).length > 0 && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1.5 text-xs">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Respostas do Questionário do Cliente:
                        </div>
                        {Object.entries(req.details).map(([key, val]) => (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-700">
                            <span className="text-slate-500 font-medium">{key}:</span>
                            <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/60">{val}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Photos Preview */}
                    {(req.photoUrl || (req.photos && req.photos.length > 0)) && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-amber-500" />
                          Fotos do Local / Problema:
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {req.photos && req.photos.length > 0 ? (
                            req.photos.map((pUrl, idx) => (
                              <button
                                key={idx}
                                onClick={() => setZoomPhotoUrl(pUrl)}
                                className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 group cursor-zoom-in"
                              >
                                <img src={pUrl} alt="Foto anexa" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              </button>
                            ))
                          ) : req.photoUrl ? (
                            <button
                              onClick={() => setZoomPhotoUrl(req.photoUrl!)}
                              className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 group cursor-zoom-in"
                            >
                              <img src={req.photoUrl} alt="Foto anexa" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* Current Quote Details if already exists */}
                    {hasQuote && (
                      <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-amber-600" />
                            Orçamento Ativo:
                          </span>
                          <strong className="text-base text-slate-950 font-black">
                            R$ {req.quotedPrice?.toFixed(2)}
                          </strong>
                        </div>
                        <div className="text-[11px] text-slate-600 space-y-0.5">
                          <div><strong>Profissional:</strong> {req.assignedProfessional || 'Definido'}</div>
                          <div><strong>Prazo Estimado:</strong> {req.estimatedHours || 'A combinar'}</div>
                          {req.adminNotes && (
                            <div className="bg-white/80 p-2 rounded-lg border border-amber-200/60 italic text-slate-700 mt-1">
                              "{req.adminNotes}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenWhatsAppSimulator(req)}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
                      title="Ver mensagem automática formatada para WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mensagem WhatsApp</span>
                    </button>

                    {req.googleMapsUrl && (
                      <a
                        href={req.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs transition-colors flex items-center justify-center"
                        title="Ver rota no Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </a>
                    )}
                  </div>

                  {/* Primary Direct Action */}
                  <button
                    onClick={() => handleOpenQuoteModal(req)}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{hasQuote ? 'Atualizar Proposta' : '⚡ Enviar Orçamento Direto'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DIRECT QUOTE MODAL (Instantaneous without admin approval) */}
      {activeQuotingReq && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ⚡ Envio Direto ao Cliente • Sem Intermediação
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Enviar Orçamento: {activeQuotingReq.serviceTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Cliente: <strong>{activeQuotingReq.clientName}</strong> ({activeQuotingReq.neighborhood}, {activeQuotingReq.city})
                </p>
              </div>
              <button
                onClick={() => setActiveQuotingReq(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDirectSubmitQuote} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="text-slate-500 font-semibold">Prestador Responsável:</div>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" />
                  {currentProf ? currentProf.fullName : 'Prestador SM Express'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor Total do Orçamento (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      placeholder="Ex: 180,00"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempo / Duração Estimada *
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteHours}
                    onChange={(e) => setQuoteHours(e.target.value)}
                    placeholder="Ex: 2 horas, 1 dia..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Commission 30% Breakdown */}
              {parseFloat(quotePrice) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-extrabold text-[#001838]">
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                      Divisão Contratual de Repasse (30% SM Express):
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      Termo Assinado
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 bg-white p-2.5 rounded-xl border border-amber-100">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Sua Receita Bruta (Cliente):</span>
                      <strong className="text-emerald-700 text-sm">
                        R$ {parseFloat(quotePrice).toFixed(2)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Comissão SM Express (30%):</span>
                      <strong className="text-red-700 text-sm">
                        R$ {(parseFloat(quotePrice) * 0.30).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    * O repasse de 30% deve ser realizado em até <strong>3 dias úteis</strong> após a conclusão/aceite. Caso não seja quitado, o sistema emitirá boleto com encargos e NFS-e de intermediação.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Data Sugerida para Realização
                </label>
                <input
                  type="date"
                  value={quoteDate}
                  onChange={(e) => setQuoteDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mensagem / Detalhes da Proposta para o Cliente
                </label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Explique o que está incluído (materiais, ferramentas, garantia)..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveQuotingReq(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#001838] text-amber-400 hover:bg-[#00224f] font-black text-xs rounded-xl shadow-lg flex items-center gap-2 uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Orçamento Direto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP AUTOMATION SIMULATOR MODAL */}
      {whatsAppModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Mensagem Automática via WhatsApp
                  </h3>
                  <p className="text-xs text-slate-500">
                    Disparo de notificação e contato direto com o cliente
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWhatsAppModalData(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs text-emerald-950 font-mono whitespace-pre-wrap">
              {whatsAppModalData.messageText}
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
              <strong>Destinatário Cliente:</strong> {whatsAppModalData.req.clientName} ({whatsAppModalData.req.clientPhone})
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(whatsAppModalData.messageText);
                  setIsCopiedText(true);
                  setTimeout(() => setIsCopiedText(false), 3000);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  isCopiedText
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {isCopiedText ? '✓ Texto Copiado!' : 'Copiar Texto'}
              </button>
              <a
                href={whatsAppModalData.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow flex items-center gap-2 uppercase tracking-wider"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir no WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Digital Contract Modal */}
      {isContractModalOpen && currentProf && (
        <DigitalContractModal
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          professional={currentProf}
          customSignatureUrl={currentProf.contractSignatureUrl}
        />
      )}

      {/* Photo Zoom Modal */}
      {zoomPhotoUrl && (
        <div 
          onClick={() => setZoomPhotoUrl(null)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh]">
            <img 
              src={zoomPhotoUrl} 
              alt="Foto ampliada" 
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-slate-700" 
            />
            <button 
              onClick={() => setZoomPhotoUrl(null)}
              className="absolute -top-3 -right-3 p-2 bg-white text-slate-900 rounded-full shadow-lg font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
