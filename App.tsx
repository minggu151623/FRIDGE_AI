import React, { useState, useEffect } from 'react';
import { AppView, Recipe, ShoppingItem, DietaryFilter, Ingredient } from './types';
import CameraCapture from './components/CameraCapture';
import RecipeList from './components/RecipeList';
import CookingMode from './components/CookingMode';
import ShoppingListView from './components/ShoppingListView';
import { Icons } from './components/Icon';
import { analyzeFridgeAndGetRecipes } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shoppingList');
    return saved ? JSON.parse(saved) : [];
  });
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('recipeRatings');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [activeFilters, setActiveFilters] = useState<DietaryFilter[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Persist shopping list
  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Persist ratings
  useEffect(() => {
    localStorage.setItem('recipeRatings', JSON.stringify(ratings));
  }, [ratings]);

  const handleImageCapture = async (base64: string, mimeType: string) => {
    setIsLoading(true);
    setCurrentView(AppView.HOME); // Show loading state on home
    try {
      const result = await analyzeFridgeAndGetRecipes(base64, mimeType, activeFilters);
      setRecipes(result.recipes);
      setDetectedIngredients(result.detectedIngredients);
      setCurrentView(AppView.RECIPES);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToShoppingList = (ingredients: Ingredient[]) => {
    const newItems: ShoppingItem[] = ingredients.map(ing => ({
      id: Math.random().toString(36).substr(2, 9),
      name: `${ing.amount || ''} ${ing.name}`.trim(),
      recipeTitle: activeRecipe?.title,
      checked: false
    }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearCompletedShoppingItems = () => {
    setShoppingList(prev => prev.filter(item => !item.checked));
  };

  const handleRateRecipe = (rating: number) => {
    if (activeRecipe) {
      setRatings(prev => ({ ...prev, [activeRecipe.title]: rating }));
    }
  };

  // --- Render Logic ---

  if (currentView === AppView.CAMERA) {
    return (
      <CameraCapture 
        onCapture={handleImageCapture} 
        onCancel={() => setCurrentView(AppView.HOME)} 
      />
    );
  }

  if (activeRecipe) {
    return (
      <CookingMode 
        recipe={activeRecipe} 
        onClose={() => setActiveRecipe(null)}
        onAddToShoppingList={handleAddToShoppingList}
        rating={ratings[activeRecipe.title] || 0}
        onRate={handleRateRecipe}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Main Layout Content */}
      <main className="flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 border-4 border-chef-200 border-t-chef-600 rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Analyzing your fridge...</h2>
            <p className="text-gray-500 max-w-xs">Our AI chef is identifying ingredients and brainstorming recipes.</p>
          </div>
        )}

        {currentView === AppView.HOME && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-chef-50 to-white">
            <div className="bg-white p-4 rounded-3xl shadow-xl mb-8 transform -rotate-3">
              <Icons.ChefHat size={64} className="text-chef-500" />
            </div>
            <h1 className="text-4xl font-extrabold text-center mb-4 text-gray-900">
              Fridge<span className="text-chef-500">Chef</span> AI
            </h1>
            <p className="text-center text-gray-500 mb-12 max-w-sm">
              Don't know what to cook? Snap a photo of your fridge and let AI decide.
            </p>
            
            <button 
              onClick={() => setCurrentView(AppView.CAMERA)}
              className="w-full max-w-xs bg-chef-600 hover:bg-chef-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-chef-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Icons.Camera size={24} />
              Scan Fridge
            </button>
            
            {recipes.length > 0 && (
              <button 
                onClick={() => setCurrentView(AppView.RECIPES)}
                className="mt-4 text-gray-500 hover:text-chef-600 font-medium text-sm"
              >
                Back to Last Results
              </button>
            )}
          </div>
        )}

        {currentView === AppView.RECIPES && (
          <RecipeList 
            recipes={recipes} 
            detectedIngredients={detectedIngredients}
            activeFilters={activeFilters}
            onToggleFilter={(f) => setActiveFilters(prev => 
              prev.includes(f) ? prev.filter(i => i !== f) : [...prev, f]
            )}
            onSelectRecipe={setActiveRecipe}
            ratings={ratings}
          />
        )}

        {currentView === AppView.SHOPPING && (
          <ShoppingListView 
            items={shoppingList}
            onToggleItem={toggleShoppingItem}
            onRemoveItem={removeShoppingItem}
            onClearCompleted={clearCompletedShoppingItems}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      {(currentView === AppView.RECIPES || currentView === AppView.SHOPPING) && (
        <nav className="bg-white border-t border-gray-200 h-20 flex justify-around items-center px-6 shrink-0 z-30">
          <button 
            onClick={() => setCurrentView(AppView.HOME)}
            className={`flex flex-col items-center gap-1 ${currentView === AppView.HOME ? 'text-chef-600' : 'text-gray-400'}`}
          >
            <Icons.ChefHat size={24} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setCurrentView(AppView.CAMERA)}
            className="flex flex-col items-center justify-center w-14 h-14 bg-chef-600 text-white rounded-full shadow-lg shadow-chef-500/40 -mt-8 hover:bg-chef-700 transition-colors"
          >
            <Icons.Camera size={24} />
          </button>

          <button 
            onClick={() => setCurrentView(AppView.RECIPES)}
            className={`flex flex-col items-center gap-1 ${currentView === AppView.RECIPES ? 'text-chef-600' : 'text-gray-400'}`}
          >
            <Icons.Flame size={24} />
            <span className="text-[10px] font-medium">Recipes</span>
          </button>

          <button 
            onClick={() => setCurrentView(AppView.SHOPPING)}
            className={`flex flex-col items-center gap-1 ${currentView === AppView.SHOPPING ? 'text-chef-600' : 'text-gray-400'} relative`}
          >
            <div className="relative">
              <Icons.ShoppingCart size={24} />
              {shoppingList.filter(i => !i.checked).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                  {shoppingList.filter(i => !i.checked).length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">List</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;