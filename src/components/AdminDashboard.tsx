import React, { useState, useEffect } from 'react';
import { 
  UserAccount, 
  UserRole, 
  UserAccountStatus,
  ServiceRequest,
  ProfessionalProfile,
  CommissionCharge,
  ServiceDefinition
} from '../types';
import { compressImage } from '../utils/storage';
import { AdminReportsCenter } from './AdminReportsCenter';
import { AdminNotificationCenter } from './AdminNotificationCenter';
import { 
  ShieldCheck, 
  User, 
  Users,
  CheckCircle2, 
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
  Phone, 
  MapPin, 
  FileText, 
  Key, 
  Save, 
  Camera, 
  Upload, 
  X, 
  MessageCircle,
  ShieldAlert,
  Fingerprint,
  FileSpreadsheet,
  FileCheck,
  DollarSign,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  requests?: ServiceRequest[];
  users?: UserAccount[];
  currentUser?: UserAccount | null;
  onOpenAuth?: (mode?: 'login' | 'register' | 'profile' | 'forgot_password' | 'admin_access') => void;
  onUpdateUser?: (updatedUser: UserAccount) => void;
  onAddUser?: (newUser: UserAccount) => void;
  onDeleteUser?: (userId: string) => void;
  // Kept for backward compatibility with App.tsx
  metrics?: any;
  professionals?: ProfessionalProfile[];
  charges?: CommissionCharge[];
  gatewaySettings?: any;
  services?: ServiceDefinition[];
  onSendQuote?: any;
  onUpdateStatus?: any;
  onApproveProfessional?: any;
  onDeleteProfessional?: any;
  onDeleteRequest?: any;
  onUpdateChargeStatus?: any;
  onIssueBoletoAndNfse?: any;
  onSaveGatewaySettings?: any;
  onDeleteService?: any;
  onResetServices?: any;
  onPurgeAllData?: any;
  onDeleteCharge?: (chargeId: string) => void;
  onBatchDeleteRequests?: (requestIds: string[]) => void;
  onBatchDeleteUsers?: (userIds: string[]) => void;
  onBatchDeleteCharges?: (chargeIds: string[]) => void;
  onBatchDeleteProfessionals?: (profIds: string[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users = [],
  currentUser,
  requests = [],
  professionals = [],
  charges = [],
  services = [],
  onOpenAuth,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
  onPurgeAllData,
  onDeleteRequest,
  onDeleteProfessional,
  onDeleteCharge,
  onBatchDeleteRequests,
  onBatchDeleteUsers,
  onBatchDeleteCharges,
  onBatchDeleteProfessionals,
}) => {
  // Admin Main Navigation Section: 'relatorios' | 'usuarios' | 'notificacoes'
  const [adminTab, setAdminTab] = useState<'relatorios' | 'usuarios' | 'notificacoes'>('relatorios');
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | UserRole>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | UserAccountStatus>('todos');
  const [completenessFilter, setCompletenessFilter] = useState<'todos' | 'completo' | 'incompleto'>('todos');

  // Modals State
  const [selectedUserForView, setSelectedUserForView] = useState<UserAccount | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Form State for Adding / Editing User Login
  const [formUserId, setFormUserId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('cliente');
  const [formStatus, setFormStatus] = useState<UserAccountStatus>('ativo');
  const [formPassword, setFormPassword] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formRg, setFormRg] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formCep, setFormCep] = useState('12000-000');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formComplement, setFormComplement] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCity, setFormCity] = useState('Taubaté');
  const [formState, setFormState] = useState('SP');
  const [formNotes, setFormNotes] = useState('');
  const [formPhoto3x4, setFormPhoto3x4] = useState<string>('');
  const formPhotoInputRef = React.useRef<HTMLInputElement>(null);
  const [isFormCepLoading, setIsFormCepLoading] = useState(false);
  const [formCepMessage, setFormCepMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFormCepLookup = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsFormCepLoading(true);
      setFormCepMessage(null);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.logradouro) setFormStreet(data.logradouro);
          if (data.bairro) setFormNeighborhood(data.bairro);
          if (data.localidade) setFormCity(data.localidade);
          if (data.uf) setFormState(data.uf);
          if (data.complemento && !formComplement) setFormComplement(data.complemento);
          setFormCepMessage({
            text: `Localizado: ${data.localidade}/${data.uf}`,
            type: 'success'
          });
        } else {
          setFormCepMessage({
            text: 'CEP não encontrado.',
            type: 'error'
          });
        }
      } catch {
        setFormCepMessage({
          text: 'Falha ao buscar CEP.',
          type: 'error'
        });
      } finally {
        setIsFormCepLoading(false);
      }
    }
  };

  const handleFormPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    try {
      const compressed = await compressImage(file, 400, 400, 0.65);
      if (compressed) {
        setFormPhoto3x4(compressed);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormPhoto3x4(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
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
    setFormPassword('');
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
    setFormPhoto3x4('');
    setFormCepMessage(null);
    setIsNewUserModalOpen(true);
  };

  // Open Edit User Modal
  const handleOpenEditUser = (u: UserAccount) => {
    setSelectedUserForEdit(u);
    setFormUserId(u.id);
    setFormName(u.name || '');
    setFormEmail(u.email || '');
    setFormPhone(u.phone || '');
    setFormRole(u.role || 'cliente');
    setFormStatus(u.status || 'ativo');
    setFormPassword(u.password || '');
    setFormCpf(u.cpfCnpj || '');
    setFormRg(u.rg || '');
    setFormBirthDate(u.birthDate || '');
    setFormCep(u.cep || '12000-000');
    setFormStreet(u.street || '');
    setFormNumber(u.number || '');
    setFormComplement(u.complement || '');
    setFormNeighborhood(u.neighborhood || '');
    setFormCity(u.city || 'Taubaté');
    setFormState(u.state || 'SP');
    setFormNotes(u.notes || '');
    setFormPhoto3x4(u.photo3x4Url || u.avatarUrl || '');
    setFormCepMessage(null);
  };

  // Save New User
  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    const isComplete = Boolean(
      formName &&
      formEmail &&
      formPhone &&
      formCpf &&
      formStreet &&
      formNumber &&
      formCity
    );

    const newUser: UserAccount = {
      id: formUserId || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formName,
      email: formEmail.toLowerCase().trim(),
      phone: formPhone,
      role: formRole,
      status: formStatus,
      password: formPassword || '123456',
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
      createdAt: new Date().toISOString(),
      isCompleteRegistration: isComplete,
      avatarUrl: formPhoto3x4 || undefined,
      photo3x4Url: formPhoto3x4 || undefined
    };

    if (onAddUser) {
      onAddUser(newUser);
    }
    setIsNewUserModalOpen(false);
    setSuccessMessage(`Login e conta de ${formName} criados com sucesso!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Save Edited User
  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    const isComplete = Boolean(
      formName &&
      formEmail &&
      formPhone &&
      formCpf &&
      formStreet &&
      formNumber &&
      formCity
    );

    const updated: UserAccount = {
      ...selectedUserForEdit,
      name: formName,
      email: formEmail.toLowerCase().trim(),
      phone: formPhone,
      role: formRole,
      status: formStatus,
      password: formPassword,
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
      isCompleteRegistration: isComplete,
      avatarUrl: formPhoto3x4 || selectedUserForEdit.avatarUrl,
      photo3x4Url: formPhoto3x4 || selectedUserForEdit.photo3x4Url
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setSelectedUserForEdit(null);
    setSuccessMessage(`Credenciais e dados de ${formName} atualizados com sucesso!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Toggle user status (ativo / bloqueado)
  const handleToggleStatus = (u: UserAccount) => {
    const newStatus: UserAccountStatus = u.status === 'ativo' ? 'bloqueado' : 'ativo';
    const updated = { ...u, status: newStatus };
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setSuccessMessage(`Status do login de ${u.name} alterado para ${newStatus === 'ativo' ? 'Ativo (Liberado)' : 'Bloqueado (Suspenso)'}.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Confirm delete user
  const handleConfirmDelete = () => {
    if (userToDelete && onDeleteUser) {
      onDeleteUser(userToDelete.id);
      setSuccessMessage(`Conta e login de ${userToDelete.name} removidos com sucesso.`);
      setUserToDelete(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

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
    link.setAttribute('download', `sm_express_controle_logins_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.cpfCnpj && u.cpfCnpj.includes(searchTerm)) ||
      (u.city && u.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'todos' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'todos' || u.status === statusFilter;
    const matchesCompleteness = 
      completenessFilter === 'todos' ||
      (completenessFilter === 'completo' && u.isCompleteRegistration) ||
      (completenessFilter === 'incompleto' && !u.isCompleteRegistration);

    return matchesSearch && matchesRole && matchesStatus && matchesCompleteness;
  });

  // Metrics
  const totalUsersCount = users.length;
  const activeLoginsCount = users.filter(u => u.status === 'ativo').length;
  const blockedLoginsCount = users.filter(u => u.status === 'bloqueado').length;
  const adminsCount = users.filter(u => u.role === 'admin').length;

  // Strict Admin Gate: Prevent non-admin/unauthenticated users from seeing internal data
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="space-y-6 animate-fade-in py-6">
        <div className="bg-[#001838] text-white p-6 sm:p-10 rounded-3xl shadow-2xl border border-amber-500/30 text-center max-w-xl mx-auto space-y-5">
          <div className="w-20 h-20 bg-amber-400/15 text-amber-400 border border-amber-400/40 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Área Restrita do Administrador
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
              Controle de Login & Acessos
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Este módulo é exclusivo para administradores autenticados gerenciarem credenciais, ativações, bloqueios de contas e permissões de usuários.
          </p>

          <div className="pt-3">
            <button
              onClick={() => onOpenAuth && onOpenAuth('admin_access')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-400/30 flex items-center justify-center gap-2 uppercase tracking-wider transition-all transform hover:scale-[1.02] mx-auto touch-target"
            >
              <ShieldCheck className="w-5 h-5 text-slate-950" />
              <span>Autenticar como Administrador</span>
            </button>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            Acesso protegido por autenticação segura com chave mestra e criptografia.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Admin Module Switcher & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-xl gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setAdminTab('relatorios')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all ${
              adminTab === 'relatorios'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Relatórios & Exportações</span>
          </button>

          <button
            onClick={() => setAdminTab('usuarios')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all ${
              adminTab === 'usuarios'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Controle de Logins ({users.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('notificacoes')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all ${
              adminTab === 'notificacoes'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Notificações WhatsApp & E-mail</span>
          </button>
        </div>

        {/* Action: Limpar dados de teste e deixar apto ao uso */}
        {onPurgeAllData && (
          <button
            onClick={() => setIsPurgeModalOpen(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-xl border border-slate-300 hover:border-red-300 font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
            title="Limpar cadastros de clientes, solicitações de orçamento e pagamentos de teste, deixando o sistema limpo e apto para uso"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Limpar Dados (Apto ao Uso)</span>
          </button>
        )}
      </div>

      {/* VIEW: CENTRAL DE RELATÓRIOS & EXPORTAÇÕES */}
      {adminTab === 'relatorios' && (
        <AdminReportsCenter
          requests={requests}
          professionals={professionals}
          charges={charges}
          users={users}
          services={services}
          onPurgeAllData={onPurgeAllData}
          onDeleteRequest={onDeleteRequest}
          onDeleteUser={onDeleteUser}
          onDeleteProfessional={onDeleteProfessional}
          onDeleteCharge={onDeleteCharge}
          onBatchDeleteRequests={onBatchDeleteRequests}
          onBatchDeleteUsers={onBatchDeleteUsers}
          onBatchDeleteCharges={onBatchDeleteCharges}
          onBatchDeleteProfessionals={onBatchDeleteProfessionals}
        />
      )}

      {/* VIEW: CONTROLE DE LOGINS & ACESSOS */}
      {adminTab === 'usuarios' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner - Exclusive Login & Access Control */}
          <div className="bg-[#001838] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
                <Fingerprint className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Controle de Login & Acessos
                  </h2>
                  <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider">
                    ADMIN
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Gestão centralizada de contas, credenciais, senhas e controle de ativação/bloqueio de acessos.
                </p>
              </div>
            </div>

            {/* Admin actions */}
            <div className="flex flex-wrap items-center gap-2">
              {onOpenAuth && (
                <button
                  onClick={() => onOpenAuth('profile')}
                  className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl border border-amber-400/40 transition-colors flex items-center gap-1.5 shadow-sm"
                  title="Configurar credenciais e senha do administrador master"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Perfil & Senha ADM</span>
                </button>
              )}

              <button
                onClick={handleOpenNewUser}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar Novo Login</span>
              </button>
            </div>
          </div>

          {/* Login KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Totem 1: Total Logins */}
            <div 
              onClick={() => {
                setRoleFilter('todos');
                setStatusFilter('todos');
                setCompletenessFilter('todos');
                setSearchTerm('');
              }}
              role="button"
              tabIndex={0}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
              title="Clique para listar todos os usuários"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                  Total de Contas
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#001838] mt-1">
                  {totalUsersCount}
                </div>
                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 mt-1">
                  Base de Logins Cadastrada
                </span>
              </div>
              <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Totem 2: Logins Ativos */}
            <div 
              onClick={() => {
                setStatusFilter('ativo');
              }}
              role="button"
              tabIndex={0}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
              title="Clique para filtrar apenas logins com acesso ativo"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-emerald-600 transition-colors">
                  Logins Ativos
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                  {activeLoginsCount}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                  Acesso Liberado no App
                </span>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Unlock className="w-6 h-6" />
              </div>
            </div>

            {/* Totem 3: Logins Bloqueados */}
            <div 
              onClick={() => {
                setStatusFilter('bloqueado');
              }}
              role="button"
              tabIndex={0}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-red-400 hover:shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
              title="Clique para filtrar apenas logins bloqueados/suspensos"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-red-600 transition-colors">
                  Bloqueados / Suspensos
                </span>
                <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1">
                  {blockedLoginsCount}
                </div>
                <span className="text-[10px] text-red-500 font-bold mt-1 block">
                  {blockedLoginsCount > 0 ? 'Acesso Revogado' : 'Nenhum bloqueio'}
                </span>
              </div>
              <div className="p-3 bg-red-100 text-red-700 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                <Lock className="w-6 h-6" />
              </div>
            </div>

            {/* Totem 4: Administradores */}
            <div 
              onClick={() => {
                setRoleFilter('admin');
              }}
              role="button"
              tabIndex={0}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-between group"
              title="Clique para filtrar administradores"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-purple-600 transition-colors">
                  Administradores
                </span>
                <div className="text-2xl sm:text-3xl font-black text-purple-800 mt-1">
                  {adminsCount}
                </div>
                <span className="text-[10px] text-purple-600 font-bold mt-1 block">
                  Acesso Master / Gestão
                </span>
              </div>
              <div className="p-3 bg-purple-100 text-purple-800 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Action Bar: Search, Filters & Export */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por Nome, E-mail de Login, CPF, Telefone ou Cidade..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5"
                  title="Exportar dados de login em formato CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exportar</span> CSV
                </button>

                <button
                  onClick={handleOpenNewUser}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Novo Login</span>
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="todos">Todos os Papéis ({users.length})</option>
                <option value="cliente">Clientes ({users.filter(u => u.role === 'cliente').length})</option>
                <option value="profissional">Profissionais ({users.filter(u => u.role === 'profissional').length})</option>
                <option value="admin">Administradores ({users.filter(u => u.role === 'admin').length})</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="todos">Todos os Status de Login</option>
                <option value="ativo">● Ativo (Liberado)</option>
                <option value="bloqueado">● Bloqueado (Suspenso)</option>
                <option value="pendente">● Pendente</option>
              </select>

              {/* Completeness filter */}
              <select
                value={completenessFilter}
                onChange={(e) => setCompletenessFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="todos">Todos os Cadastros</option>
                <option value="completo">Cadastro Completo</option>
                <option value="incompleto">Cadastro Parcial</option>
              </select>

              {(searchTerm || roleFilter !== 'todos' || statusFilter !== 'todos' || completenessFilter !== 'todos') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('todos');
                    setStatusFilter('todos');
                    setCompletenessFilter('todos');
                  }}
                  className="text-amber-600 hover:text-amber-700 font-bold text-xs underline ml-auto"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {/* User Login Control Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-[#001838] text-sm">
                  Lista de Contas & Controle de Acessos ({filteredUsers.length})
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Gerencie ativação, bloqueio, senhas e permissões de cada usuário
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Clique no cadeado para Ativar/Bloquear imediatamente
              </span>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">Nenhum login encontrado</p>
                <p className="text-xs">Tente ajustar os termos de busca ou filtros de papel e status.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const formattedPhoneNum = u.phone ? u.phone.replace(/\D/g, '') : '';
                  const isPasswordVisible = showPasswordMap[u.id];

                  return (
                    <div
                      key={u.id}
                      className={`p-4 sm:p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        u.status === 'bloqueado' ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* User Profile Info */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        {(u.photo3x4Url || u.avatarUrl) ? (
                          <img
                            src={u.photo3x4Url || u.avatarUrl}
                            alt={u.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 font-extrabold text-sm flex items-center justify-center border border-slate-700 shadow-sm flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
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
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : u.status === 'bloqueado'
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {u.status === 'ativo' ? '● Acesso Liberado' : u.status === 'bloqueado' ? '● Bloqueado' : '● Pendente'}
                            </span>
                          </div>

                          {/* Login Credentials & Contacts */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <strong>Login:</strong> {u.email}
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

                      {/* Password status & Quick Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs ml-auto lg:ml-0">
                        
                        {/* Password peek/status */}
                        <div className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] flex items-center gap-2">
                          <Key className="w-3.5 h-3.5 text-amber-600" />
                          <div>
                            <span className="text-slate-500 text-[10px] block">Senha de Acesso:</span>
                            <span className="font-mono font-bold text-slate-800">
                              {u.password ? (
                                isPasswordVisible ? u.password : '••••••••'
                              ) : (
                                <span className="text-amber-700 italic">Padrão do sistema</span>
                              )}
                            </span>
                          </div>
                          {u.password && (
                            <button
                              type="button"
                              onClick={() => setShowPasswordMap(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                              className="text-slate-400 hover:text-slate-700 p-0.5 ml-1"
                              title={isPasswordVisible ? 'Ocultar senha' : 'Ver senha'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          
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

                          {/* Toggle Lock / Unlock Login Status */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-3 py-2 rounded-xl font-bold text-xs transition-colors border flex items-center gap-1.5 shadow-sm ${
                              u.status === 'ativo'
                                ? 'bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-700 border-slate-200'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
                            }`}
                            title={u.status === 'ativo' ? 'Bloquear / Suspender Acesso' : 'Desbloquear / Liberar Acesso'}
                          >
                            {u.status === 'ativo' ? (
                              <>
                                <Lock className="w-3.5 h-3.5 text-red-500" />
                                <span>Bloquear</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Liberar</span>
                              </>
                            )}
                          </button>

                          {/* View Dossier */}
                          <button
                            onClick={() => setSelectedUserForView(u)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                            title="Ver Dossiê e Informações Completas"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Login / Credentials */}
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl transition-colors"
                            title="Editar Login, Senha e Dados"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete Login */}
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-2 bg-slate-50 hover:bg-red-100 text-slate-400 hover:text-red-700 rounded-xl transition-colors"
                            title="Excluir conta de login"
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

          {/* Security Guidance Note */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Políticas de Segurança e Controle de Acessos SM Express</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              • O bloqueio de um login revoga instantaneamente o acesso do usuário ao aplicativo e à plataforma de serviços.<br />
              • Para redefinir ou criar novas senhas, utilize o botão <strong>Editar (Lápis)</strong> ou <strong>Novo Login</strong>.<br />
              • Todas as alterações de papéis e status são sincronizadas com a base de autenticação do sistema.
            </p>
          </div>
        </div>
      )}

      {/* VIEW: NOTIFICAÇÕES WHATSAPP & E-MAIL */}
      {adminTab === 'notificacoes' && (
        <AdminNotificationCenter />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: DOSSIÊ COMPLETO DO USUÁRIO / DETALHES DE LOGIN */}
      {/* ========================================================================= */}
      {selectedUserForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 my-6 text-slate-800">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-18 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm bg-slate-900 flex-shrink-0 flex items-center justify-center">
                  {(selectedUserForView.photo3x4Url || selectedUserForView.avatarUrl) ? (
                    <img
                      src={selectedUserForView.photo3x4Url || selectedUserForView.avatarUrl}
                      alt={selectedUserForView.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-amber-400">
                      <User className="w-7 h-7 opacity-80" />
                      <span className="text-[10px] font-bold text-slate-300">
                        {selectedUserForView.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
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
                  Status: {selectedUserForView.status === 'ativo' ? 'Acesso Liberado' : 'Acesso Bloqueado'}
                </span>

                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  selectedUserForView.isCompleteRegistration
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {selectedUserForView.isCompleteRegistration ? '✓ Cadastro Completo (100%)' : '⚠ Cadastro Parcial'}
                </span>
              </div>

              {/* Informações de Login & Acesso */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider text-amber-700">
                  Credenciais de Autenticação & Contato
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div><strong>E-mail de Login:</strong> {selectedUserForView.email}</div>
                  <div><strong>Telefone/WhatsApp:</strong> {selectedUserForView.phone || 'Não informado'}</div>
                  <div><strong>Senha:</strong> {selectedUserForView.password || '123456'}</div>
                  <div><strong>CPF/CNPJ:</strong> {selectedUserForView.cpfCnpj || 'Não informado'}</div>
                  <div><strong>RG:</strong> {selectedUserForView.rg || 'Não informado'}</div>
                  <div><strong>Data de Cadastro:</strong> {new Date(selectedUserForView.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              {/* Endereço */}
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
                Editar Login & Senha
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
      {/* MODAL 2: CADASTRO NOVO LOGIN / EDITAR LOGIN E SENHA */}
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
                    {isNewUserModalOpen ? 'Cadastrar Novo Login / Usuário' : `Editar Login & Credenciais - ${formName}`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Defina papel, status de acesso, senha e dados cadastrais
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

              {/* Foto 3/4 para Crachá de Acesso */}
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
                    Importe a foto 3/4 para registro de identidade e liberação de crachá de login no sistema.
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

              {/* Dados de Login & Identificação */}
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
                  <label className="block font-bold text-slate-700 mb-1">E-mail de Login *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="login@email.com.br"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Senha e Contatos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-2xl border border-amber-200">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-600" />
                    Senha de Acesso *
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Defina a senha (ex: 123456)"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    O usuário utilizará esta senha para efetuar login no app.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Celular / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(formatPhone(e.target.value))}
                    placeholder="(12) 9XXXX-XXXX"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-800 font-bold text-xs">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Endereço Completo</span>
                  </div>
                  {isFormCepLoading && (
                    <span className="text-[10px] font-bold text-amber-600 animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      Consultando CEP...
                    </span>
                  )}
                  {formCepMessage && !isFormCepLoading && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        formCepMessage.type === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {formCepMessage.text}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">
                      CEP (Busca Automática)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formCep}
                        onChange={(e) => {
                          const formatted = formatCEP(e.target.value);
                          setFormCep(formatted);
                          const digits = formatted.replace(/\D/g, '');
                          if (digits.length === 8) {
                            handleFormCepLookup(digits);
                          } else if (formCepMessage) {
                            setFormCepMessage(null);
                          }
                        }}
                        onBlur={() => handleFormCepLookup(formCep)}
                        placeholder="12000-000"
                        maxLength={9}
                        className="w-full p-2 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl transition-all"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-1">Rua / Logradouro *</label>
                    <input
                      type="text"
                      required
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      placeholder="Ex: Rua das Palmeiras"
                      className="w-full p-2 bg-white border border-slate-300 focus:border-amber-500 rounded-xl"
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
                      className="w-full p-2 bg-white border border-slate-300 focus:border-amber-500 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formComplement}
                      onChange={(e) => setFormComplement(e.target.value)}
                      placeholder="Apto / Casa"
                      className="w-full p-2 bg-white border border-slate-300 focus:border-amber-500 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formNeighborhood}
                      onChange={(e) => setFormNeighborhood(e.target.value)}
                      placeholder="Bairro"
                      className="w-full p-2 bg-white border border-slate-300 focus:border-amber-500 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Cidade - UF</label>
                    <div className="grid grid-cols-3 gap-1">
                      <input
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="Cidade"
                        className="col-span-2 p-2 bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        value={formState}
                        maxLength={2}
                        onChange={(e) => setFormState(e.target.value.toUpperCase())}
                        placeholder="UF"
                        className="col-span-1 p-2 bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-xs uppercase text-center"
                      />
                    </div>
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
                  placeholder="Observações adicionais sobre o usuário..."
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
                  <span>{isNewUserModalOpen ? 'Criar Login' : 'Salvar Credenciais'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRMAR EXCLUSÃO DE CONTA / LOGIN */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-lg text-slate-900">Excluir Conta de Login?</h3>
              <p className="text-xs text-slate-500">
                Tem certeza que deseja remover o login de <strong>{userToDelete.name}</strong> ({userToDelete.email})? O acesso será revogado permanentemente.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
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
      {/* MODAL 4: CONFIRMAR LIMPEZA DE DADOS (APTO AO USO) */}
      {/* ========================================================================= */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-slate-900">Limpar Dados de Teste & Deixar Apto ao Uso?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Esta operação irá zerar as solicitações, orçamentos, dados de clientes de teste e cobranças de pagamento, deixando a plataforma 100% limpa e preparada para operações reais.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>O que será preservado com segurança:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-slate-600 pl-1">
                <li>Sua conta master de Administrador (<strong>suportesmservicos@gmail.com</strong>)</li>
                <li>O catálogo completo de serviços e preços base</li>
                <li>As configurações de gateway de pagamento</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onPurgeAllData) onPurgeAllData();
                  setIsPurgeModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar & Zerar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
