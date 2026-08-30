import React, { useState, useEffect } from 'react';
import { 
  ServiceRequest, 
  AdminMetrics, 
  ProfessionalProfile, 
  UserAccount, 
  UserRole, 
  UserAccountStatus,
  CommissionCharge,
  PaymentGatewaySettings,
  PaymentMethod,
  PaymentStatus
} from '../types';
import { MONTHLY_CHART_DATA, SERVICE_DISTRIBUTION_DATA, INITIAL_COMMISSION_CHARGES, DEFAULT_PAYMENT_GATEWAY_SETTINGS } from '../data/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  User, 
  Send, 
  Star, 
  Phone, 
  MapPin, 
  Building2,
  FileText,
  Users,
  ShieldCheck,
  Check,
  X,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Download,
  AlertTriangle,
  Mail,
  Home,
  Briefcase,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Save,
  Camera,
  Upload,
  FileCheck,
  ArrowRight,
  Scale,
  FileCheck2,
  CreditCard,
  Ban
} from 'lucide-react';
import { DigitalContractModal } from './DigitalContractModal';
import { PaymentPlatformView } from './PaymentPlatformView';
import { SMExpressLogo } from './SMExpressLogo';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface AdminDashboardProps {
  requests: ServiceRequest[];
  metrics: AdminMetrics;
  professionals?: ProfessionalProfile[];
  users?: UserAccount[];
  charges?: CommissionCharge[];
  gatewaySettings?: PaymentGatewaySettings;
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register' | 'profile' | 'forgot_password' | 'admin_access') => void;
  onSendQuote: (requestId: string, price: number, hours: string, prof: string, notes: string) => void;
  onUpdateStatus: (requestId: string, status: ServiceRequest['status']) => void;
  onApproveProfessional?: (profId: string) => void;
  onDeleteProfessional?: (profId: string) => void;
  onUpdateUser?: (updatedUser: UserAccount) => void;
  onAddUser?: (newUser: UserAccount) => void;
  onDeleteUser?: (userId: string) => void;
  onDeleteRequest?: (requestId: string) => void;
  onUpdateChargeStatus?: (chargeId: string, status: PaymentStatus, method?: PaymentMethod) => void;
  onIssueBoletoAndNfse?: (chargeId: string) => void;
  onSaveGatewaySettings?: (settings: PaymentGatewaySettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  requests,
  metrics,
  professionals = [],
  users = [],
  charges: initialCharges,
  gatewaySettings: initialGatewaySettings,
  currentUser,
  onOpenAuth,
  onSendQuote,
  onUpdateStatus,
  onApproveProfessional,
  onDeleteProfessional,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
  onDeleteRequest,
  onUpdateChargeStatus,
  onIssueBoletoAndNfse,
  onSaveGatewaySettings
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'schedule' | 'reviews' | 'professionals' | 'users' | 'payments'>('overview');
  
  // Commission & Payment State
  const [commissionCharges, setCommissionCharges] = useState<CommissionCharge[]>(() => {
    return initialCharges || [];
  });

  const [currentGatewaySettings, setCurrentGatewaySettings] = useState<PaymentGatewaySettings>(() => {
    return initialGatewaySettings || DEFAULT_PAYMENT_GATEWAY_SETTINGS;
  });

  // Sync props when they change
  useEffect(() => {
    if (initialCharges) {
      setCommissionCharges(initialCharges);
    }
  }, [initialCharges]);

  useEffect(() => {
    if (initialGatewaySettings) {
      setCurrentGatewaySettings(initialGatewaySettings);
    }
  }, [initialGatewaySettings]);

  // Professional Management & Deletion State
  const [profSearchTerm, setProfSearchTerm] = useState('');
  const [profStatusFilter, setProfStatusFilter] = useState<'todos' | 'aprovado' | 'pendente_aprovacao'>('todos');
  const [profToDelete, setProfToDelete] = useState<ProfessionalProfile | null>(null);
  const [profSuccessMessage, setProfSuccessMessage] = useState('');
  
  // Quote form state for selected request
  const [selectedReqForQuote, setSelectedReqForQuote] = useState<ServiceRequest | null>(null);
  const [quotePrice, setQuotePrice] = useState<number>(0);
  const [quoteHours, setQuoteHours] = useState<string>('2h');
  const [quoteProf, setQuoteProf] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  // User Management State
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'todos' | UserRole>('todos');
  const [userStatusFilter, setUserStatusFilter] = useState<'todos' | UserAccountStatus>('todos');
  const [userCompletenessFilter, setUserCompletenessFilter] = useState<'todos' | 'completo' | 'incompleto'>('todos');

  // Modals for User Management
  const [selectedUserForView, setSelectedUserForView] = useState<UserAccount | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [userSuccessMessage, setUserSuccessMessage] = useState('');

  // Digital Contract Modal for Admin Inspection
  const [contractModalProf, setContractModalProf] = useState<ProfessionalProfile | null>(null);

  // Form State for Adding / Editing User
  const [formUserId, setFormUserId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('cliente');
  const [formStatus, setFormStatus] = useState<UserAccountStatus>('ativo');
  const [formCpf, setFormCpf] = useState('');
  const [formRg, setFormRg] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formCep, setFormCep] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formComplement, setFormComplement] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCity, setFormCity] = useState('Taubaté');
  const [formState, setFormState] = useState('SP');
  const [formNotes, setFormNotes] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhoto3x4, setFormPhoto3x4] = useState<string>('');
  const formPhotoInputRef = React.useRef<HTMLInputElement>(null);

  const handleFormPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormPhoto3x4(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenQuoteForm = (req: ServiceRequest) => {
    setSelectedReqForQuote(req);
    setQuotePrice(req.quotedPrice || 150);
    setQuoteHours(req.estimatedHours || '2h');
    setQuoteProf(req.assignedProfessional || (professionals.length > 0 ? professionals[0].fullName : 'Profissional SM'));
    setQuoteNotes(req.adminNotes || '');
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReqForQuote) {
      onSendQuote(selectedReqForQuote.id, quotePrice, quoteHours, quoteProf, quoteNotes);
      setSelectedReqForQuote(null);
    }
  };

  // Helper formatting
  const formatCPF = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const formatCEP = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 8);
    return numbers.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  };

  // Open New User Modal
  const handleOpenNewUser = () => {
    setFormUserId(`USR-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('cliente');
    setFormStatus('ativo');
    setFormCpf('');
    setFormRg('');
    setFormBirthDate('');
    setFormCep('12000-000');
    setFormStreet('');
    setFormNumber('');
    setFormComplement('');
    setFormNeighborhood('');
    setFormCity('Taubaté');
    setFormState('SP');
    setFormNotes('');
    setFormPassword('123456');
    setFormPhoto3x4('');
    setIsNewUserModalOpen(true);
  };

  // Open Edit User Modal
  const handleOpenEditUser = (u: UserAccount) => {
    setSelectedUserForEdit(u);
    setFormUserId(u.id);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPhone(u.phone || '');
    setFormRole(u.role);
    setFormStatus(u.status || 'ativo');
    setFormCpf(u.cpfCnpj || '');
    setFormRg(u.rg || '');
    setFormBirthDate(u.birthDate || '');
    setFormCep(u.cep || '');
    setFormStreet(u.street || '');
    setFormNumber(u.number || '');
    setFormComplement(u.complement || '');
    setFormNeighborhood(u.neighborhood || '');
    setFormCity(u.city || 'Taubaté');
    setFormState(u.state || 'SP');
    setFormNotes(u.notes || '');
    setFormPassword(u.password || '');
    setFormPhoto3x4(u.photo3x4Url || u.avatarUrl || '');
  };

  // Save New User
  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    const isComplete = Boolean(formCpf && formPhone && formStreet && formCity);
    
    const fallbackPhoto = formRole === 'profissional'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=400&q=80'
      : formRole === 'admin'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=400&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=400&q=80';

    const newUser: UserAccount = {
      id: formUserId,
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      status: formStatus,
      cpfCnpj: formCpf,
      rg: formRg,
      birthDate: formBirthDate,
      cep: formCep,
      street: formStreet,
      number: formNumber,
      complement: formComplement,
      neighborhood: formNeighborhood,
      city: formCity,
      state: formState,
      notes: formNotes,
      password: formPassword,
      isCompleteRegistration: isComplete,
      totalRequests: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      avatarUrl: formPhoto3x4 || fallbackPhoto,
      photo3x4Url: formPhoto3x4 || fallbackPhoto
    };

    if (onAddUser) {
      onAddUser(newUser);
    }
    setIsNewUserModalOpen(false);
    setUserSuccessMessage(`Usuário ${formName} cadastrado com ID de Acesso emitido!`);
    setTimeout(() => setUserSuccessMessage(''), 4000);
  };

  // Save Edited User
  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    const isComplete = Boolean(formCpf && formPhone && formStreet && formCity);

    const updated: UserAccount = {
      ...selectedUserForEdit,
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      status: formStatus,
      cpfCnpj: formCpf,
      rg: formRg,
      birthDate: formBirthDate,
      cep: formCep,
      street: formStreet,
      number: formNumber,
      complement: formComplement,
      neighborhood: formNeighborhood,
      city: formCity,
      state: formState,
      notes: formNotes,
      password: formPassword,
      isCompleteRegistration: isComplete,
      avatarUrl: formPhoto3x4 || selectedUserForEdit.avatarUrl,
      photo3x4Url: formPhoto3x4 || selectedUserForEdit.photo3x4Url
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setSelectedUserForEdit(null);
    setUserSuccessMessage(`Cadastro de ${formName} atualizado com sucesso!`);
    setTimeout(() => setUserSuccessMessage(''), 4000);
  };

  // Toggle user status (ativo / bloqueado)
  const handleToggleStatus = (u: UserAccount) => {
    const newStatus: UserAccountStatus = u.status === 'ativo' ? 'bloqueado' : 'ativo';
    const updated = { ...u, status: newStatus };
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setUserSuccessMessage(`Status do usuário alterado para ${newStatus === 'ativo' ? 'Ativo' : 'Bloqueado'}.`);
    setTimeout(() => setUserSuccessMessage(''), 3000);
  };

  // Confirm delete user
  const handleConfirmDelete = () => {
    if (userToDelete && onDeleteUser) {
      onDeleteUser(userToDelete.id);
      setUserSuccessMessage(`Usuário ${userToDelete.name} removido com sucesso.`);
      setUserToDelete(null);
      setTimeout(() => setUserSuccessMessage(''), 3000);
    }
  };

  // Confirm delete professional
  const handleConfirmDeleteProf = () => {
    if (profToDelete) {
      if (onDeleteProfessional) {
        onDeleteProfessional(profToDelete.id);
      }
      setProfSuccessMessage(`Profissional ${profToDelete.fullName} (CPF: ${profToDelete.cpfCnpj}) removido com sucesso.`);
      setProfToDelete(null);
      setTimeout(() => setProfSuccessMessage(''), 4000);
    }
  };

  // Charge status update handler
  const handleUpdateChargeStatus = (chargeId: string, status: PaymentStatus, method?: PaymentMethod) => {
    setCommissionCharges(prev => prev.map(c => {
      if (c.id === chargeId) {
        return {
          ...c,
          status,
          paymentMethod: method || c.paymentMethod,
          paidAt: status === 'pago' ? new Date().toISOString() : c.paidAt
        };
      }
      return c;
    }));

    if (onUpdateChargeStatus) {
      onUpdateChargeStatus(chargeId, status, method);
    }
  };

  // Issue Boleto & NFS-e handler for automated debt collection
  const handleIssueBoletoAndNfse = (chargeId: string) => {
    const target = commissionCharges.find(c => c.id === chargeId);
    if (!target) return;

    const fine = target.commissionValue * 0.02; // 2% multa
    const interest = target.commissionValue * 0.01; // 1% juros
    const total = target.commissionValue + fine + interest;

    const updated = commissionCharges.map(c => {
      if (c.id === chargeId) {
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
          notes: 'Automação de Inadimplência executada: emissão de Boleto Bancário Registrado com encargos e NFS-e de intermediação.'
        };
      }
      return c;
    });

    setCommissionCharges(updated);

    if (onIssueBoletoAndNfse) {
      onIssueBoletoAndNfse(chargeId);
    }
  };

  // Save Gateway Settings handler
  const handleSaveGatewaySettings = (settings: PaymentGatewaySettings) => {
    setCurrentGatewaySettings(settings);
    if (onSaveGatewaySettings) {
      onSaveGatewaySettings(settings);
    }
  };

  // Filter professionals
  const filteredProfessionals = professionals.filter(p => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(profSearchTerm.toLowerCase()) ||
      p.cpfCnpj.includes(profSearchTerm) ||
      p.phone.includes(profSearchTerm) ||
      (p.email && p.email.toLowerCase().includes(profSearchTerm.toLowerCase())) ||
      (p.city && p.city.toLowerCase().includes(profSearchTerm.toLowerCase())) ||
      (p.categories && p.categories.some(cat => cat.toLowerCase().includes(profSearchTerm.toLowerCase())));

    const matchesStatus = profStatusFilter === 'todos' || p.status === profStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Export users to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Papel', 'Status', 'CPF/CNPJ', 'Cidade', 'Estado', 'Cadastro Completo', 'Data Cadastro'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.phone || ''}"`,
      u.role,
      u.status,
      `"${u.cpfCnpj || ''}"`,
      `"${u.city || ''}"`,
      `"${u.state || ''}"`,
      u.isCompleteRegistration ? 'Sim' : 'Não',
      new Date(u.createdAt).toLocaleDateString('pt-BR')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sm_express_usuarios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearchTerm)) ||
      (u.cpfCnpj && u.cpfCnpj.includes(userSearchTerm)) ||
      (u.city && u.city.toLowerCase().includes(userSearchTerm.toLowerCase()));

    const matchesRole = userRoleFilter === 'todos' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'todos' || u.status === userStatusFilter;
    const matchesCompleteness = 
      userCompletenessFilter === 'todos' ||
      (userCompletenessFilter === 'completo' && u.isCompleteRegistration) ||
      (userCompletenessFilter === 'incompleto' && !u.isCompleteRegistration);

    return matchesSearch && matchesRole && matchesStatus && matchesCompleteness;
  });

  const pendingRequests = requests.filter(r => r.status === 'pendente_orcamento');
  const scheduledRequests = requests.filter(r => ['aprovado', 'em_execucao', 'concluido'].includes(r.status));
  const ratedRequests = requests.filter(r => r.rating !== undefined);

  // User metrics
  const totalUsersCount = users.length;
  const clientsCount = users.filter(u => u.role === 'cliente').length;
  const proUsersCount = users.filter(u => u.role === 'profissional').length;
  const completeUsersCount = users.filter(u => u.isCompleteRegistration).length;

  return (
    <div className="space-y-6">
      
      {/* Admin Panel Banner Header */}
      <div className="bg-[#001838] text-white p-2.5 sm:p-4 rounded-2xl shadow-xl border border-amber-500/20">
        {/* Tab Navigation (Horizontally scrollable on mobile, fluid on desktop) */}
        <div className="flex items-center overflow-x-auto no-scrollbar bg-slate-900/90 p-1 sm:p-1.5 rounded-xl border border-slate-700 text-xs font-bold gap-1 w-full sm:w-auto flex-nowrap sm:flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap touch-target flex items-center justify-center ${
              activeTab === 'overview' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Resumo & Métricas
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap touch-target justify-center ${
              activeTab === 'users' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Gestão de Pessoas</span>
            <span className="bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap touch-target justify-center ${
              activeTab === 'requests' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Orçamentos</span>
            {pendingRequests.length > 0 && (
              <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap touch-target flex items-center justify-center ${
              activeTab === 'schedule' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Agendamentos
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-2 rounded-lg transition-all whitespace-nowrap touch-target flex items-center justify-center ${
              activeTab === 'reviews' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Avaliações
          </button>

          <button
            onClick={() => setActiveTab('professionals')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap touch-target justify-center ${
              activeTab === 'professionals' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Credenciamento</span>
            {professionals.filter(p => p.status === 'pendente_aprovacao').length > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {professionals.filter(p => p.status === 'pendente_aprovacao').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap touch-target justify-center ${
              activeTab === 'payments' ? 'bg-amber-400 text-slate-950 font-black shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Plataforma (30%)</span>
            {commissionCharges.filter(c => ['pendente', 'atrasado', 'boleto_emitido'].includes(c.status)).length > 0 && (
              <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-[10px]">
                {commissionCharges.filter(c => ['pendente', 'atrasado', 'boleto_emitido'].includes(c.status)).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Admin Master Authentication Status Banner */}
      {currentUser && currentUser.role === 'admin' ? (
        <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-slate-900 border border-amber-400/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">Sessão Autenticada de Administrador</span>
                <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                  MASTER ATIVO
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Logado como <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.email}) • Privilégios completos de gestão.
              </p>
            </div>
          </div>
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('profile')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl border border-amber-400/30 transition-colors self-end sm:self-auto"
            >
              Configurar Perfil ADM
            </button>
          )}
        </div>
      ) : (
        <div className="p-3 sm:p-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border border-amber-400/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-300">Modo de Acesso Rápido / Visualização</span>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-[10px] font-bold">
                  CONVIDADO
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Para autenticar e salvar orçamentos com a conta oficial do administrador master (rmonteir75@gmail.com):
              </p>
            </div>
          </div>
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('admin_access')}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Acessar como ADM</span>
            </button>
          )}
        </div>
      )}

      {userSuccessMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{userSuccessMessage}</span>
          </div>
          <button onClick={() => setUserSuccessMessage('')} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: GESTÃO DE PESSOAS CADASTRADAS (NOVA ÁREA COMPLETA DO ADM) */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* User Metrics Summary (Totens Interativos) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Totem 1: Pessoas Cadastradas */}
            <div 
              onClick={() => {
                setUserRoleFilter('todos');
                setUserStatusFilter('todos');
                setUserCompletenessFilter('todos');
                setUserSearchTerm('');
              }}
              role="button"
              tabIndex={0}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
              title="Clique para ver todos os usuários cadastrados"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                  Pessoas Cadastradas
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#001838] mt-1">
                  {totalUsersCount}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                  <TrendingUp className="w-3 h-3" /> Base de Usuários Ativa
                </span>
              </div>
              <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Totem 2: Clientes Ativos */}
            <div 
              onClick={() => {
                setUserRoleFilter('cliente');
                setUserStatusFilter('ativo');
              }}
              role="button"
              tabIndex={0}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
              title="Clique para filtrar apenas clientes ativos"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-amber-600 transition-colors">
                  Clientes Ativos
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#001838] mt-1">
                  {clientsCount}
                </div>
                <span className="text-[10px] text-amber-600 font-bold mt-1 block">
                  {totalUsersCount > 0 ? Math.round((clientsCount / totalUsersCount) * 100) : 0}% da base total (filtrar)
                </span>
              </div>
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <User className="w-6 h-6" />
              </div>
            </div>

            {/* Totem 3: Profissionais */}
            <div 
              onClick={() => {
                setActiveTab('professionals');
              }}
              role="button"
              tabIndex={0}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
              title="Clique para ir para a aba de Credenciamento de Profissionais"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-emerald-600 transition-colors">
                  Profissionais
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#001838] mt-1">
                  {proUsersCount}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                  Ver Credenciamento →
                </span>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            {/* Totem 4: Cadastros Completos */}
            <div 
              onClick={() => {
                setUserCompletenessFilter('completo');
              }}
              role="button"
              tabIndex={0}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
              title="Clique para filtrar apenas cadastros 100% completos"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-purple-600 transition-colors">
                  Cadastros Completos
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                  {completeUsersCount} <span className="text-sm font-bold text-slate-400">/ {totalUsersCount}</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> CPF + Endereço (filtrar)
                </span>
              </div>
              <div className="p-3 bg-purple-100 text-purple-800 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Action Bar: Search, Filters & Add User Button */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Pesquisar por Nome, CPF, E-mail, Telefone ou Cidade..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5"
                  title="Exportar dados em formato CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exportar</span> CSV
                </button>

                <button
                  onClick={handleOpenNewUser}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Pessoa</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filtros:
              </span>

              {/* Role filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="todos">Todos os Papéis</option>
                <option value="cliente">Apenas Clientes</option>
                <option value="profissional">Apenas Profissionais</option>
                <option value="admin">Apenas Administradores</option>
              </select>

              {/* Status filter */}
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Status: Ativo</option>
                <option value="pendente">Status: Pendente</option>
                <option value="bloqueado">Status: Bloqueado</option>
              </select>

              {/* Completeness filter */}
              <select
                value={userCompletenessFilter}
                onChange={(e) => setUserCompletenessFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="todos">Todos os Cadastros</option>
                <option value="completo">Cadastro 100% Completo</option>
                <option value="incompleto">Cadastro Parcial</option>
              </select>

              {(userSearchTerm || userRoleFilter !== 'todos' || userStatusFilter !== 'todos' || userCompletenessFilter !== 'todos') && (
                <button
                  onClick={() => {
                    setUserSearchTerm('');
                    setUserRoleFilter('todos');
                    setUserStatusFilter('todos');
                    setUserCompletenessFilter('todos');
                  }}
                  className="text-amber-600 hover:text-amber-700 font-bold text-xs underline ml-auto"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {/* User Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-[#001838] text-sm">
                Lista de Pessoas e Clientes ({filteredUsers.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Clique para visualizar ficha completa, editar dados ou gerenciar permissões
              </span>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">Nenhum cadastro encontrado</p>
                <p className="text-xs">Tente ajustar os termos de pesquisa ou filtros aplicados.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const userRequests = requests.filter(r => r.clientEmail.toLowerCase() === u.email.toLowerCase());
                  const formattedPhoneNum = u.phone ? u.phone.replace(/\D/g, '') : '';

                  return (
                    <div
                      key={u.id}
                      className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      {/* User Info Col */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <img
                          src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                          alt={u.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{u.name}</span>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              {u.id}
                            </span>
                            
                            {/* Role Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : u.role === 'profissional'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {u.role}
                            </span>

                            {/* Status Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'ativo'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : u.status === 'bloqueado'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {u.status === 'ativo' ? '● Ativo' : u.status === 'bloqueado' ? '● Bloqueado' : '● Pendente'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {u.email}
                            </span>

                            {u.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                {u.phone}
                              </span>
                            )}

                            {u.cpfCnpj && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                CPF: {u.cpfCnpj}
                              </span>
                            )}

                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {u.city ? `${u.city}/${u.state || 'SP'}` : 'Taubaté/SP'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Completeness & Stats */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="hidden sm:block text-right">
                          <div className="font-bold text-slate-700">
                            {u.isCompleteRegistration ? (
                              <span className="text-emerald-700 flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Cadastro 100% Completo
                              </span>
                            ) : (
                              <span className="text-amber-600 flex items-center justify-end gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Cadastro Parcial
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {userRequests.length} solicitações no app
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
                          {/* WhatsApp Direct Link */}
                          {formattedPhoneNum && (
                            <a
                              href={`https://wa.me/55${formattedPhoneNum}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-colors"
                              title="Abrir WhatsApp do usuário"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}

                          {/* View Full Dossier */}
                          <button
                            onClick={() => setSelectedUserForView(u)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                            title="Ver Dossiê e Histórico Completo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl transition-colors"
                            title="Editar Cadastro Completo"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Toggle Status Lock/Unlock */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-2 rounded-xl transition-colors border ${
                              u.status === 'ativo'
                                ? 'bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border-slate-200'
                                : 'bg-red-50 hover:bg-emerald-50 text-red-600 hover:text-emerald-700 border-red-200'
                            }`}
                            title={u.status === 'ativo' ? 'Bloquear usuário' : 'Ativar usuário'}
                          >
                            {u.status === 'ativo' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-2 bg-slate-50 hover:bg-red-100 text-slate-400 hover:text-red-700 rounded-xl transition-colors"
                            title="Excluir cadastro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OVERVIEW & CHARTS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Top Metrics Cards (Totens Interativos com Redirecionamento) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Totem 1: SOLICITAÇÕES */}
            <div 
              onClick={() => setActiveTab('requests')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('requests'); }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all active:scale-[0.98] group relative overflow-hidden flex items-center justify-between"
              title="Clique para ir para Solicitações de Orçamento"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                    Solicitações
                  </span>
                  <ArrowRight className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#001838] mt-1 group-hover:text-blue-900 transition-colors">
                  {metrics.totalSolicitacoes}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                  <TrendingUp className="w-3 h-3" /> +14% este mês
                </span>
                <span className="text-[9px] text-blue-600 font-semibold block mt-0.5 opacity-80 group-hover:opacity-100">
                  Clique para abrir solicitações →
                </span>
              </div>
              <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            {/* Totem 2: ORÇAMENTOS */}
            <div 
              onClick={() => setActiveTab('requests')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('requests'); }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all active:scale-[0.98] group relative overflow-hidden flex items-center justify-between"
              title="Clique para gerenciar Orçamentos Pendentes"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-amber-600 transition-colors">
                    Orçamentos
                  </span>
                  <ArrowRight className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#001838] mt-1 group-hover:text-amber-900 transition-colors">
                  {metrics.totalOrcamentos}
                </div>
                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 mt-1">
                  <Clock className="w-3 h-3" /> Taxa de resposta: 98%
                </span>
                <span className="text-[9px] text-amber-700 font-semibold block mt-0.5 opacity-80 group-hover:opacity-100">
                  Clique para emitir orçamentos →
                </span>
              </div>
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Totem 3: AGENDAMENTOS */}
            <div 
              onClick={() => setActiveTab('schedule')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('schedule'); }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all active:scale-[0.98] group relative overflow-hidden flex items-center justify-between"
              title="Clique para ver a Agenda de Serviços e Execução"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-emerald-600 transition-colors">
                    Agendamentos
                  </span>
                  <ArrowRight className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#001838] mt-1 group-hover:text-emerald-900 transition-colors">
                  {metrics.totalAgendamentos}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                  <Calendar className="w-3 h-3" /> Concluídos com sucesso
                </span>
                <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5 opacity-80 group-hover:opacity-100">
                  Clique para abrir a Agenda →
                </span>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Totem 4: FATURAMENTO */}
            <div 
              onClick={() => {
                const el = document.getElementById('charts-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' || e.key === ' ') {
                  const el = document.getElementById('charts-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all active:scale-[0.98] group relative overflow-hidden flex items-center justify-between"
              title="Clique para ver Gráficos de Faturamento e Demanda"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-emerald-600 transition-colors">
                    Faturamento
                  </span>
                  <ArrowRight className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                  R$ {metrics.totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                  <DollarSign className="w-3 h-3" /> Crescimento sustentável
                </span>
                <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5 opacity-80 group-hover:opacity-100">
                  Ver gráficos detalhados ↓
                </span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div id="charts-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-6">
            {/* Chart 1: Solicitações por período */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#001838]">Solicitações por período</h3>
                  <p className="text-xs text-slate-500">Evolução mensal de pedidos e faturamento gerado</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600">
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                  <span>Mensal 2026</span>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_CHART_DATA}>
                    <defs>
                      <linearGradient id="colorSolicitacoes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#001838', color: '#fff', borderRadius: '12px', border: 'none' }}
                    />
                    <Area type="monotone" dataKey="solicitacoes" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSolicitacoes)" name="Solicitações" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Serviços mais solicitados */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-[#001838]">Serviços mais solicitados</h3>
                <p className="text-xs text-slate-500">Distribuição percentual de demanda por categoria</p>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SERVICE_DISTRIBUTION_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {SERVICE_DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
                {SERVICE_DISTRIBUTION_DATA.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GESTÃO DE ORÇAMENTOS */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#001838]">Solicitações Pendentes de Orçamento</h3>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
              {pendingRequests.length} pendentes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.length === 0 ? (
              <div className="col-span-2 bg-white p-8 rounded-2xl border text-center text-slate-400">
                Não há solicitações pendentes de orçamento no momento.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        {req.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base mt-1">{req.serviceTitle}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {onDeleteRequest && (
                        <button
                          onClick={() => onDeleteRequest(req.id)}
                          className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir solicitação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center gap-1 text-slate-800 font-bold">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.clientName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.clientPhone}</span>
                    </div>
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{req.street}, {req.number} - {req.neighborhood}, {req.city}/{req.state} {req.cep ? `(${req.cep})` : ''}</span>
                      </div>
                      <a
                        href={req.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${req.street}, ${req.number}, ${req.neighborhood}, ${req.city} - ${req.state}, Brasil`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline flex items-center gap-0.5 flex-shrink-0"
                        title="Ver no Google Maps"
                      >
                        <ExternalLink className="w-3 h-3" /> Maps
                      </a>
                    </div>
                    <div className="flex items-center gap-1 text-amber-700 font-semibold pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Data desejada: {req.desiredDate}</span>
                    </div>

                    {/* Photos Preview */}
                    {((req.photos && req.photos.length > 0) || req.photoUrl) && (
                      <div className="pt-2 border-t border-slate-200/80">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                          <span className="flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-amber-600" />
                            <span>Fotos anexadas pelo cliente:</span>
                          </span>
                          <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-mono">
                            {req.photos?.length || 1} foto(s)
                          </span>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto py-1">
                          {(req.photos || [req.photoUrl]).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`Anexo ${i + 1}`}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-300 hover:scale-105 transition-transform"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenQuoteForm(req)}
                    className="w-full py-2.5 bg-[#001838] hover:bg-[#022452] text-amber-400 font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Emitir e Enviar Orçamento</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AGENDAMENTOS EM EXECUÇÃO / CONCLUÍDOS */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#001838]">Serviços Aprovados e Agendados</h3>
          <div className="space-y-3">
            {scheduledRequests.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center text-slate-400">
                Nenhum serviço em andamento no momento.
              </div>
            ) : (
              scheduledRequests.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{req.serviceTitle}</span>
                      <span className="text-xs text-slate-400">({req.id})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'concluido' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {req.status === 'concluido' ? 'Concluído' : 'Aprovado / Em Execução'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                      <span>Cliente: <strong>{req.clientName}</strong></span>
                      <span>Valor: <strong>R$ {req.quotedPrice?.toFixed(2)}</strong></span>
                      <span>Profissional: <strong>{req.assignedProfessional}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status !== 'concluido' && (
                      <button
                        onClick={() => onUpdateStatus(req.id, 'concluido')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Marcar como Concluído
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AVALIAÇÕES */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#001838]">Avaliações Recebidas de Clientes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratedRequests.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{req.serviceTitle}</span>
                  <div className="flex items-center text-amber-400">
                    {[...Array(req.rating?.stars || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">"{req.rating?.comment}"</p>
                <div className="text-[10px] text-slate-400 flex justify-between border-t pt-2">
                  <span>Por {req.clientName}</span>
                  <span>Profissional: {req.assignedProfessional}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CREDENCIAMENTO & GESTÃO DE PROFISSIONAIS */}
      {/* ========================================================================= */}
      {activeTab === 'professionals' && (
        <div className="space-y-4 animate-fadeIn">
          
          {profSuccessMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{profSuccessMessage}</span>
              </div>
              <button onClick={() => setProfSuccessMessage('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Header & Filter Controls for Professionals */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#001838]">Profissionais Cadastrados & Credenciamento</h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar prestador, CPF, cidade..."
                  value={profSearchTerm}
                  onChange={(e) => setProfSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={profStatusFilter}
                onChange={(e) => setProfStatusFilter(e.target.value as any)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              >
                <option value="todos">Todos ({professionals.length})</option>
                <option value="aprovado">Homologados ({professionals.filter(p => p.status === 'aprovado').length})</option>
                <option value="pendente_aprovacao">Em Análise ({professionals.filter(p => p.status === 'pendente_aprovacao').length})</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProfessionals.length === 0 ? (
              <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 italic">
                Nenhum profissional encontrado com os filtros selecionados.
              </div>
            ) : (
              filteredProfessionals.map((prof) => (
                <div key={prof.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-16 rounded-xl overflow-hidden border-2 border-amber-400 flex-shrink-0 bg-slate-900 shadow-sm">
                          <img
                            src={prof.photo3x4Url || prof.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=400&q=80'}
                            alt={prof.fullName}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[7px] font-mono text-amber-400 text-center font-bold">
                            ID 3/4
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{prof.fullName}</h4>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-0.5">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{prof.rating ? prof.rating.toFixed(1) : '5.0'}</span>
                            <span className="text-slate-400 font-normal">({prof.completedJobs || 12} serviços)</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">CPF/CNPJ: {prof.cpfCnpj}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        prof.status === 'aprovado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {prof.status === 'aprovado' ? 'Homologado' : 'Em Análise'}
                      </span>
                    </div>

                    {/* Categorias / Especialidades */}
                    {prof.categories && prof.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {prof.categories.map((catId) => (
                          <span key={catId} className="text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg capitalize">
                            {catId.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
                      <div><strong>Cidade / Região:</strong> {prof.city} - {prof.state} {prof.neighborhood ? `(${prof.neighborhood})` : ''}</div>
                      <div><strong>Telefone / WhatsApp:</strong> {prof.phone}</div>
                      {prof.email && <div><strong>E-mail:</strong> {prof.email}</div>}
                      <div><strong>Experiência:</strong> {prof.experienceYears}</div>
                      <div><strong>Estrutura:</strong> {prof.hasVehicle ? 'Veículo Próprio' : 'Transporte Regular'} • {prof.hasOwnTools ? 'Ferramentas 100%' : 'Ferramental Parcial'}</div>
                      {prof.notes && <div className="text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-200">"{prof.notes}"</div>}
                    </div>

                    {/* Tabela de Valores Médios Cadastrados por Serviço */}
                    {prof.serviceRates && prof.serviceRates.length > 0 && (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-1.5 text-xs">
                        <div className="font-extrabold text-amber-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                            Tabela de Preços Médios Praticados:
                          </span>
                          <span className="text-[10px] text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full font-bold">
                            {prof.serviceRates.length} serviço(s)
                          </span>
                        </div>

                        <div className="space-y-1 pt-1">
                          {prof.serviceRates.map((rate, rIdx) => {
                            const modelLabel = 
                              rate.chargingModel === 'por_hora' ? 'por hora' :
                              rate.chargingModel === 'por_diaria' ? 'por diária' :
                              rate.chargingModel === 'por_m2' ? 'por m²' :
                              rate.chargingModel === 'a_combinar' ? 'a combinar' : 'por serviço';

                            return (
                              <div key={rIdx} className="bg-white p-2 rounded-lg border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div>
                                  <span className="font-bold text-slate-800 capitalize">
                                    {rate.categoryId.replace(/_/g, ' ')}
                                  </span>
                                  {rate.description && (
                                    <span className="text-[10px] text-slate-500 block">
                                      {rate.description}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="font-black text-emerald-700 text-xs">
                                    R$ {rate.averagePrice.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    ({modelLabel})
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Contrato Digital de Parceria (30% Repasse & Cláusula de Boleto) */}
                    <div className="bg-amber-50/60 border border-amber-200/90 rounded-xl p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-950 flex items-center gap-1.5 text-[11px]">
                          <Scale className="w-3.5 h-3.5 text-amber-600" />
                          Contrato Digital de Parceria:
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          30% & Boleto Assinado
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-amber-100 space-y-1">
                        <p className="flex items-center justify-between">
                          <span><strong>Repasse Contratual:</strong> 30% por serviço</span>
                          <span className="text-emerald-700 font-bold">Prazo: 3 dias úteis</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span><strong>Cláusula de Inadimplência:</strong></span>
                          <span className="text-red-700 font-bold">Emissão de Boleto + NFS-e</span>
                        </p>
                        {prof.contractSignerName && (
                          <p className="text-[10px] text-slate-500 pt-0.5 border-t border-slate-100">
                            Signatário: <strong>{prof.contractSignerName}</strong> • CPF: {prof.contractSignerCpf || prof.cpfCnpj}
                          </p>
                        )}
                      </div>

                      <div className="pt-0.5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setContractModalProf(prof)}
                          className="inline-flex items-center gap-1.5 bg-[#001838] hover:bg-[#002a60] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          <FileText className="w-3 h-3 text-amber-400" />
                          <span>Ver Contrato e Assinatura Digital</span>
                        </button>
                        {prof.contractSignedAt && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(prof.contractSignedAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Documentos Anexados para Homologação */}
                    {(prof.docPhotoUrl || (prof.documents && prof.documents.length > 0)) && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          Documentos Anexados para Análise:
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {prof.docPhotoUrl && (
                            <a
                              href={prof.docPhotoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-300 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Ver Documento (RG/CNH)</span>
                            </a>
                          )}
                          {prof.documents?.map((doc, dIdx) => (
                            <a
                              key={dIdx}
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                            >
                              <FileCheck className="w-3 h-3 text-emerald-600" />
                              <span>{doc.label || doc.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer with Approval and Delete Options */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    {prof.status !== 'aprovado' && onApproveProfessional && (
                      <button
                        onClick={() => onApproveProfessional(prof.id)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 uppercase shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aprovar & Homologar</span>
                      </button>
                    )}

                    {/* Excluir Profissional Button */}
                    <button
                      type="button"
                      onClick={() => setProfToDelete(prof)}
                      className="py-2.5 px-3.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      title="Excluir cadastro do profissional"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Excluir</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: PLATAFORMA DE PAGAMENTO & GATEWAY DE COMISSÕES (30%) */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <PaymentPlatformView
          charges={commissionCharges}
          professionals={professionals}
          gatewaySettings={currentGatewaySettings}
          onUpdateChargeStatus={handleUpdateChargeStatus}
          onIssueBoletoAndNfse={handleIssueBoletoAndNfse}
          onBlockProfessional={(profId) => {
            if (onDeleteProfessional) {
              onDeleteProfessional(profId);
            }
          }}
          onSaveGatewaySettings={handleSaveGatewaySettings}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EMITIR ORÇAMENTO */}
      {/* ========================================================================= */}
      {selectedReqForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900">Emitir Orçamento - {selectedReqForQuote.id}</h3>
                <p className="text-[11px] text-slate-500 font-semibold">{selectedReqForQuote.serviceTitle} • {selectedReqForQuote.clientName}</p>
              </div>
              <button onClick={() => setSelectedReqForQuote(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {/* Context Info: Address & Photos */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-start justify-between gap-1">
                <span className="text-slate-600">
                  📍 {selectedReqForQuote.street}, {selectedReqForQuote.number} - {selectedReqForQuote.neighborhood}, {selectedReqForQuote.city}
                </span>
                <a
                  href={selectedReqForQuote.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedReqForQuote.street}, ${selectedReqForQuote.number}, ${selectedReqForQuote.city}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-bold hover:underline flex items-center gap-0.5 text-[10px] flex-shrink-0"
                >
                  <ExternalLink className="w-3 h-3" /> Maps
                </a>
              </div>

              {((selectedReqForQuote.photos && selectedReqForQuote.photos.length > 0) || selectedReqForQuote.photoUrl) && (
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-700 block mb-1">
                    📸 Fotos anexadas pelo cliente ({selectedReqForQuote.photos?.length || 1}):
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto py-0.5">
                    {(selectedReqForQuote.photos || [selectedReqForQuote.photoUrl]).map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noreferrer" title="Abrir imagem">
                        <img src={img} alt={`Anexo ${idx + 1}`} className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Valor Total (R$)</label>
                <input
                  type="number"
                  step="10"
                  required
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(parseFloat(e.target.value))}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tempo Estimado</label>
                <input
                  type="text"
                  required
                  value={quoteHours}
                  onChange={(e) => setQuoteHours(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                  placeholder="Ex: 2 horas"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Profissional Responsável</label>
                <input
                  type="text"
                  required
                  value={quoteProf}
                  onChange={(e) => setQuoteProf(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações do Orçamento</label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReqForQuote(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow"
                >
                  ENVIAR ORÇAMENTO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DOSSIÊ COMPLETO DO USUÁRIO / DETALHES */}
      {/* ========================================================================= */}
      {selectedUserForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 my-6 text-slate-800">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-18 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm bg-slate-900 flex-shrink-0">
                  <img
                    src={selectedUserForView.photo3x4Url || selectedUserForView.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=400&q=80"}
                    alt={selectedUserForView.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-[7px] font-mono text-amber-400 text-center font-bold">
                    ID 3/4
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedUserForView.name}</h3>
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    ID de Acesso: {selectedUserForView.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForView(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                  selectedUserForView.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : selectedUserForView.role === 'profissional'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  Papel: {selectedUserForView.role}
                </span>

                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  selectedUserForView.status === 'ativo'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  Status: {selectedUserForView.status}
                </span>

                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  selectedUserForView.isCompleteRegistration
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {selectedUserForView.isCompleteRegistration ? '✓ Cadastro Completo (100%)' : '⚠ Cadastro Parcial'}
                </span>
              </div>

              {/* Informações Pessoais */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider text-amber-700">
                  Dados de Identificação & Contato
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><strong>E-mail:</strong> {selectedUserForView.email}</div>
                  <div><strong>Telefone/WhatsApp:</strong> {selectedUserForView.phone || 'Não informado'}</div>
                  <div><strong>CPF/CNPJ:</strong> {selectedUserForView.cpfCnpj || 'Não informado'}</div>
                  <div><strong>RG:</strong> {selectedUserForView.rg || 'Não informado'}</div>
                  <div><strong>Data de Nascimento:</strong> {selectedUserForView.birthDate || 'Não informada'}</div>
                  <div><strong>Data de Cadastro:</strong> {new Date(selectedUserForView.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              {/* Endereço Residencial */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider text-amber-700">
                  Endereço Cadastrado
                </h4>
                <div className="text-slate-600 space-y-1">
                  <div>
                    <strong>Logradouro:</strong> {selectedUserForView.street || 'Não informado'}, {selectedUserForView.number || 'S/N'}
                    {selectedUserForView.complement ? ` (${selectedUserForView.complement})` : ''}
                  </div>
                  <div><strong>Bairro:</strong> {selectedUserForView.neighborhood || 'Não informado'}</div>
                  <div><strong>Cidade/UF:</strong> {selectedUserForView.city || 'Taubaté'} - {selectedUserForView.state || 'SP'}</div>
                  <div><strong>CEP:</strong> {selectedUserForView.cep || 'Não informado'}</div>
                </div>
              </div>

              {/* Observações do Admin */}
              {selectedUserForView.notes && (
                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-amber-900">
                  <span className="font-bold block text-[10px] uppercase">Anotações Internas:</span>
                  <p className="mt-0.5">{selectedUserForView.notes}</p>
                </div>
              )}

              {/* Histórico de Solicitações */}
              <div className="border-t pt-3">
                <h4 className="font-bold text-slate-800 mb-2">
                  Histórico de Solicitações do Usuário ({requests.filter(r => r.clientEmail.toLowerCase() === selectedUserForView.email.toLowerCase()).length})
                </h4>
                <div className="max-h-36 overflow-y-auto space-y-1.5">
                  {requests.filter(r => r.clientEmail.toLowerCase() === selectedUserForView.email.toLowerCase()).map(req => (
                    <div key={req.id} className="p-2 bg-slate-100 rounded-xl flex justify-between items-center text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800">{req.serviceTitle}</span>
                        <span className="text-slate-500 ml-1.5">({req.id})</span>
                      </div>
                      <span className="font-semibold text-emerald-700">
                        {req.quotedPrice ? `R$ ${req.quotedPrice.toFixed(2)}` : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <button
                onClick={() => {
                  const u = selectedUserForView;
                  setSelectedUserForView(null);
                  handleOpenEditUser(u);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar Dados
              </button>
              <button
                onClick={() => setSelectedUserForView(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CADASTRO NOVO USUÁRIO / EDITAR USUÁRIO */}
      {/* ========================================================================= */}
      {(isNewUserModalOpen || selectedUserForEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 my-6 text-slate-800">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {isNewUserModalOpen ? 'Cadastrar Nova Pessoa no App' : `Editar Cadastro - ${formName}`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Preencha o formulário completo de dados cadastrais e endereço
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsNewUserModalOpen(false);
                  setSelectedUserForEdit(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={isNewUserModalOpen ? handleSaveNewUser : handleSaveEditedUser}
              className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1"
            >
              
              {/* Papel e Status */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Conta (Papel) *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="cliente">Cliente (Contratante)</option>
                    <option value="profissional">Profissional (Prestador)</option>
                    <option value="admin">Administrador do Sistema</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status do Acesso *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as UserAccountStatus)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="ativo">Ativo (Acesso Liberado)</option>
                    <option value="pendente">Pendente de Confirmação</option>
                    <option value="bloqueado">Bloqueado / Suspenso</option>
                  </select>
                </div>
              </div>

              {/* Foto 3/4 para ID de Acesso */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3.5">
                <div
                  onClick={() => formPhotoInputRef.current?.click()}
                  className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-amber-500 bg-slate-900 cursor-pointer flex-shrink-0 group shadow-md"
                  title="Clique para importar Foto 3/4"
                >
                  {formPhoto3x4 ? (
                    <>
                      <img src={formPhoto3x4} alt="Foto 3x4" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Camera className="w-4 h-4" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-1 flex flex-col items-center justify-center h-full">
                      <Camera className="w-5 h-5 text-amber-400 mb-1" />
                      <span className="text-[8px] font-bold text-slate-300">Foto 3/4</span>
                    </div>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-mono text-amber-400 text-center font-bold">
                    ID 3/4
                  </span>
                </div>

                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Foto 3/4 para ID de Acesso / Crachá
                    </span>
                    {formPhoto3x4 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        ✓ Foto Carregada
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Importe a foto 3/4 do usuário para registro de identidade e liberação de crachá no sistema.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => formPhotoInputRef.current?.click()}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{formPhoto3x4 ? 'Substituir Foto 3/4' : 'Importar Foto 3/4'}</span>
                    </button>
                    {formPhoto3x4 && (
                      <button
                        type="button"
                        onClick={() => setFormPhoto3x4('')}
                        className="text-red-600 hover:text-red-700 text-[11px] p-1"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={formPhotoInputRef}
                    onChange={handleFormPhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Dados Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nome completo do usuário"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Celular / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(formatPhone(e.target.value))}
                    placeholder="(12) 99999-0000"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPF ou CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={formCpf}
                    onChange={(e) => setFormCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">RG</label>
                  <input
                    type="text"
                    value={formRg}
                    onChange={(e) => setFormRg(e.target.value)}
                    placeholder="00.000.000-0"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={formBirthDate}
                  onChange={(e) => setFormBirthDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              {/* Endereço Completo */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1 text-slate-800 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>Endereço Completo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">CEP</label>
                    <input
                      type="text"
                      value={formCep}
                      onChange={(e) => setFormCep(formatCEP(e.target.value))}
                      placeholder="12000-000"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-1">Rua / Logradouro *</label>
                    <input
                      type="text"
                      required
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      placeholder="Ex: Rua das Palmeiras"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Número *</label>
                    <input
                      type="text"
                      required
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      placeholder="123"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formComplement}
                      onChange={(e) => setFormComplement(e.target.value)}
                      placeholder="Apto / Casa"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formNeighborhood}
                      onChange={(e) => setFormNeighborhood(e.target.value)}
                      placeholder="Bairro"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Cidade/UF</label>
                    <input
                      type="text"
                      value={`${formCity} - ${formState}`}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Observações Internas */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Anotações Internas do ADM</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Observações adicionais sobre o cliente ou prestador..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewUserModalOpen(false);
                    setSelectedUserForEdit(null);
                  }}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isNewUserModalOpen ? 'Cadastrar Pessoa' : 'Salvar Dados'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRMAR EXCLUSÃO DE USUÁRIO */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-lg text-slate-900">Excluir Cadastro?</h3>
              <p className="text-xs text-slate-500">
                Tem certeza que deseja remover o cadastro de <strong>{userToDelete.name}</strong> ({userToDelete.email})? Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CONTRATO DIGITAL & TERMO DE ADESÃO (30% E BOLETO) */}
      {/* ========================================================================= */}
      {contractModalProf && (
        <DigitalContractModal
          isOpen={!!contractModalProf}
          onClose={() => setContractModalProf(null)}
          professional={contractModalProf}
          customSignatureUrl={contractModalProf.contractSignatureUrl}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CONFIRMAR EXCLUSÃO DE PROFISSIONAL */}
      {/* ========================================================================= */}
      {profToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4 text-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900">Excluir Cadastro do Profissional?</h3>
              <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-xs text-left space-y-1">
                <div className="flex items-center gap-2">
                  <img
                    src={profToDelete.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={profToDelete.fullName}
                    className="w-8 h-8 rounded-lg object-cover border"
                  />
                  <div>
                    <strong className="font-bold text-slate-900 block">{profToDelete.fullName}</strong>
                    <span className="text-[11px] text-slate-500 font-mono">CPF: {profToDelete.cpfCnpj}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 pt-1 border-t border-red-200/60">
                  <span>Cidade: <strong>{profToDelete.city}/{profToDelete.state}</strong></span>
                  <span className="block text-red-700 font-semibold mt-0.5">
                    Aviso: O profissional, suas especialidades e o vínculo de contrato serão excluídos da base.
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Tem certeza que deseja prosseguir? Esta operação não pode ser revertida.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProfToDelete(null)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProf}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
