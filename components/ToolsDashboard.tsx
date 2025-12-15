import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { SubscriptionTier, LegalTool } from '../types';
import { Lock, FileText, Gavel, ShieldAlert, Zap } from './Icons';
import { generateLegalDocument } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { ONE_TIME_COSTS } from '../constants';

interface ToolsDashboardProps {
  onOpenUpgrade: (featureName?: string) => void;
}

const ToolsDashboard: React.FC<ToolsDashboardProps> = ({ onOpenUpgrade }) => {
  const { userState, settings, checkFeatureAccess } = useApp();
  const [activeTool, setActiveTool] = useState<LegalTool | null>(null);
  const [docDetails, setDocDetails] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Define tools
  const tools: LegalTool[] = [
    {
      id: 'fir-gen',
      name: 'FIR Generator',
      description: 'Draft a First Information Report based on incident details.',
      requiredTier: SubscriptionTier.PRO,
      iconName: 'FileText',
      action: () => {}
    },
    {
      id: 'notice-gen',
      name: 'Legal Notice Drafter',
      description: 'Create formal legal notices for breach of contract, defamation, etc.',
      requiredTier: SubscriptionTier.PRO,
      iconName: 'Gavel',
      action: () => {}
    },
    {
      id: 'scenario',
      name: 'Scenario Simulator',
      description: 'Roleplay "What if" legal scenarios with risk assessment.',
      requiredTier: SubscriptionTier.PREMIUM,
      iconName: 'ShieldAlert',
      action: () => {}
    },
    {
      id: 'judgment',
      name: 'Judgment Summarizer',
      description: 'Paste a long judgment to get a structured summary.',
      requiredTier: SubscriptionTier.PRO,
      iconName: 'FileText',
      action: () => {}
    }
  ];

  const handleToolClick = (tool: LegalTool) => {
    const hasAccess = checkFeatureAccess(tool.requiredTier, tool.name);

    if (!hasAccess) {
      onOpenUpgrade(tool.name);
    } else {
      setActiveTool(tool);
      setGeneratedContent('');
      setDocDetails('');
    }
  };

  const handleGenerate = async () => {
    if (!activeTool) return;
    setLoading(true);
    try {
        const result = await generateLegalDocument(activeTool.name, docDetails, settings);
        setGeneratedContent(result);
    } catch (e) {
        setGeneratedContent("Error generating document. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  // Render Tool Modal
  if (activeTool) {
    const isSummarizer = activeTool.name === 'Judgment Summarizer';

    return (
        <div className="h-full flex flex-col p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {activeTool.name}
                </h2>
                <button 
                    onClick={() => setActiveTool(null)}
                    className="text-slate-400 hover:text-white"
                >
                    Back to Tools
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex-1 flex flex-col">
                        <label className="text-slate-300 text-sm font-medium mb-2">
                            {isSummarizer ? 'Paste Judgment Text' : 'Enter Details (Be specific)'}
                        </label>
                        <textarea 
                            className="w-full flex-1 bg-slate-800 border-none rounded-lg p-4 text-slate-100 placeholder-slate-500 resize-none focus:ring-2 focus:ring-legal-600"
                            placeholder={isSummarizer 
                                ? "Paste the full content of the court judgment or legal order here..." 
                                : "e.g., Describe the incident for FIR, or the contract breach details..."}
                            value={docDetails}
                            onChange={(e) => setDocDetails(e.target.value)}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !docDetails}
                            className={`mt-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                                loading || !docDetails 
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                                : 'bg-legal-600 hover:bg-legal-500 text-white shadow-lg shadow-legal-900/50'
                            }`}
                        >
                            {loading ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" /> 
                                    {isSummarizer ? 'Summarize' : 'Generate'}
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 overflow-y-auto">
                    {generatedContent ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{generatedContent}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-2">
                            <FileText className="w-12 h-12 opacity-50" />
                            <p>Generated content will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  }

  // Render Grid
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Legal Tools</h2>
        <p className="text-slate-400">Specialized generators and analyzers for complex legal tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
            const hasAccess = checkFeatureAccess(tool.requiredTier, tool.name);
            const isLocked = !hasAccess;

            return (
                <div 
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className={`group relative overflow-hidden rounded-xl border p-6 transition-all cursor-pointer ${
                        isLocked 
                        ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' 
                        : 'bg-slate-800 border-slate-700 hover:border-legal-500/50 hover:shadow-lg hover:shadow-legal-900/20'
                    }`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg ${isLocked ? 'bg-slate-800 text-slate-500' : 'bg-legal-900/30 text-legal-500'}`}>
                           {tool.iconName === 'FileText' && <FileText />}
                           {tool.iconName === 'Gavel' && <Gavel />}
                           {tool.iconName === 'ShieldAlert' && <ShieldAlert />}
                        </div>
                        {isLocked && (
                            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-xs text-slate-400 border border-slate-700">
                                <Lock className="w-3 h-3" /> {tool.requiredTier}
                            </div>
                        )}
                    </div>
                    
                    <h3 className={`text-lg font-semibold mb-2 ${isLocked ? 'text-slate-500' : 'text-slate-200'}`}>
                        {tool.name}
                    </h3>
                    <p className={`text-sm ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                        {tool.description}
                    </p>

                    {/* Hover Effect */}
                    {!isLocked && (
                        <div className="absolute bottom-0 left-0 h-1 bg-legal-500 w-0 group-hover:w-full transition-all duration-300"></div>
                    )}
                    
                    {/* Pay Per Use Label */}
                    {isLocked && ONE_TIME_COSTS[tool.name] && (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                            <span className="text-xs text-legal-400">
                                Unlock once for {ONE_TIME_COSTS[tool.name]}
                            </span>
                        </div>
                    )}
                </div>
            )
        })}
      </div>
    </div>
  );
};

export default ToolsDashboard;
