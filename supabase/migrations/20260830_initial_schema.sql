-- =====================================================================
-- SUPABASE POSTGRESQL INITIAL SCHEMA MIGRATION
-- Project: SM Express Serviços Gerais & Intermediação
-- Generated on: 2026-08-30
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================================
-- TABLE: users (System Accounts: Client, Professional, Admin)
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('cliente', 'profissional', 'admin')),
    phone VARCHAR(32),
    avatar TEXT,
    cpf_cnpj VARCHAR(32),
    city VARCHAR(100) DEFAULT 'Taubaté',
    state VARCHAR(2) DEFAULT 'SP',
    notes TEXT,
    status VARCHAR(32) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- TABLE: professional_profiles (Accreditation & Documentation)
-- =====================================================================
CREATE TABLE IF NOT EXISTS professional_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    cpf_cnpj VARCHAR(32) NOT NULL UNIQUE,
    rg_ie VARCHAR(32),
    phone VARCHAR(32) NOT NULL,
    whatsapp VARCHAR(32),
    email VARCHAR(255) NOT NULL,
    zip_code VARCHAR(16) NOT NULL,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(32) NOT NULL,
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Taubaté',
    state VARCHAR(2) NOT NULL DEFAULT 'SP',
    main_category VARCHAR(100) NOT NULL,
    sub_categories TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 1,
    bio TEXT,
    photo_3x4_url TEXT,
    doc_front_url TEXT,
    doc_back_url TEXT,
    proof_address_url TEXT,
    criminal_record_url TEXT,
    bank_name VARCHAR(100),
    bank_account_type VARCHAR(32) DEFAULT 'corrente',
    bank_agency VARCHAR(16),
    bank_account_number VARCHAR(32),
    bank_pix_key VARCHAR(100),
    terms_accepted BOOLEAN DEFAULT true,
    background_check_agreed BOOLEAN DEFAULT true,
    contract_agreed_boleto_clause BOOLEAN DEFAULT true,
    digital_signature TEXT,
    status VARCHAR(32) DEFAULT 'pendente_aprovacao' CHECK (status IN ('pendente_aprovacao', 'aprovado', 'rejeitado', 'bloqueado')),
    rating NUMERIC(3, 2) DEFAULT 5.00,
    completed_services INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_professional_profiles_updated_at
BEFORE UPDATE ON professional_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- TABLE: service_requests (Customer Orders & Dispatch Lifecycle)
-- =====================================================================
CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    whatsapp VARCHAR(32),
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Taubaté',
    state VARCHAR(2) DEFAULT 'SP',
    category_id VARCHAR(64) NOT NULL,
    category_title VARCHAR(150) NOT NULL,
    specific_service VARCHAR(255),
    urgency VARCHAR(32) DEFAULT 'normal' CHECK (urgency IN ('baixa', 'normal', 'alta', 'urgente')),
    description TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    status VARCHAR(32) DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'analise_orcamento', 'orcamento_enviado', 'aprovado', 'em_andamento', 'concluido', 'cancelado')),
    quoted_price NUMERIC(10, 2),
    estimated_hours VARCHAR(32),
    assigned_professional VARCHAR(255),
    scheduled_date TIMESTAMPTZ,
    admin_notes TEXT,
    client_feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_service_requests_updated_at
BEFORE UPDATE ON service_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- TABLE: commission_charges (30% Platform Split, Pix, Boleto & NFS-e)
-- =====================================================================
CREATE TABLE IF NOT EXISTS commission_charges (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) REFERENCES service_requests(id) ON DELETE CASCADE,
    service_title VARCHAR(255) NOT NULL,
    professional_id VARCHAR(64) NOT NULL,
    professional_name VARCHAR(255) NOT NULL,
    professional_cpf_cnpj VARCHAR(32) NOT NULL,
    professional_phone VARCHAR(32) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(32),
    client_address TEXT,
    service_value NUMERIC(10, 2) NOT NULL,
    commission_percent NUMERIC(5, 2) DEFAULT 30.00,
    commission_value NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'boleto_emitido', 'protestado', 'cancelado')),
    payment_method VARCHAR(32) CHECK (payment_method IN ('pix', 'boleto', 'cartao_credito')),
    pix_copia_cola TEXT,
    boleto_linha_digitavel VARCHAR(100),
    boleto_codigo_barras VARCHAR(100),
    nfse_numero VARCHAR(64),
    nfse_chave_acesso VARCHAR(100),
    nfse_emissao_data TIMESTAMPTZ,
    late_fee_percent NUMERIC(5, 2) DEFAULT 2.00,
    monthly_interest_percent NUMERIC(5, 2) DEFAULT 1.00,
    total_charged_value NUMERIC(10, 2),
    due_date TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trigger_commission_charges_updated_at
BEFORE UPDATE ON commission_charges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- TABLE: payment_gateway_settings (Gateway Credentials & Webhooks)
-- =====================================================================
CREATE TABLE IF NOT EXISTS payment_gateway_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'default',
    active_provider VARCHAR(32) DEFAULT 'asaas' CHECK (active_provider IN ('asaas', 'mercadopago', 'banco_inter', 'gerencianet')),
    company_name VARCHAR(255) DEFAULT 'SM Express Serviços Gerais LTDA',
    company_trade_name VARCHAR(255) DEFAULT 'SM Express',
    company_cnpj VARCHAR(32) DEFAULT '54.892.311/0001-90',
    company_address TEXT DEFAULT 'Av. Tiradentes, 500, Sala 402 - Centro, Taubaté - SP, CEP 12010-000',
    pix_key VARCHAR(100) DEFAULT '54892311000190',
    pix_key_type VARCHAR(32) DEFAULT 'cnpj',
    bank_name VARCHAR(100) DEFAULT 'Banco Inter S.A. (077)',
    bank_agency VARCHAR(16) DEFAULT '0001-9',
    bank_account VARCHAR(32) DEFAULT '12849025-0',
    auto_generate_pix BOOLEAN DEFAULT true,
    auto_issue_boleto_on_overdue BOOLEAN DEFAULT true,
    auto_issue_nfse BOOLEAN DEFAULT true,
    fine_percent NUMERIC(5, 2) DEFAULT 2.00,
    monthly_interest_rate NUMERIC(5, 2) DEFAULT 1.00,
    environment VARCHAR(32) DEFAULT 'production' CHECK (environment IN ('sandbox', 'production')),
    api_key_masked VARCHAR(255) DEFAULT '••••••••••••••••••••••••••••••••',
    webhook_url VARCHAR(255) DEFAULT 'https://api.smexpress.com.br/v1/webhooks/payments',
    webhook_secret_masked VARCHAR(255) DEFAULT '••••••••••••••••••••••••••••••••',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- TABLE: service_reviews (Customer Reviews & Ratings)
-- =====================================================================
CREATE TABLE IF NOT EXISTS service_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(64) REFERENCES service_requests(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    professional_name VARCHAR(255) NOT NULL,
    service_title VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_prof_status ON professional_profiles(status);
CREATE INDEX IF NOT EXISTS idx_prof_category ON professional_profiles(main_category);
CREATE INDEX IF NOT EXISTS idx_prof_cpf_cnpj ON professional_profiles(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_category ON service_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_charges_status ON commission_charges(status);
CREATE INDEX IF NOT EXISTS idx_charges_due_date ON commission_charges(due_date);
CREATE INDEX IF NOT EXISTS idx_charges_prof_id ON commission_charges(professional_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateway_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

-- Public read / write policies for applet operational flow
CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on users" ON users FOR ALL USING (true);

CREATE POLICY "Allow public access on professional_profiles" ON professional_profiles FOR ALL USING (true);
CREATE POLICY "Allow public access on service_requests" ON service_requests FOR ALL USING (true);
CREATE POLICY "Allow public access on commission_charges" ON commission_charges FOR ALL USING (true);
CREATE POLICY "Allow public access on payment_gateway_settings" ON payment_gateway_settings FOR ALL USING (true);
CREATE POLICY "Allow public access on service_reviews" ON service_reviews FOR ALL USING (true);

-- =====================================================================
-- INITIAL SEED DATA
-- =====================================================================
-- 1. Official Administrator Account
INSERT INTO users (id, email, name, role, phone, avatar, city, state, notes, status)
VALUES (
    'USR-ADM-001',
    'rmonteir75@gmail.com',
    'Administrador Geral SM Express',
    'admin',
    '(12) 99700-1000',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    'Taubaté',
    'SP',
    'Conta de Administrador Master',
    'ativo'
)
ON CONFLICT (email) DO NOTHING;

-- 2. Default Payment Gateway Settings
INSERT INTO payment_gateway_settings (id, active_provider, company_name, company_trade_name, company_cnpj, company_address, pix_key, pix_key_type, bank_name, bank_agency, bank_account, auto_generate_pix, auto_issue_boleto_on_overdue, auto_issue_nfse, fine_percent, monthly_interest_rate, environment)
VALUES (
    'default',
    'asaas',
    'SM Express Serviços Gerais LTDA',
    'SM Express',
    '54.892.311/0001-90',
    'Av. Tiradentes, 500, Sala 402 - Centro, Taubaté - SP, CEP 12010-000',
    '54892311000190',
    'cnpj',
    'Banco Inter S.A. (077)',
    '0001-9',
    '12849025-0',
    true,
    true,
    true,
    2.00,
    1.00,
    'production'
)
ON CONFLICT (id) DO NOTHING;
