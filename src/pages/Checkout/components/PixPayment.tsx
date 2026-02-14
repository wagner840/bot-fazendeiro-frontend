import { motion } from 'framer-motion';
import { QrCode, Clock, Copy, Check, Loader2, ShieldCheck } from 'lucide-react';
import type { PixData, PaymentStatus } from '../types';

interface PixPaymentProps {
  pixData: PixData | null;
  paymentStatus: PaymentStatus;
  setPaymentStatus: (status: PaymentStatus) => void;
  setPixData: (data: PixData | null) => void;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  copied: boolean;
  copyToClipboard: () => void;
}

export function PixPayment({
  pixData,
  paymentStatus,
  setPaymentStatus,
  setPixData,
  timeLeft,
  formatTime,
  copied,
  copyToClipboard,
}: PixPaymentProps) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="western-card p-5 sm:p-6"
    >
      <h2 className="font-heading text-xl text-parchment-100 mb-1">Pagamento</h2>
      <p className="text-sm text-parchment-500 mb-4">Escaneie o QR Code ou use o codigo copia e cola.</p>

      {pixData ? (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gold-500" />
            <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-rust-500' : 'text-parchment-300'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {paymentStatus === 'expired' ? (
            <div className="py-8">
              <p className="text-rust-400 mb-4">Pagamento expirado</p>
              <button
                onClick={() => {
                  setPixData(null);
                  setPaymentStatus('pending');
                }}
                className="px-6 py-2 bg-leather-800 text-parchment-200 rounded-western hover:bg-leather-700"
              >
                Gerar novo PIX
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg inline-block mb-5">
                <img src={pixData.qrcode} alt="QR Code PIX" className="w-60 h-60 sm:w-64 sm:h-64" />
              </div>

              <div className="bg-leather-800 rounded-western p-4 mb-4 text-left">
                <p className="text-parchment-300 text-xs font-mono break-all mb-3 max-h-24 overflow-y-auto">
                  {pixData.copiaCola}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="w-full py-2 bg-leather-700 text-parchment-200 rounded-western hover:bg-leather-600 flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar codigo PIX
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-parchment-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Aguardando confirmacao do pagamento...
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-10">
          <QrCode className="w-16 h-16 text-leather-600 mx-auto mb-4" />
          <p className="text-parchment-500">Selecione um plano e gere o PIX para continuar.</p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-green-400 bg-green-900/10 border border-green-800/40 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Confirmacao automatica
          </div>
        </div>
      )}
    </motion.section>
  );
}
