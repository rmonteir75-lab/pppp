import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Building2, 
  Phone, 
  User, 
  ArrowRight, 
  Printer, 
  ExternalLink,
  DollarSign,
  Lock,
  Sparkles
} from 'lucide-react';
import { CommissionCharge, PaymentMethod } from '../types';
import { SMExpressLogo } from './SMExpressLogo';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  charge: CommissionCharge;
  onPaymentSuccess: (chargeId: string, method: PaymentMethod) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  charge,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedBoleto, setCopiedBoleto] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(charge.status === 'pago');

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState(charge.professionalName.toUpperCase());
  const [cardExpiry, setCardExpiry] = useState('11/29');
  const [cardCvv, setCardCvv] = useState('789');
  const [installments, setInstallments] = useState('1');

  if (!isOpen) return null;

  const pixKeyFallback = charge.pixCopiaCola || `00020126580014br.gov.bcb.pix013654892311000190520400005303986540${charge.commissionValue.toFixed(2)}5802BR5925SM EXPRESS SERVICOS GERA6007TAUBATE62150511COM${charge.id.replace(/\D/g, '')}6304E8A2`;
  const qrCodeUrl = charge.pixQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixKeyFallback)}`;
  const boletoLinha = charge.boletoLinhaDigitavel || `07790.00116 12849.025008 00000.${charge.id.replace(/\D/g, '').padEnd(6, '0')} 8 9580000000${Math.round(charge.commissionValue * 100)}`;
  const boletoBarcode = charge.boletoCodigoBarras || `077989580000000${Math.round(charge.commissionValue * 100)}000111284902500000000${charge.id.replace(/\D/g, '')}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKeyFallback);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleCopyBoleto = () => {
    navigator.clipboard.writeText(boletoLinha);
    setCopiedBoleto(true);
    setTimeout(() => setCopiedBoleto(false), 2500);
  };

  const handleConfirmPayment = (method: PaymentMethod) => {
    setIsProcessing(false);
    setIsSuccess(true);
    onPaymentSuccess(charge.id, method);
  };

  const handlePrintBoleto = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header with Official Logo */}
        <div className="bg-[#001838] text-white p-5 flex items-center justify-between border-b border-amber-400/20">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <SMExpressLogo variant="badge" size="custom" customSize={44} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  Gateway SM Express
                </span>
                <span className="text-[10px] text-slate-300 font-mono">Fatura #{charge.id}</span>
              </div>
              <h3 className="text-lg font-black text-white">
                Plataforma de Pagamento da Comissão (30%)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Success Screen if Paid */}
          {isSuccess ? (
            <div className="text-center py-6 space-y-4 animate-scaleUp">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ✓ Pagamento Confirmado com Sucesso
                </span>
                <h4 className="text-2xl font-black text-slate-900 mt-2">
                  Comissão de R$ {charge.commissionValue.toFixed(2)} Liquidada!
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  A intermediação deste serviço foi aprovada. Os dados completos de contato do cliente foram liberados.
                </p>
              </div>

              {/* Unlocked Client Card */}
              <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 text-left max-w-lg mx-auto space-y-2.5">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 fill-amber-400" />
                    Contato do Cliente Liberado:
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                    Acesso Imediato
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Nome do Cliente:</span>
                    <strong className="text-sm font-black text-slate-900">{charge.clientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">WhatsApp / Celular:</span>
                    <a
                      href={`https://wa.me/55${charge.clientPhone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(charge.clientName)},%20sou%20${encodeURIComponent(charge.professionalName)}%20da%20SM%20Express%20a%20respeito%20do%20seu%20servi%C3%A7o%20de%20${encodeURIComponent(charge.serviceTitle)}.`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-black hover:underline flex items-center gap-1 text-sm bg-emerald-100/60 px-2 py-1 rounded-lg border border-emerald-300 w-fit"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{charge.clientPhone}</span>
                    </a>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500 text-[10px] block font-semibold">Endereço do Chamado:</span>
                    <span className="font-bold text-slate-800">{charge.clientAddress}</span>
                  </div>
                </div>
              </div>

              {charge.nfseNumero && (
                <div className="text-[11px] text-slate-500 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Nota Fiscal de Serviço Eletrônica gerada: <strong>{charge.nfseNumero}</strong></span>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-[#001838] hover:bg-[#002a60] text-white font-black text-xs rounded-xl shadow-lg transition-colors uppercase tracking-wider"
                >
                  Fechar Checkout
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Service & Commission Summary Header Box */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Serviço Realizado</span>
                    <strong className="text-sm font-black text-slate-900">{charge.serviceTitle}</strong>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Vencimento (3 dias úteis)</span>
                    <span className="text-xs font-bold text-amber-700 flex items-center sm:justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {new Date(charge.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Valor do Serviço</span>
                    <strong className="text-xs sm:text-sm font-bold text-slate-800">
                      R$ {charge.serviceValue.toFixed(2)}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Taxa SM Express</span>
                    <strong className="text-xs sm:text-sm font-bold text-slate-800">
                      {charge.commissionPercent}%
                    </strong>
                  </div>
                  <div className="bg-amber-400/20 p-2.5 rounded-xl border border-amber-400/60">
                    <span className="text-[10px] text-amber-900 font-extrabold uppercase block">Comissão a Pagar</span>
                    <strong className="text-sm sm:text-base font-black text-amber-950">
                      R$ {charge.commissionValue.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Selecione a Forma de Pagamento da Comissão:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('pix')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'pix'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md font-black ring-2 ring-emerald-400/30'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 font-bold'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-xs">Pix Instantâneo</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      selectedMethod === 'pix' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Liberação na Hora
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('cartao_credito')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'cartao_credito'
                        ? 'bg-[#001838] text-white border-[#001838] shadow-md font-black ring-2 ring-blue-400/30'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 font-bold'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs">Cartão de Crédito</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      selectedMethod === 'cartao_credito' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                    }`}>
                      Até 6x
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('boleto')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedMethod === 'boleto'
                        ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md font-black ring-2 ring-amber-400/40'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 font-bold'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span className="text-xs">Boleto Bancário</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                      selectedMethod === 'boleto' ? 'bg-slate-950/10 text-slate-950' : 'bg-amber-100 text-amber-900'
                    }`}>
                      3 Dias Úteis
                    </span>
                  </button>
                </div>
              </div>

              {/* METHOD 1: PIX INSTANTÂNEO */}
              {selectedMethod === 'pix' && (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Visual QR Code */}
                    <div className="bg-white p-3 rounded-2xl border border-emerald-300 shadow-sm flex-shrink-0 flex flex-col items-center gap-1">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code Pix SM Express"
                        className="w-36 h-36 object-contain"
                      />
                      <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Pix Banco Central
                      </span>
                    </div>

                    {/* Pix Instructions & Copy Key */}
                    <div className="space-y-3 flex-1 text-xs">
                      <div>
                        <h5 className="font-extrabold text-slate-900 text-sm">
                          Como pagar via Pix:
                        </h5>
                        <ol className="list-decimal list-inside text-slate-600 space-y-1 mt-1 text-[11px] leading-relaxed">
                          <li>Abra o app do seu banco ou carteira digital.</li>
                          <li>Escolha a opção <strong>Pagar com Pix QR Code</strong> ou <strong>Copia e Cola</strong>.</li>
                          <li>Escaneie a imagem ou cole o código abaixo.</li>
                          <li>Confirme o valor exato de <strong>R$ {charge.commissionValue.toFixed(2)}</strong>.</li>
                        </ol>
                      </div>

                      {/* Pix Key Box */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Chave Pix Copia e Cola:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            readOnly
                            value={pixKeyFallback}
                            className="bg-white border border-slate-300 rounded-xl p-2 font-mono text-[10px] text-slate-700 flex-1 truncate select-all focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 flex-shrink-0 shadow-sm"
                          >
                            {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Beneficiary info */}
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-1">
                    <span>Beneficiário: <strong>SM Express Serviços Gerais LTDA</strong></span>
                    <span>CNPJ: <strong>54.892.311/0001-90</strong></span>
                    <span>Instituição: <strong>Banco Inter (077)</strong></span>
                  </div>

                  {/* Confirm Webhook Payment Button */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleConfirmPayment('pix')}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                    <span>Confirmar Pagamento Pix Instantâneo</span>
                  </button>
                </div>
              )}

              {/* METHOD 2: CARTÃO DE CRÉDITO */}
              {selectedMethod === 'cartao_credito' && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      Pagamento Seguro Criptografado (PCI-DSS)
                    </span>
                    <span className="text-[10px] text-slate-500">Aceitamos Visa, Mastercard, Elo, Hipercard</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Número do Cartão</label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome Impresso no Cartão</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="NOME COMO NO CARTÃO"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Validade (MM/AA)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/AA"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">CVV / Código</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Opções de Parcelamento</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="1">1x de R$ {charge.commissionValue.toFixed(2)} (sem juros)</option>
                        <option value="2">2x de R$ {(charge.commissionValue / 2).toFixed(2)} (sem juros)</option>
                        <option value="3">3x de R$ {(charge.commissionValue / 3).toFixed(2)} (sem juros)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleConfirmPayment('cartao_credito')}
                    className="w-full py-3.5 bg-[#001838] hover:bg-[#002a60] text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pagar R$ {charge.commissionValue.toFixed(2)} no Cartão</span>
                  </button>
                </div>
              )}

              {/* METHOD 3: BOLETO BANCÁRIO REGISTRADO */}
              {selectedMethod === 'boleto' && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-4 animate-fadeIn">
                  
                  {/* Authentic Boleto Preview Card */}
                  <div className="bg-white rounded-2xl border-2 border-slate-900 p-4 space-y-3 font-mono text-xs shadow-sm">
                    {/* Bank Top Bar */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-orange-600 font-sans">Banco Inter</span>
                        <span className="border-l-2 border-r-2 border-slate-900 px-2 font-black text-sm">077-9</span>
                      </div>
                      <span className="font-bold text-[11px] text-slate-800 truncate select-all">{boletoLinha}</span>
                    </div>

                    {/* Boleto Grid Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-700 border-b border-slate-200 pb-2">
                      <div>
                        <span className="text-slate-400 block">Beneficiário:</span>
                        <strong className="text-slate-900 font-sans">SM Express Serviços LTDA</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Agência / Código:</span>
                        <strong>0001-9 / 1284902-5</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Vencimento:</span>
                        <strong className="text-amber-800">{new Date(charge.dueDate).toLocaleDateString('pt-BR')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Valor do Documento:</span>
                        <strong className="text-slate-900 text-xs font-sans">R$ {charge.commissionValue.toFixed(2)}</strong>
                      </div>
                    </div>

                    {/* Pagador / Sacado */}
                    <div className="text-[10px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block">Pagador (Prestador de Serviço):</span>
                      <div className="font-sans font-bold text-slate-900">{charge.professionalName} • CPF/CNPJ: {charge.professionalCpfCnpj}</div>
                      <div className="text-slate-500 font-sans">Contrato Digital de Parceria SM Express • Repasse de 30%</div>
                    </div>

                    {/* Barcode representation */}
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <div className="h-10 bg-slate-900 flex items-center justify-center text-white text-[10px] tracking-widest font-mono select-none">
                        ||| | |||| || | ||||| |||| || | ||| |||| | ||||| || ||| ||||
                      </div>
                      <span className="text-[9px] text-slate-400 block text-center truncate">{boletoBarcode}</span>
                    </div>
                  </div>

                  {/* Actions for Boleto */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleCopyBoleto}
                      className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {copiedBoleto ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedBoleto ? 'Linha Copiada!' : 'Copiar Linha Digitável'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintBoleto}
                      className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir / Salvar PDF</span>
                    </button>
                  </div>

                  {/* Confirm Boleto Payment */}
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleConfirmPayment('boleto')}
                    className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    Confirmar Pagamento do Boleto Bancário
                  </button>
                </div>
              )}

              {/* Legal Note & Automated Debt Policy */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[10px] text-slate-500 leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Aviso de Compliance & Segurança Jurídica:</strong> Conforme Cláusula do Termo de Adesão e Parceria assinado digitalmente, caso o repasse de 30% não ocorra até o 3º dia útil, o sistema emitirá automaticamente cobrança bancária com incidência de multa de 2% e juros de 1% a.m., com eventual bloqueio cautelar da conta do prestador.
                </div>
              </div>
            </>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Transação protegida e auditada pela SM Express
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
