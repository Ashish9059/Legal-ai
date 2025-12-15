import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserState, SubscriptionTier, AppSettings, ChatSession, Message } from '../types';
import { TIER_LIMITS } from '../constants';

interface AppContextType {
  userState: UserState;
  settings: AppSettings;
  currentSession: ChatSession;
  sessions: ChatSession[];
  isLoading: boolean;
  
  // Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  upgradeTier: (tier: SubscriptionTier) => void;
  incrementQueryCount: () => boolean; // Returns false if limit reached
  addMessageToSession: (message: Message) => void;
  createNewSession: () => void;
  selectSession: (id: string) => void;
  resetDailyLimits: () => void;
  purchaseOneTimeFeature: (featureName: string) => void;
  checkFeatureAccess: (requiredTier: SubscriptionTier, featureName?: string) => boolean;
}

const defaultUserState: UserState = {
  tier: SubscriptionTier.FREE,
  dailyQueriesUsed: 0,
  lastQueryDate: new Date().toISOString(),
  documentsGenerated: 0,
  unlockedFeatures: []
};

const defaultSettings: AppSettings = {
  language: 'English',
  complexity: 'Simple',
};

const defaultSession: ChatSession = {
  id: 'default',
  title: 'New Conversation',
  messages: [],
  updatedAt: Date.now()
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Load from local storage or defaults
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('ns_userState');
    return saved ? JSON.parse(saved) : defaultUserState;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ns_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
     const saved = localStorage.getItem('ns_sessions');
     return saved ? JSON.parse(saved) : [defaultSession];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(sessions[0].id);
  const [isLoading, setIsLoading] = useState(false);

  // Persistence
  useEffect(() => { localStorage.setItem('ns_userState', JSON.stringify(userState)); }, [userState]);
  useEffect(() => { localStorage.setItem('ns_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('ns_sessions', JSON.stringify(sessions)); }, [sessions]);

  // Daily Reset Logic
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = userState.lastQueryDate.split('T')[0];

    if (today !== lastDate) {
      setUserState(prev => ({
        ...prev,
        dailyQueriesUsed: 0,
        lastQueryDate: new Date().toISOString()
      }));
    }
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const upgradeTier = (tier: SubscriptionTier) => {
    setUserState(prev => ({ ...prev, tier }));
  };

  const incrementQueryCount = (): boolean => {
    const limits = TIER_LIMITS[userState.tier];
    if (userState.dailyQueriesUsed >= limits.dailyQueries) {
      return false;
    }
    setUserState(prev => ({
      ...prev,
      dailyQueriesUsed: prev.dailyQueriesUsed + 1
    }));
    return true;
  };

  const addMessageToSession = (message: Message) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, message],
          updatedAt: Date.now(),
          // Auto-title snippet
          title: s.messages.length === 0 ? message.content.slice(0, 30) + '...' : s.title
        };
      }
      return s;
    }));
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Legal Query',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const selectSession = (id: string) => setCurrentSessionId(id);

  const resetDailyLimits = () => {
      // Dev helper
      setUserState(prev => ({...prev, dailyQueriesUsed: 0}));
  };
  
  const purchaseOneTimeFeature = (featureName: string) => {
    setUserState(prev => ({
      ...prev,
      unlockedFeatures: [...prev.unlockedFeatures, featureName]
    }));
  };

  const checkFeatureAccess = (requiredTier: SubscriptionTier, featureName?: string): boolean => {
      // 1. Check if user already owns it via one-time purchase
      if (featureName && userState.unlockedFeatures.includes(featureName)) {
          return true;
      }

      // 2. Check Subscription Tier
      const tiers = [SubscriptionTier.FREE, SubscriptionTier.PRO, SubscriptionTier.PREMIUM];
      const userTierIndex = tiers.indexOf(userState.tier);
      const requiredTierIndex = tiers.indexOf(requiredTier);

      return userTierIndex >= requiredTierIndex;
  };

  return (
    <AppContext.Provider value={{
      userState,
      settings,
      currentSession,
      sessions,
      isLoading,
      updateSettings,
      upgradeTier,
      incrementQueryCount,
      addMessageToSession,
      createNewSession,
      selectSession,
      resetDailyLimits,
      purchaseOneTimeFeature,
      checkFeatureAccess
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
