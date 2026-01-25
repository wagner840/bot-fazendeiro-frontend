import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Database,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
} from '../components/ui';
import { BUSINESS_ICONS } from '../lib/types';
import { formatDate } from '../lib/types';

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
  const { selectedEmpresa, isLoadingEmpresas, addToast } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const businessIcon = selectedEmpresa?.tipo_empresa?.codigo
    ? BUSINESS_ICONS[selectedEmpresa.tipo_empresa.codigo] || '🏢'
    : '🏢';

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

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={item}>
        <h1 className="font-display text-3xl text-gold-500">Configurações</h1>
        <p className="text-parchment-400 mt-1">
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
              <div className="flex items-center gap-6 p-6 bg-leather-800/30 rounded-western">
                <div className="w-20 h-20 rounded-western bg-gradient-to-br from-leather-700 to-leather-800 flex items-center justify-center text-4xl shadow-western-lg">
                  {businessIcon}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl text-gold-500">
                    {selectedEmpresa?.nome || 'Empresa'}
                  </h3>
                  <p className="text-parchment-400 mt-1">
                    {selectedEmpresa?.tipo_empresa?.nome}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="gold">
                      {selectedEmpresa?.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-sm text-parchment-500">
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
                    Guild ID (Discord)
                  </p>
                  <p className="font-mono text-sm text-parchment-300">
                    {selectedEmpresa?.guild_id || '-'}
                  </p>
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
                    Proprietário
                  </p>
                  <p className="font-mono text-sm text-parchment-300">
                    {selectedEmpresa?.proprietario_discord_id || '-'}
                  </p>
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




        </motion.div>
      </div>

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
    </motion.div>
  );
}
