export type ServiceCategory = 
  | 'limpeza_piscinas'
  | 'manutencao_residencial'
  | 'limpeza_terrenos'
  | 'limpeza_residencial'
  | 'montagem_moveis'
  | 'fretes_mudancas'
  | 'limpeza_caixa_agua'
  | 'pequenos_reparos'
  | 'servicos_condominios'
  | 'venda_cortinas_persianas'
  | 'servicos_solda'
  | 'portas_portoes_chaveiro'
  | 'interfone_instalacao'
  | 'cercas_eletricas'
  | 'cameras_seguranca'
  | 'outros_servicos';

export interface ServiceDefinition {
  id: ServiceCategory;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  color: string;
  fields: {
    label: string;
    type: 'select' | 'text' | 'number' | 'radio';
    options?: string[];
    placeholder?: string;
  }[];
}

export type RequestStatus = 
  | 'pendente_orcamento' // Waiting for admin quote
  | 'orcamento_recebido' // Admin sent quote, waiting client approval
  | 'aprovado'           // Client approved, scheduled
  | 'em_execucao'        // In progress
  | 'concluido'          // Finished, pending rating
  | 'avaliado'           // Rated
  | 'cancelado';

export interface ServiceRequest {
  id: string;
  serviceId: ServiceCategory;
  serviceTitle: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  
  // Specific details
  details: Record<string, string>;
  frequency?: string; // e.g. Semanal, Avulso
  desiredDate: string;
  
  // Address
  cep?: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  photoUrl?: string; // foto principal (compatibilidade)
  photos?: string[]; // até 5 fotos do local/problema
  googleMapsUrl?: string; // link direto do Google Maps
  
  // Status & Budget
  status: RequestStatus;
  createdAt: string;
  
  // Quote details set by Admin
  quotedPrice?: number;
  estimatedHours?: string;
  assignedProfessional?: string;
  adminNotes?: string;
  scheduledDate?: string;
  
  // Rating given by Client
  rating?: {
    stars: number;
    comment: string;
    createdAt: string;
  };
}

export interface AdminMetrics {
  totalSolicitacoes: number;
  totalOrcamentos: number;
  totalAgendamentos: number;
  totalFaturamento: number;
}

export interface MonthlyChartData {
  period: string;
  solicitacoes: number;
  orcamentos: number;
  faturamento: number;
}

export interface ServiceDistributionData {
  name: string;
  value: number;
  color: string;
}

export type ProfessionalStatus = 'pendente_aprovacao' | 'aprovado' | 'em_analise' | 'rejeitado';

export interface ServiceRate {
  categoryId: ServiceCategory;
  averagePrice: number; // Valor médio cobrado
  chargingModel: 'por_hora' | 'por_servico' | 'por_diaria' | 'por_m2' | 'a_combinar';
  description?: string; // Observação sobre o que inclui
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'rg_cnh' | 'comprovante_endereco' | 'certificado_curso' | 'cartao_cnpj' | 'outro';
  label: string;
  url: string;
  uploadedAt: string;
  sizeFormatted?: string;
}

export interface ProfessionalProfile {
  id: string;
  fullName: string;
  cpfCnpj: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  cep?: string;
  neighborhood?: string;
  categories: ServiceCategory[];
  serviceRates?: ServiceRate[]; // Valor médio cobrado por tipo de serviço
  experienceYears: string;
  hasVehicle: boolean;
  hasOwnTools: boolean;
  status: ProfessionalStatus;
  createdAt: string;
  rating: number;
  completedJobs: number;
  photoUrl?: string;
  photo3x4Url?: string; // Foto 3/4 oficial para ID de Acesso e Crachá Digital
  docPhotoUrl?: string;
  documents?: DocumentItem[]; // Documentos anexados pelo fornecedor (RG, CNH, MEI, etc.)
  notes?: string;

  // Contrato Digital & Repasse de 30%
  contractSigned?: boolean;
  contractSignedAt?: string;
  contractSignatureUrl?: string;
  contractSignerName?: string;
  contractSignerCpf?: string;
  contractIpHash?: string;
  contractAgreedCommission?: number; // Ex: 30%
  contractAgreedBoletoClause?: boolean; // Autorização de emissão de boleto em caso de inadimplência
}

export type UserRole = 'cliente' | 'profissional' | 'admin';
export type UserAccountStatus = 'ativo' | 'inativo' | 'bloqueado' | 'pendente';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password?: string;
  avatarUrl?: string;
  photo3x4Url?: string; // Foto 3/4 oficial para ID de Acesso
  cpfCnpj?: string;
  rg?: string;
  birthDate?: string;
  gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer';
  
  // Endereço Completo
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  
  // Metadados & Gestão
  status: UserAccountStatus;
  isCompleteRegistration?: boolean;
  notes?: string;
  totalRequests?: number;
  totalSpent?: number;
  lastAccess?: string;
  createdAt: string;
}

// =========================================================================
// TIPOS DA PLATAFORMA DE PAGAMENTOS & COMISSÕES (30%)
// =========================================================================

export type PaymentStatus = 
  | 'pendente' 
  | 'pago' 
  | 'atrasado' 
  | 'boleto_emitido' 
  | 'nf_emitida' 
  | 'bloqueado' 
  | 'cancelado';

export type PaymentMethod = 'pix' | 'cartao_credito' | 'boleto' | 'saldo_carteira';

export interface CommissionCharge {
  id: string;
  requestId: string;
  serviceTitle: string;
  professionalId: string;
  professionalName: string;
  professionalCpfCnpj: string;
  professionalPhone: string;
  professionalEmail?: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  serviceValue: number; // Ex: R$ 100,00
  commissionPercent: number; // 30%
  commissionValue: number; // Ex: R$ 30,00
  status: PaymentStatus;
  createdAt: string;
  dueDate: string; // 3 dias úteis
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  pixCopiaCola?: string;
  pixQrCodeUrl?: string;
  boletoLinhaDigitavel?: string;
  boletoCodigoBarras?: string;
  boletoUrl?: string;
  nfseNumero?: string;
  nfseChaveAcesso?: string;
  nfseEmissaoData?: string;
  lateFeePercent?: number; // Multa 2%
  monthlyInterestPercent?: number; // Juros 1% a.m.
  totalChargedValue?: number;
  blockedAt?: string;
  notes?: string;
}

export interface PaymentGatewaySettings {
  activeProvider: 'asaas' | 'mercadopago' | 'iugu' | 'pagarme' | 'banco_inter';
  companyName: string;
  companyTradeName: string;
  companyCnpj: string;
  companyAddress: string;
  pixKey: string;
  pixKeyType: 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  commissionRate: number; // 30%
  daysToPay: number; // 3 dias úteis
  autoBlockAfterDays: number; // 4 dias úteis
  autoIssueBoleto: boolean;
  autoIssueNfse: boolean;
  finePercent: number; // 2%
  monthlyInterestRate: number; // 1%
  environment: 'sandbox' | 'production';
  apiKeyMasked: string;
  webhookUrl: string;
  webhookSecretMasked: string;
}
