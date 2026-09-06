import React, { useState, useMemo } from 'react';
import { 
  ServiceRequest, 
  ProfessionalProfile, 
  UserAccount, 
  CommissionCharge, 
  ServiceDefinition 
} from '../types';
import { safeSetItem } from '../utils/storage';
import { 
  Building2, 
  Target, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieChartIcon, 
  Award, 
  Calendar, 
  Download, 
  Printer, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  ShieldCheck, 
  FileText, 
  Edit3, 
  Save, 
  Percent, 
  AlertTriangle,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

interface CompanyManagementPanelProps {
  requests: ServiceRequest[];
  professionals: ProfessionalProfile[];
  users: UserAccount[];
  charges: CommissionCharge[];
  services: ServiceDefinition[];
}

export const CompanyManagementPanel: React.FC<CompanyManagementPanelProps> = ({
  requests,
  professionals,
  users,
  charges,
  services
}) => {
  // Configurable Monthly Goals State (Stored in localStorage for persistence)
  const [revenueGoal, setRevenueGoal] = useState<number>(() => {
    const saved = localStorage.getItem('smexpress_goal_revenue');
    return saved ? Number(saved) : 25000; // R$ 25.000,00 padrão
  });

  const [servicesGoal, setServicesGoal] = useState<number>(() => {
    const saved = localStorage.getItem('smexpress_goal_services');
    return saved ? Number(saved) : 50; // 50 serviços/mês
  });

  const [profsGoal, setProfsGoal] = useState<number>(() => {
    const saved = localStorage.getItem('smexpress_goal_profs');
    return saved ? Number(saved) : 15; // 15 prestadores ativos
  });

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempRevenueGoal, setTempRevenueGoal] = useState(revenueGoal);
  const [tempServicesGoal, setTempServicesGoal] = useState(servicesGoal);
  const [tempProfsGoal, setTempProfsGoal] = useState(profsGoal);

  const handleSaveGoals = () => {
    setRevenueGoal(tempRevenueGoal);
    setServicesGoal(tempServicesGoal);
    setProfsGoal(tempProfsGoal);
    safeSetItem('smexpress_goal_revenue', String(tempRevenueGoal));
    safeSetItem('smexpress_goal_services', String(tempServicesGoal));
    safeSetItem('smexpress_goal_profs', String(tempProfsGoal));
    setIsEditingGoals(false);
  };

  // Financial Calculations (Current Real Operations)
  const financialData = useMemo(() => {
    // Total gross from completed or approved services
    const completedRequests = requests.filter(r => ['concluido', 'avaliado'].includes(r.status));
    const grossRevenue = completedRequests.reduce((acc, curr) => acc + (curr.quotedPrice || 0), 0);

    // Platform share (30%)
    const platformShare = grossRevenue * 0.30;
    
    // Professionals share (70%)
    const professionalsShare = grossRevenue * 0.70;

    // Platform charges paid
    const platformPaidCharges = charges
      .filter(c => c.status === 'pago')
      .reduce((acc, curr) => acc + curr.commissionValue, 0);

    // Estimated Gateway & Operational Costs (~3.5% of platform share)
    const estimatedGatewayCosts = platformShare * 0.035;
    
    // Net Operating Result
    const netProfit = platformShare - estimatedGatewayCosts;

    // Active approved professionals
    const activeProfsCount = professionals.filter(p => p.status === 'aprovado').length;
    const totalClientsCount = users.filter(u => u.role === 'cliente').length;

    // Goal Progress Percentages
    const revenueProgress = revenueGoal > 0 ? Math.min(Math.round((grossRevenue / revenueGoal) * 100), 100) : 0;
    const servicesProgress = servicesGoal > 0 ? Math.min(Math.round((completedRequests.length / servicesGoal) * 100), 100) : 0;
    const profsProgress = profsGoal > 0 ? Math.min(Math.round((activeProfsCount / profsGoal) * 100), 100) : 0;

    return {
      completedCount: completedRequests.length,
      grossRevenue,
      platformShare,
      professionalsShare,
      platformPaidCharges,
      estimatedGatewayCosts,
      netProfit,
      activeProfsCount,
      totalClientsCount,
      revenueProgress,
      servicesProgress,
      profsProgress
    };
  }, [requests, professionals, users, charges, revenueGoal, servicesGoal, profsGoal]);

  // Performance by Service Category
  const categoryPerformance = useMemo(() => {
    const stats: Record<string, { count: number; gross: number; title: string }> = {};

    requests.forEach(req => {
      const cat = req.serviceId || 'outros_servicos';
      if (!stats[cat]) {
        stats[cat] = {
          count: 0,
          gross: 0,
          title: req.serviceTitle || cat
        };
      }
      stats[cat].count += 1;
      if (['concluido', 'avaliado', 'aprovado', 'em_execucao'].includes(req.status)) {
        stats[cat].gross += req.quotedPrice || 0;
      }
    });

    return Object.entries(stats)
      .map(([id, data]) => ({
        id,
        title: data.title,
        count: data.count,
        gross: data.gross,
        platformFee: data.gross * 0.30,
        avgTicket: data.count > 0 ? data.gross / data.count : 0
      }))
      .sort((a, b) => b.gross - a.gross);
  }, [requests]);

  // Professional Ranking
  const professionalRanking = useMemo(() => {
    const profMap: Record<string, { jobs: number; totalGross: number; name: string }> = {};

    requests.forEach(req => {
      const pName = req.assignedProfessional;
      if (!pName) return;

      if (!profMap[pName]) {
        profMap[pName] = { jobs: 0, totalGross: 0, name: pName };
      }

      if (['concluido', 'avaliado'].includes(req.status)) {
        profMap[pName].jobs += 1;
        profMap[pName].totalGross += req.quotedPrice || 0;
      }
    });

    return Object.values(profMap).sort((a, b) => b.totalGross - a.totalGross);
  }, [requests]);

  // Export Executive Summary to CSV
  const handleExportCSV = () => {
    const headers = ['Indicador', 'Valor'];
    const rows = [
      ['Faturamento Bruto Total', `R$ ${financialData.grossRevenue.toFixed(2)}`],
      ['Comissao Plataforma SM Express (30%)', `R$ ${financialData.platformShare.toFixed(2)}`],
      ['Repasse Prestadores (70%)', `R$ ${financialData.professionalsShare.toFixed(2)}`],
      ['Custos Operacionais e Gateway', `R$ ${financialData.estimatedGatewayCosts.toFixed(2)}`],
      ['Resultado Liquido Operacional', `R$ ${financialData.netProfit.toFixed(2)}`],
      ['Servicos Concluidos', `${financialData.completedCount}`],
      ['Prestadores Ativos', `${financialData.activeProfsCount}`],
      ['Total de Clientes', `${financialData.totalClientsCount}`],
      ['Meta Faturamento Mensal', `R$ ${revenueGoal.toFixed(2)} (${financialData.revenueProgress}%)`],
      ['Meta Servicos Mensal', `${servicesGoal} (${financialData.servicesProgress}%)`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Gerencial_SMExpress_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#001838] via-[#022452] to-[#001838] p-6 rounded-3xl text-white shadow-xl border border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">
              Gestão Executiva
            </span>
            <span className="text-xs text-blue-200 font-semibold">SM Express Soluções</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Painel de Gestão da Empresa & Metas</h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Acompanhe metas estratégicas, DRE simplificado da operação, rentabilidade por categoria e produtividade dos parceiros.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsEditingGoals(!isEditingGoals)}
            className="px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl border border-amber-400/40 transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingGoals ? 'Cancelar Edição' : 'Ajustar Metas'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* EDIT GOALS DRAWER */}
      {isEditingGoals && (
        <div className="bg-slate-900 border border-amber-400/40 p-5 rounded-3xl text-white space-y-4 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Configurar Metas Estratégicas Mensais
            </h3>
            <span className="text-xs text-slate-400">As alterações serão salvas para a empresa</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Meta de Faturamento (R$)</label>
              <input
                type="number"
                value={tempRevenueGoal}
                onChange={(e) => setTempRevenueGoal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Meta de Serviços Concluídos</label>
              <input
                type="number"
                value={tempServicesGoal}
                onChange={(e) => setTempServicesGoal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Meta de Prestadores Ativos</label>
              <input
                type="number"
                value={tempProfsGoal}
                onChange={(e) => setTempProfsGoal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditingGoals(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveGoals}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Novas Metas</span>
            </button>
          </div>
        </div>
      )}

      {/* METAS ESTRATÉGICAS (PROGRESSO VISUAL) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Meta 1: Faturamento */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Faturamento Mensal</span>
              <div className="text-2xl font-black text-[#001838] mt-0.5">
                R$ {financialData.grossRevenue.toFixed(2)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-600">Meta: R$ {revenueGoal.toFixed(2)}</span>
              <span className="text-amber-700">{financialData.revenueProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${financialData.revenueProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meta 2: Serviços Concluídos */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Serviços Entregues</span>
              <div className="text-2xl font-black text-[#001838] mt-0.5">
                {financialData.completedCount} concluídos
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-600">Meta: {servicesGoal} serviços</span>
              <span className="text-emerald-700">{financialData.servicesProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${financialData.servicesProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meta 3: Prestadores Credenciados */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Equipe Credenciada</span>
              <div className="text-2xl font-black text-[#001838] mt-0.5">
                {financialData.activeProfsCount} ativos
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-600">Meta: {profsGoal} prestadores</span>
              <span className="text-blue-700">{financialData.profsProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${financialData.profsProgress}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* DRE OPERACIONAL SIMPLIFICADO */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Demonstrativo de Resultados</span>
            <h3 className="text-lg font-black text-[#001838]">DRE Operacional da Plataforma</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">Modelo de Intermediação 30% / 70%</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Linha 1: Faturamento Bruto */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl font-bold">
            <span className="text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              (+) Faturamento Bruto de Serviços Realizados
            </span>
            <span className="text-sm font-black text-slate-900">
              R$ {financialData.grossRevenue.toFixed(2)}
            </span>
          </div>

          {/* Linha 2: Repasse Prestadores */}
          <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl text-slate-600">
            <span className="flex items-center gap-2 pl-4">
              <span className="text-red-500 font-bold">(-)</span> Repasse aos Profissionais Credenciados (70%)
            </span>
            <span className="font-semibold text-slate-700">
              R$ {financialData.professionalsShare.toFixed(2)}
            </span>
          </div>

          {/* Linha 3: Receita Bruta SM Express */}
          <div className="flex items-center justify-between p-3.5 bg-blue-50/80 rounded-xl font-bold border border-blue-100">
            <span className="text-blue-950 flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-700" />
              (=) Receita Bruta da Empresa (Comissão 30%)
            </span>
            <span className="text-sm font-black text-blue-900">
              R$ {financialData.platformShare.toFixed(2)}
            </span>
          </div>

          {/* Linha 4: Taxas e Gateway */}
          <div className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl text-slate-600">
            <span className="flex items-center gap-2 pl-4">
              <span className="text-red-500 font-bold">(-)</span> Taxas Financeiras de Gateway e Emissão de Boletos (~3.5%)
            </span>
            <span className="font-semibold text-red-700">
              - R$ {financialData.estimatedGatewayCosts.toFixed(2)}
            </span>
          </div>

          {/* Linha 5: Resultado Líquido */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl font-bold border border-emerald-200">
            <span className="text-emerald-950 text-sm flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              (=) Resultado Líquido Operacional
            </span>
            <span className="text-base font-black text-emerald-800">
              R$ {financialData.netProfit.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* RENTABILIDADE POR CATEGORIA & RANKING DE PRESTADORES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Desempenho por Categoria */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h4 className="font-black text-[#001838] text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-600" />
              Rentabilidade por Categoria de Serviço
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Volume & Receita</span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {categoryPerformance.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Aguardando atendimentos para gerar o relatório por categoria.
              </div>
            ) : (
              categoryPerformance.map((cat, idx) => (
                <div key={cat.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{cat.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {cat.count} pedido{cat.count > 1 ? 's' : ''} • Ticket Médio: R$ {cat.avgTicket.toFixed(0)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-900 block">R$ {cat.gross.toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      30%: R$ {cat.platformFee.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ranking de Prestadores */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h4 className="font-black text-[#001838] text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Ranking de Produtividade dos Prestadores
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Atendimentos Concluídos</span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {professionalRanking.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Aguardando fechamento de serviços para ranking de produtividade.
              </div>
            ) : (
              professionalRanking.map((prof, idx) => (
                <div key={prof.name} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      idx === 0 ? 'bg-amber-400 text-slate-950' :
                      idx === 1 ? 'bg-slate-300 text-slate-800' :
                      idx === 2 ? 'bg-amber-700/30 text-amber-900' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">{prof.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {prof.jobs} serviço{prof.jobs > 1 ? 's' : ''} entregue{prof.jobs > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-slate-900 block">R$ {prof.totalGross.toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-indigo-700">
                      Repasse 70%: R$ {(prof.totalGross * 0.7).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
