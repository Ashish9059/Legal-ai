import React, { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import ChatInterface from './components/ChatInterface';
import ToolsDashboard from './components/ToolsDashboard';
import UpgradeModal from './components/UpgradeModal';
import { Scale, Menu, Zap, Crown, Plus, Lock } from './components/Icons';
import { SubscriptionTier } from './types';
import { APP_NAME, TIER_LIMITS } from './constants';

const AppContent = () => {
  const { 
    currentSession, 
    sessions, 
    selectSession, 
    createNewSession, 
    userState, 
    settings, 
    updateSettings 
  } = useApp();
  
  const [view, setView] = useState<'chat' | 'tools'>('chat');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [triggeredFeature, setTriggeredFeature] = useState<string | undefined>(undefined);

  const openUpgradeModal = (featureName?: string) => {
      setTriggeredFeature(featureName);
      setShowUpgrade(true);
  };
  
  const handleUpgradeClose = () => {
      setShowUpgrade(false);
      setTriggeredFeature(undefined);
  };

  const isLegalModeAllowed = TIER_LIMITS[userState.tier].allowedComplexity.includes('Legal');

  const handleComplexityToggle = () => {
      if (!isLegalModeAllowed && settings.complexity === 'Simple') {
          openUpgradeModal("Legal Mode");
          return;
      }
      updateSettings({ complexity: settings.complexity === 'Simple' ? 'Legal' : 'Simple' });
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={handleUpgradeClose} 
        triggeredFeature={triggeredFeature}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 md:translate-x-0 ${
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
        } md:static flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-legal-900/30 rounded-lg text-legal-500">
            <Scale />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Nyaya Sahayak</h1>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">Beta</span>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
            <button 
                onClick={() => {
                    createNewSession();
                    setView('chat');
                    if (window.innerWidth < 768) setShowMobileSidebar(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg border border-slate-700 transition-all group"
            >
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-white" /> New Chat
            </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Menu</div>
            
            <button 
                onClick={() => { setView('chat'); setShowMobileSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    view === 'chat' ? 'bg-legal-900/20 text-legal-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
                <span className="text-lg">💬</span> Legal Chat
            </button>

            <button 
                onClick={() => { setView('tools'); setShowMobileSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    view === 'tools' ? 'bg-legal-900/20 text-legal-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
                <Zap className="w-5 h-5" /> Tools & Drafts
            </button>

            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-8 px-2">History</div>
            <div className="space-y-1">
                {sessions.map(s => (
                    <button
                        key={s.id}
                        onClick={() => {
                            selectSession(s.id);
                            setView('chat');
                            setShowMobileSidebar(false);
                        }}
                        className={`w-full text-left truncate px-3 py-2 rounded-lg text-sm transition-colors ${
                            currentSession.id === s.id && view === 'chat' 
                                ? 'bg-slate-800 text-slate-200' 
                                : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {s.title}
                    </button>
                ))}
            </div>
        </nav>

        {/* Settings & Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            
            {/* Toggles */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400">Language</span>
                <select 
                    value={settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value as any })}
                    className="bg-slate-800 border border-slate-700 text-xs rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-legal-500"
                >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Hinglish">Hinglish</option>
                </select>
            </div>
            
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400">Mode</span>
                <button 
                    onClick={handleComplexityToggle}
                    className={`text-xs px-2 py-1 border rounded transition-colors w-20 text-center flex items-center justify-center gap-1 ${
                        settings.complexity === 'Legal' 
                        ? 'bg-legal-900/50 border-legal-500 text-legal-300' 
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                >
                    {settings.complexity}
                    {!isLegalModeAllowed && settings.complexity === 'Simple' && <Lock className="w-3 h-3 text-slate-500" />}
                </button>
            </div>

            {/* Upgrade Card */}
            <div 
                onClick={() => openUpgradeModal()}
                className="bg-gradient-to-r from-legal-900 to-legal-800 rounded-xl p-3 cursor-pointer border border-legal-700/50 hover:border-legal-500 transition-all group"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-legal-500 rounded text-white">
                            <Crown className="w-3 h-3" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">{userState.tier} Plan</p>
                            <p className="text-[10px] text-legal-200">
                                {userState.tier === SubscriptionTier.FREE ? 'Upgrade to Unlock' : 'Active'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-950 relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur z-30">
            <div className="flex items-center gap-3">
                <button onClick={() => setShowMobileSidebar(true)} className="text-slate-400 hover:text-white">
                    <Menu />
                </button>
                <h1 className="font-semibold">{APP_NAME}</h1>
            </div>
            <button 
                onClick={() => openUpgradeModal()}
                className="px-3 py-1 bg-legal-600 text-white text-xs font-bold rounded-full"
            >
                UPGRADE
            </button>
        </div>

        {/* View Switcher */}
        {view === 'chat' ? (
            <ChatInterface onOpenUpgrade={openUpgradeModal} />
        ) : (
            <ToolsDashboard onOpenUpgrade={openUpgradeModal} />
        )}

      </main>

      {/* Overlay for mobile sidebar */}
      {showMobileSidebar && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
        ></div>
      )}
    </div>
  );
};

const App = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;
