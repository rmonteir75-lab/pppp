import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  ServiceRequest, 
  ProfessionalProfile, 
  CommissionCharge, 
  UserAccount, 
  PaymentGatewaySettings,
  ServiceCategory
} from '../types';

export const supabaseService = {
  isConfigured: () => isSupabaseConfigured,

  // --- SERVICE REQUESTS ---
  async getServiceRequests(): Promise<ServiceRequest[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        serviceId: (item.category_id || 'outros_servicos') as ServiceCategory,
        serviceTitle: item.category_title || 'Serviço',
        clientName: item.client_name || '',
        clientPhone: item.phone || '',
        clientEmail: item.whatsapp || '',
        details: item.description ? { Descrição: item.description } : {},
        desiredDate: item.scheduled_date || item.created_at,
        street: item.address || '',
        number: '',
        neighborhood: '',
        city: item.city || 'Taubaté',
        state: item.state || 'SP',
        status: item.status || 'pendente_orcamento',
        createdAt: item.created_at || new Date().toISOString(),
        quotedPrice: item.quoted_price ? Number(item.quoted_price) : undefined,
        estimatedHours: item.estimated_hours,
        assignedProfessional: item.assigned_professional,
        adminNotes: item.admin_notes,
        scheduledDate: item.scheduled_date,
        rating: item.rating ? {
          stars: item.rating,
          comment: item.client_feedback || '',
          createdAt: item.updated_at || item.created_at
        } : undefined
      }));
    } catch {
      return [];
    }
  },

  async upsertServiceRequest(req: ServiceRequest): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const payload = {
        id: req.id,
        client_name: req.clientName,
        phone: req.clientPhone,
        whatsapp: req.clientEmail,
        address: `${req.street || ''} ${req.number || ''} ${req.neighborhood || ''}`.trim() || req.street,
        city: req.city,
        state: req.state,
        category_id: req.serviceId,
        category_title: req.serviceTitle,
        description: Object.entries(req.details || {}).map(([k, v]) => `${k}: ${v}`).join(' | ') || req.serviceTitle,
        status: req.status,
        quoted_price: req.quotedPrice,
        estimated_hours: req.estimatedHours,
        assigned_professional: req.assignedProfessional,
        scheduled_date: req.scheduledDate || req.desiredDate,
        admin_notes: req.adminNotes,
        rating: req.rating?.stars,
        client_feedback: req.rating?.comment
      };

      const { error } = await supabase.from('service_requests').upsert(payload);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  async deleteServiceRequest(id: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('service_requests').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  // --- PROFESSIONALS ---
  async getProfessionals(): Promise<ProfessionalProfile[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        fullName: item.full_name || '',
        cpfCnpj: item.cpf_cnpj || '',
        phone: item.phone || '',
        email: item.email || '',
        city: item.city || 'Taubaté',
        state: item.state || 'SP',
        cep: item.zip_code,
        neighborhood: item.neighborhood,
        categories: (item.sub_categories || [item.main_category || 'outros_servicos']) as ServiceCategory[],
        experienceYears: String(item.experience_years || '1'),
        hasVehicle: Boolean(item.has_vehicle ?? true),
        hasOwnTools: Boolean(item.has_own_tools ?? true),
        status: item.status || 'pendente_aprovacao',
        rating: Number(item.rating) || 5.0,
        completedJobs: item.completed_services || 0,
        createdAt: item.created_at || new Date().toISOString(),
        photo3x4Url: item.photo_3x4_url,
        photoUrl: item.photo_url || item.photo_3x4_url,
        notes: item.bio,
        contractSigned: Boolean(item.digital_signature),
        contractSignedAt: item.created_at,
        contractAgreedBoletoClause: item.contract_agreed_boleto_clause
      }));
    } catch {
      return [];
    }
  },

  async upsertProfessional(prof: ProfessionalProfile): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const payload = {
        id: prof.id,
        full_name: prof.fullName,
        trade_name: prof.fullName,
        cpf_cnpj: prof.cpfCnpj,
        phone: prof.phone,
        whatsapp: prof.phone,
        email: prof.email,
        zip_code: prof.cep,
        neighborhood: prof.neighborhood,
        city: prof.city,
        state: prof.state,
        main_category: prof.categories[0] || 'outros_servicos',
        sub_categories: prof.categories,
        experience_years: parseInt(prof.experienceYears, 10) || 1,
        bio: prof.notes,
        photo_3x4_url: prof.photo3x4Url,
        terms_accepted: true,
        background_check_agreed: true,
        contract_agreed_boleto_clause: prof.contractAgreedBoletoClause ?? true,
        digital_signature: prof.contractSigned ? 'Assinado Digitalmente' : undefined,
        status: prof.status,
        rating: prof.rating,
        completed_services: prof.completedJobs
      };

      const { error } = await supabase.from('professional_profiles').upsert(payload);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  async deleteProfessional(id: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('professional_profiles').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  // --- COMMISSION CHARGES ---
  async getCommissionCharges(): Promise<CommissionCharge[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('commission_charges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        requestId: item.request_id,
        serviceTitle: item.service_title,
        professionalId: item.professional_id,
        professionalName: item.professional_name,
        professionalCpfCnpj: item.professional_cpf_cnpj,
        professionalPhone: item.professional_phone,
        clientName: item.client_name,
        clientPhone: item.client_phone,
        clientAddress: item.client_address,
        serviceValue: Number(item.service_value),
        commissionPercent: Number(item.commission_percent),
        commissionValue: Number(item.commission_value),
        status: item.status,
        paymentMethod: item.payment_method,
        pixCopiaCola: item.pix_copia_cola,
        boletoLinhaDigitavel: item.boleto_linha_digitavel,
        boletoCodigoBarras: item.boleto_codigo_barras,
        nfseNumero: item.nfse_numero,
        nfseChaveAcesso: item.nfse_chave_acesso,
        nfseEmissaoData: item.nfse_emissao_data,
        lateFeePercent: item.late_fee_percent ? Number(item.late_fee_percent) : undefined,
        monthlyInterestPercent: item.monthly_interest_percent ? Number(item.monthly_interest_percent) : undefined,
        totalChargedValue: item.total_charged_value ? Number(item.total_charged_value) : undefined,
        dueDate: item.due_date,
        paidAt: item.paid_at,
        notes: item.notes,
        createdAt: item.created_at
      }));
    } catch {
      return [];
    }
  },

  async upsertCommissionCharge(charge: CommissionCharge): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const payload = {
        id: charge.id,
        request_id: charge.requestId,
        service_title: charge.serviceTitle,
        professional_id: charge.professionalId,
        professional_name: charge.professionalName,
        professional_cpf_cnpj: charge.professionalCpfCnpj,
        professional_phone: charge.professionalPhone,
        client_name: charge.clientName,
        client_phone: charge.clientPhone,
        client_address: charge.clientAddress,
        service_value: charge.serviceValue,
        commission_percent: charge.commissionPercent,
        commission_value: charge.commissionValue,
        status: charge.status,
        payment_method: charge.paymentMethod,
        pix_copia_cola: charge.pixCopiaCola,
        boleto_linha_digitavel: charge.boletoLinhaDigitavel,
        boleto_codigo_barras: charge.boletoCodigoBarras,
        nfse_numero: charge.nfseNumero,
        nfse_chave_acesso: charge.nfseChaveAcesso,
        nfse_emissao_data: charge.nfseEmissaoData,
        late_fee_percent: charge.lateFeePercent,
        monthly_interest_percent: charge.monthlyInterestPercent,
        total_charged_value: charge.totalChargedValue,
        due_date: charge.dueDate,
        paid_at: charge.paidAt,
        notes: charge.notes
      };

      const { error } = await supabase.from('commission_charges').upsert(payload);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  async deleteCommissionCharge(id: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('commission_charges').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  async purgeAllRemoteData(): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      await Promise.allSettled([
        supabase.from('service_requests').delete().neq('id', '__EMPTY_FLAG__'),
        supabase.from('commission_charges').delete().neq('id', '__EMPTY_FLAG__'),
        supabase.from('professional_profiles').delete().neq('id', '__EMPTY_FLAG__'),
        supabase.from('users').delete().neq('email', 'suportesmservicos@gmail.com'),
        supabase.from('service_reviews').delete().neq('id', '__EMPTY_FLAG__')
      ]);
      return true;
    } catch {
      return false;
    }
  },

  // --- USERS ---
  async getUsers(): Promise<UserAccount[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        email: item.email,
        name: item.name,
        role: item.role,
        phone: item.phone,
        avatarUrl: item.avatar,
        cpfCnpj: item.cpf_cnpj,
        city: item.city,
        state: item.state,
        notes: item.notes,
        status: item.status || 'ativo',
        createdAt: item.created_at || new Date().toISOString()
      }));
    } catch {
      return [];
    }
  },

  async upsertUser(user: UserAccount): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatarUrl,
        cpf_cnpj: user.cpfCnpj,
        city: user.city,
        state: user.state,
        notes: user.notes,
        status: user.status
      };

      const { error } = await supabase.from('users').upsert(payload);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  // --- PAYMENT GATEWAY SETTINGS ---
  async getGatewaySettings(): Promise<PaymentGatewaySettings | null> {
    if (!supabase || !isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('payment_gateway_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        activeProvider: data.active_provider,
        companyName: data.company_name,
        companyTradeName: data.company_trade_name,
        companyCnpj: data.company_cnpj,
        companyAddress: data.company_address,
        pixKey: data.pix_key,
        pixKeyType: data.pix_key_type,
        bankName: data.bank_name,
        bankAgency: data.bank_agency,
        bankAccount: data.bank_account,
        commissionRate: Number(data.commission_rate) || 30,
        daysToPay: Number(data.days_to_pay) || 3,
        autoBlockAfterDays: Number(data.auto_block_after_days) || 4,
        autoIssueBoleto: Boolean(data.auto_issue_boleto_on_overdue ?? true),
        autoIssueNfse: Boolean(data.auto_issue_nfse ?? true),
        finePercent: Number(data.fine_percent) || 2,
        monthlyInterestRate: Number(data.monthly_interest_rate) || 1,
        environment: data.environment || 'production',
        apiKeyMasked: data.api_key_masked || '',
        webhookUrl: data.webhook_url || '',
        webhookSecretMasked: data.webhook_secret_masked || ''
      };
    } catch {
      return null;
    }
  },

  async saveGatewaySettings(settings: PaymentGatewaySettings): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const payload = {
        id: 'default',
        active_provider: settings.activeProvider,
        company_name: settings.companyName,
        company_trade_name: settings.companyTradeName,
        company_cnpj: settings.companyCnpj,
        company_address: settings.companyAddress,
        pix_key: settings.pixKey,
        pix_key_type: settings.pixKeyType,
        bank_name: settings.bankName,
        bank_agency: settings.bankAgency,
        bank_account: settings.bankAccount,
        commission_rate: settings.commissionRate,
        days_to_pay: settings.daysToPay,
        auto_block_after_days: settings.autoBlockAfterDays,
        auto_issue_boleto_on_overdue: settings.autoIssueBoleto,
        auto_issue_nfse: settings.autoIssueNfse,
        fine_percent: settings.finePercent,
        monthly_interest_rate: settings.monthlyInterestRate,
        environment: settings.environment,
        api_key_masked: settings.apiKeyMasked,
        webhook_url: settings.webhookUrl,
        webhook_secret_masked: settings.webhookSecretMasked
      };

      const { error } = await supabase.from('payment_gateway_settings').upsert(payload);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  },

  // --- SERVICE REVIEWS ---
  async saveServiceReview(review: {
    requestId: string;
    clientName: string;
    professionalName?: string;
    stars: number;
    comment: string;
    createdAt: string;
  }): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured) return false;
    try {
      const payload = {
        id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
        request_id: review.requestId,
        client_name: review.clientName,
        professional_name: review.professionalName || 'Profissional',
        stars: review.stars,
        comment: review.comment,
        created_at: review.createdAt
      };
      const { error } = await supabase.from('service_reviews').upsert(payload);
      if (error) throw error;
      return true;
    } catch {
      return false;
    }
  }
};
