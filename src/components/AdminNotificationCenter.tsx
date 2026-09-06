import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Phone, 
  User, 
  Filter, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { 
  notificationService, 
  NotificationLogItem, 
  ADMIN_EMAIL, 
  ADMIN_WHATSAPP_FORMATTED,
  ADMIN_WHATSAPP_BACKUP_FORMATTED,
  ADMIN_WHATSAPP_BACKUP,
  ADMIN_WHATSAPP
} from '../services/notificationService';

export const AdminNotificationCenter: React.FC = () => {
  const [history, setHistory] = useState<NotificationLogItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);

  const refreshLogs = () => {
    setHistory(notificationService.getNotificationHistory());
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    if (window.confirm('Deseja realmente limpar o histórico de notificações deste navegador?')) {
      notificationService.clearHistory();
      refreshLogs();
    }
  };

  const handleTestWhatsApp = () => {
    const testMsg = 
`🔔 *TESTE DE INTEGRAÇÃO (OFICIAL) - SM EXPRESS*
Olá Administrador (*${ADMIN_EMAIL}*)!
Este é um teste de confirmação de recebimento de notificações no WhatsApp Oficial *${ADMIN_WHATSAPP_FORMATTED}*.
Sistema operacional e conectado com sucesso!`;
    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(testMsg)}`;
    notificationService.openWhatsApp(url);
    setTestSentMsg(`Disparado link de teste para o WhatsApp Oficial (${ADMIN_WHATSAPP_FORMATTED})!`);
    setTimeout(() => setTestSentMsg(null), 5000);
  };

  const handleTestWhatsAppBackup = () => {
    const testMsg = 
`🔔 *TESTE DE INTEGRAÇÃO (CANAL BACKUP) - SM EXPRESS*
Olá Administrador (*${ADMIN_EMAIL}*)!
Este é um teste de confirmação de recebimento de notificações no WhatsApp Backup *${ADMIN_WHATSAPP_BACKUP_FORMATTED}*.
Sistema operacional e conectado com sucesso!`;
    const url = `https://wa.me/${ADMIN_WHATSAPP_BACKUP}?text=${encodeURIComponent(testMsg)}`;
    notificationService.openWhatsApp(url);
    setTestSentMsg(`Disparado link de teste para o WhatsApp Backup (${ADMIN_WHATSAPP_BACKUP_FORMATTED})!`);
    setTimeout(() => setTestSentMsg(null), 5000);
  };

  const handleTestEmail = () => {
    const subject = `[SM Express] Teste de Notificação Automática para o Administrador`;
    const body = 
`Prezado Administrador,

Este é um teste de confirmação do canal de e-mail (${ADMIN_EMAIL}) para recebimento automático de orçamentos, respostas e movimentações de serviços na plataforma SM Express.

Administrador Cadastrado: ${ADMIN_EMAIL}
WhatsApp Oficial: ${ADMIN_WHATSAPP_FORMATTED}
WhatsApp Backup: ${ADMIN_WHATSAPP_BACKUP_FORMATTED}
Data/Hora: ${new Date().toLocaleString('pt-BR')}

Status: Operando Normalmente`;

    const mailto = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    notificationService.openEmail(mailto);
    setTestSentMsg(`Disparado teste para o E-mail do Administrador (${ADMIN_EMAIL})!`);
    setTimeout(() => setTestSentMsg(null), 5000);
  };

  const filteredHistory = history.filter(item => {
    if (typeFilter === 'todos') return true;
    return item.type === typeFilter;
  });

  const getTypeLabel = (type: NotificationLogItem['type']) => {
    switch (type) {
      case 'solicitacao_orcamento':
        return { label: 'Solicitação de Orçamento', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'resposta_orcamento':
        return { label: 'Orçamento Enviado', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'aprovacao_cliente':
        return { label: 'Aprovação do Cliente', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'mudanca_status':
        return { label: 'Movimentação / Status', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'novo_profissional':
        return { label: 'Novo Prestador', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'avaliacao_recebida':
        return { label: 'Avaliação Recebida', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      default:
        return { label: 'Notificação', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner: Configuração dos Canais do Administrador */}
      <div className="bg-[#001838] text-white p-6 rounded-3xl shadow-xl border border-amber-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest">
              <Bell className="w-4 h-4" />
              <span>Central de Disparo & Notificações em Tempo Real</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Notificações WhatsApp & E-mail do Administrador
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Toda nova solicitação de orçamento, envio de proposta ao cliente, aprovação de serviço ou mudança de status gera mensagens formatadas prontas para o WhatsApp e para o e-mail cadastrado.
            </p>
          </div>

          {/* Dados do Administrador Cadastrado */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2.5 text-xs min-w-[290px]">
            <div className="flex items-center gap-2 text-slate-400 font-bold border-b border-slate-800 pb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Canais de Destino Cadastrados</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> E-mail Adm:
              </span>
              <span className="font-mono text-white font-bold">{ADMIN_EMAIL}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Oficial:
              </span>
              <span className="font-mono text-emerald-300 font-bold">{ADMIN_WHATSAPP_FORMATTED}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> WhatsApp Backup:
              </span>
              <span className="font-mono text-slate-300 font-bold">{ADMIN_WHATSAPP_BACKUP_FORMATTED}</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação Imediata de Teste */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
          <button
            onClick={handleTestWhatsApp}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
            title={`Disparar teste para WhatsApp Oficial ${ADMIN_WHATSAPP_FORMATTED}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Testar WhatsApp Oficial {ADMIN_WHATSAPP_FORMATTED}</span>
          </button>

          <button
            onClick={handleTestWhatsAppBackup}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 shadow-md flex items-center gap-2 transition-transform active:scale-95"
            title={`Disparar teste para WhatsApp Backup ${ADMIN_WHATSAPP_BACKUP_FORMATTED}`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Testar Backup {ADMIN_WHATSAPP_BACKUP_FORMATTED}</span>
          </button>

          <button
            onClick={handleTestEmail}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
            title={`Disparar teste para E-mail ${ADMIN_EMAIL}`}
          >
            <Mail className="w-4 h-4" />
            <span>Testar E-mail {ADMIN_EMAIL}</span>
          </button>

          <button
            onClick={refreshLogs}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="px-3 py-2.5 bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 text-xs font-bold rounded-xl border border-slate-700 hover:border-red-800/60 flex items-center gap-1.5 transition-colors ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Histórico</span>
            </button>
          )}
        </div>

        {testSentMsg && (
          <div className="mt-3 p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{testSentMsg}</span>
          </div>
        )}
      </div>

      {/* Seletor de Filtro de Notificações */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-amber-500" />
          <span>Filtrar por Tipo:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'todos', label: 'Todas as Notificações' },
            { id: 'solicitacao_orcamento', label: 'Solicitações' },
            { id: 'resposta_orcamento', label: 'Orçamentos Enviados' },
            { id: 'aprovacao_cliente', label: 'Aprovações' },
            { id: 'mudanca_status', label: 'Status' },
            { id: 'novo_profissional', label: 'Prestadores' },
            { id: 'avaliacao_recebida', label: 'Avaliações' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                typeFilter === tab.id
                  ? 'bg-[#001838] text-amber-400 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Histórico de Disparos */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7" />
            </div>
            <h4 className="text-base font-black text-slate-800">
              Nenhuma notificação registrada ainda
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Assim que um cliente solicitar um orçamento, o admin enviar um valor ou o status mudar, as notificações aparecerão aqui com link direto para o WhatsApp ({ADMIN_WHATSAPP_FORMATTED}) e e-mail ({ADMIN_EMAIL}).
            </p>
          </div>
        ) : (
          filteredHistory.map(item => {
            const typeInfo = getTypeLabel(item.type);
            return (
              <div 
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleString('pt-BR')}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.2 rounded">
                      DISPARADO
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span>WhatsApp Oficial: <strong className="text-slate-800">{item.adminWhatsApp}</strong></span>
                    {item.adminWhatsAppBackup && (
                      <>
                        <span>•</span>
                        <span>Backup: <strong className="text-slate-700">{item.adminWhatsAppBackup}</strong></span>
                      </>
                    )}
                    <span>•</span>
                    <span>E-mail Adm: <strong className="text-slate-800">{item.adminEmail}</strong></span>
                    {item.clientWhatsApp && (
                      <>
                        <span>•</span>
                        <span>WhatsApp Cliente: <strong className="text-slate-800">{item.clientWhatsApp}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* Botões de Ação para o Item */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-shrink-0">
                  <a
                    href={item.whatsappUrlAdmin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    title={`Abrir WhatsApp Oficial do Administrador (${ADMIN_WHATSAPP_FORMATTED})`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Oficial</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  {item.whatsappUrlAdminBackup && (
                    <a
                      href={item.whatsappUrlAdminBackup}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                      title={`Abrir WhatsApp Backup do Administrador (${ADMIN_WHATSAPP_BACKUP_FORMATTED})`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Backup</span>
                    </a>
                  )}

                  <a
                    href={item.mailtoUrlAdmin}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                    title={`Enviar e-mail para ${ADMIN_EMAIL}`}
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                    <span>E-mail Adm</span>
                  </a>

                  {item.whatsappUrlClient && (
                    <a
                      href={item.whatsappUrlClient}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Abrir WhatsApp com o Cliente"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>WhatsApp Cliente</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
