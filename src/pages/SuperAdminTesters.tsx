import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Trash2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useServerNames } from '../hooks/useEntityNames';

interface Tester {
  id: number;
  guild_id: string;
  nome: string;
  motivo: string;
  ativo: boolean;
  created_at: string;
}

export function SuperAdminTesters() {
  const { user } = useAuth();
  const [testers, setTesters] = useState<Tester[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTester, setNewTester] = useState({ guild_id: '', nome: '', motivo: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTesters();
  }, []);

  const fetchTesters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTesters(data || []);
    } catch (err: any) {
      console.error('Error fetching testers:', err);
      setError('Erro ao carregar testers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTester = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.from('testers').insert({
        guild_id: newTester.guild_id,
        nome: newTester.nome,
        motivo: newTester.motivo,
        adicionado_por: user?.email || 'System',
      });

      if (error) throw error;

      setSuccess('Tester adicionado com sucesso!');
      setNewTester({ guild_id: '', nome: '', motivo: '' });
      setShowAddModal(false);
      fetchTesters();
    } catch (err: any) {
      console.error('Error adding tester:', err);
      setError(err.message || 'Erro ao adicionar tester.');
    }
  };

  const handleDeleteTester = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este tester?')) return;

    try {
      const { error } = await supabase.from('testers').delete().eq('id', id);
      if (error) throw error;
      fetchTesters();
      setSuccess('Tester removido com sucesso.');
    } catch (err: any) {
      console.error('Error removing tester:', err);
      setError('Erro ao remover tester.');
    }
  };


  const [searchTerm, setSearchTerm] = useState('');
  const serverNames = useServerNames(testers.map((tester) => tester.guild_id));

  const filteredTesters = testers.filter(t => 
    (serverNames[t.guild_id] || t.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.guild_id?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-gold-500">Gerenciar Testers</h1>
          <p className="text-parchment-400 mt-1 text-sm md:text-base">
            Controle de acesso antecipado e gratuito (Beta Testers).
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-leather-950 rounded-western font-heading hover:from-gold-500 hover:to-gold-400 transition-all shadow-gold-glow w-full md:w-auto transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Tester
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-parchment-500" />
        <input 
          type="text"
          placeholder="Buscar por nome ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-leather-900/50 border border-leather-700/50 rounded-western text-parchment-100 placeholder-parchment-600 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all outline-none"
        />
      </div>

      {/* Messages */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-rust-900/20 border border-rust-500/50 text-rust-200 p-4 rounded-western flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-900/20 border border-emerald-500/50 text-emerald-200 p-4 rounded-western flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-leather-800/20 animate-pulse rounded-western border border-leather-700/30" />
            ))}
         </div>
      ) : (
        <>
          {/* Mobile View (Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredTesters.length === 0 ? (
               <div className="text-center py-12 text-parchment-500 bg-leather-900/30 rounded-western border border-leather-700/30 border-dashed">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Nenhum tester encontrado.</p>
               </div>
            ) : (
              filteredTesters.map((tester) => (
                <motion.div 
                  key={tester.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-leather-900/60 backdrop-blur-sm border border-leather-700/50 rounded-western p-5 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-heading text-lg text-parchment-100">
                        {serverNames[tester.guild_id] || tester.nome || 'Sem nome cadastrado'}
                      </h3>
                      <p className="font-mono text-xs text-parchment-500 bg-leather-950/50 px-2 py-1 rounded mt-1 inline-block border border-leather-800">
                        ID: {tester.guild_id}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${tester.ativo ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30' : 'bg-rust-900/20 text-rust-400 border-rust-500/30'}`}>
                      {tester.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-parchment-300 mb-4 border-l-2 border-leather-700 pl-3 italic">
                    "{tester.motivo}"
                  </div>

                  <div className="flex items-center justify-between text-xs text-parchment-500 mt-4 pt-4 border-t border-leather-700/30">
                     <span>Add em: {new Date(tester.created_at).toLocaleDateString()}</span>
                     <button 
                        onClick={() => handleDeleteTester(tester.id)}
                        className="text-rust-400 hover:text-rust-300 transition-colors p-2 hover:bg-rust-900/20 rounded-full"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block bg-leather-900/60 backdrop-blur-sm border border-leather-700/50 rounded-western overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-leather-950/40 border-b border-leather-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-heading text-parchment-400 uppercase tracking-wider">Servidor</th>
                    <th className="px-6 py-4 text-left text-xs font-heading text-parchment-400 uppercase tracking-wider">Motivo</th>
                    <th className="px-6 py-4 text-left text-xs font-heading text-parchment-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-heading text-parchment-400 uppercase tracking-wider">Criado em</th>
                    <th className="px-6 py-4 text-right text-xs font-heading text-parchment-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-leather-700/30">
                   {filteredTesters.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-parchment-500">
                        <div className="flex flex-col items-center justify-center">
                           <Search className="w-8 h-8 opacity-20 mb-2" />
                           <p>Nenhum resultado encontrado.</p>
                        </div>
                      </td>
                    </tr>
                   ) : (
                     filteredTesters.map((tester) => (
                        <tr key={tester.id} className="hover:bg-leather-800/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-parchment-100">
                                {serverNames[tester.guild_id] || tester.nome || 'Sem nome cadastrado'}
                              </span>
                              <code className="text-xs text-parchment-500 font-mono mt-0.5">
                                ID: {tester.guild_id}
                              </code>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-sm text-parchment-300 line-clamp-1">{tester.motivo}</span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${tester.ativo ? 'bg-emerald-500 animate-pulse' : 'bg-rust-500'}`} />
                                <span className={`text-xs font-medium ${tester.ativo ? 'text-emerald-400' : 'text-rust-400'}`}>{tester.ativo ? 'Ativo' : 'Inativo'}</span>
                             </div>
                          </td>
                           <td className="px-6 py-4 text-sm text-parchment-400">
                              {new Date(tester.created_at).toLocaleDateString()}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteTester(tester.id)}
                                className="text-leather-600 hover:text-rust-400 transition-colors p-1.5 rounded-md hover:bg-rust-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Remover Tester"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                     ))
                   )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-leather-900 border border-gold-500/30 rounded-western p-6 w-full max-w-md shadow-2xl shadow-black/50"
          >
            <h2 className="text-xl font-heading text-gold-500 mb-6 flex items-center gap-2">
               <Shield className="w-5 h-5" /> 
               Adicionar Novo Tester
            </h2>
            <form onSubmit={handleAddTester} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-parchment-400 uppercase tracking-wider mb-1.5">Guild ID</label>
                <input
                  type="text"
                  required
                  value={newTester.guild_id}
                  onChange={(e) => setNewTester({ ...newTester, guild_id: e.target.value })}
                  className="w-full bg-leather-950 border border-leather-700 rounded-western p-3 text-parchment-100 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-all outline-none font-mono text-sm"
                  placeholder="Ex: 123456789012345678"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-parchment-400 uppercase tracking-wider mb-1.5">Nome do Servidor</label>
                <input
                  type="text"
                  required
                  value={newTester.nome}
                  onChange={(e) => setNewTester({ ...newTester, nome: e.target.value })}
                  className="w-full bg-leather-950 border border-leather-700 rounded-western p-3 text-parchment-100 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-all outline-none"
                  placeholder="Ex: Servidor do Fulano"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-parchment-400 uppercase tracking-wider mb-1.5">Motivo / Observação</label>
                <textarea
                  value={newTester.motivo}
                  onChange={(e) => setNewTester({ ...newTester, motivo: e.target.value })}
                  className="w-full bg-leather-950 border border-leather-700 rounded-western p-3 text-parchment-100 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/50 transition-all outline-none h-24 resize-none"
                  placeholder="Ex: Amigo próximo, Teste Beta #42..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-leather-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-transparent text-parchment-400 hover:text-parchment-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold-500 text-leather-950 rounded-western hover:bg-gold-400 font-bold shadow-lg shadow-gold-900/20 transition-all transform hover:-translate-y-0.5"
                >
                  Adicionar Acesso
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
