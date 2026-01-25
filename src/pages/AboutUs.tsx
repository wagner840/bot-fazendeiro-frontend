import { Wheat, Target, Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export function AboutUs() {
  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Missão",
      description: "Profissionalizar a gestão de roleplay no Red Dead Online, fornecendo ferramentas robustas e fáceis de usar."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Comunidade",
      description: "Focamos em ouvir e crescer junto com os administradores de servidores e líderes de grupos."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Paixão",
      description: "Desenvolvido por quem joga e ama o universo RP, entendendo as necessidades reais do dia a dia."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-gold-500/10 border border-gold-500/20">
            <Wheat className="w-12 h-12 text-gold-500" />
          </div>
        </div>
        <h1 className="font-display text-4xl lg:text-5xl text-gold-500 mb-6">Quem Somos</h1>
        <p className="text-parchment-300 text-lg max-w-2xl mx-auto">
          O Bot Fazendeiro nasceu da necessidade de organizar e automatizar o cotidiano das fazendas e empresas no mundo do Red Dead RP.
        </p>
      </div>

      <div className="bg-leather-900/50 border border-leather-700 rounded-western p-8 md:p-12 mb-16">
        <h2 className="font-heading text-2xl text-parchment-100 mb-6">Nossa História</h2>
        <div className="space-y-4 text-parchment-400 leading-relaxed">
          <p>
            Tudo começou em 2026, quando percebemos que muitos líderes de grupos no RP gastavam mais tempo em planilhas do Excel do que aproveitando o roleplay. O controle de pagamentos, estoques e funcionários era manual, propenso a erros e exaustivo.
          </p>
          <p>
            Decidimos então criar uma solução integrada: um Bot de Discord que servisse como interface rápida para os membros, e um Painel Web completo para a gestão administrativa. O resultado foi uma revolução na forma como as empresas dentro do RP operam.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {values.map((item, index) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="p-6 bg-leather-800 border border-leather-700 rounded-western hover:border-gold-500/30 transition-colors"
          >
            <div className="text-gold-500 mb-4">{item.icon}</div>
            <h3 className="font-heading text-xl text-parchment-100 mb-2">{item.title}</h3>
            <p className="text-parchment-500 text-sm">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
