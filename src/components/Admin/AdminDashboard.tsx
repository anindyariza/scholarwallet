import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  MessageSquare, 
  Settings, 
  Trash2, 
  X, 
  CheckCircle2, 
  Activity,
  Users,
  Layout,
  ToggleLeft,
  ToggleRight,
  LogOut,
  Calendar,
  Clock,
  Reply,
  Send,
  Search
} from 'lucide-react';
import { 
  subscribeToFeedbacks, 
  deleteFeedback, 
  updateFeedback,
  subscribeToAppConfig, 
  updateAppConfig,
  subscribeToAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
  subscribeToAllChatsForAdmin,
  sendChatMessage,
  updateChatMessageReaction
} from '../../firebase/services/db.service';
import { Feedback, AppConfig, Announcement, ChatMessage } from '../../types';
import { Moon, Sun, Menu, ArrowLeft } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function AdminDashboard({ onLogout, isDarkMode, toggleDarkMode }: AdminDashboardProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [allChats, setAllChats] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'feedback' | 'features' | 'announcements' | 'chats'>('feedback');
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [adminChatReplyText, setAdminChatReplyText] = useState('');
  const [isAdminSendingChat, setIsAdminSendingChat] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'medium' as const, scheduledFor: '', expiresAt: '' });
  const [isAddingAnnouncement, setIsAddingAnnouncement] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Advanced Chat Features
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [adminActiveReactionMenuId, setAdminActiveReactionMenuId] = useState<string | null>(null);
  const adminMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubFeedbacks = subscribeToFeedbacks(setFeedbacks);
    const unsubConfig = subscribeToAppConfig(setConfig);
    const unsubAnnouncements = subscribeToAnnouncements(setAnnouncements);
    const unsubChats = subscribeToAllChatsForAdmin(setAllChats);
    return () => {
      unsubFeedbacks();
      unsubConfig();
      unsubAnnouncements();
      unsubChats();
    };
  }, []);

  const chatThreads = React.useMemo(() => {
    const threadsMap = new Map<string, { userId: string; userName: string; userEmail: string; messages: ChatMessage[]; lastMessageAt: any }>();
    allChats.forEach(chat => {
      if (!chat.userId) return;
      if (!threadsMap.has(chat.userId)) {
        threadsMap.set(chat.userId, {
          userId: chat.userId,
          userName: chat.senderId === chat.userId ? chat.senderName : '',
          userEmail: chat.senderId === chat.userId ? chat.senderEmail : '',
          messages: [],
          lastMessageAt: chat.createdAt
        });
      }
      const t = threadsMap.get(chat.userId)!;
      t.messages.push(chat);
      if (chat.senderId === chat.userId) {
        if (!t.userName) t.userName = chat.senderName;
        if (!t.userEmail) t.userEmail = chat.senderEmail;
      }
    });

    threadsMap.forEach(t => {
      t.messages.sort((a, b) => {
        const aTime = (a.createdAt?.seconds || (Date.now() / 1000));
        const bTime = (b.createdAt?.seconds || (Date.now() / 1000));
        return aTime - bTime;
      });
      if (t.messages.length > 0) {
        t.lastMessageAt = t.messages[t.messages.length - 1].createdAt;
      }
    });

    return Array.from(threadsMap.values()).sort((a, b) => {
      const aTime = (a.lastMessageAt?.seconds || (Date.now() / 1000));
      const bTime = (b.lastMessageAt?.seconds || (Date.now() / 1000));
      return bTime - aTime;
    });
  }, [allChats]);

  // Filter threads based on search input
  const filteredChatThreads = React.useMemo(() => {
    if (!chatSearchQuery.trim()) return chatThreads;
    const q = chatSearchQuery.toLowerCase();
    return chatThreads.filter(t => 
      (t.userName || '').toLowerCase().includes(q) || 
      (t.userEmail || '').toLowerCase().includes(q)
    );
  }, [chatThreads, chatSearchQuery]);

  const activeThread = React.useMemo(() => {
    return chatThreads.find(t => t.userId === selectedChatUserId);
  }, [chatThreads, selectedChatUserId]);

  // Scroll active chat panel to bottom when message list or active user changes
  useEffect(() => {
    if (adminMessagesEndRef.current) {
      adminMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChatUserId, activeThread?.messages?.length]);

  const handleSendAdminChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminChatReplyText.trim() || !selectedChatUserId || isAdminSendingChat) return;
    setIsAdminSendingChat(true);
    try {
      await sendChatMessage({
        userId: selectedChatUserId,
        senderId: 'admin',
        senderName: 'Admin',
        senderEmail: '11251017@student.itk.ac.id',
        text: adminChatReplyText.trim()
      });
      setAdminChatReplyText('');
    } catch (err) {
      console.error("Gagal mengirim balasan admin:", err);
    } finally {
      setIsAdminSendingChat(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAnnouncement({
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      priority: newAnnouncement.priority,
      scheduledFor: newAnnouncement.scheduledFor ? new Date(newAnnouncement.scheduledFor) : null,
      expiresAt: newAnnouncement.expiresAt ? new Date(newAnnouncement.expiresAt) : null,
      isActive: true
    });
    setNewAnnouncement({ title: '', content: '', priority: 'medium', scheduledFor: '', expiresAt: '' });
    setIsAddingAnnouncement(false);
  };

  const handleToggleAnnouncement = async (ann: Announcement) => {
    if (!ann.id) return;
    await updateAnnouncement(ann.id, { isActive: !ann.isActive });
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id);
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  const handleToggleFeature = async (featureKey: string) => {
    const currentFeatures = config?.features || {
      savings: true,
      budgets: true,
      transactions: true,
      feedback: true,
      ai_reply: true
    };
    const newFeatures = { ...currentFeatures, [featureKey]: !currentFeatures[featureKey] };
    await updateAppConfig(newFeatures);
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      await deleteFeedback(id);
    } catch (error: any) {
      console.error("Failed to delete feedback:", error);
    }
  };

  const handleReplyFeedback = async (id: string) => {
    if (!replyContent.trim()) return;
    await updateFeedback(id, { adminReply: replyContent });
    setReplyingTo(null);
    setReplyContent('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-indigo-500/30 transition-colors duration-300">
      {/* Sidebar / Header */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-50 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-indigo-500/10 rounded-2xl">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Control Center</h1>
            <p className="text-slate-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Admin Authorization Level 4</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-nowrap">
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'feedback' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Feedbacks
            </button>
            <button 
              onClick={() => setActiveTab('chats')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'chats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Chats / Tanya Jawab
            </button>
            <button 
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Announcements
            </button>
            <button 
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'features' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Features
            </button>
          </div>

          <button 
            onClick={toggleDarkMode}
            className="p-3 bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-2xl transition-all active:scale-95 border border-slate-200 dark:border-slate-800"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={onLogout}
            className="p-3 bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 rounded-2xl transition-all active:scale-95 border border-rose-500/20"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className="p-2 bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-xl transition-all active:scale-95 border border-slate-200 dark:border-slate-800"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-xl transition-all active:scale-95 border border-slate-200 dark:border-slate-800"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 p-4 md:hidden flex flex-col gap-4 shadow-xl"
          >
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setActiveTab('feedback'); setIsMenuOpen(false); }}
                className={`p-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all text-left ${
                  activeTab === 'feedback' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Feedbacks
              </button>
              <button 
                onClick={() => { setActiveTab('chats'); setIsMenuOpen(false); }}
                className={`p-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all text-left ${
                  activeTab === 'chats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Chats / Tanya Jawab
              </button>
              <button 
                onClick={() => { setActiveTab('announcements'); setIsMenuOpen(false); }}
                className={`p-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all text-left ${
                  activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Announcements
              </button>
              <button 
                onClick={() => { setActiveTab('features'); setIsMenuOpen(false); }}
                className={`p-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all text-left ${
                  activeTab === 'features' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Features
              </button>
            </div>
            <button 
              onClick={() => { onLogout(); setIsMenuOpen(false); }}
              className="p-4 bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all active:scale-95 border border-rose-500/20 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`transition-all duration-300 max-w-7xl mx-auto ${
        activeTab === 'chats' ? 'px-1.5 sm:px-8 pt-20 pb-4 sm:pt-28 sm:pb-10' : 'pt-32 pb-20 px-4 sm:px-8'
      }`}>
        <AnimatePresence mode="wait">
          {activeTab === 'chats' ? (
            <motion.div
              key="chats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-8"
            >
              <div className="px-2 sm:px-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Tanya Jawab / Real-Time Chat</h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">Bantu mahasiswa menyelesaikan kendala keuangan mereka</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-full w-fit">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Sistem Siap Menghubungkan</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl h-[80vh] lg:h-[80vh] min-h-[500px] lg:min-h-[600px] relative">
                {/* Threads Sidebar */}
                <div className={`border-r border-slate-100 dark:border-slate-800 h-full min-h-0 bg-slate-50/50 dark:bg-slate-900/50 ${
                  selectedChatUserId ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
                }`}>
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Antrean Percakapan ({filteredChatThreads.length})</h3>
                    </div>
                    {/* Search bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        placeholder="Cari mahasiswa..."
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800/40">
                    {filteredChatThreads.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 font-semibold space-y-2">
                        <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 animate-bounce" />
                        <p>{chatSearchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada antrean pesan masuk.'}</p>
                      </div>
                    ) : (
                      filteredChatThreads.map(thread => {
                        const isSelected = selectedChatUserId === thread.userId;
                        const lastMsg = thread.messages[thread.messages.length - 1];
                        const isUnreplied = lastMsg && lastMsg.senderId !== 'admin';
                        
                        // Extract initials
                        const initials = (thread.userName || thread.userEmail || 'M').substring(0, 1).toUpperCase();
                        
                        // Dynamic gradient based on userId
                        let hash = 0;
                        for (let i = 0; i < thread.userId.length; i++) {
                          hash = thread.userId.charCodeAt(i) + ((hash << 5) - hash);
                        }
                        const gradients = [
                          'from-blue-500 to-indigo-600',
                          'from-emerald-500 to-teal-600',
                          'from-rose-500 to-pink-600',
                          'from-amber-500 to-orange-600',
                          'from-purple-500 to-violet-600',
                          'from-fuchsia-500 to-pink-600'
                        ];
                        const gradient = gradients[Math.abs(hash) % gradients.length];

                        return (
                          <button
                            key={thread.userId}
                            onClick={() => {
                              setSelectedChatUserId(thread.userId);
                            }}
                            className={`w-full text-left p-4 transition-all flex items-center gap-3 border-l-4 ${
                              isSelected 
                                ? 'bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-600' 
                                : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/30 border-transparent'
                            }`}
                          >
                            {/* Gradient Avatar */}
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-sm shadow-sm shrink-0 relative`}>
                              {initials}
                              {isUnreplied && (
                                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white dark:border-slate-900"></span>
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                  {thread.userName || thread.userEmail.split('@')[0]}
                                </span>
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                                  {thread.lastMessageAt?.seconds 
                                    ? new Date(thread.lastMessageAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : ''}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-400 truncate block font-mono leading-none">{thread.userEmail}</span>
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1 font-semibold leading-normal">
                                  {lastMsg?.senderId === 'admin' ? <span className="text-indigo-500 dark:text-indigo-400 font-black">Anda: </span> : ''}
                                  {lastMsg?.text}
                                </p>
                                {isUnreplied && (
                                  <span className="text-[8px] font-black tracking-widest text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full shrink-0 uppercase">
                                    Butuh Jawab
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Conversation Panel */}
                <div className={`lg:col-span-2 h-full min-h-0 bg-white dark:bg-slate-900 ${
                  selectedChatUserId ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
                }`}>
                  {selectedChatUserId ? (
                    (() => {
                      const activeThread = filteredChatThreads.find(t => t.userId === selectedChatUserId) || chatThreads.find(t => t.userId === selectedChatUserId);
                      if (!activeThread) return null;

                      // Extract initials for active chat
                      const activeInitials = (activeThread.userName || activeThread.userEmail || 'M').substring(0, 1).toUpperCase();
                      let activeHash = 0;
                      for (let i = 0; i < activeThread.userId.length; i++) {
                        activeHash = activeThread.userId.charCodeAt(i) + ((activeHash << 5) - activeHash);
                      }
                      const activeGradients = [
                        'from-blue-500 to-indigo-600',
                        'from-emerald-500 to-teal-600',
                        'from-rose-500 to-pink-600',
                        'from-amber-500 to-orange-600',
                        'from-purple-500 to-violet-600',
                        'from-fuchsia-500 to-pink-600'
                      ];
                      const activeGradient = activeGradients[Math.abs(activeHash) % activeGradients.length];

                      return (
                        <>
                          {/* Chat Header */}
                          <div className="px-4 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setSelectedChatUserId(null);
                                  setAdminActiveReactionMenuId(null);
                                }}
                                className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                title="Kembali ke daftar chat"
                              >
                                <ArrowLeft className="w-5 h-5" />
                              </button>
                              
                              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeGradient} flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0`}>
                                {activeInitials}
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-tight truncate">
                                  {activeThread.userName || activeThread.userEmail.split('@')[0]}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate leading-none">{activeThread.userEmail}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-500 shrink-0">
                              <Users className="w-3.5 h-3.5" />
                              <span className="text-[9px] font-black uppercase">Mahasiswa</span>
                            </div>
                          </div>

                          {/* Message History */}
                          <div className="flex-1 p-3 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/20 dark:bg-slate-950/25">
                            {activeThread.messages.map((msg, idx) => {
                              const isMe = msg.senderId === 'admin';
                              const formattedTime = msg.createdAt?.seconds 
                                ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                              const showAdminReactionMenu = adminActiveReactionMenuId === msg.id;

                              return (
                                <div 
                                  key={msg.id || idx}
                                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 relative`}
                                >
                                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 px-1">
                                    {isMe ? 'Anda (Admin)' : (msg.senderName || 'Mahasiswa')}
                                  </span>
                                  <div className="flex items-center gap-2 max-w-[85%] sm:max-w-[75%] relative group">
                                    {/* Admin Reaction Popover */}
                                    <AnimatePresence>
                                      {showAdminReactionMenu && msg.id && (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                          className={`absolute bottom-full z-20 mb-2 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-2xl flex items-center gap-1.5 ${
                                            isMe ? 'right-0' : 'left-0'
                                          }`}
                                        >
                                          {[
                                            { char: '❤️', label: 'love' },
                                            { char: '👍', label: 'like' },
                                            { char: '🔥', label: 'cool' },
                                            { char: '👏', label: 'bravo' },
                                            { char: '💡', label: 'insight' },
                                            { char: '😢', label: 'sad' }
                                          ].map((emoji) => (
                                            <button
                                              key={emoji.label}
                                              onClick={() => {
                                                if (msg.id) {
                                                  const newReaction = msg.reaction === emoji.char ? null : emoji.char;
                                                  updateChatMessageReaction(msg.id, newReaction);
                                                  setAdminActiveReactionMenuId(null);
                                                }
                                              }}
                                              className="w-7 h-7 flex items-center justify-center hover:scale-125 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-full transition-all text-sm"
                                              title={emoji.label}
                                            >
                                              {emoji.char}
                                            </button>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>

                                    {/* Message Bubble */}
                                    <div 
                                      onClick={() => msg.id && setAdminActiveReactionMenuId(showAdminReactionMenu ? null : msg.id)}
                                      className={`relative px-4 py-2.5 rounded-2xl cursor-pointer select-none transition-all active:scale-[0.98] ${
                                        isMe 
                                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20' 
                                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800/80 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750'
                                      }`}
                                    >
                                      <p className="text-xs sm:text-sm leading-relaxed font-semibold break-words whitespace-pre-wrap">
                                        {msg.text}
                                      </p>
                                      
                                      {/* reaction display */}
                                      {msg.reaction && (
                                        <div className={`absolute -bottom-2.5 ${isMe ? 'left-2' : 'right-2'} bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-full text-xs shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center font-sans`}>
                                          {msg.reaction}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono px-1">
                                    {formattedTime}
                                  </span>
                                </div>
                              );
                            })}
                            <div ref={adminMessagesEndRef} />
                          </div>

                          {/* Quick Replies / Canned Responses - Horizontal Scrollable Row */}
                          <div className="px-3 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/30 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 z-10 shadow-inner">
                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider shrink-0 mr-1 flex items-center gap-1">
                              ⚡ Pintasan:
                            </span>
                            {[
                              "Halo! Ada yang bisa kami bantu?",
                              "Kendala Anda sedang kami proses ya.",
                              "Solusi telah kami sampaikan, silakan dicoba kembali.",
                              "Terima kasih banyak atas feedback Anda!",
                              "Sama-sama! Semoga sukses selalu pembukuannya!"
                            ].map((reply, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setAdminChatReplyText(reply)}
                                className="px-3 py-1.5 text-[10px] font-extrabold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full transition-all border border-indigo-100 dark:border-indigo-950/60 shrink-0 shadow-sm"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>

                          {/* Chat Input */}
                          <form onSubmit={handleSendAdminChat} className="p-2.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0 shadow-lg z-10">
                            <input 
                              type="text"
                              value={adminChatReplyText}
                              onChange={(e) => setAdminChatReplyText(e.target.value)}
                              placeholder={`Balas pesan mahasiswa...`}
                              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-xs sm:text-sm font-semibold shadow-inner"
                              disabled={isAdminSendingChat}
                            />
                            <button
                              type="submit"
                              disabled={!adminChatReplyText.trim() || isAdminSendingChat}
                              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center shrink-0"
                              title="Kirim balasan"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </>
                      );
                    })()
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto space-y-4">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-sm animate-pulse">
                        <MessageSquare className="w-8 h-8 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm">Pilih Percakapan</h3>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                          Pilih salah satu mahasiswa dari antrean di sebelah kiri untuk berinteraksi dan membalas secara real-time.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'feedback' ? (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm dark:shadow-none">
                  <div className="p-4 bg-indigo-500/10 rounded-3xl">
                    <MessageSquare className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{feedbacks.length}</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Feedbacks</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm dark:shadow-none">
                  <div className="p-4 bg-emerald-500/10 rounded-3xl">
                    <Users className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Active</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">System Status</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm dark:shadow-none">
                  <div className="p-4 bg-amber-500/10 rounded-3xl">
                    <Activity className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{announcements.length}</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Active Notices</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {feedbacks.length === 0 ? (
                  <div className="py-20 text-center bg-white dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                    <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">No reports received yet</p>
                  </div>
                ) : (
                  feedbacks.map((fb) => (
                    <motion.div 
                      key={fb.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] group relative overflow-hidden shadow-sm dark:shadow-none"
                    >
                      <div className="absolute top-0 right-0 p-4 sm:p-6 flex gap-2">
                        {!fb.adminReply && (
                          <button 
                            onClick={() => {
                              setReplyingTo(replyingTo === fb.id ? null : (fb.id || null));
                              if (replyingTo !== fb.id) setReplyContent('');
                            }}
                            className="p-3 text-slate-400 dark:text-slate-600 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-2xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <Reply className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => fb.id && handleDeleteFeedback(fb.id)}
                          className="p-3 text-slate-400 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center mb-6">
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex w-fit ${
                          fb.type === 'Critique' ? 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400' : fb.type === 'Question' ? 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400'
                        }`}>
                          {fb.type}
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[10px] sm:text-xs">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{fb.userEmail}</span>
                          <span className="opacity-30">•</span>
                          <span>{new Date(fb.createdAt?.toDate?.() || fb.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <p className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-medium mb-6">
                        {fb.content}
                      </p>

                      {fb.adminReply && (
                        <div className="mt-6 p-6 bg-indigo-50 dark:bg-indigo-500/5 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-500/20 relative">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Admin Response</span>
                          </div>
                          <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">{fb.adminReply}</p>
                        </div>
                      )}

                      <AnimatePresence>
                        {replyingTo === fb.id && !fb.adminReply && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6"
                          >
                            <div className="flex flex-col gap-3">
                              <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write your response..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 resize-none"
                                rows={3}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => fb.id && handleReplyFeedback(fb.id)}
                                  disabled={!replyContent.trim()}
                                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                                >
                                  <Send className="w-3 h-3" />
                                  Send Reply
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : activeTab === 'announcements' ? (
            <motion.div 
              key="announcements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">System Announcements</h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">Broadcast updates and alerts to all users</p>
                </div>
                <button 
                  onClick={() => setIsAddingAnnouncement(true)}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 dark:hover:bg-indigo-50 active:scale-95 shadow-xl shadow-white/5"
                >
                  Create Broadcast
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {announcements.map((ann) => (
                  <motion.div 
                    key={ann.id}
                    layout
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] group relative shadow-sm dark:shadow-none"
                  >
                    <div className="absolute top-0 right-0 p-4 sm:p-6 flex gap-2">
                      <button 
                        onClick={() => handleToggleAnnouncement(ann)}
                        className={`p-3 rounded-2xl transition-all ${
                          ann.isActive ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-950'
                        }`}
                      >
                        {ann.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => ann.id && handleDeleteAnnouncement(ann.id)}
                        className="p-3 text-slate-400 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-4 pr-24">
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        ann.priority === 'high' ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 
                        ann.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 
                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {ann.priority} priority
                      </div>
                      <span className="text-slate-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                        Created: {new Date(ann.createdAt?.toDate?.() || ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">{ann.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">{ann.content}</p>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {isAddingAnnouncement && (
                  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsAddingAnnouncement(false)}
                      className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase italic italic">New Broadcast</h3>
                      <form onSubmit={handleCreateAnnouncement} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Title</label>
                          <input 
                            required
                            value={newAnnouncement.title}
                            onChange={e => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500/50"
                            placeholder="Announcement Heading"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Content</label>
                          <textarea 
                            required
                            rows={4}
                            value={newAnnouncement.content}
                            onChange={e => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 resize-none"
                            placeholder="Broadcast details..."
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Schedule (Optional)</label>
                            <input 
                              type="datetime-local"
                              value={newAnnouncement.scheduledFor}
                              onChange={e => setNewAnnouncement(prev => ({ ...prev, scheduledFor: e.target.value }))}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 sm:py-4 px-6 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Expires (Optional)</label>
                            <input 
                              type="datetime-local"
                              value={newAnnouncement.expiresAt}
                              onChange={e => setNewAnnouncement(prev => ({ ...prev, expiresAt: e.target.value }))}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 sm:py-4 px-6 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500/50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                          {(['low', 'medium', 'high'] as const).map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setNewAnnouncement(prev => ({ ...prev, priority: p }))}
                              className={`py-3 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                                newAnnouncement.priority === p 
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                  : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                        <button 
                          type="submit"
                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                        >
                          Execute Broadcast
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4 mb-12">
                <div className="inline-flex p-4 bg-indigo-500/10 rounded-3xl">
                  <Layout className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Feature Management</h2>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">Toggle application modules on/off globally</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-4 sm:space-y-6 shadow-sm dark:shadow-none">
                {[
                  { key: 'savings', label: 'Savings & Goals', desc: 'Allow users to set and track saving objectives' },
                  { key: 'budgets', label: 'Budget Monitors', desc: 'Categorized spending limits and alerts' },
                  { key: 'transactions', label: 'Transaction Ledger', desc: 'Core income and expense logging system' },
                  { key: 'feedback', label: 'Feedback System', desc: 'Public portal for suggestions and critiques' },
                  { key: 'ai_reply', label: 'AI Auto-Response', desc: 'Automatically reply to student messages using Gemini 3.5 Flash AI' }
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl sm:rounded-[2rem] border border-slate-100 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-xs sm:text-sm mb-1">{feature.label}</h4>
                      <p className="text-slate-500 text-[10px] sm:text-xs">{feature.desc}</p>
                    </div>
                    <button 
                      onClick={() => handleToggleFeature(feature.key)}
                      className="p-2 transition-all active:scale-90"
                    >
                      {config?.features?.[feature.key] !== false ? (
                        <ToggleRight className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 sm:w-12 h-12 text-slate-300 dark:text-slate-700" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] flex gap-6 items-start">
                <Settings className="w-6 h-6 text-amber-500 mt-1 shrink-0" />
                <div>
                  <h4 className="text-amber-500 font-black uppercase tracking-widest text-xs mb-2">Notice</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Toggling features here will affect all users in real-time. Please ensure system stability before making changes to core modules.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
