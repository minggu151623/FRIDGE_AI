import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          prepTime: { type: Type.STRING },
          calories: { type: Type.INTEGER },
          difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
          dietaryTags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING },
                isMissing: { type: Type.BOOLEAN, description: "True if the ingredient is likely not in the photo but needed." }
              }
            }
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["id", "title", "description", "prepTime", "calories", "difficulty", "dietaryTags", "ingredients", "steps"]
      }
    },
    detectedIngredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of ingredients detected in the image"
    }
  },
  required: ["recipes", "detectedIngredients"]
};

export async function analyzeFridgeAndGetRecipes(
  base64Image: string, 
  mimeType: string, 
  activeFilters: string[] = []
): Promise<{ recipes: Recipe[], detectedIngredients: string[] }> {
  
  const filterText = activeFilters.length > 0 
    ? `Prioritize recipes that fit these dietary restrictions: ${activeFilters.join(', ')}.` 
    : '';

  const prompt = `
    You are an expert culinary AI. 
    1. Analyze the provided image of a fridge/pantry. Identify all visible ingredients.
    2. Suggest 5 creative and distinct recipes that use these ingredients. 
    3. ${filterText}
    4. For each recipe, list missing ingredients if they are essential but not visible.
    5. Be precise with calorie counts and prep times.
    6. Ensure steps are clear, actionable, and suitable for a text-to-speech system.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using the preview model for best multimodal understanding
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: recipeSchema,
        temperature: 0.4, // Lower temperature for more structured/reliable outputs
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);
    return {
      recipes: data.recipes,
      detectedIngredients: data.detectedIngredients
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
