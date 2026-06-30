import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Send, X, AlertCircle, CheckCircle2, Shield, Clock } from 'lucide-react';
import { addFeedback, subscribeToUserFeedbacks } from '../../firebase/services/db.service';
import { Feedback } from '../../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userName?: string;
}

export default function FeedbackModal({ isOpen, onClose, userId, userEmail, userName }: FeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [type, setType] = useState<'Critique' | 'Suggestion'>('Suggestion');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userFeedbacks, setUserFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    if (isOpen && userId) {
      const unsub = subscribeToUserFeedbacks(userId, (data) => {
        setUserFeedbacks(data);
        if (data.some(f => f.adminReply)) {
          setActiveTab('history');
        }
      });
      return () => unsub();
    }
  }, [isOpen, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await addFeedback({
        userId,
        userEmail,
        userName,
        type,
        content: content.trim()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setContent('');
        setActiveTab('history');
      }, 2000);
    } catch (err: any) {
      setError('Gagal mengirim masukan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 right-0 p-6 z-10">
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all bg-slate-900/50 backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-shrink-0 space-y-6 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <Megaphone className="w-6 h-6 text-indigo-400" />
                  Feedback
                </h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">Bantu kami meningkatkan pengalaman Anda</p>
              </div>

              <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('new')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                    activeTab === 'new' 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Kirim Feedback
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                    activeTab === 'history' 
                      ? 'bg-slate-800 text-white' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Feedback Saya
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] pr-2 custom-scrollbar">
              {activeTab === 'new' ? (
                success ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 flex flex-col items-center justify-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-white">Terima Kasih!</h3>
                      <p className="text-slate-400 text-sm">Masukan Anda telah berhasil kami terima.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setType('Suggestion')}
                        className={`flex-1 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                          type === 'Suggestion' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Saran
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('Critique')}
                        className={`flex-1 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                          type === 'Critique' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Kritik / Kendala
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
                        Pesan
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={type === 'Suggestion' ? "Fitur apa yang ingin Anda lihat selanjutnya?" : "Apa yang kurang berfungsi dengan baik?"}
                        className="w-full h-32 bg-slate-950 border border-slate-800 rounded-3xl p-5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all resize-none"
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !content.trim()}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-3xl py-4 font-black transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Kirim Feedback
                        </>
                      )}
                    </button>
                  </form>
                )
              ) : (
                <div className="space-y-4">
                  {userFeedbacks.length === 0 ? (
                    <div className="text-center py-12">
                      <Megaphone className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">Anda belum mengirimkan masukan apa pun.</p>
                    </div>
                  ) : (
                    userFeedbacks.map((fb) => (
                      <div key={fb.id} className="bg-slate-950 border border-slate-800 rounded-[1.5rem] p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            fb.type === 'Critique' 
                              ? 'bg-rose-500/10 text-rose-400' 
                              : fb.type === 'Question'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {fb.type === 'Critique' ? 'Kritik' : fb.type === 'Suggestion' ? 'Saran' : fb.type}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleDateString('id-ID') : 'Baru saja'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed mb-4">{fb.content}</p>
                        
                        {fb.adminReply ? (
                          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-4 h-4 text-indigo-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Balasan Admin</span>
                            </div>
                            <p className="text-sm text-indigo-200 leading-relaxed">{fb.adminReply}</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                            Menunggu balasan
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
