import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Loader2 } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-leather-900/50 border border-leather-700 rounded-western p-6"
    >
      <h2 className="font-heading text-xl text-parchment-100 mb-6">Selecione o Plano</h2>

      <div className="space-y-4">
        {planos.map((plano) => (
          <button
            key={plano.id}
            onClick={() => {
              setSelectedPlano(plano);
            }}
            disabled={!!pixData}
            className={`w-full p-4 rounded-western border text-left transition-all ${
              selectedPlano?.id === plano.id
                ? 'border-gold-500 bg-gold-500/10'
                : 'border-leather-600 hover:border-leather-500'
            } ${pixData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-heading text-parchment-100">{plano.nome}</h3>
                <p className="text-parchment-500 text-sm">{plano.duracao_dias} dias de acesso</p>
              </div>
              <span className="text-2xl font-bold text-gold-500">
                R$ {plano.preco.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedPlano && !pixData && (
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-parchment-400 text-sm mb-2">
              E-mail (Para comprovante)
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
              CPF do Pagador (Obrigatório para PIX)
            </label>
            <input
              id="cpf"
              type="text"
              className="w-full bg-leather-800 border border-leather-600 rounded-western p-3 text-parchment-100 placeholder-leather-500 focus:border-gold-500 focus:outline-none transition-colors"
              placeholder="000.000.000-00"
              onChange={(e) => setCpf(e.target.value)}
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
                Gerar QR Code PIX
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}
