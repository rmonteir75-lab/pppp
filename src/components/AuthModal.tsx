import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  UserCheck,
  Building2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  FileText,
  Calendar,
  Edit3,
  Save,
  Check,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  KeyRound,
  Send,
  RefreshCw,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { compressImage } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserAccount[];
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onRegister: (newUser: UserAccount) => void;
  onUpdateUser?: (updatedUser: UserAccount) => void;
  onLogout: () => void;
  initialMode?: 'login' | 'register' | 'profile' | 'forgot_password' | 'admin_access';
  requiredNotice?: string;
  forceRegisterMode?: boolean;
  prefilledRegistration?: Partial<UserAccount>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onLogin,
  onRegister,
  onUpdateUser,
  onLogout,
  initialMode = 'login',
  requiredNotice,
  forceRegisterMode = false,
  prefilledRegistration
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'profile' | 'forgot_password' | 'admin_access'>(
    currentUser ? 'profile' : forceRegisterMode ? 'register' : initialMode
  );

  // Sync active tab when modal opens or initialMode / currentUser changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(currentUser ? 'profile' : forceRegisterMode ? 'register' : initialMode);
      if (prefilledRegistration) {
        if (prefilledRegistration.name) setRegName(prefilledRegistration.name);
        if (prefilledRegistration.phone) setRegPhone(prefilledRegistration.phone);
        if (prefilledRegistration.street) setRegStreet(prefilledRegistration.street);
        if (prefilledRegistration.neighborhood) setRegNeighborhood(prefilledRegistration.neighborhood);
        if (prefilledRegistration.city) setRegCity(prefilledRegistration.city);
        if (prefilledRegistration.role) setRegRole(prefilledRegistration.role);
      }
    }
  }, [isOpen, initialMode, currentUser, forceRegisterMode, prefilledRegistration]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin Access form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [adminMasterKey, setAdminMasterKey] = useState('');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotMethod, setForgotMethod] = useState<'email' | 'whatsapp'>('email');
  const [forgotCode, setForgotCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [targetResetUser, setTargetResetUser] = useState<UserAccount | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Register form state (Complete Registration)
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('cliente');
  const [regCpf, setRegCpf] = useState('');
  const [regRg, setRegRg] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regGender, setRegGender] = useState<'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer'>('prefiro_nao_dizer');
  
  // Register Address
  const [regCep, setRegCep] = useState('');
  const [regStreet, setRegStreet] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regComplement, setRegComplement] = useState('');
  const [regNeighborhood, setRegNeighborhood] = useState('');
  const [regCity, setRegCity] = useState('Taubaté');
  const [regState, setRegState] = useState('SP');

  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhoto3x4, setRegPhoto3x4] = useState<string | null>(null);
  const [regPhoto3x4Name, setRegPhoto3x4Name] = useState<string>('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
  const [editCpf, setEditCpf] = useState('');
  const [editRg, setEditRg] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editCep, setEditCep] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editComplement, setEditComplement] = useState('');
  const [editNeighborhood, setEditNeighborhood] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // CEP Lookups for Register and Edit Profile
  const [isRegCepLoading, setIsRegCepLoading] = useState(false);
  const [regCepMessage, setRegCepMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isEditCepLoading, setIsEditCepLoading] = useState(false);
  const [editCepMessage, setEditCepMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleRegCepLookup = async (cepVal: string) => {
    const clean = cepVal.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsRegCepLoading(true);
      setRegCepMessage(null);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.logradouro) setRegStreet(data.logradouro);
          if (data.bairro) setRegNeighborhood(data.bairro);
          if (data.localidade) setRegCity(data.localidade);
          if (data.uf) setRegState(data.uf);
          if (data.complemento && !regComplement) setRegComplement(data.complemento);
          setRegCepMessage({ text: `✓ ${data.localidade}/${data.uf}`, type: 'success' });
        } else {
          setRegCepMessage({ text: 'CEP não encontrado', type: 'error' });
        }
      } catch (err) {
        console.error('Erro ao consultar CEP:', err);
        setRegCepMessage({ text: 'Erro ao consultar CEP', type: 'error' });
      } finally {
        setIsRegCepLoading(false);
      }
    }
  };

  const handleEditCepLookup = async (cepVal: string) => {
    const clean = cepVal.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsEditCepLoading(true);
      setEditCepMessage(null);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.logradouro) setEditStreet(data.logradouro);
          if (data.bairro) setEditNeighborhood(data.bairro);
          if (data.localidade) setEditCity(data.localidade);
          if (data.uf) setEditState(data.uf);
          if (data.complemento && !editComplement) setEditComplement(data.complemento);
          setEditCepMessage({ text: `✓ ${data.localidade}/${data.uf}`, type: 'success' });
        } else {
          setEditCepMessage({ text: 'CEP não encontrado', type: 'error' });
        }
      } catch (err) {
        console.error('Erro ao consultar CEP:', err);
        setEditCepMessage({ text: 'Erro ao consultar CEP', type: 'error' });
      } finally {
        setIsEditCepLoading(false);
      }
    }
  };

  // Change Password in Profile State
  const [changePasswordActive, setChangePasswordActive] = useState(false);
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmNewPassword, setEditConfirmNewPassword] = useState('');
  const [showEditCurrentPass, setShowEditCurrentPass] = useState(false);
  const [showEditNewPass, setShowEditNewPass] = useState(false);
  const [showEditConfirmPass, setShowEditConfirmPass] = useState(false);

  // Photo Input Refs
  const regPhotoInputRef = React.useRef<HTMLInputElement>(null);
  const editPhotoInputRef = React.useRef<HTMLInputElement>(null);

  // Load current user profile into edit state
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditPhone(currentUser.phone || '');
      setEditAvatarUrl(currentUser.photo3x4Url || currentUser.avatarUrl || '');
      setEditCpf(currentUser.cpfCnpj || '');
      setEditRg(currentUser.rg || '');
      setEditBirthDate(currentUser.birthDate || '');
      setEditCep(currentUser.cep || '');
      setEditStreet(currentUser.street || '');
      setEditNumber(currentUser.number || '');
      setEditComplement(currentUser.complement || '');
      setEditNeighborhood(currentUser.neighborhood || '');
      setEditCity(currentUser.city || 'Taubaté');
      setEditState(currentUser.state || 'SP');
    }
  }, [currentUser]);

  // Handle Photo 3x4 Upload for Register
  const handleRegPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setRegError('Por favor selecione um arquivo de imagem válido (JPG, PNG).');
      return;
    }

    try {
      const compressed = await compressImage(file, 400, 400, 0.65);
      if (compressed) {
        setRegPhoto3x4(compressed);
        setRegPhoto3x4Name(file.name);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRegPhoto3x4(event.target.result as string);
          setRegPhoto3x4Name(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Photo 3x4 Upload for Edit Profile
  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    try {
      const compressed = await compressImage(file, 400, 400, 0.65);
      if (compressed) {
        setEditAvatarUrl(compressed);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Format Helper Functions
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

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedEmail = loginEmail.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!foundUser) {
      setLoginError('E-mail não encontrado. Verifique os dados ou crie uma nova conta.');
      return;
    }

    if (foundUser.status === 'bloqueado') {
      setLoginError('Esta conta está bloqueada pelo administrador. Entre em contato com o suporte.');
      return;
    }

    if (foundUser.password && foundUser.password !== loginPassword) {
      setLoginError('Senha incorreta. Tente novamente.');
      return;
    }

    // Update last access
    const updated = { ...foundUser, lastAccess: new Date().toISOString() };
    if (onUpdateUser) onUpdateUser(updated);

    onLogin(updated);
    onClose();
  };

  // Quick Master Admin Login
  const handleQuickMasterAdminLogin = () => {
    setAdminError('');
    let adminUser = users.find(u => u.email.toLowerCase() === 'suportesmservicos@gmail.com' || u.email.toLowerCase() === 'rmonteir75@gmail.com');
    if (!adminUser) {
      adminUser = users.find(u => u.role === 'admin');
    }
    
    if (adminUser) {
      const updated = { 
        ...adminUser, 
        email: 'suportesmservicos@gmail.com', // Garantir e-mail oficial atualizado
        lastAccess: new Date().toISOString() 
      };
      if (onUpdateUser) onUpdateUser(updated);
      setAdminSuccess('Acesso ADM Master autorizado com sucesso! Redirecionando...');
      setTimeout(() => {
        onLogin(updated);
        onClose();
      }, 500);
    } else {
      // Fallback create default admin
      const fallbackAdmin: UserAccount = {
        id: 'USR-ADM-001',
        name: 'Administrador SM Express',
        email: 'suportesmservicos@gmail.com',
        phone: '(12) 99160-1322',
        role: 'admin',
        password: '2026Smexpress*',
        cpfCnpj: '54.892.311/0001-90',
        rg: '',
        birthDate: '1980-01-01',
        gender: 'outro',
        cep: '12010-000',
        street: 'Avenida Tiradentes',
        number: '500',
        complement: 'Sala 402',
        neighborhood: 'Centro',
        city: 'Taubaté',
        state: 'SP',
        status: 'ativo',
        isCompleteRegistration: true,
        notes: 'Conta Oficial do Administrador do Sistema SM Express.',
        totalRequests: 0,
        totalSpent: 0,
        lastAccess: new Date().toISOString(),
        avatarUrl: '',
        createdAt: new Date().toISOString()
      };
      onRegister(fallbackAdmin);
      onLogin(fallbackAdmin);
      onClose();
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminSuccess('');

    const cleanEmail = adminEmail.trim().toLowerCase();
    let foundAdmin = users.find(u => u.email.toLowerCase() === cleanEmail);

    // Fallback if master admin is logging in but not yet in state
    if (!foundAdmin && (cleanEmail === 'suportesmservicos@gmail.com' || cleanEmail === 'rmonteir75@gmail.com') && (adminPassword === '2026Smexpress*' || adminPassword === 'Rmonte14*')) {
      const defaultMaster: UserAccount = {
        id: 'USR-ADM-001',
        name: 'Administrador SM Express',
        email: 'suportesmservicos@gmail.com',
        phone: '(12) 99160-1322',
        role: 'admin',
        password: '2026Smexpress*',
        cpfCnpj: '54.892.311/0001-90',
        rg: '',
        birthDate: '1980-01-01',
        gender: 'outro',
        cep: '12010-000',
        street: 'Avenida Tiradentes',
        number: '500',
        complement: 'Sala 402',
        neighborhood: 'Centro',
        city: 'Taubaté',
        state: 'SP',
        status: 'ativo',
        isCompleteRegistration: true,
        notes: 'Conta Oficial do Administrador do Sistema SM Express.',
        totalRequests: 0,
        totalSpent: 0,
        lastAccess: new Date().toISOString(),
        avatarUrl: '',
        createdAt: new Date().toISOString()
      };
      onRegister(defaultMaster);
      foundAdmin = defaultMaster;
    }

    if (!foundAdmin) {
      setAdminError('E-mail administrativo não localizado no sistema.');
      return;
    }

    if (foundAdmin.role !== 'admin') {
      setAdminError('Este e-mail pertence a um usuário comum, não possui privilégios de Administrador.');
      return;
    }

    if (foundAdmin.status === 'bloqueado') {
      setAdminError('Esta conta de administrador está desativada.');
      return;
    }

    const isMasterPasskey = adminPassword === '2026Smexpress*' || adminPassword === 'Rmonte14*';
    if (foundAdmin.password && foundAdmin.password !== adminPassword && !isMasterPasskey) {
      setAdminError('Senha do Administrador incorreta.');
      return;
    }

    setAdminSuccess(`Autenticado com sucesso como ${foundAdmin.name}!`);
    const updated = { 
      ...foundAdmin, 
      password: adminPassword === '2026Smexpress*' ? '2026Smexpress*' : foundAdmin.password,
      lastAccess: new Date().toISOString() 
    };
    if (onUpdateUser) onUpdateUser(updated);

    setTimeout(() => {
      onLogin(updated);
      onClose();
    }, 600);
  };

  const handleQuickLogin = (email: string) => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      onLogin(foundUser);
      onClose();
    }
  };

  // Forgot Password Handlers
  const handleRequestResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    const cleanInput = forgotEmail.trim().toLowerCase();
    if (!cleanInput) {
      setForgotError('Por favor, informe seu e-mail cadastrado ou CPF.');
      return;
    }

    // Find by email or CPF
    const cleanNumbers = cleanInput.replace(/\D/g, '');
    const found = users.find(u => 
      u.email.toLowerCase() === cleanInput || 
      (cleanNumbers.length >= 11 && u.cpfCnpj && u.cpfCnpj.replace(/\D/g, '') === cleanNumbers)
    );

    if (!found) {
      setForgotError('Nenhuma conta encontrada com este e-mail ou documento. Verifique os dados digitados.');
      return;
    }

    if (found.status === 'bloqueado') {
      setForgotError('Esta conta está bloqueada pelo administrador. Entre em contato com o suporte.');
      return;
    }

    setIsSendingCode(true);
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setTargetResetUser(found);

    setTimeout(() => {
      setIsSendingCode(false);
      setForgotStep(2);
      setForgotSuccess(
        forgotMethod === 'whatsapp'
          ? `Código de validação enviado para o WhatsApp de ${found.name.split(' ')[0]} (${found.phone || '(12) 9****-****'})!`
          : `Código de validação enviado para o e-mail (${found.email})!`
      );
    }, 600);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotCode.trim()) {
      setForgotError('Por favor, digite o código de 6 dígitos recebido.');
      return;
    }

    if (forgotCode.trim() !== generatedCode) {
      setForgotError('Código de segurança incorreto. Verifique o código recebido ou solicite um novo.');
      return;
    }

    if (!newPassword || newPassword.length < 3) {
      setForgotError('A nova senha deve ter no mínimo 3 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('A confirmação de senha não confere com a nova senha.');
      return;
    }

    if (!targetResetUser) {
      setForgotError('Erro ao localizar a conta. Tente novamente.');
      return;
    }

    // Update user password
    const updatedUser: UserAccount = {
      ...targetResetUser,
      password: newPassword,
      lastAccess: new Date().toISOString()
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    setForgotSuccess('Senha alterada com sucesso! Redirecionando para o login...');
    setLoginEmail(updatedUser.email);
    setLoginPassword(newPassword);

    setTimeout(() => {
      setActiveTab('login');
      setForgotStep(1);
      setForgotCode('');
      setGeneratedCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotSuccess('');
    }, 1500);
  };

  const handleQuickFillResetCode = () => {
    if (generatedCode) {
      setForgotCode(generatedCode);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName || !regEmail || !regPassword) {
      setRegError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (regPassword.length < 3) {
      setRegError('A senha deve ter no mínimo 3 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas digitadas não coincidem.');
      return;
    }

    if (regRole === 'admin') {
      const validMasterKeys = ['2026Smexpress*', 'Rmonte14*', 'SMEXPRESS-ADM-2026', 'admin123', 'smexpress2026'];
      if (!validMasterKeys.includes(adminMasterKey.trim())) {
        setRegError('Chave Mestra de Segurança inválida para autorizar criação de conta Administrador.');
        return;
      }
    }

    const emailExists = users.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (emailExists) {
      setRegError('Este e-mail já está cadastrado. Faça login ou use outro e-mail.');
      return;
    }

    const isComplete = Boolean(regCpf && regPhone && regStreet && regCity);

    const newAccount: UserAccount = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone,
      role: regRole,
      password: regPassword,
      cpfCnpj: regCpf,
      rg: regRg,
      birthDate: regBirthDate,
      gender: regGender,
      cep: regCep,
      street: regStreet,
      number: regNumber,
      complement: regComplement,
      neighborhood: regNeighborhood,
      city: regCity || 'Taubaté',
      state: regState || 'SP',
      status: 'ativo',
      isCompleteRegistration: isComplete,
      notes: 'Usuário cadastrado pelo aplicativo.',
      totalRequests: 0,
      totalSpent: 0,
      lastAccess: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      avatarUrl: regPhoto3x4 || '',
      photo3x4Url: regPhoto3x4 || ''
    };

    onRegister(newAccount);
    onLogin(newAccount);
    setRegSuccess('Cadastro completo com Foto 3/4 para ID de Acesso realizado com sucesso!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileError('');

    // Validação de Troca de Senha (se ativada ou preenchida)
    let updatedPassword = currentUser.password;
    if (changePasswordActive || editNewPassword.trim() || editCurrentPassword.trim()) {
      if (currentUser.password && editCurrentPassword !== currentUser.password) {
        setProfileError('A senha atual informada está incorreta.');
        return;
      }
      if (!editNewPassword || editNewPassword.length < 3) {
        setProfileError('A nova senha deve ter no mínimo 3 caracteres.');
        return;
      }
      if (editNewPassword !== editConfirmNewPassword) {
        setProfileError('A confirmação da nova senha não confere com a nova senha digitada.');
        return;
      }
      updatedPassword = editNewPassword;
    }

    const isComplete = Boolean(editCpf && editPhone && editStreet && editCity);

    const updated: UserAccount = {
      ...currentUser,
      password: updatedPassword,
      name: editName,
      phone: editPhone,
      avatarUrl: editAvatarUrl || currentUser.avatarUrl,
      photo3x4Url: editAvatarUrl || currentUser.photo3x4Url,
      cpfCnpj: editCpf,
      rg: editRg,
      birthDate: editBirthDate,
      cep: editCep,
      street: editStreet,
      number: editNumber,
      complement: editComplement,
      neighborhood: editNeighborhood,
      city: editCity,
      state: editState,
      isCompleteRegistration: isComplete
    };

    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    
    if ((changePasswordActive || editNewPassword.trim()) && updatedPassword !== currentUser.password) {
      setProfileSuccess('Dados cadastrais e nova senha atualizados com sucesso!');
    } else {
      setProfileSuccess('Dados cadastrais atualizados com sucesso!');
    }

    // Reset password change inputs
    setEditCurrentPassword('');
    setEditNewPassword('');
    setEditConfirmNewPassword('');
    setChangePasswordActive(false);
    setIsEditingProfile(false);
    setTimeout(() => setProfileSuccess(''), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative text-white my-6">
        
        {/* Header bar */}
        <div className="bg-gradient-to-r from-[#001838] via-[#022452] to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {currentUser 
                  ? 'Minha Conta SM Express' 
                  : activeTab === 'admin_access'
                  ? 'Acesso Administrativo & Gestão'
                  : activeTab === 'forgot_password'
                  ? 'Recuperação de Senha'
                  : activeTab === 'login' 
                  ? 'Acesso à Plataforma' 
                  : 'Cadastro Completo de Usuário'}
              </h3>
              <p className="text-[11px] text-amber-300 font-medium">
                {activeTab === 'admin_access'
                  ? 'Painel Exclusivo de Controle & Orçamentos'
                  : activeTab === 'forgot_password' 
                  ? 'Redefinição Segura de Credenciais' 
                  : 'Gestão de Identidade & Credenciais'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation tabs if not logged in */}
        {!currentUser && (
          <div>
            {requiredNotice && (
              <div className="bg-amber-400 text-slate-950 px-4 py-2.5 flex items-center gap-2 text-xs font-black border-b border-amber-500 shadow-inner">
                <Sparkles className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span>{requiredNotice}</span>
              </div>
            )}
            
            <div className={`grid ${forceRegisterMode ? 'grid-cols-1' : 'grid-cols-3'} border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1`}>
              {!forceRegisterMode && (
                <button
                  onClick={() => { setActiveTab('login'); setLoginError(''); setForgotError(''); setForgotSuccess(''); setAdminError(''); setAdminSuccess(''); }}
                  className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'login'
                      ? 'bg-amber-400 text-slate-950 shadow font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              )}

              <button
                onClick={() => { setActiveTab('register'); setRegError(''); setForgotError(''); setForgotSuccess(''); setAdminError(''); setAdminSuccess(''); }}
                className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'register' || forceRegisterMode
                    ? 'bg-amber-400 text-slate-950 shadow font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{forceRegisterMode ? 'Cadastro Obrigatório de Cliente' : 'Cadastrar'}</span>
              </button>

              {!forceRegisterMode && (
                <button
                  onClick={() => { setActiveTab('admin_access'); setLoginError(''); setForgotError(''); setForgotSuccess(''); setAdminError(''); setAdminSuccess(''); }}
                  className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border ${
                    activeTab === 'admin_access'
                      ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 border-amber-300 shadow font-black'
                      : 'bg-slate-900/80 text-amber-300 border-amber-500/30 hover:bg-amber-500/10'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                  <span>Acesso ADM</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="p-6 max-h-[80vh] overflow-y-auto">

          {/* VIEW 1: LOGGED IN PROFILE & EDIT FORM */}
          {currentUser && (
            <div className="space-y-6">
              
              {/* Profile Card Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-900 flex-shrink-0 flex items-center justify-center">
                    {(currentUser.photo3x4Url || currentUser.avatarUrl) ? (
                      <img
                        src={currentUser.photo3x4Url || currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-amber-400">
                        <User className="w-8 h-8 opacity-80" />
                        <span className="text-[10px] font-bold mt-1 text-slate-300">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-[8px] font-mono text-amber-400 text-center font-bold">
                      ID 3/4
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg leading-tight">{currentUser.name}</h4>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : currentUser.role === 'profissional'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'profissional' ? 'Profissional Parceiro' : 'Cliente'}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        currentUser.isCompleteRegistration
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {currentUser.isCompleteRegistration ? <CheckCircle2 className="w-3 h-3" /> : null}
                        {currentUser.isCompleteRegistration ? 'Cadastro Completo' : 'Cadastro Parcial'}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        ID: {currentUser.id}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 self-start sm:self-center"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingProfile ? 'Cancelar Edição' : 'Editar Cadastro'}
                </button>
              </div>

              {profileSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {/* Editable Form */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar Dados Cadastrais & Segurança
                    </h5>
                  </div>

                  {profileError && (
                    <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  {/* Foto 3/4 Edit */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                    <div 
                      onClick={() => editPhotoInputRef.current?.click()}
                      className="relative w-14 h-18 rounded-lg overflow-hidden border-2 border-amber-400 bg-slate-800 cursor-pointer flex-shrink-0 group flex items-center justify-center"
                      title="Alterar Foto 3/4"
                    >
                      {(editAvatarUrl || currentUser.photo3x4Url || currentUser.avatarUrl) ? (
                        <img
                          src={editAvatarUrl || currentUser.photo3x4Url || currentUser.avatarUrl}
                          alt="Foto 3x4"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-amber-400">
                          <User className="w-6 h-6 opacity-70" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Camera className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-1">
                      <span className="text-xs font-bold text-white block">Foto 3/4 de Identificação</span>
                      <p className="text-[11px] text-slate-400 leading-tight">Atualize sua foto de identificação para seu crachá e acesso.</p>
                      <div className="flex gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => editPhotoInputRef.current?.click()}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          Trocar Foto
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={editPhotoInputRef}
                        onChange={handleEditPhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Telefone / WhatsApp</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(formatPhone(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">CPF</label>
                      <input
                        type="text"
                        value={editCpf}
                        onChange={(e) => setEditCpf(formatCPF(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">RG</label>
                      <input
                        type="text"
                        value={editRg}
                        onChange={(e) => setEditRg(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">Data de Nascimento</label>
                      <input
                        type="date"
                        value={editBirthDate}
                        onChange={(e) => setEditBirthDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="text-[11px] font-bold text-slate-300">Endereço Residencial / Comercial</h6>
                      {isEditCepLoading && (
                        <span className="text-[10px] text-amber-400 font-bold animate-pulse">
                          Buscando CEP...
                        </span>
                      )}
                      {editCepMessage && !isEditCepLoading && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            editCepMessage.type === 'success'
                              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                              : 'text-red-400 bg-red-950/60 border border-red-800/60'
                          }`}
                        >
                          {editCepMessage.text}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">CEP</label>
                        <input
                          type="text"
                          value={editCep}
                          onChange={(e) => {
                            const formatted = formatCEP(e.target.value);
                            setEditCep(formatted);
                            const clean = formatted.replace(/\D/g, '');
                            if (clean.length === 8) {
                              handleEditCepLookup(clean);
                            } else if (editCepMessage) {
                              setEditCepMessage(null);
                            }
                          }}
                          onBlur={() => handleEditCepLookup(editCep)}
                          placeholder="12000-000"
                          maxLength={9}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-1">Rua / Avenida</label>
                        <input
                          type="text"
                          value={editStreet}
                          onChange={(e) => setEditStreet(e.target.value)}
                          placeholder="Ex: Rua das Palmeiras"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Número</label>
                        <input
                          type="text"
                          value={editNumber}
                          onChange={(e) => setEditNumber(e.target.value)}
                          placeholder="123"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Complemento</label>
                        <input
                          type="text"
                          value={editComplement}
                          onChange={(e) => setEditComplement(e.target.value)}
                          placeholder="Apto 12"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Bairro</label>
                        <input
                          type="text"
                          value={editNeighborhood}
                          onChange={(e) => setEditNeighborhood(e.target.value)}
                          placeholder="Bairro"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Cidade / UF</label>
                        <div className="grid grid-cols-3 gap-1">
                          <input
                            type="text"
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                            placeholder="Cidade"
                            className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            value={editState}
                            maxLength={2}
                            onChange={(e) => setEditState(e.target.value.toUpperCase())}
                            placeholder="UF"
                            className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white uppercase text-center focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trocar Senha / Segurança de Acesso */}
                  <div className="pt-3 border-t border-slate-800">
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                            <KeyRound className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">Trocar Senha de Acesso</span>
                            <span className="text-[10px] text-slate-400 block">Redefina sua senha de login na plataforma</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setChangePasswordActive(!changePasswordActive);
                            setProfileError('');
                            if (changePasswordActive) {
                              setEditCurrentPassword('');
                              setEditNewPassword('');
                              setEditConfirmNewPassword('');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                            changePasswordActive 
                              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{changePasswordActive ? 'Ocultar / Cancelar' : 'Trocar Senha'}</span>
                        </button>
                      </div>

                      {changePasswordActive && (
                        <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-fade-in">
                          {currentUser.password && (
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Senha Atual <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                                <input
                                  type={showEditCurrentPass ? 'text' : 'password'}
                                  value={editCurrentPassword}
                                  onChange={(e) => setEditCurrentPassword(e.target.value)}
                                  placeholder="Digite sua senha atual"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowEditCurrentPass(!showEditCurrentPass)}
                                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                                >
                                  {showEditCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Nova Senha <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                                <input
                                  type={showEditNewPass ? 'text' : 'password'}
                                  value={editNewPassword}
                                  onChange={(e) => setEditNewPassword(e.target.value)}
                                  placeholder="Mínimo 3 caracteres"
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowEditNewPass(!showEditNewPass)}
                                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                                >
                                  {showEditNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                Confirmar Nova Senha <span className="text-red-400">*</span>
                              </label>
                              <div className="relative">
                                <CheckCircle2 className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${
                                  editConfirmNewPassword && editNewPassword === editConfirmNewPassword ? 'text-emerald-400' : 'text-slate-500'
                                }`} />
                                <input
                                  type={showEditConfirmPass ? 'text' : 'password'}
                                  value={editConfirmNewPassword}
                                  onChange={(e) => setEditConfirmNewPassword(e.target.value)}
                                  placeholder="Repita a nova senha"
                                  className={`w-full bg-slate-950 border rounded-xl pl-9 pr-9 py-2 text-xs text-white focus:outline-none font-mono ${
                                    editConfirmNewPassword && editNewPassword !== editConfirmNewPassword
                                      ? 'border-red-500/80 focus:border-red-400'
                                      : 'border-slate-800 focus:border-amber-400'
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowEditConfirmPass(!showEditConfirmPass)}
                                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                                >
                                  {showEditConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {editNewPassword && editConfirmNewPassword && (
                            <div className="flex items-center gap-1.5 text-[10px]">
                              {editNewPassword === editConfirmNewPassword ? (
                                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> As novas senhas coincidem
                                </span>
                              ) : (
                                <span className="text-red-400 font-semibold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> As senhas não conferem
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileError('');
                        setChangePasswordActive(false);
                        setEditCurrentPassword('');
                        setEditNewPassword('');
                        setEditConfirmNewPassword('');
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              ) : (
                /* Readonly Profile Details */
                <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 text-xs space-y-3 text-slate-300">
                  <div className="flex justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-slate-500">ID do Usuário:</span>
                    <span className="font-mono text-amber-400 font-bold">{currentUser.id}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-slate-500">CPF / CNPJ:</span>
                    <span className="font-medium text-white">{currentUser.cpfCnpj || 'Não informado'}</span>
                  </div>

                  {currentUser.phone && (
                    <div className="flex justify-between border-b border-slate-800/60 pb-2">
                      <span className="text-slate-500">Telefone / WhatsApp:</span>
                      <span className="font-medium text-white">{currentUser.phone}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-slate-500">Endereço Principal:</span>
                    <span className="font-medium text-white text-right">
                      {currentUser.street ? `${currentUser.street}, ${currentUser.number || 'S/N'} - ${currentUser.neighborhood || ''}, ${currentUser.city || 'Taubaté'}` : 'Não cadastrado'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Data de Cadastro:</span>
                    <span>{new Date(currentUser.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Continuar Navegando
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setActiveTab('login');
                  }}
                  className="px-5 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs rounded-xl transition-colors"
                >
                  Sair da Conta
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: LOGIN FORM */}
          {!currentUser && activeTab === 'login' && (
            <div className="space-y-5">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-mail de Acesso
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu.email@dominio.com.br"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setForgotError('');
                        setForgotSuccess('');
                        setForgotStep(1);
                        setActiveTab('forgot_password');
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold hover:underline transition-colors flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Esqueci minha senha</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Informative Security Notice for Production */}
              <div className="pt-4 border-t border-slate-800 text-center space-y-1">
                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-300">Ambiente Seguro de Produção</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Acesso restrito a usuários e administradores homologados SM Express.
                </p>
              </div>

            </div>
          )}

          {/* VIEW 2.5: DEDICATED ADMIN ACCESS (ACESSO ADM) */}
          {!currentUser && activeTab === 'admin_access' && (
            <div className="space-y-5">
              {/* Manual Admin Login Form */}
              <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Autenticação de Credenciais Administrativas
                  </span>
                </div>

                {adminError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                {adminSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{adminSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-mail do Administrador
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="suportesmservicos@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Senha do Administrador
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Senha do administrador"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-white"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-slate-950" />
                    <span>Validar e Entrar como ADM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('admin');
                      setActiveTab('register');
                    }}
                    className="px-3.5 py-3 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Novo ADM</span>
                  </button>
                </div>
              </form>

              {/* Admin Privileges Checklist */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Privilégios da Conta de Administrador:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>Emissão de Orçamentos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>Boletos & NFS-e Automáticas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>Homologação de Parceiros</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span>Sincronização Supabase</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 3: COMPLETE REGISTRATION FORM */}
          {!currentUser && activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Steps bar */}
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-bold mb-4">
                <button
                  type="button"
                  onClick={() => setRegStep(1)}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    regStep === 1 ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  <span>1. Acesso & Identificação</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegStep(2)}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    regStep === 2 ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  <span>2. Documentos & Endereço</span>
                </button>
              </div>

              {regError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* STEP 1: Acesso & Dados Principais */}
              {regStep === 1 && (
                <div className="space-y-3.5">
                  {/* Role selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Finalidade do Cadastro <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole('cliente')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                          regRole === 'cliente'
                            ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <User className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="text-[11px] font-bold text-white">Cliente</div>
                          <div className="text-[9px] text-slate-400">Contratar serviços</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('profissional')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                          regRole === 'profissional'
                            ? 'bg-emerald-400/15 border-emerald-400 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="text-[11px] font-bold text-white">Profissional</div>
                          <div className="text-[9px] text-slate-400">Prestar serviços</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegRole('admin')}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                          regRole === 'admin'
                            ? 'bg-purple-500/20 border-purple-400 text-purple-300 ring-1 ring-purple-400/40'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="text-[11px] font-bold text-white">Administrador</div>
                          <div className="text-[9px] text-purple-300">Gestão Total (ADM)</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Master Passkey field if role is admin */}
                  {regRole === 'admin' && (
                    <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1.5">
                      <label className="block text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                        Chave Mestra de Segurança (Master Passkey) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={adminMasterKey}
                        onChange={(e) => setAdminMasterKey(e.target.value)}
                        placeholder="Digite a chave mestra de autorização"
                        className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                      />
                      <p className="text-[10px] text-purple-300/80">
                        Necessário código de autorização da diretoria SM Express (Chave Mestra Oficial: 2026Smexpress*).
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Foto 3/4 para ID de Acesso & Identificação <span className="text-amber-400 font-bold">*</span>
                    </label>
                    
                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                      {/* Photo 3x4 Preview */}
                      <div 
                        onClick={() => regPhotoInputRef.current?.click()}
                        className="relative w-20 h-24 rounded-xl border-2 border-amber-400 bg-slate-900 flex-shrink-0 overflow-hidden flex flex-col items-center justify-center cursor-pointer group shadow-md"
                        title="Clique para importar foto 3/4"
                      >
                        {regPhoto3x4 ? (
                          <>
                            <img src={regPhoto3x4} alt="Foto 3x4" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Camera className="w-5 h-5" />
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-1">
                            <Camera className="w-6 h-6 text-amber-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-bold text-slate-300 block leading-tight">Foto 3/4</span>
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-mono text-amber-400 text-center py-0.5 font-bold">
                          ID 3/4
                        </span>
                      </div>

                      {/* Controls & Description */}
                      <div className="flex-1 text-center sm:text-left space-y-1.5 w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Identificação de Acesso Oficial
                          </span>
                          {regPhoto3x4 && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                              ✓ Foto Importada
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 leading-tight">
                          Importe uma foto 3/4 nítida do rosto (fundo claro) para vincular ao seu <strong>ID de Acesso</strong> e crachá do aplicativo.
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => regPhotoInputRef.current?.click()}
                            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{regPhoto3x4 ? 'Alterar Foto 3/4' : 'Importar Foto 3/4'}</span>
                          </button>

                          {regPhoto3x4 && (
                            <button
                              type="button"
                              onClick={() => { setRegPhoto3x4(null); setRegPhoto3x4Name(''); }}
                              className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                              title="Remover foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <input
                          type="file"
                          ref={regPhotoInputRef}
                          onChange={handleRegPhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nome Completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        E-mail de Acesso <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="seu.email@dominio.com.br"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Celular / WhatsApp <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(formatPhone(e.target.value))}
                        placeholder="(12) 9XXXX-XXXX"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Senha <span className="text-red-400">*</span>
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 3 caracteres"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirmar Senha <span className="text-red-400">*</span>
                      </label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repita sua senha"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!regName || !regEmail || !regPassword) {
                        setRegError('Preencha os campos obrigatórios para avançar.');
                        return;
                      }
                      setRegError('');
                      setRegStep(2);
                    }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Avançar para Documentos & Endereço</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              )}

              {/* STEP 2: Documentos & Endereço Completo */}
              {regStep === 2 && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        CPF ou CNPJ <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={regCpf}
                        onChange={(e) => setRegCpf(formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">RG</label>
                      <input
                        type="text"
                        value={regRg}
                        onChange={(e) => setRegRg(e.target.value)}
                        placeholder="00.000.000-0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Data Nascimento</label>
                      <input
                        type="date"
                        value={regBirthDate}
                        onChange={(e) => setRegBirthDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <MapPin className="w-4 h-4" />
                        <span>Endereço Completo para Atendimento</span>
                      </div>
                      {isRegCepLoading && (
                        <span className="text-[10px] text-amber-400 font-bold animate-pulse">
                          Buscando CEP...
                        </span>
                      )}
                      {regCepMessage && !isRegCepLoading && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            regCepMessage.type === 'success'
                              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                              : 'text-red-400 bg-red-950/60 border border-red-800/60'
                          }`}
                        >
                          {regCepMessage.text}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">CEP</label>
                        <input
                          type="text"
                          value={regCep}
                          onChange={(e) => {
                            const formatted = formatCEP(e.target.value);
                            setRegCep(formatted);
                            const clean = formatted.replace(/\D/g, '');
                            if (clean.length === 8) {
                              handleRegCepLookup(clean);
                            } else if (regCepMessage) {
                              setRegCepMessage(null);
                            }
                          }}
                          onBlur={() => handleRegCepLookup(regCep)}
                          placeholder="12000-000"
                          maxLength={9}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">Rua / Logradouro</label>
                        <input
                          type="text"
                          value={regStreet}
                          onChange={(e) => setRegStreet(e.target.value)}
                          placeholder="Ex: Rua das Flores"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Número</label>
                        <input
                          type="text"
                          value={regNumber}
                          onChange={(e) => setRegNumber(e.target.value)}
                          placeholder="123"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Complemento</label>
                        <input
                          type="text"
                          value={regComplement}
                          onChange={(e) => setRegComplement(e.target.value)}
                          placeholder="Apto 12"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Bairro</label>
                        <input
                          type="text"
                          value={regNeighborhood}
                          onChange={(e) => setRegNeighborhood(e.target.value)}
                          placeholder="Bairro"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Cidade / UF</label>
                        <div className="grid grid-cols-3 gap-1">
                          <input
                            type="text"
                            value={regCity}
                            onChange={(e) => setRegCity(e.target.value)}
                            placeholder="Cidade"
                            className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            value={regState}
                            maxLength={2}
                            onChange={(e) => setRegState(e.target.value.toUpperCase())}
                            placeholder="UF"
                            className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white uppercase text-center focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Concluir Cadastro Completo</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* VIEW 4: FORGOT PASSWORD (ESQUECI MINHA SENHA) */}
          {!currentUser && activeTab === 'forgot_password' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Back to Login header */}
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setForgotError(''); setForgotSuccess(''); }}
                  className="text-slate-400 hover:text-amber-400 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao Login</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                    forgotStep === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}>
                    1. Identificação
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                    forgotStep === 2 ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}>
                    2. Nova Senha
                  </span>
                </div>
              </div>

              {forgotError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {/* STEP 1: SOLICITAR CÓDIGO */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <KeyRound className="w-4 h-4" />
                      <span>Recuperação de Credenciais</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Informe o e-mail ou CPF cadastrado na sua conta para enviarmos um código de segurança de 6 dígitos para redefinir sua senha com segurança.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      E-mail ou CPF cadastrado <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="seu.email@dominio.com.br ou CPF"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Canal para envio do código de segurança:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForgotMethod('email')}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                          forgotMethod === 'email'
                            ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Mail className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="text-xs font-bold text-white">Por E-mail</div>
                          <div className="text-[10px] text-slate-400">Envio eletrônico</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setForgotMethod('whatsapp')}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                          forgotMethod === 'whatsapp'
                            ? 'bg-emerald-400/15 border-emerald-400 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="text-xs font-bold text-white">WhatsApp</div>
                          <div className="text-[10px] text-slate-400">Mensagem direta</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingCode}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isSendingCode ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Gerando e enviando código...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Código de Recuperação</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setForgotError(''); setForgotSuccess(''); }}
                      className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
                    >
                      Lembrou sua senha? <span className="text-amber-400 font-bold underline">Voltar para o login</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: DIGITAR CÓDIGO E DEFINIR NOVA SENHA */}
              {forgotStep === 2 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* Simulated SMS/Email Notification Box */}
                  {generatedCode && (
                    <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-4 rounded-2xl border border-amber-400/50 shadow-lg space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          {forgotMethod === 'whatsapp' ? 'Simulação WhatsApp SM Express' : 'Simulação E-mail SM Express'}
                        </span>
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                          Código Gerado
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-300">
                        {targetResetUser?.name ? `Olá, ${targetResetUser.name.split(' ')[0]}!` : 'Olá!'} Seu código de segurança para redefinição de senha é:
                      </p>

                      <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-xl font-mono font-black text-amber-400 tracking-widest">
                          {generatedCode}
                        </span>
                        <button
                          type="button"
                          onClick={handleQuickFillResetCode}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Preencher Código
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Código de 6 dígitos <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Digite os 6 números"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-center font-mono text-lg font-bold tracking-widest text-amber-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nova Senha <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirmar Nova Senha <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirme a nova senha"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setForgotStep(1); setForgotError(''); }}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                    >
                      Voltar
                    </button>

                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Redefinir Senha e Entrar</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
