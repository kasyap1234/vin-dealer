'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Car, ShieldCheck, Zap, Info, Settings2, Sparkles, ChevronRight } from 'lucide-react';
import { PROVIDERS, ProviderId } from '@/lib/llm-providers';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ChatPage() {
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('cerebras');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeProvider = PROVIDERS.find(p => p.id === selectedProvider);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(
        { text: inputValue },
        { body: { providerId: selectedProvider } }
      );
      setInputValue('');
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-[#fafafa] selection:bg-blue-500/30 overflow-hidden font-inter">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1d4ed8]/20 blur-[120px] rounded-full animate-mesh-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#065f46]/10 blur-[120px] rounded-full animate-mesh-2" />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-all duration-500"
            />
            <motion.aside
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-[#09090b] border-r border-[#ffffff0a] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#ffffff0a] border border-[#ffffff0a]">
                    <Settings2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <h2 className="text-sm font-bold tracking-tight text-gray-200">System</h2>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 hover:bg-[#ffffff0a] rounded-md transition-colors"
                >
                  <ChevronRight className="rotate-180 w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 space-y-10">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 block">
                    Inference Core
                  </label>
                  <div className="space-y-1">
                    {PROVIDERS.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => setSelectedProvider(provider.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group relative",
                          selectedProvider === provider.id
                            ? "bg-[#ffffff0a] text-white"
                            : "text-gray-500 hover:text-gray-300 hover:bg-[#ffffff05]"
                        )}
                      >
                        <span className="text-sm font-medium z-10">{provider.name}</span>
                        {selectedProvider === provider.id && (
                          <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-4 bg-blue-500 rounded-full" />
                        )}
                        {provider.id === 'cerebras' && (
                          <div className="bg-orange-500/10 text-orange-500 text-[8px] font-bold px-1.5 py-0.5 rounded border border-orange-500/20">Turbo</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-[#ffffff0a]">
                <div className="flex items-center gap-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">MCP Active</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative z-10 w-full">
        {/* Minimal Nav */}
        <header className="flex items-center justify-between px-6 sm:px-10 py-6 shrink-0 border-b border-[#ffffff05]">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[#ffffff0a] border border-transparent hover:border-[#ffffff0a] transition-all duration-200"
            >
              <Settings2 className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm rotate-45 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              <h1 className="text-sm font-bold tracking-tight text-white uppercase tracking-widest">
                Vin<span className="opacity-40">Dealer</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#ffffff05] px-3 py-1.5 rounded-full border border-[#ffffff0a]">
            <div className="w-1 h-1 rounded-full bg-blue-400" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{activeProvider?.name}</span>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 w-full overflow-y-auto no-scrollbar scroll-smooth">
          <div className="max-w-[1200px] mx-auto w-full px-6 sm:px-20 pt-16 pb-44">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="min-h-[50vh] flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <Car className="w-12 h-12 text-blue-500 opacity-80" />
                </motion.div>
                <h2 className="text-4xl sm:text-7xl font-semibold tracking-tighter text-white mb-6 leading-none">
                  Vehicle audits,<br />
                  <span className="text-gray-500">at interface-scale.</span>
                </h2>
                <p className="max-w-xl text-[#888] text-base sm:text-lg mb-12 font-medium">
                  Connect your fleet data to intelligent models. Auditing vehicles through high-performance MCP protocols.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                  {[
                    {
                      title: "Recall Intelligence",
                      desc: "Real-time auditing of NHTSA safety recalls and compliance directives.",
                      icon: ShieldCheck,
                      accent: "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    },
                    {
                      title: "Technical Specs",
                      desc: "High-precision decoding of engine type, brake systems, and manufacturing plant.",
                      icon: Zap,
                      accent: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    },
                    {
                      title: "Protocol-Driven",
                      desc: "Utilizing Model Context Protocol for low-latency tool execution and inference.",
                      icon: Sparkles,
                      accent: "bg-purple-500/10 border-purple-500/20 text-purple-400"
                    }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="p-8 rounded-2xl bg-[#ffffff03] border border-[#ffffff08] text-left hover:border-[#ffffff1a] transition-all group/card cursor-default"
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-6 border", item.accent)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-2 tracking-tight">{item.title}</h3>
                      <p className="text-xs leading-relaxed text-[#666] group-hover/card:text-[#888] transition-colors">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-16">
                {messages.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-10 w-full group",
                      m.role === 'user' ? "flex-col items-end" : "flex-row items-start"
                    )}
                  >
                    <div className={cn(
                      "flex flex-col gap-4 w-full",
                      m.role === 'user' ? "items-end" : "items-start"
                    )}>
                      {/* Role Label */}
                      <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        {m.role === 'user' ? (
                          <>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#888]">User</span>
                            <div className="w-1 h-1 rounded-full bg-gray-600" />
                          </>
                        ) : (
                          <>
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Assistant</span>
                          </>
                        )}
                      </div>

                      <div className={cn(
                        "prose prose-invert prose-p:leading-8 prose-p:text-[#d1d1d1] max-w-2xl text-base font-medium",
                        m.role === 'user' ? "text-right" : "text-left"
                      )}>
                        {m.parts.map((part, pIdx) => (
                          <div key={pIdx} className="inline">
                            {part.type === 'text' && (
                              <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-headings:font-bold prose-headings:mb-3 prose-h3:text-lg prose-h3:mt-4 prose-p:text-[#d1d1d1] prose-p:leading-relaxed prose-p:my-2 prose-strong:text-white prose-strong:font-semibold prose-table:border-collapse prose-table:w-full prose-th:bg-[#1a1a1a] prose-th:border prose-th:border-[#333] prose-th:p-2 prose-th:text-left prose-th:text-[#888] prose-td:border prose-td:border-[#222] prose-td:p-2 prose-td:text-[#ccc] prose-ul:my-2 prose-li:my-0.5 prose-li:text-[#ccc] prose-code:bg-[#1a1a1a] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-blue-400">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.text}</ReactMarkdown>
                                {status === 'streaming' && idx === messages.length - 1 && pIdx === m.parts.length - 1 && (
                                  <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 translate-y-0.5 animate-pulse rounded-sm" />
                                )}
                              </div>
                            )}

                            {/* Handle tool parts - in v6 they are typed as tool-<toolName> */}
                            {part.type.startsWith('tool-') && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="my-8 p-4 rounded-xl bg-[#09090b] border border-[#ffffff0a] flex flex-col gap-3 font-mono shadow-xl relative overflow-hidden"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    (part as any).state === 'output-available' ? "bg-emerald-500" : "bg-blue-500 animate-pulse"
                                  )} />
                                  <span className={cn(
                                    "text-[11px] font-bold uppercase tracking-tighter",
                                    (part as any).state === 'output-available' ? "text-emerald-400" : "text-blue-400"
                                  )}>
                                    {(part as any).state === 'output-available' ? 'RESULT READY' : 'CALLING TOOL'}
                                  </span>
                                </div>
                                <div className="text-xs text-[#888] space-y-1">
                                  {(part as any).input?.vin && (
                                    <p>VIN: <span className="text-[#eee]">{(part as any).input.vin}</span></p>
                                  )}
                                  {(part as any).state === 'output-available' && (part as any).output && (
                                    <div className="mt-2 p-3 bg-[#0f0f0f] rounded-lg text-[#d1d1d1] whitespace-pre-wrap text-xs leading-relaxed">
                                      {typeof (part as any).output === 'string' ? (part as any).output : JSON.stringify((part as any).output, null, 2)}
                                    </div>
                                  )}
                                  {(part as any).state === 'output-error' && (
                                    <p className="text-red-400">Error: {(part as any).errorText}</p>
                                  )}
                                  {!(part as any).state?.includes('output') && (
                                    <p className="flex items-center gap-2">
                                      STATUS: <span className="text-[#eee] animate-pulse">Running analysis...</span>
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} className="h-20" />
          </div>
        </div>

        {/* Action Board (Floating Input) */}
        <div className="absolute bottom-0 left-0 right-0 p-10 sm:p-14 z-40">
          <div className="max-w-3xl mx-auto w-full">
            <motion.div
              layout
              className="relative p-2 rounded-2xl bg-[#0d0d0d] border border-[#ffffff0a] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] focus-within:border-[#ffffff1a] transition-all duration-300"
            >
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Audit vehicle by VIN..."
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-white px-6 py-4 text-sm font-medium placeholder:text-[#444]"
                />

                <div className="flex items-center gap-2 pr-2">
                  {isLoading ? (
                    <button
                      type="button"
                      className="h-10 px-4 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                      <div className="w-2 h-2 border-b-2 border-blue-400 rounded-full animate-spin" />
                      Processing
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="h-10 px-6 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100"
                    >
                      Run Audit
                    </button>
                  )}
                </div>
              </form>
            </motion.div>

            <span className="mt-8 text-center text-[10px] text-[#444] font-medium uppercase tracking-[0.25em] flex items-center justify-center gap-3">
              VinDealer v4.2.0 <span className="w-1 h-1 rounded-full bg-[#222] inline-block" /> Secure Inference Protocol
            </span>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes mesh-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(10%, 10%) scale(1.1); }
        }
        @keyframes mesh-2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          50% { transform: translate(-10%, -5%) scale(1); }
        }
        .animate-mesh-1 { animation: mesh-1 15s ease-in-out infinite; }
        .animate-mesh-2 { animation: mesh-2 18s ease-in-out infinite; }
        
        .font-display { font-family: var(--font-outfit), ui-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .tracking-tighterest { letter-spacing: -0.06em; }
      `}</style>
    </div>
  );
}
