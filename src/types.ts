/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  email: string;
  username?: string;
  createdAt: string;
  preferredCurrency: string;
}

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Cash' | 'Debit' | 'E-Wallet';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
}

export interface Budget {
  id?: string;
  userId: string;
  category: string;
  limitAmount: number;
  monthYear: string; // e.g., '2026-06'
}

export interface SavingGoal {
  id?: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export interface Feedback {
  id?: string;
  userId: string;
  userName?: string;
  userEmail: string;
  type: 'Critique' | 'Suggestion' | 'Question';
  content: string;
  createdAt: any;
  adminReply?: string;
}

export interface AppConfig {
  id: string;
  features: {
    [key: string]: boolean;
  };
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  createdAt: any;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  scheduledFor?: any;
  expiresAt?: any;
}

export interface ChatMessage {
  id?: string;
  userId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  text: string;
  createdAt: any;
  reaction?: string | null;
}

export interface ChatThread {
  userId: string;
  userEmail: string;
  userName: string;
  lastMessage: string;
  lastMessageAt: any;
}

export const EXPENSE_CATEGORIES = [
  'Makan',
  'Transport',
  'Listrik',
  'Data Selular',
  'Akademik',
  'Jajan',
  'Online Shop'
] as const;

export const INCOME_CATEGORIES = [
  'Allowance',
  'Part-Time Wages',
  'Freelance Gigs',
  'Scholarships'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];
