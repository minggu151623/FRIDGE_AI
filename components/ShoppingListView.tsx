import React from 'react';
import { ShoppingItem } from '../types';
import { Icons } from './Icon';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCompleted: () => void;
}

const ShoppingListView: React.FC<ShoppingListViewProps> = ({ 
  items, 
  onToggleItem, 
  onRemoveItem,
  onClearCompleted
}) => {
  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
          {items.some(i => i.checked) && (
            <button 
              onClick={onClearCompleted}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Clear Completed
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Icons.ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Your list is empty.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div 
                key={item.id}
                className={`
                  flex items-center p-4 bg-white rounded-xl shadow-sm border transition-all
                  ${item.checked ? 'border-gray-100 opacity-60' : 'border-gray-200'}
                `}
              >
                <button 
                  onClick={() => onToggleItem(item.id)}
                  className={`
                    w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors
                    ${item.checked ? 'bg-chef-500 border-chef-500' : 'border-gray-300 hover:border-chef-400'}
                  `}
                >
                  {item.checked && <Icons.Check size={14} className="text-white" />}
                </button>
                
                <div className="flex-1">
                  <span className={`text-lg ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {item.name}
                  </span>
                  {item.recipeTitle && (
                    <p className="text-xs text-gray-400">for {item.recipeTitle}</p>
                  )}
                </div>

                <button 
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Icons.Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingListView;
