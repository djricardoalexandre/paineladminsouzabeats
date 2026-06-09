import { useEffect, useState } from 'react';
import { supabase, RadioCadastrada, SolicitacaoOrcamento } from '../lib/supabase';
import {
  FileDown,
  Radio,
  FileText,
  TrendingUp,
  Calendar,
  Filter,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function RelatoriosPage() {
  const [radios, setRadios] = useState<RadioCadastrada[]>([]);
  const [orcamentos, setOrcamentos] = useState<SolicitacaoOrcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<{
    start: string;
    end: string;
  }>({
    start: '',
    end: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [radiosResult, orcamentosResult] = await Promise.all([
        supabase.from('radios_cadastradas').select('*').order('created_at', { ascending: false }),
        supabase.from('solicitacoes_orcamento').select('*').order('created_at', { ascending: false }),
      ]);

      setRadios(radiosResult.data || []);
      setOrcamentos(orcamentosResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRadios = radios.filter((radio) => {
    if (!dateFilter.start || !dateFilter.end) return true;
    const createdAt = new Date(radio.created_at);
    return createdAt >= new Date(dateFilter.start) && createdAt <= new Date(dateFilter.end + 'T23:59:59');
  });

  const filteredOrcamentos = orcamentos.filter((orcamento) => {
    if (!dateFilter.start || !dateFilter.end) return true;
    const createdAt = new Date(orcamento.created_at);
    return createdAt >= new Date(dateFilter.start) && createdAt <= new Date(dateFilter.end + 'T23:59:59');
  });

  function generateRadiosPDF() {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('Relatório de Rádios Cadastradas', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Total de registros: ${filteredRadios.length}`, pageWidth / 2, 34, { align: 'center' });

    // Table
    const tableData = filteredRadios.map((radio) => [
      radio.nome_radio,
      radio.email || '-',
      radio.telefone || '-',
      radio.cidade && radio.estado ? `${radio.cidade}, ${radio.estado}` : '-',
      radio.frequencia || '-',
      radio.responsavel || '-',
      new Date(radio.created_at).toLocaleDateString('pt-BR'),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Nome', 'E-mail', 'Telefone', 'Localização', 'Frequência', 'Responsável', 'Cadastro']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
    });

    doc.save(`radios_cadastradas_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  function generateOrcamentosPDF() {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Calculate totals
    const totalValor = filteredOrcamentos.reduce((sum, o) => sum + (o.valor_estimado || 0), 0);
    const pendentes = filteredOrcamentos.filter(o => o.status === 'pendente').length;
    const aprovados = filteredOrcamentos.filter(o => o.status === 'aprovado').length;
    const rejeitados = filteredOrcamentos.filter(o => o.status === 'rejeitado').length;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('Relatório de Solicitações de Orçamento', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' });
    doc.text(`Total: ${filteredOrcamentos.length} | Pendentes: ${pendentes} | Aprovados: ${aprovados} | Rejeitados: ${rejeitados}`, pageWidth / 2, 34, { align: 'center' });
    doc.text(`Valor Total Estimado: R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth / 2, 40, { align: 'center' });

    // Table
    const tableData = filteredOrcamentos.map((orcamento) => [
      orcamento.nome_cliente,
      orcamento.email,
      orcamento.empresa || '-',
      orcamento.servico_solicitado,
      orcamento.valor_estimado ? `R$ ${orcamento.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-',
      orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1),
      new Date(orcamento.created_at).toLocaleDateString('pt-BR'),
    ]);

    autoTable(doc, {
      startY: 46,
      head: [['Cliente', 'E-mail', 'Empresa', 'Serviço', 'Valor', 'Status', 'Data']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
    });

    doc.save(`orcamentos_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  function generateCompletePDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Cover
    doc.setFontSize(28);
    doc.setTextColor(30, 41, 59);
    doc.text('Admin SouzaBeats', pageWidth / 2, 80, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(100, 116, 139);
    doc.text('Relatório Completo', pageWidth / 2, 95, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 120, { align: 'center' });

    // Summary
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Resumo Geral', 14, 150);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    const summaryData = [
      `Total de Rádios Cadastradas: ${filteredRadios.length}`,
      `Total de Solicitações de Orçamento: ${filteredOrcamentos.length}`,
      `Orçamentos Pendentes: ${filteredOrcamentos.filter(o => o.status === 'pendente').length}`,
      `Orçamentos Aprovados: ${filteredOrcamentos.filter(o => o.status === 'aprovado').length}`,
      `Orçamentos Rejeitados: ${filteredOrcamentos.filter(o => o.status === 'rejeitado').length}`,
      `Valor Total Estimado: R$ ${filteredOrcamentos.reduce((sum, o) => sum + (o.valor_estimado || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ];
    summaryData.forEach((text, i) => {
      doc.text(text, 14, 160 + i * 8);
    });

    // Radios Table
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Rádios Cadastradas', pageWidth / 2, 20, { align: 'center' });

    const radiosData = filteredRadios.map((radio) => [
      radio.nome_radio,
      radio.email || '-',
      radio.telefone || '-',
      radio.cidade && radio.estado ? `${radio.cidade}, ${radio.estado}` : '-',
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Nome', 'E-mail', 'Telefone', 'Localização']],
      body: radiosData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Orcamentos Table
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Solicitações de Orçamento', pageWidth / 2, 20, { align: 'center' });

    const orcamentosData = filteredOrcamentos.map((orcamento) => [
      orcamento.nome_cliente,
      orcamento.servico_solicitado,
      orcamento.valor_estimado ? `R$ ${orcamento.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-',
      orcamento.status.charAt(0).toUpperCase() + orcamento.status.slice(1),
      new Date(orcamento.created_at).toLocaleDateString('pt-BR'),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Cliente', 'Serviço', 'Valor', 'Status', 'Data']],
      body: orcamentosData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [147, 51, 234] },
    });

    doc.save(`relatorio_completo_${new Date().toISOString().split('T')[0]}.pdf`);
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
      <div>
        <h1 className="text-2xl font-bold text-white">Relatórios</h1>
        <p className="text-slate-400 mt-1">Exporte relatórios em formato PDF</p>
      </div>

      {/* Date Filter */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <h3 className="text-white font-medium">Filtro por Data</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Data Início</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Data Fim</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDateFilter({ start: '', end: '' })}
              className="px-4 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Limpar Filtro
            </button>
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Radios Report */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Radio className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Rádios Cadastradas</h3>
              <p className="text-slate-400 text-sm">{filteredRadios.length} registros</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Relatório completo de todas as rádios cadastradas no sistema com informações de contato e localização.
          </p>
          <button
            onClick={generateRadiosPDF}
            disabled={filteredRadios.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>

        {/* Budget Report */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Solicitações de Orçamento</h3>
              <p className="text-slate-400 text-sm">{filteredOrcamentos.length} registros</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Relatório de todas as solicitações com valores, status e informações dos clientes.
          </p>
          <button
            onClick={generateOrcamentosPDF}
            disabled={filteredOrcamentos.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>

        {/* Complete Report */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Relatório Completo</h3>
              <p className="text-slate-400 text-sm">{filteredRadios.length + filteredOrcamentos.length} registros</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Relatório consolidado com resumo geral, lista de rádios e solicitações de orçamento.
          </p>
          <button
            onClick={generateCompletePDF}
            disabled={filteredRadios.length === 0 && filteredOrcamentos.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Resumo dos Dados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Rádios</p>
            <p className="text-2xl font-bold text-white">{filteredRadios.length}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total Orçamentos</p>
            <p className="text-2xl font-bold text-white">{filteredOrcamentos.length}</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Valor Total</p>
            <p className="text-2xl font-bold text-white">
              R$ {filteredOrcamentos.reduce((sum, o) => sum + (o.valor_estimado || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Taxa Aprovação</p>
            <p className="text-2xl font-bold text-white">
              {filteredOrcamentos.length > 0
                ? `${Math.round((filteredOrcamentos.filter(o => o.status === 'aprovado').length / filteredOrcamentos.length) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
