import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wheat, Menu, X } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Funcionalidades', id: 'features' },
    { label: 'Como Funciona', id: 'how-it-works' },
    { label: 'Precos', id: 'pricing' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-leather-950/95 backdrop-blur-md border-b border-leather-800/50 shadow-lg'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Wheat className="w-7 h-7 text-gold-500" />
            <span className="font-display text-xl text-gold-500">Bot Fazendeiro</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-parchment-400 hover:text-gold-400 transition-colors text-sm font-body"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-parchment-400 hover:text-parchment-200 transition-colors text-sm font-body"
            >
              Entrar
            </Link>
            <Link
              to="/login"
              state={{ from: { pathname: '/checkout' } }}
              className="px-5 py-2 bg-gold-500 text-leather-950 font-heading font-bold text-sm rounded-lg hover:bg-gold-400 transition-colors"
            >
              Testar Gratis
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-parchment-400"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-leather-950 border-b border-leather-800/50"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="block w-full text-left text-parchment-300 hover:text-gold-400 transition-colors text-base font-body py-2"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 space-y-3 border-t border-leather-800/50">
                <Link
                  to="/login"
                  className="block w-full text-center py-3 text-parchment-300 border border-leather-700 rounded-lg font-heading"
                >
                  Entrar
                </Link>
                <Link
                  to="/login"
                  state={{ from: { pathname: '/checkout' } }}
                  className="block w-full text-center py-3 bg-gold-500 text-leather-950 font-heading font-bold rounded-lg"
                >
                  Testar Gratis
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
