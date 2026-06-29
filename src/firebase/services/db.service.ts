import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../config';
import { Transaction, Budget, UserProfile, SavingGoal, Feedback, AppConfig, Announcement, ChatMessage } from '../../types';

// ... (previous users code)

// Feedbacks
export const addFeedback = async (feedback: Omit<Feedback, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'feedbacks'), {
    ...feedback,
    createdAt: serverTimestamp()
  });
};

export const subscribeToFeedbacks = (callback: (feedbacks: Feedback[]) => void) => {
  const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const feedbacks = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Feedback[];
    callback(feedbacks);
  }, (error) => {
    console.error("Firestore Error (feedbacks): ", error);
  });
};

export const subscribeToUserFeedbacks = (userId: string, callback: (feedbacks: Feedback[]) => void) => {
  const q = query(collection(db, 'feedbacks'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const feedbacks = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Feedback[];
    callback(feedbacks);
  }, (error) => {
    console.error("Firestore Error (user feedbacks): ", error);
  });
};

export const updateFeedback = async (feedbackId: string, data: Partial<Feedback>) => {
  await updateDoc(doc(db, 'feedbacks', feedbackId), data);
};

export const deleteFeedback = async (feedbackId: string) => {
  await deleteDoc(doc(db, 'feedbacks', feedbackId));
};

// Real-Time Chat
export const sendChatMessage = async (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'chats'), {
    ...msg,
    createdAt: serverTimestamp()
  });
};

export const subscribeToChatMessages = (userId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, 'chats'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as ChatMessage[];
    callback(messages);
  }, (error) => {
    console.error("Firestore Error (chats): ", error);
  });
};

export const subscribeToAllChatsForAdmin = (callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, 'chats'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as ChatMessage[];
    callback(messages);
  }, (error) => {
    console.error("Firestore Error (admin chats): ", error);
  });
};

export const updateChatMessageReaction = async (messageId: string, reaction: string | null) => {
  const chatDoc = doc(db, 'chats', messageId);
  await updateDoc(chatDoc, { reaction });
};

// App Config / Feature Flags
export const subscribeToAppConfig = (callback: (config: AppConfig | null) => void) => {
  const configDoc = doc(db, 'config', 'main');
  return onSnapshot(configDoc, {
    next: (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as AppConfig);
      } else {
        callback(null);
      }
    },
    error: (err) => {
      console.error('AppConfig subscription error:', err);
    }
  });
};

export const updateAppConfig = async (features: { [key: string]: boolean }) => {
  const configDoc = doc(db, 'config', 'main');
  await setDoc(configDoc, { features }, { merge: true });
};

// Announcements
export const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
  return addDoc(collection(db, 'announcements'), {
    ...announcement,
    createdAt: serverTimestamp()
  });
};

export const subscribeToAnnouncements = (callback: (announcements: Announcement[]) => void) => {
  const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const announcements = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Announcement[];
    callback(announcements);
  }, (error) => {
    console.error("Firestore Error (announcements): ", error);
  });
};

export const deleteAnnouncement = async (id: string) => {
  await deleteDoc(doc(db, 'announcements', id));
};

export const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
  await updateDoc(doc(db, 'announcements', id), data);
};

export const getEmailByUsername = async (username: string) => {
  try {
    const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
    if (usernameDoc.exists()) {
      return usernameDoc.data().email as string;
    }
    return null;
  } catch (error: any) {
    console.error('Error fetching email by username:', error);
    // If we get permission denied here, it's a major sign rules are not applied
    if (error.code === 'permission-denied') {
      throw new Error('Database access denied. Please contact support.');
    }
    throw error;
  }
};

export const isUsernameAvailable = async (username: string) => {
  const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
  return !usernameDoc.exists();
};

export const createUserProfile = async (profile: UserProfile) => {
  const userDoc = doc(db, 'users', profile.uid);
  await setDoc(userDoc, {
    ...profile,
    createdAt: new Date().toISOString()
  });

  if (profile.username) {
    const usernameDoc = doc(db, 'usernames', profile.username.toLowerCase());
    await setDoc(usernameDoc, {
      email: profile.email,
      uid: profile.uid
    });
  }
};

export const getUserProfile = async (uid: string) => {
  const userDoc = doc(db, 'users', uid);
  const snapshot = await getDoc(userDoc);
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
};

// Transactions
export const subscribeToTransactions = (userId: string, callback: (transactions: Transaction[]) => void) => {
  const q = query(
    collection(db, 'transactions'), 
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Transaction[];
    callback(transactions);
  }, (error) => {
    console.error("Firestore Error (transactions): ", error);
  });
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  return addDoc(collection(db, 'transactions'), {
    ...transaction,
    createdAt: serverTimestamp()
  });
};

// Budgets
export const subscribeToBudgets = (userId: string, callback: (budgets: Budget[]) => void) => {
  const q = query(collection(db, 'budgets'), where('userId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const budgets = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Budget[];
    callback(budgets);
  }, (error) => {
    console.error("Firestore Error (budgets): ", error);
  });
};

export const upsertBudget = async (budget: Omit<Budget, 'id'>) => {
  const budgetId = `${budget.userId}_${budget.category}_${budget.monthYear}`;
  const budgetDoc = doc(db, 'budgets', budgetId);
  await setDoc(budgetDoc, budget, { merge: true });
};

export const deleteBudget = async (budgetId: string) => {
  const budgetDoc = doc(db, 'budgets', budgetId);
  await deleteDoc(budgetDoc);
};

// Saving Goals
export const subscribeToSavingGoals = (userId: string, callback: (goals: SavingGoal[]) => void) => {
  const q = query(collection(db, 'savingGoals'), where('userId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const goals = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as SavingGoal[];
    callback(goals);
  }, (error) => {
    console.error("Firestore Error (savingGoals): ", error);
  });
};

export const addSavingGoal = async (goal: Omit<SavingGoal, 'id'>) => {
  return addDoc(collection(db, 'savingGoals'), {
    ...goal,
    createdAt: serverTimestamp()
  });
};

export const updateSavingGoalAmount = async (goalId: string, amount: number) => {
  const goalDoc = doc(db, 'savingGoals', goalId);
  await updateDoc(goalDoc, { currentAmount: amount });
};

export const deleteSavingGoal = async (goalId: string) => {
  await deleteDoc(doc(db, 'savingGoals', goalId));
};
