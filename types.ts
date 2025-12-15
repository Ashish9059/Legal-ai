export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM'
}

export interface UserState {
  tier: SubscriptionTier;
  dailyQueriesUsed: number;
  lastQueryDate: string; // ISO Date string
  documentsGenerated: number;
  unlockedFeatures: string[]; // IDs of features purchased one-time
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export type Language = 'English' | 'Hindi' | 'Hinglish';
export type Complexity = 'Simple' | 'Legal';

export interface AppSettings {
  language: Language;
  complexity: Complexity;
}

export interface LegalTool {
  id: string;
  name: string;
  description: string;
  requiredTier: SubscriptionTier;
  iconName: string; // Mapping string for icon component
  action: () => void;
  oneTimePrice?: string;
}
