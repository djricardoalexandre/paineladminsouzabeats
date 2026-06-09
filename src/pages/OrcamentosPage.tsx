import { useEffect, useState } from 'react';
import { supabase, SolicitacaoOrcamento } from '../lib/supabase';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Mail,
  Phone,
  Building,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';

const emptyOrcamento: Omit<SolicitacaoOrcamento, 'id' | 'created_at' | 'updated_at' | 'data_solicitacao' | 'data_resposta'> = {
  nome_cliente: '',
  email: '',
  telefone: '',
  empresa: '',
  servico_solicitado: '',
  descricao: '',
  valor_estimado: null,
  status: 'pendente',
  observacoes: '',
};

const statusOptions = [
  { value: 'pendente', label: 'Pendente', icon: Clock, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { value: 'aprovado', label: 'Aprovado', icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { value: 'rejeitado', label: 'Rejeitado', icon: XCircle, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
];

export function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<SolicitacaoOrcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<SolicitacaoOrcamento | null>(null);
  const [formData, setFormData] = useState(emptyOrcamento);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  async function fetchOrcamentos() {
    try {
      const { data, error } = await supabase
        .from('solicitacoes_orcamento')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrcamentos(data || []);
    } catch (error) {
      console.error('Error fetching orcamentos:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrcamentos = orcamentos.filter((orcamento) => {
    const matchesSearch =
      orcamento.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orcamento.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orcamento.servico_solicitado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orcamento.empresa?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || orcamento.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openCreateModal() {
    setEditingOrcamento(null);
    setFormData(emptyOrcamento);
    setModalOpen(true);
  }

  function openEditModal(orcamento: SolicitacaoOrcamento) {
    setEditingOrcamento(orcamento);
    setFormData({
      nome_cliente: orcamento.nome_cliente,
      email: orcamento.email,
      telefone: orcamento.telefone || '',
      empresa: orcamento.empresa || '',
      servico_solicitado: orcamento.servico_solicitado,
      descricao: orcamento.descricao || '',
      valor_estimado: orcamento.valor_estimado,
      status: orcamento.status,
      observacoes: orcamento.observacoes || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingOrcamento) {
        const updateData = {
          ...formData,
          valor_estimado: formData.valor_estimado ? Number(formData.valor_estimado) : null,
          data_resposta: formData.status !== 'pendente' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('solicitacoes_orcamento')
          .update(updateData)
          .eq('id', editingOrcamento.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('solicitacoes_orcamento').insert([{
          ...formData,
          valor_estimado: formData.valor_estimado ? Number(formData.valor_estimado) : null,
        }]);

        if (error) throw error;
      }

      await fetchOrcamentos();
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving orcamento:', error);
      alert('Erro ao salvar orçamento. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from('solicitacoes_orcamento').delete().eq('id', id);

      if (error) throw error;
      await fetchOrcamentos();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting orcamento:', error);
      alert('Erro ao excluir orçamento. Tente novamente.');
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('solicitacoes_orcamento')
        .update({
          status: newStatus,
          data_resposta: newStatus !== 'pendente' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      await fetchOrcamentos();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  const getStatusConfig = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Solicitações de Orçamento</h1>
          <p className="text-slate-400 mt-1">{orcamentos.length} solicitações encontradas</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Solicitação
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar solicitações..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pendente', 'aprovado', 'rejeitado'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
              }`}
            >
              {status === 'all' ? 'Todos' : getStatusConfig(status).label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50 border-b border-slate-700">
                <th className="text-left text-sm font-medium text-slate-400 px-4 py-3">Cliente</th>
                <th className="text-left text-sm font-medium text-slate-400 px-4 py-3">Serviço</th>
                <th className="text-left text-sm font-medium text-slate-400 px-4 py-3">Valor</th>
                <th className="text-left text-sm font-medium text-slate-400 px-4 py-3">Status</th>
                <th className="text-left text-sm font-medium text-slate-400 px-4 py-3">Data</th>
                <th className="text-right text-sm font-medium text-slate-400 px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredOrcamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-8">
                    Nenhuma solicitação encontrada
                  </td>
                </tr>
              ) : (
                filteredOrcamentos.map((orcamento) => {
                  const statusConfig = getStatusConfig(orcamento.status);
                  return (
                    <tr key={orcamento.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{orcamento.nome_cliente}</p>
                            <p className="text-slate-400 text-sm">{orcamento.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-white font-medium">{orcamento.servico_solicitado}</p>
                        {orcamento.empresa && (
                          <p className="text-slate-400 text-sm">{orcamento.empresa}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-white font-medium">
                          {orcamento.valor_estimado
                            ? `R$ ${orcamento.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <statusConfig.icon className={`w-4 h-4 ${statusConfig.color.split(' ')[1]}`} />
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-slate-300 text-sm">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {new Date(orcamento.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Status Change */}
                          <div className="flex items-center gap-1 border-r border-slate-700 pr-2 mr-1">
                            {statusOptions.map((status) => (
                              <button
                                key={status.value}
                                onClick={() => updateStatus(orcamento.id, status.value)}
                                className={`p-1.5 rounded transition-colors ${
                                  orcamento.status === status.value
                                    ? status.color
                                    : 'text-slate-500 hover:text-white hover:bg-slate-700'
                                }`}
                                title={status.label}
                              >
                                <status.icon className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => openEditModal(orcamento)}
                            className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {deleteConfirm === orcamento.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(orcamento.id)}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              >
                                Confirmar
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(orcamento.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingOrcamento ? 'Editar Solicitação' : 'Nova Solicitação'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.nome_cliente}
                    onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.telefone || ''}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Empresa</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.empresa || ''}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Serviço Solicitado *
                  </label>
                  <input
                    type="text"
                    value={formData.servico_solicitado}
                    onChange={(e) => setFormData({ ...formData, servico_solicitado: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Campanha Publicitária"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição</label>
                  <textarea
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Detalhes do serviço solicitado..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Valor Estimado</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valor_estimado || ''}
                      onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value ? Number(e.target.value) : null })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Observações</label>
                  <textarea
                    value={formData.observacoes || ''}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
