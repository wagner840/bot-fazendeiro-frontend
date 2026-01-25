import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Como adiciono o bot ao meu servidor?",
    answer: "Após assinar um plano, você receberá acesso ao painel onde poderá vincular o bot ao seu servidor do Discord. Basta seguir o passo a passo na área de 'Configurações'."
  },
  {
    question: "Posso testar antes de comprar?",
    answer: "No momento não oferecemos período de teste gratuito aberto, mas você pode ver todas as funcionalidades em nossa documentação ou solicitar uma demonstração em nosso servidor de suporte."
  },
  {
    question: "O pagamento é recorrente?",
    answer: "Não, o pagamento é uma vez por ciclo. Para sua segurança, não aceitamos cartão de crédito. Utilizamos o PIX para pagamentos seguros."
  },
  {
    question: "Funciona em qualquer servidor de RedM?",
    answer: "O bot é projetado para ser agnóstico de framework, focado na gestão administrativa (RH, Financeiro). Portanto, funciona independentemente do framework (VORP, RedEM, etc.) que seu servidor utiliza."
  },
  {
    question: "Como funciona o suporte?",
    answer: "Oferecemos suporte via tickets no nosso servidor do Discord. Assinantes dos planos Trimestral e Anual têm prioridade na fila de atendimento."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl text-gold-500 mb-4">Perguntas Frequentes</h1>
        <p className="text-parchment-400">
          Tire suas dúvidas sobre o Bot Fazendeiro e nossas funcionalidades.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="border border-leather-700 rounded-western bg-leather-900/50 overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-leather-800/50 transition-colors"
            >
              <span className="font-heading text-lg text-parchment-100 pr-8">
                {faq.question}
              </span>
              {openIndex === index ? (
                <Minus className="w-5 h-5 text-gold-500 flex-shrink-0" />
              ) : (
                <Plus className="w-5 h-5 text-gold-500 flex-shrink-0" />
              )}
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 text-parchment-400 leading-relaxed border-t border-leather-800/50 pt-4">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
