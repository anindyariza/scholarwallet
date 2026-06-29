import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Sparkles, Clock, Shield, Smile, Heart, ThumbsUp, Flame, HelpCircle, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { sendChatMessage, subscribeToChatMessages, updateChatMessageReaction, subscribeToAppConfig } from '../../firebase/services/db.service';
import { ChatMessage, AppConfig } from '../../types';

interface AskPanelProps {
  user: {
    uid: string;
    email: string;
    username?: string;
  };
}

const QUICK_PROMPTS = [
  { text: '💡 Cara buat anggaran?', value: 'Bagaimana cara membuat dan mengatur target anggaran bulanan yang efektif?' },
  { text: '📉 Tips hemat jajan?', value: 'Boleh minta tips menghemat pengeluaran jajan dan kopi harian?' },
  { text: '🎯 Hubungkan tabungan?', value: 'Bagaimana cara menambahkan progres tabungan di fitur Target Tabungan?' },
  { text: '🛡️ Laporkan bug sistem', value: 'Halo admin, saya ingin melaporkan bug/masalah teknis pada aplikasi.' }
];

const REACTION_EMOJIS = [
  { char: '❤️', label: 'love' },
  { char: '👍', label: 'like' },
  { char: '🔥', label: 'cool' },
  { char: '👏', label: 'bravo' },
  { char: '💡', label: 'insight' },
  { char: '😢', label: 'sad' }
];

export default function AskPanel({ user }: AskPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Subscribe to app config for AI reply feature flag
  useEffect(() => {
    const unsubscribe = subscribeToAppConfig(setConfig);
    return unsubscribe;
  }, []);

  // Subscribe to user's real-time chats
  useEffect(() => {
    const unsubscribe = subscribeToChatMessages(user.uid, (msgs) => {
      const sorted = [...msgs].sort((a, b) => {
        const aTime = a.createdAt?.seconds || (Date.now() / 1000);
        const bTime = b.createdAt?.seconds || (Date.now() / 1000);
        return aTime - bTime;
      });
      setMessages(sorted);
    });
    return unsubscribe;
  }, [user.uid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputText;
    if (!messageText.trim() || isSending || isAiTyping) return;

    setIsSending(true);
    if (!textToSend) {
      setInputText('');
    }

    try {
      await sendChatMessage({
        userId: user.uid,
        senderId: user.uid,
        senderName: user.username || user.email.split('@')[0],
        senderEmail: user.email,
        text: messageText.trim(),
      });

      // Check if AI reply feature is enabled (defaults to true if config hasn't loaded or isn't set yet)
      const isAiReplyEnabled = config?.features?.ai_reply !== false;
      if (isAiReplyEnabled) {
        setIsAiTyping(true);
        try {
          // Prepare history for API context
          const chatHistory = messages.map(m => ({
            senderId: m.senderId,
            text: m.text
          }));

          const response = await fetch('/api/chat/auto-reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: messageText.trim(),
              history: chatHistory
            })
          });

          if (response.ok) {
            const data = await response.json();
            // Store AI generated reply as admin response
            await sendChatMessage({
              userId: user.uid,
              senderId: 'admin',
              senderName: 'ScholarWallet AI',
              senderEmail: 'ai@scholarwallet.com',
              text: data.reply,
            });
          } else {
            console.error('AI Auto-reply API failed.');
          }
        } catch (apiErr) {
          console.error('Error fetching AI Auto-reply:', apiErr);
        } finally {
          setIsAiTyping(false);
        }
      }
    } catch (error) {
      console.error('Gagal mengirim pesan chat:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleSelectQuickPrompt = (val: string) => {
    setInputText(val);
  };

  const handleToggleReaction = async (msgId: string, char: string) => {
    try {
      const msg = messages.find(m => m.id === msgId);
      // Toggle reaction off if clicked same, else set new
      const newReaction = msg?.reaction === char ? null : char;
      await updateChatMessageReaction(msgId, newReaction);
      setActiveReactionMenuId(null);
    } catch (error) {
      console.error('Gagal memperbarui reaksi:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[78vh] sm:h-[72vh] min-h-[500px] lg:min-h-[550px] relative">
      {/* Panel Header */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-emerald-500/15 via-teal-500/5 to-indigo-500/10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">Tanya Admin & Support</h2>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span>Customer Helpdesk</span>
              <span>&bull;</span>
              <span className="text-emerald-600 dark:text-emerald-400">⏱️ Balas cepat ~5 mnt</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-sm shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Online</span>
        </div>
      </div>

      {/* Modern Notice Banner */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-semibold shrink-0">
        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span className="truncate">Sentuh pesan untuk memberikan reaksi emoji secara instan!</span>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 max-w-sm mx-auto space-y-4">
            <div className="w-14 h-14 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center animate-pulse">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 px-2">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-xs sm:text-sm">Mulai Percakapan</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Punya kendala mencatat pengeluaran, mengatur budget, atau ingin memberikan saran? Tanyakan langsung di sini.
              </p>
            </div>
            <div className="w-full pt-2">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Pertanyaan Populer:</span>
              <div className="flex flex-col gap-1.5 max-w-xs mx-auto">
                {QUICK_PROMPTS.slice(0, 2).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuickPrompt(p.value)}
                    className="w-full text-left p-2 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-slate-700/80 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 font-bold transition-all shadow-sm"
                  >
                    {p.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === user.uid;
              const formattedTime = msg.createdAt?.seconds 
                ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              const showMenu = activeReactionMenuId === msg.id;

              return (
                <div 
                  key={msg.id || idx} 
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 relative`}
                >
                  {/* Sender name label */}
                  <div className="flex items-center gap-1 px-1">
                    {!isMe && (
                      <div className="w-3.5 h-3.5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Shield className="w-2 h-2" />
                      </div>
                    )}
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {isMe ? 'Anda' : (msg.senderName || 'Support Admin')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 max-w-[85%] sm:max-w-[75%] relative group">
                    {/* Reaction Picker Popover */}
                    <AnimatePresence>
                      {showMenu && msg.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          className={`absolute bottom-full z-20 mb-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-2xl flex items-center gap-1.5 ${
                            isMe ? 'right-0' : 'left-0'
                          }`}
                        >
                          {REACTION_EMOJIS.map((emoji) => (
                            <button
                              key={emoji.label}
                              onClick={() => handleToggleReaction(msg.id!, emoji.char)}
                              className="w-7 h-7 flex items-center justify-center hover:scale-125 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-full transition-all text-sm"
                              title={emoji.label}
                            >
                              {emoji.char}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Chat Bubble container */}
                    <motion.div 
                      onClick={() => msg.id && setActiveReactionMenuId(showMenu ? null : msg.id)}
                      className={`relative px-4 py-2.5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] select-none ${
                        isMe 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-none shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-100 dark:border-slate-800'
                      }`}
                      whileHover={{ y: -1 }}
                    >
                      <div className="text-xs sm:text-sm leading-relaxed font-semibold break-words whitespace-pre-wrap">
                        <Markdown
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 last:mb-0" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 last:mb-0" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-extrabold" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            a: ({node, ...props}) => <a className="underline text-indigo-400" {...props} />
                          }}
                        >
                          {msg.text}
                        </Markdown>
                      </div>

                      {/* Display Reaction icon overlay at bottom-right edge of bubble */}
                      {msg.reaction && (
                        <motion.div
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className={`absolute -bottom-2 ${isMe ? 'left-2' : 'right-2'} bg-white dark:bg-slate-750 px-1.5 py-0.5 rounded-full text-xs shadow-md border border-slate-100 dark:border-slate-750 flex items-center justify-center select-none font-sans`}
                        >
                          {msg.reaction}
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Message Time and Status */}
                  <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono">
                      {formattedTime}
                    </span>
                    {isMe && (
                      <span className="text-[8px] text-emerald-500 flex items-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex flex-col items-start space-y-1 relative">
                <div className="flex items-center gap-1 px-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Sparkles className="w-2 h-2" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400">
                    ScholarWallet AI
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none px-4 py-2.5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI sedang merumuskan jawaban</span>
                  <span className="flex items-center gap-0.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Suggestions / Canned prompts row right above inputs */}
      <div className="bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-850 shrink-0">
        <div className="px-3 py-2.5 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 animate-spin-slow" /> Tanya:
          </span>
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectQuickPrompt(p.value)}
              className="px-3 py-1.5 text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full transition-all border border-indigo-100 dark:border-indigo-950/50 shrink-0 shadow-sm"
            >
              {p.text}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <form 
        onSubmit={handleFormSubmit} 
        className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0 z-10 shadow-lg"
      >
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik pertanyaan atau kendala keuangan..."
          className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-all text-xs sm:text-sm font-semibold shadow-inner"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-100 disabled:to-slate-100 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center shrink-0"
          title="Kirim pesan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
