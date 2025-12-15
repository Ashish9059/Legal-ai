import React from 'react';
import { PRICING_PLANS, ONE_TIME_COSTS } from '../constants';
import { useApp } from '../store/AppContext';
import { SubscriptionTier } from '../types';
import { Crown, Zap, FileText } from './Icons';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggeredFeature?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, triggeredFeature }) => {
  const { userState, upgradeTier, purchaseOneTimeFeature } = useApp();

  if (!isOpen) return null;

  const handleUpgrade = (tier: SubscriptionTier) => {
    upgradeTier(tier);
    onClose();
    alert(`Successfully upgraded to ${tier}!`);
  };
  
  const handleOneTimePurchase = (feature: string) => {
    purchaseOneTimeFeature(feature);
    onClose();
    alert(`Successfully unlocked ${feature} for single use!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Crown className="text-yellow-500" /> 
              {triggeredFeature ? `Unlock ${triggeredFeature}` : 'Upgrade Your Legal Power'}
            </h2>
            <p className="text-slate-400">
                {triggeredFeature 
                 ? "This advanced tool requires a higher tier or a one-time pass."
                 : "Choose the plan that fits your legal needs."}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">&times;</button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => {
            const isCurrent = userState.tier === plan.tier;
            const isRec = plan.recommended;

            return (
              <div 
                key={plan.tier}
                className={`relative flex flex-col rounded-xl border ${
                  isRec ? 'border-legal-500 bg-slate-800/50' : 'border-slate-700 bg-slate-800/20'
                } p-6 transition-transform hover:scale-[1.02]`}
              >
                {isRec && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-legal-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <Zap className="w-4 h-4 text-legal-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isCurrent && handleUpgrade(plan.tier)}
                  disabled={isCurrent}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCurrent
                      ? 'bg-slate-700 text-slate-400 cursor-default'
                      : isRec
                        ? 'bg-legal-600 hover:bg-legal-700 text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {isCurrent ? "Current Plan" : plan.cta}
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Pay Per Use Section */}
        {triggeredFeature && ONE_TIME_COSTS[triggeredFeature] && (
            <div className="px-6 pb-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-700 rounded-lg text-white">
                            <FileText />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Need just one document?</h3>
                            <p className="text-slate-400 text-sm">
                                Unlock <strong>{triggeredFeature}</strong> for a single use without a subscription.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-white">{ONE_TIME_COSTS[triggeredFeature]}</span>
                        <button 
                            onClick={() => handleOneTimePurchase(triggeredFeature)}
                            className="px-6 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            Pay Once
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        <div className="p-6 bg-slate-800/30 text-center text-xs text-slate-500 mt-auto rounded-b-2xl">
          Secure payment processing • Cancel anytime • 7-day money-back guarantee for Pro
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
