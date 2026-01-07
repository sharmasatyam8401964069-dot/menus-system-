import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getChefRecommendation(menu: MenuItem[]) {
  const menuStr = menu.map(item => `${item.name}: ${item.description}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a world-class executive chef. Based on the following menu items, suggest a "Special of the Day" that isn't on the menu but complements these flavors. Also, pick one item from the menu as your "Chef's Choice" and explain why in a poetic, mouth-watering way.\n\nMenu:\n${menuStr}`,
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

  // Fix: Safe fallback for response.text before parsing
  const text = response.text || '{}';
  return JSON.parse(text);
}

export async function askAboutDish(dishName: string, query: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a gourmet food critic, answer this question about the dish "${dishName}": ${query}. Keep it concise and sophisticated.`,
  });
  // Fix: Return empty string if response.text is undefined
  return response.text || "";
}
