import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';
import { auth, loginWithGoogle } from '../../firebase/services/auth.service';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const ADMIN_EMAIL = "11251017@student.itk.ac.id";

export default function AdminLogin({ isOpen, onClose, onLogin }: AdminLoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentUser = auth.currentUser;
  const isAuthorized = currentUser?.email === ADMIN_EMAIL;

  const handleVerify = async () => {
    if (isAuthorized) {
      onLogin();
      onClose();
    } else {
      setError("Active account is not authorized for Admin access.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // After login, the user state changes, but we stay in the modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-6 sm:p-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full" />

            <div className="space-y-8 relative z-10">
              <div className="text-center space-y-2">
                <div className="inline-flex p-4 bg-indigo-500/10 rounded-3xl mb-4">
                  <Shield className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Admin Portal</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Restricted to {ADMIN_EMAIL}</p>
              </div>

              <div className="space-y-6">
                {!currentUser ? (
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-center">
                      <Lock className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Please sign in with your authorized admin account to proceed.</p>
                    </div>
                    <button
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl py-4 font-black transition-all hover:bg-slate-800 dark:hover:bg-indigo-50 active:scale-95 uppercase tracking-widest text-[10px]"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign in with Google
                    </button>
                  </div>
                ) : isAuthorized ? (
                  <div className="space-y-4">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl text-center">
                      <CheckCircle2 className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mx-auto mb-3" />
                      <p className="text-indigo-600 dark:text-indigo-200 text-xs font-bold">Authenticated as {currentUser.email}</p>
                    </div>
                    <button
                      onClick={handleVerify}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl py-4 font-black transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
                    >
                      Access Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl text-center">
                      <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto mb-3" />
                      <p className="text-rose-600 dark:text-rose-400 text-xs font-bold">Current account ({currentUser.email}) is not authorized.</p>
                    </div>
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-2xl py-4 font-black transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                    >
                      Switch Account
                    </button>
                  </div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </div>

              <button 
                onClick={onClose}
                className="w-full text-slate-500 hover:text-slate-300 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
