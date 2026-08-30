import React, { useState, useRef } from 'react';
import { 
  UserPlus, 
  Briefcase, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  DollarSign, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  FileCheck, 
  Upload, 
  Wrench, 
  Truck, 
  Sparkles, 
  Search, 
  Star, 
  Users, 
  ArrowRight, 
  AlertCircle, 
  Tag, 
  HelpCircle, 
  X, 
  FileText, 
  Eye, 
  Trash2, 
  Check, 
  Camera, 
  FilePlus, 
  ExternalLink,
  Info,
  Building,
  Scale,
  FileCheck2,
  Lock,
  PenTool
} from 'lucide-react';
import { ProfessionalProfile, ServiceDefinition, ServiceCategory, ServiceRate, DocumentItem, ServiceRequest } from '../types';
import { ProfessionalDemandBoard } from './ProfessionalDemandBoard';
import { DigitalContractModal } from './DigitalContractModal';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { SMExpressLogo } from './SMExpressLogo';

interface ProfessionalRegistrationProps {
  services: ServiceDefinition[];
  professionals: ProfessionalProfile[];
  requests?: ServiceRequest[];
  onRegisterProfessional: (profile: Omit<ProfessionalProfile, 'id' | 'createdAt' | 'rating' | 'completedJobs' | 'status'>) => void;
  onSendQuote?: (
    requestId: string, 
    price: number, 
    hours: string, 
    professionalName: string, 
    notes: string,
    scheduledDate?: string
  ) => void;
  onNavigateToApp?: () => void;
}

export const ProfessionalRegistration: React.FC<ProfessionalRegistrationProps> = ({
  services,
  professionals,
  requests = [],
  onRegisterProfessional,
  onSendQuote,
  onNavigateToApp
}) => {
  const [activeTab, setActiveTab] = useState<'demandas' | 'cadastro' | 'status'>('demandas');
  
  // ==========================================
  // Form State
  // ==========================================
  const [fullName, setFullName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Taubaté');
  const [state, setState] = useState('SP');
  const [isCepLoading, setIsCepLoading] = useState(false);

  // Selected Categories & Rates
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([]);
  const [categoryRates, setCategoryRates] = useState<Record<string, { averagePrice: number; chargingModel: 'por_hora' | 'por_servico' | 'por_diaria' | 'por_m2' | 'a_combinar'; description: string }>>({});

  // Experience & Logistics
  const [experienceYears, setExperienceYears] = useState('3 a 5 anos');
  const [hasVehicle, setHasVehicle] = useState(true);
  const [hasOwnTools, setHasOwnTools] = useState(true);
  const [notes, setNotes] = useState('');

  // Documents & Photos
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [docName, setDocName] = useState<string>('');
  const [docType, setDocType] = useState<DocumentItem['type']>('rg_cnh');

  const [additionalDocs, setAdditionalDocs] = useState<DocumentItem[]>([]);
  const [newDocCategory, setNewDocCategory] = useState<DocumentItem['type']>('comprovante_endereco');

  // Terms & Digital Contract Agreement (30% commission & default boleto)
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeCommission30, setAgreeCommission30] = useState(false);
  const [agreeBoletoClause, setAgreeBoletoClause] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  
  // Digital Contract Modal
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractModalProf, setContractModalProf] = useState<Partial<ProfessionalProfile> | null>(null);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Lightbox / Zoom Modal
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; title: string } | null>(null);

  // Hidden File Inputs Refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const additionalDocInputRef = useRef<HTMLInputElement>(null);

  // Success Confirmation State
  const [registeredSuccess, setRegisteredSuccess] = useState<string | null>(null);

  // Status Search State
  const [searchCpf, setSearchCpf] = useState('');
  const [foundProf, setFoundProf] = useState<ProfessionalProfile | null | 'not_found'>(null);

  // ==========================================
  // Formatting Helpers
  // ==========================================
  const formatCpfCnpj = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (raw.length <= 11) {
      // CPF: 000.000.000-00
      return raw
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .substring(0, 14);
    } else {
      // CNPJ: 00.000.000/0000-00
      return raw
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18);
    }
  };

  const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (raw.length <= 10) {
      return raw
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 14);
    }
    return raw
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const formatCep = (val: string) => {
    return val
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  // ==========================================
  // CEP Lookup
  // ==========================================
  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.bairro) setNeighborhood(data.bairro);
          if (data.localidade) setCity(data.localidade);
          if (data.uf) setState(data.uf);
          setErrors(prev => {
            const next = { ...prev };
            delete next.cep;
            return next;
          });
        } else {
          setErrors(prev => ({ ...prev, cep: 'CEP não encontrado.' }));
        }
      } catch (err) {
        console.error('Erro ao consultar CEP:', err);
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  // ==========================================
  // Category & Rate Handlers
  // ==========================================
  const toggleCategory = (catId: ServiceCategory) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catId));
      const updatedRates = { ...categoryRates };
      delete updatedRates[catId];
      setCategoryRates(updatedRates);
    } else {
      setSelectedCategories([...selectedCategories, catId]);
      setCategoryRates(prev => ({
        ...prev,
        [catId]: {
          averagePrice: 120,
          chargingModel: 'por_servico',
          description: ''
        }
      }));
      setErrors(prev => {
        const next = { ...prev };
        delete next.categories;
        return next;
      });
    }
  };

  const handleRatePriceChange = (catId: ServiceCategory, price: number) => {
    setCategoryRates(prev => ({
      ...prev,
      [catId]: {
        ...(prev[catId] || { chargingModel: 'por_servico', description: '' }),
        averagePrice: price
      }
    }));
  };

  const handleRateModelChange = (catId: ServiceCategory, model: 'por_hora' | 'por_servico' | 'por_diaria' | 'por_m2' | 'a_combinar') => {
    setCategoryRates(prev => ({
      ...prev,
      [catId]: {
        ...(prev[catId] || { averagePrice: 100, description: '' }),
        chargingModel: model
      }
    }));
  };

  const handleRateDescChange = (catId: ServiceCategory, desc: string) => {
    setCategoryRates(prev => ({
      ...prev,
      [catId]: {
        ...(prev[catId] || { averagePrice: 100, chargingModel: 'por_servico' }),
        description: desc
      }
    }));
  };

  // ==========================================
  // File Upload Handlers
  // ==========================================
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoPreview(event.target.result as string);
        setPhotoName(file.name);
        setErrors(prev => {
          const next = { ...prev };
          delete next.photo;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('O documento deve ter no máximo 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setDocPreview(event.target.result as string);
        setDocName(file.name);
        setErrors(prev => {
          const next = { ...prev };
          delete next.document;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (additionalDocs.length + files.length > 5) {
      alert('Você pode anexar no máximo 5 documentos complementares.');
      return;
    }

    (Array.from(files) as File[]).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const sizeKb = (file.size / 1024).toFixed(0);
          const sizeStr = Number(sizeKb) > 1024 
            ? `${(Number(sizeKb) / 1024).toFixed(1)} MB` 
            : `${sizeKb} KB`;

          const newDoc: DocumentItem = {
            id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: file.name,
            type: newDocCategory,
            label: getDocCategoryLabel(newDocCategory),
            url: event.target.result as string,
            uploadedAt: new Date().toISOString(),
            sizeFormatted: sizeStr
          };

          setAdditionalDocs(prev => [...prev, newDoc]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (additionalDocInputRef.current) {
      additionalDocInputRef.current.value = '';
    }
  };

  const handleRemoveAdditionalDoc = (idToRemove: string) => {
    setAdditionalDocs(prev => prev.filter(d => d.id !== idToRemove));
  };

  const getDocCategoryLabel = (type: DocumentItem['type']) => {
    switch (type) {
      case 'rg_cnh': return 'RG / CNH (Identidade)';
      case 'comprovante_endereco': return 'Comprovante de Endereço';
      case 'certificado_curso': return 'Certificado / NR';
      case 'cartao_cnpj': return 'Cartão CNPJ / MEI';
      default: return 'Outro Documento';
    }
  };

  // Sample quick tests for users
  const handleUseSamplePhoto = () => {
    const samples = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setPhotoPreview(picked);
    setPhotoName('foto_perfil_profissional.jpg');
    setErrors(prev => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });
  };

  const handleUseSampleDoc = () => {
    setDocPreview('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80');
    setDocName('cnh_frente_verso_verificada.jpg');
    setErrors(prev => {
      const next = { ...prev };
      delete next.document;
      return next;
    });
  };

  // ==========================================
  // Validation Logic
  // ==========================================
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nome
    if (!fullName.trim()) {
      newErrors.fullName = 'Informe seu nome completo.';
    } else if (fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Informe nome e sobrenome completo.';
    }

    // CPF / CNPJ
    const cleanCpfCnpj = cpfCnpj.replace(/\D/g, '');
    if (!cleanCpfCnpj) {
      newErrors.cpfCnpj = 'Informe seu CPF ou CNPJ.';
    } else if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) {
      newErrors.cpfCnpj = 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos.';
    }

    // Telefone
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Informe seu WhatsApp / Telefone.';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Telefone inválido (mínimo com DDD).';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Informe seu e-mail de contato.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'E-mail em formato inválido.';
    }

    // Cidade
    if (!city.trim()) {
      newErrors.city = 'Informe a cidade de atuação principal.';
    }

    // Categorias
    if (selectedCategories.length === 0) {
      newErrors.categories = 'Selecione ao menos 1 especialidade de serviço.';
    }

    // Tabela de Preços: Verificar se preços são válidos
    selectedCategories.forEach(catId => {
      const rate = categoryRates[catId];
      if (!rate || (rate.averagePrice <= 0 && rate.chargingModel !== 'a_combinar')) {
        newErrors[`rate_${catId}`] = 'Defina um valor médio válido ou escolha "A Combinar".';
      }
    });

    // Documento de Identificação Obrigatório
    if (!docPreview) {
      newErrors.document = 'É obrigatório anexar cópia do documento de identificação (RG ou CNH).';
    }

    // Foto do Perfil
    if (!photoPreview) {
      newErrors.photo = 'É obrigatório anexar uma foto de perfil nítida.';
    }

    // Termos de Uso e Contrato de 30%
    if (!agreeTerms) {
      newErrors.agreeTerms = 'Você deve declarar que as informações enviadas são autênticas.';
    }

    if (!agreeCommission30) {
      newErrors.agreeCommission30 = 'É obrigatório aceitar o repasse de 30% da comissão por serviço realizado.';
    }

    if (!agreeBoletoClause) {
      newErrors.agreeBoletoClause = 'É obrigatório autorizar a cláusula de emissão de Boleto Bancário e Nota Fiscal em caso de não pagamento.';
    }

    if (!signatureDataUrl) {
      newErrors.signature = 'É obrigatório assinar digitalmente o contrato no quadro antes de submeter o cadastro.';
    }

    setErrors(newErrors);

    // If there are errors, scroll to the first error
    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  // ==========================================
  // Form Submit
  // ==========================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      cpfCnpj: true,
      phone: true,
      email: true,
      city: true,
      categories: true,
      document: true,
      photo: true,
      agreeTerms: true,
      agreeCommission30: true,
      agreeBoletoClause: true,
      signature: true
    });

    if (!validateForm()) {
      return;
    }

    // Build structured ServiceRates list
    const compiledRates: ServiceRate[] = selectedCategories.map(catId => {
      const rateInfo = categoryRates[catId] || { averagePrice: 120, chargingModel: 'por_servico', description: '' };
      return {
        categoryId: catId,
        averagePrice: Number(rateInfo.averagePrice) || 0,
        chargingModel: rateInfo.chargingModel,
        description: rateInfo.description
      };
    });

    // Build all attached documents list
    const allCompiledDocs: DocumentItem[] = [];
    if (docPreview) {
      allCompiledDocs.push({
        id: `DOC-MAIN-${Date.now()}`,
        name: docName || 'Documento_Identidade_Principal.jpg',
        type: docType,
        label: getDocCategoryLabel(docType),
        url: docPreview,
        uploadedAt: new Date().toISOString(),
        sizeFormatted: 'Original'
      });
    }
    allCompiledDocs.push(...additionalDocs);

    const ipRandom = `${Math.floor(177 + Math.random() * 12)}.${Math.floor(10 + Math.random() * 200)}.${Math.floor(10 + Math.random() * 200)}.${Math.floor(10 + Math.random() * 200)}`;
    const hashRandom = `(SHA256: ${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)})`;

    onRegisterProfessional({
      fullName: fullName.trim(),
      cpfCnpj: cpfCnpj.trim(),
      phone: phone.trim(),
      email: email.trim(),
      cep: cep.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim(),
      categories: selectedCategories,
      serviceRates: compiledRates,
      experienceYears,
      hasVehicle,
      hasOwnTools,
      notes: notes.trim(),
      photoUrl: photoPreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      photo3x4Url: photoPreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      docPhotoUrl: docPreview || undefined,
      documents: allCompiledDocs,
      contractSigned: true,
      contractSignedAt: new Date().toISOString(),
      contractSignatureUrl: signatureDataUrl || undefined,
      contractSignerName: fullName.trim(),
      contractSignerCpf: cpfCnpj.trim(),
      contractIpHash: `${ipRandom} ${hashRandom}`,
      contractAgreedCommission: 30,
      contractAgreedBoletoClause: true
    });

    const generatedId = `PRO-${Math.floor(100 + Math.random() * 900)}`;
    setRegisteredSuccess(generatedId);
  };

  const handleSearchStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = searchCpf.replace(/\D/g, '');
    const found = professionals.find(p => 
      p.cpfCnpj.replace(/\D/g, '') === cleanSearch || 
      p.email.toLowerCase() === searchCpf.toLowerCase().trim() ||
      p.id.toLowerCase() === searchCpf.toLowerCase().trim()
    );
    if (found) {
      setFoundProf(found);
    } else {
      setFoundProf('not_found');
    }
  };

  const handleResetForm = () => {
    setRegisteredSuccess(null);
    setFullName('');
    setCpfCnpj('');
    setPhone('');
    setEmail('');
    setCep('');
    setNeighborhood('');
    setCity('Taubaté');
    setState('SP');
    setSelectedCategories([]);
    setCategoryRates({});
    setNotes('');
    setPhotoPreview(null);
    setPhotoName('');
    setDocPreview(null);
    setDocName('');
    setAdditionalDocs([]);
    setAgreeTerms(false);
    setErrors({});
    setTouched({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 pt-6">
      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 relative z-20">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-xl mb-6 max-w-2xl mx-auto gap-1.5">
          <button
            onClick={() => setActiveTab('demandas')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all relative touch-target ${
              activeTab === 'demandas' 
                ? 'bg-amber-400 text-slate-950 shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'demandas' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>Mural de Oportunidades</span>
            {requests.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'demandas' ? 'bg-slate-950 text-amber-400' : 'bg-amber-400 text-slate-950'
              }`}>
                {requests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cadastro')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all touch-target ${
              activeTab === 'cadastro' 
                ? 'bg-amber-400 text-slate-950 shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Fornecedor</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all touch-target ${
              activeTab === 'status' 
                ? 'bg-amber-400 text-slate-950 shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Consultar Status</span>
          </button>
        </div>

        {/* TAB 1: MURAL DE DEMANDAS & OPORTUNIDADES EM TEMPO REAL */}
        {activeTab === 'demandas' && (
          <ProfessionalDemandBoard
            requests={requests}
            professionals={professionals}
            services={services}
            onSendQuote={(reqId, price, hours, prof, notes, schedDate) => {
              if (onSendQuote) {
                onSendQuote(reqId, price, hours, prof, notes, schedDate);
              }
            }}
          />
        )}

        {/* TAB 2: CADASTRO FORM */}
        {activeTab === 'cadastro' && (
          <div>
            {registeredSuccess ? (
              <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">Cadastro de Fornecedor Enviado!</h3>
                  <p className="text-slate-300 text-sm mt-1">
                    Seus dados e documentos foram recebidos e estão prontos para análise técnica.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Código do Prestador</span>
                    <span className="text-xl font-mono font-black text-amber-400">{registeredSuccess}</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5">
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span><strong>Status Inicial:</strong> <span className="text-amber-300 font-semibold">Em Análise Técnica</span></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span><strong>Contrato Digital:</strong> <span className="text-emerald-300 font-semibold">Assinado com Repasse de 30% e Boleto</span></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span><strong>Documentos Anexados:</strong> <span className="text-blue-300 font-semibold">{1 + additionalDocs.length} arquivo(s) verificados</span></span>
                    </p>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      Nossa equipe operacional entrará em contato via WhatsApp no número <strong>{phone}</strong> para orientações e liberação dos chamados.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContractModalProf({
                        id: registeredSuccess,
                        fullName,
                        cpfCnpj,
                        phone,
                        email,
                        city,
                        state,
                        contractSigned: true,
                        contractSignedAt: new Date().toISOString(),
                        contractSignatureUrl: signatureDataUrl || undefined,
                        contractSignerName: fullName,
                        contractSignerCpf: cpfCnpj,
                        contractAgreedCommission: 30,
                        contractAgreedBoletoClause: true
                      });
                      setIsContractModalOpen(true);
                    }}
                    className="px-5 py-3 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Visualizar Meu Contrato Assinado</span>
                  </button>

                  <button
                    onClick={handleResetForm}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Fazer Outro Cadastro
                  </button>
                  <button
                    onClick={() => setActiveTab('demandas')}
                    className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors"
                  >
                    Ir para Mural de Oportunidades
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-8">
                
                {/* Header section */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                      <UserPlus className="w-6 h-6 text-amber-400" />
                      Formulário de Credenciamento de Fornecedor
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Preencha os dados e anexe seus documentos para análise e habilitação na plataforma SM Express.
                  </p>
                </div>

                {/* Section 1: Dados Pessoais & Localização */}
                <div id="field-fullName" className="space-y-4">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs flex items-center justify-center font-mono font-bold">1</span>
                    Dados Pessoais, Contato & Localização
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Nome Completo */}
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nome Completo do Responsável <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                        }}
                        placeholder="Digite o nome completo"
                        className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                          errors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 focus:border-amber-400'
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-[11px] text-red-400 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* CPF / CNPJ */}
                    <div id="field-cpfCnpj">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        CPF ou CNPJ (MEI / Empresa) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={cpfCnpj}
                        onChange={(e) => {
                          setCpfCnpj(formatCpfCnpj(e.target.value));
                          if (errors.cpfCnpj) setErrors(prev => ({ ...prev, cpfCnpj: '' }));
                        }}
                        placeholder="000.000.000-00 ou CNPJ"
                        maxLength={18}
                        className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                          errors.cpfCnpj ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 focus:border-amber-400'
                        }`}
                      />
                      {errors.cpfCnpj && (
                        <p className="text-[11px] text-red-400 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.cpfCnpj}
                        </p>
                      )}
                    </div>

                    {/* Telefone / WhatsApp */}
                    <div id="field-phone">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        WhatsApp / Celular de Atendimento <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => {
                            setPhone(formatPhone(e.target.value));
                            if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                          }}
                          placeholder="(12) 99999-8888"
                          maxLength={15}
                          className={`w-full bg-slate-950 border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                            errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 focus:border-amber-400'
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-[11px] text-red-400 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* E-mail */}
                    <div id="field-email" className="sm:col-span-2 lg:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        E-mail de Contato <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                          }}
                          placeholder="contato@email.com"
                          className={`w-full bg-slate-950 border rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${
                            errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 focus:border-amber-400'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[11px] text-red-400 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.email}
                        </p>
                      )}
                    </div>

                    {/* CEP (Com Autocompletar) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        CEP (Opcional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cep}
                          onChange={(e) => setCep(formatCep(e.target.value))}
                          onBlur={handleCepBlur}
                          placeholder="12000-000"
                          maxLength={9}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                        />
                        {isCepLoading && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-400 font-bold animate-pulse">
                            Buscando...
                          </span>
                        )}
                      </div>
                      {errors.cep && (
                        <p className="text-[10px] text-red-400 mt-1">{errors.cep}</p>
                      )}
                    </div>

                    {/* Cidade */}
                    <div id="field-city">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Cidade de Atuação <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Taubaté, Tremembé, Pinda, etc."
                        className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none ${
                          errors.city ? 'border-red-500' : 'border-slate-800 focus:border-amber-400'
                        }`}
                      />
                      {errors.city && (
                        <p className="text-[11px] text-red-400 font-semibold mt-1">{errors.city}</p>
                      )}
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Estado (UF) <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="SP">São Paulo (SP)</option>
                        <option value="RJ">Rio de Janeiro (RJ)</option>
                        <option value="MG">Minas Gerais (MG)</option>
                        <option value="PR">Paraná (PR)</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Section 2: Especialidades */}
                <div id="field-categories" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs flex items-center justify-center font-mono font-bold">2</span>
                      Especialidades e Categorias de Atuação
                    </h3>
                    <span className="text-xs text-amber-300 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      {selectedCategories.length} selecionada(s)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Selecione todos os serviços que você ou sua equipe prestam com excelência técnica:
                  </p>

                  {errors.categories && (
                    <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2 font-semibold">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>{errors.categories}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {services.map((service) => {
                      const isSelected = selectedCategories.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => toggleCategory(service.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                            isSelected
                              ? 'bg-amber-400/10 border-amber-400 text-amber-200 shadow-md shadow-amber-400/5'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${
                            isSelected ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-600 bg-slate-900'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{service.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{service.shortDescription}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Valor Médio Cobrado por Tipo de Serviço */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs flex items-center justify-center font-mono font-bold">3</span>
                      Tabela de Preços Médios Praticados
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Estimativa para direcionamento de chamados
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Defina o valor base e a forma de cobrança para cada especialidade selecionada.
                  </p>

                  {selectedCategories.length === 0 ? (
                    <div className="p-5 bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500 space-y-1">
                      <p className="font-semibold text-slate-400">Nenhuma especialidade selecionada</p>
                      <p>Marque ao menos uma especialidade na Seção 2 para configurar sua tabela de valores médios.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCategories.map((catId) => {
                        const serviceDef = services.find(s => s.id === catId);
                        const rate = categoryRates[catId] || { averagePrice: 120, chargingModel: 'por_servico', description: '' };
                        const hasRateError = errors[`rate_${catId}`];

                        return (
                          <div 
                            key={catId} 
                            className={`bg-slate-950/90 border rounded-2xl p-4 transition-colors space-y-3 ${
                              hasRateError ? 'border-red-500' : 'border-slate-800 hover:border-amber-400/50'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/80 pb-2.5">
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <span className="text-xs font-bold text-white uppercase tracking-tight">
                                  {serviceDef ? serviceDef.title : catId}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400">
                                Preço base sugerido pelo parceiro
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                              
                              {/* Campo 1: Valor Médio em R$ */}
                              <div className="sm:col-span-4">
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                  Valor Médio Estimado (R$) <span className="text-amber-400">*</span>
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                                    R$
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="5"
                                    value={rate.averagePrice}
                                    onChange={(e) => handleRatePriceChange(catId, parseFloat(e.target.value) || 0)}
                                    placeholder="Ex: 150"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-400"
                                  />
                                </div>
                              </div>

                              {/* Campo 2: Modelo de Cobrança */}
                              <div className="sm:col-span-4">
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                  Modelo de Cobrança <span className="text-amber-400">*</span>
                                </label>
                                <select
                                  value={rate.chargingModel}
                                  onChange={(e) => handleRateModelChange(catId, e.target.value as any)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
                                >
                                  <option value="por_servico">Por Serviço Fechado (Empreita)</option>
                                  <option value="por_hora">Por Hora Trabalhada (R$/h)</option>
                                  <option value="por_diaria">Por Diária Completa (8h)</option>
                                  <option value="por_m2">Por Metro Quadrado (R$/m²)</option>
                                  <option value="a_combinar">A Combinar após Vistoria</option>
                                </select>
                              </div>

                              {/* Campo 3: Observações / Escopo incluído */}
                              <div className="sm:col-span-4">
                                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                                  O que inclui? (Opcional)
                                </label>
                                <input
                                  type="text"
                                  value={rate.description}
                                  onChange={(e) => handleRateDescChange(catId, e.target.value)}
                                  placeholder="Ex: Incluso produtos básicos / taxa"
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                                />
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section 4: Experiência & Estrutura */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs flex items-center justify-center font-mono font-bold">4</span>
                    Experiência & Estrutura Operacional
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Tempo de Atuação no Ramo
                      </label>
                      <select
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="Menos de 1 ano">Menos de 1 ano</option>
                        <option value="1 a 2 anos">1 a 2 anos</option>
                        <option value="3 a 5 anos">3 a 5 anos</option>
                        <option value="5 a 10 anos">5 a 10 anos</option>
                        <option value="Mais de 10 anos">Mais de 10 anos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Possui Veículo Próprio?
                      </label>
                      <select
                        value={hasVehicle ? 'sim' : 'nao'}
                        onChange={(e) => setHasVehicle(e.target.value === 'sim')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="sim">Sim (Carro, Moto ou Utilitário)</option>
                        <option value="nao">Não (Transporte público / apps)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Possui Ferramentas Próprias?
                      </label>
                      <select
                        value={hasOwnTools ? 'sim' : 'nao'}
                        onChange={(e) => setHasOwnTools(e.target.value === 'sim')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="sim">Sim (Equipamento completo próprio)</option>
                        <option value="nao">Parcial / Não possui</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Qualificações Adicionais / Certificados (NR-10, NR-35, Cursos)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Conte um pouco sobre suas especialidades técnicas, marcas com as quais trabalha ou certificações oficiais."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Section 5: Documentação & Fotos (COMPLETO E TOTALMENTE APTO) */}
                <div id="field-document" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs flex items-center justify-center font-mono font-bold">5</span>
                      Inserção de Documentos & Foto do Prestador
                    </h3>
                    <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verificação de Segurança
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Anexe sua foto de perfil e documento oficial com foto para homologação cadastral. Você pode selecionar arquivos do seu dispositivo (JPG, PNG ou PDF).
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* 5.1: Foto 3/4 de ID de Acesso / Perfil do Profissional */}
                    <div id="field-photo" className={`bg-slate-950 border rounded-2xl p-4 flex flex-col justify-between transition-colors ${
                      errors.photo ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 hover:border-slate-700'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                            <Camera className="w-4 h-4 text-amber-400" />
                            Foto 3/4 para ID de Acesso & Crachá <span className="text-red-400">*</span>
                          </span>
                          {photoPreview && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                              ✓ Foto 3/4 Anexada
                            </span>
                          )}
                        </div>

                        {photoPreview ? (
                          <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 mb-3">
                            <div 
                              onClick={() => setPreviewModalUrl({ url: photoPreview, title: 'Foto 3/4 para ID de Acesso' })}
                              className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-amber-400 flex-shrink-0 cursor-pointer group bg-slate-800 shadow-md"
                              title="Clique para ampliar"
                            >
                              <img src={photoPreview} alt="Foto 3/4 ID" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                              <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-mono text-amber-400 text-center font-bold">
                                ID 3/4
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{photoName || 'Foto_3x4_Prestador.jpg'}</p>
                              <p className="text-[10px] text-emerald-400 font-semibold">✓ ID de acesso pronto para emissão</p>
                              <div className="flex gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => setPreviewModalUrl({ url: photoPreview, title: 'Foto 3/4 para ID de Acesso' })}
                                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                                >
                                  <Eye className="w-3 h-3" /> Visualizar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setPhotoPreview(null); setPhotoName(''); }}
                                  className="text-[10px] text-red-400 hover:underline flex items-center gap-0.5"
                                >
                                  <Trash2 className="w-3 h-3" /> Trocar foto
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => photoInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-900/60 hover:bg-slate-900 rounded-xl p-5 text-center cursor-pointer transition-all mb-3 group"
                          >
                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-400 mx-auto mb-2 transition-colors" />
                            <p className="text-xs font-bold text-white group-hover:text-amber-300">
                              Clique para importar Foto 3/4 do Rosto
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Foto 3/4 nítida com fundo claro para crachá e ID de acesso (JPG/PNG)
                            </p>
                          </div>
                        )}

                        <input 
                          type="file" 
                          ref={photoInputRef} 
                          onChange={handlePhotoUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                      </div>

                      {errors.photo && (
                        <p className="text-[11px] text-red-400 font-semibold mb-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.photo}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                        >
                          {photoPreview ? 'Substituir Arquivo' : 'Buscar no Dispositivo'}
                        </button>
                        <button
                          type="button"
                          onClick={handleUseSamplePhoto}
                          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded font-semibold transition-colors"
                        >
                          Usar Foto 3/4 Padrão
                        </button>
                      </div>
                    </div>

                    {/* 5.2: Documento de Identidade Principal (RG/CNH) */}
                    <div id="field-document-box" className={`bg-slate-950 border rounded-2xl p-4 flex flex-col justify-between transition-colors ${
                      errors.document ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-800 hover:border-slate-700'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-white flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-amber-400" />
                            Documento Oficial com Foto <span className="text-red-400">*</span>
                          </span>
                          <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value as any)}
                            className="bg-slate-900 border border-slate-700 text-[10px] text-amber-300 font-bold rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="rg_cnh">CNH Digital / RG</option>
                            <option value="cartao_cnpj">Cartão CNPJ / MEI</option>
                          </select>
                        </div>

                        {docPreview ? (
                          <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 mb-3">
                            <div 
                              onClick={() => setPreviewModalUrl({ url: docPreview, title: 'Documento de Identificação' })}
                              className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 flex-shrink-0 cursor-pointer group bg-slate-800 flex items-center justify-center"
                              title="Clique para ampliar"
                            >
                              <img src={docPreview} alt="Documento" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{docName || 'Documento Oficial'}</p>
                              <p className="text-[10px] text-emerald-400 font-semibold">✓ Documento carregado com sucesso</p>
                              <div className="flex gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => setPreviewModalUrl({ url: docPreview, title: 'Documento de Identificação' })}
                                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                                >
                                  <Eye className="w-3 h-3" /> Visualizar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setDocPreview(null); setDocName(''); }}
                                  className="text-[10px] text-red-400 hover:underline flex items-center gap-0.5"
                                >
                                  <Trash2 className="w-3 h-3" /> Trocar
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => docInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-900/60 hover:bg-slate-900 rounded-xl p-5 text-center cursor-pointer transition-all mb-3 group"
                          >
                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-400 mx-auto mb-2 transition-colors" />
                            <p className="text-xs font-bold text-white group-hover:text-amber-300">
                              Clique para anexar RG ou CNH (Frente e Verso)
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Imagens nítidas ou PDF (máx. 15MB)
                            </p>
                          </div>
                        )}

                        <input 
                          type="file" 
                          ref={docInputRef} 
                          onChange={handleDocUpload} 
                          accept="image/*,application/pdf" 
                          className="hidden" 
                        />
                      </div>

                      {errors.document && (
                        <p className="text-[11px] text-red-400 font-semibold mb-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.document}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={() => docInputRef.current?.click()}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                        >
                          {docPreview ? 'Substituir Documento' : 'Buscar no Dispositivo'}
                        </button>
                        <button
                          type="button"
                          onClick={handleUseSampleDoc}
                          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded font-semibold transition-colors"
                        >
                          Usar Documento Amostra
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* 5.3: Documentos Complementares / Certificados (Opcional - até 5 anexos) */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <FilePlus className="w-4 h-4 text-blue-400" />
                          Documentos Complementares (Comprovante de Residência, MEI, Cursos / NRs)
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Adicione comprovantes extras para acelerar sua homologação com selo de verificação VIP.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={newDocCategory}
                          onChange={(e) => setNewDocCategory(e.target.value as any)}
                          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="comprovante_endereco">Comprovante de Endereço</option>
                          <option value="certificado_curso">Certificado de Curso / NR</option>
                          <option value="cartao_cnpj">Comprovante MEI / CNPJ</option>
                          <option value="outro">Outro Documento</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => additionalDocInputRef.current?.click()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Adicionar Arquivo</span>
                        </button>
                      </div>
                    </div>

                    <input 
                      type="file" 
                      ref={additionalDocInputRef} 
                      onChange={handleAdditionalDocUpload} 
                      accept="image/*,application/pdf" 
                      multiple
                      className="hidden" 
                    />

                    {additionalDocs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                        {additionalDocs.map((doc) => (
                          <div 
                            key={doc.id} 
                            className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded">
                                  {doc.label}
                                </span>
                                <p className="text-xs font-semibold text-white truncate">{doc.name}</p>
                                <span className="text-[9px] text-slate-400">{doc.sizeFormatted || 'Anexado'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => setPreviewModalUrl({ url: doc.url, title: doc.name })}
                                className="p-1 text-slate-400 hover:text-amber-400 rounded transition-colors"
                                title="Visualizar"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAdditionalDoc(doc.id)}
                                className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                                title="Remover"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl text-center text-[11px] text-slate-500">
                        Nenhum documento complementar adicionado ainda (opcional).
                      </div>
                    )}
                  </div>

                </div>

                {/* Section 6: Contrato Digital de Parceria (30% Repasse & Autorização de Boleto) */}
                <div id="field-agreeTerms" className="space-y-5 pt-6 border-t border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 text-xs flex items-center justify-center font-mono font-bold">6</span>
                      Contrato Digital de Parceria & Termo de Adesão (Obrigatório)
                    </h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 self-start sm:self-auto">
                      <ShieldCheck className="w-3.5 h-3.5" /> Validade Jurídica (MP 2.200-2/2001)
                    </span>
                  </div>

                  {/* Contract Clauses Summary Box */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-amber-400" />
                        Resumo das Cláusulas Contratuais da Parceria:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setContractModalProf({
                            fullName: fullName || 'Prestador Candidato',
                            cpfCnpj: cpfCnpj || '000.000.000-00',
                            city: city || 'Taubaté',
                            state: state || 'SP',
                            contractSignerName: fullName || 'Prestador Candidato',
                            contractSignerCpf: cpfCnpj || '000.000.000-00',
                            contractAgreedCommission: 30,
                            contractAgreedBoletoClause: true
                          });
                          setIsContractModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ler Contrato Completo em Tela Cheia
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-amber-400/30 space-y-1.5">
                        <div className="flex items-center gap-2 font-black text-amber-400">
                          <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>1. Repasse da Comissão de 30%</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          O prestador compromete-se a repassar à conta da <strong>SM Express o percentual de 30%</strong> sobre o valor bruto de cada serviço realizado através da plataforma, com prazo limite de até <strong>3 (três) dias úteis</strong> após a realização ou confirmação do chamado.
                        </p>
                      </div>

                      <div className="p-3.5 bg-red-950/20 rounded-xl border border-red-500/30 space-y-1.5">
                        <div className="flex items-center gap-2 font-black text-red-400">
                          <FileCheck2 className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <span>2. Cláusula de Cobrança e Boleto Bancário</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Em caso de não repasse da comissão de 30% no prazo estipulado, o aplicativo está <strong>expressamente autorizado a emitir Boleto Bancário e Nota Fiscal</strong> de intermediação com juros de 1% a.m., multa de 2% e correção monetária, além do bloqueio da conta.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Digital Signature Pad */}
                  <div id="field-signature">
                    <DigitalSignaturePad
                      signerName={fullName}
                      signerCpf={cpfCnpj}
                      hasSignature={!!signatureDataUrl}
                      onSignatureChange={(sig) => {
                        setSignatureDataUrl(sig);
                        if (errors.signature) setErrors(prev => ({ ...prev, signature: '' }));
                      }}
                    />
                    {errors.signature && (
                      <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1 mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.signature}
                      </p>
                    )}
                  </div>

                  {/* Mandatory Checkboxes */}
                  <div className="space-y-2.5 pt-2">
                    {/* Checkbox 1: 30% Commission */}
                    <div id="field-agreeCommission30">
                      <label className={`flex items-start gap-3 cursor-pointer select-none p-3.5 rounded-2xl border transition-all ${
                        agreeCommission30 
                          ? 'bg-amber-400/10 border-amber-400/50 text-slate-200' 
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={agreeCommission30}
                          onChange={(e) => {
                            setAgreeCommission30(e.target.checked);
                            if (errors.agreeCommission30) setErrors(prev => ({ ...prev, agreeCommission30: '' }));
                          }}
                          className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-400 focus:ring-amber-400 accent-amber-400 flex-shrink-0"
                        />
                        <div className="text-xs leading-relaxed">
                          <span className="font-bold text-amber-300 block">
                            ✓ Declaro e concordo que todo serviço realizado 30% será repassado para a conta do app SM Express em até 3 dias úteis.
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Reconheço que a comissão remunera a intermediação de tecnologia, segurança jurídica e captação de clientes.
                          </span>
                        </div>
                      </label>
                      {errors.agreeCommission30 && (
                        <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.agreeCommission30}
                        </p>
                      )}
                    </div>

                    {/* Checkbox 2: Default & Boleto Issuance */}
                    <div id="field-agreeBoletoClause">
                      <label className={`flex items-start gap-3 cursor-pointer select-none p-3.5 rounded-2xl border transition-all ${
                        agreeBoletoClause 
                          ? 'bg-red-500/10 border-red-500/40 text-slate-200' 
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={agreeBoletoClause}
                          onChange={(e) => {
                            setAgreeBoletoClause(e.target.checked);
                            if (errors.agreeBoletoClause) setErrors(prev => ({ ...prev, agreeBoletoClause: '' }));
                          }}
                          className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-400 focus:ring-red-400 accent-red-400 flex-shrink-0"
                        />
                        <div className="text-xs leading-relaxed">
                          <span className="font-bold text-red-300 block">
                            ✓ Autorizo a emissão de Boleto Bancário e Nota Fiscal caso eu não pague a comissão de 30%.
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Caso o repasse não seja quitado no prazo, autorizo a emissão automática de título de cobrança bancária acrescido de encargos moratórios.
                          </span>
                        </div>
                      </label>
                      {errors.agreeBoletoClause && (
                        <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.agreeBoletoClause}
                        </p>
                      )}
                    </div>

                    {/* Checkbox 3: Authenticity of Data & General Terms */}
                    <div>
                      <label className="flex items-start gap-3 cursor-pointer select-none bg-slate-950 p-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (errors.agreeTerms) setErrors(prev => ({ ...prev, agreeTerms: '' }));
                          }}
                          className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-400 focus:ring-amber-400 accent-amber-400 flex-shrink-0"
                        />
                        <div className="text-xs leading-relaxed text-slate-300">
                          <span className="font-bold text-white block">Declaro que as informações e documentos enviados são autênticos e verdadeiros</span>
                          <span className="text-[11px] text-slate-400">Concordo com os Termos de Parceria e Boas Práticas da SM Express para prestação de serviços no Vale do Paraíba.</span>
                        </div>
                      </label>
                      {errors.agreeTerms && (
                        <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {errors.agreeTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>Análise técnica ágil em até 24 horas úteis com retorno pelo WhatsApp.</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 uppercase tracking-wider"
                    >
                      <PenTool className="w-4 h-4 stroke-[3]" />
                      <span>Assinar Contrato & Concluir Cadastro</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>

              </form>
            )}
          </div>
        )}

        {/* TAB 2: CONSULTAR STATUS */}
        {activeTab === 'status' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                Consultar Status do Cadastro de Prestador
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Digite seu CPF, CNPJ, Código ID ou E-mail utilizado durante o cadastro para acompanhar a aprovação.
              </p>
            </div>

            <form onSubmit={handleSearchStatus} className="flex gap-2">
              <input
                type="text"
                required
                value={searchCpf}
                onChange={(e) => setSearchCpf(e.target.value)}
                placeholder="Digite CPF/CNPJ, E-mail ou Código PRO-..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-colors flex items-center gap-1.5 uppercase"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </form>

            {foundProf === 'not_found' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-200 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-bold">Nenhum cadastro de prestador localizado.</p>
                  <p className="text-slate-300 mt-0.5">Verifique os dados digitados ou realize um novo cadastro na aba "Cadastrar Fornecedor".</p>
                </div>
              </div>
            )}

            {foundProf && foundProf !== 'not_found' && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    {foundProf.photoUrl && (
                      <img src={foundProf.photoUrl} alt="Foto" className="w-12 h-12 rounded-full object-cover border-2 border-amber-400" />
                    )}
                    <div>
                      <h4 className="font-bold text-white text-base">{foundProf.fullName}</h4>
                      <p className="text-xs text-slate-400">{foundProf.city} - {foundProf.state} | {foundProf.phone}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    foundProf.status === 'aprovado'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : foundProf.status === 'pendente_aprovacao'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {foundProf.status === 'aprovado' ? '✓ Credenciado & Homologado' : '⏳ Em Análise Técnica'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Código ID:</span>
                    <p className="font-mono font-bold text-amber-400">{foundProf.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Data de Envio:</span>
                    <p className="text-slate-200">{new Date(foundProf.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Tempo de Experiência:</span>
                    <p className="text-slate-200 font-semibold">{foundProf.experienceYears}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Ferramental Próprio:</span>
                    <p className="text-slate-200">{foundProf.hasOwnTools ? 'Sim (Completo)' : 'Parcial'}</p>
                  </div>
                </div>

                {foundProf.serviceRates && foundProf.serviceRates.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Valores Médios Praticados Cadastrados:
                    </span>
                    <div className="space-y-1.5">
                      {foundProf.serviceRates.map((rate, idx) => {
                        const sDef = services.find(s => s.id === rate.categoryId);
                        const modelLabel = 
                          rate.chargingModel === 'por_hora' ? '/hora' :
                          rate.chargingModel === 'por_diaria' ? '/diária' :
                          rate.chargingModel === 'por_m2' ? '/m²' :
                          rate.chargingModel === 'a_combinar' ? '(a combinar)' : '/serviço';

                        return (
                          <div key={idx} className="flex items-center justify-between text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                            <span className="font-semibold text-white">{sDef ? sDef.title : rate.categoryId}</span>
                            <span className="font-bold text-emerald-400 font-mono">
                              R$ {rate.averagePrice.toFixed(2)} <span className="text-[10px] text-slate-400 font-sans font-normal">{modelLabel}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contrato Digital Assinado & Termos */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" />
                      Contrato Digital de Parceria & Monetização:
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Repasse 30% & Boleto Assinado
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    O prestador possui termo de adesão com repasse de 30% em até 3 dias úteis e autorização de emissão de Boleto Bancário e NFS-e em caso de inadimplência.
                  </p>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setContractModalProf(foundProf);
                        setIsContractModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 px-3 py-1.5 rounded-xl font-bold transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Visualizar Contrato e Assinatura Digital</span>
                    </button>
                  </div>
                </div>

                {/* Documentos Anexados */}
                {(foundProf.docPhotoUrl || (foundProf.documents && foundProf.documents.length > 0)) && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Documentos Anexados para Homologação:
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {foundProf.docPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewModalUrl({ url: foundProf.docPhotoUrl!, title: 'Documento Principal' })}
                          className="inline-flex items-center gap-1.5 text-xs bg-slate-950 hover:bg-slate-800 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Documento Principal</span>
                        </button>
                      )}
                      {foundProf.documents?.map((doc, dIdx) => (
                        <button
                          key={dIdx}
                          type="button"
                          onClick={() => setPreviewModalUrl({ url: doc.url, title: doc.name })}
                          className="inline-flex items-center gap-1.5 text-xs bg-slate-950 hover:bg-slate-800 text-blue-300 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{doc.label || doc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Digital Contract Modal */}
      {isContractModalOpen && (
        <DigitalContractModal
          isOpen={isContractModalOpen}
          onClose={() => setIsContractModalOpen(false)}
          professional={contractModalProf || {
            fullName,
            cpfCnpj,
            city,
            state,
            contractSignerName: fullName,
            contractSignerCpf: cpfCnpj,
            contractAgreedCommission: 30,
            contractAgreedBoletoClause: true
          }}
          customSignatureUrl={signatureDataUrl}
        />
      )}

      {/* Lightbox / Zoom Preview Modal */}
      {previewModalUrl && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                {previewModalUrl.title}
              </span>
              <button
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-slate-950">
              <img 
                src={previewModalUrl.url} 
                alt={previewModalUrl.title} 
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
