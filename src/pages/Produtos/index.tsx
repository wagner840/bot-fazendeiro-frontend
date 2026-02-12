import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertTriangle, Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Button, Card } from '../../components/ui';

import { useProdutos } from './hooks/useProdutos';
import { ProdutosStats } from './components/ProdutosStats';
import { QuickPriceButtons } from './components/QuickPriceButtons';
import { ProdutosTable } from './components/ProdutosTable';
import { ProdutosRefTable } from './components/ProdutosRefTable';
import { EditPriceModal } from './modals/EditPriceModal';
import { CreateProductModal } from './modals/CreateProductModal';
import { EditRefModal } from './modals/EditRefModal';
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

export function Produtos() {
  usePageTitle('Produtos');
  const { selectedEmpresa } = useApp();
  const { isAdmin, isSuperadmin } = useAuth();

  const {
    produtos,
    categorias,
    produtosReferencia,
    tiposEmpresa,
    filteredProdutos,
    totalEstoque,
    valorTotalEstoque,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    selectedCategoria,
    setSelectedCategoria,
    editingProduct,
    editPrecoVenda,
    editPrecoPagamento,
    setEditPrecoVenda,
    setEditPrecoPagamento,
    openEditModal,
    closeEditModal,
    handleSavePrice,
    showCreateModal,
    showEditRefModal,
    showDeleteModal,
    selectedProdutoRef,
    produtoForm,
    adminError,
    adminSuccess,
    openCreateModal,
    closeCreateModal,
    openEditRefModal,
    closeEditRefModal,
    openDeleteModal,
    closeDeleteModal,
    setProdutoForm,
    setAdminError,
    handleCreateProduto,
    handleUpdateRef,
    handleDeleteProduto,
    handleBulkPrecos,
    slugify,
  } = useProdutos();

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
          <h1 className="font-display text-2xl sm:text-3xl text-gold-500">Produtos</h1>
          <p className="text-parchment-400 mt-1 text-sm sm:text-base">
            Catálogo e preços de {selectedEmpresa?.nome}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateModal} leftIcon={<Plus size={16} />} className="w-full sm:w-auto">
            Novo Produto
          </Button>
        )}
      </motion.div>

      {/* Quick Price Buttons */}
      {isAdmin && (
        <QuickPriceButtons onBulkPrecos={handleBulkPrecos} isSaving={isSaving} />
      )}

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
      <ProdutosStats
        produtosCount={produtos.length}
        categoriasCount={categorias.length}
        totalEstoque={totalEstoque}
        valorTotalEstoque={valorTotalEstoque}
      />

      {/* Main Content - Products Table */}
      <ProdutosTable
        produtos={filteredProdutos}
        categorias={categorias}
        isLoading={isLoading}
        searchQuery={searchQuery}
        selectedCategoria={selectedCategoria}
        onSearchChange={setSearchQuery}
        onCategoriaChange={setSelectedCategoria}
        onEditProduct={openEditModal}
      />

      {/* Pricing Reference */}
      <motion.div variants={item}>
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <span className="text-parchment-500">Legenda de Preços:</span>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gold-500 flex-shrink-0" />
                <span className="text-parchment-400">Preço de Venda (cliente)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-whiskey-600 flex-shrink-0" />
                <span className="text-parchment-400">Pagamento ao Funcionário (25% padrão)</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Admin Section - Produtos de Referência */}
      {isSuperadmin && (
        <ProdutosRefTable
          produtosReferencia={produtosReferencia}
          onEditProduct={openEditRefModal}
          onDeleteProduct={openDeleteModal}
        />
      )}

      {/* Modals */}
      <EditPriceModal
        isOpen={!!editingProduct}
        onClose={closeEditModal}
        editingProduct={editingProduct}
        editPrecoVenda={editPrecoVenda}
        editPrecoPagamento={editPrecoPagamento}
        onPrecoVendaChange={setEditPrecoVenda}
        onPrecoPagamentoChange={setEditPrecoPagamento}
        onSave={handleSavePrice}
        isSaving={isSaving}
      />

      <CreateProductModal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        isSuperadmin={isSuperadmin}
        tiposEmpresa={tiposEmpresa}
        produtoForm={produtoForm}
        onFormChange={setProdutoForm}
        onCreate={handleCreateProduto}
        isSaving={isSaving}
        adminError={adminError}
        slugify={slugify}
      />

      <EditRefModal
        isOpen={showEditRefModal}
        onClose={closeEditRefModal}
        tiposEmpresa={tiposEmpresa}
        produtoForm={produtoForm}
        onFormChange={setProdutoForm}
        onUpdate={handleUpdateRef}
        isSaving={isSaving}
        adminError={adminError}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        selectedProdutoRef={selectedProdutoRef}
        onDelete={handleDeleteProduto}
        isSaving={isSaving}
      />
    </motion.div>
  );
}
