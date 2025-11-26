import React, { useState } from 'react';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';

interface ShoppingListProps {
  onStart: (items: string[]) => void;
}

const COMMON_ITEMS = ["Milk", "Eggs", "Bread", "Bananas", "Coffee", "Cheese", "Pasta", "Apples"];

const ShoppingList: React.FC<ShoppingListProps> = ({ onStart }) => {
  const [items, setItems] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addItem = (name: string) => {
    if (name.trim() && !items.includes(name.trim())) {
      setItems([...items, name.trim()]);
      setInputValue('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem(inputValue);
    }
  };

  return (
    <div className="w-full max-w-lg bg-gray-900/90 backdrop-blur border-2 border-blue-500/50 rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="text-center mb-6">
        <div className="inline-block p-3 bg-blue-900/30 rounded-full mb-2">
          <ShoppingCart size={32} className="text-yellow-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Create Your List</h2>
        <p className="text-gray-400 text-sm">These items will be hidden in the store aisles.</p>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add item (e.g. Milk)..."
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
        />
        <button
          onClick={() => addItem(inputValue)}
          className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Quick Add Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {COMMON_ITEMS.map((item) => (
          <button
            key={item}
            onClick={() => addItem(item)}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-300 border border-blue-900/50 px-3 py-1.5 rounded-full transition-colors"
          >
            + {item}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-black/40 rounded-lg min-h-[150px] max-h-[250px] overflow-y-auto p-2 mb-6 border border-gray-800">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 italic">
            <p>Your list is empty.</p>
            <p className="text-xs">Add items to populate the map!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-800/50 px-3 py-2 rounded border border-gray-700">
                <span className="text-white font-mono">{item}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => onStart(items.length > 0 ? items : ['Mystery Item', 'Bonus Points', 'Surprise'])}
        className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg py-4 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-transform active:scale-95"
      >
        GO TO STORE
      </button>
    </div>
  );
};

export default ShoppingList;