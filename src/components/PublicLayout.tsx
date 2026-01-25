import { Link, Outlet } from 'react-router-dom';
import { Wheat, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-leather-950 flex flex-col">
      {/* Header */}
      <header className="bg-leather-900 border-b border-leather-800 py-4 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-full bg-gold-500/10 border border-gold-500/20 group-hover:bg-gold-500/20 transition-colors">
              <Wheat className="w-6 h-6 text-gold-500" />
            </div>
            <span className="font-display text-xl text-gold-500 group-hover:text-gold-400 transition-colors">
              Bot Fazendeiro
            </span>
          </Link>
          
          <Link 
            to="/" 
            className="flex items-center gap-2 text-parchment-400 hover:text-gold-500 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-leather-900 border-t border-leather-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Wheat className="w-5 h-5 text-gold-500" />
              <span className="font-display text-lg text-gold-500">Bot Fazendeiro</span>
            </div>
            <p className="text-parchment-600 text-sm">
              © {new Date().getFullYear()} Bot Fazendeiro. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <Link to="/termos-de-uso" className="text-parchment-500 hover:text-gold-500 transition-colors text-sm">
                Termos de Uso
              </Link>
              <Link to="/politica-de-privacidade" className="text-parchment-500 hover:text-gold-500 transition-colors text-sm">
                Privacidade
              </Link>
               <Link to="/quem-somos" className="text-parchment-500 hover:text-gold-500 transition-colors text-sm">
                Quem Somos
              </Link>
              <Link to="/faq" className="text-parchment-500 hover:text-gold-500 transition-colors text-sm">
                FAQ
              </Link>
              <Link to="/suporte" className="text-parchment-500 hover:text-gold-500 transition-colors text-sm">
                Suporte
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
