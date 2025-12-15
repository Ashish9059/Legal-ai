import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { generateLegalResponse } from '../services/geminiService';
import { Send, Scale, Zap } from './Icons';
import ReactMarkdown from 'react-markdown';
import { TIER_LIMITS } from '../constants';

interface ChatInterfaceProps {
    onOpenUpgrade: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onOpenUpgrade }) => {
  const { currentSession, addMessageToSession, userState, incrementQueryCount, settings, isLoading: contextLoading } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const limits = TIER_LIMITS[userState.tier];
  const isLimitReached = userState.dailyQueriesUsed >= limits.dailyQueries;

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession.messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    // Check Limits
    if (!incrementQueryCount()) {
        onOpenUpgrade();
        return;
    }

    const userMsg = {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content: input,
        timestamp: Date.now()
    };
    
    addMessageToSession(userMsg);
    setInput('');
    setIsTyping(true);

    try {
        const isPremium = userState.tier === 'PREMIUM';
        const responseText = await generateLegalResponse(
            currentSession.messages, 
            input, 
            settings,
            isPremium
        );

        const botMsg = {
            id: crypto.randomUUID(),
            role: 'model' as const,
            content: responseText,
            timestamp: Date.now()
        };
        addMessageToSession(botMsg);

    } catch (error) {
        addMessageToSession({
            id: crypto.randomUUID(),
            role: 'model',
            content: "I encountered a temporary error connecting to the legal database. Please try again.",
            timestamp: Date.now(),
            isError: true
        });
    } finally {
        setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-24"
      >
        {currentSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-80 mt-10">
                <div className="bg-slate-900 p-4 rounded-full mb-4 ring-1 ring-slate-800">
                    <Scale className="w-12 h-12 text-legal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">Nyaya Sahayak</h3>
                <p className="max-w-md text-center text-sm mb-6">
                    Ask about IPC sections, draft legal notices, or analyze case scenarios.
                    <br/><span className="text-xs text-slate-600 mt-2 block">Powered by Gemini AI • Indian Law Context</span>
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    <button onClick={() => setInput("What is the punishment for Section 420 IPC?")} className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-sm text-left transition">
                        What is the punishment for Section 420 IPC?
                    </button>
                    <button onClick={() => setInput("Draft a bail application for a bailable offense.")} className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 text-sm text-left transition">
                        Draft a bail application snippet
                    </button>
                </div>
            </div>
        ) : (
            currentSession.messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div 
                        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 ${
                            msg.role === 'user' 
                                ? 'bg-legal-700 text-white rounded-tr-none' 
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                        } ${msg.isError ? 'border-red-500/50 bg-red-900/10' : ''}`}
                    >
                        {msg.role === 'model' ? (
                            <div className="prose prose-invert prose-sm leading-relaxed">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                    </div>
                </div>
            ))
        )}
        
        {isTyping && (
             <div className="flex justify-start">
                 <div className="bg-slate-800 rounded-2xl rounded-tl-none px-5 py-4 border border-slate-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-legal-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-legal-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-legal-500 rounded-full animate-bounce delay-150"></div>
                 </div>
             </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        <div className="max-w-4xl mx-auto relative group">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLimitReached}
                placeholder={isLimitReached ? `Daily limit reached (${limits.dailyQueries}/${limits.dailyQueries}). Upgrade to continue.` : "Ask a legal question..."}
                className={`w-full bg-slate-900/90 backdrop-blur-md text-slate-100 rounded-2xl border border-slate-700 pl-4 pr-12 py-4 resize-none shadow-2xl focus:outline-none focus:ring-2 focus:ring-legal-600/50 disabled:opacity-50 disabled:cursor-not-allowed h-[60px] max-h-[120px]`}
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping || isLimitReached}
                className="absolute right-2 top-2 p-2.5 bg-legal-600 text-white rounded-xl hover:bg-legal-500 disabled:bg-slate-700 disabled:text-slate-500 transition-all shadow-lg shadow-legal-900/20"
            >
                <Send className="w-5 h-5" />
            </button>
            
            <div className="absolute -top-8 left-0 text-xs text-slate-500 flex gap-4 w-full justify-between px-2">
                <span>
                    Daily Usage: <span className={isLimitReached ? 'text-red-500 font-bold' : 'text-legal-400'}>{userState.dailyQueriesUsed}</span> / {limits.dailyQueries}
                </span>
                <span className="flex items-center gap-1">
                    {userState.tier} Plan 
                    {userState.tier === 'FREE' && (
                        <button onClick={onOpenUpgrade} className="text-legal-400 hover:text-legal-300 underline ml-1">Upgrade</button>
                    )}
                </span>
            </div>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-2">
            Nyaya Sahayak is an AI tool. Not a substitute for professional legal counsel.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
