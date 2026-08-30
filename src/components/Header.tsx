import React, { useState } from 'react';
import { 
  Smartphone, 
  LayoutDashboard, 
  FileText, 
  Bell, 
  User, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Briefcase,
  Check,
  Clock,
  DollarSign,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';

import { UserAccount, ServiceRequest } from '../types';
import { SMExpressLogo } from './SMExpressLogo';

interface HeaderProps {
  currentView: 'client' | 'admin' | 'professional';
  onViewChange: (view: 'client' | 'admin' | 'professional') => void;
  phoneFrameMode: boolean;
  onTogglePhoneFrame: () => void;
  pendingQuotesCount: number;
  currentUser: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'register' | 'profile' | 'forgot_password' | 'admin_access') => void;
  onLogout: () => void;
  requests?: ServiceRequest[];
  onOpenSupabaseModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  phoneFrameMode,
  onTogglePhoneFrame,
  pendingQuotesCount,
  currentUser,
  onOpenAuth,
  onLogout,
  requests = [],
  onOpenSupabaseModal
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  // Build list of dynamic notifications based on active role and requests state
  const buildNotifications = () => {
    const list: {
      id: string;
      type: 'quote' | 'status' | 'review' | 'new_req' | 'info';
      title: string;
      message: string;
      date: string;
      targetView: 'client' | 'admin' | 'professional';
      requestId?: string;
    }[] = [];

    // Filter by user role or fallback to client
    const userRole = currentUser?.role || 'cliente';

    if (userRole === 'cliente') {
      requests.forEach(req => {
        if (req.status === 'orcamento_recebido') {
          list.push({
            id: `notif-quote-${req.id}`,
            type: 'quote',
            title: 'Orçamento Recebido!',
            message: `Sua solicitação de "${req.serviceTitle}" foi respondida. Valor: R$ ${(req.quotedPrice || 0).toFixed(2).replace('.', ',')}.`,
            date: 'Agora',
            targetView: 'client',
            requestId: req.id
          });
        } else if (req.status === 'em_execucao') {
          list.push({
            id: `notif-exec-${req.id}`,
            type: 'status',
            title: 'Serviço em Execução',
            message: `O profissional ${req.assignedProfessional || 'designado'} está executando "${req.serviceTitle}".`,
            date: 'Recente',
            targetView: 'client',
            requestId: req.id
          });
        } else if (req.status === 'concluido') {
          list.push({
            id: `notif-conc-${req.id}`,
            type: 'review',
            title: 'Serviço Concluído',
            message: `"${req.serviceTitle}" foi concluído com sucesso. Clique para deixar sua avaliação!`,
            date: 'Hoje',
            targetView: 'client',
            requestId: req.id
          });
        }
      });
    } else if (userRole === 'admin') {
      const pendingReqs = requests.filter(r => r.status === 'pendente_orcamento');
      if (pendingReqs.length > 0) {
        list.push({
          id: 'notif-admin-reqs',
          type: 'new_req',
          title: `${pendingReqs.length} Novo(s) Pedido(s)`,
          message: `Você tem ${pendingReqs.length} solicitação(ões) pendente(s) de envio de orçamento.`,
          date: 'Agora',
          targetView: 'admin'
        });
      }
    } else if (userRole === 'profissional') {
      const assignedReqs = requests.filter(r => r.assignedProfessional);
      if (assignedReqs.length > 0) {
        list.push({
          id: 'notif-prof-jobs',
          type: 'info',
          title: 'Serviços Designados',
          message: `Você tem ${assignedReqs.length} serviço(s) na sua agenda.`,
          date: 'Hoje',
          targetView: 'professional'
        });
      }
    }

    // Default welcoming notification if empty
    if (list.length === 0) {
      list.push({
        id: 'notif-welcome',
        type: 'info',
        title: 'Bem-vindo ao SM Express',
        message: 'Solicite serviços gerais e acompanhe o status em tempo real aqui.',
        date: 'Hoje',
        targetView: 'client'
      });
    }

    return list;
  };

  const notificationsList = buildNotifications();
  const unreadCount = notificationsList.filter(n => !readNotificationIds.includes(n.id)).length;

  const handleMarkAllRead = () => {
    const allIds = notificationsList.map(n => n.id);
    setReadNotificationIds(prev => Array.from(new Set([...prev, ...allIds])));
  };

  const handleNotificationClick = (targetView: 'client' | 'admin' | 'professional', notifId: string) => {
    setReadNotificationIds(prev => Array.from(new Set([...prev, notifId])));
    onViewChange(targetView);
    setShowNotifications(false);
  };

  return (
    <header className="bg-[#001838] text-white sticky top-0 z-40 shadow-xl border-b border-amber-500/20">
      {/* Top Banner / Trust Bar with Real Flyer Phone Numbers & Contact */}
      <div className="bg-gradient-to-r from-navy-950 via-[#01142e] to-[#001838] px-3 sm:px-4 py-1.5 border-b border-white/10 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-1.5 sm:gap-2 text-slate-300">
          
          <div className="flex items-center space-x-2 sm:space-x-4 text-[10px] sm:text-xs">
            <span className="flex items-center gap-1 text-sky-400 font-semibold">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Orçamento Sem Compromisso!</span>
            </span>
          </div>

          {/* Quick Contact & WhatsApp from Flyer */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs text-slate-300">
            <a 
              href="https://wa.me/5512992555104?text=Ol%C3%A1,%20gostaria%20de%20um%20or%C3%A7amento%20com%20a%20SM%20Express!" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors py-0.5"
            >
              <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-emerald-400" />
              <span>(12) 99255-5104</span>
            </a>
            <span className="text-slate-600 hidden xs:inline">•</span>
            <a 
              href="https://wa.me/5512991601322?text=Ol%C3%A1,%20gostaria%20de%20um%20or%C3%A7amento%20com%20a%20SM%20Express!" 
              target="_blank" 
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors py-0.5"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-emerald-400" />
              <span>(12) 99160-1322</span>
            </a>
            <span className="text-slate-600 hidden md:inline">•</span>
            <a 
              href="mailto:suportesmservicos@gmail.com"
              className="hidden md:flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors py-0.5"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>suportesmservicos@gmail.com</span>
            </a>
          </div>

        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Official Logo Brand from Uploaded Image */}
          <div 
            onClick={() => onViewChange('client')}
            className="flex items-center cursor-pointer group flex-shrink-0"
          >
            <SMExpressLogo variant="horizontal" size="sm" customSize={46} showTagline={false} />
          </div>

          {/* Navigation Tabs (Mode Switcher) */}
          <div className="hidden md:flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              id="nav-client-app"
              onClick={() => onViewChange('client')}
              className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                currentView === 'client'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>App do Cliente</span>
              {pendingQuotesCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {pendingQuotesCount}
                </span>
              )}
            </button>

            <button
              id="nav-admin-panel"
              onClick={() => onViewChange('admin')}
              className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                currentView === 'admin'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel Administrativo</span>
            </button>

            <button
              id="nav-professional"
              onClick={() => onViewChange('professional')}
              className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all ${
                currentView === 'professional'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Área do Profissional</span>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                id="notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors touch-target flex items-center justify-center"
                title="Notificações"
              >
                <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Backdrop to close dropdown when clicking outside */}
              {showNotifications && (
                <div 
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setShowNotifications(false)}
                />
              )}

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] xs:w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 text-slate-200 text-sm overflow-hidden animate-fade-in max-w-sm sm:max-w-md">
                  
                  {/* Notification Header */}
                  <div className="p-3.5 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span className="font-extrabold text-sm text-white">Notificações</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                          {unreadCount} nova(s)
                        </span>
                      )}
                    </div>
                    
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-amber-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        Lidas
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
                    {notificationsList.map(notif => {
                      const isUnread = !readNotificationIds.includes(notif.id);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif.targetView, notif.id)}
                          className={`p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer border flex items-start gap-2.5 sm:gap-3 ${
                            isUnread
                              ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                              : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/50 opacity-80'
                          }`}
                        >
                          <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                            notif.type === 'quote'
                              ? 'bg-amber-400 text-slate-950'
                              : notif.type === 'review'
                              ? 'bg-emerald-400 text-slate-950'
                              : notif.type === 'new_req'
                              ? 'bg-purple-400 text-slate-950'
                              : 'bg-blue-500 text-white'
                          }`}>
                            {notif.type === 'quote' && <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-bold" />}
                            {notif.type === 'review' && <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-bold" />}
                            {notif.type === 'new_req' && <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 font-bold" />}
                            {(notif.type === 'status' || notif.type === 'info') && <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-xs text-white truncate">{notif.title}</h4>
                              <span className="text-[10px] text-slate-400 flex-shrink-0">{notif.date}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-0.5 leading-snug line-clamp-2">
                              {notif.message}
                            </p>
                          </div>

                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Notification Footer Action */}
                  <div className="p-2.5 sm:p-3 bg-slate-950 border-t border-slate-800 text-center">
                    <button
                      onClick={() => {
                        onViewChange(currentUser?.role === 'admin' ? 'admin' : currentUser?.role === 'profissional' ? 'professional' : 'client');
                        setShowNotifications(false);
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Acessar Painel Principal</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* User Profile / Auth Area */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-700/60">
              {currentUser ? (
                <button
                  id="user-profile-btn"
                  onClick={() => onOpenAuth('profile')}
                  className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/80 transition-all text-left"
                >
                  <img
                    src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                    alt={currentUser.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-400 flex-shrink-0"
                  />
                  <div className="hidden lg:block">
                    <div className="text-xs font-bold text-white leading-tight max-w-[100px] xl:max-w-[120px] truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                      {currentUser.role === 'admin' ? '🛡️ Admin Master' : currentUser.role === 'profissional' ? 'Profissional' : 'Cliente'}
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    id="login-btn"
                    onClick={() => onOpenAuth('login')}
                    className="px-2.5 sm:px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1 touch-target justify-center"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Entrar</span>
                  </button>
                  <button
                    id="register-btn"
                    onClick={() => onOpenAuth('register')}
                    className="hidden sm:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all touch-target items-center justify-center"
                  >
                    <span>Cadastrar</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile View Switcher Bar */}
        <div className="grid grid-cols-3 gap-1.5 md:hidden mt-2.5 pt-2 border-t border-slate-800 text-xs font-bold">
          <button
            onClick={() => onViewChange('client')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
              currentView === 'client' 
                ? 'bg-amber-400 text-slate-950 font-black shadow-md' 
                : 'text-slate-300 hover:text-white bg-slate-900/60'
            }`}
          >
            <Smartphone className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Cliente</span>
          </button>
          <button
            onClick={() => onViewChange('admin')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
              currentView === 'admin' 
                ? 'bg-amber-400 text-slate-950 font-black shadow-md' 
                : 'text-slate-300 hover:text-white bg-slate-900/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Admin</span>
          </button>
          <button
            onClick={() => onViewChange('professional')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
              currentView === 'professional' 
                ? 'bg-amber-400 text-slate-950 font-black shadow-md' 
                : 'text-slate-300 hover:text-white bg-slate-900/60'
            }`}
          >
            <Briefcase className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Parceiro</span>
          </button>
        </div>

      </div>
    </header>
  );
};
