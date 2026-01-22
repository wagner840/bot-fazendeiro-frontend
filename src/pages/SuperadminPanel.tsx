import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Users,
  Building2,
  Activity,
  RefreshCw,
  Shield,
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Servidor {
  id: number;
  guild_id: string;
  nome: string;
  proprietario_discord_id: string;
  ativo: boolean;
  plano: string;
  data_criacao: string;
  _count?: {
    empresas: number;
    usuarios: number;
  };
}

interface Stats {
  totalServidores: number;
  totalEmpresas: number;
  totalUsuarios: number;
  totalFuncionarios: number;
  servidoresAtivos: number;
}

export function SuperadminPanel() {
  const { isSuperadmin } = useAuth();
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch all servers
      const { data: servidoresData, error: servidoresError } = await supabase
        .from('servidores')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (servidoresError) throw servidoresError;

      // Fetch counts for each server
      const servidoresWithCounts = await Promise.all(
        (servidoresData || []).map(async (servidor) => {
          const [empresasRes, usuariosRes] = await Promise.all([
            supabase
              .from('empresas')
              .select('id', { count: 'exact' })
              .eq('servidor_id', servidor.id),
            supabase
              .from('usuarios_frontend')
              .select('id', { count: 'exact' })
              .eq('guild_id', servidor.guild_id),
          ]);

          return {
            ...servidor,
            _count: {
              empresas: empresasRes.count || 0,
              usuarios: usuariosRes.count || 0,
            },
          };
        })
      );

      setServidores(servidoresWithCounts);

      // Calculate stats
      const [totalEmpresasRes, totalUsuariosRes, totalFuncionariosRes] = await Promise.all([
        supabase.from('empresas').select('id', { count: 'exact' }),
        supabase.from('usuarios_frontend').select('id', { count: 'exact' }),
        supabase.from('funcionarios').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalServidores: servidoresData?.length || 0,
        totalEmpresas: totalEmpresasRes.count || 0,
        totalUsuarios: totalUsuariosRes.count || 0,
        totalFuncionarios: totalFuncionariosRes.count || 0,
        servidoresAtivos: servidoresData?.filter((s) => s.ativo).length || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const toggleServidorStatus = async (servidor: Servidor) => {
    try {
      const { error } = await supabase
        .from('servidores')
        .update({ ativo: !servidor.ativo })
        .eq('id', servidor.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-heading text-parchment-100">Acesso Negado</h2>
          <p className="text-parchment-400">Esta area e restrita ao Superadmin.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-gold-500">Painel Superadmin</h1>
          <p className="text-parchment-400 font-body">
            Visao geral de todos os servidores e estatisticas globais
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-leather-700 hover:bg-leather-600 rounded-western text-parchment-200 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-parchment-400 text-sm">Servidores</p>
                <p className="text-2xl font-heading text-parchment-100">{stats.totalServidores}</p>
              </div>
              <Server className="w-8 h-8 text-gold-500" />
            </div>
            <p className="text-xs text-parchment-500 mt-2">
              {stats.servidoresAtivos} ativos
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-parchment-400 text-sm">Empresas</p>
                <p className="text-2xl font-heading text-parchment-100">{stats.totalEmpresas}</p>
              </div>
              <Building2 className="w-8 h-8 text-whiskey-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-parchment-400 text-sm">Usuarios Frontend</p>
                <p className="text-2xl font-heading text-parchment-100">{stats.totalUsuarios}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-parchment-400 text-sm">Funcionarios</p>
                <p className="text-2xl font-heading text-parchment-100">{stats.totalFuncionarios}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="stat-card bg-gradient-to-br from-gold-900/30 to-leather-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-parchment-400 text-sm">Taxa Ativacao</p>
                <p className="text-2xl font-heading text-gold-500">
                  {stats.totalServidores > 0
                    ? Math.round((stats.servidoresAtivos / stats.totalServidores) * 100)
                    : 0}
                  %
                </p>
              </div>
              <Globe className="w-8 h-8 text-gold-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Servers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="p-4 border-b border-leather-700/50">
          <h2 className="font-heading text-lg text-parchment-100">
            Servidores Registrados ({servidores.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-leather-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-heading text-parchment-300">
                  Servidor
                </th>
                <th className="px-4 py-3 text-left text-sm font-heading text-parchment-300">
                  Guild ID
                </th>
                <th className="px-4 py-3 text-center text-sm font-heading text-parchment-300">
                  Empresas
                </th>
                <th className="px-4 py-3 text-center text-sm font-heading text-parchment-300">
                  Usuarios
                </th>
                <th className="px-4 py-3 text-center text-sm font-heading text-parchment-300">
                  Plano
                </th>
                <th className="px-4 py-3 text-center text-sm font-heading text-parchment-300">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-heading text-parchment-300">
                  Criado em
                </th>
                <th className="px-4 py-3 text-center text-sm font-heading text-parchment-300">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-leather-700/30">
              {servidores.map((servidor) => (
                <tr key={servidor.id} className="hover:bg-leather-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-gold-500" />
                      <span className="text-parchment-100 font-medium">{servidor.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-leather-800 px-2 py-1 rounded text-parchment-400">
                      {servidor.guild_id}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-parchment-200">{servidor._count?.empresas || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-parchment-200">{servidor._count?.usuarios || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        servidor.plano === 'premium'
                          ? 'bg-gold-900/50 text-gold-400'
                          : servidor.plano === 'pro'
                          ? 'bg-whiskey-900/50 text-whiskey-400'
                          : 'bg-leather-700 text-parchment-400'
                      }`}
                    >
                      {servidor.plano || 'free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {servidor.ativo ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 text-sm">
                        <XCircle className="w-4 h-4" />
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-parchment-400 text-sm flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(servidor.data_criacao).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleServidorStatus(servidor)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        servidor.ativo
                          ? 'bg-red-900/50 text-red-400 hover:bg-red-900/70'
                          : 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900/70'
                      }`}
                    >
                      {servidor.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
              {servidores.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-parchment-500">
                    Nenhum servidor registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
