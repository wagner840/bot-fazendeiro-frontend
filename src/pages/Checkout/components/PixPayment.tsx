import { motion } from 'framer-motion';
import { QrCode, Clock, Copy, Check, Loader2 } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-leather-900/50 border border-leather-700 rounded-western p-6"
    >
      {pixData ? (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gold-500" />
            <span
              className={`font-mono text-lg ${
                timeLeft < 60 ? 'text-rust-500' : 'text-parchment-300'
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          {paymentStatus === 'expired' ? (
            <div className="py-8">
              <p className="text-rust-400 mb-4">PIX expirado</p>
              <button
                onClick={() => {
                  setPixData(null);
                  setPaymentStatus('pending');
                }}
                className="px-6 py-2 bg-leather-800 text-parchment-200 rounded-western hover:bg-leather-700"
              >
                Gerar novo QR Code
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg inline-block mb-6">
                <img src={pixData.qrcode} alt="QR Code PIX" className="w-64 h-64" />
              </div>

              <p className="text-parchment-400 text-sm mb-4">
                Escaneie o QR Code ou copie o código abaixo
              </p>

              <div className="bg-leather-800 rounded-western p-4 mb-4">
                <p className="text-parchment-300 text-xs font-mono break-all mb-3">
                  {pixData.copiaCola.substring(0, 60)}...
                </p>
                <button
                  onClick={copyToClipboard}
                  className="w-full py-2 bg-leather-700 text-parchment-200 rounded-western hover:bg-leather-600 flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar código PIX
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-parchment-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Aguardando pagamento...
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <QrCode className="w-16 h-16 text-leather-600 mx-auto mb-4" />
          <p className="text-parchment-500">
            Selecione um plano e clique em "Gerar QR Code PIX"
          </p>
        </div>
      )}
    </motion.div>
  );
}
