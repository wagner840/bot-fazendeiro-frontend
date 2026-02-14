import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Database,
  RefreshCw,
  Info,
  DollarSign,
  Crown,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { usePageTitle } from '../hooks/usePageTitle';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  Modal,
  ModalFooter,
} from '../components/ui';
import type { ModoPagamento } from '../lib/types';
import { formatDate } from '../lib/types';
import { updateModoPagamento } from '../lib/supabase';
import { useDiscordUserNames, useServerNames } from '../hooks/useEntityNames';
import { getBaseScenarioLabel, getBusinessIcon } from '../lib/businessIcons';

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

export function Configuracoes() {
  usePageTitle('Configurações');
  const { selectedEmpresa, isLoadingEmpresas, addToast, refreshEmpresas } = useApp();
  const { subscription, isAdmin } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingPaymentMode, setIsUpdatingPaymentMode] = useState(false);
  const [pendingMode, setPendingMode] = useState<ModoPagamento | null>(null);
  const serverNames = useServerNames([selectedEmpresa?.guild_id]);
  const userNames = useDiscordUserNames([selectedEmpresa?.proprietario_discord_id]);

  const BusinessIcon = getBusinessIcon(selectedEmpresa?.tipo_empresa?.codigo);

  if (isLoadingEmpresas) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500" />
      </div>
    );
  }

  if (!selectedEmpresa) {
     return (
        <div className="text-center py-12">
           <h2 className="text-2xl font-display text-gold-500">Nenhuma empresa selecionada</h2>
           <p className="text-parchment-400 mt-2">Selecione uma empresa no menu lateral para ver as configurações.</p>
        </div>
     );
  }

  async function handleRefreshCache() {
    setIsRefreshing(true);
    // Simulate cache refresh
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    addToast({
      type: 'success',
      title: 'Cache atualizado',
      message: 'Os dados foram recarregados com sucesso.',
    });
  }

  async function handlePaymentModeChange(newMode: ModoPagamento) {
    if (!selectedEmpresa || isUpdatingPaymentMode) return;

    setIsUpdatingPaymentMode(true);
    try {
      await updateModoPagamento(selectedEmpresa.id, newMode);
      await refreshEmpresas();
      addToast({
        type: 'success',
        title: 'Modo de pagamento atualizado',
        message: `Modo alterado para: ${newMode === 'producao' ? 'Produção' : 'Entrega'}`,
      });
    } catch (error) {
      console.error('Error updating payment mode:', error);
      addToast({
        type: 'error',
        title: 'Erro ao atualizar',
        message: 'Não foi possível alterar o modo de pagamento.',
      });
    } finally {
      setIsUpdatingPaymentMode(false);
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item}>
        <h1 className="font-display text-2xl sm:text-3xl text-gold-500">Configurações</h1>
        <p className="text-parchment-400 mt-1 text-sm sm:text-base">
          Configurações e informações da empresa
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-heading text-lg text-parchment-100 flex items-center gap-2">
                <Building2 size={20} className="text-gold-500" />
                Informações da Empresa
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company Display */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-leather-800/30 rounded-western text-center sm:text-left">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-western bg-gradient-to-br from-leather-700 to-leather-800 flex items-center justify-center shadow-western-lg shrink-0">
                  <BusinessIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gold-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl sm:text-2xl text-gold-500 break-words">
                    {selectedEmpresa?.nome || 'Empresa'}
                  </h3>
                  <p className="text-parchment-400 mt-1 text-sm sm:text-base">
                    {selectedEmpresa?.tipo_empresa?.nome}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-3">
                    <Badge variant="gold">
                      {selectedEmpresa?.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-xs sm:text-sm text-parchment-500">
                      Desde: {selectedEmpresa?.data_criacao ? formatDate(selectedEmpresa.data_criacao) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-leather-800/20 rounded-western">
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">
                    ID da Empresa
                  </p>
                  <p className="font-mono text-sm text-parchment-300">
                    {selectedEmpresa?.id || '-'}
                  </p>
                </div>
                <div className="p-4 bg-leather-800/20 rounded-western">
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">
                    Servidor (Discord)
                  </p>
                  <p className="font-heading text-parchment-300">
                    {selectedEmpresa?.guild_id
                      ? serverNames[selectedEmpresa.guild_id] || 'Sem nome cadastrado'
                      : '-'}
                  </p>
                  {selectedEmpresa?.guild_id && (
                    <p className="font-mono text-xs text-parchment-500 mt-1">
                      ID: {selectedEmpresa.guild_id}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-leather-800/20 rounded-western">
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">
                    Tipo de Empresa
                  </p>
                  <p className="font-heading text-parchment-300">
                    {selectedEmpresa?.tipo_empresa?.codigo || '-'}
                  </p>

                </div>
                <div className="p-4 bg-leather-800/20 rounded-western">
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">
                    Cenário (Base REDM)
                  </p>
                  <p className="font-heading text-parchment-300">{getBaseScenarioLabel(selectedEmpresa?.tipo_empresa?.base_redm_id)}</p>
                </div>
                <div className="p-4 bg-leather-800/20 rounded-western">
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">
                    Proprietário
                  </p>
                  <p className="font-heading text-parchment-300">
                    {selectedEmpresa?.proprietario_discord_id
                      ? userNames[selectedEmpresa.proprietario_discord_id] || 'Sem nome cadastrado'
                      : '-'}
                  </p>
                  {selectedEmpresa?.proprietario_discord_id && (
                    <p className="font-mono text-xs text-parchment-500 mt-1">
                      ID: {selectedEmpresa.proprietario_discord_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="divider-western" />

              {/* Description */}
              <div>
                <p className="text-xs text-parchment-500 uppercase tracking-wider mb-2">
                  Descrição do Tipo de Negócio
                </p>
                <p className="text-parchment-400 leading-relaxed">
                  {selectedEmpresa?.tipo_empresa?.descricao || 'Sem descrição disponível.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="space-y-6">
          {/* System Actions */}
          <Card>
            <CardHeader>
              <h2 className="font-heading text-lg text-parchment-100 flex items-center gap-2">
                <Database size={20} className="text-gold-500" />
                Sistema
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={handleRefreshCache}
                isLoading={isRefreshing}
                leftIcon={<RefreshCw size={16} />}
              >
                Atualizar Cache
              </Button>

              <div className="p-3 bg-leather-800/20 rounded-western text-sm text-parchment-500">
                <Info size={14} className="inline mr-2" />
                Limpa o cache local e recarrega todos os dados do servidor.
              </div>
            </CardContent>
          </Card>

          {/* Payment Mode Card */}
          <Card>
            <CardHeader>
              <h2 className="font-heading text-lg text-parchment-100 flex items-center gap-2">
                <DollarSign size={20} className="text-gold-500" />
                Modo de Pagamento
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-leather-800/30 rounded-western">
                <p className="text-xs text-parchment-500 uppercase tracking-wider mb-2">
                  Modo Atual
                </p>
                <Badge variant={selectedEmpresa?.modo_pagamento === 'entrega' ? 'success' : 'gold'}>
                  {selectedEmpresa?.modo_pagamento === 'entrega' ? 'Entrega' : 'Producao'}
                </Badge>
              </div>

              <div className="space-y-2">
                <Button
                  variant={selectedEmpresa?.modo_pagamento === 'producao' ? 'primary' : 'secondary'}
                  className="w-full justify-start"
                  onClick={() => setPendingMode('producao')}
                  disabled={selectedEmpresa?.modo_pagamento === 'producao' || isUpdatingPaymentMode}
                >
                  Modo Producao
                </Button>
                <Button
                  variant={selectedEmpresa?.modo_pagamento === 'entrega' ? 'primary' : 'secondary'}
                  className="w-full justify-start"
                  onClick={() => setPendingMode('entrega')}
                  disabled={selectedEmpresa?.modo_pagamento === 'entrega' || isUpdatingPaymentMode}
                >
                  Modo Entrega
                </Button>
              </div>

              <div className="p-3 bg-leather-800/20 rounded-western text-xs text-parchment-500 space-y-2">
                <p><strong className="text-parchment-400">Produção:</strong> Funcionário ganha comissão apenas pelos itens que ele mesmo produziu.</p>
                <p><strong className="text-parchment-400">Entrega:</strong> Funcionário ganha comissão por todos os itens que entrega, independente de quem produziu.</p>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      </div>

      {/* Subscription Card - Admin only */}
      {isAdmin && subscription?.ativa && (
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <h2 className="font-heading text-lg text-parchment-100 flex items-center gap-2">
                <Crown size={20} className="text-gold-500" />
                Assinatura
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-leather-800/30 rounded-western">
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">Plano</p>
                  <p className="font-heading text-parchment-100">{subscription.plano_nome || 'N/A'}</p>
                </div>
                <div className="p-4 bg-leather-800/30 rounded-western">
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">Dias Restantes</p>
                  <p className={`font-heading ${(subscription.dias_restantes ?? 0) <= 5 ? 'text-rust-400' : 'text-parchment-100'}`}>
                    {subscription.dias_restantes ?? 0} dias
                  </p>
                </div>
                <div className="p-4 bg-leather-800/30 rounded-western">
                  <p className="text-xs text-parchment-500 uppercase tracking-wider mb-1">Expira em</p>
                  <p className="font-heading text-parchment-100">
                    {subscription.data_expiracao
                      ? new Date(subscription.data_expiracao).toLocaleDateString('pt-BR')
                      : 'Ilimitado'}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              {subscription.dias_restantes != null && subscription.dias_restantes <= 30 && (
                <div className="space-y-2">
                  <div className="w-full h-2 bg-leather-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        subscription.dias_restantes <= 5 ? 'bg-rust-500' : 'bg-gold-500'
                      }`}
                      style={{ width: `${Math.min(100, (subscription.dias_restantes / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <Link
                to="/checkout"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-leather-950 font-heading rounded-western hover:bg-gold-400 transition-colors text-sm"
              >
                <CreditCard size={16} />
                Renovar Assinatura
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Commands Reference */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <h2 className="font-heading text-lg text-parchment-100">
              Comandos Rápidos do Bot
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { cmd: '!configurar', desc: 'Configura a empresa no servidor' },
                { cmd: '!configurarauto', desc: 'Auto-configura preços médios' },
                { cmd: '!bemvindo @user', desc: 'Cria canal privado do funcionário' },
                { cmd: '!add codigo[qtd]', desc: 'Adiciona itens ao estoque' },
                { cmd: '!estoque', desc: 'Visualiza estoque pessoal' },
                { cmd: '!pagar @user', desc: 'Paga o funcionário e zera estoque' },
                { cmd: '!caixa', desc: 'Relatório financeiro da empresa' },
                { cmd: '!produtos', desc: 'Lista todos os produtos' },
                { cmd: '!encomendas', desc: 'Lista encomendas pendentes' },
              ].map((item) => (
                <div
                  key={item.cmd}
                  className="p-3 bg-leather-800/30 rounded-western"
                >
                  <code className="text-gold-500 text-sm font-mono">
                    {item.cmd}
                  </code>
                  <p className="text-xs text-parchment-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {/* Payment Mode Confirmation Modal */}
      <Modal
        isOpen={!!pendingMode}
        onClose={() => setPendingMode(null)}
        title="Alterar Modo de Pagamento"
        size="sm"
      >
        <p className="text-parchment-400 text-sm">
          Tem certeza que deseja alterar para modo{' '}
          <strong className="text-parchment-100">
            {pendingMode === 'producao' ? 'Produção' : 'Entrega'}
          </strong>
          ? Isso afetará como as comissões dos funcionários são calculadas.
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setPendingMode(null)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            isLoading={isUpdatingPaymentMode}
            onClick={async () => {
              if (pendingMode) {
                await handlePaymentModeChange(pendingMode);
                setPendingMode(null);
              }
            }}
          >
            Confirmar
          </Button>
        </ModalFooter>
      </Modal>
    </motion.div>
  );
}
