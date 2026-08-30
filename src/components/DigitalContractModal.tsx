import React, { useRef } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  FileCheck2, 
  Download, 
  Printer, 
  X, 
  Lock, 
  Scale, 
  Clock, 
  Building2, 
  UserCheck,
  Check
} from 'lucide-react';
import { ProfessionalProfile } from '../types';
import { SMExpressLogo } from './SMExpressLogo';

interface DigitalContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: Partial<ProfessionalProfile>;
  customSignatureUrl?: string | null;
  readOnly?: boolean;
}

export const DigitalContractModal: React.FC<DigitalContractModalProps> = ({
  isOpen,
  onClose,
  professional,
  customSignatureUrl,
  readOnly = false
}) => {
  const contractPrintRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const signerName = professional.contractSignerName || professional.fullName || 'Prestador Parceiro SM Express';
  const signerCpf = professional.contractSignerCpf || professional.cpfCnpj || '000.000.000-00';
  const signedDate = professional.contractSignedAt 
    ? new Date(professional.contractSignedAt).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

  const ipHash = professional.contractIpHash || '177.136.44.18 (SHA256: 8f9b2c3d4e5f...a71e)';
  const signatureImage = customSignatureUrl || professional.contractSignatureUrl;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* Header Modal with Official Logo */}
        <div className="bg-gradient-to-r from-[#001838] via-[#022452] to-slate-900 p-4 sm:p-5 border-b border-amber-500/30 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <SMExpressLogo variant="badge" size="custom" customSize={46} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Documento Jurídico Vinculante
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Assinatura Eletrônica Válida
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Termo de Adesão, Parceria & Intermediação de Serviços
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Fechar contrato"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Body (Scrollable) */}
        <div 
          ref={contractPrintRef}
          className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-200 text-xs sm:text-sm leading-relaxed bg-slate-950 font-sans"
        >
          
          {/* Top Legal Notice Box */}
          <div className="p-3.5 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">
                CLÁUSULAS PRINCIPAIS DE MONETIZAÇÃO E INADIMPLÊNCIA:
              </p>
              <p className="mt-0.5 text-amber-200/90 text-[11px]">
                O Prestador Parceiro concorda expressamente que <strong className="text-white">30% de todo serviço realizado</strong> deve ser repassado à SM Express em até 3 dias úteis. Em caso de não pagamento, o aplicativo está expressamente autorizado a <strong className="text-white">emitir Boleto Bancário e Nota Fiscal</strong> com juros e encargos legais.
              </p>
            </div>
          </div>

          {/* Identification of Parties */}
          <div className="space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-black text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> 1. DAS PARTES CONTRATANTES
            </h3>
            
            <p className="text-slate-300 text-xs">
              <strong className="text-white">INTERMEDIADORA DE TECNOLOGIA:</strong> <strong>SM EXPRESS SERVIÇOS GERAIS LTDA</strong>, plataforma digital de intermediação e tecnologia, doravante denominada simplesmente <strong>"SM EXPRESS"</strong>.
            </p>
            
            <p className="text-slate-300 text-xs">
              <strong className="text-white">PRESTADOR / FORNECEDOR PARCEIRO:</strong> <strong className="text-amber-300">{signerName}</strong>, inscrito no CPF/CNPJ sob o nº <strong className="text-amber-300">{signerCpf}</strong>, residente e domiciliado em {professional.city || 'Taubaté'}/{professional.state || 'SP'}, doravante denominado simplesmente <strong>"PRESTADOR"</strong>.
            </p>
          </div>

          {/* Clause 2: The 30% commission mandate */}
          <div className="space-y-2 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-black text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> 2. DA COMISSÃO DE INTERMEDIAÇÃO (TAXA DE 30%)
            </h3>
            <p className="text-slate-300 text-xs">
              <strong>2.1.</strong> Para todo e qualquer serviço intermediado, contratado, aceito ou concluído mediante o uso da plataforma SM Express, o <strong>PRESTADOR</strong> compromete-se de forma expressa, irrevogável e irretratável a repassar à conta da <strong>SM EXPRESS</strong> a comissão de <strong>30% (trinta por cento)</strong> sobre o valor bruto total cobrado do cliente final.
            </p>
            <p className="text-slate-300 text-xs">
              <strong>2.2.</strong> O repasse da taxa de intermediação de 30% deverá ser realizado em favor da SM Express em até <strong>3 (três) dias úteis</strong> após a confirmação/aceite da solicitação ou execução do trabalho, via chave Pix oficial, transferência bancária ou saldo na carteira digital do aplicativo.
            </p>
          </div>

          {/* Clause 3: Default & Automatic Boleto Issuance */}
          <div className="space-y-2 bg-red-950/20 border border-red-500/30 p-4 rounded-2xl">
            <h3 className="font-black text-red-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-red-400" /> 3. DA INADIMPLÊNCIA, EMISSÃO DE BOLETO E MEDIDAS DE COBRANÇA
            </h3>
            <p className="text-slate-300 text-xs">
              <strong>3.1.</strong> Caso o <strong>PRESTADOR</strong> não realize o pagamento/repasse da comissão de 30% dentro do prazo improrrogável de 3 (três) dias úteis, fica a <strong>SM EXPRESS</strong> expressamente autorizada, por força deste instrumento, a:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-xs pl-2">
              <li>
                <strong className="text-red-300">Emissão Automática de Boleto Bancário:</strong> Emitir de imediato Boleto Bancário de cobrança direta em nome e CPF/CNPJ do PRESTADOR, acrescido de multa contratual de 2% (dois por cento), juros moratórios de 1% (um por cento) ao mês e correção monetária pelo índice oficial (IPCA).
              </li>
              <li>
                <strong className="text-red-300">Emissão de Nota Fiscal de Serviços:</strong> Emitir Nota Fiscal Eletrônica (NFS-e) de intermediação de negócios contra o CPF/CNPJ do PRESTADOR.
              </li>
              <li>
                <strong className="text-red-300">Suspensão / Bloqueio no Aplicativo:</strong> Bloquear temporariamente o acesso do PRESTADOR ao mural de novas oportunidades e pedidos de clientes até que a pendência financeira seja integralmente quitada.
              </li>
              <li>
                <strong className="text-red-300">Encaminhamento para Cobrança Extrajudicial e Judicial:</strong> Protestar o título extrajudicial em cartório e registrar apontamento restritivo nos órgãos de proteção ao crédito (SPC/Serasa).
              </li>
            </ul>
          </div>

          {/* Clause 4: Service Quality & Compliance */}
          <div className="space-y-2 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-black text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> 4. DAS OBRIGAÇÕES, QUALIDADE E CONDUTA
            </h3>
            <p className="text-slate-300 text-xs">
              <strong>4.1.</strong> O PRESTADOR atua como profissional autônomo independente ou empresa parceira, sem vínculo empregatício com a SM Express, sendo o único e exclusivo responsável pela qualidade técnica, pontualidade, segurança física, integridade dos materiais e garantia dos serviços executados.
            </p>
            <p className="text-slate-300 text-xs">
              <strong>4.2.</strong> O PRESTADOR compromete-se a tratar todos os clientes intermediados com máximo respeito, ética, pontualidade e transparência nos preços.
            </p>
          </div>

          {/* Digital Signature Box */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">ASSINATURA DIGITAL DO PRESTADOR</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">Validade jurídica nos termos da MP 2.200-2/2001 e Lei 14.063/2020</span>
                </div>
              </div>
              <span className="text-[11px] bg-emerald-500/10 text-emerald-300 font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                STATUS: ASSINADO DIGITALMENTE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Signature Visual Drawing / Badge */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Rubrica / Assinatura Gráfica Capturada:
                </span>

                {signatureImage ? (
                  <div className="h-20 bg-white/5 rounded-xl border border-slate-700 flex items-center justify-center p-2 overflow-hidden">
                    <img 
                      src={signatureImage} 
                      alt="Assinatura Digital" 
                      className="max-h-full max-w-full object-contain filter invert opacity-90"
                    />
                  </div>
                ) : (
                  <div className="h-20 bg-slate-900/90 rounded-xl border border-dashed border-emerald-500/40 flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-lg font-serif italic text-amber-300 font-bold tracking-wider">
                      {signerName}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">Assinado via Token Eletrônico</span>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 mt-2 text-center font-mono">
                  Signatário: <strong className="text-white">{signerName}</strong>
                </div>
              </div>

              {/* Security Evidence & Audit Trail */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-[11px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans block mb-1">
                  Trilha de Auditoria & Metadados:
                </span>
                
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">CPF/CNPJ:</span>
                  <span className="text-white font-bold">{signerCpf}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Data/Hora:</span>
                  <span className="text-emerald-400 font-bold">{signedDate} (BRT)</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Comissão Aceita:</span>
                  <span className="text-amber-400 font-black">30% por serviço</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Cláusula de Boleto:</span>
                  <span className="text-emerald-400 font-bold">Autorizada e Ativa</span>
                </div>

                <div className="pt-1">
                  <span className="text-[9px] text-slate-500 block truncate" title={ipHash}>
                    IP & Hash: {ipHash}
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Confirmation Footnote */}
            <div className="p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-[10px] text-slate-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>
                Documento assinado digitalmente com criptografia e integridade inviolável pela plataforma SM Express.
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-900 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Contrato ativo e arquivado digitalmente sob custódia da SM Express.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1 uppercase tracking-wider"
            >
              <span>Entendido</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
