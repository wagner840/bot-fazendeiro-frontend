import { motion } from 'framer-motion';
import { Search, Users, History, Eye, CreditCard, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  Button,
  Badge,
  Avatar,
} from '../../components/ui';
import { formatCurrency, formatDateTime, type HistoricoPagamento } from '../../lib/types';
import type { AuditoriaFuncionario } from '../../lib/supabase';

import { useAuditoria } from './hooks/useAuditoria';
import { AuditoriaStats } from './components/AuditoriaStats';
import { DetailsModal } from './modals/DetailsModal';
import { PagarModal } from './modals/PagarModal';
import { TIPO_LABELS, TIPO_VARIANTS } from './types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Auditoria() {
  usePageTitle('Auditoria');
  const { selectedEmpresa } = useApp();
  const { isAdmin } = useAuth();

  const {
    auditoriaFuncionarios,
    filteredHistorico,
    filteredResumo,
    stats,
    tiposUnicos,
    isLoading,
    isSaving,
    loadingDetails,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filterFuncionario,
    setFilterFuncionario,
    filterTipo,
    setFilterTipo,
    filterDateStart,
    setFilterDateStart,
    filterDateEnd,
    setFilterDateEnd,
    showDetailsModal,
    selectedFuncionarioId,
    funcionarioHistorico,
    openDetailsModal,
    closeDetailsModal,
    showPagarModal,
    pagarFuncionarioId,
    openPagarModal,
    closePagarModal,
    handlePagarEstoque,
    getFuncionarioNome,
  } = useAuditoria();

  // Columns for resumo tab
  const resumoColumns = [
    {
      key: 'nome',
      header: 'Funcionario',
      sortable: true,
      render: (row: AuditoriaFuncionario) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.nome} size="sm" />
          <div>
            <p className="font-heading text-parchment-100">{row.nome}</p>
            <p className="text-xs text-parchment-500">{row.discord_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'total_historico',
      header: 'Total Historico',
      sortable: true,
      render: (row: AuditoriaFuncionario) => (
        <span className="font-heading text-parchment-300">
          {formatCurrency(row.total_historico)}
        </span>
      ),
    },
    {
      key: 'saldo_atual',
      header: 'Saldo Atual',
      sortable: true,
      render: (row: AuditoriaFuncionario) => (
        <span className="font-heading text-gold-500">{formatCurrency(row.saldo_atual)}</span>
      ),
    },
    {
      key: 'estoque_valor',
      header: 'Em Estoque',
      sortable: true,
      render: (row: AuditoriaFuncionario) => (
        <Badge variant={row.estoque_valor > 0 ? 'gold' : 'default'}>
          {formatCurrency(row.estoque_valor)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '200px',
      render: (row: AuditoriaFuncionario) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDetailsModal(row.funcionario_id)}
            leftIcon={<Eye size={14} />}
          >
            Detalhes
          </Button>
          {row.estoque_valor > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => openPagarModal(row.funcionario_id)}
              leftIcon={<CreditCard size={14} />}
            >
              Pagar
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Columns for historico tab
  const historicoColumns = [
    {
      key: 'data_pagamento',
      header: 'Data',
      sortable: true,
      render: (row: HistoricoPagamento) => (
        <span className="text-parchment-400">{formatDateTime(row.data_pagamento)}</span>
      ),
    },
    {
      key: 'funcionario',
      header: 'Funcionario',
      render: (row: HistoricoPagamento) => {
        const func = row.funcionario as { nome?: string } | undefined;
        return (
          <span className="font-heading text-parchment-100">{func?.nome || 'Desconhecido'}</span>
        );
      },
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (row: HistoricoPagamento) => (
        <Badge variant={TIPO_VARIANTS[row.tipo] || 'default'}>
          {TIPO_LABELS[row.tipo] || row.tipo}
        </Badge>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      sortable: true,
      render: (row: HistoricoPagamento) => (
        <span className="font-heading text-gold-500">{formatCurrency(row.valor)}</span>
      ),
    },
    {
      key: 'descricao',
      header: 'Descricao',
      render: (row: HistoricoPagamento) => (
        <span className="text-parchment-400 text-sm truncate max-w-xs block">
          {row.descricao || '-'}
        </span>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-parchment-500">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div
        variants={item}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-gold-500">
            Auditoria de Pagamentos
          </h1>
          <p className="text-parchment-400 mt-1 text-sm sm:text-base">
            Acompanhe o historico financeiro de {selectedEmpresa?.nome}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <AuditoriaStats stats={stats} />

      {/* Main Content */}
      <motion.div variants={item}>
        <Card>
          <CardHeader
            action={
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
                {activeTab === 'historico' && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                      <select
                        value={filterFuncionario || ''}
                        onChange={(e) =>
                          setFilterFuncionario(e.target.value ? Number(e.target.value) : null)
                        }
                        className="input-western py-2 text-sm w-full sm:w-auto"
                      >
                        <option value="">Todos funcionarios</option>
                        {auditoriaFuncionarios.map((f) => (
                          <option key={f.funcionario_id} value={f.funcionario_id}>
                            {f.nome}
                          </option>
                        ))}
                      </select>

                      <select
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value)}
                        className="input-western py-2 text-sm w-full sm:w-auto"
                      >
                        <option value="">Todos tipos</option>
                        {tiposUnicos.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {TIPO_LABELS[tipo] || tipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Calendar size={14} className="text-parchment-500 hidden sm:block" />
                      <input
                        type="date"
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                        className="input-western py-2 text-sm flex-1 sm:flex-none"
                        placeholder="Data inicio"
                      />
                      <span className="text-parchment-500">-</span>
                      <input
                        type="date"
                        value={filterDateEnd}
                        onChange={(e) => setFilterDateEnd(e.target.value)}
                        className="input-western py-2 text-sm flex-1 sm:flex-none"
                        placeholder="Data fim"
                      />
                    </div>
                  </>
                )}
                <div className="relative flex-1 sm:flex-none">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-500"
                  />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-western pl-9 py-2 text-sm w-full sm:w-64"
                  />
                </div>
              </div>
            }
          >
            <div className="tabs-western">
              <button
                className={`tab-western ${activeTab === 'resumo' ? 'active' : ''}`}
                onClick={() => setActiveTab('resumo')}
              >
                <Users size={14} className="inline mr-2" />
                Resumo por Funcionario
              </button>
              <button
                className={`tab-western ${activeTab === 'historico' ? 'active' : ''}`}
                onClick={() => setActiveTab('historico')}
              >
                <History size={14} className="inline mr-2" />
                Historico de Pagamentos
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {activeTab === 'resumo' ? (
              <Table
                data={filteredResumo}
                columns={resumoColumns}
                keyExtractor={(row) => row.funcionario_id}
                isLoading={isLoading}
                emptyMessage="Nenhum funcionario encontrado"
              />
            ) : (
              <Table
                data={filteredHistorico}
                columns={historicoColumns}
                keyExtractor={(row) => row.id}
                isLoading={isLoading}
                emptyMessage="Nenhum pagamento registrado"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <DetailsModal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        funcionarioNome={getFuncionarioNome(selectedFuncionarioId)}
        funcionarioHistorico={funcionarioHistorico}
        loadingDetails={loadingDetails}
      />

      <PagarModal
        isOpen={showPagarModal}
        onClose={closePagarModal}
        funcionarioId={pagarFuncionarioId}
        auditoriaFuncionarios={auditoriaFuncionarios}
        onPagar={handlePagarEstoque}
        isSaving={isSaving}
        getFuncionarioNome={getFuncionarioNome}
      />
    </motion.div>
  );
}
