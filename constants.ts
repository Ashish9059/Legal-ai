import { SubscriptionTier } from './types';

export const APP_NAME = "Nyaya Sahayak";

export const ONE_TIME_COSTS: Record<string, string> = {
  'FIR Generator': '₹199',
  'Legal Notice Drafter': '₹299',
  'Judgment Summarizer': '₹99',
  'Scenario Simulator': '₹499'
};

export const TIER_LIMITS = {
  [SubscriptionTier.FREE]: {
    dailyQueries: 5,
    canGenerateDocs: false,
    canAnalyzeCases: false,
    canSimulateScenarios: false,
    supportPriority: 'Standard',
    maxHistory: 3,
    allowedComplexity: ['Simple']
  },
  [SubscriptionTier.PRO]: {
    dailyQueries: 100, // Effectively unlimited for normal use
    canGenerateDocs: true,
    canAnalyzeCases: true,
    canSimulateScenarios: false,
    supportPriority: 'Priority',
    maxHistory: 50,
    allowedComplexity: ['Simple', 'Legal']
  },
  [SubscriptionTier.PREMIUM]: {
    dailyQueries: 9999,
    canGenerateDocs: true,
    canAnalyzeCases: true,
    canSimulateScenarios: true,
    supportPriority: 'Dedicated',
    maxHistory: 9999,
    allowedComplexity: ['Simple', 'Legal']
  }
};

export const PRICING_PLANS = [
  {
    tier: SubscriptionTier.FREE,
    name: "Citizen Basic",
    price: "₹0",
    period: "/forever",
    features: [
      "5 AI Legal Queries / Day",
      "Basic IPC/CrPC Explanations",
      "Case Status Links",
      "Ad-supported"
    ],
    cta: "Current Plan",
    recommended: false
  },
  {
    tier: SubscriptionTier.PRO,
    name: "Advocate Pro",
    price: "₹499",
    period: "/month",
    features: [
      "Unlimited Queries",
      "FIR & Legal Notice Generator",
      "Judgment Summarizer",
      "Case Law Citations",
      "Drafting Assistant"
    ],
    cta: "Upgrade to Pro",
    recommended: true
  },
  {
    tier: SubscriptionTier.PREMIUM,
    name: "Law Firm Elite",
    price: "₹1,999",
    period: "/month",
    features: [
      "Everything in Pro",
      "Scenario Simulator (Risk Analysis)",
      "Timeline Visualization",
      "AI Cross-Questioning Mode",
      "Priority Support"
    ],
    cta: "Go Premium",
    recommended: false
  }
];

export const SYSTEM_INSTRUCTION = `You are Nyaya Sahayak, an expert AI Legal Assistant for Indian Law. 
Your goal is to assist users with the Indian Penal Code (IPC), Code of Criminal Procedure (CrPC), Civil Procedure Code (CPC), and the Constitution of India.

CRITICAL RULES:
1. DISCLAIMER: Always start advice on sensitive matters with a brief disclaimer: "I am an AI, not a lawyer. Consult a professional."
2. TONE: Professional, objective, and empathetic.
3. JURISDICTION: STRICTLY Indian Law. If asked about US/UK law, politely decline and refocus on India.
4. FORMATTING: Use Markdown. Use bold for Section numbers (e.g., **Section 302 IPC**).
5. STRUCTURE:
   - Brief Summary (Simple English/Hindi as requested).
   - Relevant Sections & Acts.
   - Punishment/Penalties (if applicable).
   - Next Legal Steps (Procedural advice).
`;
