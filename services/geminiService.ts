import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { SingularityResponse } from "../types";

// Initialize Gemini client
// Note: In a production environment, ensure API_KEY is secure.
// The prompt instructions adhere to the "senior engineer" persona strict guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SINGULARITY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    mainThesis: {
      type: Type.STRING,
      description: "A compelling, one-sentence summary of the most critical event (the singularity).",
    },
    theories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          icon: { type: Type.STRING, enum: ["brain", "fire", "message", "tool"] },
          shortDescription: { type: Type.STRING },
          fullAnalysis: { type: Type.STRING },
          credibilityScore: { type: Type.NUMBER },
        },
        required: ["title", "icon", "shortDescription", "fullAnalysis", "credibilityScore"],
      },
    },
    timeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.STRING, description: "Numeric year for sorting roughly, e.g., -500000" },
          yearLabel: { type: Type.STRING, description: "Display label, e.g., '50万年前'" },
          event: { type: Type.STRING },
          impactLevel: { type: Type.NUMBER, description: "0 to 100 score of human dominance" },
          description: { type: Type.STRING },
        },
        required: ["year", "yearLabel", "event", "impactLevel", "description"],
      },
    },
    conclusion: {
      type: Type.STRING,
      description: "A philosophical reflection on how this singularity leads to both domination and potential destruction.",
    },
  },
  required: ["mainThesis", "theories", "timeline", "conclusion"],
};

export const fetchEvolutionAnalysis = async (userPrompt: string): Promise<SingularityResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert evolutionary anthropologist and philosopher.
              Analyze the user's question about human evolution.
              The user is asking about the "Singularity" event—the single most critical turning point that separated humans from apes and led to planetary dominance.
              
              Common candidates include:
              1. The Cognitive Revolution (Language/Fictions) - Harari's theory.
              2. Control of Fire (Cooking/Brain growth).
              3. Tool Use.
              
              Provide a structured JSON response in CHINESE (Simplified).
              
              User Question: ${userPrompt}`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: SINGULARITY_SCHEMA,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as SingularityResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const streamChatResponse = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
    // Helper for follow-up chat, returning a stream
    // Note: This uses a simpler text model for conversational follow-ups
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
             systemInstruction: "You are an expert on human evolution. Answer concisely and deeply in Chinese."
        }
    });
    
    return chat.sendMessageStream({ message: newMessage });
};
