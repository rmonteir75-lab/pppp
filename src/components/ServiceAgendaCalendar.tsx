import React, { useState, useMemo } from 'react';
import { ServiceRequest, ProfessionalProfile, ServiceDefinition } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Search, 
  ExternalLink, 
  MessageCircle, 
  Printer, 
  Download, 
  Plus, 
  CalendarDays, 
  ListFilter,
  Check,
  X,
  Camera,
  Briefcase,
  Layers
} from 'lucide-react';

interface ServiceAgendaCalendarProps {
  requests: ServiceRequest[];
  professionals: ProfessionalProfile[];
  services: ServiceDefinition[];
  onUpdateStatus: (requestId: string, status: ServiceRequest['status']) => void;
  onOpenQuoteForm: (req: ServiceRequest) => void;
  onRescheduleRequest?: (requestId: string, newDate: string) => void;
  onNewDirectBooking?: (request: Partial<ServiceRequest>) => void;
}

export const ServiceAgendaCalendar: React.FC<ServiceAgendaCalendarProps> = ({
  requests,
  professionals,
  services,
  onUpdateStatus,
  onOpenQuoteForm,
  onRescheduleRequest,
  onNewDirectBooking
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'day_list' | 'timeline'>('month');
  const [selectedProfFilter, setSelectedProfFilter] = useState<string>('todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected Request Detail Modal
  const [selectedReqDetail, setSelectedReqDetail] = useState<ServiceRequest | null>(null);
  
  // Reschedule Modal
  const [rescheduleReq, setRescheduleReq] = useState<ServiceRequest | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState('');

  // Current Month / Year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to parse date string into standard YYYY-MM-DD
  const parseRequestDate = (req: ServiceRequest): { dateStr: string; day: number; month: number; year: number } | null => {
    const rawDate = req.scheduledDate || req.desiredDate;
    if (!rawDate) return null;

    // Check if ISO formatted (YYYY-MM-DD)
    if (rawDate.includes('-') && rawDate.split('-').length === 3) {
      const parts = rawDate.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return { dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, month: m, year: y };
      }
    }

    // Check if BR formatted (DD/MM/YYYY)
    if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length >= 2) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parts.length === 3 ? parseInt(parts[2], 10) : currentYear;
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          return { dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day: d, month: m, year: y };
        }
      }
    }

    return null;
  };

  // Filtered requests for the agenda
  const filteredAgendaRequests = useMemo(() => {
    return requests.filter(req => {
      // Must be an active, approved, in-execution or completed service, or any request with date
      const isRelevant = ['aprovado', 'em_execucao', 'concluido', 'orcamento_recebido', 'pendente_orcamento'].includes(req.status);
      if (!isRelevant) return false;

      const matchSearch = 
        req.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.serviceTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.assignedProfessional?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchProf = selectedProfFilter === 'todos' || req.assignedProfessional === selectedProfFilter;
      const matchStatus = selectedStatusFilter === 'todos' || req.status === selectedStatusFilter;

      return matchSearch && matchProf && matchStatus;
    });
  }, [requests, searchTerm, selectedProfFilter, selectedStatusFilter]);

  // Group requests by calendar days for current month view
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    // Empty padding slots for days before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, isCurrentMonth: false, requests: [] });
    }

    // Days of the month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dayRequests = filteredAgendaRequests.filter(req => {
        const parsed = parseRequestDate(req);
        if (!parsed) return false;
        return parsed.day === d && parsed.month === currentMonth && parsed.year === currentYear;
      });

      days.push({
        day: d,
        isCurrentMonth: true,
        isToday: d === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear(),
        requests: dayRequests
      });
    }

    return days;
  }, [currentYear, currentMonth, filteredAgendaRequests]);

  // Today's Scheduled Services
  const todaysSchedule = useMemo(() => {
    const today = new Date();
    const tDay = today.getDate();
    const tMonth = today.getMonth();
    const tYear = today.getFullYear();

    return filteredAgendaRequests.filter(req => {
      const parsed = parseRequestDate(req);
      if (!parsed) return false;
      return parsed.day === tDay && parsed.month === tMonth && parsed.year === tYear;
    });
  }, [filteredAgendaRequests]);

  // WhatsApp quick trigger
  const handleOpenWhatsApp = (req: ServiceRequest, type: 'cliente' | 'profissional') => {
    const phone = type === 'cliente' ? req.clientPhone : '';
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = `Olá, ${req.clientName}! Confirmando o agendamento do serviço de ${req.serviceTitle} marcado para ${req.scheduledDate || req.desiredDate}.`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Reschedule save
  const handleConfirmReschedule = () => {
    if (rescheduleReq && newScheduleDate) {
      if (onRescheduleRequest) {
        onRescheduleRequest(rescheduleReq.id, newScheduleDate);
      } else {
        // Fallback: update directly
        rescheduleReq.scheduledDate = newScheduleDate;
      }
      setRescheduleReq(null);
      setNewScheduleDate('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-[#001838]">Agenda Geral de Serviços & Escala</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planejamento de visitas técnicas, execução em campo e alocação de prestadores credenciados.
          </p>
        </div>

        {/* View Switcher & Month Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-xs text-slate-800 whitespace-nowrap min-w-[130px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200"
          >
            Hoje
          </button>

          {/* View Mode Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'month' ? 'bg-[#001838] text-amber-400 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('day_list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'day_list' ? 'bg-[#001838] text-amber-400 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lista Diária
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
            title="Imprimir Escala do Mês"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente, prestador, serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
            />
          </div>

          {/* Filter Professional */}
          <select
            value={selectedProfFilter}
            onChange={(e) => setSelectedProfFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          >
            <option value="todos">Todos os Prestadores</option>
            {professionals.map(p => (
              <option key={p.id} value={p.fullName}>{p.fullName}</option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-amber-400 focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="aprovado">Aprovado / Agendado</option>
            <option value="em_execucao">Em Execução</option>
            <option value="concluido">Concluído</option>
            <option value="orcamento_recebido">Orçamento Enviado</option>
            <option value="pendente_orcamento">Pendente Orçamento</option>
          </select>
        </div>

        {/* Schedule Summary Mini Totem */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1 text-blue-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            {filteredAgendaRequests.filter(r => r.status === 'aprovado').length} Agendados
          </span>
          <span className="flex items-center gap-1 text-sky-700">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
            {filteredAgendaRequests.filter(r => r.status === 'em_execucao').length} Em Execução
          </span>
          <span className="flex items-center gap-1 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            {filteredAgendaRequests.filter(r => r.status === 'concluido' || r.status === 'avaliado').length} Concluídos
          </span>
        </div>
      </div>

      {/* TODAY'S PRIORITY DISPATCH BANNER */}
      {todaysSchedule.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/5 border border-amber-400/50 p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Escala de Atendimentos Para Hoje ({todaysSchedule.length} serviço{todaysSchedule.length > 1 ? 's' : ''})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Prioridade do Dia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaysSchedule.map(req => (
              <div 
                key={req.id}
                onClick={() => setSelectedReqDetail(req)}
                className="bg-white p-3 rounded-xl border border-amber-300 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-700">{req.id}</span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {req.serviceTitle}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                    req.status === 'concluido' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'em_execucao' ? 'bg-sky-100 text-sky-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {req.status === 'concluido' ? 'Concluído' : req.status === 'em_execucao' ? 'Em Campo' : 'Agendado'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">Cliente: {req.clientName}</p>
                  <p className="text-slate-500 truncate">{req.street}, {req.number} - {req.neighborhood}</p>
                  <p className="text-indigo-700 font-bold">Prestador: {req.assignedProfessional || 'A definir'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONTH VIEW CALENDAR GRID */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-xs font-black text-slate-500 uppercase tracking-wider">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((item, idx) => {
              if (!item.isCurrentMonth || item.day === null) {
                return (
                  <div key={idx} className="min-h-[90px] sm:min-h-[110px] bg-slate-50/50 rounded-xl border border-slate-100 p-1.5 opacity-40" />
                );
              }

              return (
                <div
                  key={idx}
                  className={`min-h-[90px] sm:min-h-[115px] rounded-xl border p-1.5 transition-all flex flex-col justify-between ${
                    item.isToday 
                      ? 'bg-amber-50/70 border-amber-400 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.2 rounded-md ${
                      item.isToday ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-700'
                    }`}>
                      {item.day}
                    </span>
                    {item.requests.length > 0 && (
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                        {item.requests.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[75px]">
                    {item.requests.slice(0, 3).map(req => (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => setSelectedReqDetail(req)}
                        className={`w-full text-left p-1 rounded-md text-[10px] font-bold truncate transition-colors flex items-center gap-1 ${
                          req.status === 'concluido' ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900' :
                          req.status === 'em_execucao' ? 'bg-sky-100 hover:bg-sky-200 text-sky-900' :
                          req.status === 'aprovado' ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900' :
                          'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        }`}
                        title={`${req.serviceTitle} - ${req.clientName} (${req.assignedProfessional || 'Sem prestador'})`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                        <span className="truncate">{req.serviceTitle}</span>
                      </button>
                    ))}
                    {item.requests.length > 3 && (
                      <span className="text-[9px] font-bold text-slate-500 block text-center">
                        +{item.requests.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY LIST VIEW */}
      {viewMode === 'day_list' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#001838] uppercase tracking-wider">
            Lista Completa de Agendamentos Cadastrados
          </h3>

          <div className="divide-y divide-slate-100">
            {filteredAgendaRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum agendamento encontrado para o filtro selecionado.
              </div>
            ) : (
              filteredAgendaRequests.map(req => (
                <div 
                  key={req.id} 
                  className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        {req.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{req.serviceTitle}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        req.status === 'concluido' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'em_execucao' ? 'bg-sky-100 text-sky-800' :
                        req.status === 'aprovado' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {req.clientName} ({req.clientPhone})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {req.street}, {req.number} - {req.neighborhood}, {req.city}
                      </span>
                      <span className="flex items-center gap-1 text-indigo-700 font-bold">
                        <Briefcase className="w-3.5 h-3.5" /> Prestador: {req.assignedProfessional || 'Não escalado'}
                      </span>
                      <span className="flex items-center gap-1 text-amber-700 font-bold">
                        <CalendarIcon className="w-3.5 h-3.5" /> Data: {req.scheduledDate || req.desiredDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleOpenWhatsApp(req, 'cliente')}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      title="WhatsApp Cliente"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setRescheduleReq(req);
                        setNewScheduleDate(req.scheduledDate || req.desiredDate || '');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Reagendar
                    </button>
                    <button
                      onClick={() => setSelectedReqDetail(req)}
                      className="px-3 py-1.5 bg-[#001838] hover:bg-[#022452] text-amber-400 font-bold text-xs rounded-xl transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR SELECTED SERVICE */}
      {selectedReqDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#001838] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">{selectedReqDetail.id}</span>
                <h3 className="text-base font-black text-white mt-0.5">{selectedReqDetail.serviceTitle}</h3>
              </div>
              <button 
                onClick={() => setSelectedReqDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Status do Atendimento</span>
                  <span className="text-xs font-black text-slate-900">
                    {selectedReqDetail.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                {selectedReqDetail.quotedPrice && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Valor do Serviço</span>
                    <span className="text-sm font-black text-emerald-600">
                      R$ {selectedReqDetail.quotedPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dados do Cliente & Local</h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1.5 text-xs text-slate-700">
                  <p><strong>Nome:</strong> {selectedReqDetail.clientName}</p>
                  <p><strong>Telefone:</strong> {selectedReqDetail.clientPhone}</p>
                  <p><strong>Endereço:</strong> {selectedReqDetail.street}, {selectedReqDetail.number} - {selectedReqDetail.neighborhood}, {selectedReqDetail.city}/{selectedReqDetail.state}</p>
                  <p><strong>Data Agendada:</strong> {selectedReqDetail.scheduledDate || selectedReqDetail.desiredDate}</p>
                </div>
              </div>

              {/* Professional */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profissional Escalado</h4>
                <div className="bg-slate-50 p-3.5 rounded-2xl text-xs text-slate-700 flex items-center justify-between">
                  <span>{selectedReqDetail.assignedProfessional || 'Nenhum profissional atribuído'}</span>
                  {selectedReqDetail.estimatedHours && (
                    <span className="text-slate-500">Estimativa: {selectedReqDetail.estimatedHours}</span>
                  )}
                </div>
              </div>

              {/* Google Maps Link */}
              <a
                href={selectedReqDetail.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedReqDetail.street}, ${selectedReqDetail.number}, ${selectedReqDetail.city}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Rota no Google Maps</span>
              </a>

              {/* Photos */}
              {((selectedReqDetail.photos && selectedReqDetail.photos.length > 0) || selectedReqDetail.photoUrl) && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fotos Anexadas</h4>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {(selectedReqDetail.photos || [selectedReqDetail.photoUrl]).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Anexo"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between gap-2">
              <button
                onClick={() => handleOpenWhatsApp(selectedReqDetail, 'cliente')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Cliente</span>
              </button>

              <div className="flex gap-2">
                {selectedReqDetail.status !== 'concluido' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedReqDetail.id, 'concluido');
                      setSelectedReqDetail(null);
                    }}
                    className="px-4 py-2 bg-[#001838] hover:bg-[#022452] text-amber-400 font-bold text-xs rounded-xl transition-colors"
                  >
                    Concluir Serviço
                  </button>
                )}
                <button
                  onClick={() => setSelectedReqDetail(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RE-SCHEDULE MODAL */}
      {rescheduleReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reagendar Atendimento</h3>
            <p className="text-xs text-slate-500">
              Altere a data prevista para o serviço <strong>{rescheduleReq.serviceTitle}</strong> ({rescheduleReq.clientName}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nova Data</label>
              <input
                type="date"
                value={newScheduleDate}
                onChange={(e) => setNewScheduleDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRescheduleReq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-2 bg-[#001838] hover:bg-[#022452] text-amber-400 font-bold text-xs rounded-xl"
              >
                Salvar Nova Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
