import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Search,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, Button, Input, Badge } from '../components/ui';
import { cn } from '../lib/utils';
import { BUSINESS_ICONS } from '../lib/types';
import type { Empresa } from '../lib/types';

export function GerenciarEmpresas() {
  const { userFrontend, isAdmin } = useAuth();
  const { setSelectedEmpresa, selectedEmpresa } = useApp();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch companies
  const fetchEmpresas = async () => {
    if (!userFrontend?.guild_id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('empresas')
        .select('*, tipos_empresa(*)')
        .eq('guild_id', userFrontend.guild_id)
        .order('id', { ascending: true });

      if (error) throw error;
      setEmpresas(data || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [userFrontend]);

  const handleSelectEmpresa = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setSuccess(`Empresa "${empresa.nome}" selecionada!`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Filter companies
  const filteredEmpresas = empresas.filter(emp =>
    emp.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.tipo_empresa?.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-rust-500 mx-auto mb-4" />
          <h2 className="font-heading text-xl text-parchment-200 mb-2">Acesso Restrito</h2>
          <p className="text-parchment-500">Apenas administradores podem gerenciar empresas.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gold-500">Minhas Empresas</h1>
          <p className="text-parchment-400 mt-1">
            Gerencie as empresas deste servidor
          </p>
        </div>

        {/* Create button usually handled by bot, but could be here */}
        <div className="p-2 bg-leather-800/30 rounded text-xs text-parchment-500">
          Novas empresas devem ser criadas via Bot (!novaempresa)
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rust-900/30 border border-rust-700 rounded-western text-rust-400 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-900/30 border border-green-700 rounded-western text-green-400 flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-leather-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar empresa..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <Card key={i} className="h-48 animate-pulse bg-leather-800/20">
                <CardContent className="h-full"><></></CardContent>
             </Card>
           ))}
        </div>
      ) : filteredEmpresas.length === 0 ? (
        <div className="text-center py-12 text-parchment-500">
           <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
           <p>Nenhuma empresa encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmpresas.map((empresa) => {
            const isSelected = selectedEmpresa?.id === empresa.id;
            const icon = empresa.tipo_empresa?.codigo 
              ? BUSINESS_ICONS[empresa.tipo_empresa.codigo] || '🏢'
              : '🏢';

            return (
              <motion.div
                key={empresa.id}
                layoutId={`empresa-${empresa.id}`}
                className={cn(
                  "relative group",
                  isSelected && "ring-2 ring-gold-500 rounded-western"
                )}
              >
                <Card className="h-full hover:bg-leather-800/40 transition-colors">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-western bg-leather-700 flex items-center justify-center text-2xl shadow-inner">
                        {icon}
                      </div>
                      <Badge variant={empresa.ativo ? 'gold' : 'default'}>
                        {empresa.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-heading text-xl text-parchment-100 mb-1">
                        {empresa.nome}
                      </h3>
                      <p className="text-sm text-parchment-500">
                        {empresa.tipo_empresa?.nome} • {empresa.tipo_empresa?.base_redm_id === 2 ? '🐉 Valiria' : '🏙️ Downtown'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-leather-700/50 flex gap-2">
                       <Button 
                         variant={isSelected ? "secondary" : "primary"}
                         className="w-full"
                         onClick={() => handleSelectEmpresa(empresa)}
                         disabled={isSelected}
                       >
                         {isSelected ? 'Selecionada' : 'Gerenciar'}
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default GerenciarEmpresas;
