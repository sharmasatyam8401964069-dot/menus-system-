
import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../types";

// Safe initialization
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export async function getChefRecommendation(menu: MenuItem[]) {
  const ai = getAIClient();
  if (!ai) return null;

  const menuStr = menu.map(item => `${item.name}: ${item.description}`).join('\n');
  
  try {
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

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function askAboutDish(dishName: string, query: string) {
  const ai = getAIClient();
  if (!ai) return "AI services are currently unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a gourmet food critic, answer this question about the dish "${dishName}": ${query}. Keep it concise and sophisticated.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The Chef is currently unavailable.";
  }
}
