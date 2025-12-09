export interface Ingredient {
  name: string;
  amount?: string;
  isMissing?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  calories: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dietaryTags: string[];
  ingredients: Ingredient[];
  steps: string[];
  imagePrompt?: string; // For potential future image generation
}

export interface ShoppingItem {
  id: string;
  name: string;
  recipeTitle?: string;
  checked: boolean;
}

export enum AppView {
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  RECIPES = 'RECIPES',
  COOKING = 'COOKING',
  SHOPPING = 'SHOPPING',
}

export type DietaryFilter = 'Vegetarian' | 'Vegan' | 'Keto' | 'Gluten-Free' | 'Dairy-Free' | 'Paleo';
