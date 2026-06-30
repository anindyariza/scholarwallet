import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, ShieldCheck, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { loginWithGoogle, registerWithEmail, loginWithEmail } from '../../firebase/services/auth.service';
import { createUserProfile, getEmailByUsername, isUsernameAvailable } from '../../firebase/services/db.service';
import { cn } from '../../lib/utils';

interface AuthScreenProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function AuthScreen({ isDarkMode, toggleDarkMode }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState(''); // email or username
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validation: Basic email check
  const isEmail = (str: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      if (!identifier) {
        setError('Silakan masukkan email atau username Anda.');
        return;
      }
    } else {
      if (!isEmail(identifier)) {
        setError('Silakan masukkan alamat email yang valid.');
        return;
      }
      if (!username || username.length < 3) {
        setError('Username minimal harus 3 karakter.');
        return;
      }
    }

    if (password.length < 8) {
      setError('Password minimal harus 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        let loginEmail = identifier;
        if (!isEmail(identifier)) {
          // It's a username, look up the email
          const foundEmail = await getEmailByUsername(identifier);
          if (!foundEmail) {
            throw new Error('Username tidak ditemukan.');
          }
          loginEmail = foundEmail;
        }
        await loginWithEmail(loginEmail, password);
      } else {
        // Registering
        const isAvailable = await isUsernameAvailable(username);
        if (!isAvailable) {
          throw new Error('Username sudah digunakan.');
        }

        const { user } = await registerWithEmail(identifier, password);
        await createUserProfile({
          uid: user.uid,
          email: user.email!,
          username: username.toLowerCase(),
          createdAt: new Date().toISOString(),
          preferredCurrency: 'IDR'
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Login dengan Email/Password saat ini dinonaktifkan di Firebase Console. Silakan aktifkan provider "Email/Password" atau gunakan tombol Login Google di bawah.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        await createUserProfile({
          uid: user.uid,
          email: user.email!,
          createdAt: new Date().toISOString(),
          preferredCurrency: 'IDR'
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bento-card p-6 sm:p-10 relative z-10 shadow-2xl shadow-emerald-500/5"
      >
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20 rotate-3">
            <ShieldCheck className="text-white dark:text-slate-950 w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-900 dark:text-white tracking-tighter">ScholarWallet</h1>
          <p className="text-slate-500 text-xs sm:text-sm text-center mt-3 font-medium max-w-[240px] leading-relaxed">
            Pendamping keuangan cerdas untuk mahasiswa perguruan tinggi.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-2xl mb-8 border border-slate-200 dark:border-slate-700/50">
          <button 
            onClick={() => setIsLogin(true)}
            className={cn(
              "flex-1 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300",
              isLogin ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Masuk
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={cn(
              "flex-1 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300",
              !isLogin ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              {isLogin ? 'Email atau Username' : 'Alamat Email'}
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type={isLogin ? "text" : "email"}
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={isLogin ? "email@edu atau username" : "nama@mahasiswa.edu"}
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          {!isLogin && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Username Unik</label>
              <div className="relative group">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="pilih_username_anda"
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs text-center font-bold uppercase tracking-wider"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 rounded-2xl font-black shadow-2xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <><LogIn className="w-5 h-5" /> Masuk Sesi</>
            ) : (
              <><UserPlus className="w-5 h-5" /> Buat Akun Baru</>
            )}
          </button>
        </form>

        <div className="relative my-8 sm:my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 dark:text-slate-500 font-black tracking-[0.2em]">SSO Institusi</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-4 active:scale-[0.98] text-sm group"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google Workspace mah.
        </button>
      </motion.div>
    </div>
  );
}
