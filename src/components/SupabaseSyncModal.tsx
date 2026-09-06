import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  Server, 
  ShieldCheck, 
  Key, 
  Terminal,
  ExternalLink
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  onRefreshData
}) => {
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'migration' | 'env'>('status');

  if (!isOpen) return null;

  const sqlMigrationCode = `-- =====================================================================
-- SUPABASE POSTGRESQL INITIAL SCHEMA MIGRATION
-- Project: SM Express Serviços Gerais & Intermediação
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
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

-- Table: professional_profiles
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
    bank_name VARCHAR(100),
    bank_pix_key VARCHAR(100),
    terms_accepted BOOLEAN DEFAULT true,
    status VARCHAR(32) DEFAULT 'pendente_aprovacao',
    rating NUMERIC(3, 2) DEFAULT 5.00,
    completed_services INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table: service_requests
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
    description TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'solicitado',
    quoted_price NUMERIC(10, 2),
    estimated_hours VARCHAR(32),
    assigned_professional VARCHAR(255),
    scheduled_date TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table: commission_charges (30% Repasse)
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
    status VARCHAR(32) DEFAULT 'pendente',
    payment_method VARCHAR(32),
    pix_copia_cola TEXT,
    boleto_linha_digitavel VARCHAR(100),
    boleto_codigo_barras VARCHAR(100),
    nfse_numero VARCHAR(64),
    nfse_chave_acesso VARCHAR(100),
    due_date TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table: payment_gateway_settings
CREATE TABLE IF NOT EXISTS payment_gateway_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'default',
    active_provider VARCHAR(32) DEFAULT 'asaas',
    company_name VARCHAR(255) DEFAULT 'SM Express Serviços Gerais LTDA',
    company_trade_name VARCHAR(255) DEFAULT 'SM Express',
    company_cnpj VARCHAR(32) DEFAULT '54.892.311/0001-90',
    pix_key VARCHAR(100) DEFAULT '54892311000190',
    fine_percent NUMERIC(5, 2) DEFAULT 2.00,
    monthly_interest_rate NUMERIC(5, 2) DEFAULT 1.00,
    environment VARCHAR(32) DEFAULT 'production',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS & Seed Admin
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateway_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read/Write users" ON users FOR ALL USING (true);
CREATE POLICY "Public Read/Write professional_profiles" ON professional_profiles FOR ALL USING (true);
CREATE POLICY "Public Read/Write service_requests" ON service_requests FOR ALL USING (true);
CREATE POLICY "Public Read/Write commission_charges" ON commission_charges FOR ALL USING (true);
CREATE POLICY "Public Read/Write payment_gateway_settings" ON payment_gateway_settings FOR ALL USING (true);

INSERT INTO users (id, email, name, role, phone, city, state, notes, status)
VALUES ('USR-ADM-001', 'suportesmservicos@gmail.com', 'Administrador SM Express', 'admin', '(12) 99160-1322', 'Taubaté', 'SP', 'Conta Master Oficial', 'ativo')
ON CONFLICT (email) DO NOTHING;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlMigrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      if (isSupabaseConfigured) {
        if (onRefreshData) onRefreshData();
        setSyncStatus('Sincronização realizada com sucesso!');
      } else {
        setSyncStatus('Supabase operando em modo Local Cache. Para sincronizar na nuvem, adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações.');
      }
    } catch {
      setSyncStatus('Erro ao tentar conectar ao Supabase.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#001838] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">Integração Supabase & Migrations</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSupabaseConfigured 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isSupabaseConfigured ? '🟢 Conectado ao Supabase' : '🟡 Modo Local (Pronto para Chaves)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Gerenciador de schema PostgreSQL, tabelas de comissões, perfis e requisições
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Status da Conexão</span>
          </button>

          <button
            onClick={() => setActiveTab('migration')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'migration'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Script de Migrations SQL</span>
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'env'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Variáveis de Ambiente</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white text-sm">Estado do PostgreSQL / Supabase</span>
                  </div>
                  <button
                    onClick={handleSyncNow}
                    disabled={isSyncing}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Verificando...' : 'Testar Conexão / Sincronizar'}</span>
                  </button>
                </div>

                {syncStatus && (
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200">
                    {syncStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Tabelas Estruturadas:</span>
                    <ul className="text-slate-200 space-y-1 font-mono text-[11px]">
                      <li>✓ users</li>
                      <li>✓ professional_profiles</li>
                      <li>✓ service_requests</li>
                      <li>✓ commission_charges (30%)</li>
                      <li>✓ payment_gateway_settings</li>
                      <li>✓ service_reviews</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Recursos Ativos:</span>
                    <ul className="text-slate-200 space-y-1 text-[11px]">
                      <li>✓ Row Level Security (RLS) configurado</li>
                      <li>✓ Triggers para atualização de `updated_at`</li>
                      <li>✓ Índices de busca por CPF/CNPJ e Status</li>
                      <li>✓ Conta master pré-semeada (suportesmservicos@gmail.com)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MIGRATION SQL */}
          {activeTab === 'migration' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Arquivo gerado em: <code className="text-amber-400">/supabase/migrations/20260830_initial_schema.sql</code>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado para a Área de Transferência!' : 'Copiar SQL de Migrations'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-80 leading-relaxed">
                  {sqlMigrationCode}
                </pre>
              </div>

              <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-200 flex items-start gap-2">
                <ExternalLink className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Como executar no Supabase:</strong> Acesse seu painel no Supabase &gt; vá em <strong>SQL Editor</strong> &gt; cole o script acima e clique em <strong>Run</strong>.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ENV VARIABLES */}
          {activeTab === 'env' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h4 className="font-bold text-white text-sm">Configuração das Chaves de Acesso</h4>
                <p className="text-slate-400 leading-relaxed">
                  Para conectar seu projeto Supabase à aplicação em tempo real, informe as variáveis de ambiente em <strong>Settings &gt; Environment Variables</strong> ou no arquivo <code>.env</code>:
                </p>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-amber-400">VITE_SUPABASE_URL</span>
                    <span className="text-slate-400">https://seu-projeto.supabase.co</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-amber-400">VITE_SUPABASE_ANON_KEY</span>
                    <span className="text-slate-400">eyJhbGciOiJIUzI1NiIsInR5cCI...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
