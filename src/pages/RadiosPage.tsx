import { useEffect, useState } from 'react';
import { supabase, RadioCadastrada } from '../lib/supabase';
import {
  Radio,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  FileText,
} from 'lucide-react';

const emptyRadio: Omit<RadioCadastrada, 'id' | 'created_at' | 'updated_at'> = {
  nome_radio: '',
  email: '',
  telefone: '',
  cidade: '',
  estado: '',
  frequencia: '',
  site: '',
  responsavel: '',
  observacoes: '',
};

export function RadiosPage() {
  const [radios, setRadios] = useState<RadioCadastrada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRadio, setEditingRadio] = useState<RadioCadastrada | null>(null);
  const [formData, setFormData] = useState(emptyRadio);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchRadios();
  }, []);

  async function fetchRadios() {
    try {
      const { data, error } = await supabase
        .from('radios_cadastradas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRadios(data || []);
    } catch (error) {
      console.error('Error fetching radios:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRadios = radios.filter(
    (radio) =>
      radio.nome_radio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      radio.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      radio.estado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      radio.responsavel?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openCreateModal() {
    setEditingRadio(null);
    setFormData(emptyRadio);
    setModalOpen(true);
  }

  function openEditModal(radio: RadioCadastrada) {
    setEditingRadio(radio);
    setFormData({
      nome_radio: radio.nome_radio,
      email: radio.email || '',
      telefone: radio.telefone || '',
      cidade: radio.cidade || '',
      estado: radio.estado || '',
      frequencia: radio.frequencia || '',
      site: radio.site || '',
      responsavel: radio.responsavel || '',
      observacoes: radio.observacoes || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingRadio) {
        const { error } = await supabase
          .from('radios_cadastradas')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRadio.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('radios_cadastradas').insert([formData]);

        if (error) throw error;
      }

      await fetchRadios();
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving radio:', error);
      alert('Erro ao salvar rádio. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from('radios_cadastradas').delete().eq('id', id);

      if (error) throw error;
      await fetchRadios();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting radio:', error);
      alert('Erro ao excluir rádio. Tente novamente.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Rádios Cadastradas</h1>
          <p className="text-slate-400 mt-1">{radios.length} rádios encontradas</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          Nova Rádio
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar rádios..."
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50 border-b border-slate-700">
                <th className="text-left text-sm font-medium text-slate-400 px-4 py-3">Rádio</th>
                <th className="text-left text-sm font-medium text-slate-400 px-4 py-3">Contato</th>
                <th className="text-left text-sm font-medium text-slate-400 px-4 py-3">Localização</th>
                <th className="text-left text-sm font-medium text-slate-400 px-4 py-3">Frequência</th>
                <th className="text-right text-sm font-medium text-slate-400 px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredRadios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">
                    Nenhuma rádio encontrada
                  </td>
                </tr>
              ) : (
                filteredRadios.map((radio) => (
                  <tr key={radio.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <Radio className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{radio.nome_radio}</p>
                          <p className="text-slate-400 text-sm">{radio.responsavel || 'Sem responsável'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {radio.email && (
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <Mail className="w-4 h-4 text-slate-500" />
                            {radio.email}
                          </div>
                        )}
                        {radio.telefone && (
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <Phone className="w-4 h-4 text-slate-500" />
                            {radio.telefone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        {radio.cidade && radio.estado ? `${radio.cidade}, ${radio.estado}` : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-300 text-sm">{radio.frequencia || '-'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(radio)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {deleteConfirm === radio.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(radio.id)}
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
                            onClick={() => setDeleteConfirm(radio.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
                {editingRadio ? 'Editar Rádio' : 'Nova Rádio'}
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
                    Nome da Rádio *
                  </label>
                  <div className="relative">
                    <Radio className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.nome_radio}
                      onChange={(e) => setFormData({ ...formData, nome_radio: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Radio FM Cultura"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contato@radio.com"
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
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Cidade</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.cidade || ''}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="São Paulo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Estado</label>
                  <input
                    type="text"
                    value={formData.estado || ''}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Frequência</label>
                  <input
                    type="text"
                    value={formData.frequencia || ''}
                    onChange={(e) => setFormData({ ...formData, frequencia: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="98.5 MHz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Site</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.site || ''}
                      onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="www.radio.com.br"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Responsável</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.responsavel || ''}
                      onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Observações</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <textarea
                      value={formData.observacoes || ''}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Observações adicionais..."
                    />
                  </div>
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
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
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
