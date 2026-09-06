import { 
  ServiceDefinition, 
  ServiceRequest, 
  AdminMetrics, 
  MonthlyChartData, 
  ServiceDistributionData, 
  ProfessionalProfile, 
  UserAccount,
  CommissionCharge,
  PaymentGatewaySettings
} from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-ADM-001',
    name: 'Administrador SM Express',
    email: 'suportesmservicos@gmail.com',
    phone: '(12) 99160-1322',
    role: 'admin',
    password: '2026Smexpress*',
    cpfCnpj: '54.892.311/0001-90',
    rg: '',
    birthDate: '1980-01-01',
    gender: 'outro',
    cep: '12010-000',
    street: 'Avenida Tiradentes',
    number: '500',
    complement: 'Sala 402',
    neighborhood: 'Centro',
    city: 'Taubaté',
    state: 'SP',
    status: 'ativo',
    isCompleteRegistration: true,
    notes: 'Conta Oficial do Administrador do Sistema SM Express.',
    totalRequests: 0,
    totalSpent: 0,
    lastAccess: new Date().toISOString(),
    avatarUrl: '',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PROFESSIONALS: ProfessionalProfile[] = [];

export const SERVICES_LIST: ServiceDefinition[] = [
  {
    id: 'limpeza_residencial',
    title: 'Limpeza em Geral',
    shortDescription: 'Residências, empresas, condomínios, pós-obra e muito mais.',
    fullDescription: 'Equipe especializada para limpeza pesada, pós-obra, conservação residencial, comercial e empresarial com produtos profissionais e equipamentos de ponta.',
    iconName: 'Sparkles',
    color: 'bg-blue-600',
    fields: [
      {
        label: 'Tipo de local',
        type: 'select',
        options: ['Residência / Casa', 'Apartamento', 'Empresa / Escritório', 'Condomínio', 'Pós-Obra / Reforma']
      },
      {
        label: 'Modalidade',
        type: 'select',
        options: ['Faxina Completa / Profunda', 'Limpeza Pós-Obra', 'Manutenção Periódica / Semanal', 'Pré-Mudança']
      },
      {
        label: 'Tamanho do imóvel',
        type: 'select',
        options: ['Pequeno (até 60 m²)', 'Médio (60 a 120 m²)', 'Grande (120 a 250 m²)', 'Acima de 250 m²']
      }
    ]
  },
  {
    id: 'limpeza_caixa_agua',
    title: 'Limpeza e Manutenção de Caixa d\'Água',
    shortDescription: 'Mais saúde e segurança para sua família ou empresa.',
    fullDescription: 'Higienização técnica certificada conforme normas da vigilância sanitária, remoção de lodo, vedação e desinfecção com produtos atóxicos para residências e condomínios.',
    iconName: 'Droplet',
    color: 'bg-sky-600',
    fields: [
      {
        label: 'Capacidade do reservatório',
        type: 'select',
        options: ['500 Litros', '1.000 Litros', '2.000 Litros', 'Condomínio / Castelo Elevado', 'Cisterna Subterrânea']
      },
      {
        label: 'Local de acesso',
        type: 'select',
        options: ['Telhado residencial padrão', 'Sótão com alçapão', 'Castelo d\'água elevado', 'Subsolo / Cisterna']
      }
    ]
  },
  {
    id: 'limpeza_terrenos',
    title: 'Limpeza e Manutenção de Terrenos',
    shortDescription: 'Capinagem, roçagem e retirada de entulhos.',
    fullDescription: 'Serviço com roçadeiras profissionais para terrenos urbanos ou rurais, incluindo capina manual, poda corretiva e descarte ecológico de entulhos e restos vegetais.',
    iconName: 'Trees',
    color: 'bg-emerald-600',
    fields: [
      {
        label: 'Área aproximada (m²)',
        type: 'select',
        options: ['Até 250 m²', '250 m² a 500 m²', '500 m² a 1.000 m²', 'Acima de 1.000 m²']
      },
      {
        label: 'Tipo de vegetação / entulho',
        type: 'select',
        options: ['Mato baixo (capina simples)', 'Mato alto / Arbustos densos', 'Restos de obras / Entulhos', 'Poda de galhos e árvores']
      }
    ]
  },
  {
    id: 'limpeza_piscinas',
    title: 'Limpeza e Manutenção de Piscinas',
    shortDescription: 'Água limpa, cristalina e tratada com segurança.',
    fullDescription: 'Tratamento químico especializado, controle de pH e cloro, aspiração de fundo, escovação de bordas e manutenção de filtros e bombas para alvenaria, fibra ou vinil.',
    iconName: 'Waves',
    color: 'bg-cyan-600',
    fields: [
      {
        label: 'Tipo de piscina',
        type: 'select',
        options: ['Alvenaria', 'Fibra de Vidro', 'Vinil', 'Outro']
      },
      {
        label: 'Tamanho estimado',
        type: 'select',
        options: ['Pequena (até 20.000 L)', 'Média (20.000 L a 50.000 L)', 'Grande (acima de 50.000 L)']
      },
      {
        label: 'Frequência do serviço',
        type: 'select',
        options: ['Avulso (1 vez)', 'Semanal', 'Quinzenal', 'Mensal']
      }
    ]
  },
  {
    id: 'servicos_condominios',
    title: 'Serviços para Condomínios',
    shortDescription: 'Limpeza, conservação e manutenção completa.',
    fullDescription: 'Planos completos de zeladoria, limpeza de áreas comuns, hall de entrada, garagens, quadras, manutenção predial preventiva e suporte contínuo para condomínios horizontais e verticais.',
    iconName: 'Building2',
    color: 'bg-indigo-600',
    fields: [
      {
        label: 'Tipo de condomínio',
        type: 'select',
        options: ['Condomínio Vertical (Prédio)', 'Condomínio Horizontal (Casas)', 'Comercial / Empresarial']
      },
      {
        label: 'Serviço principal desejado',
        type: 'select',
        options: ['Limpeza e conservação diária', 'Manutenção predial / Reparos', 'Higienização de caixas d\'água / garagens', 'Plano mensal integrado']
      }
    ]
  },
  {
    id: 'fretes_mudancas',
    title: 'Transportes, Fretes e Mudanças',
    shortDescription: 'Com segurança, agilidade e preço justo.',
    fullDescription: 'Caminhões e utilitários preparados com cobertores, amarras e ajudantes para transporte residencial, comercial ou carretos rápidos de móveis e eletrodomésticos.',
    iconName: 'Truck',
    color: 'bg-teal-600',
    fields: [
      {
        label: 'Tipo de transporte',
        type: 'select',
        options: ['Mudança Residencial Completa', 'Mudança Comercial / Escritório', 'Frete de itens avulsos (Sofá, Geladeira, etc.)', 'Transporte de materiais e cargas']
      },
      {
        label: 'Necessita de ajudantes para carga/descarga?',
        type: 'select',
        options: ['Sim (Motorista + 2 Ajudantes)', 'Sim (Motorista + 1 Ajudante)', 'Apenas o motorista (sem ajudantes)']
      }
    ]
  },
  // NOVOS SERVIÇOS DO FLYER
  {
    id: 'venda_cortinas_persianas',
    title: 'Venda, Instalação e Manutenção de Cortinas e Persianas',
    shortDescription: 'Cortinas sob medida, persianas verticais, horizontais e rolo.',
    fullDescription: 'Venda, instalação especializada, higienização e manutenção de persianas (verticais, horizontais, rolo, romana) e cortinas em tecido para residências e escritórios.',
    iconName: 'Layers',
    color: 'bg-violet-600',
    fields: [
      {
        label: 'Tipo de serviço',
        type: 'select',
        options: ['Instalação de cortina/persiana nova', 'Manutenção / Troca de cordas e lâminas', 'Venda sob medida com instalação', 'Higienização e lavagem']
      },
      {
        label: 'Modelo',
        type: 'select',
        options: ['Persiana Rolo / Blackout', 'Persiana Horizontal (Alumínio/Madeira)', 'Persiana Vertical', 'Cortina em Tecido (Varão/Trilho)']
      }
    ]
  },
  {
    id: 'servicos_solda',
    title: 'Serviços e Reparos de Solda',
    shortDescription: 'Solda elétrica, MIG, reparos em portões, grades e estruturas.',
    fullDescription: 'Serviço especializado de soldador para conserto de portões metálicos, grades de proteção, corrimãos, suportes, esquadrias e estruturas de ferro em geral.',
    iconName: 'Flame',
    color: 'bg-orange-600',
    fields: [
      {
        label: 'Tipo de serviço de solda',
        type: 'select',
        options: ['Reparo em portão de ferro / grades', 'Solda em corrimão / esquadrias', 'Fabricação / Reforço de estrutura metálica', 'Pequeno reparo avulso']
      },
      {
        label: 'Local do serviço',
        type: 'select',
        options: ['No local (residência/empresa)', 'Peça avulsa para reparo na oficina']
      }
    ]
  },
  {
    id: 'portas_portoes_chaveiro',
    title: 'Conserto e Reparo de Portas, Portões e Chaveiro',
    shortDescription: 'Ajuste de fechaduras, roldanas de portões e serviços de chaveiro.',
    fullDescription: 'Regulagem e alinhamento de portas de madeira/alumínio, troca e manutenção de roldanas e motores de portão basculante ou deslizante, e troca de fechaduras.',
    iconName: 'KeyRound',
    color: 'bg-amber-700',
    fields: [
      {
        label: 'Tipo de item',
        type: 'select',
        options: ['Portão Basculante / Deslizante', 'Porta de Madeira / Entrada', 'Porta de Vidro / Alumínio', 'Troca ou reparo de Fechadura']
      },
      {
        label: 'Problema apresentado',
        type: 'select',
        options: ['Portão emperrado / fora do trilho', 'Fechadura travando / Chave quebrada', 'Porta raspando no piso', 'Necessita instalação de trava de segurança']
      }
    ]
  },
  {
    id: 'interfone_instalacao',
    title: 'Instalação e Reparo de Interfone',
    shortDescription: 'Interfonia residencial, predial e vídeo-porteiros.',
    fullDescription: 'Instalação completa e manutenção corretiva de sistemas de interfonia individual ou coletiva para prédios e condomínios, incluindo vídeo-porteiro e fechaduras eletrônicas.',
    iconName: 'PhoneCall',
    color: 'bg-blue-700',
    fields: [
      {
        label: 'Tipo de sistema',
        type: 'select',
        options: ['Interfone Residencial (Individual)', 'Vídeo-Porteiro', 'Interfonia Coletiva de Condomínio / Prédio', 'Fechadura Eletrônica / Digital']
      },
      {
        label: 'Necessidade',
        type: 'select',
        options: ['Instalação do zero', 'Reparo / Sem áudio ou não abre portão', 'Substituição de fiação / aparelho']
      }
    ]
  },
  {
    id: 'cercas_eletricas',
    title: 'Instalação e Reparo de Cercas Elétricas',
    shortDescription: 'Segurança perimetral, concertinas e eletrificadores.',
    fullDescription: 'Instalação, manutenção de choque, troca de hastes, arames, isoladores, baterias de no-break e instalação de concertinas para segurança de muros e divisas.',
    iconName: 'Zap',
    color: 'bg-yellow-600',
    fields: [
      {
        label: 'Tipo de proteção',
        type: 'select',
        options: ['Cerca Elétrica Convencional', 'Cerca Elétrica Industrial / Big Haste', 'Concertina Simples ou Dupla', 'Cerca + Concertina combinadas']
      },
      {
        label: 'Extensão aproximada do muro',
        type: 'select',
        options: ['Até 20 metros', '20 a 50 metros', '50 a 100 metros', 'Acima de 100 metros']
      }
    ]
  },
  {
    id: 'cameras_seguranca',
    title: 'Instalação e Reparo de Câmeras de Segurança',
    shortDescription: 'CFTV HD, câmeras IP, Wi-Fi e monitoramento por celular.',
    fullDescription: 'Projetos e instalação de câmeras de segurança de alta resolução, DVR/NVR, câmeras com visão noturna, áudio bidirecional e configuração de acesso remoto no smartphone.',
    iconName: 'Camera',
    color: 'bg-slate-700',
    fields: [
      {
        label: 'Quantidade de câmeras',
        type: 'select',
        options: ['1 a 2 Câmeras Wi-Fi', 'Kit 4 Câmeras com DVR', 'Kit 8 Câmeras com DVR', 'Mais de 8 Câmeras / Projeto Comercial']
      },
      {
        label: 'Tipo de serviço',
        type: 'select',
        options: ['Instalação de kit novo com app no celular', 'Manutenção em sistema existente / Câmera offline', 'Troca de cabos / Gravador DVR']
      }
    ]
  },
  {
    id: 'montagem_moveis',
    title: 'Montagem de Móveis',
    shortDescription: 'Montagem, desmontagem e reparos em móveis novos e usados.',
    fullDescription: 'Profissional equipado para montagem de guarda-roupas, armários de cozinha, painéis de TV, mesas, camas, estantes e móveis planejados ou convencionais.',
    iconName: 'Armchair',
    color: 'bg-cyan-700',
    fields: [
      {
        label: 'Tipo de móvel',
        type: 'select',
        options: [
          'Guarda-roupa / Roupeiro',
          'Armário de Cozinha / Balcão',
          'Painel de TV / Rack',
          'Mesa com Cadeiras',
          'Cama / Beliche / Cabeceira',
          'Estante / Livreiro / Gaveteiro',
          'Móveis de Escritório',
          'Múltiplos Móveis'
        ]
      }
    ]
  },
  {
    id: 'pequenos_reparos',
    title: 'Pequenos Reparos',
    shortDescription: 'Pequenos consertos e ajustes que fazem a diferença.',
    fullDescription: 'Instalação de quadros, suportes de TV, maçanetas, silicone de pias, vedação de janelas e ajustes diversos rápidos e práticos.',
    iconName: 'Hammer',
    color: 'bg-orange-500',
    fields: [
      {
        label: 'Item ou serviço desejado',
        type: 'select',
        options: ['Suporte de TV / Cortinas / Quadros', 'Regulagem de portas / maçanetas', 'Pintura pontual / retoques', 'Troca de lâmpadas / luminárias']
      }
    ]
  },
  {
    id: 'outros_servicos',
    title: 'Outros Serviços',
    shortDescription: 'Serviços personalizados de acordo com a sua necessidade.',
    fullDescription: 'Precisa de algo sob medida para sua casa, empresa ou condomínio? Descreva o que precisa e a equipe SM Express enviará a cotação ideal.',
    iconName: 'PlusCircle',
    color: 'bg-purple-600',
    fields: [
      {
        label: 'Descreva detalhadamente o serviço',
        type: 'text',
        placeholder: 'Ex: Jardinagem avançada, instalação de tela de proteção em varanda...'
      }
    ]
  }
];

export const INITIAL_REQUESTS: ServiceRequest[] = [];

export const INITIAL_ADMIN_METRICS: AdminMetrics = {
  totalSolicitacoes: 0,
  totalOrcamentos: 0,
  totalAgendamentos: 0,
  totalFaturamento: 0
};

export const MONTHLY_CHART_DATA: MonthlyChartData[] = [];

export const SERVICE_DISTRIBUTION_DATA: ServiceDistributionData[] = [];

export const DEFAULT_PAYMENT_GATEWAY_SETTINGS: PaymentGatewaySettings = {
  activeProvider: 'asaas',
  companyName: 'SM Express Serviços Gerais LTDA',
  companyTradeName: 'SM Express',
  companyCnpj: '54.892.311/0001-90',
  companyAddress: 'Av. Tiradentes, 500, Sala 402 - Centro, Taubaté - SP, CEP 12010-000',
  pixKey: '54892311000190',
  pixKeyType: 'cnpj',
  bankName: 'Banco Inter S.A. (077)',
  bankAgency: '0001-9',
  bankAccount: '1284902-5',
  commissionRate: 30, // 30%
  daysToPay: 3, // 3 dias úteis
  autoBlockAfterDays: 4, // 4º dia útil: bloqueio + emissão de boleto/NFS-e
  autoIssueBoleto: true,
  autoIssueNfse: true,
  finePercent: 2.0, // Multa de 2%
  monthlyInterestRate: 1.0, // Juros de 1% a.m.
  environment: 'production',
  apiKeyMasked: '••••••••••••••••••••••••••••••••',
  webhookUrl: 'https://api.smexpress.com.br/v1/webhooks/payments',
  webhookSecretMasked: '••••••••••••••••••••••••••••••••'
};

export const INITIAL_COMMISSION_CHARGES: CommissionCharge[] = [];
