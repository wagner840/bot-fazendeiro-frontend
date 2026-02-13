import { motion } from 'framer-motion';
import { Wheat } from 'lucide-react';
import { discordMessages } from '../../data/landing';

export function DiscordMockup() {
  return (
    <div className="rounded-xl overflow-hidden bg-[#313338] border border-[#3f4147] shadow-2xl shadow-black/50">
      {/* Discord Header */}
      <div className="bg-[#2b2d31] px-4 py-3 flex items-center gap-2 border-b border-[#1e1f22]">
        <span className="text-[#949ba4] text-sm">#</span>
        <span className="text-white text-sm font-semibold">geral-empresa</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[#949ba4] text-xs">12 online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 max-h-[400px]">
        {discordMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="flex gap-3"
          >
            {/* Avatar */}
            {msg.isBot ? (
              <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                <Wheat className="w-5 h-5 text-leather-950" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                {msg.avatar}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Username */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-semibold ${msg.isBot ? 'text-gold-400' : 'text-white'}`}>
                  {msg.isBot ? 'Bot Fazendeiro' : msg.user}
                </span>
                {msg.isBot && (
                  <span className="px-1.5 py-0.5 bg-[#5865F2] text-white text-[10px] font-bold rounded">BOT</span>
                )}
                <span className="text-[#949ba4] text-xs">Hoje as 14:32</span>
              </div>

              {/* Content */}
              {msg.content && (
                <p className="text-[#dbdee1] text-sm">
                  {msg.isCommand && <span className="text-[#5865F2]">/</span>}
                  {msg.isCommand ? msg.content.slice(1) : msg.content}
                </p>
              )}

              {/* Embed */}
              {msg.embed && (
                <div className="mt-1 border-l-4 rounded bg-[#2b2d31] p-3 max-w-md" style={{ borderColor: msg.embed.color }}>
                  <div className="text-white text-sm font-semibold mb-2">{msg.embed.title}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {msg.embed.fields.map((field, fi) => (
                      <div key={fi}>
                        <div className="text-[#949ba4] text-[10px] uppercase font-bold">{field.name}</div>
                        <div className="text-[#dbdee1] text-xs">{field.value}</div>
                      </div>
                    ))}
                  </div>
                  {msg.embed.footer && (
                    <div className="text-[#949ba4] text-[10px] mt-2 pt-2 border-t border-[#3f4147]">
                      {msg.embed.footer}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="bg-[#383a40] rounded-lg px-4 py-2.5 text-[#6d6f78] text-sm flex items-center gap-2">
          <span className="text-[#b5bac1]">/</span>
          Escreva um comando...
        </div>
      </div>
    </div>
  );
}
