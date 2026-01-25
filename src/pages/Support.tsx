import { MessageCircle, Mail, ExternalLink } from 'lucide-react';

export function Support() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-4xl text-gold-500 mb-2">Suporte & Ajuda</h1>
      <p className="text-parchment-400 text-lg mb-12">Estamos aqui para ajudar você a tirar o máximo proveito do Bot Fazendeiro.</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Discord Support */}
        <div className="bg-leather-900 border border-leather-700 rounded-western p-8 hover:border-gold-500/30 transition-colors">
          <div className="p-3 bg-indigo-500/10 w-fit rounded-lg mb-6">
            <MessageCircle className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="font-heading text-2xl text-parchment-100 mb-3">Comunidade Discord</h2>
          <p className="text-parchment-400 mb-6">
            O canal mais rápido para tirar dúvidas, reportar bugs e dar sugestões. Nossa equipe e comunidade estão sempre ativos.
          </p>
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Entrar no Servidor <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Email Support */}
        <div className="bg-leather-900 border border-leather-700 rounded-western p-8 hover:border-gold-500/30 transition-colors">
          <div className="p-3 bg-gold-500/10 w-fit rounded-lg mb-6">
            <Mail className="w-8 h-8 text-gold-500" />
          </div>
          <h2 className="font-heading text-2xl text-parchment-100 mb-3">Email de Contato</h2>
          <p className="text-parchment-400 mb-6">
            Para assuntos comerciais, parcerias ou questões mais formais, envie-nos um email.
          </p>
          <a 
            href="mailto:contato@botfazendeiro.com.br" 
            className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 font-medium transition-colors"
          >
            contato@botfazendeiro.com.br
          </a>
        </div>
      </div>

      <div className="mt-12 p-6 bg-leather-800/50 rounded-western border border-leather-700/50">
        <h3 className="font-heading text-xl text-parchment-100 mb-2">Horário de Atendimento</h3>
        <p className="text-parchment-400">
          Nossa equipe de suporte atende normalmente de segunda a sexta, das 09:00 às 18:00 (horário de Brasília). 
          Questões urgentes podem ser atendidas fora desse horário através do Discord, dependendo da disponibilidade da equipe.
        </p>
      </div>
    </div>
  );
}
