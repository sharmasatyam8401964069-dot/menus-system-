
import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../types.ts";

export async function getChefRecommendation(menu: MenuItem[]) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const menuStr = menu.map(item => `${item.name}: ${item.description} - ₹${item.price}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a world-class executive chef at a high-end healthy fusion restaurant. 
      Based on the following menu items, suggest a "Special of the Day" that complements these flavors. 
      The special should be unique, healthy, and appetizing.\n\nMenu:\n${menuStr}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            specialName: { type: Type.STRING },
            specialDescription: { type: Type.STRING },
            specialPrice: { type: Type.NUMBER },
            chefsChoiceName: { type: Type.STRING },
            chefsChoiceReason: { type: Type.STRING },
          },
          required: ["specialName", "specialDescription", "specialPrice", "chefsChoiceName", "chefsChoiceReason"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function askAboutDish(dishName: string, query: string) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "AI services are currently unavailable.";

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a gourmet food critic, answer this question about the dish "${dishName}": ${query}. Keep it concise, sophisticated, and helpful for a diner.`,
    });
    return response.text || "The chef is pondering your question.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The Chef is currently busy in the kitchen.";
  }
}
