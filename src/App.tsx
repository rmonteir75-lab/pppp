import React, { useState, useEffect } from 'react';
import { 
  ServiceDefinition, 
  ServiceRequest, 
  AdminMetrics, 
  RequestStatus,
  ProfessionalProfile,
  UserAccount,
  CommissionCharge,
  PaymentGatewaySettings,
  PaymentMethod,
  PaymentStatus
} from './types';
import { 
  SERVICES_LIST, 
  INITIAL_USERS,
  DEFAULT_PAYMENT_GATEWAY_SETTINGS
} from './data/mockData';

import { Header } from './components/Header';
import { BannerSection } from './components/BannerSection';
import { ServicesGrid } from './components/ServicesGrid';
import { ServiceRequestModal } from './components/ServiceRequestModal';
import { OrderTracking } from './components/OrderTracking';
import { ReviewModal } from './components/ReviewModal';
import { SMExpressLogo } from './components/SMExpressLogo';
import { AdminDashboard } from './components/AdminDashboard';
import { PhoneContainer } from './components/PhoneContainer';
import { ProfessionalRegistration } from './components/ProfessionalRegistration';
import { AuthModal } from './components/AuthModal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { supabaseService } from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';

export default function App() {
  // Navigation & Frame Mode
  const [currentView, setCurrentView] = useState<'client' | 'admin' | 'professional'>('client');
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  // Users & Auth State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('smexpress_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(u => 
            !['USR-CLI-001', 'USR-PRO-001', 'USR-ADM-999'].includes(u.id) &&
            u.email !== 'admin@smexpress.com' &&
            u.email !== 'joao.cliente@gmail.com' &&
            u.email !== 'marcos.piscineiro@smexpress.com' &&
            !u.email.toLowerCase().includes('teste') &&
            !u.name.toLowerCase().includes('teste')
          );
          const hasAdmin = cleaned.some((u: UserAccount) => u.email === 'rmonteir75@gmail.com');
          return hasAdmin ? cleaned : [...INITIAL_USERS, ...cleaned];
        }
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('smexpress_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.email === 'admin@smexpress.com' || parsed?.email?.includes('teste') || parsed?.name?.includes('Teste')) {
          return INITIAL_USERS[0];
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register' | 'profile' | 'forgot_password' | 'admin_access'>('login');

  // Save users and current user to localStorage
  useEffect(() => {
    localStorage.setItem('smexpress_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smexpress_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smexpress_current_user');
    }
  }, [currentUser]);

  // App Data State (Clean Production State)
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem('smexpress_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(r => 
            !['REQ-1001', 'REQ-1002', 'REQ-1003', 'REQ-1004', 'REQ-1005', 'REQ-1006', 'REQ-1007', 'REQ-1008', 'REQ-1009'].includes(r.id) &&
            !r.clientName.toLowerCase().includes('teste')
          );
        }
        return [];
      } catch {
        return [];
      }
    }
    return [];
  });
  
  // Dynamic metrics calculated accurately from actual requests
  const metrics: AdminMetrics = {
    totalSolicitacoes: requests.length,
    totalOrcamentos: requests.filter(r => r.status === 'orcamento_recebido' || (r.quotedPrice !== undefined && r.quotedPrice > 0)).length,
    totalAgendamentos: requests.filter(r => ['aprovado', 'em_execucao', 'concluido', 'avaliado'].includes(r.status)).length,
    totalFaturamento: requests
      .filter(r => ['aprovado', 'em_execucao', 'concluido', 'avaliado'].includes(r.status))
      .reduce((acc, r) => acc + (r.quotedPrice || 0), 0)
  };
  
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>(() => {
    const saved = localStorage.getItem('smexpress_professionals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(p => 
            !['PRO-101', 'PRO-102', 'PRO-103', 'PRO-104', 'PRO-105'].includes(p.id) &&
            !p.fullName.toLowerCase().includes('teste') &&
            !p.email?.toLowerCase().includes('piscineiro')
          );
        }
        return [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [commissionCharges, setCommissionCharges] = useState<CommissionCharge[]>(() => {
    const saved = localStorage.getItem('smexpress_commissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(c => 
            !['COM-9041', 'COM-9042', 'COM-9043', 'COM-9044'].includes(c.id) &&
            !c.professionalName?.toLowerCase().includes('marcos piscineiro')
          );
        }
        return [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [gatewaySettings, setGatewaySettings] = useState<PaymentGatewaySettings>(() => {
    const saved = localStorage.getItem('smexpress_gateway_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PAYMENT_GATEWAY_SETTINGS,
          ...parsed,
          environment: 'production'
        };
      } catch {
        return DEFAULT_PAYMENT_GATEWAY_SETTINGS;
      }
    }
    return DEFAULT_PAYMENT_GATEWAY_SETTINGS;
  });

  // Save requests, professionals, commissions and gatewaySettings to localStorage
  useEffect(() => {
    localStorage.setItem('smexpress_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('smexpress_professionals', JSON.stringify(professionals));
  }, [professionals]);

  useEffect(() => {
    localStorage.setItem('smexpress_commissions', JSON.stringify(commissionCharges));
  }, [commissionCharges]);

  useEffect(() => {
    localStorage.setItem('smexpress_gateway_settings', JSON.stringify(gatewaySettings));
  }, [gatewaySettings]);

  // Load from Supabase on mount if configured
  const loadDataFromSupabase = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [remoteReqs, remoteProfs, remoteCharges, remoteUsers, remoteSettings] = await Promise.all([
        supabaseService.getServiceRequests(),
        supabaseService.getProfessionals(),
        supabaseService.getCommissionCharges(),
        supabaseService.getUsers(),
        supabaseService.getGatewaySettings()
      ]);

      if (remoteReqs.length > 0) setRequests(remoteReqs);
      if (remoteProfs.length > 0) setProfessionals(remoteProfs);
      if (remoteCharges.length > 0) setCommissionCharges(remoteCharges);
      if (remoteUsers.length > 0) setUsers(remoteUsers);
      if (remoteSettings) setGatewaySettings(remoteSettings);
    } catch (err) {
      console.warn('Could not load data from Supabase, maintaining local cache:', err);
    }
  };

  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  // Active Modals State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceDefinition | null>(null);
  const [requestInitialDescription, setRequestInitialDescription] = useState<string>('');
  const [clientTab, setClientTab] = useState<'solicitar' | 'pedidos'>('solicitar');

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<ServiceRequest | null>(null);

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else if (user.role === 'profissional') {
      setCurrentView('professional');
    } else {
      setCurrentView('client');
    }
  };

  const handleRegisterUser = (newUser: UserAccount) => {
    setUsers(prev => [newUser, ...prev]);
    supabaseService.upsertUser(newUser).catch(() => {});
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    supabaseService.upsertUser(updatedUser).catch(() => {});
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
    }
    supabaseService.deleteUser(userId).catch(() => {});
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'profile' | 'forgot_password' | 'admin_access' = 'login') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Handlers
  const handleOpenRequestModal = (service: ServiceDefinition | null, initialText?: string, categoryId?: string) => {
    if (categoryId) {
      const found = SERVICES_LIST.find(s => s.id === categoryId);
      setSelectedServiceForModal(found || SERVICES_LIST[0]);
    } else {
      setSelectedServiceForModal(service || SERVICES_LIST[0]);
    }
    setRequestInitialDescription(initialText || '');
    setIsRequestModalOpen(true);
  };

  const handleCreateRequest = (newRequest: ServiceRequest) => {
    setRequests(prev => [newRequest, ...prev]);
    setClientTab('pedidos'); // Automatically switch to orders tracking
    supabaseService.upsertServiceRequest(newRequest).catch(() => {});
  };

  const handleDeleteRequest = (requestId: string) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    supabaseService.deleteServiceRequest(requestId).catch(() => {});
  };

  const handleRegisterProfessional = (newProf: Omit<ProfessionalProfile, 'id' | 'createdAt' | 'rating' | 'completedJobs' | 'status'>) => {
    const createdProf: ProfessionalProfile = {
      ...newProf,
      id: `PRO-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      rating: 5.0,
      completedJobs: 0,
      status: 'pendente_aprovacao'
    };
    setProfessionals(prev => [createdProf, ...prev]);
    supabaseService.upsertProfessional(createdProf).catch(() => {});
  };

  const handleApproveProfessional = (profId: string) => {
    setProfessionals(prev => {
      const updated = prev.map(p => p.id === profId ? { ...p, status: 'aprovado' as const } : p);
      const target = updated.find(p => p.id === profId);
      if (target) supabaseService.upsertProfessional(target).catch(() => {});
      return updated;
    });
  };

  const handleDeleteProfessional = (profId: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== profId));
    // Also remove or unlink commission charges related to this professional if needed
    setCommissionCharges(prev => prev.filter(c => c.professionalId !== profId));
    supabaseService.deleteProfessional(profId).catch(() => {});
  };

  const handleSendQuoteByAdmin = (
    requestId: string, 
    price: number, 
    hours: string, 
    prof: string, 
    notes: string,
    scheduledDate?: string
  ) => {
    setRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            quotedPrice: price,
            estimatedHours: hours,
            assignedProfessional: prof,
            adminNotes: notes,
            scheduledDate: scheduledDate || req.scheduledDate || req.desiredDate,
            status: 'orcamento_recebido' as RequestStatus
          };
        }
        return req;
      });
      const target = updated.find(r => r.id === requestId);
      if (target) supabaseService.upsertServiceRequest(target).catch(() => {});
      return updated;
    });
  };

  const handleApproveQuoteByClient = (requestId: string) => {
    setRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'aprovado' as RequestStatus,
            scheduledDate: req.desiredDate + ' 09:00'
          };
        }
        return req;
      });
      const target = updated.find(r => r.id === requestId);
      if (target) supabaseService.upsertServiceRequest(target).catch(() => {});
      return updated;
    });

    // Generate commission charge for the assigned professional
    const targetReq = requests.find(r => r.id === requestId);
    if (targetReq && targetReq.quotedPrice && targetReq.assignedProfessional) {
      const prof = professionals.find(p => p.fullName === targetReq.assignedProfessional || p.id === targetReq.assignedProfessional);
      const commissionVal = targetReq.quotedPrice * 0.30;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);
      const chargeId = `COM-${targetReq.id.replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000)}`;

      setCommissionCharges(prev => {
        if (prev.some(c => c.requestId === targetReq.id)) return prev;
        const newCharge: CommissionCharge = {
          id: chargeId,
          requestId: targetReq.id,
          serviceTitle: targetReq.serviceTitle,
          professionalId: prof?.id || 'PRO-DIR',
          professionalName: targetReq.assignedProfessional,
          professionalCpfCnpj: prof?.cpfCnpj || '000.000.000-00',
          professionalPhone: prof?.phone || '(12) 99999-9999',
          clientName: targetReq.clientName,
          clientPhone: targetReq.phone || '(12) 99999-9999',
          clientAddress: targetReq.address || '',
          serviceValue: targetReq.quotedPrice || 0,
          commissionPercent: 30,
          commissionValue: commissionVal,
          status: 'pendente',
          createdAt: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
          pixCopiaCola: '54892311000190'
        };
        supabaseService.upsertCommissionCharge(newCharge).catch(() => {});
        return [newCharge, ...prev];
      });
    }
  };

  const handleUpdateStatusByAdmin = (requestId: string, newStatus: RequestStatus) => {
    setRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === requestId) {
          return { ...req, status: newStatus };
        }
        return req;
      });
      const target = updated.find(r => r.id === requestId);
      if (target) supabaseService.upsertServiceRequest(target).catch(() => {});
      return updated;
    });

    if (newStatus === 'aprovado' || newStatus === 'concluido') {
      const targetReq = requests.find(r => r.id === requestId);
      if (targetReq && targetReq.quotedPrice && targetReq.assignedProfessional) {
        const prof = professionals.find(p => p.fullName === targetReq.assignedProfessional || p.id === targetReq.assignedProfessional);
        const commissionVal = targetReq.quotedPrice * 0.30;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);
        const chargeId = `COM-${targetReq.id.replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000)}`;

        setCommissionCharges(prev => {
          if (prev.some(c => c.requestId === targetReq.id)) return prev;
          const newCharge: CommissionCharge = {
            id: chargeId,
            requestId: targetReq.id,
            serviceTitle: targetReq.serviceTitle,
            professionalId: prof?.id || 'PRO-DIR',
            professionalName: targetReq.assignedProfessional,
            professionalCpfCnpj: prof?.cpfCnpj || '000.000.000-00',
            professionalPhone: prof?.phone || '(12) 99999-9999',
            clientName: targetReq.clientName,
            clientPhone: targetReq.phone || '(12) 99999-9999',
            clientAddress: targetReq.address || '',
            serviceValue: targetReq.quotedPrice || 0,
            commissionPercent: 30,
            commissionValue: commissionVal,
            status: 'pendente',
            createdAt: new Date().toISOString(),
            dueDate: dueDate.toISOString(),
            pixCopiaCola: '54892311000190'
          };
          supabaseService.upsertCommissionCharge(newCharge).catch(() => {});
          return [newCharge, ...prev];
        });
      }
    }
  };

  const handleUpdateChargeStatus = (chargeId: string, status: PaymentStatus, method?: PaymentMethod) => {
    setCommissionCharges(prev => {
      const updated = prev.map(c => {
        if (c.id === chargeId) {
          return {
            ...c,
            status,
            paymentMethod: method || c.paymentMethod,
            paidAt: status === 'pago' ? new Date().toISOString() : c.paidAt
          };
        }
        return c;
      });
      const target = updated.find(c => c.id === chargeId);
      if (target) supabaseService.upsertCommissionCharge(target).catch(() => {});
      return updated;
    });
  };

  const handleIssueBoletoAndNfse = (chargeId: string) => {
    setCommissionCharges(prev => {
      const updated = prev.map(c => {
        if (c.id === chargeId) {
          const fine = c.commissionValue * 0.02;
          const interest = c.commissionValue * 0.01;
          const total = c.commissionValue + fine + interest;
          return {
            ...c,
            status: 'boleto_emitido' as PaymentStatus,
            lateFeePercent: 2.0,
            monthlyInterestPercent: 1.0,
            totalChargedValue: total,
            boletoLinhaDigitavel: `07790.00116 12849.025008 00000.${c.id.replace(/\D/g, '').padEnd(6, '0')} 8 9580000000${Math.round(total * 100)}`,
            boletoCodigoBarras: `077989580000000${Math.round(total * 100)}000111284902500000000${c.id.replace(/\D/g, '')}`,
            nfseNumero: `2026/${Math.floor(100000 + Math.random() * 900000)}`,
            nfseChaveAcesso: `3526085489231100019056001000000${Math.floor(100000 + Math.random() * 900000)}1098456123`,
            nfseEmissaoData: new Date().toISOString(),
            notes: 'Automação de Inadimplência: Boleto Registrado emitido com encargos e NFS-e gerada.'
          };
        }
        return c;
      });
      const target = updated.find(c => c.id === chargeId);
      if (target) supabaseService.upsertCommissionCharge(target).catch(() => {});
      return updated;
    });
  };

  const handleSaveGatewaySettings = (settings: PaymentGatewaySettings) => {
    setGatewaySettings(settings);
    supabaseService.saveGatewaySettings(settings).catch(() => {});
  };

  const handleOpenReviewModal = (req: ServiceRequest) => {
    setSelectedRequestForReview(req);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (requestId: string, stars: number, comment: string) => {
    setRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status: 'avaliado' as RequestStatus,
            rating: {
              stars,
              comment,
              createdAt: new Date().toISOString()
            }
          };
        }
        return req;
      });
      const target = updated.find(r => r.id === requestId);
      if (target) {
        supabaseService.upsertServiceRequest(target).catch(() => {});
        supabaseService.saveServiceReview({
          requestId: target.id,
          clientName: target.clientName,
          professionalName: target.assignedProfessional,
          stars,
          comment,
          createdAt: new Date().toISOString()
        }).catch(() => {});
      }
      return updated;
    });
  };

  const pendingQuotesCount = requests.filter(r => r.status === 'orcamento_recebido').length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Main Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        phoneFrameMode={phoneFrameMode}
        onTogglePhoneFrame={() => setPhoneFrameMode(!phoneFrameMode)}
        pendingQuotesCount={pendingQuotesCount}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        requests={requests}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* VIEW 1: CLIENT MOBILE / DESKTOP APP (CLEAN & DIRECT) */}
        {currentView === 'client' && (
          <PhoneContainer isPhoneFrame={phoneFrameMode}>
            <div className="space-y-6">
              
              {/* Clean Client Navigation Switcher */}
              <div className="flex bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-xl max-w-md mx-auto gap-1.5">
                <button
                  id="client-tab-request"
                  onClick={() => setClientTab('solicitar')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all ${
                    clientTab === 'solicitar'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>✨ Solicitar Serviço</span>
                </button>

                <button
                  id="client-tab-orders"
                  onClick={() => setClientTab('pedidos')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all relative ${
                    clientTab === 'pedidos'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>📦 Meus Pedidos</span>
                  {requests.length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      clientTab === 'pedidos' ? 'bg-slate-950 text-amber-400' : 'bg-amber-400 text-slate-950'
                    }`}>
                      {requests.length}
                    </span>
                  )}
                  {pendingQuotesCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-2 right-2" />
                  )}
                </button>
              </div>

              {/* TAB 1: SOLICITAÇÃO RÁPIDA E LIMPA */}
              {clientTab === 'solicitar' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Promo & Direct Search Hero */}
                  <BannerSection 
                    onRequestClick={(initialText, categoryId) => handleOpenRequestModal(null, initialText, categoryId)}
                    onSelectCategory={(catId) => handleOpenRequestModal(null, undefined, catId)}
                    services={SERVICES_LIST}
                  />

                  {/* Main Services Grid (Clean) */}
                  <ServicesGrid
                    services={SERVICES_LIST}
                    onSelectService={(serv) => handleOpenRequestModal(serv)}
                    onOpenGenericRequest={() => handleOpenRequestModal(null)}
                  />
                </div>
              )}

              {/* TAB 2: ACOMPANHAMENTO DOS MEUS PEDIDOS */}
              {clientTab === 'pedidos' && (
                <div className="animate-fade-in">
                  <OrderTracking
                    requests={requests}
                    onApproveQuote={handleApproveQuoteByClient}
                    onOpenReviewModal={handleOpenReviewModal}
                    onNewRequestClick={() => handleOpenRequestModal(null)}
                    onDeleteRequest={handleDeleteRequest}
                  />
                </div>
              )}

            </div>
          </PhoneContainer>
        )}

        {/* VIEW 2: PAINEL ADMINISTRATIVO */}
        {currentView === 'admin' && (
          <AdminDashboard
            requests={requests}
            metrics={metrics}
            professionals={professionals}
            users={users}
            charges={commissionCharges}
            gatewaySettings={gatewaySettings}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onSendQuote={handleSendQuoteByAdmin}
            onUpdateStatus={handleUpdateStatusByAdmin}
            onApproveProfessional={handleApproveProfessional}
            onDeleteProfessional={handleDeleteProfessional}
            onUpdateUser={handleUpdateUser}
            onAddUser={handleRegisterUser}
            onDeleteUser={handleDeleteUser}
            onDeleteRequest={handleDeleteRequest}
            onUpdateChargeStatus={handleUpdateChargeStatus}
            onIssueBoletoAndNfse={handleIssueBoletoAndNfse}
            onSaveGatewaySettings={handleSaveGatewaySettings}
          />
        )}

        {/* VIEW 3: CADASTRO E ÁREA DO PROFISSIONAL */}
        {currentView === 'professional' && (
          <ProfessionalRegistration
            services={SERVICES_LIST}
            professionals={professionals}
            requests={requests}
            onRegisterProfessional={handleRegisterProfessional}
            onSendQuote={handleSendQuoteByAdmin}
            onNavigateToApp={() => setCurrentView('client')}
          />
        )}

      </main>

      {/* SERVICE REQUEST MODAL (CLEAN & DIRECT) */}
      <ServiceRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        service={selectedServiceForModal}
        allServices={SERVICES_LIST}
        onSubmitRequest={handleCreateRequest}
        currentUser={currentUser}
        initialDescription={requestInitialDescription}
      />

      {/* AVALIAÇÃO DO SERVIÇO MODAL ("Como foi o serviço?") */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        request={selectedRequestForReview}
        onSubmitReview={handleSubmitReview}
      />

      {/* LOGIN & CADASTRO MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onLogin={handleLogin}
        onRegister={handleRegisterUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        initialMode={authModalInitialMode}
      />

      {/* SUPABASE CLOUD & MIGRATIONS MODAL */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onRefreshData={loadDataFromSupabase}
      />

      {/* Footer Branding with Official Logo */}
      <footer className="bg-[#001838] text-slate-400 py-8 text-center text-xs border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SMExpressLogo variant="badge" size="custom" customSize={54} />
            <div className="text-left">
              <div className="flex items-baseline gap-1">
                <span className="font-extrabold text-white text-base">SM</span>
                <span className="font-extrabold text-amber-400 text-base italic">EXPRESS</span>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Contacts in Footer */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-slate-400 text-[11px]">WhatsApp Oficial:</span>
            <a 
              href="https://wa.me/5512992555104?text=Ol%C3%A1,%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20com%20a%20SM%20Express!" 
              target="_blank" 
              rel="noreferrer" 
              className="text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <span>(12) 99255-5104</span>
            </a>
            <a 
              href="https://wa.me/5512991601322?text=Ol%C3%A1,%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20com%20a%20SM%20Express!" 
              target="_blank" 
              rel="noreferrer" 
              className="text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <span>(12) 99160-1322</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300 font-semibold text-xs">
            <button onClick={() => setCurrentView('client')} className="hover:text-amber-400 transition-colors">App Cliente</button>
            <button onClick={() => setCurrentView('admin')} className="hover:text-amber-400 transition-colors">Painel Admin</button>
            <button onClick={() => setCurrentView('professional')} className="hover:text-amber-400 transition-colors">Área do Profissional</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
