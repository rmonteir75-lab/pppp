import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
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
import { ServiceRequestModal } from './components/ServiceRequestModal';
import { OrderTracking } from './components/OrderTracking';
import { ReviewModal } from './components/ReviewModal';
import { SMExpressLogo } from './components/SMExpressLogo';
import { AdminDashboard } from './components/AdminDashboard';
import { PhoneContainer } from './components/PhoneContainer';
import { ProfessionalRegistration } from './components/ProfessionalRegistration';
import { AuthModal } from './components/AuthModal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { Toast, ToastType } from './components/Toast';
import { supabaseService } from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';
import { safeSetItem, safeRemoveItem } from './utils/storage';
import { notificationService, ADMIN_EMAIL, ADMIN_WHATSAPP_FORMATTED } from './services/notificationService';

export default function App() {
  // Navigation & Frame Mode
  const [currentView, setCurrentView] = useState<'client' | 'admin' | 'professional'>('client');
  const [phoneFrameMode, setPhoneFrameMode] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  // Visual Toast Feedback System
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  // Draft Request & Mandatory Registration state
  const [pendingRequestDraft, setPendingRequestDraft] = useState<Partial<ServiceRequest> | null>(null);
  const [forceRegisterInAuth, setForceRegisterInAuth] = useState(false);
  const [authRequiredNotice, setAuthRequiredNotice] = useState<string>('');

  // Production Readiness Purge: Clears any leftover test/mock clients, quotes, requests, and payments.
  // Preserves only the master Admin account (suportesmservicos@gmail.com) and the service catalog.
  const PRODUCTION_CLEAN_KEY = 'smexpress_clean_slate_production_v2026_ready';

  const runImmediateProductionReset = () => {
    if (typeof window !== 'undefined') {
      try {
        if (!localStorage.getItem(PRODUCTION_CLEAN_KEY)) {
          localStorage.setItem(PRODUCTION_CLEAN_KEY, 'true');
          localStorage.removeItem('smexpress_requests');
          localStorage.removeItem('smexpress_professionals');
          localStorage.removeItem('smexpress_commissions');
          localStorage.removeItem('smexpress_charges');
          localStorage.removeItem('smexpress_goal_revenue');
          localStorage.removeItem('smexpress_goal_services');
          localStorage.removeItem('smexpress_goal_profs');
          localStorage.removeItem('smexpress_clean_slate_v3');
          localStorage.setItem('smexpress_users', JSON.stringify(INITIAL_USERS));
          
          const rawCurrent = localStorage.getItem('smexpress_current_user');
          if (rawCurrent) {
            try {
              const parsed = JSON.parse(rawCurrent);
              if (parsed?.email !== 'suportesmservicos@gmail.com' && parsed?.email !== 'rmonteir75@gmail.com') {
                localStorage.removeItem('smexpress_current_user');
              }
            } catch {
              localStorage.removeItem('smexpress_current_user');
            }
          }
        }
      } catch (e) {
        console.error('Error during production reset:', e);
      }
    }
  };

  // Run immediately on script execution
  runImmediateProductionReset();

  // Users & Auth State (Clean State initialized only with Master Admin)
  const [users, setUsers] = useState<UserAccount[]>(() => {
    runImmediateProductionReset();
    const saved = localStorage.getItem('smexpress_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.map(u => {
            if (u.email === 'rmonteir75@gmail.com' || u.id === 'USR-ADM-001' || u.email === 'suportesmservicos@gmail.com') {
              return { ...u, email: 'suportesmservicos@gmail.com', password: '2026Smexpress*' };
            }
            return u;
          }).filter(u => 
            !['USR-CLI-001', 'USR-PRO-001', 'USR-ADM-999'].includes(u.id) &&
            u.email !== 'admin@smexpress.com' &&
            u.email !== 'joao.cliente@gmail.com' &&
            u.email !== 'marcos.piscineiro@smexpress.com' &&
            !u.email.toLowerCase().includes('teste') &&
            !u.name.toLowerCase().includes('teste')
          );
          const hasAdmin = cleaned.some((u: UserAccount) => u.email === 'suportesmservicos@gmail.com' || u.role === 'admin');
          return hasAdmin ? cleaned : [...INITIAL_USERS, ...cleaned];
        }
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    runImmediateProductionReset();
    const saved = localStorage.getItem('smexpress_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.id &&
          !['USR-CLI-001', 'USR-PRO-001'].includes(parsed.id) &&
          parsed.email !== 'admin@smexpress.com' &&
          parsed.email !== 'joao.cliente@gmail.com' &&
          parsed.email !== 'marcos.piscineiro@smexpress.com'
        ) {
          if (parsed.email === 'rmonteir75@gmail.com' || parsed.id === 'USR-ADM-001' || parsed.email === 'suportesmservicos@gmail.com') {
            return { ...parsed, email: 'suportesmservicos@gmail.com', password: '2026Smexpress*' };
          }
          return parsed;
        }
        return null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register' | 'profile' | 'forgot_password' | 'admin_access'>('login');

  // App Data State (Clean Production Zero State)
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    runImmediateProductionReset();
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
    runImmediateProductionReset();
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
    runImmediateProductionReset();
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

  const [services, setServices] = useState<ServiceDefinition[]>(() => {
    const saved = localStorage.getItem('smexpress_services');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((s: ServiceDefinition) => s.id !== 'manutencao_residencial');
        }
      } catch {}
    }
    return SERVICES_LIST;
  });

  // Active Modals State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceDefinition | null>(null);
  const [requestInitialDescription, setRequestInitialDescription] = useState<string>('');
  const [clientTab, setClientTab] = useState<'solicitar' | 'pedidos'>('solicitar');

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<ServiceRequest | null>(null);

  // Automated clean slate on boot
  useEffect(() => {
    const purgeKey = PRODUCTION_CLEAN_KEY;
    if (!localStorage.getItem(purgeKey)) {
      safeSetItem(purgeKey, 'true');
      safeRemoveItem('smexpress_requests');
      safeRemoveItem('smexpress_professionals');
      safeRemoveItem('smexpress_commissions');
      safeRemoveItem('smexpress_charges');
      safeRemoveItem('smexpress_goal_revenue');
      safeRemoveItem('smexpress_goal_services');
      safeRemoveItem('smexpress_goal_profs');
      safeSetItem('smexpress_users', INITIAL_USERS);
      setRequests([]);
      setProfessionals([]);
      setCommissionCharges([]);
      setUsers(INITIAL_USERS);
      if (currentUser && currentUser.email !== 'suportesmservicos@gmail.com' && currentUser.email !== 'rmonteir75@gmail.com') {
        setCurrentUser(null);
        safeRemoveItem('smexpress_current_user');
      }
    }
  }, []);

  // Save users and current user to localStorage
  useEffect(() => {
    safeSetItem('smexpress_users', users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      safeSetItem('smexpress_current_user', currentUser);
    } else {
      safeRemoveItem('smexpress_current_user');
    }
  }, [currentUser]);

  // Save requests, professionals, commissions, gatewaySettings and services to localStorage
  useEffect(() => {
    safeSetItem('smexpress_services', services);
  }, [services]);

  useEffect(() => {
    safeSetItem('smexpress_requests', requests);
  }, [requests]);

  useEffect(() => {
    safeSetItem('smexpress_professionals', professionals);
  }, [professionals]);

  useEffect(() => {
    safeSetItem('smexpress_commissions', commissionCharges);
  }, [commissionCharges]);

  useEffect(() => {
    safeSetItem('smexpress_gateway_settings', gatewaySettings);
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

  // View navigation with proper access control
  const handleViewChange = (requestedView: 'client' | 'admin' | 'professional') => {
    if (requestedView === 'admin') {
      if (currentUser?.role === 'admin') {
        setCurrentView('admin');
      } else {
        showToast('Acesso restrito à administração do sistema.', 'error');
        setAuthModalInitialMode('admin_access');
        setIsAuthModalOpen(true);
      }
      return;
    }
    setCurrentView(requestedView);
  };

  // Guard against unauthorized admin access if user logs out or switches
  useEffect(() => {
    if (currentView === 'admin' && currentUser?.role !== 'admin') {
      setCurrentView('client');
    }
  }, [currentUser, currentView]);

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    showToast(`Bem-vindo de volta, ${user.name}!`, 'success');
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
    setCurrentUser(newUser);
    supabaseService.upsertUser(newUser).catch(() => {});
    showToast(`Cadastro realizado com sucesso! Bem-vindo, ${newUser.name}.`, 'success');

    // If there was a pending service request draft that forced registration, complete and submit it!
    if (pendingRequestDraft) {
      const fullAddress = pendingRequestDraft.street || `${newUser.street || ''}, ${newUser.number || 'S/N'} - ${newUser.neighborhood || ''}, ${newUser.city || 'Taubaté'}`;
      const addressParts = fullAddress.split(',');
      const mainStreet = addressParts[0]?.trim() || fullAddress;
      const rest = addressParts.slice(1).join(',').trim() || `${newUser.neighborhood || 'Centro'}, ${newUser.city || 'Taubaté'}`;

      const fullMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress + ', Brasil')}`;

      const completedReq: ServiceRequest = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        serviceId: (pendingRequestDraft.serviceId as any) || 'outros_servicos',
        serviceTitle: pendingRequestDraft.serviceTitle || 'Serviço Geral',
        clientName: newUser.name,
        clientPhone: newUser.phone,
        clientEmail: newUser.email,
        details: pendingRequestDraft.details || { 'Descrição do Pedido': 'Solicitação concluída após cadastro' },
        frequency: 'Avulso',
        desiredDate: pendingRequestDraft.desiredDate || new Date().toISOString().split('T')[0],
        street: mainStreet,
        number: newUser.number || 'S/N',
        neighborhood: rest,
        city: newUser.city || 'Taubaté',
        state: newUser.state || 'SP',
        photoUrl: pendingRequestDraft.photos?.[0] || undefined,
        photos: pendingRequestDraft.photos || [],
        googleMapsUrl: fullMapsUrl,
        status: 'pendente_orcamento',
        createdAt: new Date().toISOString()
      };

      setRequests(prev => [completedReq, ...prev]);
      setClientTab('pedidos');
      supabaseService.upsertServiceRequest(completedReq).catch(() => {});
      setPendingRequestDraft(null);
      showToast(`Pedido de orçamento ${completedReq.id} enviado com sucesso!`, 'success');
    }

    setForceRegisterInAuth(false);
    setAuthRequiredNotice('');
  };

  const handleRequireRegisterFromRequest = (draft: Partial<ServiceRequest>) => {
    setPendingRequestDraft(draft);
    setForceRegisterInAuth(true);
    setAuthRequiredNotice('Preencha seu cadastro para concluir e enviar o seu pedido de orçamento');
    setAuthModalInitialMode('register');
    setIsAuthModalOpen(true);
    showToast('Cadastro obrigatório para finalizar seu pedido', 'info');
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    supabaseService.upsertUser(updatedUser).catch(() => {});
    showToast('Dados cadastrais atualizados com sucesso!', 'success');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(null);
    }
    supabaseService.deleteUser(userId).catch(() => {});
    showToast('Usuário excluído com sucesso.', 'info');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('client');
    setClientTab('solicitar');
    showToast('Você saiu da sua conta.', 'info');
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'profile' | 'forgot_password' | 'admin_access' = 'login') => {
    setForceRegisterInAuth(false);
    setAuthRequiredNotice('');
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Handlers
  const handlePurgeAllData = () => {
    setUsers(INITIAL_USERS);
    setRequests([]);
    setProfessionals([]);
    setCommissionCharges([]);
    safeRemoveItem('smexpress_requests');
    safeRemoveItem('smexpress_professionals');
    safeRemoveItem('smexpress_commissions');
    safeRemoveItem('smexpress_charges');
    safeRemoveItem('smexpress_goal_revenue');
    safeRemoveItem('smexpress_goal_services');
    safeRemoveItem('smexpress_goal_profs');
    safeSetItem('smexpress_users', INITIAL_USERS);
    if (currentUser && currentUser.email !== 'suportesmservicos@gmail.com' && currentUser.email !== 'rmonteir75@gmail.com') {
      setCurrentUser(null);
      safeRemoveItem('smexpress_current_user');
    }
    showToast('Base de dados zerada com sucesso! Cadastros de clientes, orçamentos e pagamentos de teste foram removidos.', 'success');
  };

  const handleDeleteService = (serviceId: string) => {
    const target = services.find(s => s.id === serviceId);
    setServices(prev => prev.filter(s => s.id !== serviceId));
    showToast(`Serviço "${target?.title || serviceId}" excluído com sucesso.`, 'info');
  };

  const handleResetServices = () => {
    setServices(SERVICES_LIST);
    showToast('Catálogo de serviços restaurado com sucesso.', 'success');
  };

  const handleOpenRequestModal = (service: ServiceDefinition | null, initialText?: string, categoryId?: string) => {
    if (categoryId) {
      const found = services.find(s => s.id === categoryId);
      setSelectedServiceForModal(found || services[0]);
    } else {
      setSelectedServiceForModal(service || services[0]);
    }
    setRequestInitialDescription(initialText || '');
    setIsRequestModalOpen(true);
  };

  const handleCreateRequest = (newRequest: ServiceRequest) => {
    setRequests(prev => [newRequest, ...prev]);
    setClientTab('pedidos'); // Automatically switch to orders tracking
    supabaseService.upsertServiceRequest(newRequest).catch(() => {});
    // ServiceRequestModal already triggers notificationService.notifyNewRequest to present live links
    showToast(`Solicitação #${newRequest.id} recebida! Notificações enviadas ao WhatsApp e e-mail (${ADMIN_EMAIL}).`, 'success');
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
    notificationService.notifyNewProfessional(createdProf);
    showToast('Cadastro recebido! O administrador foi notificado via WhatsApp e e-mail para aprovação.', 'success');
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
    let targetQuoteReq: ServiceRequest | undefined;
    setRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === requestId) {
          const updatedReq = {
            ...req,
            quotedPrice: price,
            estimatedHours: hours,
            assignedProfessional: prof,
            adminNotes: notes,
            scheduledDate: scheduledDate || req.scheduledDate || req.desiredDate,
            status: 'orcamento_recebido' as RequestStatus
          };
          targetQuoteReq = updatedReq;
          return updatedReq;
        }
        return req;
      });
      const target = updated.find(r => r.id === requestId);
      if (target) supabaseService.upsertServiceRequest(target).catch(() => {});
      return updated;
    });

    if (targetQuoteReq) {
      notificationService.notifyQuoteSent(targetQuoteReq, price, hours, prof, notes, scheduledDate);
      showToast(`Orçamento de R$ ${price.toFixed(2).replace('.', ',')} enviado! Cliente e administrador notificados via WhatsApp e e-mail.`, 'success');
    }
  };

  const handleApproveQuoteByClient = (requestId: string) => {
    let approvedReq: ServiceRequest | undefined;
    setRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === requestId) {
          const u = {
            ...req,
            status: 'aprovado' as RequestStatus,
            scheduledDate: req.desiredDate + ' 09:00'
          };
          approvedReq = u;
          return u;
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
      const formattedAddress = [targetReq.street, targetReq.number, targetReq.neighborhood, targetReq.city, targetReq.state].filter(Boolean).join(', ');

      setCommissionCharges(prev => {
        if (prev.some(c => c.requestId === targetReq.id)) return prev;
        const newCharge: CommissionCharge = {
          id: chargeId,
          requestId: targetReq.id,
          serviceTitle: targetReq.serviceTitle,
          professionalId: prof?.id || 'PRO-DIR',
          professionalName: targetReq.assignedProfessional,
          professionalCpfCnpj: prof?.cpfCnpj || '',
          professionalPhone: prof?.phone || '(12) 99255-5104',
          clientName: targetReq.clientName,
          clientPhone: targetReq.clientPhone || '',
          clientAddress: formattedAddress || '',
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

    if (approvedReq) {
      const assignedProfName = (approvedReq as ServiceRequest).assignedProfessional;
      const prof = assignedProfName 
        ? professionals.find(p => p.fullName === assignedProfName || p.id === assignedProfName) 
        : undefined;
      notificationService.notifyQuoteApproved(approvedReq, prof?.phone);
      showToast(`Orçamento aprovado! Administrador (${ADMIN_WHATSAPP_FORMATTED}) e prestador notificados via WhatsApp.`, 'success');
    }
  };

  const handleUpdateStatusByAdmin = (requestId: string, newStatus: RequestStatus) => {
    let updatedTarget: ServiceRequest | undefined;
    setRequests(prev => {
      const updated = prev.map(req => {
        if (req.id === requestId) {
          const u = { ...req, status: newStatus };
          updatedTarget = u;
          return u;
        }
        return req;
      });
      const target = updated.find(r => r.id === requestId);
      if (target) supabaseService.upsertServiceRequest(target).catch(() => {});
      return updated;
    });

    if (updatedTarget) {
      notificationService.notifyStatusChanged(updatedTarget, newStatus);
      showToast(`Status alterado para "${newStatus}". Notificação WhatsApp/E-mail gerada.`, 'info');
    }

    if (newStatus === 'aprovado' || newStatus === 'concluido') {
      const targetReq = requests.find(r => r.id === requestId);
      if (targetReq && targetReq.quotedPrice && targetReq.assignedProfessional) {
        const prof = professionals.find(p => p.fullName === targetReq.assignedProfessional || p.id === targetReq.assignedProfessional);
        const commissionVal = targetReq.quotedPrice * 0.30;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);
        const chargeId = `COM-${targetReq.id.replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000)}`;
        const formattedAddress = [targetReq.street, targetReq.number, targetReq.neighborhood, targetReq.city, targetReq.state].filter(Boolean).join(', ');

        setCommissionCharges(prev => {
          if (prev.some(c => c.requestId === targetReq.id)) return prev;
          const newCharge: CommissionCharge = {
            id: chargeId,
            requestId: targetReq.id,
            serviceTitle: targetReq.serviceTitle,
            professionalId: prof?.id || 'PRO-DIR',
            professionalName: targetReq.assignedProfessional,
            professionalCpfCnpj: prof?.cpfCnpj || '',
            professionalPhone: prof?.phone || '(12) 99255-5104',
            clientName: targetReq.clientName,
            clientPhone: targetReq.clientPhone || '',
            clientAddress: formattedAddress || '',
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
        notificationService.notifyNewReview(target, stars, comment);
        showToast('Avaliação registrada com sucesso! Notificação enviada ao administrador.', 'success');
      }
      return updated;
    });
  };

  // Orders calculation: STRICTLY for the connected/logged-in user account!
  const userOrdersCount = React.useMemo(() => {
    if (!currentUser) return 0;
    const cleanUserPhone = currentUser.phone?.replace(/\D/g, '') || '';
    const cleanUserEmail = currentUser.email?.toLowerCase().trim() || '';
    const cleanUserName = currentUser.name?.toLowerCase().trim() || '';

    return requests.filter(r => {
      // 1. Explicit userId match
      if (r.userId && currentUser.id && r.userId === currentUser.id) return true;
      // 2. Email match
      const rEmail = r.clientEmail?.toLowerCase().trim() || '';
      if (cleanUserEmail && rEmail && cleanUserEmail === rEmail) return true;
      // 3. Phone match
      const rPhone = r.clientPhone?.replace(/\D/g, '') || '';
      if (cleanUserPhone.length >= 8 && rPhone.length >= 8) {
        if (cleanUserPhone === rPhone || cleanUserPhone.endsWith(rPhone) || rPhone.endsWith(cleanUserPhone)) {
          return true;
        }
      }
      // 4. Exact full name match
      const rName = r.clientName?.toLowerCase().trim() || '';
      if (cleanUserName && rName && cleanUserName.length >= 4 && cleanUserName !== 'cliente' && cleanUserName === rName) {
        return true;
      }
      return false;
    }).length;
  }, [currentUser, requests]);

  // Pending quotes: STRICTLY for the connected/logged-in user account!
  const pendingQuotesCount = React.useMemo(() => {
    if (!currentUser) return 0;
    const cleanUserPhone = currentUser.phone?.replace(/\D/g, '') || '';
    const cleanUserEmail = currentUser.email?.toLowerCase().trim() || '';
    const cleanUserName = currentUser.name?.toLowerCase().trim() || '';

    return requests.filter(r => {
      if (r.status !== 'orcamento_recebido') return false;
      // 1. Explicit userId match
      if (r.userId && currentUser.id && r.userId === currentUser.id) return true;
      // 2. Email match
      const rEmail = r.clientEmail?.toLowerCase().trim() || '';
      if (cleanUserEmail && rEmail && cleanUserEmail === rEmail) return true;
      // 3. Phone match
      const rPhone = r.clientPhone?.replace(/\D/g, '') || '';
      if (cleanUserPhone.length >= 8 && rPhone.length >= 8) {
        if (cleanUserPhone === rPhone || cleanUserPhone.endsWith(rPhone) || rPhone.endsWith(cleanUserPhone)) {
          return true;
        }
      }
      // 4. Exact full name match
      const rName = r.clientName?.toLowerCase().trim() || '';
      if (cleanUserName && rName && cleanUserName.length >= 4 && cleanUserName !== 'cliente' && cleanUserName === rName) {
        return true;
      }
      return false;
    }).length;
  }, [currentUser, requests]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Main Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
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
                  onClick={() => {
                    setClientTab('pedidos');
                    if (!currentUser) {
                      showToast('Nenhum pedido disponível sem conexão. Faça login ou crie seu cadastro para ver seus pedidos.', 'info');
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black transition-all relative ${
                    clientTab === 'pedidos'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>📦 Meus Pedidos</span>
                  {userOrdersCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      clientTab === 'pedidos' ? 'bg-slate-950 text-amber-400' : 'bg-amber-400 text-slate-950'
                    }`}>
                      {userOrdersCount}
                    </span>
                  )}
                  {currentUser && pendingQuotesCount > 0 && (
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
                    services={services}
                  />
                </div>
              )}

              {/* TAB 2: ACOMPANHAMENTO DOS MEUS PEDIDOS */}
              {clientTab === 'pedidos' && (
                <div className="animate-fade-in">
                  <OrderTracking
                    requests={requests}
                    currentUser={currentUser}
                    onOpenAuth={handleOpenAuth}
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
            services={services}
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
            onDeleteService={handleDeleteService}
            onResetServices={handleResetServices}
            onPurgeAllData={handlePurgeAllData}
          />
        )}

        {/* VIEW 3: CADASTRO E ÁREA DO PROFISSIONAL */}
        {currentView === 'professional' && (
          <ProfessionalRegistration
            services={services}
            professionals={professionals}
            requests={requests}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
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
        allServices={services}
        onSubmitRequest={handleCreateRequest}
        currentUser={currentUser}
        initialDescription={requestInitialDescription}
        onRequireRegister={handleRequireRegisterFromRequest}
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
        onClose={() => {
          setIsAuthModalOpen(false);
          setForceRegisterInAuth(false);
          setAuthRequiredNotice('');
        }}
        users={users}
        currentUser={currentUser}
        onLogin={handleLogin}
        onRegister={handleRegisterUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        initialMode={authModalInitialMode}
        forceRegisterMode={forceRegisterInAuth}
        requiredNotice={authRequiredNotice}
        prefilledRegistration={pendingRequestDraft ? {
          name: pendingRequestDraft.clientName,
          phone: pendingRequestDraft.clientPhone,
          street: pendingRequestDraft.street,
          neighborhood: pendingRequestDraft.neighborhood,
          city: pendingRequestDraft.city,
          role: 'cliente'
        } : undefined}
      />

      {/* SUPABASE CLOUD & MIGRATIONS MODAL */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onRefreshData={loadDataFromSupabase}
      />

      {/* Visual Feedback Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

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
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-slate-400 text-xs font-medium">WhatsApp / Atendimento:</span>
            <a 
              href="https://wa.me/5512991601322?text=Ol%C3%A1,%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20com%20a%20SM%20Express!" 
              target="_blank" 
              rel="noreferrer" 
              className="text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs shadow-sm"
              title="WhatsApp Oficial SM Express: (12) 99160-1322"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-emerald-400" />
              <span>(12) 99160-1322</span>
            </a>
            <a 
              href="https://wa.me/5512992555104?text=Ol%C3%A1,%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20com%20a%20SM%20Express!" 
              target="_blank" 
              rel="noreferrer" 
              className="text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs shadow-sm"
              title="WhatsApp Backup SM Express: (12) 99255-5104"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-emerald-400" />
              <span>(12) 99255-5104</span>
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
