import React, { useState, useEffect } from 'react';
import { Recipe, Ingredient } from '../types';
import { Icons } from './Icon';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
  onAddToShoppingList: (items: Ingredient[]) => void;
  rating: number;
  onRate: (rating: number) => void;
}

const CookingMode: React.FC<CookingModeProps> = ({ 
  recipe, 
  onClose, 
  onAddToShoppingList, 
  rating, 
  onRate 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Stop any existing speech when mounting/unmounting
    window.speechSynthesis.cancel();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    // When step changes, if auto-play was on or just to prep, configure utterance
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    
    // Optional: Auto-read could be enabled here if desired
    // For now, we reset.
  }, [currentStep]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const newUtterance = new SpeechSynthesisUtterance(text);
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices[0];
    if (preferredVoice) newUtterance.voice = preferredVoice;
    
    newUtterance.rate = 0.9; // Slightly slower for clarity
    newUtterance.pitch = 1;
    
    newUtterance.onend = () => setIsPlaying(false);
    
    setUtterance(newUtterance);
    window.speechSynthesis.speak(newUtterance);
    setIsPlaying(true);
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const stepText = currentStep === -1 
        ? `Ingredients for ${recipe.title}. ${recipe.ingredients.map(i => `${i.amount || ''} ${i.name}`).join(', ')}`
        : `Step ${currentStep + 1}. ${recipe.steps[currentStep]}`;
      speak(stepText);
    }
  };

  const handleNext = () => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > -1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const missingIngredients = recipe.ingredients.filter(i => i.isMissing);

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shrink-0">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <Icons.ArrowLeft size={24} />
        </button>
        <div className="text-center flex-1 mx-2 overflow-hidden">
          <h2 className="font-bold text-gray-800 truncate">
            {recipe.title}
          </h2>
          <span className="text-xs text-gray-500">
            {currentStep === -1 ? 'Prep' : `Step ${currentStep + 1} of ${recipe.steps.length}`}
          </span>
        </div>
        
        {/* Rating System */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onClick={() => onRate(star)}
              className="p-1"
            >
              <Icons.Star 
                size={18} 
                className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
              />
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-chef-50">
        
        {currentStep === -1 ? (
          /* Ingredients View */
          <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Ingredients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${ing.isMissing ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
                   <span className="text-lg font-medium text-gray-700">
                     {ing.amount} {ing.name}
                   </span>
                   {ing.isMissing && <Icons.AlertCircle className="text-orange-500" size={20} />}
                </div>
              ))}
            </div>
            {missingIngredients.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => {
                    onAddToShoppingList(missingIngredients);
                    alert("Added to Shopping List!");
                  }}
                  className="w-full py-4 bg-orange-100 text-orange-700 font-bold rounded-xl hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Icons.ShoppingCart size={20} />
                  Add Missing Items to List
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Step View */
          <div className="w-full max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-full bg-chef-100 text-chef-600 text-2xl font-bold">
              {currentStep + 1}
            </div>
            <p className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight mb-12">
              {recipe.steps[currentStep]}
            </p>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="bg-white border-t border-gray-200 p-6 flex items-center justify-between shrink-0">
        <button 
          onClick={handlePrev}
          disabled={currentStep === -1}
          className="p-4 rounded-full bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        >
          <Icons.ChevronLeft size={32} />
        </button>

        <button 
          onClick={toggleSpeech}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95
            ${isPlaying ? 'bg-red-500 text-white' : 'bg-chef-500 text-white'}
          `}
        >
          {isPlaying ? <Icons.Pause size={32} fill="currentColor" /> : <Icons.Mic size={32} />}
        </button>

        <button 
          onClick={handleNext}
          disabled={currentStep === recipe.steps.length - 1}
          className="p-4 rounded-full bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
        >
          <Icons.ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default CookingMode;