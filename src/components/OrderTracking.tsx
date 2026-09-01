import React, { useState } from 'react';
import { ServiceRequest, UserAccount } from '../types';
import { 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  UserCheck, 
  Calendar, 
  MapPin, 
  Star, 
  MessageCircle, 
  AlertCircle,
  ThumbsUp,
  FileCheck,
  ExternalLink,
  X,
  Camera,
  Trash2,
  Lock,
  UserPlus,
  LogIn,
  ShieldCheck
} from 'lucide-react';

interface OrderTrackingProps {
  requests: ServiceRequest[];
  currentUser?: UserAccount | null;
  onApproveQuote: (id: string) => void;
  onOpenReviewModal: (req: ServiceRequest) => void;
  onNewRequestClick: () => void;
  onDeleteRequest?: (id: string) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  requests,
  currentUser,
  onApproveQuote,
  onOpenReviewModal,
  onNewRequestClick,
  onDeleteRequest,
  onOpenAuth
}) => {
  const [previewZoomPhoto, setPreviewZoomPhoto] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // If user is not logged in, enforce privacy gate
  if (!currentUser) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-[#001838] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-500/30 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-amber-400/20 text-amber-400 border border-amber-400/40 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              Área Restrita & Individual
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              Acompanhamento Seguro de Pedidos
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Para garantir a privacidade e segurança dos seus dados, o histórico de solicitações, orçamentos recebidos e acompanhamento de execução só ficam visíveis para a sua conta.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth?.('register')}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 uppercase tracking-wider transition-all transform hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Meu Cadastro</span>
            </button>

            <button
              onClick={() => onOpenAuth?.('login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Já Tenho Conta • Entrar</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dados 100% protegidos com criptografia</span>
          </div>
        </div>
      </div>
    );
  }

  // Filter requests strictly for this user (or show all if admin)
  const userRequests = currentUser.role === 'admin'
    ? requests
    : requests.filter(r => {
        const cleanUserPhone = currentUser.phone?.replace(/\D/g, '') || '';
        const cleanReqPhone = r.clientPhone?.replace(/\D/g, '') || '';
        const emailMatch = r.clientEmail && currentUser.email && r.clientEmail.toLowerCase() === currentUser.email.toLowerCase();
        const phoneMatch = cleanUserPhone && cleanReqPhone && (cleanUserPhone === cleanReqPhone || cleanReqPhone.includes(cleanUserPhone) || cleanUserPhone.includes(cleanReqPhone));
        const nameMatch = r.clientName && currentUser.name && r.clientName.toLowerCase() === currentUser.name.toLowerCase();
        return emailMatch || phoneMatch || nameMatch;
      });

  const getStatusBadge = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'pendente_orcamento':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
            Analisando Orçamento
          </span>
        );
      case 'orcamento_recebido':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
            <DollarSign className="w-3.5 h-3.5 text-blue-700" />
            Orçamento Recebido!
          </span>
        );
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Aprovado & Agendado
          </span>
        );
      case 'em_execucao':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold px-2.5 py-1 rounded-full">
            <UserCheck className="w-3.5 h-3.5 text-purple-700" />
            Em Execução
          </span>
        );
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Serviço Concluído
          </span>
        );
      case 'avaliado':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            Avaliado ★★★★★
          </span>
        );
      default:
        return null;
    }
  };

  const getGoogleMapsUrl = (req: ServiceRequest) => {
    if (req.googleMapsUrl) return req.googleMapsUrl;
    const query = [
      req.street, 
      req.number, 
      req.neighborhood, 
      req.city, 
      req.state, 
      req.cep ? `CEP ${req.cep}` : '', 
      'Brasil'
    ].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#001838] text-white p-4 sm:p-5 rounded-2xl shadow-xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Acompanhamento dos Meus Pedidos
          </h2>
        </div>
      </div>

      {/* Orders List */}
      {userRequests.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#001838]">Você ainda não tem solicitações</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Escolha um dos nossos serviços e solicite um orçamento rápido e sem compromisso.
          </p>
          <div className="pt-2">
            <button
              onClick={onNewRequestClick}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow transition-all"
            >
              Fazer Primeira Solicitação
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {userRequests.map((req) => {
            const requestPhotos = req.photos && req.photos.length > 0 
              ? req.photos 
              : req.photoUrl 
                ? [req.photoUrl] 
                : [];

            return (
              <div 
                key={req.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group/card"
              >
                
                {/* Card Top Header */}
                <div className="bg-slate-50 px-3.5 sm:px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-[11px] sm:text-xs font-black text-slate-900 bg-slate-200 px-2 py-0.5 sm:py-1 rounded-md">
                      {req.id}
                    </span>
                    <span className="font-extrabold text-xs sm:text-sm text-[#001838] uppercase">
                      {req.serviceTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {getStatusBadge(req.status)}
                    {onDeleteRequest && (
                      confirmDeleteId === req.id ? (
                        <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-0.5 rounded-lg ml-1 animate-fadeIn">
                          <button
                            onClick={() => {
                              onDeleteRequest(req.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded shadow-sm transition-colors flex items-center gap-1 touch-target justify-center"
                            title="Confirmar exclusão agora"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Confirmar?</span>
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-1 text-slate-500 hover:text-slate-700 text-[11px] font-semibold hover:bg-slate-200/60 rounded transition-colors touch-target flex items-center justify-center"
                            title="Cancelar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(req.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-lg transition-colors border border-red-200/80 ml-1 shadow-sm active:scale-95 cursor-pointer touch-target justify-center"
                          title="Excluir item / Cancelar solicitação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remover</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 sm:p-5 space-y-4">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs text-slate-600">
                    
                    {/* Left Column: Details & Address */}
                    <div className="space-y-2.5">
                      
                      {/* Address with Google Maps link */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-800">Endereço do Local: </span>
                              <div className="text-slate-700 leading-snug break-words">
                                {req.street}, {req.number} {req.complement ? `(${req.complement})` : ''} - {req.neighborhood}, {req.city}/{req.state} {req.cep ? `- CEP ${req.cep}` : ''}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-end">
                          <a
                            href={getGoogleMapsUrl(req)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-blue-600" />
                            <span>🗺️ Abrir no Google Maps</span>
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-1">
                        <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <div className="leading-snug">
                          <span className="font-bold text-slate-800">Data Preferencial: </span>
                          {req.desiredDate} {req.frequency ? `(${req.frequency})` : ''}
                        </div>
                      </div>

                      {/* Dynamic Specs */}
                      {Object.entries(req.details).length > 0 && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-700 text-[11px] block uppercase tracking-wider">
                            Especificações do Serviço:
                          </span>
                          {Object.entries(req.details).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-[11px] py-0.5 border-b border-slate-100 last:border-0 gap-2">
                              <span className="text-slate-500 font-medium">{k}:</span>
                              <span className="font-semibold text-slate-800 text-right">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Photo preview gallery & Quote Details */}
                    <div className="space-y-3">
                      
                      {/* Photos Gallery (up to 5 photos) */}
                      {requestPhotos.length > 0 && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-amber-600" />
                              <span>Fotos Anexadas do Local</span>
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full font-mono">
                              {requestPhotos.length} foto(s)
                            </span>
                          </div>

                          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-1.5 pt-1">
                            {requestPhotos.map((pUrl, pIdx) => (
                              <div
                                key={pIdx}
                                onClick={() => setPreviewZoomPhoto(pUrl)}
                                className="relative rounded-lg overflow-hidden border border-slate-300 aspect-square cursor-pointer group bg-slate-900"
                                title="Clique para ampliar"
                              >
                                <img
                                  src={pUrl}
                                  alt={`Foto ${pIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center font-bold">
                                  #{pIdx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-[9px] text-slate-400 italic text-right">Clique na foto para ampliar</p>
                        </div>
                      )}

                      {/* QUOTE SECTION (If admin sent quote) */}
                      {req.quotedPrice !== undefined && (
                        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 space-y-2 shadow-sm">
                          <div className="flex justify-between items-center flex-wrap gap-1">
                            <span className="text-xs font-black text-amber-900 uppercase">Orçamento do Profissional</span>
                            <span className="text-lg sm:text-xl font-black text-amber-800">
                              R$ {req.quotedPrice.toFixed(2).replace('.', ',')}
                            </span>
                          </div>

                          {req.estimatedHours && (
                            <p className="text-slate-700 text-[11px]">
                              ⏱️ <strong>Tempo Estimado:</strong> {req.estimatedHours}
                            </p>
                          )}

                          {req.assignedProfessional && (
                            <p className="text-slate-700 text-[11px]">
                              👤 <strong>Profissional Responsável:</strong> {req.assignedProfessional}
                            </p>
                          )}

                          {req.scheduledDate && (
                            <p className="text-slate-700 text-[11px]">
                              📅 <strong>Data Agendada:</strong> {req.scheduledDate}
                            </p>
                          )}

                          {req.adminNotes && (
                            <p className="text-slate-600 text-[11px] italic bg-white/80 p-2 rounded border border-amber-200">
                              "{req.adminNotes}"
                            </p>
                          )}
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Rating Display if already rated */}
                  {req.rating && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{req.rating.stars}.0</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 block">Sua Avaliação:</span>
                        <p className="text-slate-600 italic">"{req.rating.comment}"</p>
                      </div>
                    </div>
                  )}

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    
                    {/* WhatsApp Support Links (Both Phone Numbers) */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 mr-1 hidden xs:inline">Suporte:</span>
                      <a
                        href={`https://wa.me/5512992555104?text=Ol%C3%A1,%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20meu%20pedido%20${encodeURIComponent(req.id)}%20(${encodeURIComponent(req.serviceTitle)}).`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-300 transition-colors touch-target justify-center"
                        title="Atendimento via WhatsApp (12) 99255-5104"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>(12) 99255-5104</span>
                      </a>

                      <a
                        href={`https://wa.me/5512991601322?text=Ol%C3%A1,%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20meu%20pedido%20${encodeURIComponent(req.id)}%20(${encodeURIComponent(req.serviceTitle)}).`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-300 transition-colors touch-target justify-center"
                        title="Atendimento via WhatsApp (12) 99160-1322"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>(12) 99160-1322</span>
                      </a>
                    </div>

                    {/* Actions according to status */}
                    <div className="flex items-center gap-2">
                      
                      {req.status === 'orcamento_recebido' && (
                        <button
                          id={`approve-quote-${req.id}`}
                          onClick={() => onApproveQuote(req.id)}
                          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-xs rounded-xl shadow-md hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-1.5 uppercase touch-target"
                        >
                          <ThumbsUp className="w-4 h-4 flex-shrink-0" />
                          <span>APROVAR ORÇAMENTO & AGENDAR</span>
                        </button>
                      )}

                      {(req.status === 'aprovado' || req.status === 'em_execucao' || req.status === 'concluido') && !req.rating && (
                        <button
                          id={`review-btn-${req.id}`}
                          onClick={() => onOpenReviewModal(req)}
                          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 uppercase touch-target"
                        >
                          <Star className="w-4 h-4 fill-slate-950 flex-shrink-0" />
                          <span>AVALIAR O SERVIÇO</span>
                        </button>
                      )}

                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {previewZoomPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewZoomPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
            <button
              onClick={() => setPreviewZoomPhoto(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewZoomPhoto}
              alt="Foto ampliada"
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

    </div>
  );
};
