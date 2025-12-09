import React, { useMemo } from 'react';
import { Recipe, DietaryFilter } from '../types';
import { Icons } from './Icon';

interface RecipeListProps {
  recipes: Recipe[];
  detectedIngredients: string[];
  activeFilters: DietaryFilter[];
  onToggleFilter: (filter: DietaryFilter) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

const AVAILABLE_FILTERS: DietaryFilter[] = [
  'Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'Dairy-Free', 'Paleo'
];

const RecipeList: React.FC<RecipeListProps> = ({ 
  recipes, 
  detectedIngredients, 
  activeFilters, 
  onToggleFilter,
  onSelectRecipe 
}) => {
  
  // Note: Filtering logic could be server-side or client-side. 
  // Since we asked the AI to prioritize, client-side is mostly for refinement.
  const filteredRecipes = useMemo(() => {
    if (activeFilters.length === 0) return recipes;
    return recipes.filter(recipe => 
      activeFilters.every(filter => recipe.dietaryTags.includes(filter))
    );
  }, [recipes, activeFilters]);

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-gray-50">
      {/* Sidebar Filters */}
      <div className="md:w-64 bg-white border-r border-gray-200 p-4 flex flex-col shrink-0 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
           <Icons.Leaf size={20} className="text-chef-500" />
           Dietary Prefs
        </h2>
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
          {AVAILABLE_FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => onToggleFilter(filter)}
              className={`
                px-4 py-2 rounded-full md:rounded-lg text-sm font-medium transition-all whitespace-nowrap text-left flex items-center justify-between
                ${activeFilters.includes(filter) 
                  ? 'bg-chef-100 text-chef-700 ring-1 ring-chef-500' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {filter}
              {activeFilters.includes(filter) && <Icons.Check size={16} />}
            </button>
          ))}
        </div>
        
        <div className="mt-6 hidden md:block">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Detected Items
          </h3>
          <div className="flex flex-wrap gap-2">
            {detectedIngredients.map((ing, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {ing}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Suggestions for You</h1>
          <p className="text-gray-500 mb-6">Based on {detectedIngredients.length} ingredients found in your fridge.</p>
          
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Icons.ChefHat size={48} className="mx-auto mb-4 opacity-50" />
              <p>No recipes match your current filters.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredRecipes.map(recipe => (
                <div 
                  key={recipe.id}
                  onClick={() => onSelectRecipe(recipe)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 overflow-hidden flex flex-col"
                >
                  <div className="h-32 bg-gradient-to-r from-chef-500 to-emerald-400 relative">
                     <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black/60 to-transparent">
                       <h3 className="text-white font-bold text-xl truncate">{recipe.title}</h3>
                     </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Icons.Clock size={16} />
                        {recipe.prepTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Icons.Flame size={16} />
                        {recipe.calories} kcal
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {recipe.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.dietaryTags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className={`
                        text-xs font-semibold px-2 py-1 rounded
                        ${recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                          recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-red-100 text-red-700'}
                      `}>
                        {recipe.difficulty}
                      </span>
                      {recipe.ingredients.some(i => i.isMissing) && (
                        <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                          <Icons.AlertCircle size={12} />
                          Missing Items
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeList;
