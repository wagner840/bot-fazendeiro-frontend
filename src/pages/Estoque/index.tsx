import { motion } from 'framer-motion';
import { Plus, Search, Warehouse, Users, Edit3, Trash2, Package } from 'lucide-react';
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
} from '../../components/ui';
import { formatCurrency } from '../../lib/types';
import type { EstoqueGlobalItem } from '../../lib/supabase';

import { useEstoque } from './hooks/useEstoque';
import { EstoqueStats } from './components/EstoqueStats';
import { EstoqueGlobalTable } from './components/EstoqueGlobalTable';
import { AjustarEstoqueModal } from './modals/AjustarEstoqueModal';
import { ZerarEstoqueModal } from './modals/ZerarEstoqueModal';

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

export function Estoque() {
  usePageTitle('Estoque');
  const { selectedEmpresa } = useApp();
  const { isAdmin } = useAuth();

  const {
    funcionarios,
    filteredAgregado,
    filteredFuncionario,
    stats,
    produtoCodigos,
    funcionariosComEstoque,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    expandedRows,
    toggleRow,
    selectedFuncionarioFilter,
    setSelectedFuncionarioFilter,
    showAjustarModal,
    ajustarForm,
    setAjustarForm,
    openAjustarModal,
    closeAjustarModal,
    handleAjustar,
    showZerarModal,
    zerarFuncionarioId,
    openZerarModal,
    closeZerarModal,
    handleZerar,
  } = useEstoque();

  // Columns for funcionario view
  const funcionarioColumns = [
    {
      key: 'funcionario_nome',
      header: 'Funcionario',
      sortable: true,
      render: (row: EstoqueGlobalItem) => (
        <span className="font-heading text-parchment-100">{row.funcionario_nome}</span>
      ),
    },
    {
      key: 'produto_codigo',
      header: 'Produto',
      sortable: true,
      render: (row: EstoqueGlobalItem) => (
        <span className="text-parchment-300">{row.produto_codigo}</span>
      ),
    },
    {
      key: 'quantidade',
      header: 'Quantidade',
      sortable: true,
      render: (row: EstoqueGlobalItem) => (
        <Badge variant="gold">{row.quantidade} un.</Badge>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      render: (row: EstoqueGlobalItem) => (
        <span className="font-heading text-gold-500">
          {formatCurrency(row.quantidade * row.preco_pagamento_funcionario)}
        </span>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: '',
            width: '120px',
            render: (row: EstoqueGlobalItem) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAjustarModal(row.funcionario_id, row.produto_codigo, row.quantidade)}
                  leftIcon={<Edit3 size={14} />}
                >
                  Ajustar
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-gold-500">Estoque</h1>
          <p className="text-parchment-400 mt-1 text-sm sm:text-base">
            {isAdmin
              ? `Gerencie o estoque de ${selectedEmpresa?.nome}`
              : 'Visualize seu estoque'}
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => openAjustarModal()}
            className="w-full sm:w-auto"
          >
            Ajustar Estoque
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <EstoqueStats stats={stats} isAdmin={isAdmin} />

      {/* Main Content */}
      <motion.div variants={item}>
        <Card>
          <CardHeader
            action={
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {isAdmin && activeTab === 'funcionario' && (
                  <select
                    value={selectedFuncionarioFilter || ''}
                    onChange={(e) =>
                      setSelectedFuncionarioFilter(e.target.value ? Number(e.target.value) : null)
                    }
                    className="input-western py-2 text-sm w-full sm:w-auto"
                  >
                    <option value="">Todos os funcionarios</option>
                    {funcionarios.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome}
                      </option>
                    ))}
                  </select>
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
            {isAdmin ? (
              <div className="tabs-western">
                <button
                  className={`tab-western ${activeTab === 'global' ? 'active' : ''}`}
                  onClick={() => setActiveTab('global')}
                >
                  <Warehouse size={14} className="inline mr-2" />
                  Estoque Global
                </button>
                <button
                  className={`tab-western ${activeTab === 'funcionario' ? 'active' : ''}`}
                  onClick={() => setActiveTab('funcionario')}
                >
                  <Users size={14} className="inline mr-2" />
                  Por Funcionario
                </button>
              </div>
            ) : (
              <h2 className="font-heading text-lg text-parchment-100">Meu Estoque</h2>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {activeTab === 'global' && isAdmin ? (
              <EstoqueGlobalTable
                data={filteredAgregado}
                isLoading={isLoading}
                expandedRows={expandedRows}
                onToggleRow={toggleRow}
                onAjustar={openAjustarModal}
                isAdmin={isAdmin}
              />
            ) : (
              <div>
                <Table
                  data={filteredFuncionario}
                  columns={funcionarioColumns}
                  keyExtractor={(row) => `${row.funcionario_id}-${row.produto_codigo}`}
                  isLoading={isLoading}
                  emptyMessage="Nenhum item em estoque"
                  emptyIcon={<Package className="w-12 h-12" />}
                  emptyHint="Use !entrega codigo quantidade @funcionario no Discord"
                />

                {/* Zerar Estoque section for admins */}
                {isAdmin && funcionariosComEstoque.length > 0 && (
                  <div className="p-4 border-t border-leather-700/50">
                    <p className="text-xs text-parchment-500 uppercase tracking-wider mb-3">
                      Zerar Estoque de Funcionario
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {funcionariosComEstoque.map((f) => (
                        <Button
                          key={f.id}
                          variant="danger"
                          size="sm"
                          onClick={() => openZerarModal(f.id)}
                          leftIcon={<Trash2 size={12} />}
                        >
                          Zerar {f.nome}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <AjustarEstoqueModal
        isOpen={showAjustarModal}
        onClose={closeAjustarModal}
        ajustarForm={ajustarForm}
        onFormChange={setAjustarForm}
        funcionarios={funcionarios}
        produtoCodigos={produtoCodigos}
        onAjustar={handleAjustar}
        isSaving={isSaving}
      />

      <ZerarEstoqueModal
        isOpen={showZerarModal}
        onClose={closeZerarModal}
        funcionarioId={zerarFuncionarioId}
        funcionarios={funcionarios}
        onZerar={handleZerar}
        isSaving={isSaving}
      />
    </motion.div>
  );
}
