import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { AppSettings, Message } from "../types";

// Initialize the API
// NOTE: In a real production app, we would proxy this through a backend to hide the key.
// For this architecture, we use the env variable directly as per instructions.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateLegalResponse = async (
  history: Message[],
  currentMessage: string,
  settings: AppSettings,
  isPremium: boolean
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure the environment.");
  }

  // Choose model based on complexity/tier
  // Gemini 2.5 Flash is excellent for speed and general reasoning.
  // Gemini 3 Pro (if available) would be used for Premium deep analysis, but Flash is safer default.
  const modelName = isPremium ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';

  const languageInstruction = `Respond in ${settings.language}.`;
  const complexityInstruction = settings.complexity === 'Simple' 
    ? "Explain in simple layman terms without heavy jargon." 
    : "Provide detailed legal reasoning, citing specific case laws and section nuances.";

  const finalSystemInstruction = `${SYSTEM_INSTRUCTION}\n${languageInstruction}\n${complexityInstruction}`;

  try {
    const chat = ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.3, // Low temperature for factual legal accuracy
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
            }
        ]
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))
    });

    const result = await chat.sendMessage({ message: currentMessage });
    return result.text || "I could not generate a response. Please try rephrasing.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Legal Assistant is temporarily unavailable. Please try again.");
  }
};

export const generateLegalDocument = async (
  docType: string,
  details: string,
  settings: AppSettings
): Promise<string> => {
    if (!apiKey) {
        throw new Error("API Key missing");
    }

    let prompt = "";
    let systemInstruction = "You are a legal assistant.";

    switch (docType) {
        case 'Judgment Summarizer':
            systemInstruction = "You are an expert legal summarizer for Indian Case Law.";
            prompt = `Analyze and summarize the following Indian Court Judgment text. 
            
            Input Text:
            "${details}"

            Requirements:
            1. Output in Markdown format.
            2. Language: ${settings.language}.
            3. Structure: 
               - **Case Title & Citation**: (Extract if available, otherwise N/A)
               - **Court**: (Supreme Court / High Court, etc.)
               - **Facts of the Case**: Brief chronological summary.
               - **Issues Involved**: Legal questions raised.
               - **Arguments**: Petitioner vs Respondent arguments.
               - **Judgment/Held**: The final verdict and reasoning.
               - **Key Statutes Cited**: List sections/acts.
            `;
            break;
            
        case 'Scenario Simulator':
            systemInstruction = "You are a legal risk analyst.";
            prompt = `Analyze the following legal scenario under Indian Law:
            
            Scenario:
            "${details}"

            Provide a detailed analysis including:
            1. Potential Offences (IPC/Other Acts).
            2. Likely Legal Consequences (Punishment/Fine).
            3. Legal Risk Score (1-10) with reasoning.
            4. Recommended Course of Action.
            5. Relevant Case Laws.
            
            Language: ${settings.language}.
            `;
            break;

        default: // Default drafting (FIR, Notices, etc.)
            systemInstruction = "You are a professional legal drafter.";
            prompt = `Draft a professional legal ${docType} for the Indian Legal System based on these details:
            "${details}"
            
            Format: standard legal document format.
            Language: ${settings.language}.
            Include placeholders like [Date], [Signature] where necessary.
            Output ONLY the document content in Markdown.`;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction
            }
        });
        return response.text || "Failed to generate document.";
    } catch (e) {
        console.error(e);
        throw new Error("Document generation failed.");
    }
}
