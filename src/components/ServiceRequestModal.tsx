import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ServiceDefinition, ServiceRequest, UserAccount, ServiceCategory } from '../types';
import { 
  X, 
  Calendar, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  Send, 
  Trash2, 
  Plus, 
  AlertCircle, 
  Phone, 
  User, 
  Sparkles,
  Bot
} from 'lucide-react';
import { ServiceIcon } from './ServiceIcon';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceDefinition | null;
  allServices: ServiceDefinition[];
  onSubmitRequest: (newReq: ServiceRequest) => void;
  currentUser?: UserAccount | null;
  initialDescription?: string;
}

// Normalizer to ignore accents and case
const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

interface CategoryRule {
  id: ServiceCategory;
  keywords: string[];
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    id: 'limpeza_piscinas',
    keywords: [
      'piscina', 'piscinas', 'piscineiro', 'cloro', 'ph', 'aspirar', 'algicida',
      'decantador', 'bomba da piscina', 'filtro da piscina', 'alvenaria de piscina',
      'vinil piscina', 'fibra piscina', 'borda da piscina', 'agua verde', 'cristalina', 'piscina suja'
    ]
  },
  {
    id: 'limpeza_caixa_agua',
    keywords: [
      'caixa dagua', 'caixa d agua', 'caixa de agua', 'reservatorio', 'reservatorio de agua',
      'cisterna', 'castelo dagua', 'castelo d agua', 'higienizacao de caixa', 'desinfeccao de caixa'
    ]
  },
  {
    id: 'limpeza_terrenos',
    keywords: [
      'terreno', 'terrenos', 'lote', 'lotes', 'mato', 'capina', 'capinagem', 'capinar', 'rocar', 'rocagem',
      'rocadeira', 'roçadeira', 'entulho', 'entulhos', 'poda de arvore', 'poda de galho',
      'galho', 'galhos', 'cortar arvore', 'limpar terreno', 'chacara', 'descarte de mato', 'rocada'
    ]
  },
  {
    id: 'montagem_moveis',
    keywords: [
      'montar', 'montagem', 'desmontar', 'desmontagem', 'montador', 'guarda roupa', 'guarda-roupa',
      'armario', 'armarios', 'rack', 'painel de tv', 'painel tv', 'estante', 'cama', 'beliche', 'comoda',
      'gaveteiro', 'mesa com cadeiras', 'moveis', 'movel planejado', 'roupeiro', 'gaveta'
    ]
  },
  {
    id: 'fretes_mudancas',
    keywords: [
      'frete', 'fretes', 'mudanca', 'mudancas', 'carreto', 'carretos', 'transporte de moveis',
      'caminhao', 'van de frete', 'levar sofa', 'levar geladeira', 'carregar e descarregar',
      'mudanca residencial', 'mudanca comercial', 'buscar carga', 'ajudante de frete'
    ]
  },
  {
    id: 'venda_cortinas_persianas',
    keywords: [
      'cortina', 'cortinas', 'persiana', 'persianas', 'blackout', 'rolo', 'romana',
      'persiana horizontal', 'persiana vertical', 'trilho suico', 'varao de cortina',
      'conserto de persiana', 'troca de corda de persiana', 'lavagem de persiana', 'persiana de madeira'
    ]
  },
  {
    id: 'servicos_solda',
    keywords: [
      'solda', 'soldador', 'soldagem', 'serralheiro', 'serralheria', 'soldar', 'portao quebrado',
      'grade de ferro', 'grades', 'corrimao de ferro', 'corrimão', 'estrutura metalica',
      'reforco de ferro', 'solda mig', 'solda eletrica', 'soldar portao'
    ]
  },
  {
    id: 'portas_portoes_chaveiro',
    keywords: [
      'portao basculante', 'portao deslizante', 'roldana', 'roldanas', 'trilho do portao',
      'motor de portao', 'fechadura', 'fechaduras', 'chaveiro', 'chave emperrada', 'chave quebrada',
      'porta raspando', 'porta travando', 'trocar miolo', 'fechadura tetra', 'macaneta', 'conserto de portao'
    ]
  },
  {
    id: 'interfone_instalacao',
    keywords: [
      'interfone', 'interfones', 'interfonia', 'video porteiro', 'porteiro eletronico',
      'fechadura digital', 'fechadura eletronica', 'interfone sem audio', 'consertar interfone',
      'instalar interfone', 'interfonia coletiva'
    ]
  },
  {
    id: 'cercas_eletricas',
    keywords: [
      'cerca eletrica', 'cerca elétrica', 'concertina', 'eletrificador', 'choque do muro',
      'big haste', 'arame farpado', 'central de choque', 'seguranca perimetral', 'reparo cerca'
    ]
  },
  {
    id: 'cameras_seguranca',
    keywords: [
      'camera', 'cameras', 'cftv', 'dvr', 'nvr', 'camera wifi', 'camera ip', 'gravador de camera',
      'monitoramento', 'camera de seguranca', 'visao noturna', 'camera offline', 'cabo de camera'
    ]
  },
  {
    id: 'servicos_condominios',
    keywords: [
      'condominio', 'condominios', 'predio', 'predios', 'zeladoria', 'hall de entrada',
      'area comum', 'portaria predial', 'manutencao predial', 'sindico', 'conservacao predial'
    ]
  },
  {
    id: 'limpeza_residencial',
    keywords: [
      'faxina', 'faxineira', 'diarista', 'limpeza pesada', 'pos obra', 'pos-obra', 'pós obra',
      'limpeza residencial', 'limpar casa', 'limpar apartamento', 'lavar piso', 'lavagem de vidros',
      'higienizacao residencial', 'faxina completa'
    ]
  },
  {
    id: 'pequenos_reparos',
    keywords: [
      'pequeno reparo', 'pequenos reparos', 'furar parede', 'pendurar quadro', 'suporte de tv',
      'suporte tv', 'varal de teto', 'silicone na pia', 'rejunte', 'colocar espelho', 'prateleira'
    ]
  },
  {
    id: 'manutencao_residencial',
    keywords: [
      'tomada', 'tomadas', 'chuveiro', 'eletricista', 'eletrica', 'elétrica', 'disjuntor',
      'quadro de disjuntores', 'fio', 'fiacao', 'fiação', 'curto circuito', 'lampada', 'lampadas',
      'ventilador de teto', 'vazamento', 'cano', 'hidraulica', 'hidráulica', 'torneira',
      'encanador', 'sifao', 'sifão', 'registro de agua', 'troca de resistencia', 'pintura',
      'pintor', 'reparo', 'instalacao eletrica', 'instalacao hidraulica'
    ]
  }
];

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  service,
  allServices,
  onSubmitRequest,
  currentUser,
  initialDescription = ''
}) => {
  if (!isOpen) return null;

  const [description, setDescription] = useState(initialDescription || '');
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-detect category from description
  const detectedService = useMemo<ServiceDefinition>(() => {
    const rawText = description.trim();
    if (!rawText) {
      return service || allServices[0];
    }

    const norm = normalizeText(rawText);

    let bestCategory: ServiceCategory | null = null;
    let maxMatches = 0;

    for (const rule of CATEGORY_RULES) {
      let score = 0;
      for (const kw of rule.keywords) {
        const normKw = normalizeText(kw);
        if (norm.includes(normKw)) {
          score += normKw.length > 5 ? 2 : 1; // Long phrases give stronger confidence
        }
      }

      if (score > maxMatches) {
        maxMatches = score;
        bestCategory = rule.id;
      }
    }

    if (bestCategory && maxMatches > 0) {
      const match = allServices.find(s => s.id === bestCategory);
      if (match) return match;
    }

    // Default fallback to the provided service or general service
    return service || allServices.find(s => s.id === 'outros_servicos') || allServices[0];
  }, [description, service, allServices]);

  // Main Simple Fields
  const [clientName, setClientName] = useState(currentUser?.name || 'Rudson Silva');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '(12) 99876-5432');
  const [locationAddress, setLocationAddress] = useState(
    currentUser?.street 
      ? `${currentUser.street}, ${currentUser.number || '123'} - ${currentUser.neighborhood || 'Centro'}, ${currentUser.city || 'Taubaté'}` 
      : 'Jardim América, Taubaté - SP'
  );
  const [desiredDate, setDesiredDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [urgency] = useState<'normal' | 'urgente' | 'fim_de_semana'>('normal');

  // Photos State (up to 3 photos, optional)
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phone Mask
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  // Photos handling
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - photos.length;
    if (remainingSlots <= 0) {
      alert('Limite máximo de 3 fotos atingido.');
      return;
    }

    const filesToRead: File[] = (Array.from(files) as File[]).slice(0, remainingSlots);
    const newLoadedPhotos: string[] = [];

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          newLoadedPhotos.push(uploadEvent.target.result as string);
          if (newLoadedPhotos.length === filesToRead.length) {
            setPhotos(prev => [...prev, ...newLoadedPhotos].slice(0, 3));
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Por favor, descreva o que você precisa.';
    }

    if (!clientName.trim() || clientName.trim().length < 3) {
      newErrors.clientName = 'Informe seu nome completo.';
    }

    const cleanPhone = clientPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.clientPhone = 'Informe um WhatsApp com DDD válido.';
    }

    if (!locationAddress.trim()) {
      newErrors.locationAddress = 'Informe o bairro e cidade onde será o serviço.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Split address smoothly
    const addressParts = locationAddress.split(',');
    const mainStreet = addressParts[0]?.trim() || locationAddress;
    const rest = addressParts.slice(1).join(',').trim() || 'Taubaté - SP';

    const fullMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationAddress + ', Brasil')}`;

    const newRequest: ServiceRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: detectedService.id,
      serviceTitle: detectedService.title,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: currentUser?.email || 'cliente@smexpress.com.br',
      details: {
        'Descrição do Pedido': description.trim(),
        'Urgência': urgency === 'urgente' ? 'Urgente / Imediato' : urgency === 'fim_de_semana' ? 'Fim de Semana' : 'Normal / Flexível'
      },
      frequency: 'Avulso',
      desiredDate: desiredDate,
      street: mainStreet,
      number: 'S/N',
      neighborhood: rest,
      city: 'Taubaté',
      state: 'SP',
      photoUrl: photos[0] || undefined,
      photos: photos,
      googleMapsUrl: fullMapsUrl,
      status: 'pendente_orcamento',
      createdAt: new Date().toISOString()
    };

    onSubmitRequest(newRequest);
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Header (Dynamically synchronized with the detected category) */}
        <div className="bg-[#001838] text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-500/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${detectedService.color} text-white shadow-md flex-shrink-0 transition-all duration-300`}>
              <ServiceIcon name={detectedService.iconName} className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Orçamento Rápido
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight transition-all duration-300">
                {detectedService.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Validation Error Alert */}
              {Object.keys(errors).length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Preencha os campos obrigatórios em destaque abaixo.</span>
                </div>
              )}

              {/* 1. Free text problem description (Automatic AI Interpretation) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                  <span>O que você precisa que seja feito? <span className="text-red-500">*</span></span>
                  {errors.description && <span className="text-[10px] text-red-600 font-semibold">Obrigatório</span>}
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                  }}
                  placeholder="Ex: Preciso de troca de 2 tomadas, instalação de ventilador de teto e revisão no quadro de disjuntores..."
                  className={`w-full p-3 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-colors resize-none ${
                    errors.description ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                  }`}
                />

                {/* Intelligent Auto-detection feedback pill */}
                <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 animate-pulse" />
                  <span className="truncate">
                    Categoria interpretada: <strong className="font-black text-[#001838]">{detectedService.title}</strong>
                  </span>
                </div>
              </div>

              {/* 2. Name & WhatsApp (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Seu Nome Completo <span className="text-red-500">*</span></span>
                    {errors.clientName && <span className="text-[10px] text-red-600 font-semibold">Obrigatório</span>}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        if (errors.clientName) setErrors(prev => ({ ...prev, clientName: '' }));
                      }}
                      placeholder="Ex: João da Silva"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none ${
                        errors.clientName ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>WhatsApp / Celular <span className="text-red-500">*</span></span>
                    {errors.clientPhone && <span className="text-[10px] text-red-600 font-semibold">Obrigatório</span>}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={clientPhone}
                      onChange={(e) => {
                        setClientPhone(formatPhone(e.target.value));
                        if (errors.clientPhone) setErrors(prev => ({ ...prev, clientPhone: '' }));
                      }}
                      placeholder="(12) 99999-9999"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none ${
                        errors.clientPhone ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Location & Preferred Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Bairro / Endereço <span className="text-red-500">*</span></span>
                    {errors.locationAddress && <span className="text-[10px] text-red-600 font-semibold">Obrigatório</span>}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={locationAddress}
                      onChange={(e) => {
                        setLocationAddress(e.target.value);
                        if (errors.locationAddress) setErrors(prev => ({ ...prev, locationAddress: '' }));
                      }}
                      placeholder="Ex: Jardim América, Taubaté"
                      className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none ${
                        errors.locationAddress ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Data Desejada
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={desiredDate}
                      onChange={(e) => setDesiredDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Optional Photos (Max 3) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Fotos do Local ou Problema <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  {photos.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Foto</span>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFilesUpload}
                />

                {photos.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-sm group">
                        <img src={photo} alt="Foto anexada" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-slate-300 hover:border-amber-400 rounded-xl p-3 text-center bg-slate-50 hover:bg-amber-50/30 cursor-pointer transition-colors flex items-center justify-center gap-2 text-xs text-slate-500 font-medium"
                  >
                    <Camera className="w-4 h-4 text-amber-500" />
                    <span>Clique aqui se desejar anexar fotos do local ou defeito</span>
                  </div>
                )}
              </div>

              {/* Submit CTA Button */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 uppercase tracking-wider transition-all transform hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Pedido de Orçamento</span>
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  🔒 Seus dados são confidenciais e utilizados apenas para a cotação do serviço.
                </p>
              </div>

            </form>
          ) : (
            /* Success Screen */
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-black text-[#001838]">
                Solicitação Enviada com Sucesso!
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Pronto, <strong className="text-slate-900">{clientName}</strong>! Os profissionais credenciados da SM Express já estão analisando sua solicitação para enviar o orçamento no seu WhatsApp.
              </p>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs space-y-1.5 text-amber-900 shadow-sm">
                <div className="font-bold flex items-center justify-between border-b border-amber-200/80 pb-1">
                  <span className="uppercase tracking-wider">RESUMO DO PEDIDO</span>
                  <span className="bg-amber-300 text-amber-950 px-2 py-0.5 rounded font-black text-[10px]">
                    EM ANÁLISE
                  </span>
                </div>
                <p>• <strong>Serviço Identificado:</strong> {detectedService.title}</p>
                <p>• <strong>WhatsApp:</strong> {clientPhone}</p>
                <p>• <strong>Local:</strong> {locationAddress}</p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    onClose();
                  }}
                  className="w-full py-3.5 bg-[#001838] text-amber-400 hover:bg-[#022a5c] font-black text-sm rounded-xl uppercase tracking-wider shadow-lg transition-all"
                >
                  OK • ACOMPANHAR MEUS PEDIDOS
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

