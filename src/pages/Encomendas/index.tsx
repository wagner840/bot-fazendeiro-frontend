import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertTriangle, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Button } from '../../components/ui';

import { useEncomendas } from './hooks/useEncomendas';
import { EncomendasStats } from './components/EncomendasStats';
import { EncomendasTable } from './components/EncomendasTable';
import { DetailsModal } from './modals/DetailsModal';
import { CreateEncomendaModal } from './modals/CreateEncomendaModal';
import { EditEncomendaModal } from './modals/EditEncomendaModal';
import { DeleteConfirmModal } from './modals/DeleteConfirmModal';

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

export function Encomendas() {
  usePageTitle('Encomendas');
  const { selectedEmpresa } = useApp();
  const { isAdmin } = useAuth();

  const {
    filteredEncomendas,
    produtos,
    stats,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedEncomenda,
    showDetailsModal,
    openDetailsModal,
    closeDetailsModal,
    handleUpdateStatus,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    encomendaForm,
    adminError,
    adminSuccess,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    setEncomendaForm,
    setAdminError,
    handleCreateEncomenda,
    handleUpdateEncomenda,
    handleDeleteEncomenda,
  } = useEncomendas();

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
          <h1 className="font-display text-2xl sm:text-3xl text-gold-500">Encomendas</h1>
          <p className="text-parchment-400 mt-1 text-sm sm:text-base">
            Pedidos e entregas de {selectedEmpresa?.nome}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateModal} leftIcon={<Plus size={16} />} className="w-full sm:w-auto">
            Nova Encomenda
          </Button>
        )}
      </motion.div>

      {/* Admin Alerts */}
      <AnimatePresence>
        {adminError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5" />
            {adminError}
            <button onClick={() => setAdminError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {adminSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-900/30 border border-green-700 rounded-western text-green-400 flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            {adminSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <EncomendasStats stats={stats} />

      {/* Main Content - Encomendas Table */}
      <EncomendasTable
        encomendas={filteredEncomendas}
        isLoading={isLoading}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onViewDetails={openDetailsModal}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        isAdmin={isAdmin}
      />

      {/* Modals */}
      <DetailsModal
        isOpen={showDetailsModal}
        onClose={closeDetailsModal}
        encomenda={selectedEncomenda}
        onUpdateStatus={handleUpdateStatus}
      />

      <CreateEncomendaModal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        encomendaForm={encomendaForm}
        onFormChange={setEncomendaForm}
        onCreate={handleCreateEncomenda}
        isSaving={isSaving}
        adminError={adminError}
        produtos={produtos}
      />

      <EditEncomendaModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        encomendaForm={encomendaForm}
        onFormChange={setEncomendaForm}
        onUpdate={handleUpdateEncomenda}
        isSaving={isSaving}
        adminError={adminError}
        produtos={produtos}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        encomenda={selectedEncomenda}
        onDelete={handleDeleteEncomenda}
        isSaving={isSaving}
      />
    </motion.div>
  );
}
