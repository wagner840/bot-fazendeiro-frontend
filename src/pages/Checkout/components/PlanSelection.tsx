import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Loader2, BadgeCheck } from 'lucide-react';
import InputMask from 'inputmask';
import type { Plano, PixData } from '../types';

interface PlanSelectionProps {
  planos: Plano[];
  selectedPlano: Plano | null;
  setSelectedPlano: (plano: Plano | null) => void;
  pixData: PixData | null;
  cpf: string;
  setCpf: (cpf: string) => void;
  email: string;
  setEmail: (email: string) => void;
  generatingPix: boolean;
  generatePix: () => Promise<void>;
}

export function PlanSelection({
  planos,
  selectedPlano,
  setSelectedPlano,
  pixData,
  cpf,
  setCpf,
  email,
  setEmail,
  generatingPix,
  generatePix,
}: PlanSelectionProps) {
  useEffect(() => {
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
      new InputMask({ mask: '999.999.999-99' }).mask(cpfInput);
    }
  }, []);

  const isFormValid = cpf.replace(/\D/g, '').length === 11 && email.includes('@');

  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="western-card p-5 sm:p-6"
    >
      <h2 className="font-heading text-xl text-parchment-100 mb-1">Escolha seu plano</h2>
      <p className="text-sm text-parchment-500 mb-5">O valor mensal aparece em destaque para facilitar comparacao.</p>

      <div className="space-y-3">
        {planos.map((plano) => {
          const monthly = plano.preco / Math.max(plano.duracao_dias / 30, 1);
          return (
            <button
              key={plano.id}
              onClick={() => setSelectedPlano(plano)}
              disabled={!!pixData}
              className={`w-full p-4 rounded-western border text-left transition-all ${
                selectedPlano?.id === plano.id
                  ? 'border-gold-500 bg-gold-500/10'
                  : 'border-leather-600 hover:border-leather-500'
              } ${pixData ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-parchment-100">{plano.nome}</h3>
                  <p className="text-parchment-500 text-sm">{plano.duracao_dias} dias de acesso</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gold-500">R$ {plano.preco.toFixed(2).replace('.', ',')}</p>
                  <p className="text-xs text-parchment-500">~ R$ {monthly.toFixed(2).replace('.', ',')}/mes</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedPlano && !pixData && (
        <div className="mt-6 space-y-4">
          <div className="p-3 rounded-western border border-green-700/40 bg-green-900/10 flex items-center gap-2 text-sm text-green-300">
            <BadgeCheck className="w-4 h-4" />
            Plano selecionado: <strong>{selectedPlano.nome}</strong>
          </div>

          <div>
            <label htmlFor="email" className="block text-parchment-400 text-sm mb-2">
              E-mail de faturamento
            </label>
            <input
              id="email"
              type="email"
              className="w-full bg-leather-800 border border-leather-600 rounded-western p-3 text-parchment-100 placeholder-leather-500 focus:border-gold-500 focus:outline-none transition-colors"
              placeholder="seu@email.com"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div>
            <label htmlFor="cpf" className="block text-parchment-400 text-sm mb-2">
              CPF do pagador
            </label>
            <input
              id="cpf"
              type="text"
              className="w-full bg-leather-800 border border-leather-600 rounded-western p-3 text-parchment-100 placeholder-leather-500 focus:border-gold-500 focus:outline-none transition-colors"
              placeholder="000.000.000-00"
              onChange={(e) => setCpf(e.target.value)}
              value={cpf}
            />
          </div>

          <button
            onClick={generatePix}
            disabled={generatingPix || !isFormValid}
            className="w-full py-4 bg-gold-500 text-leather-950 font-heading rounded-western hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPix ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Gerando PIX...
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                Gerar pagamento PIX
              </>
            )}
          </button>
        </div>
      )}
    </motion.section>
  );
}
