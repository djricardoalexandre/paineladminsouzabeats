import { useEffect, useState } from 'react';
import { supabase, RadioCadastrada, SolicitacaoOrcamento } from '../lib/supabase';
import { Radio, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalRadios: number;
  totalOrcamentos: number;
  pendentes: number;
  aprovados: number;
  rejeitados: number;
  valorTotal: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRadios: 0,
    totalOrcamentos: 0,
    pendentes: 0,
    aprovados: 0,
    rejeitados: 0,
    valorTotal: 0,
  });
  const [recentRadios, setRecentRadios] = useState<RadioCadastrada[]>([]);
  const [recentOrcamentos, setRecentOrcamentos] = useState<SolicitacaoOrcamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [radiosResult, orcamentosResult] = await Promise.all([
        supabase.from('radios_cadastradas').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('solicitacoes_orcamento').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const radios = radiosResult.data || [];
      const orcamentos = orcamentosResult.data || [];

      setRecentRadios(radios);
      setRecentOrcamentos(orcamentos);

      // Calculate stats
      const pendentes = orcamentos.filter((o) => o.status === 'pendente').length;
      const aprovados = orcamentos.filter((o) => o.status === 'aprovado').length;
      const rejeitados = orcamentos.filter((o) => o.status === 'rejeitado').length;
      const valorTotal = orcamentos.reduce((sum, o) => sum + (o.valor_estimado || 0), 0);

      setStats({
        totalRadios: radios.length,
        totalOrcamentos: orcamentos.length,
        pendentes,
        aprovados,
        rejeitados,
        valorTotal,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: 'Rádios Cadastradas',
      value: stats.totalRadios,
      icon: Radio,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
    {
      label: 'Total de Orçamentos',
      value: stats.totalOrcamentos,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      lightColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
    },
    {
      label: 'Valor Total',
      value: `R$ ${stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      lightColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Pendentes',
      value: stats.pendentes,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      lightColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    },
  ];

  const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    pendente: { icon: Clock, color: 'text-amber-400', label: 'Pendente' },
    aprovado: { icon: CheckCircle, color: 'text-emerald-400', label: 'Aprovado' },
    rejeitado: { icon: XCircle, color: 'text-red-400', label: 'Rejeitado' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.lightColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
            </div>
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Status Overview */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Status dos Orçamentos</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = stats[key as keyof DashboardStats] as number;
            const percentage = stats.totalOrcamentos > 0 ? (count / stats.totalOrcamentos) * 100 : 0;
            return (
              <div key={key} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${percentage * 2.2} 220`}
                      className={config.color}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <config.icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                </div>
                <p className="text-white font-semibold">{count}</p>
                <p className="text-slate-400 text-sm">{config.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Radios */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Rádios Recentes</h2>
            <Link
              to="/radios"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {recentRadios.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Nenhuma rádio cadastrada</p>
            ) : (
              recentRadios.map((radio) => (
                <div
                  key={radio.id}
                  className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Radio className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{radio.nome_radio}</p>
                    <p className="text-slate-400 text-sm truncate">
                      {radio.cidade && radio.estado ? `${radio.cidade}, ${radio.estado}` : 'Sem localização'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Budget Requests */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Orçamentos Recentes</h2>
            <Link
              to="/orcamentos"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrcamentos.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Nenhum orçamento solicitado</p>
            ) : (
              recentOrcamentos.map((orcamento) => {
                const status = statusConfig[orcamento.status] || statusConfig.pendente;
                return (
                  <div
                    key={orcamento.id}
                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{orcamento.nome_cliente}</p>
                      <p className="text-slate-400 text-sm truncate">{orcamento.servico_solicitado}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <status.icon className={`w-4 h-4 ${status.color}`} />
                      <span className={`text-sm ${status.color}`}>{status.label}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
