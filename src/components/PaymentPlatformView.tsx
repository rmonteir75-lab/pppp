import React, { useState } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  QrCode, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send, 
  Search, 
  Filter, 
  Download, 
  Settings, 
  ShieldAlert, 
  RefreshCw, 
  Building2, 
  ArrowUpRight, 
  ExternalLink,
  Lock,
  Plus,
  Scale,
  Sparkles,
  Check,
  Ban,
  Printer
} from 'lucide-react';
import { CommissionCharge, PaymentGatewaySettings, PaymentMethod, PaymentStatus, ProfessionalProfile } from '../types';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';
import { SMExpressLogo } from './SMExpressLogo';

interface PaymentPlatformViewProps {
  charges: CommissionCharge[];
  professionals: ProfessionalProfile[];
  gatewaySettings: PaymentGatewaySettings;
  onUpdateChargeStatus: (chargeId: string, status: PaymentStatus, method?: PaymentMethod) => void;
  onIssueBoletoAndNfse: (chargeId: string) => void;
  onBlockProfessional: (profId: string) => void;
  onSaveGatewaySettings: (settings: PaymentGatewaySettings) => void;
}

export const PaymentPlatformView: React.FC<PaymentPlatformViewProps> = ({
  charges,
  professionals,
  gatewaySettings,
  onUpdateChargeStatus,
  onIssueBoletoAndNfse,
  onBlockProfessional,
  onSaveGatewaySettings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | PaymentStatus>('todos');
  const [selectedChargeForCheckout, setSelectedChargeForCheckout] = useState<CommissionCharge | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Gateway Settings local editing state
  const [currentGateway, setCurrentGateway] = useState<PaymentGatewaySettings>(gatewaySettings);

  // Financial Metrics Calculation
  const totalCommissionRevenue = charges.reduce((acc, c) => acc + (c.status === 'pago' ? c.commissionValue : 0), 0);
  const totalPendingCommission = charges.reduce((acc, c) => acc + (c.status === 'pendente' ? c.commissionValue : 0), 0);
  const totalOverdueCommission = charges.reduce((acc, c) => acc + (['atrasado', 'boleto_emitido', 'bloqueado'].includes(c.status) ? (c.totalChargedValue || c.commissionValue) : 0), 0);
  const totalServiceGross = charges.reduce((acc, c) => acc + c.serviceValue, 0);

  const paidCount = charges.filter(c => c.status === 'pago').length;
  const pendingCount = charges.filter(c => c.status === 'pendente').length;
  const overdueCount = charges.filter(c => ['atrasado', 'boleto_emitido', 'bloqueado'].includes(c.status)).length;

  // Filter charges
  const filteredCharges = charges.filter(charge => {
    const matchesSearch = 
      charge.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.professionalCpfCnpj.includes(searchTerm) ||
      charge.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || charge.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleTriggerWhatsAppReminder = (charge: CommissionCharge) => {
    const cleanPhone = charge.professionalPhone.replace(/\D/g, '');
    const isOverdue = ['atrasado', 'boleto_emitido', 'bloqueado'].includes(charge.status);
    
    const msg = isOverdue
      ? `🚨 *SM EXPRESS - COBRANÇA DE COMISSÃO EM ATRASO*\n\nOlá *${charge.professionalName}*,\nIdentificamos que o repasse de 30% referente ao serviço *${charge.serviceTitle}* (Fatura #${charge.id}) está vencido.\n\n*Valor com juros/multa:* R$ ${(charge.totalChargedValue || charge.commissionValue).toFixed(2)}\n*Linha Digitável do Boleto:* ${charge.boletoLinhaDigitavel || 'Disponível no App'}\n\nEvite o bloqueio definitivo do seu cadastro regularizando o pagamento via Pix ou Boleto.`
      : `📋 *SM EXPRESS - LEMBRETE DE COMISSÃO (30%)*\n\nOlá *${charge.professionalName}*,\nLembramos que o repasse de 30% (R$ ${charge.commissionValue.toFixed(2)}) referente ao serviço *${charge.serviceTitle}* vence em *${new Date(charge.dueDate).toLocaleDateString('pt-BR')}*.\n\n*Chave Pix Copia e Cola:* ${charge.pixCopiaCola || 'pix@smexpress.com.br'}\n\nAgradecemos a parceria!`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/55${cleanPhone}?text=${encoded}`, '_blank');

    setActionSuccessMsg(`Cobrança via WhatsApp enviada para ${charge.professionalName}!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleExecuteDebtAutomation = (charge: CommissionCharge) => {
    onIssueBoletoAndNfse(charge.id);
    setActionSuccessMsg(`Automação de cobrança executada: Boleto Registrado e NFS-e emitidos para ${charge.professionalName}!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Serviço', 'Profissional', 'CPF/CNPJ', 'Cliente', 'Valor Serviço (R$)', 'Comissão 30% (R$)', 'Status', 'Vencimento', 'Data Pagamento', 'Meio Pagamento'];
    const rows = filteredCharges.map(c => [
      c.id,
      `"${c.serviceTitle}"`,
      `"${c.professionalName}"`,
      `"${c.professionalCpfCnpj}"`,
      `"${c.clientName}"`,
      c.serviceValue.toFixed(2),
      c.commissionValue.toFixed(2),
      c.status,
      new Date(c.dueDate).toLocaleDateString('pt-BR'),
      c.paidAt ? new Date(c.paidAt).toLocaleDateString('pt-BR') : '-',
      c.paymentMethod || '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sm_express_comissoes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGatewaySettings(currentGateway);
    setIsSettingsOpen(false);
    setActionSuccessMsg('Configurações da Plataforma de Pagamento salvas com sucesso!');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Banner: Financial Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-[#001838] to-slate-900 border border-amber-400/30 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 drop-shadow-xl">
              <SMExpressLogo variant="badge" size="custom" customSize={68} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Módulo Financeiro Oficial
                </span>
                <span className="text-xs text-amber-300 font-bold">Repasse de 30% por Serviço</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Plataforma de Pagamentos & Gateway SM Express
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                Gestão automatizada de cobrança de comissões, integração com gateways bancários (Pix, Cartão e Boleto), régua de inadimplência e emissão de NFS-e.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              <span>Configurar Gateway</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 uppercase"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Relatório</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Alert Toast */}
      {actionSuccessMsg && (
        <div className="bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl font-black text-xs flex items-center justify-between shadow-lg animate-scaleUp">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-slate-950 hover:opacity-80">✕</button>
        </div>
      )}

      {/* Financial KPIs 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Comissões Recebidas (30%) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Comissões Liquidadas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            R$ {totalCommissionRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>{paidCount} repasses quitados</span>
            <span className="text-emerald-600 font-bold">100% repassado</span>
          </div>
        </div>

        {/* KPI 2: Comissões a Receber (Em Prazo de 3 Dias) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">A Receber (No Prazo)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700">
            R$ {totalPendingCommission.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>{pendingCount} ordens ativas</span>
            <span className="text-blue-600 font-bold">Prazo de 3 dias</span>
          </div>
        </div>

        {/* KPI 3: Inadimplência / Boletos Emitidos */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inadimplência / Boletos</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-700">
            R$ {totalOverdueCommission.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>{overdueCount} em cobrança</span>
            <span className="text-red-600 font-bold">Multa 2% + Juros</span>
          </div>
        </div>

        {/* KPI 4: Volume Bruto Transacionado */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Volume de Serviços</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            R$ {totalServiceGross.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>{charges.length} serviços gerados</span>
            <span className="text-amber-800 font-bold">30% SM Express</span>
          </div>
        </div>

      </div>

      {/* Main Table: Charges & Commission Tracking */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        
        {/* Table Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Fila de Repasses e Cobranças de Comissão (30%)
            </h3>
            <p className="text-xs text-slate-500">
              Controle individual de faturas geradas por cada serviço aceito pelos prestadores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por profissional, CPF, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-amber-400 focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="pago">✓ Quitados (Pago)</option>
              <option value="pendente">⏳ Pendentes (No Prazo)</option>
              <option value="atrasado">⚠️ Atrasados</option>
              <option value="boleto_emitido">📄 Boleto / NFS-e Emitido</option>
              <option value="bloqueado">🚫 Bloqueados</option>
            </select>
          </div>
        </div>

        {/* Charges Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Fatura / Pedido</th>
                <th className="py-3 px-3">Profissional / Parceiro</th>
                <th className="py-3 px-3">Cliente & Serviço</th>
                <th className="py-3 px-3 text-right">Valor Serviço</th>
                <th className="py-3 px-3 text-right">Comissão (30%)</th>
                <th className="py-3 px-3 text-center">Vencimento</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Ações do Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCharges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-2">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">Nenhuma fatura de comissão registrada no momento</p>
                      <p className="text-[11px] text-slate-500">
                        As faturas de comissão de 30% são geradas automaticamente pelo sistema à medida que os profissionais aceitam e executam serviços homologados.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCharges.map((charge) => {
                  const isOverdue = ['atrasado', 'boleto_emitido', 'bloqueado'].includes(charge.status);

                  return (
                    <tr key={charge.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {charge.id}
                        <span className="block text-[10px] text-slate-400 font-normal">{charge.requestId}</span>
                      </td>

                      {/* Professional */}
                      <td className="py-3.5 px-3">
                        <strong className="text-slate-900 font-bold block">{charge.professionalName}</strong>
                        <span className="text-[10px] text-slate-500 font-mono block">CPF: {charge.professionalCpfCnpj}</span>
                        <span className="text-[10px] text-slate-400 block">{charge.professionalPhone}</span>
                      </td>

                      {/* Client & Service */}
                      <td className="py-3.5 px-3">
                        <strong className="text-slate-800 block">{charge.serviceTitle}</strong>
                        <span className="text-[10px] text-slate-500 block">Cliente: {charge.clientName}</span>
                      </td>

                      {/* Gross Service Value */}
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-700">
                        R$ {charge.serviceValue.toFixed(2)}
                      </td>

                      {/* Commission (30%) */}
                      <td className="py-3.5 px-3 text-right">
                        <strong className="text-sm font-black text-slate-950">
                          R$ {charge.commissionValue.toFixed(2)}
                        </strong>
                        {charge.totalChargedValue && charge.totalChargedValue > charge.commissionValue && (
                          <span className="block text-[10px] text-red-600 font-bold">
                            + Multa/Juros: R$ {charge.totalChargedValue.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-xs font-semibold ${isOverdue ? 'text-red-700 font-bold' : 'text-slate-700'}`}>
                          {new Date(charge.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                        {charge.paidAt && (
                          <span className="block text-[10px] text-emerald-600 font-mono">
                            Pago {new Date(charge.paidAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-3 text-center">
                        {charge.status === 'pago' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Pago ({charge.paymentMethod?.toUpperCase() || 'PIX'})
                          </span>
                        ) : charge.status === 'pendente' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Clock className="w-3 h-3 text-blue-600" />
                            No Prazo (3 dias)
                          </span>
                        ) : charge.status === 'boleto_emitido' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <FileText className="w-3 h-3 text-amber-600" />
                            Boleto + NFS-e
                          </span>
                        ) : charge.status === 'bloqueado' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                            <Ban className="w-3 h-3 text-red-600" />
                            Bloqueado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {charge.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Open Interactive Checkout */}
                          <button
                            type="button"
                            onClick={() => setSelectedChargeForCheckout(charge)}
                            className="px-2.5 py-1.5 bg-[#001838] hover:bg-[#002a60] text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                            title="Abrir Gateway de Pagamento (Pix / Cartão / Boleto)"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                            <span>Efetuar Pagamento</span>
                          </button>

                          {/* WhatsApp Reminder */}
                          <button
                            type="button"
                            onClick={() => handleTriggerWhatsAppReminder(charge)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg transition-colors"
                            title="Cobrar via WhatsApp com link/chave Pix"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Trigger Automated Debt Policy (Boleto + NFS-e) if pending/overdue */}
                          {charge.status !== 'pago' && charge.status !== 'boleto_emitido' && (
                            <button
                              type="button"
                              onClick={() => handleExecuteDebtAutomation(charge)}
                              className="px-2 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                              title="Executar automação: Emitir Boleto Bancário + NFS-e contra o prestador"
                            >
                              <FileText className="w-3 h-3 text-amber-700" />
                              <span>Emitir Boleto</span>
                            </button>
                          )}

                          {/* Manual Clearance Toggle */}
                          {charge.status !== 'pago' && (
                            <button
                              type="button"
                              onClick={() => onUpdateChargeStatus(charge.id, 'pago', 'pix')}
                              className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors"
                              title="Dar baixa manual (marcar como pago)"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Automated Inadimplência & Rule Engine Flow Explanatory Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-extrabold text-white">
              Régua Automatizada de Cobrança e Gestão de Inadimplência (30%)
            </h4>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
            Conforme Termo de Adesão Assinado
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">Passo 1 • D0</span>
            <strong className="text-sm font-bold text-white block">Aceite do Serviço</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              O prestador envia proposta ou clica em interesse. O sistema gera automaticamente a fatura de 30% e o QR Code Pix dinâmico.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block">Passo 2 • D+2</span>
            <strong className="text-sm font-bold text-white block">Lembrete Amigável</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Disparo automático de notificação no WhatsApp e app alertando sobre o prazo de quitação do repasse da SM Express.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider block">Passo 3 • D+3</span>
            <strong className="text-sm font-bold text-white block">Vencimento Legal</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Último dia para pagamento da comissão sem encargos via Pix, Cartão ou Boleto Bancário.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-red-500/40 space-y-1.5">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-wider block">Passo 4 • D+4</span>
            <strong className="text-sm font-bold text-white block">Automação de Inadimplência</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              1. Bloqueio automático do cadastro.<br />
              2. Emissão de Boleto Registrado com multa de 2% e juros de 1% a.m.<br />
              3. Emissão de NFS-e de intermediação contra o prestador.
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CHECKOUT / GATEWAY DE PAGAMENTO */}
      {/* ========================================================================= */}
      {selectedChargeForCheckout && (
        <PaymentCheckoutModal
          isOpen={!!selectedChargeForCheckout}
          onClose={() => setSelectedChargeForCheckout(null)}
          charge={selectedChargeForCheckout}
          onPaymentSuccess={(chargeId, method) => {
            onUpdateChargeStatus(chargeId, 'pago', method);
            setActionSuccessMsg(`Comissão #${chargeId} liquidada com sucesso via ${method.toUpperCase()}!`);
            setTimeout(() => setActionSuccessMsg(null), 4000);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIGURAÇÕES DO GATEWAY DE PAGAMENTO */}
      {/* ========================================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-[#001838] text-white p-5 flex items-center justify-between border-b border-amber-400/20">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Configurações do Gateway de Pagamento</h3>
                  <p className="text-[11px] text-slate-300">Integração bancária e parâmetros de comissão SM Express</p>
                </div>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveSettingsSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Provedor de Gateway Ativo</label>
                <select
                  value={currentGateway.activeProvider}
                  onChange={(e) => setCurrentGateway({ ...currentGateway, activeProvider: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="asaas">Asaas (Cobranças Pix, Boletos e Cartão)</option>
                  <option value="mercadopago">Mercado Pago Gateway</option>
                  <option value="iugu">Iugu Instituição de Pagamento</option>
                  <option value="pagarme">Pagar.me / Stone</option>
                  <option value="banco_inter">Banco Inter PJ (API Pix e Boleto Direto)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Razão Social SM Express</label>
                  <input
                    type="text"
                    value={currentGateway.companyName}
                    onChange={(e) => setCurrentGateway({ ...currentGateway, companyName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CNPJ da Empresa</label>
                  <input
                    type="text"
                    value={currentGateway.companyCnpj}
                    onChange={(e) => setCurrentGateway({ ...currentGateway, companyCnpj: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chave Pix Oficial</label>
                  <input
                    type="text"
                    value={currentGateway.pixKey}
                    onChange={(e) => setCurrentGateway({ ...currentGateway, pixKey: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Taxa de Comissão Padrão (%)</label>
                  <input
                    type="number"
                    value={currentGateway.commissionRate}
                    onChange={(e) => setCurrentGateway({ ...currentGateway, commissionRate: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prazo para Repasse (Dias Úteis)</label>
                  <input
                    type="number"
                    value={currentGateway.daysToPay}
                    onChange={(e) => setCurrentGateway({ ...currentGateway, daysToPay: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Multa por Atraso (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentGateway.finePercent}
                    onChange={(e) => setCurrentGateway({ ...currentGateway, finePercent: parseFloat(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 block text-xs">Regras de Inadimplência Automática:</span>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentGateway.autoIssueBoleto}
                    onChange={(e) => setCurrentGateway({ ...currentGateway, autoIssueBoleto: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Emitir automaticamente Boleto Registrado + Multa no 4º dia útil</span>
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentGateway.autoIssueNfse}
                    onChange={(e) => setCurrentGateway({ ...currentGateway, autoIssueNfse: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>Emitir automaticamente Nota Fiscal de Serviços (NFS-e) contra o prestador</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#001838] hover:bg-[#002a60] text-white font-black rounded-xl shadow-md uppercase tracking-wider"
                >
                  Salvar Parâmetros
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
