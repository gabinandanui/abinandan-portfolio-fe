'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, User, Loader2, Sparkles, Briefcase, Code, MapPin, Activity, Shield, Lightbulb } from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  "Core Expertise & Impact?",
  "Technical Architecture?",
  "Key Project Outcomes?",
  "Availability & Contact?"
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome. I have prepared a comprehensive briefing on Abinandan's professional trajectory and project impact. How may I assist your evaluation today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 'checking' | 'offline' | 'booting' | 'online'
  const [aiStatus, setAiStatus] = useState('checking');

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  // 0. Check server status on initial load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setAiStatus(data.status);
      } catch {
        setAiStatus('offline');
      }
    };
    checkStatus();
  }, []);

  const handleWakeUp = async (e) => {
    if (e) e.stopPropagation();
    setAiStatus('booting');
    
    // Send background wake knock
    fetch('/api/wake').catch(() => {});
    
    // Poll the status every 5 seconds until it becomes 'online'
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.status === 'online') {
          setAiStatus('online');
          clearInterval(interval);
        }
      } catch {}
    }, 5000);
  };

  // Handle initial open scroll
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  // Handle user-initiated scroll (typing or sending)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    // Only auto-scroll if user is typing OR the last message was from the user
    // This allows the response to "stay" and let the user scroll manually
    if (input || lastMessage?.role === 'user') {
      scrollToBottom();
    }
  }, [messages, input]);

  const handleSend = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;
    if (!text) setInput('');

    const newMessages = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      let response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      // Special handling for Vercel's 30s Edge Gateway Timeout + Hugging Face Cold Starts
      if (response.status === 504) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Booting up the AI Engine (this only happens on the first request)... Retrying..." }]);
        
        // Wait 5 seconds to let Hugging Face finish loading the model into RAM, then try ONE more time.
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages }),
        });
        
        // Remove the temporary boot message if retry is successful
        if (response.ok) {
           setMessages(prev => prev.filter(m => !m.content.includes("Booting up the AI Engine")));
        }
      }

      if (!response.body) throw new Error('ReadableStream not supported.');

      // We append an empty assistant message first
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      // We DO NOT set isLoading(false) here. We wait until the first stream chunk!

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let assistantMessageContent = '';
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        accumulated += decoder.decode(value, { stream: true });
        
        // Split by SSE double newlines
        const events = accumulated.split('\n\n');
        accumulated = events.pop() || ''; // the last element might be incomplete
        
        for (const event of events) {
          const trimmed = event.trim();
          if (!trimmed.startsWith('data: ')) continue;
          
          const jsonStr = trimmed.replace('data: ', '').trim();
          if (jsonStr === '[DONE]') continue;
          
          try {
            const data = JSON.parse(jsonStr);
            const content = data.choices[0]?.delta?.content;
            if (content) {
              if (isLoading) setIsLoading(false); // Clear loading spinner on first token
              assistantMessageContent += content;
            }
          } catch (e) {
            // Wait for next chunk to parse correctly
          }
        }
        
        // Update the last message
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = assistantMessageContent;
          return updated;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
      setIsLoading(false);
    } finally {
      setIsLoading(false); // Ensure it's cleared if stream abruptly ends before finishing
    }
  };

  return (
    <>
      {/* THE SIDEBAR DOSSIER CONSOLE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[500px] z-[200] bg-zinc-950/95 backdrop-blur-3xl border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
          >
            {/* DOSSIER HEADER: ANALYTIC GRID */}
            <div className="p-8 pb-0 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.4em]">Career Agent</h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-all group border border-white/5"
                >
                  <X size={20} className="text-white/20 group-hover:text-white" />
                </button>
              </div>

              {/* QUICK INSIGHTS BAR */}
              <div className="grid grid-cols-4 gap-1.5 pb-4">
                {[
                  { icon: Briefcase, label: "Exp", value: "11 Years" },
                  { icon: Code, label: "Stack", value: "FE / JS" },
                  { icon: Activity, label: "Focus", value: "React" },
                  { icon: Lightbulb, label: "Interest", value: "AI Dev." }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex flex-col items-center text-center">
                    <div className="flex items-center gap-1 mb-1 opacity-25">
                      <stat.icon size={9} className="text-white" />
                      <span className="text-[6px] font-black uppercase tracking-tighter">{stat.label}</span>
                    </div>
                    <p className="text-[9px] font-bold text-zinc-100 tracking-tight leading-tight w-full break-words">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* TRANSCRIPT AREA */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-gradient-to-b from-transparent to-indigo-500/5">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`group flex flex-col gap-4 max-w-[92%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-[1px] ${m.role === 'user' ? 'bg-indigo-500/40' : 'bg-white/10'}`} />
                      <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-black group-hover:text-indigo-400 transition-colors">
                        {m.role === 'user' ? 'Dialogue_Request' : 'Liaison_Response'}
                      </p>
                    </div>

                    <div className={`text-[14px] leading-loose whitespace-pre-wrap relative ${m.role === 'user'
                      ? 'text-white border-r-2 border-indigo-500/40 pr-6 text-right'
                      : 'text-zinc-300 border-l-2 border-white/10 pl-6 text-left'
                      }`}>
                      {m.role === 'assistant' ? (
                        <div className="space-y-4">
                          {m.content.split('\n').map((line, idx) => {
                            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                              return (
                                <div key={idx} className="flex gap-3 pl-1">
                                  <span className="text-indigo-500 mt-1.5">•</span>
                                  <span dangerouslySetInnerHTML={{
                                    __html: line.trim().substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  }} />
                                </div>
                              );
                            }
                            return (
                              <p key={idx} dangerouslySetInnerHTML={{
                                __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              }} />
                            );
                          })}
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-4 pl-6 border-l-2 border-white/10 py-2">
                  <Loader2 size={16} className="text-indigo-400 animate-spin" />
                  <p className="text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-black animate-pulse">Accessing Experience Archive...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* BRIDGE INPUT DECK */}
            <div className="p-8 bg-black/40 border-t border-white/5">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative group"
              >
                <div className="absolute inset-x-0 -top-px h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent group-focus-within:opacity-100 opacity-0 transition-opacity" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Inquire further..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:bg-white/[0.06] transition-all font-sans placeholder:text-zinc-800"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || aiStatus !== 'online'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-20 transition-all shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    disabled={aiStatus !== 'online'}
                    className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors disabled:opacity-20"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THE FLOATING RIGHT TRIGGER */}
      {!isOpen && (
        <motion.button
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ x: -10 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-10 right-10 z-[101] group flex flex-col items-end"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-10 bg-indigo-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative bg-zinc-950 border border-white/10 rounded-full px-6 py-4 flex items-center gap-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3 pr-6 border-r border-white/10">
              {aiStatus === 'checking' && <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">Checking...</span>}
              
              {aiStatus === 'offline' && (
                <button 
                  onClick={handleWakeUp}
                  className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 -ml-2 rounded transition-colors group/btn"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-[0.3em] group-hover/btn:text-white transition-colors">Wake AI Engine</span>
                </button>
              )}

              {aiStatus === 'booting' && (
                <>
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                  <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.3em] animate-pulse">Booting...</span>
                </>
              )}

              {aiStatus === 'online' && (
                <>
                  <div className="relative">
                    <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  </div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em]">Online</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] group-hover:text-indigo-400 transition-colors italic">Career Agent</p>
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Sparkles size={14} />
              </div>
            </div>
          </div>
        </motion.button>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default ChatBot;
